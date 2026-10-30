import {test,expect} from '@playwright/test'
import {preparer,etatEleve,attendreAccueil} from './eleve.js'

async function micro(page){
 await preparer(page)
 await page.addInitScript(()=>{
  window.micEvents=[];window.permissions=[]
  Object.defineProperty(navigator.mediaDevices,'getUserMedia',{value:()=>new Promise(resolve=>{
   const id=permissions.length+1
   permissions.push(()=>resolve({getTracks:()=>[{stop(){micEvents.push(`track-stop-${id}`)}}]}))
  })})
  window.MediaRecorder=class{
   constructor(){this.state='inactive';this.mimeType='audio/webm'}
   start(){this.state='recording';micEvents.push('rec-start')}
   stop(){this.state='inactive';micEvents.push('rec-stop');this.onstop?.()}
  }
 })
 await page.goto('./#/grand-oral');await attendreAccueil(page)
 await page.getByRole('button',{name:/M'entraîner à l'oral/}).click()
}
test('micro : permission arrivée après départ, flux arrêté sans enregistrement',async({page})=>{
 await micro(page)
 await page.getByRole('button',{name:/^⏺ Enregistrer$/}).click()
 await page.evaluate(()=>location.hash='#/accueil');await expect(page.locator('.home-simple')).toBeVisible()
 await page.evaluate(()=>permissions[0]())
 await expect.poll(()=>page.evaluate(()=>micEvents)).toEqual(['track-stop-1'])
})
test('micro : double clic pendant la permission, un seul flux et arrêt effectif',async({page})=>{
 await micro(page)
 const button=page.getByRole('button',{name:/^⏺ Enregistrer$/})
 await button.evaluate(b=>{b.click();b.click()})
 expect(await page.evaluate(()=>permissions.length)).toBe(1)
 await page.evaluate(()=>permissions[0]())
 await page.getByRole('button',{name:/Arrêter/}).click()
 await expect.poll(()=>page.evaluate(()=>micEvents)).toEqual(['rec-start','rec-stop','track-stop-1'])
})
async function audio(page){
 await preparer(page,etatEleve({savedDecks:[{id:'audit',title:'Audit',cards:[{front:'Q1',back:'R1'},{front:'Q2',back:'R2'}]}]}))
 await page.addInitScript(()=>{
  window.said=[];window.utterances=[]
  Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},speak(u){said.push(u.text);utterances.push(u)}},configurable:true})
 })
 await page.goto('./#/revision');await attendreAccueil(page)
 await page.getByRole('button',{name:'Révision audio',exact:true}).click()
}
async function entreCartes(page){
 await page.getByRole('button',{name:'Jouer',exact:true}).click()
 await page.evaluate(()=>{utterances[0].onend();utterances[1].onend()})
}
test('audio : Échap ferme, focus capturé et restitué au déclencheur',async({page})=>{
 await audio(page)
 const dialog=page.getByRole('dialog',{name:'Audit'})
 await expect(dialog).toBeVisible()
 expect(await dialog.evaluate(el=>el.contains(document.activeElement))).toBe(true)
 await page.keyboard.press('Shift+Tab')
 expect(await dialog.evaluate(el=>el.contains(document.activeElement))).toBe(true)
 await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0)
 await expect(page.getByRole('button',{name:'Révision audio',exact:true})).toBeFocused()
})
test('audio : fermer entre deux cartes annule la suivante',async({page})=>{
 await audio(page);await entreCartes(page)
 await page.getByRole('button',{name:'Quitter',exact:true}).click()
 await page.waitForTimeout(650)
 expect(await page.evaluate(()=>said)).toEqual(['Q1','R1'])
})
test('audio : Pause/Suivant/Jouer ne réactive pas un ancien délai',async({page})=>{
 await audio(page);await entreCartes(page)
 await page.getByRole('button',{name:'Pause',exact:true}).click()
 await page.getByRole('button',{name:'Question suivante',exact:true}).click()
 await page.getByRole('button',{name:'Jouer',exact:true}).click()
 await page.waitForTimeout(650)
 expect(await page.evaluate(()=>said)).toEqual(['Q1','R1','Q2'])
})
test('formules : reprise hors filtre, erreurs et redémarrage conservent les formules',async({page})=>{
 const errors=await preparer(page,etatEleve({track:{level:'premiere-stmg'}}))
 await page.goto('./#/atelier-formules');await attendreAccueil(page)
 await page.getByRole('button',{name:'OK',exact:true}).click()
 await page.getByLabel('Programme affiché').selectOption('all')
 await page.getByRole('checkbox',{name:/^Montant de la TVA /}).check()
 await page.getByLabel('Exercices par formule').selectOption('1')
 await page.getByRole('button',{name:'Générer mes exercices',exact:true}).click()
 await page.getByLabel('Ton résultat',{exact:true}).waitFor()
 await page.reload();await attendreAccueil(page)
 await page.getByRole('button',{name:'Reprendre ma séance',exact:true}).click()
 for(let i=0;i<2;i++){
  await page.getByLabel('Ton résultat',{exact:true}).fill('-99999')
  await page.getByRole('button',{name:'Vérifier ma réponse',exact:true}).click()
  await page.getByRole('button',{name:'Voir mon bilan',exact:true}).click()
  await expect(page.locator('main')).toContainText('Montant de la TVA')
  await page.getByRole('button',{name:i===0?'Refaire mes erreurs':'Recommencer avec de nouvelles valeurs',exact:true}).click()
  await expect(page.getByLabel('Ton résultat',{exact:true})).toBeVisible()
 }
 expect(errors).toEqual([])
})
const endpoint='**/functions/v1/revizstmg-paiement'
test('paiement : la réponse de A après déconnexion ne redirige plus',async({page})=>{
 await preparer(page);let pending
 await page.route(endpoint,route=>{
  if(route.request().postDataJSON().action==='checkout'){pending=route;return}
  return route.fulfill({json:{mode:'test',abonnement:null}})
 })
 await page.goto('./#/offres')
 await page.getByRole('checkbox',{name:/18 ans/}).check()
 await page.getByRole('button',{name:/Mensuel : 9,99/}).click()
 await expect.poll(()=>!!pending).toBe(true)
 await page.evaluate(()=>{
  const old=localStorage.getItem('stmg_session');localStorage.removeItem('stmg_session')
  dispatchEvent(new StorageEvent('storage',{key:'stmg_session',oldValue:old,newValue:null,storageArea:localStorage}))
 })
 await expect(page.getByText('Connecte-toi avec ton compte pour choisir une offre.',{exact:true})).toBeVisible()
 await pending.fulfill({json:{url:'https://checkout.stripe.test/A'}})
 await page.waitForTimeout(300)
 await expect(page).toHaveURL(/#\/offres/)
})
test('abonnement : nouvelle identité, nouvelle offre et consentement remis à zéro',async({page,context})=>{
 await preparer(page);const b='00000000-0000-4000-8000-000000000002',calls=[]
 await page.route(endpoint,r=>{
  const token=r.request().headers().authorization;calls.push(token)
  return r.fulfill({json:{mode:'test',abonnement:{offre:token.includes('audit-B')?'ultimate':'premium',periode:'mensuel',statut:'active',periode_fin:new Date(Date.now()+86400000).toISOString()}}})
 })
 await page.goto('./#/offres');await expect(page.locator('main')).toContainText('Premium (mensuel)')
 await page.route('**/rest/v1/profiles**',r=>r.fulfill({json:r.request().method()==='GET'?[{id:b,name:'Audit B',role:'eleve',level:'terminale-stmg',specialty:'gestion-finance',progress:{}}]:[]}))
 const tab=await context.newPage();await tab.goto(new URL('./favicon.png',page.url().split('#')[0]).href)
 await tab.evaluate(b=>{
  const p=JSON.parse(localStorage.getItem('stmg_progress_v2'));p.account={id:b,email:'b@example.invalid',role:'eleve'}
  localStorage.setItem('stmg_progress_v2',JSON.stringify(p))
  localStorage.setItem('stmg_session',JSON.stringify({token:'audit-B',refresh:'refresh-B',expires_at:9999999999,user:{id:b,email:'b@example.invalid'}}))
 },b)
 await expect(page.locator('main')).toContainText('Ultimate (mensuel)')
 expect(calls.some(t=>t.includes('audit-B'))).toBe(true)
 await tab.close()
})
test('paiement : délai de chargement borné et bouton de reprise',async({page})=>{
 await preparer(page);await page.clock.install();let fail=true
 await page.route(endpoint,r=>{if(!fail)return r.fulfill({json:{mode:'test',abonnement:null}})})
 await page.goto('./#/offres')
 await expect(page.getByText('Chargement des offres…')).toBeVisible()
 await page.clock.fastForward(16000)
 await expect(page.getByText('Connexion impossible. Réessaie dans un instant.')).toBeVisible()
 fail=false
 await page.locator('section').filter({has:page.getByRole('heading',{name:'S’abonner',exact:true})}).getByRole('button',{name:'Réessayer',exact:true}).click()
 await expect(page.getByRole('checkbox',{name:/18 ans/})).toBeVisible()
})
