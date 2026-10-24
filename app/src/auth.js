// Comptes prof / élève via Supabase Auth (GoTrue) + table `profiles`.
// Le site reste statique : on parle directement à l'API Auth et REST de Supabase
// avec la clé publique. La session (jeton) est conservée en local ET rafraîchie
// automatiquement grâce au refresh_token, pour rester connecté durablement.
import {withNetworkTimeout} from './networkTimeout.js'
import { SUPA_URL, SUPA_ANON } from './supabase.js'

const SESSION_KEY = 'stmg_session'

export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') } catch { return null }
}
function saveSession(data) {
  const now = Math.floor(Date.now() / 1000)
  // GoTrue renvoie expires_at (unix) et/ou expires_in (secondes).
  const expires_at = Number(data.expires_at) || (data.expires_in ? now + Number(data.expires_in) : now + 3600)
  const prev = getSession()
  const s = {
    token: data.access_token,
    refresh: data.refresh_token || prev?.refresh,
    user: data.user || prev?.user,
    expires_at,
  }
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)) } catch { /* ignore */ }
  if(typeof window!=='undefined')window.dispatchEvent(new Event('stmg-session-change'))
  return s
}
export function clearSession() {
  try { localStorage.removeItem(SESSION_KEY) } catch { /* ignore */ }
  if(typeof window!=='undefined')window.dispatchEvent(new Event('stmg-session-change'))
}
export function isSignedIn() { return !!getSession()?.token }

// Messages de Supabase Auth (en anglais) traduits pour l'élève.
const MESSAGES_AUTH = [
  [/invalid login credentials|invalid_grant/i, 'E-mail ou mot de passe incorrect.'],
  [/already registered|already exists/i, 'Un compte existe déjà avec cette adresse : connecte-toi.'],
  [/email not confirmed/i, 'Confirme d’abord ton adresse e-mail grâce au lien reçu.'],
  [/password.*(should|weak|short|pwned|leaked|known)/i, 'Mot de passe trop faible : 8 caractères minimum, avec des lettres et des chiffres.'],
  [/rate limit|too many|only request this after|for security purposes/i, 'Trop de tentatives : réessaie dans quelques minutes.'],
  [/invalid.*email|email.*invalid|unable to validate email/i, 'Adresse e-mail invalide.'],
  [/(token|otp|code).*(expired|invalid)/i, 'Code invalide ou expiré.'],
  [/signups? (not allowed|disabled)/i, 'Les inscriptions sont fermées pour le moment.'],
]
export function messageAuth(status, brut) {
  const trouve = MESSAGES_AUTH.find(([motif]) => motif.test(brut || ''))
  if (trouve) return trouve[1]
  if (status === 429) return 'Trop de tentatives : réessaie dans quelques minutes.'
  return brut || `Erreur ${status}`
}

async function gotrue(path, body) {
  let res
  try {
    res = await fetch(`${SUPA_URL}/auth/v1/${path}`, {
      method: 'POST',
      headers: { apikey: SUPA_ANON, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('Pas de connexion : réessaie une fois en ligne.')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(messageAuth(res.status, data.error_description || data.msg || data.message || data.error_code))
  return data
}

// --- Rafraîchissement du jeton -------------------------------------------
// Le jeton d'accès expire (~1 h). On l'échange contre un nouveau grâce au
// refresh_token pour que l'utilisateur reste connecté sans se ré-identifier.
const sameSession = (a, b) => a?.token === b?.token && a?.refresh === b?.refresh && a?.user?.id === b?.user?.id
let _refreshing = null
export async function refreshSession() {
  const s = getSession()
  if (!s?.refresh) return null
  if (_refreshing && sameSession(_refreshing.session, s)) return _refreshing.promise
  const p = (async () => {
    let res
    try {
      res = await fetch(`${SUPA_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: { apikey: SUPA_ANON, 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: s.refresh }),
      })
    } catch {
      return null // réseau indisponible : on garde la session, on réessaiera.
    }
    if (!sameSession(s, getSession())) return null
    if (res.ok) {
      const data = await res.json().catch(() => null)
      if (!sameSession(s, getSession())) return null
      if (data?.access_token) return saveSession(data)
      return null
    }
    // 400/401 = refresh_token invalide/expiré : la session est terminée.
    if (res.status === 400 || res.status === 401) clearSession()
    return null
  })()
  const pending = { session: s, promise: p }
  _refreshing = pending
  try { return await p } finally { if (_refreshing === pending) _refreshing = null }
}

// Renvoie un jeton valide (rafraîchi si sur le point d'expirer), sinon null.
export async function getValidToken() {
  const s = getSession()
  if (!s?.token) return null
  const exp = Number(s.expires_at) || 0
  if (exp && Date.now() / 1000 >= exp - 120) {
    const ns = await refreshSession()
    return ns?.token || getSession()?.token || null
  }
  return s.token
}

// Requête REST/Auth authentifiée : jeton frais + une nouvelle tentative après
// rafraîchissement si le serveur répond 401 (jeton expiré entre-temps). Sans
// session, la requête part avec la clé publique seule (rôle anon).
export async function authFetch(url, opts = {}) {
  const owner = getSession()?.user?.id
  const assertOwner = () => {
    if (getSession()?.user?.id !== owner) throw new Error('La session a changé. Reconnecte-toi.')
  }
  const token = await getValidToken()
  assertOwner()
  const build = (t) => ({
    ...opts,
    headers: {
      apikey: SUPA_ANON,
      Authorization: 'Bearer ' + (t || SUPA_ANON),
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  })
  let res = await fetch(url, build(token))
  assertOwner()
  if (res.status === 401) {
    const ns = await refreshSession()
    assertOwner()
    if (ns?.token) res = await fetch(url, build(ns.token))
    assertOwner()
    if(res.status===401 && getSession()?.user?.id===owner) clearSession()
  }
  return res
}

// Crée un compte. Renvoie { needsConfirm } si l'e-mail doit être confirmé.
// redirect_to : le lien de confirmation ramène sur RévizSTMG. Sans lui, Supabase
// renvoie vers l'adresse par défaut du projet, qui est celle de NAH (projet
// partagé). L'adresse doit figurer dans les « Redirect URLs » de Supabase.
export async function signUp({ email, password }) {
  const data = await gotrue(`signup?redirect_to=${encodeURIComponent(oauthRedirectTarget())}`, { email, password })
  if (data.access_token) { saveSession(data); return { needsConfirm: false } }
  return { needsConfirm: true }
}

export async function signIn({ email, password }) {
  const data = await gotrue('token?grant_type=password', { email, password })
  if (!data.access_token) throw new Error('Identifiants invalides')
  saveSession(data)
  return true
}

// Déconnexion : la session est effacée de l'appareil tout de suite, puis
// fermée sur le serveur (le jeton de renouvellement n'y vaut plus rien). Hors
// ligne, la fermeture côté serveur échoue sans bruit : le jeton d'accès expire
// alors de lui-même au bout d'une heure.
export function signOut() {
  const s = getSession()
  clearSession()
  if (!s?.token) return
  try {
    fetch(`${SUPA_URL}/auth/v1/logout?scope=local`, {
      method: 'POST',
      keepalive: true,
      headers: { apikey: SUPA_ANON, Authorization: 'Bearer ' + s.token },
    }).catch(() => {})
  } catch { /* pas de réseau */ }
}

// --- Connexion via un fournisseur (Google, Apple…) -----------------------
// Le site étant statique, on utilise le flux OAuth « implicite » de Supabase :
// on redirige vers la page d'autorisation du fournisseur, et au retour les
// jetons arrivent dans le fragment d'URL (#access_token=…), que l'on consomme
// au chargement. Les fournisseurs doivent être activés côté Supabase.
function oauthRedirectTarget() {
  // On revient sur la même page, sans hash de routage (HashRouter reprend après).
  return window.location.origin + window.location.pathname
}
export function signInWithOAuth(provider) {
  const params = new URLSearchParams({ provider, redirect_to: oauthRedirectTarget() })
  // Google : forcer le SÉLECTEUR de compte (« Choisissez un compte ») pour que
  // l'utilisateur choisisse directement parmi ses comptes déjà connectés, sans
  // ressaisir e-mail/mot de passe Google.
  if (provider === 'google') params.set('prompt', 'select_account')
  window.location.assign(`${SUPA_URL}/auth/v1/authorize?${params.toString()}`)
}
// Fournisseurs OAuth réellement activés côté Supabase (pour n'afficher que les
// boutons qui fonctionnent). Renvoie p.ex. { google: true, apple: false, … }.
export async function fetchAuthProviders() {
  try {
    const res = await fetch(`${SUPA_URL}/auth/v1/settings`, { headers: { apikey: SUPA_ANON } })
    if (!res.ok) return {}
    const data = await res.json().catch(() => ({}))
    return data.external || {}
  } catch { return {} }
}

// Détecte (de façon synchrone) un retour de fournisseur dans l'URL.
export function hasOAuthRedirect() {
  try {
    const h = (window.location.hash || '').replace(/^#\/?/, '')
    return /(?:^|&)access_token=/.test(h) || /(?:^|&)error=/.test(h)
  } catch { return false }
}
async function getUser(token) {
  try {
    const res = await fetch(`${SUPA_URL}/auth/v1/user`, { headers: { apikey: SUPA_ANON, Authorization: 'Bearer ' + token } })
    if (!res.ok) return null
    return await res.json().catch(() => null)
  } catch { return null }
}
// Consomme le retour OAuth : enregistre la session, nettoie l'URL. Renvoie
// { ok, user } en cas de succès, { error } en cas d'échec, null si rien à faire.
export async function consumeOAuthRedirect() {
  const h = (window.location.hash || '').replace(/^#\/?/, '')
  const params = new URLSearchParams(h)
  const cleanHash = () => { try { history.replaceState(null, '', window.location.pathname + window.location.search) } catch { /* ignore */ } }
  if (params.get('error')) { const e = params.get('error_description') || params.get('error'); cleanHash(); return { error: decodeURIComponent(e.replace(/\+/g, ' ')) } }
  const access_token = params.get('access_token')
  if (!access_token) return null
  const user = await getUser(access_token)
  saveSession({ access_token, refresh_token: params.get('refresh_token'), expires_in: params.get('expires_in'), user })
  cleanHash()
  return { ok: true, user }
}

// Mot de passe oublié : envoie un e-mail de récupération (lien + code OTP selon
// le modèle d'e-mail configuré dans Supabase).
export async function requestPasswordReset(email) {
  await gotrue('recover', { email })
  return true
}

// Vérifie le code reçu par e-mail (type « recovery ») et ouvre une session.
export async function verifyRecovery({ email, token }) {
  const data = await gotrue('verify', { type: 'recovery', email, token: String(token || '').trim() })
  if (!data.access_token) throw new Error('Code invalide ou expiré')
  saveSession(data)
  return true
}

// Change le mot de passe de l'utilisateur connecté (session courante).
export async function updatePassword(password) {
  const s = getSession()
  if (!s?.token) throw new Error('no session')
  const res = await withNetworkTimeout(signal=>authFetch(`${SUPA_URL}/auth/v1/user`, {
    signal,method: 'PUT',
    body: JSON.stringify({ password }),
  }))
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error_description || d.msg || d.message || `Erreur ${res.status}`) }
  return true
}

// Crée / met à jour la fiche profil (role, name, class_code, level, specialty…).
export async function upsertProfile(patch) {
  const s = getSession()
  if (!s?.token || !s.user?.id) throw new Error('no session')
  const row = { id: s.user.id, email: s.user.email, ...patch, updated_at: new Date().toISOString() }
  const res = await authFetch(`${SUPA_URL}/rest/v1/profiles?on_conflict=id`, {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify([row]),
  })
  if (!res.ok) throw new Error('profile ' + res.status)
  const rows = await res.json().catch(() => [])
  return rows[0] || row
}

// Sauvegarde la progression (jsonb) sur la ligne profil de l'utilisateur connecté,
// seulement si la copie du compte est toujours la version `attendu` (null :
// copie jamais écrite par cette version de l'application). Renvoie { ok },
// { conflit: progression du compte } si un autre appareil l'a changée entre-
// temps (à fusionner avant de renvoyer), ou { raison } en cas d'échec.
export async function envoyerProgression(progress, attendu, { keepalive = false } = {}) {
  const s = getSession()
  if (!s?.token || !s.user?.id) return { ok: false, raison: 'session' }
  const body = JSON.stringify({ progress: progress || {}, updated_at: new Date().toISOString() })
  const version = attendu == null ? 'is.null' : `eq.${attendu}`
  let res
  try {
    res = await authFetch(`${SUPA_URL}/rest/v1/profiles?id=eq.${s.user.id}&progress->_sync->>rev=${version}&select=id`, {
      method: 'PATCH',
      // Envoi qui survit à la fermeture de la page (limité à 64 Ko par le navigateur).
      keepalive: keepalive && body.length < 60000,
      headers: { Prefer: 'return=representation' },
      body,
    })
  } catch (e) {
    return { ok: false, raison: /session/i.test(e?.message || '') ? 'session' : 'reseau' }
  }
  if (!res.ok) return { ok: false, raison: 'serveur', status: res.status }
  const rows = await res.json().catch(() => [])
  if (Array.isArray(rows) && rows.length) return { ok: true }
  // Aucune ligne modifiée : la copie du compte a changé, ou le profil manque.
  let profil
  try { profil = await fetchProfile() } catch (e) {
    return { ok: false, raison: /session/i.test(e?.message || '') ? 'session' : 'reseau' }
  }
  if (!profil) return { ok: false, raison: 'profil' }
  const rev = progress?._sync?.rev
  if (rev != null && profil.progress?._sync?.rev === rev) return { ok: true }
  return { ok: false, conflit: profil.progress || {} }
}

// RGPD : supprime le compte et tout ce que l'élève a publié (profil et
// progression, classe, amis et duels, suivi parent, classes d'un professeur),
// e-mail de connexion compris (fonction revizstmg_supprimer_compte de la base).
export async function supprimerCompte() {
  const s = getSession()
  if (!s?.token) throw new Error('no session')
  const res = await authFetch(`${SUPA_URL}/rest/v1/rpc/revizstmg_supprimer_compte`, { method: 'POST', body: '{}' })
  if (!res.ok) throw new Error('suppression ' + res.status)
  return true
}

export async function fetchProfile() {
  const s = getSession()
  if (!s?.token || !s.user?.id) return null
  const res = await authFetch(`${SUPA_URL}/rest/v1/profiles?id=eq.${s.user.id}&select=*`)
  if (!res.ok) return null
  const rows = await res.json().catch(() => [])
  if (getSession()?.user?.id !== s.user.id) throw new Error('La session a changé. Reconnecte-toi.')
  return rows[0] || null
}
