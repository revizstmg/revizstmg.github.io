// Ces codes appartiennent au compte, jamais à l'ensemble du navigateur.
// Une ancienne clé globale ne prouve pas son propriétaire : ne pas la migrer.
import { deviceId } from './leaderboard.js'
const memory = new Map()
const key = (kind, owner) => `stmg_${kind}_code:${owner}`
export function accountCode(kind, create, owner = deviceId()) {
  const k = key(kind, owner)
  let value
  try { value = localStorage.getItem(k) } catch { return '' }
  value ||= memory.get(k)
  if (!value) { value = create(); saveAccountCode(kind, owner, value) }
  return value
}
export function saveAccountCode(kind, owner, value) {
  const k = key(kind, owner)
  memory.set(k, value)
  try { localStorage.setItem(k, value) } catch { /* mémoire de l'onglet */ }
}
