import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHandler } from '../../supabase/functions/examen-blanc/handler.js'
import { fonctionIA, niveauDe, niveauCompte, enGrace, QUOTA_IA_MENSUEL, SUITES_PREMIUM, LIMITE_IA_PAR_JOUR } from '../../supabase/functions/examen-blanc/acces.js'
import { estActif } from '../../supabase/functions/revizstmg-paiement/logique.js'

const lire = (p) => readFileSync(new URL(p, import.meta.url), 'utf8')
const ID = 'aaaaaaaa-0000-4000-8000-000000000001'
const MAINTENANT = Date.UTC(2026, 9, 29, 12)
const PREMIUM = { statut: 'active', offre: 'premium', periode_fin: '2999-01-01T00:00:00Z' }
const ULTIMATE = { ...PREMIUM, offre: 'ultimate' }

// Base et fournisseur d'IA simulés : mêmes appels que la vraie fonction (REST, rpc, Gemini).
function monde({ abonnement = null, creeLe = '2026-11-02T10:00:00Z', maintenant = MAINTENANT, fournisseur = 'ok', service = 'cle-service', base = 'ok' } = {}) {
  const usage = new Map(), appels = { fournisseur: 0 }
  const compteur = (f, p) => usage.get(`${f}|${p}`) || 0
  const fetcher = async (url, init = {}) => {
    const u = String(url)
    if (u.includes('/auth/v1/user')) return Response.json({ id: ID, created_at: creeLe })
    if (u.includes('/rest/v1/revizstmg_abonnements')) return base === 'ok' ? Response.json(abonnement ? [abonnement] : []) : new Response('x', { status: 500 })
    if (u.includes('/rpc/revizstmg_ia_reserver')) {
      const { p_fonction: f, p_periode: p, p_max: max } = JSON.parse(init.body)
      if (compteur(f, p) >= max) return Response.json(false)
      usage.set(`${f}|${p}`, compteur(f, p) + 1); return Response.json(true)
    }
    if (u.includes('/rpc/revizstmg_ia_rendre')) {
      const { p_fonction: f, p_periode: p } = JSON.parse(init.body)
      usage.set(`${f}|${p}`, Math.max(0, compteur(f, p) - 1)); return new Response('')
    }
    if (u.includes('generativelanguage')) {
      appels.fournisseur++
      if (fournisseur === 'panne') return Response.json({ error: { message: 'Unavailable' } }, { status: 503 })
      const texte = fournisseur === 'invalide' ? 'pas du json' : JSON.stringify({ reply: 'Voici une explication.' })
      return Response.json({ candidates: [{ content: { parts: [{ text: texte }] } }] })
    }
    throw new Error(`appel inattendu : ${u}`)
  }
  const env = (k) => ({ GEMINI_API_KEY: 'fake', SUPABASE_URL: 'https://fake', SUPABASE_ANON_KEY: 'fake', SUPABASE_SERVICE_ROLE_KEY: service })[k]
  const handler = createHandler({ env, fetcher, now: () => maintenant, pause: async () => {} })
  const cours = { id: 'c1', title: 'Cours', subject: 'Gestion', level: 'terminale', text: 'Le cours.' }
  const tuteur = async (messages = [{ role: 'user', text: 'Explique-moi.' }]) => {
    const r = await handler(new Request('https://f/', { method: 'POST', headers: { authorization: 'Bearer jeton-long-pour-le-test' }, body: JSON.stringify({ action: 'tutor', course: cours, messages }) }))
    return { status: r.status, corps: await r.json() }
  }
  const nouvelleDiscussion = () => tuteur()
  const suite = () => tuteur([{ role: 'user', text: 'Q1' }, { role: 'assistant', text: 'R1' }, { role: 'user', text: 'Q2' }])
  return { tuteur, nouvelleDiscussion, suite, usage, appels, compteur }
}

describe('contrôle d’accès de la fonction examen-blanc (IA)', () => {
  it('compte gratuit : refusé avant tout appel au fournisseur', async () => {
    const m = monde()
    const r = await m.nouvelleDiscussion()
    expect(r).toEqual({ status: 402, corps: { error: 'abonnement_requis' } })
    expect(m.appels.fournisseur).toBe(0)
  })
  it('abonnement résilié ou échu : comme un compte gratuit', async () => {
    for (const a of [{ ...PREMIUM, statut: 'canceled' }, { ...PREMIUM, periode_fin: '2000-01-01T00:00:00Z' }, { ...PREMIUM, offre: 'autre' }]) {
      const m = monde({ abonnement: a })
      expect((await m.nouvelleDiscussion()).status, JSON.stringify(a)).toBe(402)
    }
  })
  it('Premium : une utilisation par fonction et par mois, comptée côté serveur', async () => {
    const m = monde({ abonnement: PREMIUM })
    expect((await m.nouvelleDiscussion()).status).toBe(200)
    expect(m.compteur('tuteur', '2026-10')).toBe(1)
    expect(await m.nouvelleDiscussion()).toEqual({ status: 403, corps: { error: 'quota_mensuel' } })
    expect(m.appels.fournisseur).toBe(1)
  })
  it('Premium : la suite d’une discussion passe, avec son propre plafond mensuel', async () => {
    const m = monde({ abonnement: PREMIUM })
    await m.nouvelleDiscussion()
    for (let i = 0; i < SUITES_PREMIUM.tuteur; i++) expect((await m.suite()).status, `suite ${i + 1}`).toBe(200)
    expect(m.compteur('tuteur', '2026-10')).toBe(1)
    expect((await m.suite()).status).toBe(403)
  })
  it('Premium : on ne peut pas contourner en n’envoyant que des « suites »', async () => {
    const m = monde({ abonnement: PREMIUM })
    let acceptees = 0
    for (let i = 0; i < 100; i++) if ((await m.suite()).status === 200) acceptees++
    expect(acceptees).toBe(SUITES_PREMIUM.tuteur)
  })
  it('deux requêtes simultanées ne dépassent pas le quota', async () => {
    const m = monde({ abonnement: PREMIUM })
    const reponses = await Promise.all([m.nouvelleDiscussion(), m.nouvelleDiscussion(), m.nouvelleDiscussion()])
    expect(reponses.filter((r) => r.status === 200)).toHaveLength(1)
    expect(m.compteur('tuteur', '2026-10')).toBe(1)
  })
  it('un échec du fournisseur ne consomme pas l’utilisation du mois', async () => {
    for (const fournisseur of ['panne', 'invalide']) {
      const m = monde({ abonnement: PREMIUM, fournisseur })
      expect((await m.nouvelleDiscussion()).status, fournisseur).toBe(502)
      expect(m.compteur('tuteur', '2026-10'), fournisseur).toBe(0)
      expect(m.compteur('_jour', '2026-10-29'), fournisseur).toBe(0)
    }
  })
  it('Ultimate : pas de quota mensuel, seulement le garde-fou journalier', async () => {
    const m = monde({ abonnement: ULTIMATE })
    for (let i = 0; i < 5; i++) expect((await m.nouvelleDiscussion()).status).toBe(200)
    expect(m.compteur('tuteur', '2026-10')).toBe(0)
    m.usage.set('_jour|2026-10-29', LIMITE_IA_PAR_JOUR)
    expect(await m.nouvelleDiscussion()).toEqual({ status: 429, corps: { error: 'rate_limit' } })
    expect(m.appels.fournisseur).toBe(5)
  })
  it('refus fermé : sans clé de service ou si la base ne répond pas, aucune IA', async () => {
    const sansCle = monde({ abonnement: ULTIMATE, service: '' })
    expect((await sansCle.nouvelleDiscussion()).status).toBe(503)
    const panne = monde({ abonnement: ULTIMATE, base: 'panne' })
    expect((await panne.nouvelleDiscussion()).status).toBe(502)
    expect(sansCle.appels.fournisseur + panne.appels.fournisseur).toBe(0)
  })
})

describe('période de grâce des comptes existants', () => {
  const AVANT = '2026-10-01T10:00:00Z', APRES = '2026-11-02T08:00:00Z'
  it('un compte créé avant l’ouverture garde l’accès qu’il a aujourd’hui (niveau Ultimate) pendant la grâce', async () => {
    const m = monde({ creeLe: AVANT })
    for (let i = 0; i < 4; i++) expect((await m.nouvelleDiscussion()).status).toBe(200)
    expect(m.compteur('tuteur', '2026-10')).toBe(0) // pas de quota mensuel
  })
  it('un compte créé après l’ouverture n’a pas de grâce', async () => {
    expect((await monde({ creeLe: APRES }).nouvelleDiscussion()).status).toBe(402)
    expect((await monde({ creeLe: null }).nouvelleDiscussion()).status).toBe(402)
  })
  it('la grâce se termine à la date prévue', async () => {
    expect((await monde({ creeLe: AVANT, maintenant: Date.UTC(2026, 10, 29, 23) }).nouvelleDiscussion()).status).toBe(200)
    expect((await monde({ creeLe: AVANT, maintenant: Date.UTC(2026, 10, 30, 1) }).nouvelleDiscussion()).status).toBe(402)
  })
  it('un abonnement Ultimate l’emporte sur la grâce', () => {
    expect(niveauCompte(ULTIMATE, AVANT, MAINTENANT)).toBe('ultimate')
    expect(niveauCompte(null, AVANT, MAINTENANT)).toBe('ultimate')
    expect(enGrace('pas une date', MAINTENANT)).toBe(false)
  })
})

describe('règles partagées', () => {
  it('chaque action d’examen-blanc correspond à une fonction d’IA du site, étape de suite comprise', () => {
    expect(fonctionIA({ action: 'practice' })).toEqual({ id: 'serie', suite: false })
    expect(fonctionIA({ action: 'excellence' })).toEqual({ id: 'excellence', suite: false })
    expect(fonctionIA({ action: 'study' })).toEqual({ id: 'etude', suite: false })
    expect(fonctionIA({ action: 'control', step: 'prepare' })).toEqual({ id: 'controle', suite: false })
    expect(fonctionIA({ action: 'control', step: 'correct' })).toEqual({ id: 'controle', suite: true })
    expect(fonctionIA({ action: 'tutor', messages: [1] })).toEqual({ id: 'tuteur', suite: false })
    expect(fonctionIA({ action: 'tutor', messages: [1, 2, 3] })).toEqual({ id: 'tuteur', suite: true })
    expect(fonctionIA({ action: 'generate' })).toEqual({ id: 'examen', suite: false })
    expect(fonctionIA({ action: 'plan' })).toEqual({ id: 'examen', suite: true })
    expect(fonctionIA({ action: 'grade' })).toEqual({ id: 'examen', suite: true })
  })
  it('le niveau serveur suit la règle du site (estActif)', () => {
    const lignes = [null, { statut: 'aucun' }, PREMIUM, ULTIMATE, { ...PREMIUM, statut: 'canceled' }, { ...PREMIUM, statut: 'trialing' }, { ...PREMIUM, statut: 'past_due' },
      { ...PREMIUM, periode_fin: '2000-01-01T00:00:00Z' }, { ...PREMIUM, periode_fin: null }]
    for (const l of lignes) expect(niveauDe(l) !== 'gratuit', JSON.stringify(l)).toBe(estActif(l) && ['premium', 'ultimate'].includes(l?.offre))
    expect(QUOTA_IA_MENSUEL).toEqual({ gratuit: 0, premium: 1, ultimate: null })
  })
  it('fiche-vision exige un compte et le même contrôle que examen-blanc', () => {
    expect(lire('../../supabase/functions/fiche-vision/acces.js')).toBe(lire('../../supabase/functions/examen-blanc/acces.js'))
    const index = lire('../../supabase/functions/fiche-vision/index.ts')
    expect(index).toContain('reserverAccesIA')
    expect(index).toContain('login_required')
    expect(index.indexOf('reserverAccesIA({')).toBeLessThan(index.indexOf('callGemini(geminiKey, imgs)'))
  })
  it('le site envoie le jeton du compte à fiche-vision, plus la clé publique', () => {
    expect(lire('../src/ficheVision.js')).not.toMatch(/Authorization: `Bearer \$\{SUPA_ANON\}`/)
  })
})
