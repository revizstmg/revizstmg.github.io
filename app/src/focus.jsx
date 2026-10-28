// Minuteur de révision global (type Pomodoro), piloté par l'élève.
// - L'élève choisit lui-même la durée de révision et de pause.
// - Le minuteur continue même en changeant de page (contexte global).
// - Fin de phase : petit son + vibration ; fin d'une session de révision =>
//   événement « stmg-focus-done » (le store attribue des XP).
import { useStore } from './store.jsx'
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'

const KEY = 'stmg_focus_v1'
const DEFAULTS = { studyMin: 25, breakMin: 5 }
const clampMin = (n) => Math.max(1, Math.min(180, Math.round(Number(n) || 0)))

function loadSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null') || {}
    return { studyMin: clampMin(raw.studyMin || DEFAULTS.studyMin), breakMin: clampMin(raw.breakMin || DEFAULTS.breakMin) }
  } catch { return { ...DEFAULTS } }
}

const Ctx = createContext(null)
export const useFocus = () => useContext(Ctx)

export function FocusProvider({ children }) {
  const { state } = useStore()
  const owner = state.account?.id || 'local'
  return <FocusSession owner={owner}>{children}</FocusSession>
}

function FocusSession({ owner, children }) {
  const snapshotKey = `stmg_focus_session_v1:${owner}`
  const [init] = useState(loadSettings)
  const readSaved = () => {
    try {
      const value = JSON.parse(sessionStorage.getItem(snapshotKey) || 'null')
      return value && ['focus', 'break'].includes(value.phase) && Number.isFinite(value.remaining) ? value : null
    } catch { return null }
  }
  const [saved] = useState(readSaved)
  const [scope, setScope] = useState(owner)
  const liveOwner = useRef(owner)
  liveOwner.current = owner
  const [studyMin, setStudyMinState] = useState(init.studyMin)
  const [breakMin, setBreakMinState] = useState(init.breakMin)
  const [phase, setPhase] = useState(saved?.phase || 'idle')
  const [running, setRunning] = useState(false)
  const [endsAt, setEndsAt] = useState(null)
  const [remaining, setRemaining] = useState(() => saved ? Math.max(1, Math.min(10800, Math.round(saved.remaining))) : init.studyMin * 60)
  const [cycles, setCycles] = useState(saved ? Math.max(0, Math.min(1000, saved.cycles || 0)) : 0)
  useLayoutEffect(() => {
    if (scope === owner) return
    const next = readSaved()
    setRunning(false); setEndsAt(null)
    setPhase(next?.phase || 'idle')
    setRemaining(next ? Math.max(1, Math.min(10800, Math.round(next.remaining))) : studyMin * 60)
    setCycles(next ? Math.max(0, Math.min(1000, next.cycles || 0)) : 0)
    setScope(owner)
  }, [owner, scope])
  useEffect(() => {
    if (scope !== owner) return
    try { sessionStorage.setItem(snapshotKey, JSON.stringify({ phase, remaining, endsAt, cycles })) } catch {}
  }, [snapshotKey, scope, owner, phase, remaining, endsAt, cycles])

  // Persistance des réglages.
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ studyMin, breakMin })) } catch { /* ignore */ }
  }, [studyMin, breakMin])

  // Au repos, l'anneau reflète la durée de révision choisie.
  useEffect(() => { if (phase === 'idle') setRemaining(studyMin * 60) }, [studyMin, phase])

  // Signal sonore + vibration à chaque changement de phase.
  const chime = useCallback((kind) => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext
      if (AC) {
        const ac = new AC()
        const play = (freq, start, dur) => {
          const o = ac.createOscillator(); const g = ac.createGain()
          o.connect(g); g.connect(ac.destination); o.type = 'sine'; o.frequency.value = freq
          g.gain.setValueAtTime(0.0001, ac.currentTime + start)
          g.gain.exponentialRampToValueAtTime(0.28, ac.currentTime + start + 0.02)
          g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + dur)
          o.start(ac.currentTime + start); o.stop(ac.currentTime + start + dur + 0.02)
        }
        // Deux notes : montantes pour reprendre, descendantes pour la pause.
        if (kind === 'focus') { play(660, 0, 0.25); play(880, 0.22, 0.35) }
        else { play(880, 0, 0.25); play(587, 0.22, 0.4) }
        setTimeout(() => ac.close?.(), 1000)
      }
    } catch { /* audio indisponible */ }
    try { navigator.vibrate?.(kind === 'break' ? [140, 70, 140] : 200) } catch { /* ignore */ }
  }, [])

  const startPhase = useCallback((ph, minutes) => {
    const secs = Math.max(1, Math.round(minutes * 60))
    setPhase(ph)
    setRemaining(secs)
    setEndsAt(Date.now() + secs * 1000)
    setRunning(true)
  }, [])

  // Passe à la phase suivante. `auto` = fin naturelle (récompense XP) ;
  // sinon c'est un saut manuel (pas d'XP).
  const advance = useCallback((auto) => {
    if (scope !== owner || liveOwner.current !== owner) return
    if (phase === 'focus') {
      if (auto) {
        setCycles((c) => c + 1)
        try { window.dispatchEvent(new CustomEvent('stmg-focus-done', { detail: { minutes: studyMin } })) } catch { /* ignore */ }
      }
      chime('break')
      startPhase('break', breakMin)
    } else {
      chime('focus')
      startPhase('focus', studyMin)
    }
  }, [phase, studyMin, breakMin, chime, startPhase, scope, owner])

  // Décompte : on calcule le restant à partir de l'horodatage de fin
  // (robuste si l'onglet est ralenti en arrière-plan).
  useEffect(() => {
    if (scope !== owner || !running || !endsAt) return
    const step = () => {
      if (liveOwner.current !== owner) return
      const rem = Math.round((endsAt - Date.now()) / 1000)
      if (rem <= 0) advance(true)
      else setRemaining(rem)
    }
    step()
    const id = setInterval(step, 250)
    return () => clearInterval(id)
  }, [running, endsAt, advance, scope, owner])

  const start = useCallback(() => {
    if (scope !== owner) return
    if (phase === 'idle') startPhase('focus', studyMin)
    else { setEndsAt(Date.now() + remaining * 1000); setRunning(true) }
  }, [phase, studyMin, remaining, startPhase, scope, owner])

  const pause = useCallback(() => { setRunning(false); setEndsAt(null) }, [])
  const reset = useCallback(() => { setRunning(false); setEndsAt(null); setPhase('idle'); setRemaining(studyMin * 60); setCycles(0) }, [studyMin])
  const skip = useCallback(() => advance(false), [advance])

  const setStudyMin = useCallback((n) => setStudyMinState(clampMin(n)), [])
  const setBreakMin = useCallback((n) => setBreakMinState(clampMin(n)), [])
  const applyPreset = useCallback((s, b) => {
    setStudyMinState(clampMin(s)); setBreakMinState(clampMin(b))
    setRunning(false); setEndsAt(null); setPhase('idle'); setRemaining(clampMin(s) * 60)
  }, [])

  const phaseTotal = (phase === 'break' ? breakMin : studyMin) * 60
  const value = {
    studyMin, breakMin, phase, running, remaining, cycles, phaseTotal,
    start, pause, reset, skip, setStudyMin, setBreakMin, applyPreset,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
