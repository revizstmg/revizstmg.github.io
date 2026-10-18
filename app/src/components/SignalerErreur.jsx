import { TextePublic } from '../localisation/PublicText.jsx'
import { useEffect, useRef, useState } from 'react'
import { send } from '../reseau.js'
import { SUPA_READY } from '../supabase.js'

// « Signaler une erreur » : sous chaque exercice et chaque chapitre de cours.
// Le signalement part dans la table revizstmg_signalements (écriture seule :
// personne ne peut les relire par le site) ; on les traite depuis Supabase.
// Le nombre de signalements à traiter figure dans le rapport du matin.
const CATEGORIES = [
  { id: 'reponse', label: 'Une bonne réponse est refusée' },
  { id: 'enonce', label: 'Énoncé faux ou ambigu' },
  { id: 'cours', label: 'Erreur dans le cours' },
  { id: 'affichage', label: 'Problème d’affichage' },
  { id: 'autre', label: 'Autre chose' },
]

export async function envoyerSignalement({ page, themeId, exercice, categorie, message }) {
  await send('POST', 'revizstmg_signalements', [{
    page: String(page || '').slice(0, 300),
    theme_id: String(themeId || '').slice(0, 80),
    exercice: String(exercice || '').slice(0, 200),
    categorie: CATEGORIES.some((c) => c.id === categorie) ? categorie : 'autre',
    message: String(message || '').trim().slice(0, 1000),
  }], 'return=minimal')
}

export default function SignalerErreur({ themeId, exercice, defaut = 'reponse', libelle = 'Signaler une erreur' }) {
  const [ouvert, setOuvert] = useState(false)
  const [categorie, setCategorie] = useState(defaut)
  const [message, setMessage] = useState('')
  const [etat, setEtat] = useState('') // '' | 'envoi' | 'ok' | message d'erreur
  const zone = useRef(null)

  useEffect(() => { if (ouvert) zone.current?.focus() }, [ouvert])

  if (!SUPA_READY) return null

  const valide = message.trim().length >= 3
  const envoyer = async (e) => {
    e.preventDefault()
    if (!valide || etat === 'envoi') return
    setEtat('envoi')
    try {
      await envoyerSignalement({ page: window.location.hash.replace(/^#/, ''), themeId, exercice, categorie, message })
      setEtat('ok')
      setMessage('')
    } catch (err) {
      setEtat(/trop d/i.test(err?.message || '') ? 'Trop de signalements d’un coup : réessaie dans un moment.' : 'L’envoi a échoué : vérifie ta connexion et réessaie.')
    }
  }

  if (!ouvert) {
    return (
      <button type="button" onClick={() => { setOuvert(true); setEtat('') }}
        className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-rose-600 hover:underline dark:text-slate-400">
        ⚑ {libelle}
      </button>
    )
  }

  return (
    <form onSubmit={envoyer} className="card mt-2 space-y-3 p-4 text-left" aria-label="Signaler une erreur">
      {etat === 'ok' ? (
        <>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Merci ! Ton signalement est bien arrivé : nous allons vérifier et corriger.</p>
          <button type="button" onClick={() => setOuvert(false)} className="btn-ghost !min-h-0 !py-2 text-sm">Fermer</button>
        </>
      ) : (
        <>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Quel est le problème ?</legend>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <label key={c.id} className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold ${categorie === c.id ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' : 'border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300'}`}>
                  <input type="radio" name="categorie-signalement" value={c.id} checked={categorie === c.id} onChange={() => setCategorie(c.id)} className="sr-only" />
                  <TextePublic text={c.label} />
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block text-sm font-semibold" htmlFor={`signalement-${themeId || 'x'}`}>
            Explique-nous (la question, ce qui est faux, la bonne réponse si tu la connais)
          </label>
          <textarea id={`signalement-${themeId || 'x'}`} ref={zone} value={message} onChange={(e) => setMessage(e.target.value)} rows={3} maxLength={1000}
            className="w-full resize-y rounded-xl border-2 border-slate-200 bg-white p-3 text-sm outline-none focus:border-rose-400 dark:border-slate-700 dark:bg-slate-800" />
          {etat && etat !== 'envoi' && <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">{etat}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={!valide || etat === 'envoi'} className="btn-primary !min-h-0 !py-2 text-sm disabled:opacity-60">
              {etat === 'envoi' ? 'Envoi…' : 'Envoyer'}
            </button>
            <button type="button" onClick={() => setOuvert(false)} className="btn-ghost !min-h-0 !py-2 text-sm">Annuler</button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">N’écris pas d’informations personnelles. Sont envoyés : ton message, la page concernée et, si tu es connecté, l’identifiant de ton compte (pour éviter les abus).</p>
        </>
      )}
    </form>
  )
}
