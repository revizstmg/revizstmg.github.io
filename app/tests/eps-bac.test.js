import { describe, it, expect } from 'vitest'
import {
  EPS, ENTRAINEMENTS, CHAMPS, estimerNote, moyenneEpreuves, champsDistincts, enSecondes, formaterTemps, enMetres,
  positionSeuil, vitesseDemiFond, ligneSeuil, lignesSeuil, personnaliser, phasesDeSemaines, planEntrainement,
  familleDe, FAMILLES_ENTRAINEMENT, lireValeur,
} from '../src/data/epsBac.js'

describe('référentiel national d’EPS (BO n° 9 du 26 février 2026)', () => {
  it('cinq champs d’apprentissage, trois épreuves de champs distincts, notées sur 20', () => {
    expect(CHAMPS.map((c) => c.numero)).toEqual([1, 2, 3, 4, 5])
    expect(EPS.epreuve.nombreEpreuves).toBe(3)
    expect(EPS.epreuve.noteSur).toBe(20)
    expect(champsDistincts(['ca1', 'ca3', 'ca4'])).toBe(true)
    expect(champsDistincts(['ca1', 'ca1', 'ca4'])).toBe(false)
  })
  it('chaque champ : AFL1 sur 12 (deux éléments de 6), AFL2 et AFL3 avec quatre degrés', () => {
    for (const c of CHAMPS) {
      expect(c.afl1.elements, c.id).toHaveLength(2)
      expect(c.afl1.elements.reduce((n, e) => n + e.points, 0), c.id).toBe(12)
      for (const e of c.afl1.elements) expect(e.criteres.length, `${c.id} ${e.id}`).toBeGreaterThanOrEqual(2)
      expect(c.afl2.degres, c.id).toHaveLength(4)
      expect(c.afl3.degres, c.id).toHaveLength(4)
      expect(c.familles.length, c.id).toBeGreaterThan(0)
    }
  })
  it('les répartitions AFL2/AFL3 offertes valent 8 points', () => {
    for (const [a, b] of EPS.epreuve.choixRepartition) expect(a + b).toBe(8)
    expect(EPS.epreuve.choixRepartition).toEqual([[4, 4], [6, 2], [2, 6]])
  })
  it('la source est citée', () => {
    expect(EPS.source.bo).toMatch(/26 février 2026/)
    expect(EPS.source.urlNote).toMatch(/^https:\/\/www\.education\.gouv\.fr\//)
  })
})

describe('seuils nationaux du champ 1', () => {
  it('chaque ligne se rattache à une famille du champ 1 et a un seuil filles et garçons', () => {
    const ids = new Set(champ1().familles.map((f) => f.id))
    for (const l of EPS.seuilsCA1.lignes) { expect(ids.has(l.famille), l.id).toBe(true); expect(l.g && l.f, l.id).toBeTruthy() }
    expect(new Set(EPS.seuilsCA1.lignes.map((l) => l.id)).size).toBe(EPS.seuilsCA1.lignes.length)
  })
  it('les vitesses du demi-fond sont cohérentes avec les temps et distances du texte officiel', () => {
    for (const l of lignesSeuil('demi-fond')) {
      for (const sexe of ['g', 'f']) {
        const valeur = l.type === 'temps' ? enSecondes(l[sexe]) : enMetres(l[sexe])
        expect(valeur, `${l.id} ${sexe}`).toBeGreaterThan(0)
        expect(Math.abs(vitesseDemiFond(l, valeur) - l[sexe === 'g' ? 'vg' : 'vf']), `${l.id} ${sexe}`).toBeLessThan(0.06)
      }
    }
  })
})
function champ1() { return CHAMPS[0] }

describe('conversions', () => {
  it('temps et distances', () => {
    expect(enSecondes('3’08')).toBe(188)
    expect(enSecondes('4’00')).toBe(240)
    expect(enSecondes('29’’2')).toBeCloseTo(29.2)
    expect(enSecondes('40’’')).toBe(40)
    expect(enSecondes('57’’5')).toBeCloseTo(57.5)
    expect(enSecondes('n’importe quoi')).toBeNull()
    expect(formaterTemps(188)).toBe('3’08')
    expect(enMetres('1 100 m')).toBe(1100)
    expect(enMetres('18,5 m')).toBe(18.5)
    expect(enMetres('13 m')).toBe(13)
  })
})

describe('position par rapport au seuil', () => {
  it('800 m garçons : seuil 3’08', () => {
    const l = ligneSeuil('d800')
    expect(positionSeuil(l, 'g', 188).niveau).toBe('au-seuil')
    expect(positionSeuil(l, 'g', 170).niveau).toBe('au-dessus')
    expect(positionSeuil(l, 'g', 215).niveau).toBe('en-dessous')
    expect(positionSeuil(l, 'f', 236).niveau).toBe('au-seuil') // 3’56 filles
  })
  it('un lancer ou un saut : plus loin ou plus haut est mieux', () => {
    expect(positionSeuil(ligneSeuil('poids'), 'g', 8).niveau).toBe('au-dessus')
    expect(positionSeuil(ligneSeuil('hauteur'), 'f', 1.05).niveau).toBe('en-dessous')
  })
  it('valeur absente : pas de position', () => {
    expect(positionSeuil(ligneSeuil('d800'), 'g', NaN)).toBeNull()
  })
})

describe('estimation de la note', () => {
  it('degré 4 partout, répartition 4-4 : 20 sur 20 au maximum', () => {
    const r = estimerNote({ degresAfl1: [4, 4], degreAfl2: 4, degreAfl3: 4, repartition: [4, 4] })
    expect(r.max).toBe(20)
    expect(r.total).toBeLessThanOrEqual(20)
    expect(r.total).toBeGreaterThan(15)
  })
  it('degré 1 partout : note faible', () => {
    const r = estimerNote({ degresAfl1: [1, 1], degreAfl2: 1, degreAfl3: 1, repartition: [4, 4] })
    expect(r.min).toBe(0)
    expect(r.total).toBeLessThan(4)
  })
  it('la répartition 6-2 donne plus de poids à l’entraînement', () => {
    const a = estimerNote({ degresAfl1: [3, 3], degreAfl2: 4, degreAfl3: 1, repartition: [6, 2] })
    const b = estimerNote({ degresAfl1: [3, 3], degreAfl2: 4, degreAfl3: 1, repartition: [2, 6] })
    expect(a.total).toBeGreaterThan(b.total)
  })
  it('refuse les degrés ou répartitions invalides', () => {
    expect(() => estimerNote({ degresAfl1: [5, 4], degreAfl2: 1, degreAfl3: 1 })).toThrow()
    expect(() => estimerNote({ degresAfl1: [1, 1], degreAfl2: 1, degreAfl3: 1, repartition: [5, 3] })).toThrow()
    expect(() => estimerNote({ degresAfl1: [], degreAfl2: 1, degreAfl3: 1 })).toThrow()
  })
  it('moyenne des trois épreuves', () => {
    expect(moyenneEpreuves([12, 14, 16])).toBe(14)
    expect(moyenneEpreuves([])).toBeNull()
    expect(moyenneEpreuves([12, NaN, 14])).toBe(13)
  })
})

describe('entraînements', () => {
  it('chaque famille d’activité du référentiel a sa bibliothèque, et réciproquement', () => {
    const attendues = CHAMPS.flatMap((c) => c.familles.map((f) => f.id)).sort()
    expect([...FAMILLES_ENTRAINEMENT].sort()).toEqual(attendues)
    for (const id of attendues) expect(familleDe(id), id).not.toBeNull()
  })
  it('chaque phase propose au moins deux séances complètes, dont une pour les AFL2/AFL3', () => {
    for (const [id, f] of Object.entries(ENTRAINEMENTS.familles)) {
      expect(f.roles.length, id).toBeGreaterThan(0)
      expect(f.securite && f.carnet, id).toBeTruthy()
      let aflAutre = 0
      for (const phase of ['construire', 'developper', 'affuter']) {
        expect(f.phases[phase].length, `${id} ${phase}`).toBeGreaterThanOrEqual(2)
        for (const s of f.phases[phase]) {
          expect(s.titre && s.duree > 0 && s.contenu.length > 0, `${id} ${phase}`).toBeTruthy()
          expect(['afl1', 'afl2', 'afl3']).toContain(s.afl)
          if (s.afl !== 'afl1') aflAutre++
        }
      }
      expect(aflAutre, id).toBeGreaterThan(0)
    }
  })
  it('la répartition des semaines en phases', () => {
    for (const n of [1, 2, 3, 4, 6, 8, 12]) {
      const p = phasesDeSemaines(n)
      expect(p).toHaveLength(n)
      if (n >= 3) { expect(p[0]).toBe('construire'); expect(p.at(-1)).toBe('affuter') }
    }
    expect(phasesDeSemaines(0)).toHaveLength(1)
    expect(phasesDeSemaines(40)).toHaveLength(12)
  })
  it('allures personnalisées : 200 m à 100 % de 15 km/h = 48 s', () => {
    expect(personnaliser('4 × [200@100]', 15)).toBe('4 × 200 m en 48 s')
    expect(personnaliser('[400@100]', 15)).toBe('400 m en 1’36')
    expect(personnaliser('[200@105]', 15)).toBe('200 m en 46 s')
    expect(personnaliser('[200@100]', null)).toBe('200 m')
  })
  it('plan de 6 semaines, 2 séances par semaine, demi-fond avec allures', () => {
    const p = planEntrainement({ famille: 'demi-fond', semaines: 6, seancesParSemaine: 2, vitesseKmh: 15 })
    expect(p.plan).toHaveLength(6)
    expect(p.plan.every((w) => w.seances.length === 2)).toBe(true)
    expect(p.plan[0].phase).toBe('construire')
    expect(p.plan.at(-1).phase).toBe('affuter')
    expect(JSON.stringify(p.plan)).toMatch(/200 m en 4\d s/)
    expect(JSON.stringify(p.plan)).not.toMatch(/\[\d+@\d+\]/)
    expect(p.avertissement).toMatch(/ne remplacent ni le professeur/)
  })
  it('refuse une famille inconnue et borne les séances par semaine', () => {
    expect(() => planEntrainement({ famille: 'curling' })).toThrow()
    expect(planEntrainement({ famille: 'yoga', seancesParSemaine: 9 }).plan[0].seances).toHaveLength(4)
  })
  it('chaque famille produit un plan sans placeholder résiduel', () => {
    for (const id of FAMILLES_ENTRAINEMENT) {
      const p = planEntrainement({ famille: id, semaines: 8, seancesParSemaine: 3, vitesseKmh: 14 })
      expect(p.plan).toHaveLength(8)
      expect(JSON.stringify(p), id).not.toMatch(/\[\d+@\d+\]/)
    }
  })
})

describe('saisie de la performance', () => {
  it('temps : minutes-secondes, secondes décimales, secondes seules', () => {
    const l = ligneSeuil('d800')
    expect(lireValeur(l, '3’08')).toBe(188)
    expect(lireValeur(l, "3'08")).toBe(188)
    expect(lireValeur(l, '3:08')).toBe(188)
    expect(lireValeur(l, '190')).toBe(190)
    expect(lireValeur(ligneSeuil('s50'), '7,4')).toBeCloseTo(7.4)
    expect(lireValeur(l, '')).toBeNull()
    expect(lireValeur(l, 'abc')).toBeNull()
    expect(lireValeur(l, '-5')).toBeNull()
  })
  it('distance : virgule ou point, unité facultative', () => {
    expect(lireValeur(ligneSeuil('disque'), '18,5')).toBe(18.5)
    expect(lireValeur(ligneSeuil('disque'), '18.5 m')).toBe(18.5)
    expect(lireValeur(ligneSeuil('t270'), '1 100')).toBe(1100)
  })
})
