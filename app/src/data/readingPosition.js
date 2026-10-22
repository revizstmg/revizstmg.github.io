// Repère de lecture local par compte. Aucun nom ni contenu saisi n'est conservé.
const key = (accountId) => `stmg_reading_v1:${accountId}`
export function readPosition(accountId, subjectId = null) {
  if (!accountId) return null
  try {
    const raw = JSON.parse(localStorage.getItem(key(accountId)))
    const value = subjectId ? (raw?.bySubject?.[subjectId] || (raw?.subjectId===subjectId ? raw : null)) : raw
    return value?.version === 1 && typeof value.subjectId === 'string' && typeof value.themeId === 'string' && Number.isInteger(value.chapterIndex) && value.chapterIndex >= 0 && Number.isInteger(value.page) && value.page >= 0 ? value : null
  } catch { return null }
}
export function savePosition(accountId, position) {
  if (!accountId) return
  try {
    const previous = readPosition(accountId)
    const bySubject = { ...(previous?.bySubject || {}) }
    if (previous?.subjectId) { const { bySubject: _, ...point } = previous; bySubject[previous.subjectId] = point }
    bySubject[position.subjectId] = { ...position, version:1 }
    localStorage.setItem(key(accountId), JSON.stringify({ ...position, version: 1, bySubject }))
  } catch { /* stockage indisponible : le cours reste accessible */ }
}
