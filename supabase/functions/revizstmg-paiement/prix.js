import { OFFRES, ANCIENNES_CLES, cleDePrix, TARIFS_VERSION } from './logique.js'

// Ne crée un prix que pour une nouvelle souscription authentifiée. Les anciennes
// clés Stripe sont conservées, notamment pour les webhooks des abonnements existants.
export function prixConforme(prix, centimes) {
  return !!prix?.id && prix.active === true && prix.unit_amount === centimes &&
    prix.currency === 'eur' && prix.type === 'recurring' && prix.billing_scheme === 'per_unit' &&
    prix.recurring?.interval === 'month' && prix.recurring.interval_count === 1 &&
    prix.recurring.usage_type === 'licensed' && !prix.transform_quantity && prix.tax_behavior !== 'exclusive'
}

export async function obtenirPrixStripe({ offre, periode, stripe }) {
  const cle = cleDePrix(offre, periode)
  if (!cle) throw new Error('offre_inconnue')
  const definition = OFFRES[offre][periode]
  const chercher = async key => {
    const result = await stripe(`/v1/prices?lookup_keys[]=${encodeURIComponent(key)}&active=true&limit=1`)
    return result.data?.[0]
  }
  const courant = await chercher(cle)
  if (courant) {
    if (!prixConforme(courant, definition.centimes)) throw new Error('prix_incoherent')
    return courant.id
  }
  const ancien = await chercher(ANCIENNES_CLES[offre])
  const produit = typeof ancien?.product === 'string' ? ancien.product : ancien?.product?.id
  if (!produit || !/^prod_[A-Za-z0-9]+$/.test(produit)) throw new Error('prix_introuvable')
  const body = new URLSearchParams({ product: produit, currency: 'eur', unit_amount: String(definition.centimes),
    'recurring[interval]': 'month', 'recurring[interval_count]': '1', 'recurring[usage_type]': 'licensed',
    tax_behavior: 'inclusive', lookup_key: cle, 'metadata[offre]': offre, 'metadata[periode]': periode,
    'metadata[catalogue]': TARIFS_VERSION })
  const nouveau = await stripe('/v1/prices', 'POST', body, {
    'Idempotency-Key': `revizstmg-prix-${offre}-${periode}-eur-${definition.centimes}`,
  })
  if (!prixConforme(nouveau, definition.centimes)) throw new Error('prix_incoherent')
  return nouveau.id
}
