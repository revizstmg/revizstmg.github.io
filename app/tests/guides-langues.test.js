import {test,expect} from 'vitest'
import {readFileSync} from 'node:fs'
import {search} from '../src/data/index.js'
import {subjectsForTrack} from '../src/data/tracks.js'
for(const id of ['en','es','it','ar']) test(`guide ${id} : PDF original et parcours complet`,()=>{
 const guide=JSON.parse(readFileSync(new URL(`../resources/langues/${id}.json`,import.meta.url),'utf8'))
 expect(guide.sections).toHaveLength(18)
 expect(guide.sections.every(s=>s.title && s.text.length>200 && s.task.length>70)).toBe(true)
 expect(guide.resources.some(r=>r.kind==='video'&&r.url.startsWith('https://'))).toBe(true)
 expect(guide.lessons.length).toBeGreaterThanOrEqual(20)
 expect(guide.exercises.length).toBeGreaterThanOrEqual(80)
 expect(guide.videos.length).toBeGreaterThanOrEqual(25)
 const lessonIds=new Set(guide.lessons.map(l=>l.id))
 expect(new Set(guide.exercises.map(e=>e.id)).size).toBe(guide.exercises.length)
 for(const e of guide.exercises) {
  expect(e.prompt&&e.answer&&e.explanation, e.id).toBeTruthy()
  expect(e.explanation, e.id).not.toMatch(/La réponse est explicitée|Cette information se trouve|Vérifie le rôle/)
  if(e.origin.startsWith('p1-langues/')&&!e.lessonId) expect(e.context.length, e.id).toBeGreaterThan(100)
  expect(e.lessonId===null||lessonIds.has(e.lessonId), e.id).toBe(true)
  if(e.choices.length) {
   expect(new Set(e.choices).size, e.id).toBe(e.choices.length)
   expect(e.choices, e.id).toContain(e.answer)
  }
 }
 const positions=new Set(guide.exercises.filter(e=>e.choices.length).map(e=>e.choices.indexOf(e.answer)))
 expect(positions.size).toBeGreaterThan(1)
 expect(new Set(guide.videos.map(v=>v.url)).size).toBe(guide.videos.length)
 expect(guide.videos.every(v=>v.url.startsWith('https://')&&v.videoEvidence&&v.provider&&v.verified)).toBe(true)

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
