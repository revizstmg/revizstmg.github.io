// Brouillons limités à l’onglet, séparés par compte et fonctionnalité.
// Le refus/quota du stockage est renvoyé à l’interface, jamais masqué.
export function readSessionDraft(key) {
  try { return JSON.parse(sessionStorage.getItem(key) || 'null') } catch { return null }
}
export function writeSessionDraft(key, value) {
  try { sessionStorage.setItem(key, JSON.stringify(value)); return true } catch { return false }
}
