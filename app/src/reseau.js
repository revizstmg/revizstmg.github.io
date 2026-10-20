// Accès à l'API REST de Supabase pour les espaces partagés (classe, amis,
// parent, classement). Les requêtes partent avec le jeton du compte connecté :
// les règles d'accès de la base (RLS) reposent sur l'identité du compte
// (supabase/README.md). Sans session, seule la clé publique part, et la base
// refuse l'accès aux tables sociales.
import { withNetworkTimeout } from './networkTimeout.js'
import { SUPA_URL } from './supabase.js'
import { authFetch } from './auth.js'

export const rest = (path) => `${SUPA_URL}/rest/v1/${path}`
export const enc = encodeURIComponent

// Erreur de l'API, avec le message de la base quand il y en a un (par exemple
// « Trop d'envois (mur de la classe) : patiente un peu… »).
async function erreur(res, quoi) {
  const d = await res.json().catch(() => ({}))
  const e = new Error(d?.message || `${quoi} ${res.status}`)
  e.status = res.status
  return e
}

export async function getJSON(url) {
  const res = await withNetworkTimeout(signal => authFetch(url,{signal}))
  if (!res.ok) throw await erreur(res, 'GET')
  return res.json()
}

export async function send(method, path, body, prefer) {
  const res = await withNetworkTimeout(signal => authFetch(rest(path), {
    signal,
    method,
    headers: prefer ? { Prefer: prefer } : {},
    body: body ? JSON.stringify(body) : undefined,
  }))
  if (!res.ok) throw await erreur(res, method)
  return res
}

// Fonction de la base (/rest/v1/rpc/<nom>).
export async function rpc(nom, args = {}) {
  const res = await withNetworkTimeout(signal => authFetch(rest(`rpc/${nom}`), { signal, method: 'POST', body: JSON.stringify(args) }))
  if (!res.ok) throw await erreur(res, nom)
  const texte = await res.text()
  return texte ? JSON.parse(texte) : null
}
