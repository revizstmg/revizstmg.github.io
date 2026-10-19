import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { useT } from '../i18n.js'
import { subjectsForTrack } from '../data/tracks.js'
import { todayKey, daysUntil, defaultBacDate } from '../data/srs.js'

// « Réviser & réussir » sur l'accueil : un seul outil mis en avant, celui qui sert
// le plus maintenant, et les autres rangés dans « ta trousse », fermée par
// défaut. L'élève l'ouvre quand il en a besoin ; l'appareil s'en souvient.
const CLE_TROUSSE = 'stmg_trousse_ouverte'
const BAC_PROCHE = 30 // jours

// L'outil conseillé, d'après la situation de l'élève :
// 1. bac dans moins de 30 jours → bac blanc ;
// 2. thèmes travaillés dont la révision est due → révision intelligente ;
// 3. chapitres marqués « à revoir » → favoris ;
// 4. sinon → le programme jusqu'au bac et ses objectifs du jour.
export function outilConseille(state, today = todayKey()) {
  const level = state?.track?.level
  const bac = state?.bacDate || (level === 'terminale-stmg' ? defaultBacDate(new Date(`${today}T12:00:00`)) : null)
  const jours = daysUntil(bac, today)
  if (jours != null && jours >= 0 && jours <= BAC_PROCHE) return { id: 'bac-blanc', jours }
  const themes = new Set(subjectsForTrack(state?.track).flatMap((s) => (s.chapters || []).map((c) => c.id)))
  const dus = Object.entries(state?.srs || {}).filter(([id, s]) => themes.has(id) && s?.due && s.due <= today).length
  if (dus > 0) return { id: 'revision', dus }
  const favoris = (state?.favorites || []).length
  if (favoris > 0) return { id: 'favoris', favoris }
  return { id: 'programme' }
}

function lireTrousse() {
  try { return localStorage.getItem(CLE_TROUSSE) === '1' } catch { return false }
}

export default function OutilsAccueil() {
  const { state } = useStore()
  const t = useT()
  const [ouverte, setOuverte] = useState(lireTrousse)
  const level = state.track?.level
  const nbFavoris = (state.favorites || []).length
  const outils = [
    { id: 'revision', to: '/revision', icon: '🧠', label: t('smartRevision'), sub: t('priorityList') },
    { id: 'bac-blanc', to: '/bac-blanc', icon: '📝', label: t('mockExam'), sub: '/20 · ⏱' },
    { id: 'programme', to: '/programme', icon: '📅', label: t('studyPlan'), sub: t('todayGoals') },
    { id: 'coach', to: '/coach', icon: '🎯', label: t('coach') },
    { id: 'coach-ia', to: '/coach-ia', icon: '🤖', label: t('coachAI'), sub: t('aiTraining') },
    level === 'terminale-stmg' && { id: 'grand-oral', to: '/grand-oral', icon: '🎓', label: t('grandOral') },
    level === 'premiere-stmg' && { id: 'etude-de-gestion', to: '/etude-de-gestion', icon: '🔎', label: t('egTitle'), sub: t('egTileSub') },
    { id: 'fiches-photo', to: '/fiches-photo', icon: '📸', label: t('photoFiche'), sub: t('photoFicheSub') },
    { id: 'favoris', to: '/favoris', icon: '⭐', label: t('favorites'), sub: `${nbFavoris} ${t(nbFavoris > 1 ? 'chapToReviewP' : 'chapToReviewM')}` },
  ].filter(Boolean)
  const conseil = outilConseille(state)
  const principal = outils.find((o) => o.id === conseil.id) || outils[0]
  const autres = outils.filter((o) => o !== principal)

  const basculer = () => setOuverte((v) => {
    try { localStorage.setItem(CLE_TROUSSE, v ? '0' : '1') } catch { /* stockage indisponible */ }
    return !v
  })

  return (
    <section aria-labelledby="titre-outils">
      <h2 id="titre-outils" className="mb-3 px-1 font-display text-lg font-semibold text-slate-700 dark:text-slate-200">{t('secRevise')}</h2>
      <div className="card overflow-hidden p-0">
        <Link to={principal.to} className="group flex items-center gap-3 p-4 transition hover:bg-[color-mix(in_srgb,var(--c-accent)_6%,transparent)]">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--c-accent) 14%, transparent)' }} aria-hidden>{principal.icon}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--c-accent-fort)] dark:text-[var(--c-accent)]">Conseillé maintenant</span>
            <span className="block font-semibold leading-tight">{principal.label}</span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">
              {conseil.id === 'bac-blanc' ? `J-${conseil.jours} : entraîne-toi dans les conditions de l’épreuve`
                : conseil.id === 'revision' ? (conseil.dus > 1 ? `${conseil.dus} thèmes à revoir aujourd’hui` : 'Un thème à revoir aujourd’hui')
                : principal.sub}
            </span>
          </span>
          <span className="text-lg text-[var(--c-accent)] transition group-hover:translate-x-0.5 rtl:-scale-x-100" aria-hidden>→</span>
        </Link>
        <button type="button" onClick={basculer} aria-expanded={ouverte} aria-controls="trousse-outils"
          className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-2.5 text-start text-sm text-slate-500 transition hover:text-slate-800 dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
          <span className={`shrink-0 ${ouverte ? 'hidden' : 'flex'}`} aria-hidden>
            {autres.slice(0, 5).map((o, i) => (
              <span key={o.id} className={`grid h-7 w-7 place-items-center rounded-full text-[13px] ring-2 ring-[var(--c-card)] ${i ? '-ms-2' : ''}`} style={{ background: 'color-mix(in srgb, var(--c-ink) 7%, var(--c-card))', zIndex: 5 - i }}>{o.icon}</span>
            ))}
          </span>
          <span className="min-w-0 flex-1">{ouverte ? 'Refermer ta trousse' : `Ta trousse · ${autres.length} outils`}</span>
          <span className={`text-xs transition-transform ${ouverte ? 'rotate-180' : ''}`} aria-hidden>▾</span>
        </button>
        <ul id="trousse-outils" hidden={!ouverte} className={`${ouverte ? 'animate-lux grid' : 'hidden'} grid-cols-1 border-t border-slate-100 py-1 sm:grid-cols-2 dark:border-slate-800`}>
          {autres.map((o) => (
            <li key={o.id}>
              <Link to={o.to} className="flex items-center gap-3 px-4 py-2 text-sm transition hover:bg-[color-mix(in_srgb,var(--c-ink)_5%,transparent)]">
                <span className="w-6 shrink-0 text-center text-base" aria-hidden>{o.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium leading-tight">{o.label}</span>
                  {o.sub && <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{o.sub}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
