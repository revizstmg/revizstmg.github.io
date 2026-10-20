import { test, expect } from 'vitest'
import { restoreAccountState } from '../src/store.jsx'

const session = { user: { id: 'eleve', email: 'eleve@test.fr' } }
const profile = { id: 'eleve', name: 'Léa Élève', role: 'eleve', level: 'premiere-stmg', class_code: null, progress: { xp: 20 } }
const ancien = { account: { id: 'prof', role: 'prof' }, profile: { firstName: 'Paul' }, xp: 500, favorites: ['prof-seul'], teacherClasses: [{ code: 'stmg-prof' }], classCode: 'stmg-prof', lang: 'fr', theme: 'dark' }

test('le rôle vient du profil du compte connecté même si le rôle local était professeur', () => {
  const state = restoreAccountState({ ...ancien, account: { id: 'eleve', role: 'prof' } }, profile, session)
  expect(state.account).toEqual({ id: 'eleve', email: 'eleve@test.fr', role: 'eleve' })
  expect(state.profile.firstName).toBe('Léa')
  expect(state.teacherClasses).toEqual([])
  expect(state.classCode).toBe('')
})

test('le compte élève ne reçoit ni les données ni les classes du professeur', () => {
  const state = restoreAccountState(ancien, profile, session)
  expect(state.xp).toBe(20)
  expect(state.favorites).toEqual([])
  expect(state.classCode).toBe('')
  expect(state.teacherClasses).toEqual([])
  expect(state.theme).toBe('dark')
})

test('la progression du même compte reste fusionnée', () => {
  const state = restoreAccountState({ ...ancien, account: { id: 'eleve' }, xp: 50 }, profile, session)
  expect(state.xp).toBe(50)
})

test('un profil reçu pour un autre compte est refusé', () => {
  expect(() => restoreAccountState(ancien, { ...profile, id: 'prof', role: 'prof' }, session)).toThrow(/Profil/)
})

// Essai sans compte, puis connexion à un compte déjà utilisé sur cet appareil :
// ce que l'essai a gagné s'ajoute au compte au lieu de disparaître.
const meta = (compteurs, rev = 0) => ({ v: 1, rev, vuServeur: null, empreinte: '', base: { xp: 0, coins: 0, freezes: 0, totalAnswers: 0, correctAnswers: 0 }, versionBase: 0, compteurs, items: {}, champs: {} })

test('la progression d’un essai sans compte rejoint le compte', () => {
  const essai = { account: null, profile: { firstName: 'Inès' }, xp: 30, favorites: ['gf-t1'], _sync: meta({ xp: { cetAppareil: [30, 0] } }) }
  const compte = { ...profile, progress: { xp: 500, _sync: meta({ xp: { cetAppareil: [500, 0] } }, 7) } }
  const state = restoreAccountState(essai, compte, session)
  expect(state.xp).toBe(530)
  expect(state.favorites).toEqual(['gf-t1'])
  expect(state.account.id).toBe('eleve')
})

test('un essai sans aucune progression ne change rien au compte', () => {
  const state = restoreAccountState({ account: null, profile: { firstName: 'Inès' }, xp: 0 }, { ...profile, progress: { xp: 500 } }, session)
  expect(state.xp).toBe(500)
})
