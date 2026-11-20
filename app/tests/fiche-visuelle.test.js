import { describe, it, expect } from 'vitest'
import { construireFiche, ficheUtile, premiereIdee, lignes, court } from '../src/data/ficheVisuelle.js'

const glossaire = new Map([['dol', 'Tromperie qui pousse à contracter.'], ['erreur', 'Fausse idée sur un élément du contrat.'], ['nullite', 'Annulation du contrat.']])
const section = {
  h: 'Le consentement',
  blocks: [
    { t: 'p', c: 'Le **dol** est une tromperie. Il rend le contrat annulable. L’**erreur** aussi.' },
    { t: 'list', c: ['La **nullité** efface le contrat.', 'Autre point.'] },
    { t: 'warning', h: 'Piège', c: 'Ne confonds pas **nullité** et résiliation.' },
    { t: 'tip', h: 'Astuce', c: 'Cherche la **tromperie**.' },
    { t: 'example', h: 'Cas', c: 'Une montre fausse.' },
    { t: 'formula', c: 'CM = 1 + t' },
  ],
}

describe('fiche visuelle', () => {
  it('tire idées, mots, branches, pièges, astuces, exemples et formules du cours', () => {
    const f = construireFiche(section, glossaire)
    expect(f.idees[0]).toBe('Le dol est une tromperie.')
    expect(f.mots.map((m) => m.terme)).toEqual(['dol', 'erreur', 'nullité'])
    expect(f.branches[0].titre).toBe('dol')
    expect(f.pieges).toHaveLength(1)
    expect(f.astuces).toHaveLength(1)
    expect(f.exemples).toHaveLength(1)
    expect(f.formules).toEqual(['CM = 1 + t'])
    expect(f.autotest.length).toBeGreaterThan(0)
    expect(ficheUtile(f)).toBe(true)
  })
  it('sans glossaire, la fiche reste utile et sans mots à connaître', () => {
    const f = construireFiche(section, null)
    expect(f.mots).toEqual([])
    expect(ficheUtile(f)).toBe(true)
  })
  it('une section vide ne donne pas de fiche', () => {
    expect(ficheUtile(construireFiche({ h: 'x' }, glossaire))).toBe(false)
    expect(ficheUtile(construireFiche(null, glossaire))).toBe(false)
  })
  it('ne répète pas deux mots qui partagent la même définition', () => {
    const g = new Map([['dol', 'Même définition.'], ['tromperie', 'Même définition.']])
    const f = construireFiche({ blocks: [{ t: 'p', c: 'Le **dol** et la **tromperie** sont liés ensemble.' }] }, g)
    expect(f.mots).toHaveLength(1)
  })
  it('court, premiereIdee et lignes coupent proprement', () => {
    expect(court('a'.repeat(50), 20).length).toBeLessThanOrEqual(20)
    expect(premiereIdee('Première phrase. Deuxième phrase.')).toBe('Première phrase.')
    expect(lignes('un deux trois quatre cinq six', 9, 2).length).toBeLessThanOrEqual(2)
  })
})
