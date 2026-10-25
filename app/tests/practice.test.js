import {test,expect} from 'vitest'
import {practiceUnits,checkPracticeRequest,checkPracticeResult} from '../../supabase/functions/examen-blanc/practice.js'
import {practiceTargets,practiceKey} from '../src/data/practice.js'
const course={id:'t::0',title:'Production',subject:'Management',level:'terminale',text:'La production à la commande limite le stockage de produits finis.\n\nLa qualité du produit peut contribuer à la compétitivité hors prix.\n\nLa flexibilité permet de répondre aux variations de la demande.\n\nLa maintenance préventive limite les risques de panne.'}
const body={action:'practice',course,targets:['u0','u1','u2','u3'],previous:[]}
const prompts=['Situation fictive : une entreprise attend la commande avant de lancer la fabrication. Quel effet doit-elle anticiper sur le stock de produits finis ?', 'Le responsable affirme que seule une baisse des prix rend une entreprise compétitive. Quel argument du cours permet de corriger ce raisonnement ?', 'Dans un atelier fictif, les clients demandent des volumes très variables chaque mois. Quelle capacité de production faut-il développer pour répondre à ce besoin ?', 'Un technicien propose de remplacer les contrôles réguliers par une intervention après chaque panne. Quel risque est négligé dans cette proposition ?']
const bank=()=>({questions:practiceUnits(course).map((u,i)=>({q:prompts[i],skill:i===0?'situation':'reasoning',choices:['La décision justifiée.','Une erreur de raisonnement.','Une autre erreur précise.'],answer:0,explain:'La décision correcte découle du mécanisme indiqué dans le cours.',unitIds:[u.id],source:u.source}))})
test('les passages de tout le cours sont couverts, pas seulement les définitions',()=>{
 expect(practiceUnits(course)).toHaveLength(4);expect(checkPracticeRequest(body).targets).toHaveLength(4)
 expect(checkPracticeResult(bank(),body).questions).toHaveLength(4)
 const long={...course,text:Array.from({length:15},(_,i)=>`Le mécanisme ${i} est expliqué par ce passage complet du chapitre et son application.`).join('\n\n')};let history={counts:{}}
 const seen=new Set();for(let n=0;n<3;n++){const ids=practiceTargets(long,history);ids.forEach(id=>{seen.add(id);history.counts[id]=(history.counts[id]||0)+1})}expect(seen.size).toBe(15)
})
test('pas de questions de définition ni de copie des anciennes questions, sources et diversité contrôlées',()=>{
 for(const mutate of [b=>b.questions[0].q='Que signifie la production ?',b=>b.questions[0].source='Autre chapitre',b=>b.questions[0].unitIds=['u99'],b=>b.questions[0].choices=['idem','idem','autre'],b=>b.questions.forEach(q=>q.skill='reasoning'),b=>b.questions.pop()]){const b=bank();mutate(b);expect(()=>checkPracticeResult(b,body)).toThrow('invalid_response')}
 expect(()=>checkPracticeResult(bank(),{...body,previous:[bank().questions[0].q]})).toThrow('invalid_response')
})
test('historique isolé par compte et nouvelle version du cours',()=>{
 expect(practiceKey(course,'a')).not.toBe(practiceKey(course,'b'));expect(practiceKey(course,'a')).not.toBe(practiceKey({...course,text:course.text+' Nouveau contenu.'},'a'))
})

test('changer seulement le numéro ou le prénom ne crée pas une nouvelle question',async()=>{const {similarPractice}=await import('../../supabase/functions/examen-blanc/practice.js');expect(similarPractice('Une société fictive vend 150 produits à 20 euros dans son magasin. Quel chiffre d’affaires réalise cette entreprise pendant la période ?', 'Une société fictive vend 300 produits à 40 euros dans son magasin. Quel chiffre d’affaires réalise cette entreprise pendant la période ?')).toBe(true);expect(similarPractice(prompts[0],prompts[1])).toBe(false)})

test('la fonction authentifie avant génération et valide la série produite sans écriture de données',async()=>{
 const {createHandler}=await import('../../supabase/functions/examen-blanc/handler.js');const sent=[]
 const handler=createHandler({env:k=>({GEMINI_API_KEY:'fake',SUPABASE_URL:'https://fake',SUPABASE_ANON_KEY:'fake'})[k],fetcher:async(url,o)=>{if(url.includes('/auth/'))return Response.json({id:'u'});sent.push(JSON.parse(o.body));return Response.json({candidates:[{content:{parts:[{text:JSON.stringify(bank())}]}}]})}})
 const request=authorization=>new Request('https://test',{method:'POST',headers:authorization?{Authorization:'Bearer fake'}:{},body:JSON.stringify(body)})
 expect((await handler(request(false))).status).toBe(401);expect(sent).toHaveLength(0)
 const r=await handler(request(true));expect(r.status).toBe(200);expect((await r.json()).practice.questions).toHaveLength(4)
 expect(sent[0].generationConfig.responseSchema.properties.questions.maxItems).toBe(8);expect(sent[0].generationConfig.thinkingConfig).toEqual({thinkingLevel:'LOW'});expect(sent[0].contents[0].parts[0].text).toContain('AUCUNE question de simple définition')
})

test('les formules courtes et repères datés restent des cibles, les mots isolés ne le deviennent pas',()=>{
 const list=practiceUnits({...course,text:'f(x) = 2x + 1\n1939 : début de la Seconde Guerre mondiale\nSource\n'+course.text})
 expect(list.some(u=>u.source==='f(x) = 2x + 1')).toBe(true);expect(list.some(u=>u.source==='Source')).toBe(false)
})
test('tous les chapitres scolaires disposent de passages utilisables sans tronquer le cours',async()=>{
 const {chargerTout,SUBJECTS,themeChapters}=await import('../src/data/index.js'),{courseText}=await import('../src/data/examenPersonnalise.js');await chargerTout()
 const unavailable=[];let count=0
 for(const s of SUBJECTS.filter(s=>!['langues','p1-langues'].includes(s.id)))for(const theme of s.chapters||[])for(const ch of themeChapters(theme)){
  const c={id:ch.id,title:ch.title,subject:s.name,level:s.niveau==='premiere'?'premiere':'terminale',text:courseText(ch.section)};count++
  if(!practiceUnits(c).length||c.text.length>60000)unavailable.push(ch.id)
 }
 expect(count).toBeGreaterThan(500);expect(unavailable).toEqual([])
})
