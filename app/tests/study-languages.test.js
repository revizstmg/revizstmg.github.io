import { expect, test } from 'vitest'
import { normalizeStudyLanguages, chaptersForLanguages } from '../src/data/studyLanguages.js'
import { noter, mergeProgress, chargeUtile } from '../src/progression.js'
import { restoreAccountState } from '../src/store.jsx'

test('les cinq langues sont distinctes de la langue d’interface et les doublons sont écartés', () => {
 expect(normalizeStudyLanguages(['ar', 'en', 'it', 'es', 'de', 'ar'])).toEqual(['ar', 'en', 'it', 'es', 'de'])
 expect(normalizeStudyLanguages(null)).toEqual([])
})
test('la bibliothèque conserve les anciens comptes et ne substitue pas une autre langue', () => {
 const chapters = [{ id: 'lng-en-gram' }, { id: 'lng-es-voc' }]
 expect(chaptersForLanguages(chapters, undefined)).toBe(chapters)
 expect(chaptersForLanguages(chapters, ['es'])).toEqual([chapters[1]])
 expect(chaptersForLanguages(chapters, ['ar', 'it'])).toEqual([])
})
test('un choix plus récent remplace l’ancien après fusion et sa suppression reste effective', () => {
 const old = noter({}, { studyLanguages: ['en', 'es'] }, { appareil: 'a', maintenant: 10 })
 const recent = noter(old, { ...old, studyLanguages: ['ar', 'it'] }, { appareil: 'b', maintenant: 20 })
 for (const [a, b] of [[old, recent], [recent, old]]) expect(mergeProgress(a, b).studyLanguages).toEqual(['ar', 'it'])
 const cleared = noter(recent, { ...recent, studyLanguages: [] }, { appareil: 'b', maintenant: 30 })
 expect(mergeProgress(cleared, recent).studyLanguages).toEqual([])
 expect(chargeUtile(recent).studyLanguages).toEqual(['ar', 'it'])
})
test('les langues suivent le compte connecté et ne fuient pas vers un autre compte', () => {
 const previous = { account: { id: 'a' }, studyLanguages: ['ar', 'en'], profile: {}, track: null }
 const restored = restoreAccountState(previous, { id: 'b', role: 'eleve', level: 'terminale-stmg', name: 'B', progress: { studyLanguages: ['it', 'es'] } }, { user: { id: 'b', email: 'b@test.fr' } })
 expect(restored.studyLanguages).toEqual(['it', 'es'])
})
