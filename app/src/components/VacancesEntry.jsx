import { Link } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { vacancesText } from '../i18n/vacances.js'
export default function VacancesEntry() {
 const {state}=useStore(),m=k=>vacancesText(state.lang,k)
 return <aside className="card flex flex-wrap items-center justify-between gap-4 p-5"><div className="min-w-0 flex-1"><p className="font-display text-xl font-semibold">☀️ {m('title')}</p><p className="mt-1 text-sm">{m('intro')}</p></div><Link className="btn-primary" to="/vacances">{m('home')}</Link></aside>
}
