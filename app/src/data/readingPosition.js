// Repère de lecture local par compte. Aucun nom ni contenu saisi n'est conservé.
const key = (accountId) => `stmg_reading_v1:${accountId}`
export function readPosition(accountId) {
  if (!accountId) return null
  try {
    const value = JSON.parse(localStorage.getItem(key(accountId)))
    return value?.version === 1 && typeof value.subjectId === 'string' && typeof value.themeId === 'string' && Number.isInteger(value.chapterIndex) && value.chapterIndex >= 0 && Number.isInteger(value.page) && value.page >= 0 ? value : null
  } catch { return null }
}
export function savePosition(accountId, position) {
  if (!accountId) return
  try { localStorage.setItem(key(accountId), JSON.stringify({ ...position, version: 1 })) } catch { /* stockage indisponible : le cours reste accessible */ }
}
