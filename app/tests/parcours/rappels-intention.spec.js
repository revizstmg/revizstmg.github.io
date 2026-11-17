import {test,expect} from '@playwright/test'
import {preparer,etatEleve,attendreAccueil,etat} from './eleve.js'
for(const scenario of ['arret','identite','heure'])test(`rappels : activation obsolète refusée après ${scenario}`,async({page})=>{
 await preparer(page);const calls=[];const B='00000000-0000-4000-8000-000000000002'
 await page.route('https://*.supabase.co/rest/**',async r=>{
  const q=r.request(),u=new URL(q.url());
  if(u.pathname.endsWith('/rpc/revizstmg_push_cle'))return r.fulfill({json:'AQID'})
  if(u.pathname.endsWith('/rpc/revizstmg_push_abonner'))calls.push({body:q.postDataJSON(),auth:q.headers().authorization})
  if(u.pathname.endsWith('/profiles')&&q.method()==='GET'&&u.searchParams.get('id')===`eq.${B}`)return r.fulfill({json:[{id:B,name:'Bob Test',role:'eleve',level:'terminale-stmg',specialty:'gestion-finance',progress:etatEleve({xp:500})}]})
  return r.fulfill({json:[]})
 })
 await page.addInitScript(()=>{
  Object.defineProperty(window,'Notification',{configurable:true,value:class{static permission='granted';static requestPermission=async()=>'granted'}})
  window.PushManager ||= function(){}
  const sub={endpoint:'https://push.test/synthetic',toJSON:()=>({endpoint:'https://push.test/synthetic',keys:{p256dh:'fake',auth:'fake'}}),unsubscribe:async()=>{window.__unsubscribed=true;return true}}
  const reg={pushManager:{getSubscription:async()=>null,subscribe:()=>{window.__subStarted=true;return new Promise(r=>window.__finishSubscribe=()=>r(sub))}}}
  Object.defineProperty(navigator.serviceWorker,'ready',{configurable:true,value:Promise.resolve(reg)})
 })
 await page.goto('./#/parametres?rubrique=notifications');await attendreAccueil(page)
 const sw=page.getByRole('switch',{name:/rappel/i});await expect(sw).toBeVisible();await sw.click();await expect.poll(()=>page.evaluate(()=>!!window.__subStarted)).toBe(true)
 if(scenario==='arret'){await sw.click();await expect(sw).toHaveAttribute('aria-checked','false')}
 else if(scenario==='heure'){
  await page.evaluate(()=>{window.__premiereActivation=window.__finishSubscribe;window.__subStarted=false});await page.getByLabel('Heure',{exact:true}).fill('20:00');await expect.poll(()=>page.evaluate(()=>!!window.__subStarted)).toBe(true);await page.evaluate(()=>window.__finishSubscribe());await expect.poll(()=>calls.length).toBe(1)
 }else{
  await page.evaluate(B=>{const old=localStorage.getItem('stmg_session'),next=JSON.stringify({token:'jeton-B-fictif',refresh:'r',expires_at:9999999999,user:{id:B,email:'b@test.fr'}});localStorage.setItem('stmg_session',next);window.dispatchEvent(new StorageEvent('storage',{key:'stmg_session',oldValue:old,newValue:next}))},B)
  await expect.poll(async()=>(await etat(page)).account?.id).toBe(B)
 }
 await page.evaluate(s=>{if(s==='heure')window.__premiereActivation();else window.__finishSubscribe()},scenario);
 if(scenario==='heure')await expect.poll(()=>calls.length).toBe(1);else await expect.poll(()=>page.evaluate(()=>!!window.__unsubscribed)).toBe(true)
 const report={scenario,account:(await etat(page)).account?.id,reminder:(await etat(page)).reminder,calls,message:await page.locator('main').innerText()}
 if(scenario==='arret'){expect(report.reminder.on).toBe(false);expect(report.message).not.toContain('Rappel activé, même téléphone fermé.');expect(calls).toHaveLength(0)}
 else if(scenario==='heure'){expect(report.reminder.time).toBe('20:00');expect(calls.map(c=>c.body.p_minute)).toEqual([1200])}
 else expect(calls).toHaveLength(0)

})
