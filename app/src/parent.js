// Espace parent (suivi parental) via Supabase, sur le même modèle « appareil +
// code » que les amis : l'élève publie un instantané de ses stats sous un code
// court qu'il partage à ses parents ; le parent saisit ce code une fois et
// consulte, en lecture seule, la progression de son enfant (temps de révision,
// connexion/série, XP, matières, badges…). Le lien est mémorisé localement sur
// l'appareil du parent → une fois relié, l'espace s'ouvre automatiquement.
// L'élève publie avec son compte ; le parent, sans compte, lit l'instantané par
// la fonction revizstmg_stats_enfant, qui ne renvoie que la ligne du code donné.
import { SUPA_READY } from './supabase.js'
import { deviceId } from './leaderboard.js'
import { enc, send, rpc } from './reseau.js'

export const PARENT_READY = SUPA_READY
const clampInt = (v, min, max) => Math.max(min, Math.min(max, Math.round(v || 0)))

// Code à donner à ses parents (6 caractères lisibles, préfixe P pour le repérer).
export function parentCode() {
  try {
    let c = localStorage.getItem('stmg_parent_code')
    if (!c) {
      const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      c = 'P' + Array.from({ length: 5 }, () => A[Math.floor(Math.random() * A.length)]).join('')
      localStorage.setItem('stmg_parent_code', c)
    }
    return c
  } catch { return 'PSTMG1' }
}
export function normParentCode(s) {
  return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
}

// ÉLÈVE — publie / met à jour l'instantané lu par le parent.
export async function publishChildStats(snap) {
  if (!PARENT_READY || !snap) return
  const row = {
    device_id: deviceId(),
    code: parentCode(),
    name: String(snap.name || '').slice(0, 60),
    xp: clampInt(snap.xp, 0, 1e9),
    level: clampInt(snap.level, 0, 1000),
    streak: clampInt(snap.streak, 0, 100000),
    courses_week: clampInt(snap.coursesWeek, 0, 1000),
    weekly_goal: clampInt(snap.weeklyGoal, 0, 1000),
    total_time: clampInt(snap.totalTime, 0, 1e9),
    bac_date: snap.bacDate || null,
    badges: clampInt(snap.badges, 0, 1000),
    track: String(snap.track || '').slice(0, 80),
    subjects: Array.isArray(snap.subjects)
      ? snap.subjects.slice(0, 20).map((s) => ({
          short: String(s.short || '').slice(0, 40),
          color: String(s.color || '').slice(0, 20),
          score: clampInt(s.score, 0, 100),
          time: clampInt(s.time, 0, 1e9),
        }))
      : [],
    last_active: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  const res = await send('POST', 'child_stats?on_conflict=device_id', [row], 'resolution=merge-duplicates,return=representation')
  // La base garde le premier code du compte : depuis un autre appareil, on
  // reprend ce code-là pour montrer à l'élève celui que ses parents connaissent.
  const rows = await res.json().catch(() => [])
  const code = rows?.[0]?.code
  if (code && code !== parentCode()) { try { localStorage.setItem('stmg_parent_code', code) } catch { /* stockage indisponible */ } }
}

// ÉLÈVE — supprime son instantané (rompre le suivi côté enfant). Renvoie vrai si
// la suppression a abouti, pour pouvoir la retenter plus tard sinon.
export async function deleteMyChildStats() {
  if (!PARENT_READY) return false
  try { await send('DELETE', `child_stats?device_id=eq.${enc(deviceId())}`); return true } catch { return false }
}

// PARENT — lit l'instantané d'un enfant par son code.
export async function fetchChildByCode(code) {
  const c = normParentCode(code)
  if (c.length < 4) return null
  const rows = await rpc('revizstmg_stats_enfant', { p_code: c })
  return rows?.[0] || null
}

// Lien parent ↔ enfant, mémorisé localement sur l'appareil du parent.
export function getLinkedChild() {
  try { return localStorage.getItem('stmg_parent_link') || '' } catch { return '' }
}
export function setLinkedChild(code) {
  try {
    const c = normParentCode(code)
    if (c) localStorage.setItem('stmg_parent_link', c)
    else localStorage.removeItem('stmg_parent_link')
  } catch { /* stockage indisponible */ }
}
