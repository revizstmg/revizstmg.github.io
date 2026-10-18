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
