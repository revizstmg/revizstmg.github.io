import { accesLibre } from './outils.js'
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
 const handler=createHandler({acces:accesLibre,now:()=>1,env:k=>({GEMINI_API_KEY:'fake',SUPABASE_URL:'https://fake',SUPABASE_ANON_KEY:'fake'})[k],fetcher:async(url,o)=>{
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
test('la correction Gemini utilise un raisonnement limité et un délai court sans changer la création',async()=>{
 const sent=[]
 const handler=createHandler({acces:accesLibre,env:k=>({GEMINI_API_KEY:'fake',SUPABASE_URL:'https://fake',SUPABASE_ANON_KEY:'fake'})[k],fetcher:async(url,o)=>{
  if(url.includes('/auth/'))return new Response(JSON.stringify({id:'u'}))
  sent.push(JSON.parse(o.body).generationConfig)
  return new Response(JSON.stringify({candidates:[{content:{parts:[{text:JSON.stringify(sent.length===1?result:exercise)}]}}]}))
 }})
 const req=b=>new Request('https://fake',{method:'POST',headers:{Authorization:'Bearer fake'},body:JSON.stringify(b)})
 expect((await handler(req(correct))).status).toBe(200)
 expect(sent[0].responseSchema.properties.criteria.minItems).toBe(5);expect(sent[0].responseSchema.properties.criteria.items.properties.index.maximum).toBe(4);expect(sent[0].thinkingConfig).toEqual({thinkingLevel:'LOW'});expect(sent[0].maxOutputTokens).toBe(3500)
 expect((await handler(req(prepare))).status).toBe(200)
 expect(sent[1].thinkingConfig).toBeUndefined();expect(sent[1].maxOutputTokens).toBe(6000)
})
test('un dépassement fournisseur rend une erreur explicite sans fabriquer de note',async()=>{
 const handler=createHandler({acces:accesLibre,env:k=>({GEMINI_API_KEY:'fake',SUPABASE_URL:'https://fake',SUPABASE_ANON_KEY:'fake'})[k],fetcher:async url=>{
  if(url.includes('/auth/'))return new Response(JSON.stringify({id:'u'}))
  throw new DOMException('Provider timeout','TimeoutError')
 }})
 const response=await handler(new Request('https://fake',{method:'POST',headers:{Authorization:'Bearer fake'},body:JSON.stringify(correct)}))
 expect(response.status).toBe(502);expect(await response.json()).toEqual({error:'timeout'})
})

test('indisponibilité 503 : vraie question de synthèse ancrée dans le seul cours, explicitement sans génération',async()=>{
 const full={...course,text:'La TVA collectée est la taxe facturée au client lors des ventes.\nLa TVA déductible est la taxe récupérable sur les achats professionnels.\nLa TVA à décaisser correspond à la différence entre ces deux montants.'}
 const calls=[]
 const handler=createHandler({acces:accesLibre,env:k=>({GEMINI_API_KEY:'fake',SUPABASE_URL:'https://fake',SUPABASE_ANON_KEY:'fake'})[k],pause:async ms=>calls.push(ms),fetcher:async url=>url.includes('/auth/')?Response.json({id:'u'}):Response.json({error:{message:'Unavailable'}},{status:503})})
 const r=await handler(new Request('https://fake',{method:'POST',headers:{Authorization:'Bearer fake'},body:JSON.stringify({...prepare,course:full})}))
 expect(r.status).toBe(200);const data=await r.json();expect(data.preparation).toBe('course');expect(data.control.criteria).toHaveLength(5)
 expect(data.control.criteria.every(c=>full.text.includes(c.source))).toBe(true);expect(calls).toEqual([2500])
 expect(checkControlResult(data.control,{...prepare,course:full})).toEqual(data.control)
})
test('un quota ne déclenche aucun repli de synthèse ni nouvelle requête',async()=>{
 let count=0;const handler=createHandler({acces:accesLibre,env:k=>({GEMINI_API_KEY:'fake',SUPABASE_URL:'https://fake',SUPABASE_ANON_KEY:'fake'})[k],fetcher:async url=>{if(url.includes('/auth/'))return Response.json({id:'u'});count++;return Response.json({error:{}},{status:429})}})
 const r=await handler(new Request('https://fake',{method:'POST',headers:{Authorization:'Bearer fake'},body:JSON.stringify(prepare)}));expect(r.status).toBe(429);expect(count).toBe(1);expect(await r.json()).toEqual({error:'rate_limit'})
})
