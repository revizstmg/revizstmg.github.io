// RévizSTMG : abonnements Premium et Ultimate (Stripe Checkout, mode test d'abord).
//
// Une seule fonction, déployée SANS vérification JWT (le webhook Stripe n'en a pas) :
//  - requête avec l'en-tête « stripe-signature » → webhook Stripe, signature vérifiée ;
//  - sinon POST JSON { action } avec le jeton d'un compte connecté (vérifié ici
//    auprès de Supabase Auth, comme examen-blanc) :
//      etat      → mode (test / réel) et abonnement du compte
//      checkout  → { offre, periode, majeur: true } → URL de paiement Stripe
//      portail   → URL du portail client (changer de carte, résilier)
//
// Secrets (Supabase → Edge Functions → Secrets), jamais dans le dépôt :
//   STRIPE_SECRET_KEY (sk_test_… puis sk_live_…), STRIPE_WEBHOOK_SECRET (whsec_…),
//   SITE_URL (facultatif, défaut https://revizstmg.github.io).
// Sans STRIPE_SECRET_KEY, la fonction répond « not_configured » et le site cache les boutons.
import { STATUTS_ACTIFS, cleDePrix, ligneDepuisAbonnement, parametresCheckout, verifierSignature } from './logique.js'

const env = (k: string) => Deno.env.get(k) || ''
const URL_BASE = env('SUPABASE_URL')
const CLE_SERVICE = env('SUPABASE_SERVICE_ROLE_KEY')
const CLE_ANON = env('SUPABASE_ANON_KEY')
const STRIPE = env('STRIPE_SECRET_KEY')
const SECRET_WEBHOOK = env('STRIPE_WEBHOOK_SECRET')
const SITE = (env('SITE_URL') || 'https://revizstmg.github.io').replace(/\/$/, '')
const MODE_TEST = STRIPE.startsWith('sk_test_') || STRIPE.startsWith('rk_test_')

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, stripe-signature',
}
const json = (corps: unknown, status = 200) =>
  new Response(JSON.stringify(corps), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

async function stripe(chemin: string, methode = 'GET', corps?: URLSearchParams, entetes: Record<string, string> = {}) {
  const r = await fetch(`https://api.stripe.com${chemin}`, {
    method: methode,
    headers: { Authorization: `Bearer ${STRIPE}`, ...(corps ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}), ...entetes },
    body: corps,
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(`stripe_${r.status}:${data?.error?.code || data?.error?.type || 'erreur'}`)
  return data
}

async function base(chemin: string, init: RequestInit = {}) {
  const r = await fetch(`${URL_BASE}/rest/v1/${chemin}`, {
    ...init,
    headers: { apikey: CLE_SERVICE, Authorization: `Bearer ${CLE_SERVICE}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  })
  if (!r.ok) throw new Error(`base_${r.status}`)
  const t = await r.text()
  return t ? JSON.parse(t) : null
}

async function utilisateur(req: Request) {
  const jeton = req.headers.get('authorization') || ''
  if (!/^Bearer .{20,}/.test(jeton)) return null
  const r = await fetch(`${URL_BASE}/auth/v1/user`, { headers: { Authorization: jeton, apikey: CLE_ANON } })
  if (!r.ok) return null
  const u = await r.json().catch(() => null)
  if (!u?.id || u.is_anonymous) return null
  return u as { id: string; email?: string }
}

const ligneDuCompte = async (id: string) =>
  ((await base(`revizstmg_abonnements?user_id=eq.${encodeURIComponent(id)}&select=*`)) || [])[0] || null

async function enregistrer(ligne: Record<string, unknown>) {
  await base('revizstmg_abonnements?on_conflict=user_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(ligne),
  })
}

// ---- Webhook Stripe --------------------------------------------------------
async function webhook(req: Request) {
  const corps = await req.text()
  if (!SECRET_WEBHOOK || !(await verifierSignature(corps, req.headers.get('stripe-signature'), SECRET_WEBHOOK))) {
    return json({ error: 'signature_invalide' }, 400)
  }
  const evenement = JSON.parse(corps)
  // Un événement du mode opposé (test ou réel) n'est jamais appliqué : aucun abonnement de test en réel.
  if (evenement.livemode === MODE_TEST) return json({ recu: true, ignore: 'mode' })
  const type: string = evenement.type
  const obj = evenement.data?.object
  let sub: any = null
  let userId: string | null = null
  if (type === 'checkout.session.completed' && obj?.mode === 'subscription' && obj.subscription) {
    sub = await stripe(`/v1/subscriptions/${obj.subscription}?expand[]=items.data.price`)
    userId = obj.client_reference_id || sub.metadata?.user_id || null
  } else if (type.startsWith('customer.subscription.')) {
    userId = obj.metadata?.user_id || null
    if (!userId && typeof obj.customer === 'string') {
      const l = ((await base(`revizstmg_abonnements?stripe_customer_id=eq.${encodeURIComponent(obj.customer)}&select=user_id`)) || [])[0]
      userId = l?.user_id || null
    }
    // État actuel chez Stripe : les événements peuvent arriver dans le désordre.
    try { sub = await stripe(`/v1/subscriptions/${encodeURIComponent(obj.id)}?expand[]=items.data.price`) } catch { sub = obj }
  }
  if (sub && userId) {
    const ligne = ligneDepuisAbonnement(sub, userId, !evenement.livemode)
    if (ligne) {
      // Un autre abonnement encore actif est déjà enregistré : l'état d'un ancien ne l'écrase pas.
      const existante = STATUTS_ACTIFS.includes(sub.status) ? null : await ligneDuCompte(userId)
      if (existante?.stripe_subscription_id && existante.stripe_subscription_id !== sub.id && STATUTS_ACTIFS.includes(existante.statut)) return json({ recu: true, ignore: 'ancien_abonnement' })
      try { await enregistrer(ligne) } catch (e) {
        // Compte supprimé entre-temps : on n'encaisse pas pour un compte qui n'existe plus.
        if ((e as Error).message === 'base_409') {
          try { await stripe(`/v1/subscriptions/${encodeURIComponent(sub.id)}`, 'DELETE') } catch { /* déjà résilié */ }
          return json({ recu: true, ignore: 'compte_supprime' })
        }
        throw e
      }
    }
  }
  return json({ recu: true })
}

// ---- Actions du site -------------------------------------------------------
async function action(req: Request) {
  if (!STRIPE) return json({ error: 'not_configured' }, 503)
  const u = await utilisateur(req)
  if (!u) return json({ error: 'login_required' }, 401)
  const corps = await req.json().catch(() => ({}))
  const brute = await ligneDuCompte(u.id)
  // Une ligne issue de l'autre mode (test ou réel) est ignorée : jamais d'abonnement de test en réel.
  const ligne = brute && brute.mode_test === MODE_TEST ? brute : null
  const remise = brute && !ligne
    ? { statut: 'aucun', offre: null, periode: null, periode_fin: null, annulation_prevue: false, stripe_subscription_id: null }
    : {}

  if (corps.action === 'etat') {
    // Seulement ce que le site affiche : pas les identifiants Stripe.
    const { offre, periode, statut, periode_fin, annulation_prevue, mode_test } = ligne || {} as Record<string, unknown>
    return json({ mode: MODE_TEST ? 'test' : 'reel', abonnement: ligne ? { offre, periode, statut, periode_fin, annulation_prevue, mode_test } : null })
  }

  // Client Stripe : créé une fois par compte, retenu en base.
  const clientStripe = async () => {
    if (ligne?.stripe_customer_id) return ligne.stripe_customer_id as string
    const p = new URLSearchParams()
    if (u.email) p.set('email', u.email)
    p.set('metadata[user_id]', u.id)
    // Clé d'idempotence : deux demandes simultanées ne créent pas deux clients.
    const c = await stripe('/v1/customers', 'POST', p, { 'Idempotency-Key': `cus-${u.id}-${MODE_TEST ? 'test' : 'reel'}` })
    await enregistrer({ user_id: u.id, stripe_customer_id: c.id, mode_test: MODE_TEST, ...remise, updated_at: new Date().toISOString() })
    return c.id as string
  }

  // Avant la suppression d'un compte : résilie tout de suite l'abonnement (sinon le prélèvement continuerait).
  if (corps.action === 'resilier') {
    if (!ligne?.stripe_subscription_id || !STATUTS_ACTIFS.includes(ligne.statut)) return json({ ok: true, aucun: true })
    try { await stripe(`/v1/subscriptions/${encodeURIComponent(ligne.stripe_subscription_id)}`, 'DELETE') } catch (e) {
      if (!String((e as Error).message).includes('resource_missing')) throw e
    }
    return json({ ok: true })
  }

  if (corps.action === 'checkout') {
    if (corps.majeur !== true) return json({ error: 'majeur_requis' }, 400)
    const cle = cleDePrix(corps.offre, corps.periode)
    if (!cle) return json({ error: 'offre_inconnue' }, 400)
    if (ligne && STATUTS_ACTIFS.includes(ligne.statut)) return json({ error: 'deja_abonne' }, 409)
    // Contrôle chez Stripe aussi : deux onglets ou un webhook en retard ne doivent pas doubler l'abonnement.
    if (ligne?.stripe_customer_id) {
      const existants = await stripe(`/v1/subscriptions?customer=${encodeURIComponent(ligne.stripe_customer_id)}&status=all&limit=10`)
      if ((existants.data || []).some((a: any) => STATUTS_ACTIFS.includes(a.status))) return json({ error: 'deja_abonne' }, 409)
    }
    const prix = await stripe(`/v1/prices?lookup_keys[]=${encodeURIComponent(cle)}&active=true&limit=1`)
    const prixId = prix.data?.[0]?.id
    if (!prixId) return json({ error: 'prix_introuvable' }, 503)
    const session = await stripe('/v1/checkout/sessions', 'POST',
      parametresCheckout({ prixId, userId: u.id, clientId: await clientStripe(), siteUrl: SITE }))
    return json({ url: session.url })
  }

  if (corps.action === 'portail') {
    if (!ligne?.stripe_customer_id) return json({ error: 'aucun_abonnement' }, 404)
    const p = new URLSearchParams({ customer: ligne.stripe_customer_id, return_url: `${SITE}/#/offres` })
    const s = await stripe('/v1/billing_portal/sessions', 'POST', p)
    return json({ url: s.url })
  }
  return json({ error: 'action_inconnue' }, 400)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })
  if (req.method !== 'POST') return json({ error: 'methode' }, 405)
  try {
    return req.headers.get('stripe-signature') ? await webhook(req) : await action(req)
  } catch (e) {
    console.error('paiement', (e as Error).message)
    return json({ error: 'erreur_serveur' }, 500)
  }
})
