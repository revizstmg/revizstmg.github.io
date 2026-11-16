import {test,expect} from '/workspace/work/fix-economie-audits/app/node_modules/@playwright/test/index.mjs'
import {writeFileSync,readFileSync} from 'node:fs'
import {preparer,etatEleve,attendreAccueil,etat} from './eleve.js'
const out='/workspace/output/bugs-cibles-20261116/'
for(const phase of ['getSubscription','unsubscribe'])test(`sonde suppression : push ${phase} silencieux`,async({page})=>{
 await preparer(page);let rpc=0
 await page.route('https://*.supabase.co/rest/**',r=>{if(r.request().url().includes('/rpc/revizstmg_supprimer_compte'))rpc++;return r.fulfill({json:[]})})
 await page.addInitScript(phase=>{
  window.PushManager ||= function(){}
  const sub={endpoint:'https://push.example.test/synthetic',unsubscribe:()=>{window.__pushStage='unsubscribe';return new Promise(()=>{})}}
  Object.defineProperty(navigator.serviceWorker,'ready',{configurable:true,value:Promise.resolve({pushManager:{getSubscription:()=>{window.__pushStage='getSubscription';return phase==='getSubscription'?new Promise(()=>{}):Promise.resolve(sub)}}})})
 },phase)
 await page.goto('./#/parametres?rubrique=donnees&reglage=suppression');await attendreAccueil(page);await page.clock.install()
 page.on('dialog',d=>d.accept());await page.getByRole('button',{name:/Supprimer mon compte$/}).click()
 await expect.poll(()=>page.evaluate(()=>window.__pushStage)).toBe(phase);await page.clock.runFor(65000)
 const busy=page.getByRole('button',{name:'Un instant…',exact:true})
 const result={phase,elapsedMs:65000,rpcCalls:rpc,busy:await busy.count()>0&&await busy.isDisabled(),signedIn:await page.evaluate(()=>!!localStorage.getItem('stmg_session')),body:await page.locator('main').innerText(),expected:'Délai borné et reprise utilisable ; ne pas bloquer avant le RPC déjà borné.'}
 writeFileSync(out+`push-${phase}.json`,JSON.stringify(result,null,2));await page.screenshot({path:out+`push-${phase}.png`,fullPage:true})
 expect(result.busy,'Sonde : blocage reproduit').toBe(true);expect(rpc).toBe(0)
})
test('sonde reprise Vrai/Faux : stabilité après mise à jour de progression',async({page})=>{
 await preparer(page);await page.addInitScript(()=>Math.random=()=>0)
 const source=JSON.parse(readFileSync('/workspace/work/fix-economie-audits/app/content/gestion-finance/cours-reels.json','utf8'))
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
 const result={n,before,after,changed:before!==after,body:await ex.innerText(),expected:'La question déjà répondue reste identique pendant la reprise.'}
 writeFileSync(out+'reprise-vf.json',JSON.stringify(result,null,2));await page.screenshot({path:out+'reprise-vf.png',fullPage:true})
 expect(result.changed,'Sonde : question remplacée après réponse').toBe(true)
})
test('sonde ordre : résultat retardé après changement de compte',async({page})=>{
 const B='00000000-0000-4000-8000-000000000002';await preparer(page)
 await page.route('https://*.supabase.co/rest/**',r=>{
  const url=new URL(r.request().url())
  if(url.pathname.endsWith('/profiles')&&r.request().method()==='GET'&&url.searchParams.get('id')===`eq.${B}`)return r.fulfill({json:[{id:B,name:'Bob Audit',role:'eleve',level:'terminale-stmg',specialty:'gestion-finance',progress:{}}]})
  return r.fulfill({json:[]})
 })
 const sample=JSON.parse(readFileSync(out+'jeux.json','utf8')).ordre
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
 await expect.poll(async()=> (await etat(page)).xp||0).toBeGreaterThan(before.xp||0)
 const after=await etat(page)
 const result={a:{account:a.account?.id,xp:a.xp},before:{account:before.account?.id,xp:before.xp,games:before.chapters?.[sample.theme]?.games||{}},after:{account:after.account?.id,xp:after.xp,games:after.chapters?.[sample.theme]?.games||{}},gameId:sample.game.id,expected:'Aucun résultat du compte A dans la progression B après changement de compte.'}
 writeFileSync(out+'ordre-compte.json',JSON.stringify(result,null,2));await page.screenshot({path:out+'ordre-compte.png',fullPage:true})
 expect(after.account.id).toBe(B);expect(after.chapters?.[sample.theme]?.games?.[sample.game.id]).toBe(100)
})
