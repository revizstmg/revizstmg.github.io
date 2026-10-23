import { test,expect } from 'vitest'
import { checkControlRequest,checkControlResult,controlInstruction } from '../../supabase/functions/examen-blanc/control.js'
import { createHandler } from '../../supabase/functions/examen-blanc/handler.js'
const course={id:'gf::0',title:'TVA',subject:'GF',level:'terminale',text:'La TVA collectée moins la TVA déductible donne la TVA à décaisser.'}
const exercise={question:'Explique le calcul de la TVA à décaisser.',correction:'On soustrait la TVA déductible de la TVA collectée.',criteria:Array.from({length:5},(_,i)=>({notion:`Notion ${i}`,expected:`Attendu ${i}`,source:course.text}))}
const prepare={action:'control',step:'prepare',course,previous:[]}
const correct={action:'control',step:'correct',course,exercise,answer:'Je soustrais la TVA déductible.'}
const result={points:100,feedback:'Reprends les notions oubliées.',criteria:Array.from({length:5},(_,index)=>({index,points:index%2?1:0.5,feedback:'Justification de ce critère.'}))}
test('barème ancré dans le cours et cinq critères distincts',()=>{
 expect(checkControlRequest(prepare).course).toEqual(course)
 expect(checkControlResult(exercise,prepare).criteria).toHaveLength(5)
 expect(()=>checkControlResult({...exercise,criteria:exercise.criteria.slice(1)},prepare)).toThrow()
 expect(()=>checkControlResult({...exercise,criteria:exercise.criteria.map(c=>({...c,source:'Autre chapitre'}))},prepare)).toThrow()
 expect(()=>checkControlResult({...exercise,criteria:Array(5).fill(exercise.criteria[0])},prepare)).toThrow()
 expect(()=>checkControlRequest({...correct,answer:' '})).toThrow()
 expect(()=>checkControlRequest({...prepare,previous:Array(6).fill('Déjà posée')})).toThrow()
 expect(controlInstruction(correct)).toContain('Accepte toute formulation équivalente')
})
test('note recomptée, points impossibles ou critères dupliqués refusés',()=>{
 expect(checkControlResult(result,correct).points).toBe(3.5)
 expect(()=>checkControlResult({...result,criteria:result.criteria.map(c=>({...c,points:2}))},correct)).toThrow()
 expect(()=>checkControlResult({...result,criteria:result.criteria.map(c=>({...c,index:0}))},correct)).toThrow()
})
test('sans abonnement : préparation et correction ; authentification et plafond conservés',async()=>{
 let anonymous=false,count=0
 const handler=createHandler({now:()=>1,env:k=>({GEMINI_API_KEY:'fake',SUPABASE_URL:'https://fake',SUPABASE_ANON_KEY:'fake'})[k],fetcher:async(url,o)=>{
  if(url.includes('/auth/'))return new Response(JSON.stringify({id:'u',is_anonymous:anonymous}))
  count++;const instruction=JSON.parse(o.body).contents[0].parts[0].text
  return new Response(JSON.stringify({candidates:[{content:{parts:[{text:JSON.stringify(instruction.includes('Corrige la réponse')?result:exercise)}]}}]}))
 }})
 const request=b=>new Request('https://fake',{method:'POST',headers:{Authorization:'Bearer fake'},body:JSON.stringify(b)})
 anonymous=true;expect((await handler(request(prepare))).status).toBe(401);expect(count).toBe(0)
 anonymous=false
 expect((await handler(request(prepare))).status).toBe(200)
 expect((await (await handler(request(correct))).json()).control.points).toBe(3.5)
 for(let i=2;i<30;i++)expect((await handler(request(prepare))).status).toBe(200)
 expect((await handler(request(correct))).status).toBe(429);expect(count).toBe(30)
})
