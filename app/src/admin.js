// Menu administrateur : réservé à deux comptes. Ce fichier ne fait que montrer ou cacher le lien ; la vraie
// protection est dans la base (fonctions revizstmg_admin_*, migration 20261123110000) : un autre compte, même
// en tapant l'adresse /#/admin, reçoit « accès refusé » et ne voit aucune donnée.
import { authFetch, getSession } from './auth.js'
import { SUPA_URL } from './supabase.js'

export const ADMINS = ['donatmatys972@gmail.com', 'gabriel.merlin2872@icloud.com']

export const estAdminProbable = (session = getSession()) => !!session?.token && ADMINS.includes(String(session.user?.email || '').trim().toLowerCase())

// Appelle une fonction de lecture. Renvoie { ok, data } ou { ok:false, refuse:true } si le compte n'est pas administrateur.
export async function appelAdmin(fonction, args = {}) {
  try {
    const res = await authFetch(`${SUPA_URL}/rest/v1/rpc/${fonction}`, { method: 'POST', body: JSON.stringify(args) })
    if (res.status === 401 || res.status === 403) return { ok: false, refuse: true }
    const texte = await res.text()
    let corps = null
    try { corps = texte ? JSON.parse(texte) : null } catch { /* réponse non JSON */ }
    if (!res.ok) return { ok: false, refuse: corps?.code === '42501' || /acces_refuse/.test(texte), erreur: corps?.message || `Erreur ${res.status}` }
    return { ok: true, data: corps }
  } catch (e) {
    return { ok: false, erreur: e?.message || 'Réseau indisponible' }
  }
}

// Les pages comptées « 3 min 20 s », « 1 h 05 ».
export function duree(secondes) {
  const s = Math.round(Number(secondes) || 0)
  if (s < 60) return `${s} s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} min ${String(s % 60).padStart(2, '0')} s`
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`
}

export const dateFr = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('fr-FR', { timeZone: 'Europe/Paris', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}
