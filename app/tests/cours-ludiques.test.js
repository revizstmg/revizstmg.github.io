import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { chargerMatiere, ALL_CHAPTERS, SUBJECTS } from '../src/data/index.js'

// Cours « ludiques » : chaque section réécrite commence par une accroche concrète et finit par un mini-défi, sans
// perdre ses mots de vocabulaire ni changer de place. La version ludique n'est appliquée que si elle a exactement
// autant de sections que le cours de base (sinon elle serait mal alignée avec les exercices) : ce test le vérifie.
const AUTORISES = new Set(['p', 'list', 'formula', 'table', 'example', 'tip', 'warning', 'accroche', 'defi', 'figure', 'frise'])
const matieres = readdirSync(join(__dirname, '../content')).filter((m) => existsSync(join(__dirname, `../content/${m}/cours-ludiques.json`)))

describe('cours ludiques', () => {
  it('au moins une matière pilote', () => { expect(matieres.length).toBeGreaterThan(0) })
  for (const m of matieres) {
    it(`${m} : sections alignées, accroche en tête, mini-défi à la fin, blocs valides`, async () => {
      const brut = (await import(`../content/${m}/cours-ludiques.json`)).default
      await chargerMatiere(m)
      const sujet = SUBJECTS.find((s) => s.id === m)
      expect(Object.keys(brut).sort()).toEqual(sujet.chapters.map((t) => t.id).sort())
      for (const [id, entree] of Object.entries(brut)) {
        const c = ALL_CHAPTERS[id]
        // appliqué = les sections de la matière sont bien celles du fichier ludique
        expect(c.cours.length, id).toBe(entree.sections.length)
        expect(c.cours[0].blocks[0]?.t, `${id} appliqué`).toBe('accroche')
        c.cours.forEach((sec, i) => {
          const where = `${id}#${i} « ${sec.h} »`
          expect(sec.h, where).toBeTruthy()
          expect(sec.blocks[0].t, where).toBe('accroche')
          expect(sec.blocks.at(-1).t, where).toBe('defi')
          expect(sec.blocks.length, where).toBeGreaterThanOrEqual(4)
          for (const b of sec.blocks) {
            expect(AUTORISES.has(b.t), `${where} bloc ${b.t}`).toBe(true)
            if (b.t === 'accroche') { expect(b.c?.length, where).toBeGreaterThan(40); expect(b.c.length, where).toBeLessThan(420) }
            if (b.t === 'defi') { expect(b.q?.length, where).toBeGreaterThan(10); expect(b.a?.length, where).toBeGreaterThan(1); expect([undefined, 'vf', 'erreur', 'calcul', 'question'], where).toContain(b.kind) }
            for (const v of [b.c, b.q, b.a, b.explain].flat()) if (typeof v === 'string') expect((v.match(/\*\*/g) || []).length % 2, where).toBe(0)
          }
          const gras = sec.blocks.flatMap((b) => [b.c].flat()).filter((x) => typeof x === 'string').join(' ').match(/\*\*[^*]+\*\*/g) || []
          expect(gras.length, `${where} : mots de vocabulaire en gras`).toBeGreaterThanOrEqual(2)
        })
      }
    })
  }
})
