import {useEffect,useState} from 'react'
import { useStore } from '../store.jsx'
import { isSignedIn, getSession } from '../auth.js'

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

export function InvitationCompte({ quoi, essai = true }) {
  return (
    <section className="card mx-auto max-w-lg p-6 text-center">
      <p className="text-4xl" aria-hidden>🔐</p>
      <h1 className="mt-2 font-display text-2xl font-medium">Crée ton compte pour {quoi}</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {essai
          ? <>Tu es en mode essai : tu révises librement, et ta progression reste sur cet appareil. Avec un compte (gratuit),
        tu la retrouves sur tous tes appareils et tu accèdes aux espaces partagés. Rien de ce que tu as fait ne sera perdu.</>
          : <>Cet espace est réservé aux comptes. Crée ton compte gratuit pour retrouver ta progression sur tous tes appareils et accéder aux classes, aux amis et aux classements.</>}
      </p>
      <button type="button" onClick={creerMonCompte} className="btn-primary mt-4">Créer mon compte</button>
    </section>
  )
}

// Enveloppe d'une page réservée aux comptes.
export default function AvecCompte({ quoi, children }) {
  const { state } = useStore()
  const [,changed]=useState(0)
  useEffect(()=>{const sync=()=>changed(n=>n+1);window.addEventListener('stmg-session-change',sync);window.addEventListener('storage',sync);return()=>{window.removeEventListener('stmg-session-change',sync);window.removeEventListener('storage',sync)}},[])
  if(estEnEssai(state))return <InvitationCompte quoi={quoi} />
  if(!state.account?.id&&!isSignedIn())return <InvitationCompte quoi={quoi} essai={false} />
  if(!isSignedIn()||getSession()?.user?.id!==state.account?.id)return <section className="card mx-auto max-w-lg p-6 text-center"><h1 className="font-display text-2xl">Reconnecte-toi</h1><p className="mt-3 text-sm">Ta session a expiré. Tes révisions sont conservées sur cet appareil. Reconnecte-toi pour accéder aux classes, aux amis et aux classements.</p><button type="button" onClick={()=>window.dispatchEvent(new CustomEvent('stmg-creer-compte',{detail:{login:true}}))} className="btn-primary mt-4">Me reconnecter</button></section>
  return children
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
