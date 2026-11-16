import {test,expect} from '@playwright/test'
import {preparer,etatEleve,attendreAccueil} from './eleve.js'
const routeParents='./#/parametres?rubrique=donnees&reglage=parents'
test('parent : retrait en attente honnête puis repris au retour réseau sans republier',async({page})=>{
 await preparer(page,etatEleve({parentShare:true}));let online=false,deletes=0,posts=0
 await page.route('https://*.supabase.co/rest/**',r=>{
  if(new URL(r.request().url()).pathname.endsWith('/child_stats')){
   if(r.request().method()==='DELETE'){deletes++;return online?r.fulfill({json:[]}):r.abort('internetdisconnected')}
   if(r.request().method()==='POST')posts++
  }
  return r.fulfill({json:[]})
 })
 await page.goto(routeParents);await attendreAccueil(page)
 const share=page.getByRole('switch',{name:/Partager ma progression/})
 await share.click();await expect(share).toHaveAttribute('aria-checked','false')
 await expect(page.getByRole('status').filter({hasText:'Le retrait en ligne n’est pas encore confirmé'})).toBeVisible()
 await expect(page.locator('main')).not.toContainText('rien n’est partagé')
 await expect.poll(()=>deletes).toBe(1)
 await page.reload();await attendreAccueil(page);await expect(share).toHaveAttribute('aria-checked','false');await expect.poll(()=>deletes).toBe(2)
 const published=posts;online=true;await page.evaluate(()=>window.dispatchEvent(new Event('online')))
 await expect.poll(()=>deletes).toBe(3);await expect(page.locator('main')).toContainText('rien n’est partagé')
 expect(posts).toBe(published);await expect(share).toHaveAttribute('aria-checked','false')
})
test('suppression compte : RPC silencieux, délai, message et bouton utilisable',async({page})=>{
 await preparer(page);await page.route('https://*.supabase.co/rest/**',r=>r.fulfill({json:[]}))
 await page.addInitScript(()=>{const original=fetch;window.fetch=(url,opts)=>{
  if(String(url).includes('/rpc/revizstmg_supprimer_compte')){window.__deleteStarted=true;return new Promise(()=>{})}
  return original(url,opts)
 }})
 await page.goto('./#/parametres?rubrique=donnees&reglage=suppression');await attendreAccueil(page);await page.clock.install()
 const dialogs=[];page.on('dialog',async d=>{dialogs.push(d.message());await d.accept()})
 await page.getByRole('button',{name:/Supprimer mon compte$/}).click();await page.clock.runFor(3100)
 await expect.poll(()=>page.evaluate(()=>!!window.__deleteStarted)).toBe(true)
 await page.clock.runFor(16000)
 await expect(page.getByRole('button',{name:/Supprimer mon compte$/})).toBeEnabled()
 expect(dialogs.some(s=>s.includes('La suppression n’est pas confirmée'))).toBe(true)
 expect(await page.evaluate(()=>!!localStorage.getItem('stmg_session'))).toBe(true)
})
test('parent : réponse tardive du retrait A ne confirme ni ne désactive le partage B',async({page})=>{
 const B='00000000-0000-4000-8000-000000000002';await preparer(page,etatEleve({parentShare:true}))
 let release,started=false
 await page.route('https://*.supabase.co/rest/**',async r=>{
  const u=new URL(r.request().url())
  if(u.pathname.endsWith('/child_stats')&&r.request().method()==='DELETE'&&u.searchParams.get('device_id')==='eq.00000000-0000-4000-8000-000000000001'){
   started=true;await new Promise(resolve=>{release=resolve});return r.fulfill({json:[]}).catch(()=>{})
  }
  if(u.pathname.endsWith('/profiles')&&r.request().method()==='GET'&&u.searchParams.get('id')===`eq.${B}`)
   return r.fulfill({json:[{id:B,name:'Bob Audit',role:'eleve',level:'terminale-stmg',specialty:'gestion-finance',progress:{}}]})
  return r.fulfill({json:[]})
 })
 await page.goto(routeParents);await attendreAccueil(page)
 const share=page.getByRole('switch',{name:/Partager ma progression/});await share.click();await expect.poll(()=>started).toBe(true)
 await page.evaluate(B=>{const old=localStorage.getItem('stmg_session');const next=JSON.stringify({token:'token-B',refresh:'r',expires_at:9999999999,user:{id:B,email:'b@test.fr'}});localStorage.setItem('stmg_session',next);window.dispatchEvent(new StorageEvent('storage',{key:'stmg_session',oldValue:old,newValue:next}))},B)
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('stmg_progress_v2')).account?.id)).toBe(B)
 await page.goto(routeParents);await attendreAccueil(page)
 await expect(share).toHaveAttribute('aria-checked','false');await share.click()
 await expect(share).toHaveAttribute('aria-checked','true');release();await page.waitForTimeout(100)
 await expect(share).toHaveAttribute('aria-checked','true');await expect(page.locator('main')).not.toContainText('rien n’est partagé')
})

test('les propositions restent stables après une mise à jour de la page',async({page})=>{
 await preparer(page,etatEleve({classCode:'stmg-abc23'}));await page.addInitScript(()=>Math.random=()=>0)
 const quiz={id:'00000000-0000-4000-8000-000000000004',title:'Stabilité audit',status:'published',class_code:'stmg-abc23',questions:[{q:'Question synthétique ?',choices:['Oui correct','Non'],answer:0}]}
 await page.route('https://*.supabase.co/rest/**',r=>r.fulfill({json:new URL(r.request().url()).pathname.endsWith('/class_quiz')?[quiz]:[]}))
 await page.goto('./#/classe');await attendreAccueil(page);await page.locator('.class-menu-trigger').click();await page.getByRole('dialog').getByRole('button',{name:/Quiz et travail/}).click();await page.getByRole('button',{name:/Duels/}).click();await page.getByRole('button',{name:/Lancer un duel/}).click();await page.getByRole('button',{name:/Stabilité audit/}).click()
 const choices=page.getByRole('button',{name:/^[A-D] (Oui correct|Non)/});await expect(choices).toHaveCount(2)
 await page.getByRole('button',{name:/Oui correct/}).click();const before=await choices.allTextContents()
 await page.evaluate(()=>{Math.random=()=>0.999;window.dispatchEvent(new CustomEvent('stmg-focus-done',{detail:{minutes:1}}))})
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('stmg_progress_v2')).xp)).toBeGreaterThan(0)
 expect(await choices.allTextContents()).toEqual(before)
})
