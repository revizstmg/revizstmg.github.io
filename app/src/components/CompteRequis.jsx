import { useStore } from '../store.jsx'
import { isSignedIn } from '../auth.js'

// Essai sans compte : l'élève révise avec une progression gardée sur
// l'appareil. Les espaces partagés (classe, amis, classement, suivi parent)
// demandent un compte : la base n'y donne accès qu'aux comptes connectés.
export function estEnEssai(state) {
  return !!state.profile?.firstName && !state.account?.id && !isSignedIn()
}

// Ouvre l'inscription (Welcome.jsx écoute cet événement).
export function creerMonCompte() {
  window.dispatchEvent(new CustomEvent('stmg-creer-compte'))
}

export function InvitationCompte({ quoi }) {
  return (
    <section className="card mx-auto max-w-lg p-6 text-center">
      <p className="text-4xl" aria-hidden>🔐</p>
      <h1 className="mt-2 font-display text-2xl font-medium">Crée ton compte pour {quoi}</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Tu es en mode essai : tu révises librement, et ta progression reste sur cet appareil. Avec un compte (gratuit),
        tu la retrouves sur tous tes appareils et tu accèdes aux espaces partagés. Rien de ce que tu as fait ne sera perdu.
      </p>
      <button type="button" onClick={creerMonCompte} className="btn-primary mt-4">Créer mon compte</button>
    </section>
  )
}

// Enveloppe d'une page réservée aux comptes.
export default function AvecCompte({ quoi, children }) {
  const { state } = useStore()
  return estEnEssai(state) ? <InvitationCompte quoi={quoi} /> : children
}

// Bandeau discret en haut de l'application pendant l'essai.
export function BandeauEssai() {
  const { state } = useStore()
  if (!estEnEssai(state)) return null
  return (
    <div className="no-print border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
      Mode essai : ta progression reste sur cet appareil.{' '}
      <button type="button" onClick={creerMonCompte} className="font-semibold underline underline-offset-2">Créer mon compte</button>
    </div>
  )
}
