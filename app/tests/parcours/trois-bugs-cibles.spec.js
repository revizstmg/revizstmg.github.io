import {test,expect} from '@playwright/test'
import {readFileSync} from 'node:fs'
import {preparer,etatEleve,attendreAccueil,etat} from './eleve.js'
const ordre={theme:'gf-t1',index:18,game:{id:'gf-t1-ordre',steps:['Pièce justificative','Journal','Grand livre','Balance','Documents de synthèse (bilan, compte de résultat, annexe)']}}
for(const phase of ['getSubscription','unsubscribe'])test(`suppression aboutit malgré push ${phase} silencieux`,async({page})=>{
 await preparer(page);let rpc=0
 await page.route('https://*.supabase.co/rest/**',r=>{if(r.request().url().includes('/rpc/revizstmg_supprimer_compte'))rpc++;return r.fulfill({json:[]})})
 await page.addInitScript(phase=>{
  window.PushManager ||= function(){}
  const sub={endpoint:'https://push.example.test/synthetic',unsubscribe:()=>{window.__pushStage='unsubscribe';return new Promise(()=>{})}}
  Object.defineProperty(navigator.serviceWorker,'ready',{configurable:true,value:Promise.resolve({pushManager:{getSubscription:()=>{window.__pushStage='getSubscription';return phase==='getSubscription'?new Promise(()=>{}):Promise.resolve(sub)}}})})
 },phase)
 await page.goto('./#/parametres?rubrique=donnees&reglage=suppression');await attendreAccueil(page);await page.clock.install()
 page.on('dialog',d=>d.accept());await page.getByRole('button',{name:/Supprimer mon compte$/}).click()
 await expect.poll(()=>page.evaluate(()=>window.__pushStage)).toBe(phase);await page.clock.runFor(8000)
 await expect(page.getByRole('heading',{name:'Se connecter',exact:true})).toBeVisible()
 expect(rpc).toBe(1);expect(await page.evaluate(()=>!!localStorage.getItem('stmg_session'))).toBe(false)
})
test('reprise Vrai/Faux : question et correction stables après mise à jour de progression',async({page})=>{
 await preparer(page);await page.addInitScript(()=>Math.random=()=>0)
 const source=JSON.parse(readFileSync(new URL('../../content/gestion-finance/cours-reels.json',import.meta.url),'utf8'))
 const defs=new Map(source['gf-t1'][0].blocks.find(b=>b.t==='table').rows)
 const truth=statement=>{const m=statement.match(/^« (.*?) » : (.*)$/);expect(m,'Énoncé fondé sur les définitions du cours').toBeTruthy();expect(defs.has(m[1])).toBe(true);return defs.get(m[1])===m[2]}
 await page.goto('./#/subject/gestion-finance/theme/gf-t1/chapter/0');await attendreAccueil(page)
 await page.getByRole('button',{name:/Exercices/}).click()
 if(await page.locator('.chapter-memorisation').count())await page.locator('.chapter-memorisation').evaluate(el=>el.open=true)
 await page.getByRole('button',{name:/Vrai ou faux.*notions/}).first().click();await page.getByRole('button',{name:/Entraînement/}).click()
 const ex=page.locator('[data-exercice]');await expect(ex).toContainText('Question 1 /')
 const n=Number((await ex.innerText()).match(/Question 1 \/ (\d+)/)[1]);expect(n).toBeGreaterThan(1)
 for(let i=0;i<n;i++){
  const statement=await ex.locator('p.mb-5').innerText();const yes=truth(statement)
  await ex.getByRole('button',{name:yes?/Faux$/:/Vrai$/}).click()
  await ex.getByRole('button',{name:/suivant|score/i}).click()
 }
 await ex.getByRole('button',{name:/Refaire mes erreurs/}).click()
 const before=await ex.locator('p.mb-5').innerText(),yes=truth(before)
 await ex.getByRole('button',{name:yes?/Vrai$/:/Faux$/}).click()
 const xp=(await etat(page)).xp||0
 await page.evaluate(()=>{Math.random=()=>0.999;window.dispatchEvent(new CustomEvent('stmg-focus-done',{detail:{minutes:1}}))})
 await expect.poll(async()=> (await etat(page)).xp||0).toBeGreaterThan(xp)
 const after=await ex.locator('p.mb-5').innerText()
 expect(after).toBe(before)
 await expect(ex).not.toContainText('Pas tout à fait')
})
test('ordre : aucune note ni XP de A créditée à B après changement de compte',async({page})=>{
 const B='00000000-0000-4000-8000-000000000002';await preparer(page)
 await page.route('https://*.supabase.co/rest/**',r=>{
  const url=new URL(r.request().url())
  if(url.pathname.endsWith('/profiles')&&r.request().method()==='GET'&&url.searchParams.get('id')===`eq.${B}`)return r.fulfill({json:[{id:B,name:'Bob Audit',role:'eleve',level:'terminale-stmg',specialty:'gestion-finance',progress:etatEleve({xp:500})}]})
  return r.fulfill({json:[]})
 })
 const sample=ordre
 await page.goto(`./#/subject/gestion-finance/theme/${sample.theme}/chapter/${sample.index}`);await attendreAccueil(page)
 await page.getByRole('button',{name:/Exercices/}).click()
 if(await page.locator('.chapter-memorisation').count())await page.locator('.chapter-memorisation').evaluate(el=>el.open=true)
 await page.getByRole('button',{name:/Remise en ordre.*chaîne comptable/i}).click();await page.getByRole('button',{name:/Entraînement/}).click()
 const ex=page.locator('[data-exercice]');await expect(ex.getByRole('button',{name:sample.game.steps[0],exact:true})).toBeVisible()
 await page.clock.install({time:new Date('2026-11-16T12:00:00Z')});await page.clock.pauseAt(new Date('2026-11-16T12:00:01Z'))
 for(const step of sample.game.steps)await ex.getByRole('button',{name:step,exact:true}).click()
 // Le succès est programmé dans400ms, pas encore enregistré.
 const a=await etat(page)
 await page.evaluate(B=>{const old=localStorage.getItem('stmg_session'),next=JSON.stringify({token:'token-B',refresh:'r',expires_at:9999999999,user:{id:B,email:'b@test.fr'}});localStorage.setItem('stmg_session',next);window.dispatchEvent(new StorageEvent('storage',{key:'stmg_session',oldValue:old,newValue:next}))},B)
 await expect.poll(async()=> (await etat(page)).account?.id).toBe(B)
 const before=await etat(page);await page.clock.runFor(1000)
 const after=await etat(page)
 expect(after.account.id).toBe(B);expect(after.xp).toBe(before.xp)
 expect(after.chapters?.[sample.theme]?.games?.[sample.game.id]).toBeUndefined()
})

for(const leave of [false,true])test(`ordre : ${leave?'sortie annule le résultat différé':'fin normale créditée une seule fois'}`,async({page})=>{
 await preparer(page);await page.route('https://*.supabase.co/rest/**',r=>r.fulfill({json:[]}))
 await page.goto(`./#/subject/gestion-finance/theme/${ordre.theme}/chapter/${ordre.index}`);await attendreAccueil(page)
 await page.getByRole('button',{name:/Exercices/}).click();if(await page.locator('.chapter-memorisation').count())await page.locator('.chapter-memorisation').evaluate(el=>el.open=true)
 await page.getByRole('button',{name:/Remise en ordre.*chaîne comptable/i}).click();await page.getByRole('button',{name:/Entraînement/}).click()
 const ex=page.locator('[data-exercice]');await page.clock.install({time:new Date('2026-11-16T12:00:00Z')});await page.clock.pauseAt(new Date('2026-11-16T12:00:01Z'))
 const before=(await etat(page)).xp||0
 for(const step of ordre.game.steps)await ex.getByRole('button',{name:step,exact:true}).click()
 if(leave)await ex.getByRole('button',{name:/Quitter/}).click()
 await page.clock.runFor(1000)
 await expect.poll(async()=> (await etat(page)).xp||0).toBe(before+(leave?0:50))
 const game=(await etat(page)).chapters?.[ordre.theme]?.games?.[ordre.game.id]
 expect(game).toBe(leave?undefined:100)
 await page.clock.runFor(2000);expect((await etat(page)).xp||0).toBe(before+(leave?0:50))
})
test('suppression non confirmée par le serveur : session gardée et reprise disponible',async({page})=>{
 await preparer(page)
 await page.route('https://*.supabase.co/rest/**',r=>r.request().url().includes('/rpc/revizstmg_supprimer_compte')?r.fulfill({status:503,json:{}}):r.fulfill({json:[]}))
 await page.addInitScript(()=>{window.PushManager ||= function(){};Object.defineProperty(navigator.serviceWorker,'ready',{value:Promise.resolve({pushManager:{getSubscription:()=>{window.__pushStarted=true;return new Promise(()=>{})}}}),configurable:true})})
 await page.goto('./#/parametres?rubrique=donnees&reglage=suppression');await attendreAccueil(page);await page.clock.install()
 const messages=[];page.on('dialog',async d=>{messages.push(d.message());await d.accept()})
 const button=page.getByRole('button',{name:/Supprimer mon compte$/});await button.click();await expect.poll(()=>page.evaluate(()=>!!window.__pushStarted)).toBe(true);await page.clock.runFor(8000)
 await expect(button).toBeEnabled();expect(await page.evaluate(()=>!!localStorage.getItem('stmg_session'))).toBe(true)
 expect(messages.some(m=>m.includes('La suppression n’est pas confirmée'))).toBe(true)
})
