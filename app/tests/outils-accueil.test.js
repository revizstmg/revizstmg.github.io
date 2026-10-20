// Accueil, « Réviser & réussir » : l'outil conseillé selon la situation de l'élève.
import { describe, expect, it } from 'vitest'
import { outilConseille } from '../src/components/OutilsAccueil.jsx'

const terminale = { level: 'terminale-stmg', specialty: 'gestion-finance' }
const premiere = { level: 'premiere-stmg' }

describe('outil conseillé sur l’accueil', () => {
  it('par défaut : le programme jusqu’au bac', () => {
    expect(outilConseille({ track: terminale }, '2026-10-19')).toEqual({ id: 'programme' })
    expect(outilConseille({ track: premiere }, '2026-10-19')).toEqual({ id: 'programme' })
  })
  it('des chapitres marqués « à revoir » : les favoris', () => {
    expect(outilConseille({ track: terminale, favorites: ['gf-t1', 'droit-t5'] }, '2026-10-19')).toEqual({ id: 'favoris', favoris: 2 })
  })
  it('des thèmes de la filière à réviser aujourd’hui : la révision intelligente', () => {
    const srs = { 'gf-t1': { due: '2026-10-19' }, 'droit-t5': { due: '2026-10-01' }, 'eco-t6': { due: '2026-10-25' }, 'p1-droit-t1': { due: '2026-10-01' } }
    expect(outilConseille({ track: terminale, srs, favorites: ['gf-t1'] }, '2026-10-19')).toEqual({ id: 'revision', dus: 2 })
  })
  it('un thème d’une autre filière ne compte pas', () => {
    expect(outilConseille({ track: terminale, srs: { 'p1-droit-t1': { due: '2026-10-01' } } }, '2026-10-19')).toEqual({ id: 'programme' })
  })
  it('le bac dans moins de 30 jours : le bac blanc, avant tout le reste', () => {
    const srs = { 'gf-t1': { due: '2026-10-01' } }
    expect(outilConseille({ track: terminale, srs, bacDate: '2026-11-10' }, '2026-10-19')).toEqual({ id: 'bac-blanc', jours: 22 })
    expect(outilConseille({ track: terminale }, '2027-06-01')).toEqual({ id: 'bac-blanc', jours: 15 })
    expect(outilConseille({ track: terminale, bacDate: '2026-12-31' }, '2026-10-19').id).toBe('programme')
  })
  it('un bac passé ne fait plus conseiller le bac blanc', () => {
    expect(outilConseille({ track: terminale, bacDate: '2026-10-01' }, '2026-10-19').id).toBe('programme')
  })
})
