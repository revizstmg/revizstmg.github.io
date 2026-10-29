import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { niveauDe, niveauAcces, graceJusqua, estPagePayante, PAGES_PAYANTES, QUOTA_IA_MENSUEL, utilisationsMois } from '../src/data/acces.js'
import { reserverIA, messageAccesIA } from '../src/data/ia.js'

const mem = {}
const compte = (ligne) => {
  mem.stmg_session = JSON.stringify({ token: 'jeton-fictif-long-pour-le-test', user: { id: 'u1' }, expires_at: 9999999999 })
  if (ligne !== undefined) mem.stmg_acces = JSON.stringify({ uid: 'u1', ligne, verifieLe: Date.now() })
}
const abonnement = (offre, extra = {}) => ({ statut: 'active', offre, periode_fin: '2999-01-01T00:00:00Z', ...extra })

beforeEach(() => {
  for (const k of Object.keys(mem)) delete mem[k]
  globalThis.localStorage = { getItem: (k) => mem[k] ?? null, setItem: (k, v) => { mem[k] = String(v) }, removeItem: (k) => { delete mem[k] } }
})
afterEach(() => { delete globalThis.localStorage })

describe('niveau d’accès', () => {
  it('gratuit sans abonnement actif, Premium ou Ultimate sinon', () => {
    expect(niveauDe(null)).toBe('gratuit')
    expect(niveauDe({ statut: 'aucun' })).toBe('gratuit')
    expect(niveauDe(abonnement('premium', { statut: 'canceled' }))).toBe('gratuit')
    expect(niveauDe(abonnement('premium', { periode_fin: '2000-01-01T00:00:00Z' }))).toBe('gratuit')
    expect(niveauDe(abonnement('premium'))).toBe('premium')
    expect(niveauDe(abonnement('ultimate'))).toBe('ultimate')
    expect(niveauDe(abonnement('autre'))).toBe('gratuit')
  })
  it('un ancien compte sans abonnement garde son accès actuel (Ultimate) pendant la période de grâce', () => {
    mem.stmg_session = JSON.stringify({ token: 'jeton-fictif-long-pour-le-test', user: { id: 'u1', created_at: '2026-10-01T10:00:00Z' }, expires_at: 9999999999 })
    expect(niveauAcces()).toBe('ultimate')
    expect(graceJusqua()).toBe('2026-11-30T00:00:00Z')
    mem.stmg_acces = JSON.stringify({ uid: 'u1', ligne: abonnement('ultimate'), verifieLe: Date.now() })
    expect(niveauAcces()).toBe('ultimate')
    expect(graceJusqua()).toBeNull()
    mem.stmg_session = JSON.stringify({ token: 'jeton-fictif-long-pour-le-test', user: { id: 'u2', created_at: '2026-11-02T10:00:00Z' }, expires_at: 9999999999 })
    delete mem.stmg_acces
    expect(niveauAcces()).toBe('gratuit')
    expect(graceJusqua()).toBeNull()
  })
  it('lit le niveau du compte connecté sur l’appareil, jamais celui d’un autre compte', () => {
    expect(niveauAcces()).toBe('gratuit')
    compte(abonnement('premium'))
    expect(niveauAcces()).toBe('premium')
    mem.stmg_acces = JSON.stringify({ uid: 'autre', ligne: abonnement('ultimate'), verifieLe: Date.now() })
    expect(niveauAcces()).toBe('gratuit')
  })
})

describe('pages réservées', () => {
  it('cours, exercices, favoris, offres et pages légales restent gratuits', () => {
    for (const p of ['/', '/accueil', '/vacances', '/parent', '/classe', '/cours', '/subject/gestion', '/subject/gestion/theme/t1/chapter/2', '/missions/a/b/1', '/favoris', '/programme', '/moi', '/parametres', '/offres', '/cgu', '/confidentialite', '/faq', '/guide', '/exemple-bilan']) {
      expect(estPagePayante(p), p).toBe(false)
    }
  })
  it('le bac blanc, les sujets et les outils de révision demandent un abonnement', () => {
    for (const p of ['/bac-blanc', '/revision', '/revision/deck/x', '/coach-ia', '/grand-oral', '/mes-notes', '/atelier-formules', '/fiches-photo', '/etude-de-gestion', '/seance', '/parcours']) {
      expect(estPagePayante(p), p).toBe(true)
    }
    expect(PAGES_PAYANTES.every((p) => p.startsWith('/'))).toBe(true)
    expect(estPagePayante('/revisionnel')).toBe(false)
  })
})

describe('quotas des fonctions d’IA', () => {
  it('les offres : rien en gratuit, une utilisation par mois en Premium, pas de quota mensuel en Ultimate', () => {
    expect(QUOTA_IA_MENSUEL).toEqual({ gratuit: 0, premium: 1, ultimate: null })
  })
  it('un compte gratuit n’a aucune IA', () => {
    compte(null)
    expect(() => reserverIA('serie')).toThrow('abonnement_requis')
  })
  it('Premium : une utilisation par fonction et par mois', () => {
    compte(abonnement('premium'))
    const valider = reserverIA('serie')
    expect(utilisationsMois('serie')).toBe(0)
    valider()
    expect(utilisationsMois('serie')).toBe(1)
    expect(() => reserverIA('serie')).toThrow('quota_mensuel')
    expect(() => reserverIA('tuteur')).not.toThrow()
  })
  it('Premium : la suite d’une utilisation (correction, message suivant) n’est pas recomptée', () => {
    compte(abonnement('premium'))
    reserverIA('examen')()
    expect(() => reserverIA('examen', { suite: true })).not.toThrow()
    expect(utilisationsMois('examen')).toBe(1)
  })
  it('Premium : un appel qui échoue ne consomme pas l’utilisation du mois', () => {
    compte(abonnement('premium'))
    reserverIA('serie')
    expect(() => reserverIA('serie')).not.toThrow()
    expect(utilisationsMois('serie')).toBe(0)
  })
  it('Premium : le quota repart le mois suivant', () => {
    compte(abonnement('premium'))
    mem.stmg_ia_mois = JSON.stringify({ mois: '2000-01', n: { serie: 1 } })
    expect(() => reserverIA('serie')).not.toThrow()
  })
  it('Ultimate : pas de quota mensuel', () => {
    compte(abonnement('ultimate'))
    for (let i = 0; i < 10; i++) reserverIA('serie')
    expect(utilisationsMois('serie')).toBe(0)
  })
  it('messages d’accès pour l’élève', () => {
    expect(messageAccesIA('abonnement_requis')).toMatch(/Premium et Ultimate/)
    expect(messageAccesIA('quota_mensuel')).toMatch(/ce mois-ci/)
    expect(messageAccesIA('rate_limit')).toBeNull()
  })
})
