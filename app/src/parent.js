import { cleanVacancesSummary } from './data/vacancesState.js'
// Espace parent (suivi parental) via Supabase, sur le même modèle « appareil +
// code » que les amis : l'élève publie un instantané de ses stats sous un code
// court qu'il partage à ses parents ; le parent saisit ce code une fois et
// consulte, en lecture seule, la progression de son enfant (temps de révision,
// connexion/série, XP, matières, badges…). Le lien est mémorisé localement sur
// l'appareil du parent → une fois relié, l'espace s'ouvre automatiquement.
// L'élève publie avec son compte ; le parent, sans compte, lit l'instantané par
// la fonction revizstmg_stats_enfant, qui ne renvoie que la ligne du code donné.
import { accountCode, saveAccountCode } from './accountCode.js'
import { SUPA_READY } from './supabase.js'
import { deviceId } from './leaderboard.js'
import { enc, send, rpc } from './reseau.js'

export const PARENT_READY = SUPA_READY
const clampInt = (v, min, max) => Math.max(min, Math.min(max, Math.round(v || 0)))

// Code à donner à ses parents : « P » suivi de 9 caractères lisibles tirés au
// hasard (32 possibilités chacun, soit plus de 35 000 milliards de codes) :
// impossible à deviner en essayant. Les anciens codes de 6 caractères restent
// lisibles jusqu'à leur renouvellement.
const ALPHABET_CODE = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export const LONGUEUR_CODE_PARENT = 10
function nouveauCodeParent() {
  const octets = crypto.getRandomValues(new Uint8Array(LONGUEUR_CODE_PARENT - 1))
  return 'P' + Array.from(octets, (o) => ALPHABET_CODE[o % ALPHABET_CODE.length]).join('')
}
export function parentCode() {
  return accountCode('parent', nouveauCodeParent)
}
export function normParentCode(s) {
  return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)
}

// Le retrait attend les publications en cours avant de supprimer l'instantané.
const operations = new Map()
function ordonner(owner, action) {
  const next = (operations.get(owner) || Promise.resolve()).catch(() => {}).then(() => {
    if (deviceId() !== owner) throw new Error('Session modifiée.')
    return action()
  })
  operations.set(owner, next)
  next.finally(() => { if (operations.get(owner) === next) operations.delete(owner) }).catch(() => {})
  return next
}

// ÉLÈVE — publie / met à jour l'instantané lu par le parent.
export function publishChildStats(snap) {
  const owner = deviceId()
  return ordonner(owner, () => publier(snap))
}
async function publier(snap) {
  if (!PARENT_READY || !snap) return
  const owner = deviceId()
  const code = parentCode()
  if (!code) throw new Error('Code parent indisponible : partage non envoyé.')
  const row = {
    device_id: owner,
    code,
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
          ...(cleanVacancesSummary(s.vacances) ? { vacances: cleanVacancesSummary(s.vacances) } : {}),
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
  const storedCode = rows?.[0]?.code
  if (storedCode && deviceId() === owner) saveAccountCode('parent', owner, storedCode)
}

// ÉLÈVE — supprime son instantané (rompre le suivi côté enfant). Renvoie vrai si
// la suppression a abouti, pour pouvoir la retenter plus tard sinon.
export async function deleteMyChildStats() {
  if (!PARENT_READY) return false
  const owner = deviceId()
  try {
    return await ordonner(owner, async () => {
      await send('DELETE', `child_stats?device_id=eq.${enc(owner)}`)
      return true
    })
  } catch { return false }
}

// ÉLÈVE — renouvelle son code : l'ancien ne donne plus rien, les parents devront
// saisir le nouveau. La base interdit de changer le code d'une ligne (déclencheur
// garde_code) : on efface la ligne, puis on la republie sous un code neuf. Si
// l'effacement échoue, rien ne change (l'ancien code reste affiché).
export async function renouvelerCodeParent(snap) {
  const owner = deviceId()
  if (!PARENT_READY) throw new Error('Suivi parent indisponible.')
  if (!(await deleteMyChildStats())) throw new Error('Le code n’a pas pu être renouvelé : vérifie ta connexion et réessaie.')
  if (deviceId() !== owner) throw new Error('Session modifiée.')
  const code = nouveauCodeParent()
  saveAccountCode('parent', owner, code)
  if (snap) await publishChildStats(snap)
  return code
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
