import './CourseStudio.css'
import { missionMessages } from '../i18n/missions.js'
import PracticeStudio from '../components/PracticeStudio.jsx'
import ChapterControl from '../components/ChapterControl.jsx'
import CourseTutor from '../components/CourseTutor.jsx'
import { courseText } from '../data/examenPersonnalise.js'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import Introuvable from './Introuvable.jsx'
import { getChapter, getSubject, themeChapters, jeuxDuChapitre, sectionDefinitions } from '../data/index.js'
import { useStore, useThemeTimer } from '../store.jsx'
import { PaginatedCourse, CourseText, saveFiche } from '../components/Course.jsx'
import GameHost from '../games/GameHost.jsx'
import SignalerErreur from '../components/SignalerErreur.jsx'
import { useT, useGameLabel } from '../i18n.js'

export default function Chapter() {
  const { sid, tid, cidx } = useParams()
  const subject = getSubject(sid)
  const theme = getChapter(tid)
  const { state, saveDeck, setLastChapter } = useStore()
  const t = useT()
  const navigate = useNavigate()
  const gameLabel = useGameLabel()
  const [activeGame, setActiveGame] = useState(null)
  const [memoryOpen,setMemoryOpen]=useState(false)
  const [tab, setTab] = useState('cours') // Cours / Définitions / Exercices
  useThemeTimer(tid) // mesure le temps de révision passé sur ce thème
  // Un jeu ouvert doit s'afficher depuis son début, pas depuis la position de la liste.
  useEffect(() => { if (activeGame) window.scrollTo(0, 0) }, [activeGame])

  // Génération stable par visite : on ne régénère (et re-mélange) les exercices
  // qu'au changement de thème/chapitre, pas à chaque rendu. Une nouvelle visite
  // = un nouveau tirage → jamais exactement les mêmes exercices.
  const chapters = useMemo(() => (theme ? themeChapters(theme) : []), [theme, cidx]) // eslint-disable-line react-hooks/exhaustive-deps
  const chapter = chapters[Number(cidx)] || null
  // Même numérotation que la liste du thème : par catégorie (cours, méthodes, études de cas).
  const catDe = (c) => (!c?.section?.group || c.section.group === 'approf' ? 'cours' : c.section.group)
  const memeCategorie = chapters.filter((c) => catDe(c) === catDe(chapter))
  const rangDansCategorie = Math.max(1, memeCategorie.indexOf(chapter) + 1)
  const catKey = { cours: 'catCourse', methode: 'catMethod', cas: 'catCases' }[catDe(chapter)] || 'chapter'

  // Jeux affichés : ceux du chapitre + des flashcards générées à partir des
  // notions de la section (disponibles partout, pas seulement dans l'app).
  const games = useMemo(() => jeuxDuChapitre(chapter, theme), [chapter, theme])

  // Nouveau chapitre : on referme tout jeu ouvert, on revient à l'onglet Cours
  // et on remonte en haut.
  useEffect(() => {
    if (subject && theme) setLastChapter(sid, tid)
    setActiveGame(null)
    setTab('cours')
    setMemoryOpen(false)
    window.scrollTo(0, 0)
  }, [tid, cidx])

  if (!subject) return <Introuvable />
  if (!theme) return <Introuvable retour={{ to: `/subject/${sid}`, label: subject.short || subject.name }} />
  if (!chapter) return <Introuvable retour={{ to: `/subject/${sid}/theme/${tid}`, label: theme.short || theme.name }} />
  const color = subject.color
  const i = chapter.idx
  const prev = chapters[i - 1]
  const next = chapters[i + 1]
  const rec = state.chapters[tid]
  const defBox = sectionDefinitions(chapter.section, tid, sid, chapter.idx)
  const TABS = [
    { id: 'cours', icon: '📖', key: 'tabLesson' },
    { id: 'defs', icon: '📚', key: 'tabDefs' },
    { id: 'exos', icon: '🎮', key: 'tabExercises' },
  ]

  if (activeGame) {
    return (
      <div className="space-y-4">
        <GameHost game={activeGame} chapterId={tid} color={color} onExit={() => {
          // Au clavier, le focus revient sur l'exercice qu'on vient de quitter.
          const id = activeGame.id
          setActiveGame(null)
          requestAnimationFrame(() => document.querySelector(`[data-jeu="${CSS.escape(id)}"]`)?.focus())
        }} />
      </div>
    )
  }

  const printDate = new Date().toLocaleDateString(state.lang || 'fr', { day: 'numeric', month: 'long', year: 'numeric' })
  const studentName = `${state.profile?.firstName || ''} ${state.profile?.lastName || ''}`.trim()

  return (
    <div className="chapter-page course-studio animate-lux space-y-4">
      {/* En-tête visible uniquement à l'impression (fiche de révision PDF) */}
      <div className="print-only print-header">
        <div className="print-title">RévizSTMG — {t('revisionSheet')}</div>
        <div>{theme.name} — {chapter.title}{studentName ? ` · ${studentName}` : ''} · {printDate}</div>
      </div>

      <nav className="chapter-trail no-print text-xs text-slate-500 dark:text-slate-400">
        <Link to={`/subject/${sid}`} className="hover:underline" style={{ color }}>{subject.name}</Link>
        <span className="mx-1">›</span>
        <Link to={`/subject/${sid}/theme/${tid}`} className="hover:underline" style={{ color }}>{theme.short || t('theme')}</Link>
        <span className="mx-1">›</span>
        <span className="font-semibold">{t('chapter')} {i + 1}</span>
      </nav>

      <header className="page-hero page-hero-compact flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--editorial-gold)' }}><CourseText text={theme.name} /> · {t(catKey)} {rangDansCategorie}/{memeCategorie.length}</p>
          <h1 className="font-display text-2xl font-medium leading-tight"><CourseText text={chapter.title} /></h1>
        </div>
        <div className="chapter-hero-actions no-print flex shrink-0 items-center gap-1.5">
          <button
            onClick={saveFiche}
            aria-label={t('savePdf')}
            title={t('savePdf')}
            className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-base text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            🖨️
          </button>
          <Link
            to={`/subject/${sid}/theme/${tid}`}
            aria-label={t('backToChapters')}
            title={t('backToChapters')}
            className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-lg text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            ✕
          </Link>
        </div>
      </header>

      {/* Onglets : Cours · Définitions · Exercices — pour ne rien empiler */}
      <div className="study-tabs no-print sticky top-[52px] z-30 -mx-4 border-b border-slate-200 bg-slate-50/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex gap-1">
          {TABS.map((tb) => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`flex-1 border-b-2 px-2 py-2.5 text-sm font-semibold transition ${tab === tb.id ? 'text-slate-900 dark:text-white' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              style={tab === tb.id ? { borderColor: color } : undefined}
              aria-current={tab === tb.id}
            >
              <span className="mr-1" aria-hidden>{tb.icon}</span>
              <span>{t(tb.key)}</span>
              {tb.id === 'exos' && games.length > 0 && <span className="ml-1 text-xs opacity-60">{games.length}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ONGLET COURS — lecteur paginé, épuré (imprimé dans la fiche PDF) */}
      <div className={`${tab === 'cours' ? '' : 'hidden'} print-show`}>
        <PaginatedCourse key={`${state.account?.id || "trial"}:${tid}:${chapter.idx}`}
          sec={chapter.section}
          color={color}
          themeId={tid}
          subjectId={sid}
          sectionIdx={chapter.idx}
          prevLabel={prev ? t('previous') : null}
          onPrev={prev ? () => navigate(`/subject/${sid}/theme/${tid}/chapter/${prev.idx}`) : null}
        />
        <CourseTutor key={`${state.account?.id || 'trial'}:${chapter.id}`} course={{id:chapter.id,title:chapter.title,subject:subject.name,level:subject.niveau==='premiere'?'premiere':'terminale',text:courseText(chapter.section)}} />
        <div className="no-print mt-4"><button type="button" className="btn-primary w-full" onClick={()=>{setTab('exos');requestAnimationFrame(()=>document.querySelector('[data-chapter-control]')?.scrollIntoView({block:'start'}))}}>Questions type de contrôle →</button></div>
        <div className="no-print mt-4 text-center">
          <SignalerErreur themeId={tid} exercice={`Cours : ${chapter.title || ''}`} defaut="cours" libelle="Une erreur dans ce cours ? Signale-la" />
        </div>
      </div>

      {/* ONGLET DÉFINITIONS (imprimé sauf si le tableau du cours les contient déjà) */}
      <div className={`${tab === 'defs' ? '' : 'hidden'} ${defBox.skip ? 'no-print' : 'print-show'}`}>
        {defBox.defs.length ? (
          <section className="definition-studio card p-5">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">📚 {t('keyDefs')}</h2>
            <dl className="definition-grid">
              {defBox.defs.map((d, k) => (
                <div key={k} className="definition-entry">
                  <dt className="definition-term font-display font-semibold"><span className="definition-number no-print" aria-hidden>{String(k+1).padStart(2,'0')}</span><CourseText text={d.term} /></dt>
                  <dd className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300"><CourseText text={d.def} /></dd>
                </div>
              ))}
            </dl>
          </section>
        ) : (
          <p className="card p-5 text-sm text-slate-500 dark:text-slate-400">{t('noDefsHere')}</p>
        )}
      </div>

      {/* ONGLET EXERCICES (jamais imprimé) */}
      <div className={`${tab === 'exos' ? 'space-y-2.5' : 'hidden'} no-print`}>
        <Link to={`/missions/${sid}/${tid}/${chapter.idx}`} className="chapter-challenge card flex items-center justify-between gap-3 p-5 font-semibold">
          <span>✦ {(missionMessages[state.lang] || missionMessages.fr).boss}</span><span aria-hidden>→</span>
        </Link>
        <PracticeStudio course={{id:chapter.id,title:chapter.title,subject:subject.name,level:subject.niveau==='premiere'?'premiere':'terminale',text:courseText(chapter.section)}} themeId={tid} index={chapter.idx} color={color}/>
        {(() => {
          const deck = games.find((g) => g.type === 'flashcard')
          if (!deck) return null
          const saved = (state.savedDecks || []).some((d) => d.id === deck.id)
          return (
            <section className="chapter-deck card card-lux p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-xl" style={{ backgroundColor: color + '22' }}>🃏</span>
                <div className="min-w-0 flex-1">
                  <p className="font-display font-semibold leading-tight">{t('downloadDeckTitle')}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{deck.cards.length} {t('cardsCount')} · {t('downloadDeckHint')}</p>
                </div>
                <button
                  onClick={() => saveDeck({ id: deck.id, title: `${theme.short || theme.name} · ${chapter.title}`, subjectId: sid, themeId: tid, color, cards: deck.cards })}
                  disabled={saved}
                  className="btn-primary shrink-0 !min-h-0 !py-2 text-sm disabled:opacity-60"
                  style={{ backgroundColor: saved ? undefined : color }}
                >
                  {saved ? `✓ ${t('deckSaved')}` : `⬇️ ${t('downloadDeck')}`}
                </button>
              </div>
              {saved && (
                <Link to="/revision" className="mt-3 flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-semibold" style={{ backgroundColor: color + '18', color }}>
                  <span>📚 {t('deckSavedWhere')}</span><span aria-hidden>→</span>
                </Link>
              )}
            </section>
          )
        })()}
        <details className="chapter-memorisation" open={memoryOpen} onToggle={e=>setMemoryOpen(e.currentTarget.open)}><summary>📖 Les {games.length} jeux du chapitre : mémoriser les repères</summary><p className="mt-2 text-sm">Les jeux courts pour retenir les termes et les phrases du cours. Choisis un format plutôt que de tous les enchaîner.</p>
        <h2 className="exercise-shelf-title font-display">{t('gamesOfChapter')}</h2>
        <div className="chapter-exercise-grid">{games.length > 0 ? games.map((g, gameIndex) => {
          const best = rec?.games?.[g.id]
          return (
            <button
              key={g.id}
              data-jeu={g.id}
              onClick={() => setActiveGame(g)}
              className="chapter-exercise-card card flex w-full items-center gap-3 p-4 text-start transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-xl" style={{ backgroundColor: color + '22' }}>{g.icon || '🎲'}<small aria-hidden>{String(gameIndex+1).padStart(2,'0')}</small></span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold leading-tight"><CourseText text={g.title} /></span>
                <span className="block text-xs text-slate-400">{gameLabel(g.type)}</span>
              </span>
              {best != null ? (
                <span className="chip bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">★ {best}%</span>
              ) : (
                <span className="chip bg-slate-100 text-slate-400 dark:bg-slate-800">{t('new')}</span>
              )}
              <span className="text-slate-300" aria-hidden>›</span>
            </button>
          )
        }) : <p className="card p-5 text-center text-sm text-slate-500 dark:text-slate-400">{t('gamesOfChapter')} —</p>}</div>
        </details>
        <ChapterControl key={`${state.account?.id || 'trial'}:${chapter.id}`} course={{id:chapter.id,title:chapter.title,subject:subject.name,level:subject.niveau==='premiere'?'premiere':'terminale',text:courseText(chapter.section)}} />
      </div>

      {/* Navigation entre chapitres — le lecteur Cours a sa propre pagination,
          on ne l'affiche donc que pour les onglets Définitions / Exercices. */}
      {tab !== 'cours' && (
        <div className="no-print flex items-center justify-between gap-2 pt-1">
          {prev ? (
            <Link to={`/subject/${sid}/theme/${tid}/chapter/${prev.idx}`} className="btn-ghost !min-h-0 flex-1 !py-2.5 text-sm">← {t('previous')}</Link>
          ) : <span className="flex-1" />}
          {next ? (
            <Link to={`/subject/${sid}/theme/${tid}/chapter/${next.idx}`} className="btn-primary !min-h-0 flex-1 !py-2.5 text-sm text-white" style={{ backgroundColor: color }}>{t('nextChapter')} →</Link>
          ) : (
            <Link to={`/subject/${sid}/theme/${tid}?tab=test`} className="btn-primary !min-h-0 flex-1 !py-2.5 text-sm text-white" style={{ backgroundColor: color }}>{t('takeTest')} 🏁</Link>
          )}
        </div>
      )}

      <p className="print-footer">
        {state.profile?.firstName ? `Fiche de révision de ${state.profile.firstName}${state.profile.lastName ? ' ' + state.profile.lastName : ''} · ` : ''}
        RévizSTMG · {theme.name} — {chapter.title} (contenu généré avec l’aide de l’IA, à recouper avec le cours officiel).
      </p>
    </div>
  )
}
