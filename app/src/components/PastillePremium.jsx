import {Link} from 'react-router-dom'
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

// Outil réservé aux abonnés, dans une page gratuite : pour un compte gratuit, une ligne qui mène aux offres
// à la place de l'outil ; pour un abonné (ou pendant la période de grâce), l'outil lui-même.
export function OutilReserve({icone,titre,children}){
  const niveau=useNiveauAcces()
  if(niveau!=='gratuit')return children
  return <Link to="/offres" className="card group flex w-full items-center gap-3 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"><span className="w-6 shrink-0 text-center text-lg" aria-hidden>{icone}</span><span className="min-w-0 flex-1 font-semibold leading-snug">{titre}<PastillePremium to="/revision"/></span><span className="text-lg text-slate-300" aria-hidden>›</span></Link>
}
