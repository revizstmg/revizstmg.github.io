import { submitQuizResult } from './classroom.js'
import { getSession } from './auth.js'
const key = owner => `stmg_quiz_outbox_v1:${owner}`
const flights = new Map()
const notify = () => { if (typeof window !== 'undefined') window.dispatchEvent(new Event('stmg-quiz-outbox')) }
export function pendingQuizResults(owner) {
  if (!owner) return []
  try { const entries=JSON.parse(localStorage.getItem(key(owner)));return Array.isArray(entries)?entries.filter(e=>e && typeof e.id==='string' && typeof e.quizId==='string' && Number.isFinite(e.score) && Number.isFinite(e.total)):[] } catch { return [] }
}
export function queueQuizResult(owner, result) {
  if (!owner) throw new Error('Reconnecte-toi pour transmettre ton résultat.')
  const entry={...result,id:globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`}
  const entries=pendingQuizResults(owner).filter(e=>e.quizId!==result.quizId)
  localStorage.setItem(key(owner),JSON.stringify([...entries,entry]));notify();return entry
}
export function flushQuizResults(owner, send = submitQuizResult) {
  if (!owner) return Promise.resolve()
  if (flights.has(owner)) return flights.get(owner)
  const flight=(async()=>{
    for(const entry of pendingQuizResults(owner)) {
      const current=getSession()?.user?.id
      if (current!==owner) throw new Error('La session a changé.')
      await send(entry)
      const after=getSession()?.user?.id
      if (current!==after) throw new Error('La session a changé.')
      const remaining=pendingQuizResults(owner).filter(e=>e.id!==entry.id)
      localStorage.setItem(key(owner),JSON.stringify(remaining));notify()
    }
  })().finally(()=>flights.delete(owner))
  flights.set(owner,flight);return flight
}
