import OfflineStatus from '../components/OfflineStatus.jsx'
import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useStore, subjectScore, effacerDonneesAppareil, buildChildSnapshot } from '../store.jsx'
import { trackLabel, trackIcon, subjectsForTrack } from '../data/tracks.js'
import { badgeById } from '../badges.js'
import { Ring, ProgressBar, Icon } from '../components/ui.jsx'
import { usePublicText, useT } from '../i18n.js'
import { supprimerCompte, isSignedIn } from '../auth.js'
import { pushPossible, activerRappelsPush, desactiverRappelsPush } from '../push.js'
import { InstallCard, AppBadge } from '../components/InstallApp.jsx'
import { ProgressCurve, ThemeTimeBars } from '../components/StatsCharts.jsx'
import { isStandalone } from '../pwa.js'
import { ensurePermission, notify, notifSupported } from '../notify.js'
import { parentCode, PARENT_READY, renouvelerCodeParent } from '../parent.js'
import { daysUntil, todayKey } from '../data/srs.js'
import { estEnEssai, creerMonCompte } from '../components/CompteRequis.jsx'

// Droit à la portabilité (RGPD) : tout ce que l'app garde sur cet appareil pour
// l'élève, dans un fichier JSON lisible, sans passer par un e-mail.
function telechargerMesDonnees(state) {
  const donnees = { application: 'RévizSTMG', exporte_le: new Date().toISOString(), donnees: state }
  const url = URL.createObjectURL(new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `revizstmg-mes-donnees-${todayKey()}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// « Mon espace » : la page personnelle de l'élève — identité, statistiques,
// badges, favoris et accès rapide. Distincte de la personnalisation (apparence).
export default function Profile() {
  const { state, derived, setBacDate, setParentShare } = useStore()
  const [params, setParams] = useSearchParams()
  const settings = params.get('section') === 'reglages'
  const t = useT()
  const tr = usePublicText()
  const [busy, setBusy] = useState(false)
  const bacDays = state.bacDate ? daysUntil(state.bacDate) : null
  const [codeCopied, setCodeCopied] = useState(false)
  const [codeMsg, setCodeMsg] = useState('')
  const [, setCodeVersion] = useState(0)
  if (!state.track) return <Navigate to="/" replace />

  // Nouveau code parent : l'ancien ne donne plus rien (code partagé par erreur…).
  const renouvelerCode = async () => {
    if (busy || !confirm(tr('Renouveler le code ? L’ancien ne marchera plus : tes parents devront saisir le nouveau.'))) return
    setBusy(true); setCodeMsg('')
    try {
      await renouvelerCodeParent(buildChildSnapshot(state, derived))
      setCodeVersion((v) => v + 1)
      setCodeMsg(tr('Nouveau code créé. Donne-le à tes parents.'))
    } catch (e) {
      setCodeMsg(tr(e?.message || 'Le code n’a pas pu être renouvelé : vérifie ta connexion et réessaie.'))
    } finally { setBusy(false) }
  }

  const copyParentCode = async () => {
    try { await navigator.clipboard.writeText(parentCode()); setCodeCopied(true); setTimeout(() => setCodeCopied(false), 1800) } catch { /* copie indisponible */ }
  }

  const deleteAccount = async () => {
    if (busy) return
    if (!confirm(t('deleteAccountConfirm'))) return
    setBusy(true)
    // La base efface tout ce que l'app a publié ou envoyé pour cet élève
    // (profil et progression, classe, amis et duels, suivi parent, classes d'un
    // professeur, signalements, rappels), puis le compte de connexion lui-même
    // (revizstmg_supprimer_compte). Sans session (essai sans compte), il n'y a
    // rien en ligne : on efface seulement ce qui est sur l'appareil.
    try {
      if (isSignedIn()) {
        await desactiverRappelsPush()
        await supprimerCompte()
      }
    } catch {
      setBusy(false)
      alert(t('deleteAccountFailed'))
      return
    }
    // Puis tout ce que garde ce navigateur, et l'application repart à neuf :
    // rien de l'ancien compte ne reste en mémoire.
    effacerDonneesAppareil()
    window.location.replace(window.location.pathname)
  }

  const first = state.profile?.firstName?.trim() || ''
  const last = state.profile?.lastName?.trim() || ''
  const initials = ((first[0] || '') + (last[0] || '')).toUpperCase() || (first[0] || '').toUpperCase()
  const mono = state.customTheme?.avatar || initials
  const photo = state.profile?.photo || ''
  const role = state.account?.role || 'eleve'
  const accuracy = state.totalAnswers > 0 ? Math.round((state.correctAnswers / state.totalAnswers) * 100) : 0
  const earnedBadges = (state.badges || []).map((id) => badgeById[id]).filter(Boolean)

  const openCustomizer = () => window.dispatchEvent(new CustomEvent('stmg-open-customizer'))

  const stats = [
    { icon: '⭐', label: 'XP', value: state.xp },
    { icon: '🔥', label: t('streakDays'), value: state.streak.count },
    { icon: '🏆', label: t('mastered'), value: derived.chaptersMastered },
    { icon: '📚', label: t('coursesThisWeek'), value: derived.weeklyCourses },
    { icon: '🎯', label: t('accuracy'), value: `${accuracy}%` },
    { icon: '🎖️', label: t('badges'), value: (state.badges || []).length },
  ]

  return (
    <div className="animate-lux space-y-6">
      {/* En-tête identité */}
      <section className="identity-hero card-lux relative overflow-hidden rounded-[1.6rem] p-6 text-[#f4ecd8] sm:p-8"
        style={{ background: 'linear-gradient(135deg, #172d30 0%, #24423f 100%)', border: '1px solid color-mix(in srgb, var(--c-accent) 30%, transparent)' }}>
        <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--c-accent) 32%, transparent), transparent 70%)' }} />
        <div className="relative flex items-center gap-4 sm:gap-5">
          <span className="monogram h-20 w-20 shrink-0 overflow-hidden text-3xl" aria-hidden>
            {photo ? <img src={photo} alt="" className="h-full w-full rounded-full object-cover" /> : mono}
          </span>
          <div className="min-w-0 flex-1">
            <p className="kicker" style={{ color: 'color-mix(in srgb, var(--c-accent) 62%, #fff)' }}>{role === 'prof' ? `🧑‍🏫 ${t('roleTeacher')}` : `🎓 ${t('roleStudent')}`}</p>
            <h1 className="truncate font-display text-[1.7rem] font-medium leading-[1.15] text-[#faf3e1] sm:text-[2.15rem]">{`${first} ${last}`.trim() || t('mySpace')}</h1>
            {state.customTheme?.title && <p className="mt-2 text-sm font-semibold text-[#e8ce8d]">✦ {tr(state.customTheme.title)}</p>}
            {state.account?.email && <p className="mt-0.5 truncate text-xs text-[#b8a878]">{state.account.email}</p>}
            <p className="mt-1 text-xs capitalize tracking-wide text-[#d8cca8]">{trackIcon(state.track)} {trackLabel(state.track)}{state.classCode ? ` · 👥 ${state.classCode}` : ''}</p>
          </div>
          <div className="hidden shrink-0 sm:block">
            <Ring value={derived.pct} color="var(--c-accent)" size={84} label={`${t('levelShort')} ${derived.level}`} />
          </div>
        </div>
        <hr className="rule-gold relative my-5" />
        <div className="relative">
          <div className="mb-1 flex items-center justify-between text-sm text-[#d8cca8]">
            <span>{t('level')} {derived.level}</span><span>{state.xp} / {derived.next} XP</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
            <div className="h-full rounded-full" style={{ width: `${derived.pct}%`, backgroundColor: 'var(--c-accent)' }} />
          </div>
        </div>
      </section>

      <nav aria-label="Mon espace" className="flex gap-2"><button aria-pressed={!settings} className={!settings ? "btn-primary" : "btn-ghost"} onClick={() => setParams({})}>Mes progrès</button><button aria-pressed={settings} className={settings ? "btn-primary" : "btn-ghost"} onClick={() => setParams({section:'reglages'})}>Réglages</button></nav>
      <div hidden={settings} className="space-y-5">
      {/* Statistiques */}
      <section>
        <h2 className="mb-3 px-1 font-display text-xl font-medium">{t('myStats')}</h2>
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="card flex flex-col items-center justify-center p-4 text-center">
              <span className="text-2xl" aria-hidden>{s.icon}</span>
              <span className="mt-1 font-display text-2xl font-semibold" style={{ color: 'var(--c-accent-texte)' }}>{s.value}</span>
              <span className="mt-0.5 text-[0.65rem] uppercase tracking-wide text-slate-400">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Progression visuelle : courbe d'XP + temps par thème */}
      <section className="space-y-4">
        <div>
          <h2 className="mb-3 px-1 font-display text-xl font-medium">📈 {t('progressCurve')}</h2>
          <ProgressCurve history={state.history} />
        </div>
        <div>
          <h2 className="mb-3 px-1 font-display text-xl font-medium">⏱️ {t('timePerTheme')}</h2>
          <ThemeTimeBars themeTime={state.themeTime} />
        </div>
        <div>
          <h2 className="mb-3 px-1 font-display text-xl font-medium">📚 {t('aiBySubject')}</h2>
          <div className="card space-y-3 p-4">
            {subjectsForTrack(state.track).filter((s) => s && !s.comingSoon && (s.chapters || []).length).map((s) => {
              const sc = subjectScore(state, s.id)
              return (
                <div key={s.id}>
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{s.icon || '📘'} {s.short || s.name}</span>
                    <span className="shrink-0 text-xs font-semibold tabular-nums texte-matiere" style={{ '--mc': s.color }}>{sc}%</span>
                  </div>
                  <ProgressBar value={sc} color={s.color} height={7} />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Badges */}
      <section>
        <div className="mb-3 flex items-end justify-between px-1">
          <h2 className="font-display text-xl font-medium">{t('myBadges')}</h2>
          <Link to="/badges" className="text-xs font-semibold text-[#84671b] hover:underline dark:text-[#d9bd77]">{t('seeAll')}</Link>
        </div>
        {earnedBadges.length === 0 ? (
          <div className="card p-5 text-center text-sm text-slate-500 dark:text-slate-400">{t('noBadgeYet')}</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {earnedBadges.slice(0, 12).map((b) => (
              <span key={b.id} title={b.name} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold dark:bg-slate-800">
                <span className="text-lg" aria-hidden>{b.icon}</span>{b.name}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Raccourcis */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link to="/accueil" className="card card-lux flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
          <span className="text-violet-500 dark:text-violet-400"><Icon.Play size={22} /></span>
          <span><span className="block font-display font-semibold">{t('reviseBtn')}</span><span className="block text-xs text-slate-500 dark:text-slate-400">{t('goToLessons')}</span></span>
        </Link>
        <Link to="/favoris" className="card flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
          <span className="text-violet-500 dark:text-violet-400"><Icon.Star size={22} /></span>
          <span><span className="block font-display font-semibold">{t('favorites')}</span><span className="block text-xs text-slate-500 dark:text-slate-400">{(state.favorites || []).length} {t(state.favorites?.length > 1 ? 'chapToReviewP' : 'chapToReviewM')}</span></span>
        </Link>
        <Link to="/mes-notes" className="card flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
          <span className="text-2xl" aria-hidden>📝</span>
          <span><span className="block font-display font-semibold">Mes notes de classe</span><span className="block text-xs text-slate-500 dark:text-slate-400">{(state.notesClasse || []).length ? `${state.notesClasse.length} ${state.notesClasse.length > 1 ? 'notes' : 'note'} · ce qu’il faut améliorer` : 'Tes notes et ce qu’il faut améliorer'}</span></span>
        </Link>
        {state.classCode ? (
          <Link to="/classe" className="card flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
            <span className="text-2xl" aria-hidden>👥</span>
            <span><span className="block font-display font-semibold">{t('myClass')}</span><span className="block text-xs text-slate-500 dark:text-slate-400">{state.classCode}</span></span>
          </Link>
        ) : (
          <Link to="/classe" className="card flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
            <span className="text-2xl" aria-hidden>👥</span>
            <span><span className="block font-display font-semibold">{t('joinClass')}</span><span className="block text-xs text-slate-500 dark:text-slate-400">{t('joinClassShort')}</span></span>
          </Link>
        )}
        <button onClick={openCustomizer} className="card flex items-center gap-3 p-4 text-start transition hover:-translate-y-0.5 hover:shadow-md">
          <span className="text-violet-500 dark:text-violet-400"><Icon.Palette size={22} /></span>
          <span><span className="flex items-center gap-2 font-display font-semibold">{t('customizeProfile')} {!isStandalone() && <AppBadge />}</span><span className="block text-xs text-slate-500 dark:text-slate-400">{t('appearanceHint')}</span></span>
        </button>
      </section>


</div><div hidden={!settings} className="space-y-5">
      {/* Suivi parental : partage volontaire, puis code à donner à ses parents
          (avec un compte : la base n'accepte la publication que d'un compte connecté). */}
      {PARENT_READY && estEnEssai(state) && (
        <section className="card p-5">
          <h2 className="font-display text-xl font-medium">👨‍👩‍👧 {t('studentParentCard')}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Pour que tes parents suivent ta progression, crée d’abord ton compte : ta progression d’essai y sera gardée.</p>
          <button type="button" onClick={creerMonCompte} className="btn-primary mt-3 text-sm">Créer mon compte</button>
        </section>
      )}
      {PARENT_READY && !estEnEssai(state) && (
        <section className="card p-5">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-xl font-medium">👨‍👩‍👧 {t('studentParentCard')}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t(state.parentShare ? 'studentParentHelp' : 'parentShareOff')}</p>
            </div>
            <button onClick={() => setParentShare(!state.parentShare)} role="switch" aria-checked={!!state.parentShare} aria-label={t('parentShareLabel')} className="relative mt-1 h-6 w-11 shrink-0 rounded-full transition" style={{ backgroundColor: state.parentShare ? 'var(--c-accent)' : 'color-mix(in srgb, currentColor 20%, transparent)' }}>
              <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all" style={{ left: state.parentShare ? '1.4rem' : '0.125rem' }} />
            </button>
          </div>
          {state.parentShare && (
            <div className="mt-3 flex items-center gap-3">
              <span className="rounded-xl bg-slate-100 px-4 py-2 font-mono text-xl font-bold tracking-widest dark:bg-slate-800">{parentCode() || tr('Code indisponible : vérifie le stockage de ton navigateur.')}</span>
              <button disabled={!parentCode()} onClick={copyParentCode} className="btn-ghost text-sm">{codeCopied ? `✓ ${t('copied')}` : t('copyCode')}</button>
            </div>
          )}
          {state.parentShare && (
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <button type="button" onClick={renouvelerCode} disabled={busy} className="font-semibold underline disabled:opacity-50">Renouveler le code</button>
              <span>Si le code a circulé : l’ancien ne marchera plus.</span>
              {codeMsg && <span role="status" className="w-full font-semibold">{codeMsg}</span>}
            </div>
          )}
        </section>
      )}

      {/* Préférences & accessibilité */}
      <section>
        <h2 className="mb-3 px-1 font-display text-xl font-medium">⚙️ {t('preferences')}</h2>
        <div className="card divide-y divide-slate-100 p-0 dark:divide-slate-800">
          <button onClick={() => window.dispatchEvent(new CustomEvent('stmg-open-a11y'))} className="flex w-full items-center gap-3 p-4 text-start transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-lg dark:bg-slate-800" aria-hidden>♿</span>
            <span className="min-w-0 flex-1"><span className="block font-display font-semibold">{t('accessibility')}</span><span className="block text-xs text-slate-500 dark:text-slate-400">{t('prefA11yHint')}</span></span>
            <span className="text-slate-300" aria-hidden>›</span>
          </button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('stmg-open-customizer'))} className="flex w-full items-center gap-3 p-4 text-start transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-lg dark:bg-slate-800" aria-hidden>🧩</span>
            <span className="min-w-0 flex-1"><span className="block font-display font-semibold">{t('prefTabs')}</span><span className="block text-xs text-slate-500 dark:text-slate-400">{t('prefTabsHint')}</span></span>
            <span className="text-slate-300" aria-hidden>›</span>
          </button>
          <div className="flex items-center gap-3 p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-lg dark:bg-slate-800" aria-hidden>📅</span>
            <span className="min-w-0 flex-1"><span className="block font-display font-semibold">{t('prefBac')}</span><span className="block text-xs text-slate-500 dark:text-slate-400">{bacDays != null && bacDays >= 0 ? `J-${bacDays} · ${t('prefBacHint')}` : t('prefBacHint')}</span></span>
            <input type="date" aria-label={t('prefBac')} value={state.bacDate || ''} onChange={(e) => setBacDate(e.target.value)} className="shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800" />
          </div>
        </div>
      </section>

      {/* Installer l'application (PWA) */}
      <section>
        <h2 className="mb-3 px-1 font-display text-xl font-medium">{t('installApp')}</h2>
        <OfflineStatus /><InstallCard />
      </section>

      {/* Rappels de révision */}
      <section>
        <h2 className="mb-3 px-1 font-display text-xl font-medium">🔔 {t('reminders')}</h2>
        <ReminderCard t={t} />
      </section>

      {/* Confidentialité & suppression du compte (RGPD) */}
      <section className="space-y-2 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link to="/confidentialite" className="text-sm font-semibold text-[#84671b] hover:underline dark:text-[#d9bd77]">{t('privacyPolicy')}</Link>
          <button onClick={() => telechargerMesDonnees(state)} className="btn-ghost text-sm">⬇️ {t('downloadMyData')}</button>
        </div>
        <div className="card p-4" style={{ boxShadow: 'inset 0 0 0 1px color-mix(in srgb, #e11d48 40%, transparent)' }}>
          <h3 className="font-display font-semibold text-rose-600 dark:text-rose-400">{t('dangerZone')}</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('deleteAccountHint')}</p>
          <button onClick={deleteAccount} disabled={busy} className="mt-3 w-full rounded-xl border-2 border-rose-500 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60 dark:text-rose-400 dark:hover:bg-rose-950/40">
            {busy ? t('pleaseWait') : `🗑️ ${t('deleteAccount')}`}
          </button>
        </div>
      </section>
      </div>
    </div>
  )
}

// Carte « Rappels de révision » (notifications locales).
function ReminderCard({ t }) {
  const { state, setReminder } = useStore()
  const r = state.reminder || { on: false, time: '18:00' }
  const [msg, setMsg] = useState('')
  if (!notifSupported()) return <div className="card p-4 text-sm text-slate-500 dark:text-slate-400">{t('notifUnsupported')}</div>

  // Avec un compte, le rappel passe aussi par une notification « push » : il
  // arrive même téléphone fermé (push.js).
  const brancherPush = async (heure) => {
    if (!pushPossible() || !isSignedIn()) return
    try {
      const ok = await activerRappelsPush(heure)
      setMsg(ok ? 'Rappel activé, même téléphone fermé.' : '')
    } catch { setMsg('Le rappel téléphone fermé n’a pas pu être activé ici : il arrivera quand l’app est ouverte.') }
  }
  const toggle = async () => {
    if (!r.on) {
      const perm = await ensurePermission()
      if (perm !== 'granted') { setMsg(perm === 'denied' ? t('notifDenied') : t('notifUnsupported')); return }
      setReminder({ on: true }); setMsg('')
      brancherPush(r.time || '18:00')
    } else { setReminder({ on: false }); setMsg(''); desactiverRappelsPush() }
  }
  const changerHeure = (heure) => {
    setReminder({ time: heure })
    brancherPush(heure)
  }
  const test = async () => {
    const perm = await ensurePermission()
    if (perm !== 'granted') { setMsg(t('notifDenied')); return }
    const ok = await notify(t('reminderTitle'), t('reminderBody'))
    setMsg(ok ? t('notifSent') : t('notifDenied'))
  }

  return (
    <div className="card card-lux space-y-3 p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl" aria-hidden>⏰</span>
        <div className="min-w-0 flex-1">
          <p className="font-display font-semibold">{t('dailyReminder')}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('dailyReminderHint')}</p>
        </div>
        <button onClick={toggle} role="switch" aria-checked={r.on} aria-label={t('dailyReminder')} className="relative h-6 w-11 shrink-0 rounded-full transition" style={{ backgroundColor: r.on ? 'var(--c-accent)' : 'color-mix(in srgb, currentColor 20%, transparent)' }}>
          <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all" style={{ left: r.on ? '1.4rem' : '0.125rem' }} />
        </button>
      </div>
      {r.on && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold">{t('reminderTime')}</label>
          <input type="time" aria-label={t('reminderTime')} value={r.time || '18:00'} onChange={(e) => changerHeure(e.target.value)} className="rounded-xl border border-slate-200 bg-transparent px-3 py-2 dark:border-slate-700" />
          <button onClick={test} className="ml-auto rounded-xl px-3 py-2 text-sm font-semibold text-white" style={{ backgroundColor: 'var(--c-accent-fort)' }}>{t('testNotif')}</button>
        </div>
      )}
      {msg && <p className="text-xs text-slate-500 dark:text-slate-400">{msg}</p>}
      <p className="text-xs text-slate-400">💡 {t('reminderLimit')}</p>
    </div>
  )
}
