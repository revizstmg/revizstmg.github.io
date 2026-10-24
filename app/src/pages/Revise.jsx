import { nextMissionTarget, missionUrl } from '../data/missions.js'
import { missionMessages } from '../i18n/missions.js'
import { chaptersForLanguages } from '../data/studyLanguages.js'
import RevisionPath from '../components/RevisionPath.jsx'
import './Revise.css'
import { revisionMessages } from '../i18n/revision.js'
import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { reviewQueue } from '../data/study.js'
import { subjectsForTrack } from '../data/tracks.js'
import { ProgressBar } from '../components/ui.jsx'
import AudioReview from '../components/AudioReview.jsx'
import { encodeDeck, decodeDeck } from '../deckShare.js'
import { useT } from '../i18n.js'

// Étiquette d'état d'un thème commencé (jamais « nouveau » ici : on ne liste que
// ce que l'élève a déjà travaillé).
const REASON = {
  due: { key: 'reasonDue', bg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300', icon: '⏰' },
  weak: { key: 'reasonWeak', bg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300', icon: '⚠️' },
  review: { key: 'reasonReview', bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300', icon: '✅' },
}

// Sans filière (élève déconnecté), retour à l'accueil. Le test se fait ici, avant
// tout hook de la page : React exige les mêmes hooks à chaque affichage, sinon la
// déconnexion depuis cette page laisse un écran blanc.
export default function Revise() {
  const { state } = useStore()
  if (!state.track) return <Navigate to="/" replace />
  return <RevisePage />
}

function RevisePage() {
  const { state, removeDeck, saveDeck } = useStore()
  const t = useT()
  const m = revisionMessages[state.lang] || revisionMessages.fr
  const navigate = useNavigate()
  const [pathMode,setPathMode] = useState(null)
  const [audio, setAudio] = useState(null)
  const [shareCode, setShareCode] = useState('')
  const [importCode, setImportCode] = useState('')
  const [importMsg, setImportMsg] = useState('')
  const [showImport, setShowImport] = useState(false)
  const queue = useMemo(() => reviewQueue(state, state.track), [state])
  // Un thème n'est « commencé » que si sa LEÇON a été travaillée directement :
  // un exercice du thème, ou le test du thème. Les activités transversales (bac
  // blanc, coach IA, défi, express) ne suffisent PAS à le faire apparaître ici.
  const CROSS = new Set(['exam', 'coach-ia', 'daily', 'express', 'sujet-bac', 'revision-acquis'])
  const hasRealLesson = (themeId) => {
    const rec = state.chapters[themeId]
    if (!rec) return false
    if (rec.worked) return true // le thème a été réellement travaillé
    // Compat anciennes données (avant le drapeau « worked ») : un vrai jeu du
    // chapitre suffit. On n'utilise PAS le score de quiz seul, qui pouvait venir
    // d'un bac blanc et remplissait « À réviser » de thèmes jamais étudiés.
    return Object.keys(rec.games || {}).some((id) => !CROSS.has(id))
  }
  const started = queue.filter((q) => hasRealLesson(q.themeId))
  const first = started[0] // le plus prioritaire à reprendre
  const hasStarted = started.length > 0
  const subjects = useMemo(() => subjectsForTrack(state.track).filter((s) => s && !s.comingSoon && (s.chapters || []).length).map(s => ['langues','p1-langues'].includes(s.id) ? { ...s, chapters: chaptersForLanguages(s.chapters, state.studyLanguages) } : s), [state.track, state.studyLanguages])
  const decks = state.savedDecks || []
  const share = async (deck) => {
    const code = encodeDeck(deck)
    if (!code) return
    try { if (navigator.share) { await navigator.share({ title: deck.title, text: code }); return } } catch { /* annulé */ }
    setShareCode(code)
  }
  const copyShare = async () => { try { await navigator.clipboard.writeText(shareCode) } catch { /* */ } }
  const doImport = () => {
    const deck = decodeDeck(importCode)
    if (!deck) { setImportMsg(t('importError')); return }
    saveDeck({ id: `import-${Date.now()}`, title: deck.title, subjectId: null, themeId: null, color: '#7c3aed', cards: deck.cards })
    setImportCode(''); setImportMsg(`✅ ${deck.title} (${deck.cards.length} ${t('cardsCount')})`)
  }

  if (pathMode) return <RevisionPath key={`${state.account?.id || 'trial'}:${state.track.level}:${state.track.specialty || ''}`} mode={pathMode} subjects={subjects} onBack={()=>setPathMode(null)} />

  return (
    <div className="revision-page animate-lux space-y-9">
      <header className="revision-hero">
        <div><p className="revision-eyebrow">{m.eyebrow}</p><h1 className="font-display">{t('reviseTab')}</h1><p className="revision-headline font-display">{m.headline}</p><p className="revision-intro">{m.intro}</p><dl className="revision-stats"><div><dt>{m.worked}</dt><dd>{started.length}</dd></div><div><dt>{m.errors}</dt><dd>{(state.erreurs || []).length}</dd></div><div><dt>{m.decks}</dt><dd>{decks.length}</dd></div></dl></div>
        <aside className="revision-session"><p className="revision-eyebrow">{m.sessionLabel}</p><h2 className="font-display">{m.sessionTitle}</h2><p>{m.sessionHelp}</p><Link to="/seance" className="revision-session-action">{m.sessionAction}<span aria-hidden>↗</span></Link></aside>
      </header>
      {(() => {const target=nextMissionTarget(state);const mm=missionMessages[state.lang] || missionMessages.fr;return target&&<Link to={missionUrl(target)} className="card flex items-center justify-between gap-4 p-5"><span><strong className="block font-display text-xl">{mm.title}</strong><span className="mt-1 block text-sm">{mm.time}</span></span><span aria-hidden>→</span></Link>})()}
      <section aria-labelledby="revision-methods" className="space-y-5">
        <div className="revision-section-heading"><p className="kicker">{m.chooseLabel}</p><h2 id="revision-methods" className="font-display text-3xl">{m.chooseTitle}</h2></div>
        <div className="revision-methods">
          {[{ id: '01', title: m.guided, help: m.guidedHelp, action: m.guidedAction, mode: 'follow', type: 'path' }, { id: '02', title: m.errorMode, help: m.errorHelp, action: m.errorAction, mode: 'errors', type: 'notes' }, { id: '03', title: m.cardsMode, help: m.cardsHelp, action: m.cardsAction, mode: 'acquired', type: 'cards' }].map(item => <article className={`revision-method revision-method-${item.type}`} key={item.id}>
            <div className="revision-preview" aria-hidden="true"><span className="revision-preview-number">{item.id}</span><div className="revision-paper"><span>RÉVIZSTMG</span><div className="revision-paper-rule" /><strong>{item.title}</strong><div className="revision-paper-lines" />{item.type === 'notes' && <i>✓ &nbsp; ✓ &nbsp; ✓</i>}</div>{item.type === 'cards' && <div className="revision-paper-back" />}</div>
            <div className="revision-method-body"><h3 className="font-display">{item.title}</h3><p>{item.help}</p><button type="button" onClick={()=>setPathMode(item.mode)} className="revision-method-action">{item.action}<span aria-hidden>↗</span></button></div>
          </article>)}
        </div>
      </section>
      <div className="revision-workspace"><div className="revision-practice space-y-7">
      {/* 1) REPRENDRE ce qu'on a commencé — ou COMMENCER si rien n'est commencé */}
      {hasStarted ? (
        <button
          onClick={() => navigate(`/subject/${first.subjectId}/theme/${first.themeId}`)}
          className="card card-lux flex w-full items-center gap-4 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl text-white" style={{ backgroundColor: 'var(--c-accent-fort)' }}>▶</span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold uppercase tracking-wide text-slate-600">{t('resumeTitle')}</span>
            <span className="block truncate font-display text-lg font-semibold leading-tight">{first.themeName}</span>
            <span className="block truncate text-xs text-slate-500 dark:text-slate-300">{first.subjectName}</span>
          </span>
          <span className="text-slate-300" aria-hidden>›</span>
        </button>
      ) : (
        <section className="card card-lux p-6 text-center">
          <div className="text-4xl" aria-hidden>🚀</div>
          <h2 className="mt-2 font-display text-xl font-semibold">{t('startTitle')}</h2>
          <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500 dark:text-slate-300">{t('startSub')}</p>
          {subjects[0] && (
            <button onClick={() => navigate(`/subject/${subjects[0].id}`)} className="btn-gold mt-4 w-full !py-3 text-base">
              📚 {t('startCourseBtn')}
            </button>
          )}
        </section>
      )}

      {/* 2) À RÉVISER — la liste des thèmes commencés (aucun « nouveau » ici) */}
      {hasStarted && (
        <section className="space-y-2.5">
          <h2 className="px-1 font-display text-lg font-semibold">🔁 {t('toReviseSection')}</h2>
          {started.slice(0, 3).map((item) => {
            const r = REASON[item.reason] || REASON.review
            return (
              <Link key={item.themeId} to={`/subject/${item.subjectId}/theme/${item.themeId}`} className="card flex items-center gap-3 p-3.5 transition hover:-translate-y-0.5 hover:shadow-md">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg" style={{ backgroundColor: item.color + '22' }} aria-hidden>{r.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{item.themeName}</span>
                  <span className="block text-xs text-slate-600">{item.subjectName}</span>
                </span>
                <span className="hidden w-14 sm:block"><ProgressBar value={item.score} color={item.color} /></span>
                <span className={`chip shrink-0 ${r.bg}`}>{item.reason === 'review' ? `${item.score}%` : t(r.key)}</span>
              </Link>
            )
          })}
        </section>
      )}

      </div><aside className="revision-library space-y-7"><div><p className="kicker">{m.library}</p><h2 className="mt-2 font-display text-2xl">{m.libraryTitle}</h2></div>
      {/* 4) MES FLASHCARDS */}
      <section id="revision-flashcards" className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-display text-lg font-semibold">🃏 {t('myDecks')}</h2>
          {decks.length > 0 && <span className="chip bg-slate-100 text-slate-500 dark:text-slate-300 dark:bg-slate-800">{decks.length}</span>}
        </div>
        {decks.length === 0 ? (
          <p className="px-1 text-sm text-slate-600">{t('noDeckYet')}</p>
        ) : (
          decks.map((d) => (
            <div key={d.id} className="card flex items-center gap-1 p-3">
              <button onClick={() => navigate(`/revision/deck/${d.id}`)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg" style={{ backgroundColor: (d.color || '#7c3aed') + '22' }} aria-hidden>🃏</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{d.title}</span>
                  <span className="block text-xs text-slate-600">{d.cards.length} {t('cardsCount')}</span>
                </span>
              </button>
              <button onClick={() => setAudio(d)} title={t('audioReview')} aria-label={t('audioReview')} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-600 transition hover:text-slate-700 dark:hover:text-slate-200">🔊</button>
              <button onClick={() => share(d)} title={t('shareDeck')} aria-label={t('shareDeck')} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-600 transition hover:text-slate-700 dark:hover:text-slate-200">📤</button>
              <button onClick={() => removeDeck(d.id)} title={t('remove')} aria-label={t('remove')} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-300 transition hover:text-rose-500">🗑</button>
            </div>
          ))
        )}
        {showImport ? (
          <div className="card p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">📥 {t('importDeck')}</p>
              <button onClick={() => setShowImport(false)} className="text-slate-600 transition hover:text-slate-600" aria-label={t('quit')}>✕</button>
            </div>
            <div className="flex gap-2">
              <input value={importCode} onChange={(e) => { setImportCode(e.target.value); setImportMsg('') }} aria-label={t('importDeck')} placeholder={t('importPlaceholder')} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none dark:border-slate-700" />
              <button onClick={doImport} disabled={!importCode.trim()} className="btn-primary shrink-0 !min-h-0 !py-2 text-sm disabled:opacity-40">{t('importBtn')}</button>
            </div>
            {importMsg && <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">{importMsg}</p>}
          </div>
        ) : (
          <button onClick={() => setShowImport(true)} className="w-full py-1 text-center text-xs text-slate-600 transition hover:text-slate-600">＋ {t('importDeck')}</button>
        )}
      </section>

      </aside></div>
      <section className="revision-bridge"><div><h2 className="font-display">{m.bridge}</h2><p>{m.bridgeHelp}</p></div><Link to="/bac-blanc" className="btn-gold">{m.bridgeAction} <span aria-hidden>↗</span></Link></section>
      {audio && <AudioReview items={audio.cards} color={audio.color || '#7c3aed'} title={audio.title} onClose={() => setAudio(null)} />}

      {shareCode && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 p-4 pt-16 backdrop-blur-sm" onClick={() => setShareCode('')}>
          <div role="dialog" aria-modal="true" aria-label={t('shareDeck')} className="card w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-display text-lg font-semibold">📤 {t('shareDeck')}</span>
              <button onClick={() => setShareCode('')} className="grid h-8 w-8 place-items-center rounded-full text-slate-600 hover:text-slate-700 dark:hover:text-slate-200" aria-label={t('quit')}>✕</button>
            </div>
            <p className="mb-2 text-xs text-slate-500 dark:text-slate-300">{t('shareHint')}</p>
            <textarea readOnly value={shareCode} onFocus={(e) => e.target.select()} rows={4} className="w-full resize-none rounded-xl border border-slate-200 bg-transparent p-3 font-mono text-xs outline-none dark:border-slate-700" />
            <button onClick={copyShare} className="btn-primary mt-3 w-full !min-h-0 !py-2 text-sm">📋 {t('copyCode')}</button>
          </div>
        </div>
      )}
    </div>
  )
}
