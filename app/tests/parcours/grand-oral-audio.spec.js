import {test,expect} from '@playwright/test'
import {preparer,etatEleve,attendreAccueil,etat} from './eleve.js'
async function setup(page){
 await preparer(page)
 await page.addInitScript(()=>{
  window.micEvents=[];window.recorders=[];window.revoked=[]
  const revoke=URL.revokeObjectURL.bind(URL);URL.revokeObjectURL=url=>{revoked.push(url);revoke(url)}
  Object.defineProperty(navigator.mediaDevices,'getUserMedia',{value:async()=>({getTracks:()=>[{stop:()=>micEvents.push('track-stop')}]})})
  window.MediaRecorder=class{
   constructor(){this.state='inactive';this.mimeType='audio/webm';recorders.push(this)}
   start(){this.state='recording';micEvents.push('rec-start')}
   stop(){this.state='inactive';micEvents.push('rec-stop');this.ondataavailable?.({data:new Blob(['audio-fictif'],{type:'audio/webm'})});this.onstop?.()}
   fail(){this.state='inactive';micEvents.push('native-error');this.onerror?.({error:new DOMException('device failure','UnknownError')});this.ondataavailable?.({data:new Blob([],{type:'audio/webm'})});this.onstop?.()}
  }
 })
 await page.goto('./#/grand-oral');await attendreAccueil(page);await page.getByRole('button',{name:/M'entraîner à l'oral/}).click()
 await page.clock.install();await page.getByRole('button',{name:/^⏺ Enregistrer$/}).click();await expect(page.getByRole('button',{name:/^⏹ Arrêter$/})).toBeVisible()
}
test('panne native : arrêt réel de l’interface, message puis nouvel essai normal',async({page})=>{
 await setup(page);await page.evaluate(()=>recorders[0].fail());await page.clock.runFor(65000)
 await expect(page.getByRole('button',{name:/^⏹ Arrêter$/})).toHaveCount(0)
 await expect(page.getByRole('alert')).toContainText('L’enregistrement a échoué.')
 await expect(page.locator('audio')).toHaveCount(0)
 await expect(page.locator('main')).not.toContainText('1:05')
 expect(await page.evaluate(()=>recorders[0].state)).toBe('inactive')
 expect(await page.evaluate(()=>micEvents.filter(x=>x==='track-stop').length)).toBe(1)
 await page.getByRole('button',{name:/^⏺ Enregistrer$/}).click()
 await expect(page.getByRole('button',{name:/^⏹ Arrêter$/})).toBeVisible()
 await expect(page.getByRole('alert')).toHaveCount(0)
 await page.getByRole('button',{name:/^⏹ Arrêter$/}).click();await expect(page.locator('audio')).toBeVisible()
})
for(const [finished,cached] of [[false,true],[true,true],[false,false],[true,false]])test(`audio isolé au changement de compte (${cached?'copie B présente':'sans copie B'}) : ${finished?'réécoute':'micro'}`,async({page})=>{
 await setup(page)
 let audio
 if(finished){await page.getByRole('button',{name:/^⏹ Arrêter$/}).click();await expect(page.locator('audio')).toBeVisible();audio=await page.locator('audio').getAttribute('src')}
 const B='00000000-0000-4000-8000-000000000002'
 await page.route('https://*.supabase.co/rest/**',r=>{
  const q=r.request(),u=new URL(q.url())
  if(u.pathname.endsWith('/profiles')&&q.method()==='GET'&&u.searchParams.get('id')===`eq.${B}`)return r.fulfill({json:[{id:B,name:'Bob Audit',role:'eleve',level:'terminale-stmg',specialty:'gestion-finance',progress:etatEleve({profile:{firstName:'Bob',lastName:'Audit'},xp:500})}]})
  return r.fulfill({json:[]})
 })
 await page.evaluate(({B,progress,cached})=>{localStorage.setItem('stmg_acces',JSON.stringify({uid:B,ligne:{statut:'active',offre:'premium',periode_fin:'2999-01-01T00:00:00Z',mode_test:true},verifieLe:Date.now()}));if(cached)localStorage.setItem('stmg_progress_v2',JSON.stringify(progress));const old=localStorage.getItem('stmg_session'),next=JSON.stringify({token:'jeton-B-fictif',refresh:'r',expires_at:9999999999,user:{id:B,email:'b@test.fr',created_at:'2026-10-01T00:00:00Z'}});localStorage.setItem('stmg_session',next);window.dispatchEvent(new StorageEvent('storage',{key:'stmg_session',oldValue:old,newValue:next}))},{B,cached,progress:etatEleve({account:{id:B,email:'b@test.fr',role:'eleve'},profile:{firstName:'Bob',lastName:'Audit'},xp:500})})
 await expect.poll(async()=>(await etat(page)).account?.id).toBe(B)
 const report={finished,cached,account:(await etat(page)).account.id,...await page.evaluate(()=>({state:recorders[0].state,events:micEvents,revoked,audio:document.querySelector('audio')?.src||null}))}
 expect(report.events).toContain('track-stop');expect(report.state).toBe('inactive')
 if(finished)expect(report.revoked).toContain(audio)
 await expect(page.locator('audio')).toHaveCount(0)
 await expect(page.getByRole('button',{name:/^⏹ Arrêter$/})).toHaveCount(0)
 if(cached){
  await expect(page.getByRole('heading',{name:'Grand Oral',exact:true})).toBeVisible()
  await page.getByRole('button',{name:/M'entraîner à l'oral/}).click()
  await expect(page.getByRole('button',{name:/^⏺ Enregistrer$/})).toBeVisible()
 }
})

test('fin native normale : minuteur arrêté et réécoute disponible',async({page})=>{
 await setup(page);await page.evaluate(()=>recorders[0].stop());await page.clock.runFor(65000)
 await expect(page.getByRole('button',{name:/^⏹ Arrêter$/})).toHaveCount(0)
 await expect(page.locator('audio')).toBeVisible();await expect(page.getByRole('alert')).toHaveCount(0)
 await expect(page.locator('main')).not.toContainText('1:05')
 expect(await page.evaluate(()=>micEvents.filter(x=>x==='track-stop').length)).toBe(1)
})
test('arrêt natif qui lève : piste libérée et nouvel essai possible',async({page})=>{
 await setup(page);await page.evaluate(()=>{recorders[0].stop=()=>{throw Error('synthetic stop failure')}})
 await page.getByRole('button',{name:/^⏹ Arrêter$/}).click()
 await expect(page.getByRole('alert')).toContainText('L’enregistrement a échoué.')
 expect(await page.evaluate(()=>micEvents.filter(x=>x==='track-stop').length)).toBe(1)
 await expect(page.locator('audio')).toHaveCount(0)
 await page.getByRole('button',{name:/^⏺ Enregistrer$/}).click();await expect(page.getByRole('button',{name:/^⏹ Arrêter$/})).toBeVisible()
})
