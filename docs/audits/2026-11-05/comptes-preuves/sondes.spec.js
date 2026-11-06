import {test,expect} from '@playwright/test'
import {preparer,etatEleve} from './tests/parcours/eleve.js'
test('parent sans exercices : statut des matières non évaluées',async({page},info)=>{
 await preparer(page);await page.addInitScript(()=>localStorage.setItem('stmg_parent_link','PTEST23456'))
 await page.route('**/rpc/revizstmg_stats_enfant',r=>r.fulfill({json:[{name:'Élève nouveau',xp:0,subjects:[{short:'Management',score:0,time:0},{short:'Droit',score:0,time:0}],courses_week:0,last_active:new Date().toISOString()}]}))
 await page.goto('/#/parent');await expect(page.getByRole('heading',{name:/Synthèse/})).toBeVisible();const text=await page.locator('main').innerText();expect(text.toLocaleUpperCase('fr')).toContain('À RENFORCER');expect(text).toContain('Management · 0%')
 await info.attach('parent-non-evalue',{body:JSON.stringify({text}),contentType:'application/json'});const {writeFile}=await import('node:fs/promises');await writeFile('../docs/audits/2026-11-05/comptes-preuves/parent-non-evalue.json',JSON.stringify({text},null,2))
})
test('liens confidentialité vers les actions de données',async({page})=>{
 await preparer(page);await page.goto('/#/confidentialite');await page.getByRole('link',{name:'Mon espace',exact:true}).first().click();await expect(page).toHaveURL(/#\/moi$/)
 expect(await page.getByRole('button',{name:/Télécharger mes données/}).count()).toBe(0)
 expect(await page.getByRole('button',{name:/Supprimer mon compte/}).count()).toBe(0)
})
test('export en attente puis changement de compte',async({page},info)=>{
 const A='00000000-0000-4000-8000-000000000001',B='00000000-0000-4000-8000-000000000002'
 await preparer(page,etatEleve({notes:[{id:'prive-A',text:'NOTE CONFIDENTIELLE A'}]}));const releases=[];let exportStarted=false
 await page.route('**/functions/v1/revizstmg-paiement',async r=>{
  if(exportStarted){await new Promise(resolve=>releases.push(resolve))}
  return r.fulfill({json:{mode:'test',abonnement:null}})
 })
 await page.goto('/#/parametres?rubrique=donnees&reglage=export');await expect(page.getByRole('button',{name:/Télécharger mes données/})).toBeVisible()
 exportStarted=true;const download=page.waitForEvent('download')
 await page.getByRole('button',{name:/Télécharger mes données/}).click();await expect.poll(()=>releases.length>0).toBe(true)
 await page.route('https://*.supabase.co/rest/**',r=>r.fulfill({json:[{id:B,name:'Bob Nouveau',role:'eleve',level:'terminale-stmg',progress:{}}]}))
 await page.evaluate(B=>{const old=localStorage.getItem('stmg_session');const next=JSON.stringify({token:'token-B',refresh:'r',expires_at:9999999999,user:{id:B,email:'b@test.fr'}});localStorage.setItem('stmg_session',next);window.dispatchEvent(new StorageEvent('storage',{key:'stmg_session',oldValue:old,newValue:next}))},B)
 releases.forEach(fn=>fn());const file=await download;const {readFile}=await import('node:fs/promises');const body=JSON.parse(await readFile(await file.path(),'utf8'))
 expect(body.donnees.account.id).toBe(A)
 await info.attach('export-ancien-compte',{body:JSON.stringify({exportOwner:body.donnees.account.id,abonnementIndisponible:body.abonnement_indisponible}),contentType:'application/json'})
})
test('export : les brouillons locaux distincts de la progression sont absents',async({page},info)=>{
 await preparer(page);await page.addInitScript(()=>{
  const id='00000000-0000-4000-8000-000000000001'
  localStorage.setItem('revizstmg_exam_v1_'+id,JSON.stringify({title:'EXAMEN LOCAL SENTINELLE'}))
  localStorage.setItem('stmg_eps_preparation_v1:'+id,JSON.stringify({title:'EPS LOCAL SENTINELLE'}))
 })
 await page.goto('/#/parametres?rubrique=donnees&reglage=export');const download=page.waitForEvent('download');await page.getByRole('button',{name:/Télécharger mes données/}).click()
 const file=await download;const {readFile}=await import('node:fs/promises');const body=await readFile(await file.path(),'utf8')
 expect(body).not.toContain('EXAMEN LOCAL SENTINELLE');expect(body).not.toContain('EPS LOCAL SENTINELLE')
 await info.attach('export-sans-brouillons',{body:JSON.stringify({exportKeys:Object.keys(JSON.parse(body)),containsExam:false,containsEps:false}),contentType:'application/json'})
})
test('partage parent refusé : code affiché sans erreur de publication',async({page},info)=>{
 await preparer(page,etatEleve({parentShare:false}));let calls=0
 await page.route('https://*.supabase.co/rest/**',r=>{
  const p=new URL(r.request().url()).pathname
  if(p.endsWith('/child_stats')&&r.request().method()==='POST'){calls++;return r.fulfill({status:503,json:{message:'panne synthétique'}})}
  return r.fulfill({json:[]})
 })
 await page.goto('/#/parametres?rubrique=donnees&reglage=parents')
 const toggle=page.getByRole('switch',{name:'Partager ma progression avec mes parents'})
 await toggle.click();await expect.poll(()=>calls,{timeout:12000}).toBeGreaterThan(0)
 await expect(toggle).toHaveAttribute('aria-checked','true');await expect(page.locator('main').getByRole('button',{name:'Copier le code',exact:true})).toBeVisible()
 expect(await page.locator('main').getByRole('alert').count()).toBe(0)
 await info.attach('partage-refuse',{body:JSON.stringify({calls,main:await page.locator('main').innerText()}),contentType:'application/json'})
})
