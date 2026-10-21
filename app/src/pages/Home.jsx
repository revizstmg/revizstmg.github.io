import { CourseText } from '../components/Course.jsx'
import { Link, Navigate } from 'react-router-dom'
import { getChapter } from '../data/index.js'
import { subjectsForTrack, getLevel, getSpecialty } from '../data/tracks.js'
import { useStore, subjectScore } from '../store.jsx'
import { nextMilestone } from '../data/rewards.js'
import { ProgressBar, Ring, Icon } from '../components/ui.jsx'
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
  const locale = ({ fr: 'fr-FR', en: 'en-GB', es: 'es-ES', it: 'it-IT', ar: 'ar-SA' })[state.lang] || 'fr-FR'
  let dateLabel = ''
  try { dateLabel = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()) } catch { /* ignore */ }

  // Couleur du bandeau d'accueil : personnalisable (customTheme.banner). On la
  // fond dans une base sombre pour garder le texte clair toujours lisible, quelle
  // que soit la teinte choisie. Sans choix, on garde l'écrin « sombre & or ».
  const banner = state.customTheme?.banner || null
  const bannerTint = banner || 'var(--c-accent)'
  const bannerBg = banner
    ? `linear-gradient(140deg, color-mix(in srgb, ${banner} 46%, #14110c) 0%, color-mix(in srgb, ${banner} 22%, #1b1610) 55%, #14110c 100%)`
    : 'linear-gradient(135deg, #172d30 0%, #24423f 100%)'

  return (
    <div className="animate-lux space-y-7">
      {/* Écrin personnalisé — cover sombre & or, à l'effigie de l'accueil */}
      <section
        className="identity-hero card-lux relative overflow-hidden rounded-[1.6rem] p-6 text-[#f4ecd8] sm:p-8"
        style={{ background: bannerBg, border: `1px solid color-mix(in srgb, ${bannerTint} 30%, transparent)` }}
      >
        <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full" style={{ background: `radial-gradient(circle, color-mix(in srgb, ${bannerTint} 32%, transparent), transparent 70%)` }} />
        <span aria-hidden className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full" style={{ background: `radial-gradient(circle, color-mix(in srgb, ${bannerTint} 18%, transparent), transparent 70%)` }} />

        <div className="relative flex items-center gap-4 sm:gap-5">
          {(photo || mono) && (
            <span className="monogram h-16 w-16 shrink-0 overflow-hidden text-2xl sm:h-20 sm:w-20 sm:text-3xl" aria-hidden>
              {photo ? <img src={photo} alt="" className="h-full w-full rounded-full object-cover" /> : mono}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="kicker" style={{ color: `color-mix(in srgb, ${bannerTint} 62%, #fff)` }}>{tr(getLevel(state.track.level)?.name || '')}{state.track.level === 'terminale-stmg' && <> · {tr(getSpecialty(state.track.level, state.track.specialty)?.name || '')}</>}</p>
            <h1 className="font-display text-[1.7rem] font-medium leading-[1.15] text-[#faf3e1] sm:text-[2.15rem]">
              {greeting}{firstName ? <>, <span style={{ color: `color-mix(in srgb, ${bannerTint} 55%, #fff)` }}>{firstName}</span></> : ''}
            </h1>
            {dateLabel && <p className="mt-1 text-xs capitalize tracking-wide" style={{ color: `color-mix(in srgb, ${bannerTint} 42%, #cfc3a0)` }}>{dateLabel}</p>}
          </div>
          <div className="hidden shrink-0 sm:block">
            <Ring value={trackProgress} color={bannerTint} size={84} label={`${trackProgress}%`} />
          </div>
        </div>

        <hr className="rule-gold relative my-5" />

        <div className="relative flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-[#d8cca8]">
          <span className="sm:hidden"><span className="font-semibold text-[#f0e2b8]">{trackProgress}%</span> {t('progression')}</span>
          <span><span className="font-display text-lg text-[#f0e2b8]">{t('level')} {derived.level}</span></span>
          <span>{state.xp} XP</span>
          <span className="inline-flex items-center gap-1"><Icon.Flame size={14} /> {state.streak.count} {t('streakDays')}</span>
        </div>

        {/* Un toucher : la séance du jour enchaîne erreurs, révision et cours. */}
        <div className="relative mt-5 flex flex-wrap gap-2.5">
          {realSubjects.length > 0 && (
            <Link to="/seance" className="btn-gold gap-1.5 !py-2.5"><Icon.Play size={16} /> Ma séance du jour</Link>
          )}
          {last ? (
            <Link to={resumeUrl} className="btn gap-1.5 !py-2.5 text-[#f4ecd8]" style={{ boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--c-accent) 45%, transparent)' }}>
              {t('resume')} : <CourseText text={recent ? position.chapterTitle || last.short || last.name : last.short || last.name} />
            </Link>
          ) : realSubjects[0] ? (
            <Link to={`/subject/${realSubjects[0].id}`} className="btn gap-1.5 !py-2.5 text-[#f4ecd8]" style={{ boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--c-accent) 45%, transparent)' }}>{t('start')}</Link>
          ) : null}
        </div>
      </section>

      {/* Mes matières — le cœur des révisions, juste sous l'accueil */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <h2 className="font-display text-lg font-semibold text-slate-700 dark:text-slate-200">{t('mySubjects')}</h2>
          <Link to="/changer" className="shrink-0 text-xs font-semibold text-[#84671b] hover:underline dark:text-[#d9bd77]">{t('change')}</Link>
        </div>
        <div className="home-subject-grid">
          {subjects.map((s) => {
            const pct = s.comingSoon ? 0 : subjectScore(state, s.id)
            const content = <>
              <span className="home-subject-icon" style={{backgroundColor:s.color+'12'}} aria-hidden>{s.icon}</span>
              <h3 className="font-display font-semibold"><CourseText text={s.name} /></h3>
              <div className="home-subject-meta text-slate-500 dark:text-slate-400"><span>{s.chapters.length} {t('themesCount')}</span><span>{s.comingSoon ? t('comingSoon') : `${pct}%`}</span></div>
              {!s.comingSoon && <ProgressBar value={pct} color={s.color} />}
            </>
            return s.comingSoon
              ? <div key={s.id} className="card home-subject-card opacity-80">{content}</div>
              : <Link key={s.id} to={`/subject/${s.id}`} className="card home-subject-card transition hover:-translate-y-0.5 hover:shadow-md">{content}</Link>
          })}
        </div>
      </section>

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
              <div className="sm:w-56">
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

      {/* Réviser & réussir : l'outil conseillé, les autres rangés dans la trousse */}
      <OutilsAccueil />

    <section className="home-summary home-bottom-grid">
      <div className="home-progress-card"><span className="home-eyebrow">Tes efforts prennent forme</span><div className="home-progress-heading"><h2>Chaque séance compte.</h2><span aria-hidden>→</span></div><div className="home-stat-grid"><div><strong>{progress}<small>%</small></strong><span>Progression de ta filière</span></div><div><strong>{mastered}</strong><span>Thèmes maîtrisés</span></div><div><strong>{state.streak?.count || 0}</strong><span>{t('streakDays')}</span></div></div><p>Chaque chapitre utilise jusqu’à trois de tes meilleurs exercices. La moyenne des chapitres donne la maîtrise du thème ; un meilleur résultat au test du thème peut la relever. Les XP et les séances de formules ne modifient pas cette maîtrise.</p><div className="home-progress-footer"><span>{t('level')} {derived.level} · {state.xp.toLocaleString(state.lang || 'fr')} XP</span><Link to="/badges">{t('badges')} →</Link></div></div>
      <div className="home-community-card"><span className="home-eyebrow">Mieux avancer, ensemble</span><h2>Ton coin à toi.</h2><div className="home-community-links"><Link to="/classe"><span aria-hidden>◉</span>{t('myClass')}<span aria-hidden>→</span></Link><Link to="/amis"><span aria-hidden>♧</span>{t('friends')}<span aria-hidden>→</span></Link><Link to="/boutique"><span aria-hidden>✦</span>{t('shop')}<span aria-hidden>→</span></Link></div></div>
    </section>

      <p className="pt-1 text-center text-xs text-slate-400">
        {level === 'terminale-stmg' ? t('courseBasedNote') : t('savedOnDevice')}
      </p>
    </div>
  )
}
