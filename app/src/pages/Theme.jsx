import { useEffect, useState } from 'react'
import { Link, useParams, Navigate, useSearchParams } from 'react-router-dom'
import { getChapter, getSubject, themeChapters, deckForTheme } from '../data/index.js'
import { buildThemeExam, themeExamSize } from '../data/study.js'
import { PIEGES } from '../data/pieges.js'
import { useStore, useThemeTimer, chapterScore, starsFromScore } from '../store.jsx'
import { ProgressBar, Stars } from '../components/ui.jsx'
import { Rich } from '../components/ui.jsx'
import { Essentiel, Resources, CourseText } from '../components/Course.jsx'
import { DeckDownload } from '../components/DeckDownload.jsx'
import ThemeTest from '../games/ThemeTest.jsx'
import Exam from '../games/Exam.jsx'
import { useT, useGameLabel } from '../i18n.js'

// Dans la liste, le numéro suffit : on retire l'émoji placé en tête de certains titres.
const sansEmoji = (titre) => String(titre || '').replace(/^(?:(?:\p{Extended_Pictographic}|\p{Regional_Indicator}{2})[\u200d\ufe0f\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}]*\s*)+/u, '')

const TABS = [
  { id: 'chapitres', key: 'tabChapters', icon: '📚' },
  { id: 'test', key: 'tabTest', icon: '🏁' },
  { id: 'progression', key: 'tabProgress', icon: '📊' },
]

export default function Theme() {
  const { sid, tid } = useParams()
  const subject = getSubject(sid)
  const theme = getChapter(tid)
  const { state, setLastChapter, toggleFavorite, setNote } = useStore()
  const t = useT()
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') === 'test' ? 'test' : 'chapitres')
  const [themeExam, setThemeExam] = useState(null) // questions du bac blanc de thème
  const [openCats, setOpenCats] = useState({}) // catégories de chapitres dépliées
  useEffect(() => { setOpenCats({}) }, [tid]) // on repart d'un état neuf par thème
  useThemeTimer(tid) // mesure le temps de révision passé sur ce thème

  useEffect(() => {
    if (theme) setLastChapter(sid, tid)
  }, [sid, tid, theme, setLastChapter])

  useEffect(() => { setTab(searchParams.get('tab') === 'test' ? 'test' : 'chapitres') }, [tid, searchParams])

  if (!subject || !theme) return <Navigate to="/" replace />
  const color = subject.color
  const chapters = themeChapters(theme)
  const score = chapterScore(state, tid)
  const rec = state.chapters[tid]
  const fav = state.favorites.includes(tid)
  // Progression d'un chapitre = moyenne des meilleurs scores de SES exercices
  // (null si le chapitre est un pur cours sans exercice).
  const chapterProgress = (c) => {
    const gs = c.games || []
    if (!gs.length) return null
    const vals = gs.map((g) => rec?.games?.[g.id] || 0)
    return Math.round(vals.reduce((a, b) => a + b, 0) / gs.length)
  }

  if (themeExam) {
    return (
      <div className="space-y-4">
        <Exam questions={themeExam} durationSec={Math.max(300, themeExam.length * 60)} color={color} onExit={() => setThemeExam(null)} />
      </div>
    )
  }

  return (
    <div className="animate-lux space-y-4">
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-medium leading-tight"><CourseText text={theme.name} /></h1>
          {score > 0 && (
            <div className="mt-2 flex max-w-[240px] items-center gap-2">
              <ProgressBar value={score} color={color} height={6} />
              <span className="text-xs font-semibold text-slate-400">{score}%</span>
            </div>
          )}
        </div>
        <button
          onClick={() => toggleFavorite(tid)}
          className={`no-print grid h-10 w-10 shrink-0 place-items-center rounded-full text-xl ${fav ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400 dark:text-slate-600'}`}
          aria-label={fav ? t('removeFav') : t('addFav')}
          aria-pressed={fav}
        >
          {fav ? '★' : '☆'}
        </button>
      </header>

      <div className="no-print sticky top-[52px] z-30 -mx-4 border-b border-slate-200 bg-slate-50/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex gap-1">
          {TABS.map((tb) => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`flex-1 border-b-2 px-2 py-2.5 text-sm font-semibold transition ${
                tab === tb.id ? 'text-slate-900 dark:text-white' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
              style={tab === tb.id ? { borderColor: color } : undefined}
              aria-current={tab === tb.id}
            >
              <span className="mr-1" aria-hidden>{tb.icon}</span>
              <span>{t(tb.key)}</span>
            </button>
          ))}
        </div>
      </div>

      {tab === 'chapitres' && (
        <div className="space-y-6">
          {/* Les chapitres, rangés par catégories repliables */}
          <section className="space-y-3">

            {(() => {
              const CATS = [
                { id: 'cours', label: `📘 ${t('catCourse')}` },
                { id: 'approf', label: `📚 ${t('catDeep')}` },
                { id: 'methode', label: `🧮 ${t('catMethod')}` },
                { id: 'cas', label: `📝 ${t('catCases')}` },
              ]
              const groups = CATS
                .map((cat) => ({ ...cat, items: chapters.filter((c) => (c.section?.group || 'cours') === cat.id) }))
                .filter((g) => g.items.length)
              const single = groups.length <= 1

              const renderChapter = (c, n) => {
                const prog = chapterProgress(c)
                const done = prog != null && prog >= 90
                return (
                  <Link
                    key={c.id}
                    to={`/subject/${sid}/theme/${tid}/chapter/${c.idx}`}
                    className="card group flex w-full items-center gap-3 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-black text-white shadow-sm"
                      style={{ backgroundColor: done ? '#16a34a' : color }}
                      aria-hidden
                    >
                      {done ? '✓' : n}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold leading-snug"><CourseText text={sansEmoji(c.title)} /></span>
                      {prog != null && prog > 0 && (
                        <span className="mt-1.5 block max-w-[220px]"><ProgressBar value={prog} color={done ? '#16a34a' : color} /></span>
                      )}
                    </span>
                    <span className="text-lg text-slate-300 transition group-hover:translate-x-0.5" aria-hidden>›</span>
                  </Link>
                )
              }

              return groups.map((g, gi) => {
                const isOpen = single || (openCats[g.id] !== undefined ? openCats[g.id] : gi === 0)
                const doneCount = g.items.filter((c) => { const p = chapterProgress(c); return p != null && p >= 90 }).length
                return (
                  <section key={g.id} className="space-y-2.5">
                    {!single && (
                      <button
                        type="button"
                        onClick={() => setOpenCats((o) => ({ ...o, [g.id]: !isOpen }))}
                        className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white/60 px-4 py-3 text-left transition hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900"
                        aria-expanded={isOpen}
                      >
                        <span className="min-w-0 flex-1 font-display font-semibold">{g.label}</span>
                        <span className="shrink-0 text-xs font-semibold text-slate-400">{doneCount}/{g.items.length}</span>
                        <span className="shrink-0 text-slate-400 transition" aria-hidden>{isOpen ? '▾' : '▸'}</span>
                      </button>
                    )}
                    {isOpen && (
                      <ol className="space-y-2.5">
                        {g.items.map((c, i) => renderChapter(c, i + 1))}
                      </ol>
                    )}
                  </section>
                )
              })
            })()}
          </section>

          {/* Pour réviser tout le thème : une ligne par outil, dépliée à la demande */}
          <section key={tid} className="space-y-2.5">
            {themeExamSize(tid) >= 4 && (
              <button onClick={() => setThemeExam(buildThemeExam(tid))} className="card group flex w-full items-center gap-3 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md">
                <span className="w-6 shrink-0 text-center text-lg" aria-hidden>📝</span>
                <span className="min-w-0 flex-1 font-semibold leading-snug">{t('themeExam')}</span>
                <span className="text-lg text-slate-300 transition group-hover:translate-x-0.5" aria-hidden>›</span>
              </button>
            )}
            {theme.essentiel?.length > 0 && (
              <Repli icone="🧠" titre={t('memoSheet')}><Essentiel items={theme.essentiel} color={color} nu /></Repli>
            )}
            {PIEGES[tid]?.length > 0 && (
              <Repli icone="⚠️" titre={t('commonMistakes')}>
                <ul className="space-y-1.5">
                  {PIEGES[tid].map((p, i) => (
                    <li key={i} className="flex gap-2 text-[14px] leading-relaxed text-slate-700 dark:text-slate-200">
                      <span className="mt-0.5 shrink-0" style={{ color: '#f59e0b' }}>•</span><span><Rich text={p} /></span>
                    </li>
                  ))}
                </ul>
              </Repli>
            )}
            {theme.resources?.length > 0 && (
              <Repli icone="🎥" titre={t('goFurther')}><Resources items={theme.resources} nu /></Repli>
            )}
            <DeckDownload deck={deckForTheme(tid)} color={color} label={t('downloadThemeDeck')} />
            {/* Notes personnelles de l'élève sur ce thème (sauvegardées & synchronisées) */}
            <Repli icone="✏️" titre={t('myNotes')} ouvert={!!state.notes?.[tid]}>
              <textarea
                value={state.notes?.[tid] || ''}
                onChange={(e) => setNote(tid, e.target.value)}
                rows={4}
                placeholder={t('myNotesPlaceholder')}
                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[color:var(--c-accent)] dark:border-slate-700 dark:bg-slate-800"
              />
              <p className="mt-1.5 text-xs text-slate-400">💾 {t('myNotesHint')}</p>
            </Repli>
          </section>
        </div>
      )}

      {tab === 'test' && <ThemeTest theme={theme} color={color} onExit={() => setTab('chapitres')} />}

      {tab === 'progression' && <ProgressionTab theme={theme} rec={rec} color={color} score={score} />}
    </div>
  )
}

// Une ligne qui se déplie : titre court, contenu seulement à la demande.
function Repli({ icone, titre, ouvert = false, children }) {
  const [open, setOpen] = useState(ouvert)
  return (
    <section className="card">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center gap-3 p-4 text-left">
        <span className="w-6 shrink-0 text-center text-lg" aria-hidden>{icone}</span>
        <span className="min-w-0 flex-1 font-semibold leading-snug">{titre}</span>
        <span className={`text-lg text-slate-300 transition ${open ? 'rotate-90' : ''}`} aria-hidden>›</span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </section>
  )
}

function ProgressionTab({ theme, rec, color, score }) {
  const t = useT()
  const gameLabel = useGameLabel()
  return (
    <div className="space-y-4">
      <div className="card p-5 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('themeMastery')}</p>
        <div className="my-1 text-4xl font-extrabold" style={{ color }}>{score}%</div>
        <Stars count={starsFromScore(score)} size="text-2xl" />
      </div>
      <div className="card p-5">
        <h3 className="mb-3 font-bold">{t('detailByGame')}</h3>
        <ul className="space-y-2.5">
          {(theme.games || []).map((g) => {
            const best = rec?.games?.[g.id]
            return (
              <li key={g.id} className="flex items-center gap-3">
                <span className="w-6 text-center">{g.icon || '🎲'}</span>
                <span className="flex-1 text-sm"><CourseText text={g.title} /><span className="ml-1 text-xs text-slate-400">· {gameLabel(g.type)}</span></span>
                <div className="w-24"><ProgressBar value={best || 0} color={color} /></div>
                <span className="w-10 text-right text-xs font-semibold">{best != null ? best + '%' : '—'}</span>
              </li>
            )
          })}
          <li className="flex items-center gap-3 border-t border-slate-100 pt-2.5 dark:border-slate-800">
            <span className="w-6 text-center">🏁</span>
            <span className="flex-1 text-sm font-semibold">{t('tabTest')}</span>
            <div className="w-24"><ProgressBar value={rec?.quiz || 0} color={color} /></div>
            <span className="w-10 text-right text-xs font-semibold">{rec?.quiz != null ? rec.quiz + '%' : '—'}</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
