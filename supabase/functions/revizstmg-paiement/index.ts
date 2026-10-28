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
import { cleDePrix, ligneDepuisAbonnement, parametresCheckout, verifierSignature } from './logique.js'

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

async function stripe(chemin: string, methode = 'GET', corps?: URLSearchParams) {
  const r = await fetch(`https://api.stripe.com${chemin}`, {
    method: methode,
    headers: { Authorization: `Bearer ${STRIPE}`, ...(corps ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}) },
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
  ((await base(`revizstmg_abonnements?user_id=eq.${id}&select=*`)) || [])[0] || null

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
  const type: string = evenement.type
  const obj = evenement.data?.object
  let sub: any = null
  let userId: string | null = null
  if (type === 'checkout.session.completed' && obj?.mode === 'subscription' && obj.subscription) {
    sub = await stripe(`/v1/subscriptions/${obj.subscription}?expand[]=items.data.price`)
    userId = obj.client_reference_id || sub.metadata?.user_id || null
  } else if (type.startsWith('customer.subscription.')) {
    sub = obj
    userId = obj.metadata?.user_id || null
    if (!userId && typeof obj.customer === 'string') {
      const l = ((await base(`revizstmg_abonnements?stripe_customer_id=eq.${obj.customer}&select=user_id`)) || [])[0]
      userId = l?.user_id || null
    }
  }
  if (sub && userId) {
    const ligne = ligneDepuisAbonnement(sub, userId, !evenement.livemode)
    if (ligne) await enregistrer(ligne)
  }
  return json({ recu: true })
}

// ---- Actions du site -------------------------------------------------------
async function action(req: Request) {
  if (!STRIPE) return json({ error: 'not_configured' }, 503)
  const u = await utilisateur(req)
  if (!u) return json({ error: 'login_required' }, 401)
  const corps = await req.json().catch(() => ({}))
  const ligne = await ligneDuCompte(u.id)

  if (corps.action === 'etat') return json({ mode: MODE_TEST ? 'test' : 'reel', abonnement: ligne })

  // Client Stripe : créé une fois par compte, retenu en base.
  const clientStripe = async () => {
    if (ligne?.stripe_customer_id) return ligne.stripe_customer_id as string
    const p = new URLSearchParams()
    if (u.email) p.set('email', u.email)
    p.set('metadata[user_id]', u.id)
    const c = await stripe('/v1/customers', 'POST', p)
    await enregistrer({ user_id: u.id, stripe_customer_id: c.id, mode_test: MODE_TEST, updated_at: new Date().toISOString() })
    return c.id as string
  }

  if (corps.action === 'checkout') {
    if (corps.majeur !== true) return json({ error: 'majeur_requis' }, 400)
    const cle = cleDePrix(corps.offre, corps.periode)
    if (!cle) return json({ error: 'offre_inconnue' }, 400)
    if (ligne && ['active', 'trialing', 'past_due'].includes(ligne.statut)) return json({ error: 'deja_abonne' }, 409)
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
