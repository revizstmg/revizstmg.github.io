import { describe, it, expect } from 'vitest'
import { OFFRES, cleDePrix, offreDeCle, parametresCheckout, ligneDepuisAbonnement, verifierSignature, estActif } from '../../supabase/functions/revizstmg-paiement/logique.js'

const hmac = async (secret, t, corps) => {
  const cle = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return [...new Uint8Array(await crypto.subtle.sign('HMAC', cle, new TextEncoder().encode(`${t}.${corps}`)))].map((b) => b.toString(16).padStart(2, '0')).join('')
}

describe('offres et prix', () => {
  it('les prix TTC décidés par le propriétaire', () => {
    expect(OFFRES.premium.mensuel.centimes).toBe(999)
    expect(OFFRES.premium.annuel.centimes).toBe(9000)
    expect(OFFRES.ultimate.mensuel.centimes).toBe(1499)
    expect(OFFRES.ultimate.annuel.centimes).toBe(13000)
  })
  it('chaque offre et période a une clé Stripe unique, retrouvée à l’envers', () => {
    const cles = []
    for (const o of Object.keys(OFFRES)) for (const p of ['mensuel', 'annuel']) {
      const c = cleDePrix(o, p)
      cles.push(c)
      expect(offreDeCle(c)).toEqual({ offre: o, periode: p })
    }
    expect(new Set(cles).size).toBe(4)
    expect(cleDePrix('gratuit', 'mensuel')).toBeNull()
    expect(cleDePrix('premium', 'hebdo')).toBeNull()
  })
})

describe('session de paiement', () => {
  it('abonnement, client et retours vers la page des offres', () => {
    const p = parametresCheckout({ prixId: 'price_1', userId: 'u-1', clientId: 'cus_1', siteUrl: 'https://exemple.test' })
    expect([...p.keys()].some((k) => k.startsWith('custom_text'))).toBe(false)
    expect(p.get('managed_payments[enabled]')).toBe('false')
    expect(p.get('mode')).toBe('subscription')
    expect(p.get('line_items[0][price]')).toBe('price_1')
    expect(p.get('client_reference_id')).toBe('u-1')
    expect(p.get('subscription_data[metadata][user_id]')).toBe('u-1')
    expect(p.get('customer')).toBe('cus_1')
    expect(p.get('customer_email')).toBeNull()
    expect(p.get('success_url')).toBe('https://exemple.test/#/offres?paiement=ok')
    expect(p.get('cancel_url')).toBe('https://exemple.test/#/offres?paiement=annule')
  })
})

describe('abonnement Stripe → ligne de base', () => {
  const sub = (extra = {}) => ({ id: 'sub_1', status: 'active', customer: 'cus_1', cancel_at_period_end: false, current_period_end: 2000000000,
    items: { data: [{ price: { lookup_key: 'revizstmg_ultimate_annuel' } }] }, ...extra })
  it('retrouve l’offre, la période, la fin et le mode', () => {
    const l = ligneDepuisAbonnement(sub(), 'u-1', true)
    expect(l).toMatchObject({ user_id: 'u-1', offre: 'ultimate', periode: 'annuel', statut: 'active', stripe_customer_id: 'cus_1', stripe_subscription_id: 'sub_1', mode_test: true, annulation_prevue: false })
    expect(l.periode_fin).toBe(new Date(2000000000 * 1000).toISOString())
  })
  it('signale l’annulation prévue et ignore un prix inconnu', () => {
    expect(ligneDepuisAbonnement(sub({ cancel_at_period_end: true }), 'u-1', false).annulation_prevue).toBe(true)
    expect(ligneDepuisAbonnement(sub({ items: { data: [{ price: { lookup_key: 'autre' } }] } }), 'u-1', false)).toBeNull()
    expect(ligneDepuisAbonnement(sub(), '', false)).toBeNull()
  })
  it('l’offre n’est active que pour les bons statuts et tant que la période court', () => {
    const futur = new Date(Date.now() + 86400000 * 5).toISOString()
    expect(estActif({ statut: 'active', periode_fin: futur })).toBe(true)
    expect(estActif({ statut: 'canceled', periode_fin: futur })).toBe(false)
    expect(estActif({ statut: 'aucun' })).toBe(false)
    expect(estActif({ statut: 'active', periode_fin: new Date(Date.now() - 86400000 * 10).toISOString() })).toBe(false)
    expect(estActif(null)).toBe(false)
  })
})

describe('signature du webhook Stripe', () => {
  const secret = 'whsec_test'
  const corps = '{"id":"evt_1","type":"customer.subscription.updated"}'
  const t = 1800000000
  it('accepte une signature valide et refuse le reste', async () => {
    const v1 = await hmac(secret, t, corps)
    const maintenant = t * 1000
    expect(await verifierSignature(corps, `t=${t},v1=${v1}`, secret, maintenant)).toBe(true)
    expect(await verifierSignature(corps + ' ', `t=${t},v1=${v1}`, secret, maintenant)).toBe(false)
    expect(await verifierSignature(corps, `t=${t},v1=${'0'.repeat(64)}`, secret, maintenant)).toBe(false)
    expect(await verifierSignature(corps, `t=${t},v1=${v1}`, 'autre', maintenant)).toBe(false)
    expect(await verifierSignature(corps, `t=${t},v1=${v1}`, secret, maintenant + 10 * 60 * 1000)).toBe(false)
    expect(await verifierSignature(corps, null, secret, maintenant)).toBe(false)
    expect(await verifierSignature(corps, `t=${t},v1=${v1}`, '', maintenant)).toBe(false)
  })
  it('accepte l’une des signatures pendant une rotation de secret', async () => {
    const v1 = await hmac(secret, t, corps)
    expect(await verifierSignature(corps, `t=${t},v1=${'a'.repeat(64)},v1=${v1}`, secret, t * 1000)).toBe(true)
  })
})

describe('secrets', () => {
  it('aucune clé Stripe n’est écrite dans le dépôt', async () => {
    const { readdirSync, readFileSync, statSync } = await import('node:fs')
    const { join } = await import('node:path')
    const racine = new URL('../../', import.meta.url).pathname
    const marche = (d) => readdirSync(d).flatMap((n) => {
      if (['node_modules', 'dist', '.git', 'test-results'].includes(n)) return []
      const p = join(d, n)
      return statSync(p).isDirectory() ? marche(p) : /\.(js|jsx|ts|json|md|sql|mjs)$/.test(n) ? [p] : []
    })
    const trouves = [...marche(join(racine, 'app/src')), ...marche(join(racine, 'supabase')), ...marche(join(racine, 'docs'))]
      .filter((f) => /(sk|rk)_(live|test)_[A-Za-z0-9]{10,}|whsec_[A-Za-z0-9]{10,}/.test(readFileSync(f, 'utf8')))
    expect(trouves).toEqual([])
  })
})
