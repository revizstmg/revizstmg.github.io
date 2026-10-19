import { Link, Navigate } from 'react-router-dom'
import { CourseText } from '../components/Course.jsx'
import { getChapter } from '../data/index.js'
import { subjectsForTrack, getLevel, getSpecialty } from '../data/tracks.js'
import { reviewQueue } from '../data/study.js'
import { readPosition } from '../data/readingPosition.js'
import { useStore, subjectScore } from '../store.jsx'
import { useT, usePublicText } from '../i18n.js'
import './Home.css'

function Shortcut({ to, icon, title, children }) {
  return <Link to={to} className="home-shortcut"><span className="home-shortcut-icon" aria-hidden>{icon}</span><span><strong>{title}</strong><small>{children}</small></span><span aria-hidden>→</span></Link>
}

export default function Home() {
  const { state, derived } = useStore()
  const t = useT(), tr = usePublicText()
  if (!state.track) return <Navigate to="/" replace />
  const subjects = subjectsForTrack(state.track)
  const available = subjects.filter((s) => !s.comingSoon)
  const next = reviewQueue(state, state.track)[0]
  const position = readPosition(state.account?.id)
  const recent = position && available.some((s) => s.id === position.subjectId) ? getChapter(position.themeId) : null
  const previous = state.lastChapter ? getChapter(state.lastChapter.chapterId) : null
  const last = recent || (previous && available.some((s) => s.id === previous.subjectId) ? previous : null)
  const resumeUrl = recent ? `/subject/${position.subjectId}/theme/${position.themeId}/chapter/${position.chapterIndex}` : last ? `/subject/${last.subjectId}/theme/${last.id}` : '/revision'
  const progress = available.length ? Math.round(available.reduce((n, s) => n + subjectScore(state, s.id), 0) / available.length) : 0
  const firstName = state.profile?.firstName?.trim() || ''
  const hour = new Date().getHours()
  const greeting = t(hour < 6 ? 'greetingNight' : hour < 12 ? 'greetingMorning' : hour < 18 ? 'greetingAfternoon' : 'greetingEvening')
  const date = new Intl.DateTimeFormat(state.lang || 'fr', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())
  const reasons = { due: 'C’est le bon moment pour revoir ce thème.', weak: 'Un point à consolider pour gagner en confiance.', new: 'Un nouveau thème à découvrir à ton rythme.', review: 'Une révision pour garder tes acquis bien en tête.' }
  const mastered = available.flatMap((s) => s.chapters).filter((ch) => derived.byChapter[ch.id] >= 90).length

  return <div className="home-dashboard">
    <header className="home-heading">
      <div><p className="home-eyebrow">Ton espace de révision</p><h1>{greeting}{firstName && <>, <span>{firstName}</span></>}<span className="home-greeting-dot" aria-hidden>.</span></h1><p className="home-track">{tr(getLevel(state.track.level)?.name || '')}{state.track.level === 'terminale-stmg' && <> · {tr(getSpecialty(state.track.level, state.track.specialty)?.name || '')}</>}</p></div>
      <div className="home-date"><span className="home-date-icon" aria-hidden>✦</span><span>{date}</span></div>
    </header>

    <section className="home-hero" aria-label="Ta prochaine révision" style={state.customTheme?.banner ? { '--home-hero-color': `color-mix(in srgb, ${state.customTheme.banner} 25%, #193f43)` } : undefined}>
      <div className="home-hero-copy">
        <span className="home-pill"><span aria-hidden>●</span> Un pas de plus, aujourd’hui</span>
        <h2>De petites séances.<br /><em>De grandes avancées.</em></h2>
        {next && <div className="home-recommendation"><p>{tr(next.reason === 'due' ? 'À revoir aujourd’hui' : next.reason === 'weak' ? 'Ton prochain progrès' : 'Pour commencer')}</p><h3><CourseText text={next.themeName} /></h3><span><CourseText text={next.subjectName} /> · {tr(reasons[next.reason])}</span></div>}
        <Link className="home-primary" to={next ? `/subject/${next.subjectId}/theme/${next.themeId}` : '/revision'}>Réviser ce thème <span aria-hidden>→</span></Link>
      </div>
      <div className="home-hero-art" aria-hidden="true">
        <div className="home-orbit home-orbit-one" /><div className="home-orbit home-orbit-two" />
        <div className="home-paper home-paper-back" />
        <div className="home-paper home-paper-front"><div className="home-paper-top"><span>RévizSTMG</span><span>✦</span></div><div className="home-paper-title">Tu en es<br /><em>capable.</em></div><div className="home-paper-lines"><i/><i/><i/></div><div className="home-paper-bottom"><span>Un cours à la fois.</span><span>→</span></div></div>
        <div className="home-art-stamp">✓ <span>Comprendre.<br />S’entraîner. Réussir.</span></div>
      </div>
    </section>

    <div className="home-follow-up">
      {last ? <Link to={resumeUrl} className="home-resume"><span className="home-mini-icon" aria-hidden>↶</span><span><small>On reprend ?</small><strong><CourseText text={recent ? position.chapterTitle || last.short || last.name : last.short || last.name} /></strong><span>{recent ? tr('Dernière fiche sur cet appareil.') : tr('Continuer ce thème.')}</span></span><span className="home-link-arrow" aria-hidden>→</span></Link> : <Link to="/programme" className="home-resume"><span className="home-mini-icon" aria-hidden>→</span><span><small>Un cap, un jour à la fois</small><strong>Ton programme jusqu’au bac</strong><span>Des objectifs pour savoir par où commencer.</span></span><span className="home-link-arrow" aria-hidden>→</span></Link>}
      <Link to="/revision" className="home-revision-link"><span aria-hidden>◎</span><span><strong>Réviser mes points faibles</strong><small>Retrouve tes priorités</small></span><span aria-hidden>→</span></Link>
    </div>

    <section className="home-subjects" aria-labelledby="home-subjects-title">
      <div className="home-section-heading"><div><p className="home-eyebrow">Le cœur de tes révisions</p><h2 id="home-subjects-title">{t('mySubjects')}</h2></div><Link to="/changer">{t('change')} <span aria-hidden>→</span></Link></div>
      <div className="home-subject-grid">{subjects.map((s, i) => {
        const pct = s.comingSoon ? 0 : subjectScore(state, s.id)
        const content = <><div className="home-subject-top"><span className="home-subject-icon" style={{ '--subject-color': s.color }} aria-hidden>{s.icon}</span><span className="home-subject-number" aria-hidden>{String(i + 1).padStart(2, '0')}</span></div><h3><CourseText text={s.name} /></h3><div className="home-subject-meta"><span>{s.chapters.length} {t('themesCount')}</span><span>{s.comingSoon ? t('comingSoon') : `${pct}%`}</span></div><div className="home-subject-progress" aria-hidden><i style={{ width: `${pct}%`, backgroundColor: s.color }}/></div></>
        return s.comingSoon ? <div className="home-subject is-unavailable" key={s.id}>{content}</div> : <Link className="home-subject" key={s.id} to={`/subject/${s.id}`}>{content}</Link>
      })}</div>
    </section>

    <section className="home-tools" aria-labelledby="home-tools-title"><div className="home-section-heading"><div><p className="home-eyebrow">À chaque besoin, son outil</p><h2 id="home-tools-title">Trouve ton rythme</h2></div></div><div className="home-tool-grid">
      <Shortcut to="/express" icon="◷" title={t('expressMode')}>Une courte séance pour avancer</Shortcut>
      <Shortcut to="/bac-blanc" icon="✎" title={t('mockExam')}>Entraîne-toi en conditions d’épreuve</Shortcut>
      <Shortcut to="/defi" icon="ϟ" title={t('dailyChallenge')}>{state.dailyChallenge?.last === new Date().toLocaleDateString('en-CA') ? t('challengeDoneToday') : 'Teste tes acquis du jour'}</Shortcut>
      <Shortcut to={state.track.level === 'premiere-stmg' ? '/etude-de-gestion' : '/grand-oral'} icon="◈" title={state.track.level === 'premiere-stmg' ? t('egTitle') : t('grandOral')}>Prépare ton projet, étape par étape</Shortcut>
    </div></section>

    <section className="home-bottom-grid">
      <div className="home-progress-card"><span className="home-eyebrow">Tes efforts prennent forme</span><div className="home-progress-heading"><h2>Chaque séance compte.</h2><span aria-hidden>→</span></div><div className="home-stat-grid"><div><strong>{progress}<small>%</small></strong><span>Progression de ta filière</span></div><div><strong>{mastered}</strong><span>Thèmes maîtrisés</span></div><div><strong>{state.streak?.count || 0}</strong><span>{t('streakDays')}</span></div></div><p>Ta progression est calculée à partir de tes résultats aux exercices.</p><div className="home-progress-footer"><span>{t('level')} {derived.level} · {state.xp.toLocaleString(state.lang || 'fr')} XP</span><Link to="/badges">{t('badges')} →</Link></div></div>
      <div className="home-community-card"><span className="home-eyebrow">Mieux avancer, ensemble</span><h2>Ton coin à toi.</h2><div className="home-community-links"><Link to="/classe"><span aria-hidden>◉</span>{t('myClass')}<span aria-hidden>→</span></Link><Link to="/amis"><span aria-hidden>♧</span>{t('friends')}<span aria-hidden>→</span></Link><Link to="/boutique"><span aria-hidden>✦</span>{t('shop')}<span aria-hidden>→</span></Link></div></div>
    </section>

    <details className="home-more"><summary>Tous tes outils <span aria-hidden>＋</span></summary><div className="home-more-grid"><Link to="/coach-ia">Entraînement personnalisé</Link><Link to="/coach">Minuteur de concentration</Link><Link to="/programme">{t('studyPlan')}</Link><Link to="/formules">{t('formulasTitle')}</Link><Link to="/fiches-photo">{t('photoFiche')}</Link><Link to="/favoris">{t('favorites')}</Link></div></details>
    <p className="home-signature">Un peu chaque jour. Beaucoup plus loin. <span aria-hidden>✦</span></p>
  </div>
}
