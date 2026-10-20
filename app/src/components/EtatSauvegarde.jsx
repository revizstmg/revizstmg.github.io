import { useStore } from '../store.jsx'

// État de la sauvegarde sur le compte (store.jsx) : un bandeau quand la
// progression n'est pas encore partie (hors ligne, échec), et l'avertissement
// d'une déconnexion qui ferait perdre les derniers changements (y compris
// quand la session a expiré : il faut alors se reconnecter pour sauvegarder).
export default function EtatSauvegarde() {
  const { sauvegarde, sauvegarder, deconnexion, annulerDeconnexion, logout } = useStore()
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
      {deconnexion && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={annulerDeconnexion}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="deconnexion-titre" className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
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
          </div>
        </div>
      )}
    </>
  )
}
