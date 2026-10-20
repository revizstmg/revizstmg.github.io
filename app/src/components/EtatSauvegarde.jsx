import { useRef } from 'react'
import { useStore } from '../store.jsx'
import { usePublicText } from '../i18n.js'
import { creerMonCompte } from './CompteRequis.jsx'
import { useFenetreClavier } from './clavier.js'

// Fenêtre d'alerte : Échap revient en arrière (« Rester » / « Continuer »),
// Tab reste dans la fenêtre, le focus revient ensuite où il était.
function Alerte({ titreId, onClose, children }) {
  const fenetre = useRef(null)
  useFenetreClavier(fenetre, onClose)
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div ref={fenetre} role="alertdialog" aria-modal="true" aria-labelledby={titreId} className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

// Indicateur de l'en-tête (comptes connectés) : la progression est enregistrée
// sur le compte, en attente d'envoi (modifications récentes, envoi en cours),
// ou non enregistrée (hors ligne, échec : le bandeau en dessous explique).
// Sur petit écran, seule l'icône reste visible ; le texte est lu à voix haute.
const ETATS_INDICATEUR = {
  ok: { icone: '✓', texte: 'Enregistré', titre: 'Ta progression est enregistrée sur ton compte.', cls: 'text-emerald-700 dark:text-emerald-400' },
  attente: { icone: '⏳', texte: 'En attente', titre: 'Tes derniers changements partent sur ton compte dans un instant.', cls: 'text-slate-500 dark:text-slate-400' },
  echec: { icone: '⚠', texte: 'Non enregistré', titre: 'Tes derniers changements ne sont pas encore sur ton compte.', cls: 'text-amber-700 dark:text-amber-300' },
}
export function etatIndicateur(etat) {
  if (etat === 'horsLigne' || etat === 'erreur') return 'echec'
  if (etat === 'attente' || etat === 'envoi') return 'attente'
  return 'ok'
}
export function IndicateurSauvegarde() {
  const { state, sauvegarde } = useStore()
  const tr = usePublicText()
  if (!state.account?.id || etatIndicateur(sauvegarde.etat) === 'ok') return null
  const v = ETATS_INDICATEUR[etatIndicateur(sauvegarde.etat)]
  return (
    <span data-sauvegarde={etatIndicateur(sauvegarde.etat)} title={tr(v.titre)} className={`flex shrink-0 items-center gap-1 text-xs font-semibold ${v.cls}`}>
      <span aria-hidden>{v.icone}</span>
      <span className="hidden min-[420px]:inline">{tr(v.texte)}</span>
      <span className="sr-only min-[420px]:hidden">{tr(v.texte)}</span>
    </span>
  )
}

// État de la sauvegarde sur le compte (store.jsx) : un bandeau quand la
// progression n'est pas encore partie (hors ligne, échec), et l'avertissement
// d'une déconnexion qui ferait perdre les derniers changements (y compris
// quand la session a expiré : il faut alors se reconnecter pour sauvegarder).
export default function EtatSauvegarde() {
  const { state, sauvegarde, sauvegarder, deconnexion, annulerDeconnexion, logout, stockagePlein } = useStore()
  const { etat } = sauvegarde
  return (
    <>
      {(etat === 'horsLigne' || etat === 'erreur') && (
        <div role="status" className="no-print border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-3 gap-y-1">
            <span aria-hidden>☁️</span>
            <strong>Non sauvegardé</strong>
            <span className="min-w-0 flex-1">
              {etat === 'horsLigne'
                ? 'Pas de connexion : ta progression reste sur cet appareil et partira sur ton compte au retour du réseau.'
                : 'La sauvegarde sur ton compte a échoué. Ta progression reste sur cet appareil ; on réessaie tout seul.'}
            </span>
            <button type="button" onClick={() => sauvegarder()} className="font-semibold underline">Réessayer</button>
          </div>
        </div>
      )}
      {stockagePlein && (
        <div role="alert" className="no-print border-b border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-100">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-3 gap-y-1">
            <span aria-hidden>⚠️</span>
            <strong>Progression non enregistrée sur cet appareil</strong>
            <span className="min-w-0 flex-1">
              {state.account?.id
                ? 'Le stockage du navigateur est plein ou bloqué. Ta progression part quand même sur ton compte ; libère de la place pour la garder aussi ici.'
                : 'Le stockage du navigateur est plein ou bloqué. Libère de la place, ou crée un compte pour ne pas perdre ta progression.'}
            </span>
          </div>
        </div>
      )}
      {deconnexion?.etat === 'essai' && (
        <Alerte titreId="essai-titre" onClose={annulerDeconnexion}>
            <h2 id="essai-titre" className="font-display text-xl font-medium">Ta progression d’essai va être effacée</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Tu n’as pas de compte : ta progression n’existe que sur cet appareil. Crée un compte gratuit pour la garder et la retrouver partout.</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
              <button type="button" onClick={() => { annulerDeconnexion(); creerMonCompte() }} className="btn-primary">Créer mon compte</button>
              <button type="button" onClick={annulerDeconnexion} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">Continuer l’essai</button>
              <button type="button" onClick={() => logout({ force: true })} className="rounded-xl px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40">Tout effacer</button>
            </div>
        </Alerte>
      )}
      {deconnexion && deconnexion.etat !== 'essai' && (
        <Alerte titreId="deconnexion-titre" onClose={annulerDeconnexion}>
            <h2 id="deconnexion-titre" className="font-display text-xl font-medium">Ta progression n’est pas sauvegardée</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {deconnexion.etat === 'horsLigne' && 'Tu n’es pas connecté à Internet. Si tu te déconnectes maintenant, ce que tu as fait depuis la dernière sauvegarde sera perdu.'}
              {deconnexion.etat === 'erreur' && 'La sauvegarde sur ton compte a échoué. Si tu te déconnectes maintenant, ce que tu as fait depuis la dernière sauvegarde sera perdu.'}
              {deconnexion.etat === 'session' && 'Ta session a expiré. Si tu te déconnectes maintenant, ce que tu as fait depuis la dernière sauvegarde sera perdu ; reconnecte-toi plutôt avec le même compte.'}
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
              {deconnexion.etat !== 'session' && <button type="button" onClick={() => logout()} className="btn-primary">Réessayer la sauvegarde</button>}
              <button type="button" onClick={annulerDeconnexion} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">Rester connecté</button>
              <button type="button" onClick={() => logout({ force: true })} className="rounded-xl px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40">Me déconnecter quand même</button>
            </div>
        </Alerte>
      )}
    </>
  )
}
