// Rappels de révision « push » : le téléphone reçoit le rappel même quand
// l'application est fermée. Le navigateur s'abonne auprès de son service de
// notification (clé publique VAPID du projet), et l'abonnement est enregistré
// dans la base avec l'heure choisie (revizstmg_push_abonner). Toutes les
// 10 minutes, la fonction Edge « revizstmg-rappels » prévient les abonnés dont
// l'heure est venue et qui n'ont pas encore révisé ce jour-là
// (supabase/README.md). Il faut un compte ; sur iPhone, l'app installée sur
// l'écran d'accueil (iOS 16.4 ou plus).
import { rpc } from './reseau.js'
import { getSession, isSignedIn } from './auth.js'
import { withNetworkTimeout } from './networkTimeout.js'

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

// Une seule intention courante ; les écritures serveur restent ordonnées.
let derniere = null
let ecritures = Promise.resolve()
let fenetreObservee = null
function observerSession() {
  if (typeof window === 'undefined' || fenetreObservee === window) return
  fenetreObservee = window
  const verifier = () => {
    if (derniere && derniere.owner !== (getSession()?.user?.id || null)) derniere = null
  }
  window.addEventListener?.('stmg-session-change', verifier)
  window.addEventListener?.('storage', e => { if (e.key === 'stmg_session' || e.key === null) verifier() })
}
function intention(on, valide = () => true) {
  observerSession()
  const operation = { on, owner: getSession()?.user?.id || null, valide }
  derniere = operation
  return operation
}
const actuelle = operation => derniere === operation && operation.owner === (getSession()?.user?.id || null) && operation.valide()
function ecrire(operation, nom, args, valide = () => true) {
  const travail = ecritures.then(async () => {
    if (!actuelle(operation) || !valide()) return false
    await withNetworkTimeout(() => rpc(nom, args), 16000)
    return actuelle(operation)
  })
  ecritures = travail.catch(() => {})
  return travail
}
// Une souscription native n'est pas annulable. Si elle arrive après un arrêt,
// la retirer, mais jamais au détriment d'une nouvelle activation en cours.
async function retirerObsolete(abonnement, operation) {
  if (!abonnement || (derniere?.on && derniere !== operation)) return
  try { await withNetworkTimeout(() => abonnement.unsubscribe(), 3000) } catch { /* tentative locale bornée */ }
}

// Abonne cet appareil (ou met à jour l'heure). Renvoie true seulement si
// l'intention est toujours courante après son enregistrement.
export async function activerRappelsPush(heure, valide = () => true) {
  const operation = intention(true, valide)
  if (!pushPossible() || !isSignedIn() || Notification.permission !== 'granted') return false
  try {
    return await withNetworkTimeout(async signal => {
      const courant = () => !signal.aborted && actuelle(operation)
      const cle = await rpc('revizstmg_push_cle')
      if (!courant() || !cle) return false
      const reg = await withNetworkTimeout(() => navigator.serviceWorker.ready, 3000)
      if (!courant()) return false
      let abonnement = await reg.pushManager.getSubscription()
      if (!courant()) return false
      if (!abonnement) {
        abonnement = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: octets(cle) })
        if (!courant()) { await retirerObsolete(abonnement, operation); return false }
      }
      const j = abonnement.toJSON()
      let fuseau = 'Europe/Paris'
      try { fuseau = Intl.DateTimeFormat().resolvedOptions().timeZone || fuseau } catch { /* fuseau par défaut */ }
      if (!courant()) return false
      const ok = await ecrire(operation, 'revizstmg_push_abonner', { p_endpoint: j.endpoint, p_p256dh: j.keys?.p256dh || '', p_auth: j.keys?.auth || '', p_minute: minuteDuJour(heure), p_fuseau: fuseau }, courant)
      return courant() && ok
    }, 20000)
  } catch { return false }
}

// Les API natives peuvent rester suspendues. L'arrêt invalide immédiatement
// l'activation précédente ; son nettoyage ne peut toucher le compte suivant.
export async function desactiverRappelsPush() {
  const operation = intention(false)
  if (!pushPossible()) return true
  try {
    return await withNetworkTimeout(async signal => {
      const courant = () => !signal.aborted && actuelle(operation)
      const reg = await withNetworkTimeout(() => navigator.serviceWorker.ready, 3000)
      if (!courant()) return false
      const abonnement = await reg.pushManager.getSubscription()
      if (!courant()) return false
      if (!abonnement) return true
      // En file derrière une inscription déjà partie : même si l'interface
      // atteint son délai, l'arrêt courant peut encore la retirer côté serveur.
      let serveur = true
      if (isSignedIn()) {
        try { serveur = await ecrire(operation, 'revizstmg_push_desabonner', { p_endpoint: abonnement.endpoint }) } catch { serveur = false }
      }
      if (!courant()) return false
      const stopped = await abonnement.unsubscribe()
      return courant() && stopped !== false && serveur
    }, 6000)
  } catch { return false }
}
