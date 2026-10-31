import {test,expect} from '@playwright/test'
import {preparer,etatEleve,attendreAccueil} from './eleve.js'
test('demande ami retardée après changement de compte',async({page},info)=>{
 const B='00000000-0000-4000-8000-000000000002';
 await preparer(page,etatEleve());let writes=[];
 await page.addInitScript(()=>{const original=window.fetch;window.fetch=(url,opts)=>{if(String(url).includes('/rpc/revizstmg_trouver_ami'))return Promise.resolve(new Response(new ReadableStream({start(controller){window.__releaseTarget=()=>{controller.enqueue(new TextEncoder().encode(JSON.stringify([{device_id:'00000000-0000-4000-8000-000000000003',name:'C Audit'}])));controller.close()}}}),{headers:{'Content-Type':'application/json'}}));return original(url,opts)}});
 await page.route('https://*.supabase.co/**',async r=>{let u=new URL(r.request().url()),p=u.pathname;const json=x=>r.fulfill({contentType:'application/json',body:JSON.stringify(x)});
 if(p.endsWith('revizstmg-paiement'))return json({abonnement:{statut:'active',offre:'premium',periode_fin:'2999-01-01'}});
 if(p.endsWith('/profiles'))return json([{id:B,name:'Bob Audit',role:'eleve',level:'terminale-stmg',progress:{}}]);
  if(p.endsWith('/friend_request')&&r.request().method()==='POST')writes.push({body:r.request().postDataJSON(),authorization:r.request().headers().authorization});
 return json([]);});
 await page.goto('./#/amis');await attendreAccueil(page);
 await page.getByRole('textbox',{name:'Ajouter un ami',exact:true}).fill('ABCDEF');await page.getByRole('button',{name:'Envoyer',exact:true}).click();await expect.poll(()=>page.evaluate(()=>!!window.__releaseTarget)).toBe(true);await page.waitForTimeout(100);
 await page.evaluate(B=>{const old=localStorage.getItem('stmg_session');localStorage.setItem('stmg_session',JSON.stringify({token:'token-B',refresh:'r',expires_at:9999999999,user:{id:B,email:'b@test.fr'}}));window.dispatchEvent(new StorageEvent('storage',{key:'stmg_session',oldValue:old,newValue:localStorage.getItem('stmg_session')}));},B);
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('stmg_progress_v2')).account?.id)).toBe(B);
 await page.evaluate(()=>window.__releaseTarget());
 await page.waitForTimeout(500);
 expect(writes).toEqual([]);
});
test('retrait consentement pendant publication parent',async({page},info)=>{
 await preparer(page);let pending,exists=false;const calls=[];
 await page.route('https://*.supabase.co/**',async r=>{const u=new URL(r.request().url()),m=r.request().method();const json=x=>r.fulfill({contentType:'application/json',body:JSON.stringify(x)});
 if(u.pathname.endsWith('/revizstmg-paiement'))return json({abonnement:{statut:'active',offre:'premium',periode_fin:'2999-01-01'}});
 if(u.pathname.endsWith('/child_stats')){calls.push(m);if(m==='POST'){pending=r;return;}if(m==='DELETE')exists=false;}
 return json([]);});
 await page.goto('./#/moi?section=reglages');await attendreAccueil(page);
 const share=page.getByRole('switch',{name:/Partager ma progression/});await share.click();await expect.poll(()=>!!pending,{timeout:8000}).toBe(true);
 const before=calls.filter(c=>c==='DELETE').length;await share.click();await expect(share).toHaveAttribute('aria-checked','false');expect(calls.filter(c=>c==='DELETE').length).toBe(before);
 exists=true;await pending.fulfill({contentType:'application/json',body:'[]'});await page.waitForTimeout(4000);
await info.attach('ordre-requetes',{body:JSON.stringify({calls,exists,consent:await share.getAttribute('aria-checked')}),contentType:'application/json'});
 expect(exists).toBe(false);expect(calls.at(-1)).toBe('DELETE');
});

test('examen : délai de disponibilité puis reprise sans perdre la demande', async({page}) => {
 const errors=await preparer(page);await page.clock.install();let checks=0
 await page.route('**/functions/v1/examen-blanc',route=>{if(route.request().method()==='GET'){checks++;if(checks===1)return;return route.fulfill({json:{ready:true}})}return route.fulfill({json:{}})})
 await page.goto('./#/bac-blanc');await attendreAccueil(page)
 const prompt=page.getByLabel('Quel examen veux-tu passer ?');await prompt.fill('Réviser les notions de management de terminale.')
 await expect.poll(()=>checks).toBe(1);await page.clock.runFor(11000)
 const form=page.getByRole('region',{name:'Crée ton examen blanc'})
 await form.getByRole('button',{name:/Réessayer/}).click()
 await expect(form.getByRole('button',{name:'Analyser ma demande'})).toBeEnabled()
 await expect(prompt).toHaveValue('Réviser les notions de management de terminale.');expect(errors).toEqual([])
})
test('compte gratuit : amis boutique et classe sans écran abonnement', async({page}) => {
 const errors=await preparer(page,etatEleve(),{abonnement:null})
 await page.route('https://*.supabase.co/rest/**',r=>r.fulfill({json:[]}))
 for(const route of ['amis','boutique','classe']){
  await page.goto('./#/'+route);await attendreAccueil(page)
  await expect(page.locator('main')).not.toContainText('Cette page est réservée')
  await expect(page.locator('main')).not.toContainText('Choisir mon abonnement')
  await expect(page.locator('main')).toContainText(new RegExp(route==='amis'?'amis':route==='boutique'?'boutique':'classe','i'))
 }
 expect(errors).toEqual([])
})
