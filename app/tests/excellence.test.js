import { accesLibre } from './outils.js'
import {test,expect,vi} from 'vitest'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {EXCELLENCE_SUBJECTS,EXCELLENCE_RUBRIC,checkExcellenceRequest,checkExcellenceResult,excellencePdf} from '../../supabase/functions/examen-blanc/excellence.js'
import {createHandler} from '../../supabase/functions/examen-blanc/handler.js'
import {readExcellence,excellenceKey} from '../src/data/excellence.js'
const answer='La hausse des prix réduit le pouvoir d’achat à revenu nominal inchangé. Une politique ciblée permet de soutenir les ménages modestes.'
const response=()=>({total:20,feedback:'Des mécanismes justes mais une discussion limitée.',criteria:EXCELLENCE_RUBRIC.map(r=>({id:r.id,points:1,feedback:'Justification et amélioration.'})),passages:[{quote:'La hausse des prix réduit le pouvoir d’achat',feedback:'Mécanisme pertinent.',suggestion:'Précise la condition de revenu nominal constant.'}],strengths:['Mécanisme expliqué.'],priorities:['Analyser les limites des aides.'],outline:['Introduction et problématique.','Effets des politiques.','Limites et conclusion.']})
const request=()=>new Request('https://test',{method:'POST',headers:{authorization:'Bearer fake'},body:JSON.stringify({action:'excellence',subjectId:'2022',answer})})
const env=k=>({SUPABASE_URL:'https://fake',SUPABASE_ANON_KEY:'fake',GEMINI_API_KEY:'fake'})[k]
test('documents locaux complets et empreintes des originaux, aucune ancienne année inventée',()=>{
 expect(EXCELLENCE_SUBJECTS.map(s=>s.id)).toEqual(['2024','2023','2022','2021'])
 for(const s of EXCELLENCE_SUBJECTS){const pdf=readFileSync(new URL(`../public/excellence/${s.id}/sujet.pdf`,import.meta.url));expect(pdf.subarray(0,4).toString()).toBe('%PDF');expect(createHash('sha256').update(pdf).digest('hex')).toBe(s.sha256)
 const pages=JSON.parse(readFileSync(new URL(`../public/excellence/${s.id}/texte.json`,import.meta.url),'utf8'));expect(pages).toHaveLength(s.pages);expect(pages[0]).toContain(s.session)
 for(let i=1;i<=s.pages;i++)expect(readFileSync(new URL(`../public/excellence/${s.id}/${i}.jpg`,import.meta.url)).length).toBeGreaterThan(1000)
 }
})
test('note recalculée et preuves limitées au texte vraiment écrit',()=>{
 expect(checkExcellenceResult(response(),answer).total).toBe(5)
 for(const mutate of [r=>r.criteria[0].points=6,r=>r.criteria[0].points=.1,r=>r.criteria[0].id='inventé',r=>r.criteria[1].id=r.criteria[0].id,r=>r.passages[0].quote='Jamais écrit par l’élève']){const r=response();mutate(r);expect(()=>checkExcellenceResult(r,answer)).toThrow('invalid_response')}
 expect(()=>checkExcellenceRequest({subjectId:'https://localhost/private',answer})).toThrow()
 expect(()=>checkExcellenceRequest({subjectId:'2022',answer:' '})).toThrow()
 expect(()=>checkExcellenceRequest({subjectId:'2022',answer:'a'.repeat(60001)})).toThrow()
})
test('brouillons séparés par compte et session, résultat restauré sans accepter un faux total',()=>{
 const all={'2022':{answer,submitted:true,startedAt:1,result:response()},'2024':{answer:'Mon autre sujet.'}},storage={getItem:vi.fn(k=>k===excellenceKey('a')?JSON.stringify(all):null)}
 expect(readExcellence('a',storage)['2022'].result.total).toBe(5)
 expect(readExcellence('a',storage)['2024'].answer).toBe('Mon autre sujet.')
 expect(readExcellence('b',storage)).toEqual({});expect(readExcellence(null,storage)).toEqual({})
 all['2022'].result.passages[0].quote='Absent';expect(readExcellence('a',storage)['2022'].answer).toBe(answer);expect(readExcellence('a',storage)['2022'].result).toBeUndefined()
})
test('dossier choisi côté serveur, empreinte obligatoire et refus des documents remplacés',async()=>{
 const fetcher=vi.fn(async()=>new Response(readFileSync(new URL('../public/excellence/2022/sujet.pdf',import.meta.url))))
 expect((await excellencePdf('2022',fetcher)).mimeType).toBe('application/pdf');expect(fetcher.mock.calls[0][0]).toBe('https://revizstmg.github.io/excellence/2022/sujet.pdf')
 await expect(excellencePdf('2022',async()=>new Response('%PDF-truqué'))).rejects.toThrow('documents_unavailable')
 await expect(excellencePdf('2022',async()=>new Response('Maintenance'))).rejects.toThrow('documents_unavailable')
})
test('correction authentifiée : PDF intact au modèle, copie traitée comme donnée, barème contrôlé',async()=>{
 const sent=[];const fetcher=vi.fn(async(url,o)=>{
 if(url.includes('/auth/'))return Response.json({id:'a'})
 if(url.endsWith('sujet.pdf'))return new Response(readFileSync(new URL('../public/excellence/2022/sujet.pdf',import.meta.url)))
 sent.push(JSON.parse(o.body));return Response.json({candidates:[{content:{parts:[{text:JSON.stringify(response())}]}}]})
 })
 const r=await createHandler({acces:accesLibre,env,fetcher})(request());expect(r.status).toBe(200);expect((await r.json()).excellence.total).toBe(5)
 expect(sent[0].generationConfig.responseSchema.properties.criteria.minItems).toBe(5);expect(sent[0].generationConfig.thinkingConfig).toBeUndefined();expect(sent[0].generationConfig.maxOutputTokens).toBe(4500);expect(fetcher.mock.calls[2][0]).toContain('/gemini-3.5-flash-lite:generateContent');expect(sent[0].contents[0].parts[1].inlineData.mimeType).toBe('application/pdf');expect(sent[0].contents[0].parts[0].text).toContain('INDICATIVE')
 expect(sent[0].contents[0].parts[0].text).toContain(answer);expect(sent[0].systemInstruction.parts[0].text).toContain('dossier officiel')
})
test('sans compte, sans Gemini ou sans dossier vérifiable : aucun appel de correction',async()=>{
 for(const anonymous of [true,false]){
  const fetcher=vi.fn(async()=>Response.json({id:'a',is_anonymous:anonymous}))
  const r=await createHandler({acces:accesLibre,env:k=>k==='GEMINI_API_KEY'?undefined:k==='GROQ_API_KEY'?'fake':env(k),fetcher})(request())
  expect(r.status).toBe(anonymous?401:503);expect(fetcher).toHaveBeenCalledTimes(1)
 }
 const fetcher=vi.fn(async url=>url.includes('/auth/')?Response.json({id:'a'}):new Response('404',{status:404}))
 expect((await (await createHandler({acces:accesLibre,env,fetcher})(request())).json()).error).toBe('documents_unavailable');expect(fetcher).toHaveBeenCalledTimes(2)
})

test('libellés, consentement et erreurs du concours disponibles dans les cinq traductions hors ligne',()=>{
 const phrases=['Prix de l’excellence économique','Commencer ma copie','La correction reçue est incomplète. Aucune note n’a été attribuée. Ta copie est conservée.','J’accepte l’envoi de ma copie et du dossier à Gemini pour la correction. Je n’ai inclus ni nom ni donnée personnelle.']
 for(const lang of ['en','es','it','ar','de']){const dictionary=JSON.parse(readFileSync(new URL(`../src/localisation/public.${lang}.json`,import.meta.url),'utf8'));for(const phrase of phrases){expect(dictionary[phrase]).toBeTruthy();expect(dictionary[phrase]).not.toBe(phrase)}}
})

test('diagnostic modèles : lecture seule, noms Flash filtrés et cache sans clé exposée',async()=>{
 const fetcher=vi.fn(async()=>Response.json({models:[{name:'models/gemini-2.5-flash',supportedGenerationMethods:['generateContent']},{name:'models/gemini-3.6-flash',supportedGenerationMethods:['generateContent']},{name:'models/gemini-3.8-pro',supportedGenerationMethods:['generateContent']},{name:'models/gemini-2.5-flash-preview',supportedGenerationMethods:['generateContent']}]}))
 const h=createHandler({acces:accesLibre,env,fetcher});for(let i=0;i<2;i++){const r=await h(new Request('https://test?check=models'));expect(await r.json()).toEqual({ready:true,models:['gemini-2.5-flash','gemini-3.6-flash']})}
 expect(fetcher).toHaveBeenCalledTimes(1);expect(fetcher.mock.calls[0][1].method).toBeUndefined()
})

test('Prix : panne transitoire puis repli Gemini, PDF et grille conservés, aucun résultat inventé',async()=>{
 for(const status of [503,429,403]){
 const urls=[],pause=vi.fn(async()=>{}),fetcher=vi.fn(async(url,o)=>{
  if(url.includes('/auth/'))return Response.json({id:'a'})
  if(url.endsWith('sujet.pdf'))return new Response(readFileSync(new URL('../public/excellence/2022/sujet.pdf',import.meta.url)))
  urls.push(url);const body=JSON.parse(o.body);expect(body.contents[0].parts[1].inlineData.mimeType).toBe('application/pdf');expect(body.generationConfig.responseSchema.properties.criteria.minItems).toBe(5)
  if(url.includes('3.5-flash-lite'))return Response.json({error:{message:'private-provider-detail'}},{status})
  return Response.json({candidates:[{content:{parts:[{text:JSON.stringify(response())}]}}]})
 })
 const r=await createHandler({acces:accesLibre,env,fetcher,pause})(request())
 if(status===503){expect(r.status).toBe(200);expect((await r.json()).excellence.total).toBe(5);expect(urls).toHaveLength(3);expect(urls[2]).toContain('gemini-3.1-flash-lite');expect(pause).toHaveBeenCalledTimes(1)}else{expect(urls).toHaveLength(1);expect(r.status).toBe(status===429?429:502)}
 }
})

test('Prix : panne sur les deux modèles, attente bornée et aucune note de remplacement',async()=>{
 const signals=[],pause=vi.fn(async()=>{}),fetcher=vi.fn(async(url,o)=>{
 if(url.includes('/auth/'))return Response.json({id:'a'})
 if(url.endsWith('sujet.pdf'))return new Response(readFileSync(new URL('../public/excellence/2022/sujet.pdf',import.meta.url)))
 signals.push(o.signal);return new Response('',{status:503})
 })
 const r=await createHandler({acces:accesLibre,env,fetcher,pause})(request());expect(r.status).toBe(502);expect(await r.json()).toEqual({error:'provider_unavailable'});expect(signals).toHaveLength(3);expect(signals.every(s=>s===signals[0])).toBe(true);expect(pause).toHaveBeenCalledTimes(1)
})
