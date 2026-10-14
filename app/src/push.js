// Rappels de révision « push » : le téléphone reçoit le rappel même quand
// l'application est fermée. Le navigateur s'abonne auprès de son service de
// notification (clé publique VAPID du projet), et l'abonnement est enregistré
// dans la base avec l'heure choisie (revizstmg_push_abonner). Toutes les
// 10 minutes, la fonction Edge « revizstmg-rappels » prévient les abonnés dont
// l'heure est venue et qui n'ont pas encore révisé ce jour-là
// (supabase/README.md). Il faut un compte ; sur iPhone, l'app installée sur
// l'écran d'accueil (iOS 16.4 ou plus).
import { rpc } from './reseau.js'
import { isSignedIn } from './auth.js'

export function pushPossible() {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && typeof Notification !== 'undefined'
}

const octets = (b64url) => {
  const b64 = (b64url + '='.repeat((4 - (b64url.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
}

// « 18:30 » → 1110 (minutes depuis minuit).
export function minuteDuJour(heure) {
  const [h, m] = String(heure || '18:00').split(':').map(Number)
  return Math.max(0, Math.min(1439, (Number.isFinite(h) ? h : 18) * 60 + (Number.isFinite(m) ? m : 0)))
}

// Abonne cet appareil (ou met à jour l'heure). Renvoie true si c'est fait.
export async function activerRappelsPush(heure) {
  if (!pushPossible() || !isSignedIn() || Notification.permission !== 'granted') return false
  const cle = await rpc('revizstmg_push_cle')
  if (!cle) return false
  const reg = await navigator.serviceWorker.ready
  let abonnement = await reg.pushManager.getSubscription()
  if (!abonnement) abonnement = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: octets(cle) })
  const j = abonnement.toJSON()
  let fuseau = 'Europe/Paris'
  try { fuseau = Intl.DateTimeFormat().resolvedOptions().timeZone || fuseau } catch { /* fuseau par défaut */ }
  await rpc('revizstmg_push_abonner', { p_endpoint: j.endpoint, p_p256dh: j.keys?.p256dh || '', p_auth: j.keys?.auth || '', p_minute: minuteDuJour(heure), p_fuseau: fuseau })
  return true
}

// Arrête les rappels sur cet appareil.
export async function desactiverRappelsPush() {
  if (!pushPossible()) return
  try {
    const reg = await navigator.serviceWorker.ready
    const abonnement = await reg.pushManager.getSubscription()
    if (!abonnement) return
    if (isSignedIn()) await rpc('revizstmg_push_desabonner', { p_endpoint: abonnement.endpoint }).catch(() => {})
    await abonnement.unsubscribe()
  } catch { /* pas d'abonnement */ }
}
