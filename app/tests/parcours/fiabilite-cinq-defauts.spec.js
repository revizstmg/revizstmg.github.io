import {test,expect} from '@playwright/test'
import {preparer,etatEleve,etat,attendreAccueil} from './eleve.js'
test.use({serviceWorkers:'block'})
const ID='00000000-0000-4000-8000-000000000001'
async function dismiss(page){await attendreAccueil(page);const ok=page.getByRole('button',{name:'OK',exact:true});if(await ok.count())await ok.click()}
for(const phase of ['headers','body'])test(`connexion : profil ${phase} silencieux, formulaire récupérable et reprise`,async({page})=>{
 const errors=await preparer(page,null);let gets=0
 await page.route('**/auth/v1/token?*',r=>r.fulfill({json:{access_token:'fake',refresh_token:'fake-r',expires_in:3600,user:{id:ID,email:'lea@test.fr'}}}))
 await page.route('**/rest/v1/profiles?*',r=>{gets++;if(phase==='headers'&&gets===1)return;return r.fulfill({json:[{id:ID,name:'Léa Test',role:'eleve',level:'terminale-stmg',specialty:'gestion-finance',progress:{}}]})})
 if(phase==='body')await page.addInitScript(()=>{const original=window.fetch;let first=true;window.fetch=(url,opts)=>{if(first&&String(url).includes('/rest/v1/profiles')&&(!opts?.method||opts.method==='GET')){first=false;window.__blockedProfile=true;return Promise.resolve({ok:true,json:()=>new Promise(()=>{})})}return original(url,opts)}})
 await page.goto('./');await page.locator('#w-email').fill('lea@test.fr');await page.locator('#w-pass').fill('Exemple12345');await page.clock.install();await page.getByRole('button',{name:'Se connecter',exact:true}).click()
 if(phase==='headers')await expect.poll(()=>gets).toBe(1);else await expect.poll(()=>page.evaluate(()=>!!window.__blockedProfile)).toBe(true)
 await page.clock.runFor(16000);await expect(page.getByRole('alert')).toContainText('Le serveur ne répond pas');await expect(page.locator('#w-email')).toHaveValue('lea@test.fr');await expect(page.getByRole('button',{name:'Se connecter',exact:true})).toBeEnabled()
 await page.getByRole('button',{name:'Se connecter',exact:true}).click();await expect.poll(async()=>(await etat(page)).account?.id).toBe(ID);expect(errors).toEqual([])
})
test('sauvegarde : corps bloqué, état échec, dernière modification renvoyée sans perte locale',async({page})=>{
 const errors=await preparer(page,etatEleve());await page.route('**/rest/v1/**',r=>r.fulfill({json:[]}))
 await page.addInitScript(()=>{const original=window.fetch;window.__writes=[];window.fetch=(url,opts)=>{if(String(url).includes('/rest/v1/profiles')&&opts?.method==='PATCH'){window.__writes.push(JSON.parse(opts.body));if(window.__writes.length===1){window.__blockedSignal=opts.signal;return Promise.resolve({ok:true,json:()=>new Promise(()=>{})})}return Promise.resolve(new Response(JSON.stringify([{id:'00000000-0000-4000-8000-000000000001'}])))}return original(url,opts)}})
 await page.goto('./#/parametres?rubrique=revision&reglage=examen');await dismiss(page);await page.clock.install();await page.getByLabel('Date de mon bac',{exact:true}).fill('2027-06-15');await page.clock.runFor(2200);await expect.poll(()=>page.evaluate(()=>window.__writes.length)).toBe(1)
 await page.getByLabel('Date de mon bac',{exact:true}).fill('2027-06-16');await page.clock.runFor(16000)
 const status=page.getByRole('status').filter({hasText:'Non sauvegardé'});await expect(status).toBeVisible();expect(await page.evaluate(()=>window.__blockedSignal.aborted)).toBe(true);expect((await etat(page)).bacDate).toBe('2027-06-16')
 await status.getByRole('button',{name:'Réessayer',exact:true}).click();await expect.poll(()=>page.evaluate(()=>window.__writes.length)).toBe(2);await expect(page.locator('[data-sauvegarde]')).toHaveCount(0)
 expect(await page.evaluate(()=>window.__writes.at(-1).progress.bacDate)).toBe('2027-06-16');expect(errors).toEqual([])
})
test('duel : ancien score global jamais repris par le second compte du même duel',async({page})=>{
 const errors=await preparer(page,etatEleve());const sent=[]
 const duel={id:'partage',a_device:'compte-A',b_device:ID,a_name:'Alice',b_name:'Léa',status:'live',a_done:false,b_done:false,chapter_label:'Management',questions:[{q:'Une organisation poursuit…',choices:['un objectif','aucun objectif'],answer:0}]}
 await page.addInitScript(()=>localStorage.setItem('stmg_duel_scores_attente',JSON.stringify({partage:{points:777,correct:9}})))
 await page.route('**/rest/v1/**',r=>{const u=new URL(r.request().url());if(r.request().method()==='PATCH'&&u.pathname.endsWith('/friend_duel'))sent.push(r.request().postDataJSON());return r.fulfill({json:u.pathname.endsWith('/friend_duel')&&(u.searchParams.get('status')==='eq.live'||u.searchParams.has('id'))?[duel]:[]})})
 await page.goto('./#/amis');await dismiss(page);await page.getByRole('button',{name:/Duels/}).click();await page.getByRole('button',{name:/Alice.*Jouer/}).click()
 await expect(page.getByRole('button',{name:'un objectif',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Réessayer l’envoi',exact:true})).toHaveCount(0);expect(sent).toEqual([])
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('stmg_duel_scores_attente')).partage.points)).toBe(777);expect(errors).toEqual([])
})
test('atelier : programme et niveau retrouvés ; sélection masquée rendue visible à la demande',async({page})=>{
 const errors=await preparer(page,etatEleve({track:{level:'premiere-stmg'}}));await page.goto('./#/atelier-formules');await dismiss(page)
 await page.getByRole('combobox',{name:'Programme affiché',exact:true}).selectOption('all');await page.getByRole('combobox',{name:'Niveau',exact:true}).selectOption('terminale');await page.getByRole('checkbox',{name:/^Espérance \(loi binomiale\)/}).check()
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('stmg_formula_session_v1:00000000-0000-4000-8000-000000000001:premiere-stmg:')).level)).toBe('terminale')
 await page.reload();await expect(page.getByRole('combobox',{name:'Programme affiché',exact:true})).toHaveValue('all');await expect(page.getByRole('combobox',{name:'Niveau',exact:true})).toHaveValue('terminale');await expect(page.getByRole('checkbox',{name:/^Espérance \(loi binomiale\)/})).toBeChecked();await expect(page.getByRole('button',{name:'Générer mes exercices',exact:true})).toBeEnabled()
 await page.getByRole('combobox',{name:'Programme affiché',exact:true}).selectOption('track');await expect(page.getByRole('status').filter({hasText:'Formules masquées'})).toBeVisible();await page.getByRole('button',{name:'Afficher toute ma sélection',exact:true}).click();await expect(page.getByRole('checkbox',{name:/^Espérance \(loi binomiale\)/})).toBeChecked();expect(errors).toEqual([])
})
test('atelier : ancienne sélection de Terminale sur un compte Première restaurée sans abandon',async({page})=>{
 await preparer(page,etatEleve({track:{level:'premiere-stmg'}}));await page.addInitScript(()=>localStorage.setItem('stmg_formula_session_v1:00000000-0000-4000-8000-000000000001:premiere-stmg:',JSON.stringify({version:1,selected:['f14'],repeat:2,session:null})))
 await page.goto('./#/atelier-formules');await dismiss(page);await expect(page.getByRole('combobox',{name:'Programme affiché',exact:true})).toHaveValue('all');await expect(page.getByRole('checkbox',{name:/^Espérance \(loi binomiale\)/})).toBeChecked();await expect(page.getByRole('button',{name:'Générer mes exercices',exact:true})).toBeEnabled()
})
for(const mode of ['sync','async'])test(`audio : panne ${mode}, arrêt expliqué et reprise`,async({page})=>{
 await page.setViewportSize({width:320,height:568});const errors=await preparer(page,etatEleve({savedDecks:[{id:'fiable',title:'Audio fiabilité',language:'fr',cards:[{front:'Une notion',back:'Une définition'}]}]}))
 await page.addInitScript(mode=>{window.__speechCalls=0;window.__speechText=[];window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{cancel(){window.__lastUtterance?.onerror?.({error:'canceled'})},speak(u){window.__speechCalls++;window.__speechText.push(u.text);window.__lastUtterance=u;if(window.__speechCalls===1){if(mode==='sync')throw Error('Panne simulée');setTimeout(()=>u.onerror({error:'synthesis-failed'}),0)}}}})},mode)
 await page.goto('./#/revision');await dismiss(page);await page.getByRole('button',{name:'Révision audio',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Audio fiabilité',exact:true});await dialog.getByRole('button',{name:'Jouer',exact:true}).click();await expect(dialog.getByRole('alert')).toContainText('La lecture audio a échoué');await expect(dialog.getByRole('button',{name:'Pause',exact:true})).toHaveCount(0)
 await dialog.getByRole('button',{name:'Jouer',exact:true}).click();await expect(dialog.getByRole('alert')).toHaveCount(0);await page.evaluate(()=>window.__lastUtterance.onend());await expect(dialog).toContainText('Une définition');expect(await page.evaluate(()=>window.__speechText)).toEqual(['Une notion','Une notion','Une définition'])
 await dialog.getByRole('button',{name:'Quitter',exact:true}).click();await expect(dialog).toHaveCount(0);expect(errors).toEqual([])
})
