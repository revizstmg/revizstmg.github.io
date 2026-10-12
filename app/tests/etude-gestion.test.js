// Étude de gestion (Première STMG) : consignes complètes, citation des sources,
// dossier exporté et fusion appareil ↔ compte.
import { describe, it, expect } from 'vitest'
import { commun } from '../src/content/contenu.js'
import { citation, dossierTexte } from '../src/pages/EtudeGestion.jsx'
import { mergeProgress, etudeGestionVide } from '../src/store.jsx'

const C = commun('etude-gestion')
const source = { id: 's1', type: 'Entretien', titre: 'Entretien avec la gérante', auteur: 'Mme Martin', date: 'mars 2026', lien: '' }

describe('étude de gestion', () => {
  it('les consignes ont leurs règles, leur démarche et la méthode A-E-I', () => {
    expect(C.regles.length).toBeGreaterThanOrEqual(4)
    expect(C.dossier.map((d) => d.id)).toEqual(['choix', 'organisation', 'sources', 'demarche', 'conclusions'])
    expect(C.aei.etapes.map((e) => e.lettre)).toEqual(['A', 'E', 'I'])
    for (const r of C.references) expect(r.lien).toMatch(/^https:\/\//)
  })
  it('une source se cite : auteur, « titre », date, lien', () => {
    expect(citation(source)).toBe('Mme Martin, « Entretien avec la gérante », mars 2026')
    expect(citation({ titre: 'Rapport', lien: 'https://exemple.fr' })).toBe('« Rapport », https://exemple.fr')
  })
  it('le dossier exporté reprend la problématique, les arguments A-E-I et les sources numérotées', () => {
    const eg = {
      ...etudeGestionVide(),
      organisation: 'Boulangerie Martin',
      problematique: 'Comment la boulangerie mesure-t-elle sa performance ?',
      sources: [source],
      arguments: [{ id: 'a1', a: 'Elle suit sa marge.', e: 'La marge mesure la valeur créée.', notion: 'marge', i: 'Marge de 40 % sur le pain.', sourceId: 's1' }],
    }
    const txt = dossierTexte(eg)
    expect(txt).toContain('Problématique : Comment la boulangerie mesure-t-elle sa performance ?')
    expect(txt).toContain('1. Elle suit sa marge.')
    expect(txt).toContain('Explication : La marge mesure la valeur créée. (notion : marge)')
    expect(txt).toContain('Illustration : Marge de 40 % sur le pain. [source 1]')
    expect(txt).toContain('[1] Entretien — Mme Martin, « Entretien avec la gérante », mars 2026')
  })
  it('entre l’appareil et le compte, la version modifiée en dernier l’emporte', () => {
    const ancien = { ...etudeGestionVide(), problematique: 'Ancienne ?', maj: 100 }
    const recent = { ...etudeGestionVide(), problematique: 'Récente ?', maj: 200 }
    expect(mergeProgress({ etudeGestion: ancien }, { etudeGestion: recent }).etudeGestion.problematique).toBe('Récente ?')
    expect(mergeProgress({ etudeGestion: recent }, { etudeGestion: ancien }).etudeGestion.problematique).toBe('Récente ?')
  })
})
