// Grand Oral (Terminale STMG) : règles de la session 2027, grille des arguments
// avec son critère d'oral, préparation exportée et fusion appareil ↔ compte.
import { describe, it, expect } from 'vitest'
import GRAND_ORAL from '../content/commun/grand-oral.json'
import OUTILS_PROJET from '../content/commun/outils-projet.json'
import { preparationTexte, noteAutoEval } from '../src/pages/GrandOral.jsx'
import { noteArgument, critereRempli } from '../src/components/DossierProjet.jsx'
import { mergeProgress, grandOralVide } from '../src/store.jsx'

const C = GRAND_ORAL
const O = OUTILS_PROJET
const source = { id: 's1', type: 'Rapport ou étude', titre: 'Les délais de paiement', auteur: 'Banque de France', date: '2026', lien: '' }

describe('Grand Oral', () => {
  it('les règles sont celles de la session 2027 : 10 min de présentation, 10 min d’échange, coefficient 12', () => {
    const texte = C.regles.map((r) => `${r.h} ${r.c}`).join(' ')
    expect(texte).toMatch(/présentation \(10 minutes\)/)
    expect(texte).toMatch(/échange avec le jury \(10 minutes\)/)
    expect(texte).toMatch(/coefficient 12/)
    expect(texte).toMatch(/plus de temps consacré au \*\*projet d'orientation\*\*/)
    expect(C.enBref.map((x) => x.v)).toEqual(['20 min', '20 min', 'coef. 12'])
    expect(C.pratique.map((p) => p.min)).toEqual([20, 10, 10])
    expect(C.jury.criteres).toHaveLength(5)
    for (const r of C.references) expect(r.lien).toMatch(/^https:\/\//)
  })
  it('la banque garde ses exemples par spécialité', () => {
    for (const k of ['rh-communication', 'mercatique', 'gestion-finance', 'sig', 'transversal']) {
      expect(C.banque[k].items.length).toBeGreaterThan(0)
      for (const it of C.banque[k].items) expect(it.q.endsWith('?')).toBe(true)
    }
  })
  it('grille des arguments : A-E-I plus un critère d’oral, qui demande l’affirmation écrite', () => {
    expect(C.aei.grille.map((c) => c.etape)).toEqual(['A', 'E', 'E', 'I', 'I', 'Oral'])
    const oral = C.aei.grille.find((c) => c.id === 'oral')
    expect(critereRempli(oral, { a: '', eval: { oral: true } })).toBe(false)
    expect(critereRempli(oral, { a: 'Affirmation', eval: { oral: true } })).toBe(true)
    const plein = { a: 'A', e: 'E', notion: 'BFR', i: 'I', sourceId: 's1', eval: { a: true, e: true, i: true, oral: true } }
    expect(noteArgument(plein, [source], C.aei.grille)).toBe(6)
  })
  it('auto-évaluation : 5 critères notés de 1 à 5, ramenés sur 20', () => {
    const toutes = (n) => Object.fromEntries(C.autoEval.map((c) => [c.key, n]))
    expect(noteAutoEval({})).toBeNull()
    expect(noteAutoEval(toutes(5))).toBe(20)
    expect(noteAutoEval(toutes(3))).toBe(12)
    expect(noteAutoEval({ ...toutes(4), oral: 2 })).toBe(14.5)
  })
  it('la préparation exportée range les arguments par question', () => {
    const go = {
      ...grandOralVide(),
      q1: 'Un résultat positif suffit-il à garantir la santé financière ?',
      q2: 'Fidéliser coûte-t-il moins cher que conquérir ?',
      organisation: 'Boulangerie Martin',
      sources: [source],
      analyse: { carac: { type: 'Entreprise privée' } },
      arguments: [
        { id: 'x', question: 'q2', a: 'Fidéliser coûte moins cher.', e: '', notion: '', i: '', sourceId: '', eval: {} },
        { id: 'y', question: 'q1', a: 'Bénéfice n’est pas trésorerie.', e: 'Décalage des flux.', notion: 'BFR', i: 'Clients à 60 jours.', sourceId: 's1', eval: {} },
      ],
    }
    const txt = preparationTexte(go)
    expect(txt).toContain('Question 1 : Un résultat positif suffit-il à garantir la santé financière ?')
    expect(txt).toContain('Organisation étudiée : Boulangerie Martin')
    expect(txt).toContain("CARACTÉRISATION DE L'ORGANISATION\nType : Entreprise privée")
    expect(txt.indexOf('ARGUMENTS — QUESTION 1')).toBeLessThan(txt.indexOf('ARGUMENTS — QUESTION 2'))
    expect(txt).toContain('ARGUMENTS — QUESTION 1 : Un résultat positif suffit-il à garantir la santé financière ?\n\n1. Bénéfice n’est pas trésorerie.')
    expect(txt).toContain('   Illustration : Clients à 60 jours. [source 1]')
    expect(txt).toContain('   Auto-évaluation : 2/6')
    expect(txt).toContain('[1] Rapport ou étude — Banque de France, « Les délais de paiement », 2026')
  })
  it('entre l’appareil et le compte, la préparation modifiée en dernier l’emporte', () => {
    const ancien = { ...grandOralVide(), q1: 'Ancienne ?', sources: [source], maj: 100 }
    const recent = { ...grandOralVide(), q1: 'Récente ?', maj: 200 }
    expect(mergeProgress({ grandOral: ancien }, { grandOral: recent }).grandOral.q1).toBe('Récente ?')
    expect(mergeProgress({ grandOral: recent }, { grandOral: ancien }).grandOral.q1).toBe('Récente ?')
    // Une préparation d'avant (sans date) cède devant une préparation datée…
    expect(mergeProgress({ grandOral: { spec: '', q1: 'Très longue question d’avant ?', q2: '', notes: '' } }, { grandOral: recent }).grandOral.q1).toBe('Récente ?')
    // … et deux préparations d'avant se fusionnent toujours champ par champ.
    const f = mergeProgress({ grandOral: { q1: 'Q1 complète ?', q2: '' } }, { grandOral: { q1: 'Q1', q2: 'Q2 ?' } }).grandOral
    expect(f).toEqual({ q1: 'Q1 complète ?', q2: 'Q2 ?' })
  })
})

describe('outils d’analyse partagés', () => {
  it('le tableau de caractérisation suit les critères du cours', () => {
    expect(O.caracterisation.lignes.map((l) => l.id)).toEqual(['activite', 'type', 'finalite', 'statut', 'taille', 'champ', 'production', 'ressources'])
    expect(O.caracterisation.lignes.find((l) => l.id === 'taille').choix).toEqual(['TPE', 'PME', 'ETI', 'Grande entreprise'])
  })
  it('le diagnostic a ses quatre cases, interne puis externe', () => {
    expect(O.diagnostic.cases.map((c) => c.id)).toEqual(['forces', 'faiblesses', 'opportunites', 'menaces'])
    expect(O.diagnostic.cases.map((c) => c.cote.split(' ')[0])).toEqual(['Interne', 'Interne', 'Externe', 'Externe'])
  })
  it('le PESTEL a ses six facteurs dans l’ordre', () => {
    expect(O.pestel.facteurs.map((f) => f.lettre).join('')).toBe('PESTEL')
    expect(O.pestel.facteurs.map((f) => f.label)).toEqual(['Politique', 'Économique', 'Socioculturel', 'Technologique', 'Écologique', 'Légal'])
  })
})
