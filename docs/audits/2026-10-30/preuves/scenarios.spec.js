import {writeFileSync} from 'node:fs'
import {test,expect} from '@playwright/test'
import {preparer,etatEleve,attendreAccueil} from './eleve.js'
test('demande ami retardée après changement de compte',async({page},info)=>{
 const A='00000000-0000-4000-8000-000000000001',B='00000000-0000-4000-8000-000000000002',C='00000000-0000-4000-8000-000000000003';
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
 await expect.poll(()=>writes.length).toBe(1);writeFileSync('/workspace/work/identites-preuves/ami-retarde.json',JSON.stringify(writes,null,2));await info.attach('ecriture-synthetique',{body:JSON.stringify(writes),contentType:'application/json'});
 expect(writes[0].body[0].from_device).toBe(B);expect(writes[0].body[0].from_name).toBe('Léa Test');
});
test('smoke transversal routes principales',async({page},info)=>{
 const errors=await preparer(page);const results=[];
 for(const path of ['/accueil','/cours','/revision','/seance','/programme','/parcours','/vacances','/atelier-formules','/coach','/mes-notes','/badges','/boutique','/classe','/amis','/classement','/parent','/parametres','/moi','/bac-blanc','/grand-oral','/etude-de-gestion','/coach-ia','/fiches-photo','/methodo','/faq','/guide','/confidentialite','/cgu','/offres']){
 await page.goto('./#'+path);await attendreAccueil(page);await expect.poll(async()=>((await page.locator('main').innerText())+(await page.getByRole('dialog').allInnerTexts()).join('')).trim().length,{message:path}).toBeGreaterThan(0);results.push({path,text:((await page.locator('main').innerText())+(await page.getByRole('dialog').allInnerTexts()).join('')).slice(0,160)});
 }
 writeFileSync('/workspace/work/identites-preuves/smoke-routes.json',JSON.stringify(results,null,2));await info.attach('routes',{body:JSON.stringify(results),contentType:'application/json'});expect(errors).toEqual([]);
});
test('retrait consentement pendant publication parent',async({page},info)=>{
 await preparer(page);let pending,exists=false;const calls=[];
 await page.route('https://*.supabase.co/**',async r=>{const u=new URL(r.request().url()),m=r.request().method();const json=x=>r.fulfill({contentType:'application/json',body:JSON.stringify(x)});
 if(u.pathname.endsWith('/revizstmg-paiement'))return json({abonnement:{statut:'active',offre:'premium',periode_fin:'2999-01-01'}});
 if(u.pathname.endsWith('/child_stats')){calls.push(m);if(m==='POST'){pending=r;return;}if(m==='DELETE')exists=false;}
 return json([]);});
 await page.goto('./#/moi?section=reglages');await attendreAccueil(page);
 const share=page.getByRole('switch',{name:/Partager ma progression/});await share.click();await expect.poll(()=>!!pending,{timeout:8000}).toBe(true);
 const before=calls.filter(c=>c==='DELETE').length;await share.click();await expect(share).toHaveAttribute('aria-checked','false');await expect.poll(()=>calls.filter(c=>c==='DELETE').length).toBeGreaterThan(before);
 exists=true;await pending.fulfill({contentType:'application/json',body:'[]'});await page.waitForTimeout(4000);
 writeFileSync('/workspace/work/identites-preuves/parent-consentement.json',JSON.stringify({calls,exists,consent:await share.getAttribute('aria-checked')},null,2));await info.attach('ordre-requetes',{body:JSON.stringify({calls,exists,consent:await share.getAttribute('aria-checked')}),contentType:'application/json'});
 expect(exists).toBe(true);expect(calls.at(-1)).toBe('DELETE');
});
