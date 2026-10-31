import {test,expect} from '@playwright/test'
import {preparer,etatEleve,attendreAccueil} from './eleve.js'
test('parent : retrait quand le corps de publication reste suspendu',async({page},info)=>{
 await preparer(page);const calls=[];
 await page.addInitScript(()=>{const original=window.fetch;window.fetch=(url,opts)=>{if(String(url).includes('/child_stats')&&opts?.method==='POST'){window.__postStarted=true;return Promise.resolve(new Response(new ReadableStream({start(c){window.__releaseParent=()=>{c.enqueue(new TextEncoder().encode('[]'));c.close()}}}),{headers:{'Content-Type':'application/json'}}))}return original(url,opts)}})
 await page.route('https://*.supabase.co/rest/**',r=>{calls.push({method:r.request().method(),url:r.request().url()});return r.fulfill({json:[]})})
 await page.goto('./#/moi?section=reglages');await attendreAccueil(page);await page.clock.install()
 const share=page.getByRole('switch',{name:/Partager ma progression/});await share.click();await expect.poll(()=>page.evaluate(()=>!!window.__postStarted)).toBe(true)
 const initialDeletes=calls.filter(x=>x.method==='DELETE'&&x.url.includes('child_stats')).length;await share.click();await expect(share).toHaveAttribute('aria-checked','false');await page.clock.runFor(60000)
 const deletesBeforeRelease=calls.filter(x=>x.method==='DELETE'&&x.url.includes('child_stats')).length-initialDeletes
 await page.evaluate(()=>window.__releaseParent());await page.clock.runFor(5000);await expect.poll(()=>calls.filter(x=>x.method==='DELETE'&&x.url.includes('child_stats')).length).toBeGreaterThan(initialDeletes)
 await info.attach('preuve',{body:JSON.stringify({deletesBeforeRelease,calls,consent:await share.getAttribute('aria-checked')}),contentType:'application/json'})
 expect(deletesBeforeRelease,'Le retrait doit pouvoir progresser sans attendre indéfiniment le corps JSON du POST').toBeGreaterThan(0)
})
for(const [lang,width] of [['fr',1280],['de',390],['ar',320]])test('routes publiques et reprise visiteur '+lang,async({page})=>{
 const errors=await preparer(page,etatEleve({account:null,lang}),{abonnement:null});await page.setViewportSize({width,height:850})
 for(const route of ['guide','faq','cgu','confidentialite','offres','cours','revision','bac-blanc','parent','classement']){
  await page.goto('./#/'+route);await attendreAccueil(page);await expect(page.locator('main')).toBeVisible();await expect(page.locator('main')).not.toBeEmpty();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route).toBe(true)
 }
 expect(errors).toEqual([])
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
test('Google : sélecteur et retour vers le site, aucun appel fournisseur',async({page},info)=>{
 await preparer(page,null);let authorize
 await page.route('**/auth/v1/settings',r=>r.fulfill({json:{external:{google:true}}}))
 await page.route('**/auth/v1/authorize?**',r=>{authorize=new URL(r.request().url());return r.abort('blockedbyclient')})
 await page.goto('./');await page.getByRole('button',{name:/Google/}).click();await expect.poll(()=>!!authorize).toBe(true)
 expect(authorize.searchParams.get('provider')).toBe('google');expect(authorize.searchParams.get('prompt')).toBe('select_account');expect(authorize.searchParams.get('redirect_to')).toContain('127.0.0.1:4192')
 await info.attach('url-synthetique',{body:authorize.toString(),contentType:'text/plain'})
})
