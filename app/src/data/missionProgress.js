// Progression monotone par compétence : un essai moins bon ne supprime jamais
// une réussite. Les dates autonomes sont fusionnées entre appareils.
export const MISSION_STAGES = ['understand', 'apply', 'boss']
export const MISSION_PASS = 80
const score = value => Math.max(0, Math.min(100, Number(value) || 0))
const validDay = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(value + 'T00:00:00Z')
  return Number.isFinite(+date) && date.toISOString().slice(0, 10) === value
}
const dates = values => {
  const all = [...new Set(values.filter(validDay))].sort()
  return [...new Set([all[0], ...all.slice(-5)].filter(Boolean))]
}
export const missionKey = (themeId, index, stage) => themeId + '::' + index + '::' + stage
function clean(value = {}) {
  return {
    best: score(value?.best), autonomousBest: score(value?.autonomousBest),
    successDays: dates(Array.isArray(value?.successDays) ? value.successDays : []),
    updatedAt: Math.max(0, Number(value?.updatedAt) || 0),
    lastPct: score(value?.lastPct), lastAssisted: !!value?.lastAssisted,
  }
}
function combine(a, b) {
  const x = clean(a), y = clean(b)
  const latest = [x, y].sort((u, v) => v.updatedAt - u.updatedAt || v.lastPct - u.lastPct || Number(u.lastAssisted) - Number(v.lastAssisted))[0]
  return { ...latest, best: Math.max(x.best, y.best), autonomousBest: Math.max(x.autonomousBest, y.autonomousBest), successDays: dates([...x.successDays, ...y.successDays]) }
}
export function mergeMissions(a = {}, b = {}) {
  const out = {}
  for (const key of new Set([...Object.keys(a || {}), ...Object.keys(b || {})])) {
    if (!/^.+::\d+::(understand|apply|boss)$/.test(key)) continue
    out[key] = combine(a?.[key], b?.[key])
  }
  return out
}
export function updateMission(progress, {themeId, index, stage, pct, assisted, day, now = Date.now()}) {
  if (!themeId || !Number.isInteger(index) || index < 0 || !MISSION_STAGES.includes(stage) || !validDay(day) || !Number.isFinite(pct)) return progress || {}
  const key = missionKey(themeId, index, stage)
  return { ...(progress || {}), [key]: combine(progress?.[key], {
    best: pct, autonomousBest: assisted ? 0 : pct,
    successDays: !assisted && pct >= MISSION_PASS ? [day] : [],
    updatedAt: now, lastPct: pct, lastAssisted: assisted,
  }) }
}
export function missionStatus(progress, themeId, index) {
  const stages = MISSION_STAGES.map(stage => ({ id: stage, ...clean(progress?.[missionKey(themeId, index, stage)]) }))
  const completed = stages.filter(s => s.best >= MISSION_PASS).length
  const boss = stages[2]
  const days = boss.successDays
  const spaced = days.length > 1 && (+new Date(days[days.length - 1] + 'T00:00:00Z') - +new Date(days[0] + 'T00:00:00Z')) >= 2 * 86400000
  const medal = completed < 3 ? null : spaced ? 'durable' : boss.autonomousBest >= MISSION_PASS ? 'autonomous' : 'completed'
  return { stages, completed, medal, next: stages.find(s => s.best < MISSION_PASS)?.id || 'boss', practiced: stages.some(s => s.updatedAt > 0) }
}
