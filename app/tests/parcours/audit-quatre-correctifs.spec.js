import {test,expect} from '@playwright/test'
import {preparer,etatEleve,attendreAccueil} from './eleve.js'
test('parent : retrait quand le corps de publication reste suspendu',async({page},info)=>{
 await preparer(page);const calls=[];
 await page.addInitScript(()=>{const original=window.fetch;window.fetch=(url,opts)=>{if(String(url).includes('/child_stats')&&opts?.method==='POST'){window.__postStarted=true;return Promise.resolve(new Response(new ReadableStream({start(c){window.__releaseParent=()=>{c.enqueue(new TextEncoder().encode('[]'));c.close()}}}),{headers:{'Content-Type':'application/json'}}))}return original(url,opts)}})
 await page.route('https://*.supabase.co/rest/**',r=>{calls.push({method:r.request().method(),url:r.request().url()});return r.fulfill({json:[]})})
 await page.goto('./#/moi?section=reglages');await attendreAccueil(page);await page.clock.install()
 const share=page.getByRole('switch',{name:/Partager ma progression/});await share.click();await expect.poll(()=>page.evaluate(()=>!!window.__postStarted)).toBe(true)
 const initialDeletes=calls.filter(x=>x.method==='DELETE'&&x.url.includes('child_stats')).length;await share.click();await expect(share).toHaveAttribute('aria-checked','false');await page.clock.runFor(16000)
 await expect.poll(()=>calls.filter(x=>x.method==='DELETE'&&x.url.includes('child_stats')).length).toBeGreaterThan(initialDeletes)
 const deletesBeforeRelease=calls.filter(x=>x.method==='DELETE'&&x.url.includes('child_stats')).length-initialDeletes
 await page.evaluate(()=>window.__releaseParent());await page.clock.runFor(5000);await expect.poll(()=>calls.filter(x=>x.method==='DELETE'&&x.url.includes('child_stats')).length).toBeGreaterThan(initialDeletes)
 await info.attach('preuve',{body:JSON.stringify({deletesBeforeRelease,calls,consent:await share.getAttribute('aria-checked')}),contentType:'application/json'})
 expect(deletesBeforeRelease,'Le retrait doit pouvoir progresser sans attendre indéfiniment le corps JSON du POST').toBeGreaterThan(0)
})
test('profil : corps de sauvegarde A tardif après passage à B',async({page},info)=>{
 const B='00000000-0000-4000-8000-000000000002';await preparer(page)
 await page.addInitScript(()=>{const original=fetch;window.fetch=(url,opts)=>{if(String(url).includes('/profiles?on_conflict=id')&&opts?.method==='POST')return Promise.resolve(new Response(new ReadableStream({start(c){window.__releaseProfile=()=>{c.enqueue(new TextEncoder().encode('[]'));c.close()}}}),{headers:{'Content-Type':'application/json'}}));return original(url,opts)}})
 await page.route('https://*.supabase.co/rest/**',r=>r.fulfill({json:r.request().method()==='GET'&&new URL(r.request().url()).pathname.endsWith('/profiles')?[{id:B,name:'Bob Audit',role:'eleve',level:'terminale-stmg',progress:{}}]:[]}))
 await page.goto('./#/parametres?rubrique=compte&reglage=profil');await attendreAccueil(page);await page.getByLabel('Prénom',{exact:true}).fill('Ancien A');await page.getByRole('button',{name:'Enregistrer mon profil',exact:true}).click();await expect.poll(()=>page.evaluate(()=>!!window.__releaseProfile)).toBe(true)
 await page.evaluate(B=>{const old=localStorage.getItem('stmg_session');localStorage.setItem('stmg_session',JSON.stringify({token:'token-B',refresh:'r',expires_at:9999999999,user:{id:B,email:'b@test.fr'}}));window.dispatchEvent(new StorageEvent('storage',{key:'stmg_session',oldValue:old,newValue:localStorage.getItem('stmg_session')}))},B)
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('stmg_progress_v2')).account?.id)).toBe(B);await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('stmg_progress_v2')).profile.firstName)).toBe('Bob')
 await page.evaluate(()=>window.__releaseProfile());await page.waitForTimeout(500)
 const result=await page.evaluate(()=>JSON.parse(localStorage.getItem('stmg_progress_v2')));await info.attach('identite',{body:JSON.stringify({account:result.account,profile:result.profile}),contentType:'application/json'});expect(result.profile.firstName).toBe('Bob')
})

test('photos : limite explicite, aucun envoi partiel et quatre pages analysées',async({page})=>{
 await preparer(page,undefined,{abonnement:'ultimate'});let count=0,calls=0
 await page.route('**/functions/v1/fiche-vision',r=>{calls++;count=r.request().postDataJSON().images.length;return r.fulfill({json:{fiche:{title:'Fiche synthétique',questions:['Question synthétique'],keyInfo:[],definitions:[]}}})})
 await page.goto('./#/fiches-photo');await attendreAccueil(page)
 const buffer=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j6QAAAABJRU5ErkJggg==','base64')
 const files=n=>Array.from({length:n},(_,i)=>({name:`page-${i}.png`,mimeType:'image/png',buffer}))
 await page.locator('input[type=file]').setInputFiles(files(5))
 await expect(page.getByRole('alert')).toContainText('jusqu’à 4 pages')
 await expect(page.locator('img[alt^="Page "]')).toHaveCount(0);expect(calls).toBe(0)
 await page.locator('input[type=file]').setInputFiles(files(4))
 await expect(page.locator('img[alt^="Page "]')).toHaveCount(4)
 await page.locator('input[type=file]').setInputFiles(files(1))
 await expect(page.getByRole('alert')).toContainText('jusqu’à 4 pages')
 await expect(page.locator('img[alt^="Page "]')).toHaveCount(4)
 await page.getByRole('button',{name:'Analyser la photo',exact:true}).click()
 await expect.poll(()=>count).toBe(4);expect(calls).toBe(1)
})
test('cours : matière et thème doivent correspondre, sans changer la reprise',async({page})=>{
 await preparer(page)
 await page.goto('./#/subject/maths/theme/math-c3/chapter/0');await attendreAccueil(page)
 await expect(page.getByRole('heading',{name:/Nombre dérivé et tangente/})).toBeVisible()
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('stmg_progress_v2')).lastChapter?.chapterId)).toBe('math-c3')
 const last=await page.evaluate(()=>JSON.parse(localStorage.getItem('stmg_progress_v2')).lastChapter)
 for(const route of ['subject/gestion-finance/theme/math-c3/chapter/0','subject/gestion-finance/theme/math-c3']){
  await page.goto('./#/'+route);await attendreAccueil(page)
  await expect(page.getByRole('heading',{name:'Page introuvable',exact:true})).toBeVisible()
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('stmg_progress_v2')).lastChapter)).toEqual(last)
 }
 await page.goto('./#/subject/maths/theme/math-c3/chapter/0');await attendreAccueil(page)
 await expect(page.getByRole('heading',{name:/Nombre dérivé et tangente/})).toBeVisible()
})
