import {test,expect} from '@playwright/test'
import {preparer,etatEleve,AUJOURDHUI} from '../tests/parcours/eleve.js'
const ME='00000000-0000-4000-8000-000000000001',OTHER='00000000-0000-4000-8000-000000000002'
test('code ami : presse-papiers refusé pourtant Copié et exception',async({page},info)=>{
 const errors=await preparer(page,etatEleve(),{abonnement:null})
 await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('clipboard-denied-synthetic'))}}))
 await page.route('https://*.supabase.co/rest/**',r=>r.fulfill({json:new URL(r.request().url()).pathname.endsWith('/friend_user')?[{code:'LEA234'}]:[]}))
 await page.goto('/#/amis');await page.getByRole('button',{name:/Copier le code/}).click();await expect(page.getByRole('button',{name:/Copié/})).toBeVisible();await expect.poll(()=>errors.length).toBeGreaterThan(0)
 await info.attach('clipboard',{body:JSON.stringify({errors,button:await page.getByRole('button',{name:/Copié/}).innerText()}),contentType:'application/json'})
})
test('prof : semaine périmée comptée et nouvel élève sans données jugé en difficulté',async({page},info)=>{
 await preparer(page,etatEleve({account:{id:ME,email:'prof@test.fr',role:'prof'},classCode:'stmg-abc23',teacherClasses:[{code:'stmg-abc23',label:'Classe synthétique'}]}))
 const rows=[{device_id:OTHER,name:'Ancienne semaine synthétique',role:'eleve',xp:200,streak:2,week:'2026-W01',courses_week:12,active_day:'2026-01-03',subjects:{}},{device_id:'00000000-0000-4000-8000-000000000003',name:'Nouvel inscrit synthétique',role:'eleve',xp:0,streak:0,week:'2026-W45',courses_week:0,active_day:AUJOURDHUI,subjects:{}}]
 await page.route('https://*.supabase.co/rest/**',r=>{const p=new URL(r.request().url()).pathname
 if(p.endsWith('/profiles'))return r.fulfill({json:[{id:ME,name:'Prof Test',role:'prof',level:'terminale-stmg',specialty:'gestion-finance',class_code:'stmg-abc23',progress:{}}]})
 if(p.endsWith('/teacher_class')||p.endsWith('/rpc/revizstmg_classe'))return r.fulfill({json:[{code:'stmg-abc23',label:'Classe synthétique',owner_id:ME}]})
 if(p.endsWith('/class_member'))return r.fulfill({json:r.request().method()==='GET'?rows:[]})
 return r.fulfill({json:[]})})
 await page.goto('/#/classe');await page.getByRole('button',{name:'Suivre mes élèves',exact:true}).click()
 await expect(page.locator('main')).toContainText('1/2 · 50%');await expect(page.locator('main')).toContainText('Nouvel inscrit synthétique');await expect(page.locator('main')).toContainText('En difficulté')
 await info.attach('prof',{body:JSON.stringify({rows,text:await page.locator('main').innerText()}),contentType:'application/json'});await page.screenshot({path:info.outputPath('prof.png'),fullPage:true})
})
test('duel de classe : quiz modifié joué et total différent du premier joueur',async({page},info)=>{
 await preparer(page,etatEleve({classCode:'stmg-abc23'}));let writes=[]
 const old={id:'duel-old',quiz_id:'quiz-edited',quiz_title:'Sujet initial de3questions',class_code:'stmg-abc23',challenger_device:OTHER,challenger_name:'Adversaire synthétique',challenger_score:3,challenger_total:3,status:'open'}
 const edited={id:'quiz-edited',title:'Quiz modifié de1question',status:'published',questions:[{q:'Question modifiée audit ?',choices:['Oui correct','Non'],answer:0}]}
 await page.route('https://*.supabase.co/rest/**',r=>{const p=new URL(r.request().url()).pathname
 if(p.endsWith('/class_quiz'))return r.fulfill({json:[edited]})
 if(p.endsWith('/class_duel')){if(r.request().method()==='PATCH'){writes.push(r.request().postDataJSON());return r.fulfill({status:204})}return r.fulfill({json:[old]})}
 return r.fulfill({json:[]})})
 await page.goto('/#/classe');await page.locator('.class-menu-trigger').click();await page.getByRole('dialog').getByRole('button',{name:/Quiz et travail/}).click();await page.getByRole('button',{name:/Duels/}).click();await page.getByRole('button',{name:/Relever/}).click()
 await expect(page.getByText('Question modifiée audit ?',{exact:true})).toBeVisible();await page.getByRole('button',{name:/Oui correct/}).click();await page.getByRole('button',{name:'Voir mon score',exact:true}).click();await expect.poll(()=>writes.length).toBe(1)
 expect(writes[0].opponent_total).toBe(1);expect(old.challenger_total).toBe(3);await info.attach('quiz-mutated',{body:JSON.stringify({old,edited,writes}),contentType:'application/json'})
})
