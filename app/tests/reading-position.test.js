import { test, expect, vi, afterEach } from 'vitest'
import { readPosition, savePosition } from '../src/data/readingPosition.js'
afterEach(() => vi.unstubAllGlobals())
test('la reprise reste séparée entre les comptes et exclut l’essai sans compte', () => {
 const cache = new Map()
 vi.stubGlobal('localStorage', { getItem: (k) => cache.get(k), setItem: (k,v) => cache.set(k,v) })
 savePosition('eleve-a', { subjectId: 'droit', themeId: 'droit-t5', chapterIndex: 1, page: 2 })
 expect(readPosition('eleve-a')).toMatchObject({ themeId: 'droit-t5', chapterIndex: 1, page: 2 })
 expect(readPosition('eleve-b')).toBeNull()
 savePosition(null, { themeId: 'secret' })
 expect(readPosition(null)).toBeNull()
 expect(cache.size).toBe(1)
})
test('un stockage corrompu ou indisponible ne bloque jamais les cours', () => {
 vi.stubGlobal('localStorage', { getItem: () => '{', setItem: () => { throw new Error('quota') } })
 expect(readPosition('a')).toBeNull()
 expect(() => savePosition('a', { page: 0 })).not.toThrow()
 vi.stubGlobal('localStorage', { getItem: () => JSON.stringify({ version: 1, subjectId: 'droit', themeId: 'droit-t5', chapterIndex: -1, page: 2 }) })
 expect(readPosition('a')).toBeNull()
})
