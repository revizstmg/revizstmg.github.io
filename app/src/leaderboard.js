// Classement hebdomadaire partagé (par code de classe) via Supabase.
// Le site reste statique : on parle directement à l'API REST (PostgREST) de
// Supabase, avec le jeton du compte connecté (reseau.js).
import { SUPA_READY } from './supabase.js'
import { getSession } from './auth.js'
import { rest, enc, getJSON, send, rpc } from './reseau.js'

export const LEADERBOARD_READY = SUPA_READY

// Clé de semaine ISO (identique au store) : « 2026-W36 ».
export function isoWeekKey(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

// Identifiant public de l'élève dans les espaces partagés (classe, amis,
// parent, classement). Connecté, c'est l'identifiant de son compte : la base
// vérifie que chacun n'écrit que ses lignes, et l'élève garde la même identité
// d'un appareil à l'autre. Sans compte, un identifiant d'appareil anonyme.
export function deviceId() {
  const compte = getSession()?.user?.id
  if (compte) return compte
  try {
    let id = localStorage.getItem('stmg_device')
    if (!id) {
      id = (crypto?.randomUUID?.() || 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2))
      localStorage.setItem('stmg_device', id)
    }
    return id
  } catch {
    return 'anon'
  }
}

export function normalizeCode(code) {
  return String(code || '').trim().toLowerCase().replace(/\s+/g, '-').slice(0, 24)
}

// Envoie / met à jour mon score de la semaine dans ma classe (upsert).
export async function submitScore({ classCode, name, photo, courses }) {
  const row = {
    class_code: normalizeCode(classCode),
    device_id: deviceId(),
    week: isoWeekKey(),
    name: String(name || '').slice(0, 40),
    photo: photo ? String(photo).slice(0, 40000) : null,
    courses: Math.max(0, Math.min(1000, Math.round(courses || 0))),
    updated_at: new Date().toISOString(),
  }
  await send('POST', 'leaderboard?on_conflict=class_code,device_id,week', [row], 'resolution=merge-duplicates,return=minimal')
}

// Lit le classement de la semaine en cours pour une classe (top 100).
export async function fetchRanking(classCode) {
  const wk = isoWeekKey()
  return getJSON(rest(`leaderboard?select=name,photo,courses,device_id,updated_at&class_code=eq.${enc(normalizeCode(classCode))}&week=eq.${wk}&order=courses.desc,updated_at.asc&limit=100`))
}

// Ligue inter-classes : totaux de la semaine par classe, calculés par la base
// (revizstmg_ligue). Aucun nom ; les codes des autres classes sont masqués
// (« stmg-k••• ») pour qu'on ne puisse pas les rejoindre sans y être invité.
export async function fetchLeague() {
  const rows = (await rpc('revizstmg_ligue', { p_semaine: isoWeekKey() })) || []
  const list = rows.map((r, i) => {
    const members = Number(r.members) || 0
    const total = Number(r.total) || 0
    return { code: r.code, cle: `${r.code}-${i}`, members, total, avg: members ? Math.round((total / members) * 10) / 10 : 0 }
  })
  // Classement principal : total de cours de la classe (l'effort collectif).
  list.sort((a, b) => b.total - a.total || b.avg - a.avg)
  return list
}
