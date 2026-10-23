import {test,expect} from 'vitest'
import {readFileSync} from 'node:fs'
import {search} from '../src/data/index.js'
import {subjectsForTrack} from '../src/data/tracks.js'
for(const id of ['en','es','it','ar']) test(`guide ${id} : PDF original et parcours complet`,()=>{
 const guide=JSON.parse(readFileSync(new URL(`../resources/langues/${id}.json`,import.meta.url),'utf8'))
 expect(guide.sections).toHaveLength(18)
 expect(guide.sections.every(s=>s.title && s.text.length>200 && s.task.length>70)).toBe(true)
 expect(guide.resources.some(r=>r.kind==='video'&&r.url.startsWith('https://'))).toBe(true)
 const pdf=readFileSync(new URL(`../resources/langues/guide-${id}.pdf`,import.meta.url))
 expect(pdf.subarray(0,5).toString()).toBe('%PDF-')
 expect(pdf.length).toBeGreaterThan(20000)
})
test('les guides restent au catalogue mais leurs anciens exercices ne sont plus proposés dans les parcours',()=>{
 for(const track of [{level:'premiere-stmg'},{level:'terminale-stmg',specialty:'gestion-finance'}]) {
  const subjects=subjectsForTrack(track)
  const languages=subjects.find(s=>s.id.endsWith('langues'))
  expect(languages.resourceOnly).toBe(true)
  expect(languages.chapters).toEqual([])
  expect(subjects.some(s=>!s.resourceOnly&&s.chapters.length>0)).toBe(true)
 }
})

test('la recherche ne propose plus les anciens chapitres de langues',()=>{
 expect(search('conjugaisons').filter(r=>r.type==='chapter'&&['langues','p1-langues'].includes(r.subjectId))).toEqual([])
 expect(search('Langues').some(r=>r.type==='subject'&&r.id==='langues')).toBe(true)
})
