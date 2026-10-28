// RévizSTMG : logique pure des abonnements (offres, prix, signature Stripe,
// correspondance abonnement Stripe → ligne de base). Partagée par les deux
// fonctions et par le site (affichage des prix), donc testable sans réseau.

// Prix TTC en centimes. Source unique : le site affiche ces montants, Stripe les
// facture via les « lookup_key » (un prix = une clé, modifiable sans toucher au code).
export const OFFRES = {
  premium: {
    nom: 'Premium',
    mensuel: { cle: 'revizstmg_premium_mensuel', centimes: 999 },
    annuel: { cle: 'revizstmg_premium_annuel', centimes: 9000 },
  },
  ultimate: {
    nom: 'Ultimate',
    mensuel: { cle: 'revizstmg_ultimate_mensuel', centimes: 1499 },
    annuel: { cle: 'revizstmg_ultimate_annuel', centimes: 13000 },
  },
}
export const PERIODES = ['mensuel', 'annuel']

export function cleDePrix(offre, periode) {
  const p = OFFRES[offre]?.[periode]
  return p ? p.cle : null
}

// Retrouve l'offre et la période à partir de la clé d'un prix Stripe.
export function offreDeCle(cle) {
  for (const [offre, def] of Object.entries(OFFRES)) {
    for (const periode of PERIODES) if (def[periode].cle === cle) return { offre, periode }
  }
  return null
}

// Statuts Stripe qui donnent droit à l'offre.
export const STATUTS_ACTIFS = ['active', 'trialing', 'past_due']
export const estActif = (ligne) => !!ligne && STATUTS_ACTIFS.includes(ligne.statut) &&
  (!ligne.periode_fin || new Date(ligne.periode_fin).getTime() > Date.now() - 86400000)

// Paramètres d'une session Checkout (corps x-www-form-urlencoded).
export function parametresCheckout({ prixId, userId, email, clientId, siteUrl }) {
  const p = new URLSearchParams()
  p.set('mode', 'subscription')
  p.set('line_items[0][price]', prixId)
  p.set('line_items[0][quantity]', '1')
  p.set('client_reference_id', userId)
  p.set('subscription_data[metadata][user_id]', userId)
  if (clientId) p.set('customer', clientId)
  else if (email) p.set('customer_email', email)
  p.set('success_url', `${siteUrl}/#/offres?paiement=ok`)
  p.set('cancel_url', `${siteUrl}/#/offres?paiement=annule`)
  p.set('locale', 'fr')
  p.set('billing_address_collection', 'auto')
  // Pas de custom_text : refusé par Stripe quand les « Managed Payments » sont actifs (défaut du compte).
  return p
}

// Ligne de la table revizstmg_abonnements à partir d'un objet « subscription » Stripe.
export function ligneDepuisAbonnement(sub, userId, modeTest) {
  const item = sub?.items?.data?.[0]
  const cle = item?.price?.lookup_key
  const o = offreDeCle(cle)
  if (!userId || !o) return null
  const fin = sub.current_period_end ?? item?.current_period_end
  return {
    user_id: userId,
    offre: o.offre,
    periode: o.periode,
    statut: sub.status,
    periode_fin: fin ? new Date(fin * 1000).toISOString() : null,
    annulation_prevue: !!(sub.cancel_at_period_end || sub.cancel_at),
    stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer?.id ?? null,
    stripe_subscription_id: sub.id,
    mode_test: !!modeTest,
    updated_at: new Date().toISOString(),
  }
}

// Vérifie l'en-tête « Stripe-Signature » (t=…,v1=…) : HMAC-SHA256 de « t.corps ».
export async function verifierSignature(corps, entete, secret, maintenant = Date.now(), tolerance = 300) {
  if (!entete || !secret) return false
  const parts = Object.fromEntries(entete.split(',').map((x) => { const i = x.indexOf('='); return [x.slice(0, i), x.slice(i + 1)] }))
  const t = Number(parts.t)
  if (!Number.isFinite(t) || Math.abs(maintenant / 1000 - t) > tolerance) return false
  const cle = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', cle, new TextEncoder().encode(`${t}.${corps}`)))
  const attendu = [...sig].map((b) => b.toString(16).padStart(2, '0')).join('')
  // Plusieurs signatures v1 possibles (rotation du secret).
  const recues = entete.split(',').filter((x) => x.startsWith('v1=')).map((x) => x.slice(3))
  return recues.some((r) => r.length === attendu.length && [...r].reduce((d, c, i) => d | (c.charCodeAt(0) ^ attendu.charCodeAt(i)), 0) === 0)
}
