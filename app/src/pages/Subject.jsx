import { Link, useParams, Navigate } from 'react-router-dom'
import { getSubject, deckForSubject } from '../data/index.js'
import { useStore, chapterScore } from '../store.jsx'
import { ProgressBar } from '../components/ui.jsx'
import { CourseText } from '../components/Course.jsx'
import { DeckDownload } from '../components/DeckDownload.jsx'
import { useT } from '../i18n.js'

// « Thème 5 — Quel est le rôle du contrat ? » → numéro 5 dans la pastille,
// « Quel est le rôle du contrat ? » en titre. Sans numéro dans le nom, on
// numérote dans l'ordre.
function numeroEtTitre(nom, i) {
  const m = String(nom || '').match(/^(?:Thème|Chapitre)\s+(\d+)\s*[—–-]\s*(.+)$/)
  return m ? [m[1], m[2]] : [String(i + 1), nom]
}

// Page d'une matière : d'abord la liste des thèmes, une ligne par thème.
export default function Subject() {
  const { sid } = useParams()
  const subject = getSubject(sid)
  const { state } = useStore()
  const t = useT()
  if (!subject) return <Navigate to="/" replace />
  const color = subject.color

  return (
    <div className="animate-lux space-y-4">
      <header className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-2xl" style={{ backgroundColor: color + '18' }} aria-hidden>{subject.icon}</span>
        <h1 className="font-display text-2xl font-medium leading-tight">{subject.name}</h1>
      </header>

      <ol className="space-y-2.5">
        {subject.chapters.map((c, i) => {
          const score = chapterScore(state, c.id)
          const done = score >= 90
          const [numero, titre] = numeroEtTitre(c.name, i)
          return (
            <li key={c.id}>
              <Link
                to={`/subject/${sid}/theme/${c.id}`}
                className="card group flex w-full items-center gap-3 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-black text-white shadow-sm"
                  style={{ backgroundColor: done ? '#16a34a' : color }}
                  aria-hidden
                >
                  {done ? '✓' : numero}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold leading-snug"><CourseText text={titre} /></span>
                  {score > 0 && (
                    <span className="mt-1.5 flex max-w-[240px] items-center gap-2">
                      <ProgressBar value={score} color={done ? '#16a34a' : color} />
                      <span className="text-xs font-semibold text-slate-400">{score}%</span>
                    </span>
                  )}
                </span>
                <span className="text-lg text-slate-300 transition group-hover:translate-x-0.5" aria-hidden>›</span>
              </Link>
            </li>
          )
        })}
      </ol>

      <DeckDownload deck={deckForSubject(sid)} color={color} label={t('downloadSubjectDeck')} />
    </div>
  )
}
