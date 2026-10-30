import { accesLibre } from './outils.js'
import { describe,it,expect } from 'vitest'
import { checkStudyRequest, checkStudyResult } from '../../supabase/functions/examen-blanc/study.js'
import { nouvelleNote } from '../src/notesClasse.js'
import { mergeProgress } from '../src/progression.js'
const course={id:'t::0',title:'TVA',subject:'GF',level:'terminale',text:'La TVA collectée moins la TVA déductible.'}
const result={status:'ready',summary:'Difficultés déclarées.',weaknesses:[{chapterId:course.id,skill:'Calcul',evidence:'Erreur déclarée',advice:'Revoir la différence'}],exercises:Array.from({length:3},(_,i)=>({chapterId:course.id,skill:'TVA',question:`Cas fictif ${i} : calcule…`,correction:'Méthode détaillée'}))}
describe('révisions des notes de classe',()=>{
 it('refuse un rattachement inventé et une réponse incomplète',()=>{
  expect(checkStudyResult(result,[course]).exercises).toHaveLength(3)
  expect(()=>checkStudyResult({...result,exercises:[{...result.exercises[0],chapterId:'autre'}]},[course])).toThrow()
  expect(checkStudyResult({status:'unreadable',summary:'Copie floue'},[course]).exercises).toEqual([])
 })
 it('exige sujet et copie distincts et des cours valides',()=>{
  expect(checkStudyRequest({action:'study',missed:'Calcul TVA',courses:[course]}).files).toEqual([])
  expect(()=>checkStudyRequest({missed:'Calcul',courses:[{...course,text:''}]})).toThrow()
  expect(()=>checkStudyRequest({missed:'Calcul',courses:[course],files:[{mimeType:'application/pdf',data:btoa('%PDF-test')}],subjectFiles:1})).toThrow()
 })
 it('conserve les questions et le bilan dans les sauvegardes fusionnées',()=>{
  const note=nouvelleNote({note:12,matiere:'gf',chapitre:'t',date:'2026-10-23',questionsManquees:' Q3 : TVA ',revision:result},10)
  const merged=mergeProgress({notesClasse:[note]},{notesClasse:[]})
  expect(merged.notesClasse[0].questionsManquees).toBe('Q3 : TVA')
  expect(merged.notesClasse[0].revision.exercises).toHaveLength(3)
  expect(JSON.stringify(note)).not.toContain('base64')
 })
})

import { createHandler } from '../../supabase/functions/examen-blanc/handler.js'
it('refuse un compte anonyme avant tout appel au fournisseur',async()=>{
 let count=0
 const handler=createHandler({acces:accesLibre,env:k=>({GEMINI_API_KEY:'fake',SUPABASE_URL:'https://fake',SUPABASE_ANON_KEY:'fake'})[k],fetcher:async url=>{if(!url.includes('/auth/'))count++;return new Response(JSON.stringify({id:'u',is_anonymous:true}))}})
 const response=await handler(new Request('https://fake',{method:'POST',headers:{Authorization:'Bearer fake'},body:JSON.stringify({action:'study',missed:'TVA',courses:[course]})}))
 expect(response.status).toBe(401);expect(count).toBe(0)
})
it('produit un bilan validé sans abonnement',async()=>{
 let count=0
 const handler=createHandler({acces:accesLibre,now:()=>1,env:k=>({GEMINI_API_KEY:'fake',SUPABASE_URL:'https://fake',SUPABASE_ANON_KEY:'fake'})[k],fetcher:async(url,options)=>{
  if(url.includes('/auth/'))return new Response(JSON.stringify({id:'u',app_metadata:{}}))
  count++;const sent=JSON.parse(options.body);expect(sent.contents[0].parts[0].text).toContain('difficultés déclarées')
  return new Response(JSON.stringify({candidates:[{content:{parts:[{text:JSON.stringify(result)}]}}]}))
 }})
 const r=await handler(new Request('https://fake',{method:'POST',headers:{Authorization:'Bearer fake'},body:JSON.stringify({action:'study',missed:'TVA',courses:[course]})}))
 expect(r.status).toBe(200);expect((await r.json()).study.exercises).toHaveLength(3);expect(count).toBe(1)
})
import { ajouterNote } from '../src/notesClasse.js'
it('met à jour le bilan d’une note sans la dupliquer',()=>{
 const old={id:'x',note:12,ajouteLe:1};const updated={...old,revision:result,ajouteLe:2}
 expect(ajouterNote([old],updated)).toEqual([updated])
 expect(mergeProgress({notesClasse:[old]},{notesClasse:[updated]}).notesClasse[0].revision).toEqual(result)
})
