import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
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
afterEach(() => { vi.useRealTimers(); delete globalThis.localStorage })

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
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-29T12:00:00Z'))
    mem.stmg_session = JSON.stringify({ token: 'jeton-fictif-long-pour-le-test', user: { id: 'u1', created_at: '2026-10-01T10:00:00Z' }, expires_at: 9999999999 })
    expect(niveauAcces()).toBe('ultimate')
    expect(graceJusqua()).toBe('2026-11-30T23:59:00Z')
    mem.stmg_acces = JSON.stringify({ uid: 'u1', ligne: abonnement('ultimate'), verifieLe: Date.now() })
    expect(niveauAcces()).toBe('ultimate')
    expect(graceJusqua()).toBeNull()
    mem.stmg_session = JSON.stringify({ token: 'jeton-fictif-long-pour-le-test', user: { id: 'u2', created_at: '2026-11-02T10:00:00Z' }, expires_at: 9999999999 })
    delete mem.stmg_acces
    expect(niveauAcces()).toBe('gratuit')
    expect(graceJusqua()).toBeNull()
    vi.setSystemTime(new Date('2026-12-02T12:00:00Z'))
    mem.stmg_session = JSON.stringify({ token: 'jeton-fictif-long-pour-le-test', user: { id: 'u3', created_at: '2026-10-01T10:00:00Z' }, expires_at: 9999999999 })
    expect(niveauAcces()).toBe('gratuit') // la grâce est terminée
    vi.useRealTimers()
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
    for (const p of ['/', '/accueil', '/amis', '/boutique', '/vacances', '/parent', '/classe', '/cours', '/subject/gestion', '/subject/gestion/theme/t1/chapter/2', '/missions/a/b/1', '/favoris', '/programme', '/moi', '/parametres', '/offres', '/cgu', '/confidentialite', '/faq', '/guide', '/exemple-bilan']) {
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

describe('adresses et rafraîchissement', () => {
  it('la casse, les « % » et les barres doublées ne contournent pas les pages payantes', async () => {
    const { estPagePayante, estPageAvecCompte } = await import('../src/data/acces.js')
    for (const p of ['/Bac-Blanc', '/BAC-BLANC/', '/%62ac-blanc', '//bac-blanc', '/Revision/Deck/x']) expect(estPagePayante(p), p).toBe(true)
    for (const p of ['/AMIS', '/%62outique', '//classe']) expect(estPagePayante(p), p).toBe(false)
    expect(estPageAvecCompte('/AMIS')).toBe(true)
    expect(estPageAvecCompte('/Classement')).toBe(true)
    expect(estPagePayante('/Cours')).toBe(false)
    expect(estPagePayante('/%E0%A4%A')).toBe(false) // adresse mal encodée : pas d'erreur
  })
  it('hors ligne, un abonnement échu depuis peu reste valable (renouvellement manqué)', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-12-10T12:00:00Z'))
    compte(abonnement('premium', { periode_fin: '2026-12-08T00:00:00Z' }))
    expect(niveauAcces()).toBe('gratuit')
    const avant = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
    Object.defineProperty(globalThis, 'navigator', { value: { onLine: false }, configurable: true })
    expect(niveauAcces()).toBe('premium')
    if (avant) Object.defineProperty(globalThis, 'navigator', avant); else delete globalThis.navigator
  })
  it('le compteur mensuel appartient au compte, pas à l’appareil', () => {
    compte(abonnement('premium'))
    reserverIA('serie')()
    expect(utilisationsMois('serie')).toBe(1)
    mem.stmg_session = JSON.stringify({ token: 'jeton-fictif-long-pour-le-test', user: { id: 'u2' }, expires_at: 9999999999 })
    mem.stmg_acces = JSON.stringify({ uid: 'u2', ligne: abonnement('premium'), verifieLe: Date.now() })
    expect(utilisationsMois('serie')).toBe(0)
    expect(() => reserverIA('serie')).not.toThrow()
  })
  it('tant que l’abonnement n’a jamais été lu, c’est le serveur qui décide (pas de refus local)', () => {
    mem.stmg_session = JSON.stringify({ token: 'jeton-fictif-long-pour-le-test', user: { id: 'u1' }, expires_at: 9999999999 })
    expect(() => reserverIA('serie')).not.toThrow()
  })
})
