import {usePublicText} from '../i18n.js'
import {estPagePayante} from '../data/acces.js'
import {useNiveauAcces} from './Reserve.jsx'

// Petit repère sur un lien vers une page réservée aux abonnés, pour un compte gratuit
// (rien pendant la période de grâce ni pour un abonné). Le texte caché sert aux lecteurs d'écran.
export default function PastillePremium({to}){
  const tr=usePublicText()
  const niveau=useNiveauAcces()
  if(niveau!=='gratuit'||!estPagePayante(to))return null
  return <span className="ms-2 inline-flex shrink-0 items-center rounded-full border border-amber-700/40 px-1.5 text-[10px] font-semibold uppercase tracking-wide"><span aria-hidden>🔒 Premium</span><span className="sr-only">{tr('Réservé aux abonnés')}</span></span>
}
