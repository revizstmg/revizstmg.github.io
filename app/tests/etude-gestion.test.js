// Étude de gestion (Première STMG) : consignes complètes, citation des sources,
// dossier exporté et fusion appareil ↔ compte.
import { describe, it, expect } from 'vitest'
import ETUDE_GESTION from '../content/commun/etude-gestion.json'
import { dossierTexte } from '../src/pages/EtudeGestion.jsx'
import { citation, noteArgument as noteArg, noteGlobale as noteGlob } from '../src/components/DossierProjet.jsx'
import { mergeProgress, etudeGestionVide } from '../src/store.jsx'

const C = ETUDE_GESTION
const noteArgument = (arg, sources) => noteArg(arg, sources, C.aei.grille)
const noteGlobale = (args, sources) => noteGlob(args, sources, C.aei.grille)
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
    expect(txt).toContain('Auto-évaluation : 2/5')
    expect(txt).toContain('Note de mes arguments (auto-évaluation) : 8/20')
    // Sans analyse remplie, pas de section vide.
    expect(txt).not.toContain('CARACTÉRISATION')
    expect(txt).not.toContain('PESTEL')
  })
  it('le dossier exporté reprend la caractérisation, le diagnostic et le PESTEL', () => {
    const eg = {
      ...etudeGestionVide(),
      analyse: {
        carac: { type: 'Entreprise privée', taille: 'TPE', ressources: '4 salariés\nun four' },
        swot: { forces: 'Clientèle fidèle\n\n Savoir-faire ', menaces: 'Nouveau concurrent' },
        pestel: { legal: 'Normes d’hygiène', economique: '' },
      },
    }
    const txt = dossierTexte(eg)
    expect(txt).toContain("CARACTÉRISATION DE L'ORGANISATION\nType : Entreprise privée\nTaille : TPE\nRessources : 4 salariés ; un four")
    expect(txt).toContain('DIAGNOSTIC INTERNE\nForces :\n   - Clientèle fidèle\n   - Savoir-faire')
    expect(txt).toContain('DIAGNOSTIC EXTERNE\nMenaces :\n   - Nouveau concurrent')
    expect(txt).not.toContain('Faiblesses')
    expect(txt).toContain('PESTEL\nL — Légal :\n   - Normes d’hygiène')
    expect(txt).not.toContain('Économique')
  })
  it('grille A-E-I : 5 critères, dont 2 vérifiés automatiquement', () => {
    expect(C.aei.grille.map((c) => c.etape)).toEqual(['A', 'E', 'E', 'I', 'I'])
    const arg = { a: 'Elle suit sa marge.', e: 'La marge mesure la valeur créée.', notion: 'marge', i: 'Marge de 40 %.', sourceId: 's1', eval: {} }
    expect(noteArgument(arg, [source])).toBe(2) // notion + source reliée
    expect(noteArgument({ ...arg, eval: { a: true, e: true, i: true } }, [source])).toBe(5)
    // Une case cochée ne compte pas si la partie n'est pas écrite ; une source supprimée non plus.
    expect(noteArgument({ ...arg, e: '', eval: { a: true, e: true, i: true } }, [source])).toBe(4)
    expect(noteArgument({ ...arg, eval: { a: true, e: true, i: true } }, [])).toBe(4)
  })
  it('note globale sur 20 : la moyenne des grilles, au demi-point', () => {
    const plein = { a: 'A', e: 'E', notion: 'n', i: 'I', sourceId: 's1', eval: { a: true, e: true, i: true } }
    const vide = { a: 'A', e: '', notion: '', i: '', sourceId: '', eval: {} }
    expect(noteGlobale([], [source])).toBeNull()
    expect(noteGlobale([plein], [source])).toBe(20)
    expect(noteGlobale([plein, vide], [source])).toBe(10)
    expect(noteGlobale([{ ...vide, eval: { a: true } }], [source])).toBe(4)
  })
  it('entre l’appareil et le compte, la version modifiée en dernier l’emporte', () => {
    const ancien = { ...etudeGestionVide(), problematique: 'Ancienne ?', maj: 100 }
    const recent = { ...etudeGestionVide(), problematique: 'Récente ?', maj: 200 }
    expect(mergeProgress({ etudeGestion: ancien }, { etudeGestion: recent }).etudeGestion.problematique).toBe('Récente ?')
    expect(mergeProgress({ etudeGestion: recent }, { etudeGestion: ancien }).etudeGestion.problematique).toBe('Récente ?')
  })
})
