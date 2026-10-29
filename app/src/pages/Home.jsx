import { Link, Navigate } from 'react-router-dom'
import { getChapter } from '../data/index.js'
import { subjectsForTrack, getLevel, getSpecialty } from '../data/tracks.js'
import { useStore, subjectScore } from '../store.jsx'
import { ProgressBar } from '../components/ui.jsx'
import { CourseText } from '../components/Course.jsx'
import AccueilProf from '../components/AccueilProf.jsx'
import { useT, usePublicText } from '../i18n.js'

import { readPosition } from '../data/readingPosition.js'
import './Home.css'

export default function Home() {
  const { state, derived } = useStore()
  const t = useT(), tr = usePublicText()

  // Pas encore de filière choisie → retour à l'écran d'entrée.
  if (!state.track) return <Navigate to="/" replace />
  // Le professeur a son propre accueil : ses classes, pas celui d'un élève.
  if (state.account?.role === 'prof') return <AccueilProf />

  const subjects = subjectsForTrack(state.track)
  const realSubjects = subjects.filter((s) => !s.comingSoon)
  const trackProgress =
    realSubjects.length > 0
      ? Math.round(realSubjects.reduce((a, s) => a + subjectScore(state, s.id), 0) / realSubjects.length)
      : 0

  const position = readPosition(state.account?.id)
  const recent = position && realSubjects.some((s) => s.id === position.subjectId) ? getChapter(position.themeId) : null
  const previous = state.lastChapter ? getChapter(state.lastChapter.chapterId) : null
  const last = recent || (previous && realSubjects.some((s) => s.id === previous.subjectId) ? previous : null)
  const resumeUrl = recent ? `/subject/${position.subjectId}/theme/${position.themeId}/chapter/${position.chapterIndex}` : last ? `/subject/${last.subjectId}/theme/${last.id}` : '/revision'
  const progress = trackProgress
  const mastered = realSubjects.flatMap((s) => s.chapters).filter((ch) => derived.byChapter[ch.id] >= 90).length

  // Salutation personnalisée selon l'heure et le prénom de l'élève.
  const firstName = state.profile?.firstName?.trim() || ''
  const lastName = state.profile?.lastName?.trim() || ''
  const initials = ((firstName[0] || '') + (lastName[0] || '')).toUpperCase() || (firstName[0] || '').toUpperCase()
  const mono = state.customTheme?.avatar || initials
  const photo = state.profile?.photo || ''
  const hour = new Date().getHours()
  const greeting = t(hour < 6 ? 'greetingNight' : hour < 12 ? 'greetingMorning' : hour < 18 ? 'greetingAfternoon' : 'greetingEvening')
  const locale = ({ fr: 'fr-FR', en: 'en-GB', es: 'es-ES', it: 'it-IT', ar: 'ar-SA', de: 'de-DE' })[state.lang] || 'fr-FR'
  let dateLabel = ''
  try { dateLabel = new Intl.DateTimeFormat(locale, { calendar: 'gregory', numberingSystem: 'latn', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()) } catch { /* ignore */ }

  // Couleur du bandeau d'accueil : personnalisable (customTheme.banner). On la
  // fond dans une base sombre pour garder le texte clair toujours lisible, quelle
  // que soit la teinte choisie. Sans choix, on garde l'écrin « sombre & or ».
  const banner = state.customTheme?.banner || null
  const bannerBg = banner
    ? `color-mix(in srgb, ${banner} 22%, #172d30)`
    : '#172d30'

  return (
    <div className="home-page home-simple space-y-6">
      <section className="home-hero" style={{ background: bannerBg }}>
        <div className="home-hello">
          {(photo || mono) && <span className="monogram home-avatar" aria-hidden>{photo ? <img src={photo} alt="" /> : mono}</span>}
          <div className="min-w-0 flex-1">
            <p className="home-track">{tr(getLevel(state.track.level)?.name || '')}{state.track.level === 'terminale-stmg' && <> · {tr(getSpecialty(state.track.level, state.track.specialty)?.name || '')}</>}</p>
            <h1 className="font-display">{greeting}{firstName ? <>, <span>{firstName}</span></> : ''}</h1>
            {dateLabel && <p className="home-date">{dateLabel}</p>}
          </div>
        </div>
        <div className="home-start">
          <div>
            <h2 className="font-display">{last ? t('resumeTitle') : t('startTitle')}</h2>
            <p>{last ? <CourseText text={recent ? position.chapterTitle || last.short || last.name : last.short || last.name} /> : t('startSub')}</p>
          </div>
          <Link to={last ? resumeUrl : '/cours'} className="home-main-action">{last ? t('resume') : t('startCourseBtn')} <span aria-hidden>→</span></Link>
        </div>
      </section>

      <section className="home-destinations" aria-label={t('planTitle')}>
        <Link to="/cours" className="home-destination">
          <span className="home-destination-icon" aria-hidden>📚</span>
          <div><h2>{t('coursTab')}</h2><p>Voir tous les cours</p></div>
          <span className="home-destination-arrow" aria-hidden>→</span>
        </Link>
        <Link to="/revision" className="home-destination">
          <span className="home-destination-icon" aria-hidden>🧠</span>
          <div><h2>{t('training')}</h2><p>{t('trainingDesc')}</p></div>
          <span className="home-destination-arrow" aria-hidden>→</span>
        </Link>
        <Link to="/classe" className="home-destination">
          <span className="home-destination-icon" aria-hidden>🏫</span>
          <div><h2>{t('myClass')}</h2><p>Retrouve ta classe et ses activités.</p></div>
          <span className="home-destination-arrow" aria-hidden>→</span>
        </Link>
      </section>

      <section className="home-progress-card" aria-labelledby="home-progress-title">
        <div className="home-progress-heading"><div><p className="home-eyebrow">Tes efforts prennent forme</p><h2 id="home-progress-title">Chaque séance compte.</h2></div><Link to="/moi">Mes progrès <span aria-hidden>→</span></Link></div>
        <div className="home-stat-grid">
          <div><strong>{progress}<small>%</small></strong><span>Progression de ta filière</span></div>
          <div><strong>{mastered}</strong><span>Thèmes maîtrisés</span></div>
          <div><strong>{state.streak?.count || 0}</strong><span>{t('streakDays')}</span></div>
        </div>
        <ProgressBar value={progress} color="var(--c-accent-texte)" />
        <div className="home-progress-footer"><span>{t('level')} {derived.level} · {state.xp.toLocaleString(state.lang || 'fr')} XP</span><Link to="/badges">{t('badges')} →</Link></div>
        <details className="home-progress-explanation"><summary>Comprendre ma progression</summary><p>Chaque chapitre utilise jusqu’à trois de tes meilleurs exercices. La moyenne des chapitres donne la maîtrise du thème ; un meilleur résultat au test du thème peut la relever. Les XP et les séances de formules ne modifient pas cette maîtrise.</p></details>
      </section>
    </div>
  )
}
