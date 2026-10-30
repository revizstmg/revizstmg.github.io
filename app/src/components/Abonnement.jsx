import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { useLang, usePublicText } from '../i18n.js'
import { getSession } from '../auth.js'
import { memoriserAbonnement } from '../data/acces.js'
import { creerMonCompte } from './CompteRequis.jsx'
import { OFFRES, PERIODES, estActif, lireEtatPaiement, demarrerPaiement, ouvrirPortail, prixAffiche } from '../data/abonnement.js'

// Abonnements payants. Tant que la fonction serveur n'est pas en place, rien
// n'est proposé : la page dit simplement que les paiements ne sont pas ouverts.
export default function Abonnement() {
  const { state } = useStore()
  return <AbonnementCompte key={state.account?.id || 'trial'} />
}
function AbonnementCompte() {
  const { state } = useStore()
  const tr = usePublicText()
  const lang = useLang()
  const [params] = useSearchParams()
  const [etat, setEtat] = useState(null) // null : chargement
  const [majeur, setMajeur] = useState(false)
  const [occupe, setOccupe] = useState(false)
  const [erreur, setErreur] = useState('')
  const active = useRef(false)
  const [retry, setRetry] = useState(0)
  useEffect(() => { active.current = true; return () => { active.current = false } }, [])
  const owner = state.account?.id
  const belongs = () => active.current && owner && getSession()?.user?.id === owner
  const connecte = !!owner
  const retour = params.get('paiement')

  useEffect(() => {
    if (!connecte) return
    let vivant = true
    let essais = 0, next
    const charger = async () => {
      try {
        const e = await lireEtatPaiement()
        if (!vivant || !belongs()) return
        setEtat(e)
        memoriserAbonnement(e.abonnement)
        // Au retour de Stripe, l'abonnement arrive par le webhook : on patiente un peu.
        if (retour === 'ok' && !estActif(e.abonnement) && essais++ < 6) next = setTimeout(charger, 2500)
      } catch (e) {
        if (vivant && belongs()) setEtat({ indisponible: true, code: e.message })
      }
    }
    charger()
    return () => { vivant = false; clearTimeout(next) }
  }, [connecte, retour, retry])

  const messageErreur = (code) => ({
    majeur_requis: 'Coche la case pour confirmer ton âge ou l’accord de ton représentant légal.',
    deja_abonne: 'Tu as déjà un abonnement actif.',
    login_required: 'Connecte-toi pour t’abonner.',
    network: 'Connexion impossible. Réessaie dans un instant.',
  })[code] || 'Le paiement n’a pas pu démarrer. Réessaie plus tard.'

  const payer = async (offre, periode) => {
    if (!belongs()) return
    setErreur(''); setOccupe(true)
    try {
      const { url } = await demarrerPaiement(offre, periode, majeur)
      if (belongs()) window.location.assign(url)
    } catch (e) { if (belongs()) { setErreur(messageErreur(e.message)); setOccupe(false) } }
  }
  const gerer = async () => {
    if (!belongs()) return
    setErreur(''); setOccupe(true)
    try { const { url } = await ouvrirPortail(); if (belongs()) window.location.assign(url) }
    catch (e) { if (belongs()) { setErreur(messageErreur(e.message)); setOccupe(false) } }
  }

  if (!connecte) return <section className="card p-5" aria-labelledby="abo-titre"><h2 id="abo-titre" className="font-display text-xl font-semibold">{tr('S’abonner')}</h2><p className="mt-2 text-sm">{tr('Connecte-toi avec ton compte pour choisir une offre.')}</p><p className="mt-3"><button type="button" className="btn-primary" onClick={creerMonCompte}>{tr('Créer mon compte')}</button></p></section>
  if (!etat) return <section className="card p-5" aria-busy="true"><p className="text-sm">{tr('Chargement des offres…')}</p></section>
  if (etat.indisponible) return <section className="card p-5"><h2 className="font-display text-xl font-semibold">{tr('S’abonner')}</h2><p className="mt-2 text-sm">{tr(etat.code === 'network' ? messageErreur('network') : 'Les paiements ne sont pas encore ouverts. Rien ne sera débité tant que cette page ne propose pas de choisir une offre.')}</p><button type="button" className="btn-primary mt-3" onClick={() => { setEtat(null); setRetry(n => n + 1) }}>{tr('Réessayer')}</button></section>

  const ab = etat.abonnement
  const actif = estActif(ab)
  const fin = ab?.periode_fin ? new Date(ab.periode_fin).toLocaleDateString(lang, { calendar: 'gregory', numberingSystem: 'latn', day: 'numeric', month: 'long', year: 'numeric' }) : ''
  return (
    <section className="card space-y-4 p-5" aria-labelledby="abo-titre">
      <h2 id="abo-titre" className="font-display text-xl font-semibold">{tr('S’abonner')}</h2>
      {etat.mode === 'test' && <p role="status" className="rounded-xl border border-amber-700/40 p-3 text-sm"><b>{tr('Mode test.')}</b> {tr('Aucune vraie carte n’est débitée. Utilise la carte de test 4242 4242 4242 4242, une date future et un code à trois chiffres.')}</p>}
      {retour === 'ok' && <p role="status" className="text-sm font-semibold">{actif ? tr('Merci ! Ton abonnement est actif.') : tr('Merci ! Ton paiement est en cours de confirmation…')}</p>}
      {retour === 'annule' && <p role="status" className="text-sm">{tr('Paiement annulé : rien n’a été débité.')}</p>}
      {actif ? (
        <div className="space-y-2 text-sm">
          <p><b>{tr('Offre active')}</b> : {OFFRES[ab.offre]?.nom} ({tr(ab.periode === 'annuel' ? 'annuel' : 'mensuel')})</p>
          <p>{ab.annulation_prevue ? tr('Fin de l’abonnement le {date}.', { date: fin }) : tr('Prochain renouvellement le {date}.', { date: fin })}</p>
          <button type="button" className="btn-primary" disabled={occupe} onClick={gerer}>{tr('Gérer mon abonnement')}</button>
        </div>
      ) : (
        <>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={majeur} onChange={(e) => setMajeur(e.target.checked)} />
            <span>{tr('J’ai 18 ans ou l’accord de mon représentant légal pour souscrire cet abonnement.')}</span>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(OFFRES).map(([id, o]) => (
              <article key={id} className="rounded-xl border border-slate-300 p-4 dark:border-slate-600">
                <h3 className="font-display text-lg font-semibold">{o.nom}</h3>
                <div className="mt-3 space-y-2">
                  {PERIODES.map((p) => (
                    <button key={p} type="button" className="btn-ghost w-full text-start" disabled={!majeur || occupe} onClick={() => payer(id, p)}>
                      {tr(p === 'annuel' ? 'Annuel' : 'Mensuel')} : {prixAffiche(o[p].centimes, lang)} {tr('TTC')}{p === 'annuel' ? ` ${tr('par an')}` : ` ${tr('par mois')}`}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
          {!majeur && <p className="text-xs">{tr('Coche la case ci-dessus pour activer les boutons.')}</p>}
          <p className="text-xs">{tr('Abonnement renouvelé automatiquement, résiliable à tout moment depuis « Gérer mon abonnement ». Droit de rétractation de 14 jours : voir les conditions d’utilisation.')}</p>
        </>
      )}
      {erreur && <p role="alert" className="text-sm font-semibold text-rose-700">{tr(erreur)}</p>}
    </section>
  )
}
