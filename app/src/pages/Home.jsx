import MissionCard from '../components/MissionCard.jsx'
import { CourseText } from '../components/Course.jsx'
import { Link, Navigate } from 'react-router-dom'
import { getChapter } from '../data/index.js'
import { subjectsForTrack, getLevel, getSpecialty } from '../data/tracks.js'
import { useStore, subjectScore } from '../store.jsx'
import { nextMilestone } from '../data/rewards.js'
import { ProgressBar, Icon } from '../components/ui.jsx'
import OutilsAccueil from '../components/OutilsAccueil.jsx'
import AccueilProf from '../components/AccueilProf.jsx'
import { useT, usePublicText } from '../i18n.js'

import { readPosition } from '../data/readingPosition.js'
import { todayKey } from '../data/srs.js'
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
  const level = state.track.level

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
  try { dateLabel = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()) } catch { /* ignore */ }

  // Couleur du bandeau d'accueil : personnalisable (customTheme.banner). On la
  // fond dans une base sombre pour garder le texte clair toujours lisible, quelle
  // que soit la teinte choisie. Sans choix, on garde l'écrin « sombre & or ».
  const banner = state.customTheme?.banner || null
  const bannerBg = banner
    ? `linear-gradient(140deg, color-mix(in srgb, ${banner} 30%, #14110c) 0%, color-mix(in srgb, ${banner} 14%, #1b1610) 55%, #14110c 100%)`
    : 'linear-gradient(135deg, #172d30 0%, #24423f 100%)'

  return (
    <div className="home-page animate-lux space-y-7">
      <section className="home-hero" style={{ background: bannerBg }}>
        <div className="home-hello">
          {(photo || mono) && <span className="monogram home-avatar" aria-hidden>{photo ? <img src={photo} alt="" /> : mono}</span>}
          <div className="min-w-0 flex-1">
            <p className="kicker home-track">{tr(getLevel(state.track.level)?.name || '')}{state.track.level === 'terminale-stmg' && <> · {tr(getSpecialty(state.track.level, state.track.specialty)?.name || '')}</>}</p>
            <h1 className="font-display">{greeting}{firstName ? <>, <span>{firstName}</span></> : ''}</h1>
            {dateLabel && <p className="home-date">{dateLabel}</p>}
          </div>
          <span className="home-level-tag">{t('level')} {derived.level}<span>{state.xp.toLocaleString(state.lang || 'fr')} XP</span></span>
        </div>
        <div className="home-stage">
          <div className="home-invitation">
            <p className="home-overline">Ton rendez-vous avec le progrès</p>
            <h2 className="font-display">Un petit pas aujourd’hui.<em>Un peu plus loin demain.</em></h2>
            <p className="home-intro">Une notion comprise, une question réussie : chaque petit pas prépare la suite.</p>
            <div className="home-hero-actions">
              {realSubjects.length > 0 && <Link to="/seance" className="home-main-action"><Icon.Play size={17} /> Ma séance du jour <span aria-hidden>↗</span></Link>}
              <Link to="/cours" className="home-courses-action">Voir tous les cours <span aria-hidden>→</span></Link>
            </div>
          </div>
          <MissionCard resumeUrl={last?resumeUrl:null} resumeTitle={recent?position.chapterTitle || last?.short || last?.name:last?.short || last?.name}/>
        </div>
        <p className="home-hero-note"><span aria-hidden>✦</span> Aujourd’hui, avance à ton rythme.</p>
      </section>

      <section className="home-ritual" aria-labelledby="home-ritual-title">
        <div className="home-section-heading"><div><p className="kicker">Les petites habitudes font les grands progrès</p><h2 id="home-ritual-title" className="font-display">Trouve ton rythme.</h2></div><Link to="/programme">Mes objectifs <span aria-hidden>↗</span></Link></div>
        <div className="home-ritual-grid">
      {/* Série de connexion : récompenses XP pour les jours d'affilée */}
      {(() => {
        const streak = state.streak?.count || 0
        const claimedToday = state.streak?.last === todayKey()
        const nm = nextMilestone(streak)
        return (
          <section className="card card-lux flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-2xl" style={{ backgroundColor: 'color-mix(in srgb, var(--c-accent) 16%, transparent)' }} aria-hidden>🔥</span>
              <div className="min-w-0">
                <p className="font-display font-semibold leading-tight">{t('loginStreak')} · {streak} {t(streak > 1 ? 'daysStreakP' : 'daysStreakS')}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{claimedToday ? `✓ ${t('rewardClaimedToday')}` : t('rewardComeToday')}</p>
              </div>
            </div>
            {nm && (
              <div className="home-streak-goal">
                <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="truncate">{nm.icon} {nm.day} {t(nm.day > 1 ? 'daysStreakP' : 'daysStreakS')} · <span className="font-semibold" style={{ color: 'var(--c-accent-texte)' }}>+{nm.xp} XP</span></span>
                  <span className="shrink-0 pl-2">{nm.daysLeft} {t(nm.daysLeft > 1 ? 'daysLeftP' : 'daysLeftS')}</span>
                </div>
                <ProgressBar value={nm.pct} color="var(--c-accent)" />
              </div>
            )}
          </section>
        )
      })()}

      {/* Défi du jour */}
      {(() => {
        const done = state.dailyChallenge?.last === todayKey()
        const dstreak = state.dailyChallenge?.streak || 0
        return (
          <Link to="/defi" className="card card-lux flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-2xl" style={{ backgroundColor: 'color-mix(in srgb, var(--c-accent) 16%, transparent)' }} aria-hidden>⚡</span>
            <div className="min-w-0 flex-1">
              <p className="font-display font-semibold leading-tight">{t('dailyChallenge')}{dstreak > 0 ? ` · 🔥 ${dstreak}` : ''}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{done ? `✅ ${t('challengeDoneToday')}` : t('challengeCardCta')}</p>
            </div>
            {done ? (
              <span className="chip shrink-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">✓</span>
            ) : (
              <span className="chip shrink-0 text-white" style={{ background: 'var(--c-accent-fort)' }}>{t('challengeStart')}</span>
            )}
          </Link>
        )
      })()}

        </div>
      </section>

    <section className="home-summary home-bottom-grid">
      <div className="home-progress-card"><span className="home-eyebrow">Tes efforts prennent forme</span><div className="home-progress-heading"><h2>Chaque séance compte.</h2></div><div className="home-stat-grid"><div><strong>{progress}<small>%</small></strong><span>Progression de ta filière</span></div><div><strong>{mastered}</strong><span>Thèmes maîtrisés</span></div><div><strong>{state.streak?.count || 0}</strong><span>{t('streakDays')}</span></div></div><p>Chaque chapitre utilise jusqu’à trois de tes meilleurs exercices. La moyenne des chapitres donne la maîtrise du thème ; un meilleur résultat au test du thème peut la relever. Les XP et les séances de formules ne modifient pas cette maîtrise.</p><div className="home-progress-footer"><span>{t('level')} {derived.level} · {state.xp.toLocaleString(state.lang || 'fr')} XP</span><Link to="/badges">{t('badges')} →</Link></div></div>
      <div className="home-community-card"><span className="home-eyebrow">Mieux avancer, ensemble</span><h2>Ton coin à toi.</h2><div className="home-community-links"><Link to="/classe"><span aria-hidden>◉</span>{t('myClass')}<span aria-hidden>→</span></Link><Link to="/amis"><span aria-hidden>♧</span>{t('friends')}<span aria-hidden>→</span></Link><Link to="/boutique"><span aria-hidden>✦</span>{t('shop')}<span aria-hidden>→</span></Link></div></div>
    </section>

      <OutilsAccueil />

      <p className="pt-1 text-center text-xs text-slate-400">
        {level === 'terminale-stmg' ? t('courseBasedNote') : t('savedOnDevice')}
      </p>
    </div>
  )
}
