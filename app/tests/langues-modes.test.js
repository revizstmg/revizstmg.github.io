import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import {
  rng, melanger, normaliserItem, itemsManuel, enonceAutonome, qcmDuManuel, itemsScenario, creerCode, lireCode, messageDefi, resoudreMise,
  lundiDe, titreDeLaSemaine, verdictSurvie, verdictEntretien, etatSemaine, enregistrer, questionsPourMinutes, BANQUE_DEPART, QUESTIONS_DEFI,
} from '../src/data/languesModes.js'

const lire = (l) => JSON.parse(readFileSync(new URL(`../resources/langues/${l}.json`, import.meta.url), 'utf8'))
const dossier = new URL('../src/data/languesScenarios/', import.meta.url)
const langues = readdirSync(dossier).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''))
const memoire = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) } }

describe('modes de langues : logique', () => {
  it('le même code donne les mêmes questions', () => {
    const manuel = lire('en')
    const a = itemsManuel(manuel, QUESTIONS_DEFI, lireCode('en-1abc').seed)
    const b = itemsManuel(manuel, QUESTIONS_DEFI, lireCode('en-1abc').seed)
    expect(a).toEqual(b)
    expect(a).toHaveLength(QUESTIONS_DEFI)
    for (const q of a) expect(q.options[q.ok]).toBeTruthy()
  })
  it('un code se crée, se relit et porte le score du pote', () => {
    const code = creerCode('es', () => 0.5)
    expect(lireCode(code)).toMatchObject({ langue: 'es', code })
    expect(lireCode(`${code}.4`).score).toBe(4)
    expect(lireCode(`${code}.4`).code).toBe(code)
    expect(lireCode('n’importe quoi')).toBeNull()
    expect(lireCode('')).toBeNull()
    expect(messageDefi(code, 3)).toContain(`${code}.3`)
  })
  it('mélanger garde la bonne réponse repérable', () => {
    const item = normaliserItem({ prompt: 'p', options: ['juste', 'faux1', 'faux2'] }, rng(7))
    expect(item.options[item.ok]).toBe('juste')
    expect(melanger([1, 2, 3, 4], rng(1))).toHaveLength(4)
  })
  it('la mise gagne ou perd, et la banque ne reste jamais à sec', () => {
    expect(resoudreMise(100, 20, 4)).toMatchObject({ gagne: true, banque: 120, refinance: false })
    expect(resoudreMise(100, 20, 3)).toMatchObject({ gagne: false, banque: 80 })
    expect(resoudreMise(20, 20, 0)).toMatchObject({ gagne: false, banque: 50, refinance: true })
  })
  it('la semaine commence le lundi et le titre suit les points', () => {
    expect(lundiDe(new Date(2026, 10, 20))).toBe('2026-11-16')
    expect(lundiDe(new Date(2026, 10, 16))).toBe('2026-11-16')
    expect(lundiDe(new Date(2026, 10, 22))).toBe('2026-11-16')
    expect(titreDeLaSemaine(0).titre).toBe('Touriste officiel')
    expect(titreDeLaSemaine(250).titre).toBe('Local infiltré')
  })
  it('les points se cumulent dans la semaine puis repartent à zéro', () => {
    const stock = memoire()
    const lundi = new Date(2026, 10, 16)
    expect(etatSemaine(stock, lundi)).toMatchObject({ points: 0, banque: BANQUE_DEPART })
    enregistrer({ points: 15 }, stock, lundi)
    expect(enregistrer({ points: 10, banque: 120 }, stock, new Date(2026, 10, 18))).toMatchObject({ points: 25, banque: 120 })
    expect(etatSemaine(stock, new Date(2026, 10, 23))).toMatchObject({ points: 0, banque: 120 })
  })
  it('un stockage abîmé ne casse rien', () => {
    const casse = { getItem: () => '{pas du json', setItem: () => { throw new Error('plein') } }
    expect(etatSemaine(casse).points).toBe(0)
    expect(() => enregistrer({ points: 5 }, casse)).not.toThrow()
  })
  it('les verdicts couvrent tous les cas', () => {
    expect(verdictSurvie(60).titre).toBe('Pro du voyage')
    expect(verdictSurvie(20).titre).toBe('Touriste normal')
    expect(verdictSurvie(0).titre).toBe('Pigeon professionnel')
    expect(verdictSurvie(-5).titre).toBe('Tu rentres à pied')
    expect(verdictEntretien(18, 18).titre).toBe('Embauché')
    expect(verdictEntretien(0, 18).titre).toContain('téléphone')
    expect(questionsPourMinutes(1)).toBeLessThan(questionsPourMinutes(5))
  })
})

describe('scénarios des modes de langues', () => {
  it('cinq langues ont des scénarios ; l’arabe et le reste sont à faire relire par un natif', () => {
    expect(langues.sort()).toEqual(['ar', 'de', 'en', 'es', 'it'])
  })
  for (const l of langues) {
    const d = JSON.parse(readFileSync(new URL(`${l}.json`, dossier), 'utf8'))
    it(`${l} : questions complètes, une seule bonne réponse, sans doublon`, () => {
      for (const cle of ['snap', 'faux', 'serie', 'texto']) {
        expect(d[cle].length, `${l}.${cle}`).toBeGreaterThanOrEqual(5)
        for (const s of d[cle]) {
          expect(s.prompt?.length, `${l}.${cle} prompt`).toBeGreaterThan(5)
          expect(s.options.length, `${l}.${cle} ${s.prompt}`).toBeGreaterThanOrEqual(3)
          expect(new Set(s.options).size, `${l}.${cle} ${s.prompt} options en double`).toBe(s.options.length)
          expect(s.why?.length, `${l}.${cle} ${s.prompt} explication`).toBeGreaterThan(10)
          expect(JSON.stringify(s)).not.toContain('**')
          const n = normaliserItem(s, rng(3))
          expect(n.options[n.ok]).toBe(s.options[0])
        }
        expect(new Set(d[cle].map((s) => s.prompt)).size, `${l}.${cle} prompts en double`).toBe(d[cle].length)
      }
      expect(itemsScenario(d.snap, 6, 5)).toHaveLength(Math.min(6, d.snap.length))
    })
    it(`${l} : la bonne réponse n’est pas toujours la plus longue (les flemmards l’ont remarqué)`, () => {
      const longueur = (o) => (typeof o === 'string' ? o.length : o.t.length)
      for (const cle of ['snap', 'texto']) {
        const n = d[cle].filter((s) => longueur(s.options[0]) === Math.max(...s.options.map(longueur))).length
        expect(n / d[cle].length, `${l}.${cle}`).toBeLessThanOrEqual(0.5)
      }
      const q = d.entretien.questions
      const n = q.filter((x) => x.options.reduce((a, b) => (longueur(b) > longueur(a) ? b : a)).pts === 3).length
      expect(n / q.length, `${l}.entretien`).toBeLessThanOrEqual(0.5)
    })
    it(`${l} : survie et entretien ont des coûts et des notes cohérents`, () => {
      expect(d.survie.budget).toBe(100)
      expect(d.survie.etapes.length).toBeGreaterThanOrEqual(4)
      let meilleur = 0
      for (const e of d.survie.etapes) {
        expect(e.options.length).toBe(3)
        const couts = e.options.map((o) => o.cout)
        expect(Math.min(...couts)).toBeLessThan(Math.max(...couts))
        meilleur += Math.min(...couts)
        for (const o of e.options) { expect(o.w.length).toBeGreaterThan(5); expect(Number.isInteger(o.cout)).toBe(true) }
      }
      expect(d.survie.budget - meilleur, `${l} : le meilleur chemin doit laisser de l’argent`).toBeGreaterThanOrEqual(40)
      expect(d.entretien.questions.length).toBeGreaterThanOrEqual(4)
      for (const q of d.entretien.questions) {
        expect(q.options.map((o) => o.pts).sort()).toEqual([0, 1, 3].sort())
        for (const o of q.options) expect(o.w.length).toBeGreaterThan(5)
      }
    })
  }
  it('les manuels ont assez de QCM pour tirer des questions dans chaque langue, arabe compris', () => {
    for (const l of ['en', 'es', 'it', 'ar', 'de']) expect(itemsManuel(lire(l), 14, 9).length, l).toBe(14)
  })
})

describe('corrections de l’audit : codes de défi et énoncés', () => {
  it('accepte le message complet du pote, pas un score impossible ni une langue inconnue', () => {
    expect(lireCode('J’ai fait 3/5 au test du pote. Fais mieux : code en-708snn.3')).toMatchObject({ langue: 'en', code: 'en-708snn', score: 3 })
    expect(lireCode('en-1abc.9')).toBeNull()
    expect(lireCode('fr-abc')).toBeNull()
    expect(lireCode('rien du tout')).toBeNull()
  })
  it('un énoncé « dans cette fiche » devient autonome et un renvoi à un document absent est écarté', () => {
    expect(enonceAutonome('Dans cette fiche, que signifie « legami » ?')).toBe('Que signifie « legami » ?')
    const manuel = { exercises: [
      { id: 'a', type: 'qcm', prompt: 'D’après le document NordRad, que fabrique l’entreprise ?', choices: ['x', 'y', 'z'], answer: 'x' },
      { id: 'b', type: 'qcm', prompt: 'Dans cette fiche, que signifie « legami » ?', choices: ['liens', 'lames', 'lait'], answer: 'liens' },
    ] }
    expect(qcmDuManuel(manuel).map((e) => e.id)).toEqual(['b'])
  })
})
