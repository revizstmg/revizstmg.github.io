import { test, expect } from 'vitest'
import { inflateSync } from 'node:zlib'
import { buildExamPdf } from '../src/data/examPdf.js'
import { ANNALES_BAC, CENTRES_BAC, annaleUrl } from '../src/data/annalesBac.js'
const draft = { duration:240, courses:[{subject:'Droit',level:'terminale',title:'La responsabilité'}], exam:{title:'Droit et économie',instructions:'Justifiez votre raisonnement.',documents:[{id:'d1',title:'Document fictif',text:'Une situation juridique. '.repeat(700)}],questions:[{id:'q1',enonce:'Qualifiez la situation.',documentIds:['d1'],points:20,correction:'REPONSE_SECRETE_CORRIGE',criteria:['Justifier par la règle.']}]}}
test('les deux PDF ont une couverture, une pagination et séparent strictement sujet et corrigé', () => {
 const subject = buildExamPdf(draft)
 const correction = buildExamPdf(draft,true)
 expect(subject.getNumberOfPages()).toBeGreaterThan(3)
 expect(correction.getNumberOfPages()).toBeGreaterThanOrEqual(2)
 expect(new TextDecoder().decode(new Uint8Array(subject.output('arraybuffer')).slice(0,5))).toBe('%PDF-')
 const streams = doc => {
  const raw = Buffer.from(doc.output('arraybuffer')).toString('latin1')
  return [...raw.matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)].map(m => { try { return inflateSync(Buffer.from(m[1], 'latin1')).toString('latin1') } catch { return m[1] } }).join('\n')
 }
 expect(streams(subject)).not.toContain('REPONSE_SECRETE_CORRIGE')
 expect(streams(correction)).toContain('REPONSE_SECRETE_CORRIGE')
 expect(subject.getNumberOfPages()).toBeGreaterThan(correction.getNumberOfPages())
})
test('les six liens sont des PDF du ministère, sans URL fournie par un utilisateur', () => {
 for (const s of ANNALES_BAC) for (const c of CENTRES_BAC) {
  const url = new URL(annaleUrl(s.id,c.id)); expect(url.hostname).toBe('www.education.gouv.fr'); expect(url.pathname).toMatch(/\.pdf$/)
 }
 expect(annaleUrl('inconnu')).toBeNull()
})
test('les symboles de comparaison des calculs restent lisibles avec la police PDF',()=>{
 const value={...draft,exam:{...draft.exam,questions:[{...draft.exam.questions[0],correction:'8 000 / 104 000 × 100 ≈ 7,69 % ; x ≤ 10 ; y ≥ 2 ; 5 − 3 = 2 ; √25 = 5 ; π ; ∞ ; x ≠ 0.'}]}}
 const doc=buildExamPdf(value,true),raw=Buffer.from(doc.output('arraybuffer')).toString('latin1')
 const decoded=[...raw.matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)].map(m=>{try{return inflateSync(Buffer.from(m[1],'latin1')).toString('latin1')}catch{return ''}}).join('\n')
 expect(decoded).toContain('soit environ');expect(decoded).toContain('7,69 %');expect(decoded).toContain('racine carr');expect(decoded).not.toContain('\x00')
})
