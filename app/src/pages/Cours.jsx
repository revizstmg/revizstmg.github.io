import { Link, Navigate } from 'react-router-dom'
import { useStore, subjectScore } from '../store.jsx'
import { subjectsForTrack } from '../data/tracks.js'
import { getChapter } from '../data/index.js'
import { readPosition } from '../data/readingPosition.js'
import { CourseText } from '../components/Course.jsx'
import { ProgressBar } from '../components/ui.jsx'
import { useT } from '../i18n.js'

// Onglet « Cours » de la barre du bas : reprendre la dernière fiche, puis
// toutes les matières de la filière avec leur maîtrise.
export default function Cours() {
  const { state } = useStore()
  const t = useT()
  if (!state.track) return <Navigate to="/" replace />
  const subjects = subjectsForTrack(state.track)
  const position = readPosition(state.account?.id)
  const fiche = position && subjects.some((s) => s.id === position.subjectId) ? getChapter(position.themeId) : null
  return (
    <div className="animate-lux space-y-6">
      <header className="text-center">
        <p className="kicker">📖 {t('coursTab')}</p>
        <h1 className="mt-1 font-display text-[1.9rem] font-medium leading-tight">{t('mySubjects')}</h1>
        <span className="mx-auto mt-3 block h-px w-24 rounded-full" style={{ background: 'linear-gradient(90deg,transparent,#c8a24e,transparent)' }} />
      </header>
      {fiche && (
        <Link to={`/subject/${position.subjectId}/theme/${position.themeId}/chapter/${position.chapterIndex}`} className="card card-lux flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl text-white" style={{ backgroundColor: 'var(--c-accent-fort)' }} aria-hidden>▶</span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">{t('resume')}</span>
            <span className="block truncate font-display font-semibold leading-tight"><CourseText text={position.chapterTitle || fiche.short || fiche.name} /></span>
            <span className="block truncate text-xs text-slate-500 dark:text-slate-400"><CourseText text={fiche.short || fiche.name} /></span>
          </span>
        </Link>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {subjects.map((s) => {
          const pct = s.comingSoon ? 0 : subjectScore(state, s.id)
          const contenu = (
            <>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-xl" style={{ backgroundColor: s.color + '22' }} aria-hidden>{s.icon || '📘'}</span>
              <span className="block font-display text-sm font-semibold leading-tight"><CourseText text={s.short || s.name} /></span>
              <span className="flex justify-between text-xs text-slate-500 dark:text-slate-400"><span>{s.chapters.length} {t('themesCount')}</span><span>{s.comingSoon ? t('comingSoon') : `${pct}%`}</span></span>
              {!s.comingSoon && <ProgressBar value={pct} color={s.color} />}
            </>
          )
          return s.comingSoon
            ? <div key={s.id} className="card flex flex-col gap-2 p-4 opacity-70">{contenu}</div>
            : <Link key={s.id} to={`/subject/${s.id}`} className="card flex flex-col gap-2 p-4 transition hover:-translate-y-0.5 hover:shadow-md">{contenu}</Link>
        })}
      </div>
    </div>
  )
}
