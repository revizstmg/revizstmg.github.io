import {test,expect} from '@playwright/test'
import {preparer,etatEleve,attendreAccueil,etat} from './eleve.js'
test('la boutique conduit un compte gratuit vers les cours gratuits',async({page})=>{
 await preparer(page,etatEleve(),{abonnement:null});await page.goto('./#/boutique');await attendreAccueil(page)
 await page.getByRole('link',{name:'Gagner des XP →',exact:true}).click();await expect(page).toHaveURL(/#\/cours$/)
 await expect(page.getByRole('heading',{name:/Réservé/})).toHaveCount(0)
})
for(const offre of ['premium','ultimate'])test('parcours et programmes : accès '+offre,async({page})=>{
 const previous={maj:1,objectifs:{noteVisee:12,heuresSemaine:5,difficiles:[]}}
 await preparer(page,etatEleve({parcours:previous}),{abonnement:offre})
 for(const path of ['parcours','vacances']){
  await page.goto('./#/'+path);await attendreAccueil(page)
  if(offre==='premium')await expect(page.getByRole('heading',{name:'Réservé à Ultimate',exact:true})).toBeVisible()
  else {await expect(page.getByRole('heading',{name:'Réservé à Ultimate',exact:true})).toHaveCount(0);await expect(page.locator('main h1')).toBeVisible()}
 }
 expect((await etat(page)).parcours.objectifs).toEqual(previous.objectifs)
})
test('connexion silencieuse : message borné et reprise sans perdre les champs',async({page})=>{
 await preparer(page,null,{abonnement:null});await page.goto('./#/');await page.locator('#w-email').fill('sonde@test.fr');await page.locator('#w-pass').fill('Password123')
 let count=0;await page.route('**/auth/v1/token?grant_type=password',async route=>{count++;if(count===1)return new Promise(()=>{});return route.fulfill({status:400,json:{msg:'Invalid login credentials'}})})
 await page.clock.install();await page.getByRole('button',{name:'Se connecter',exact:true}).click();await expect.poll(()=>count).toBe(1)
 await page.clock.runFor(16000);await expect(page.getByRole('alert')).toContainText('Le serveur ne répond pas')
 await expect(page.getByRole('button',{name:'Se connecter',exact:true})).toBeEnabled();await expect(page.locator('#w-email')).toHaveValue('sonde@test.fr')
 await page.getByRole('button',{name:'Se connecter',exact:true}).click();await expect(page.getByRole('alert')).toContainText('E-mail ou mot de passe incorrect.')
})
test('audio : texte français lu en français avec interface allemande, choix conservé',async({page})=>{
 await preparer(page,etatEleve({lang:'de',savedDecks:[{id:'fr',title:'Droit',cards:[{front:'Un contrat',back:'Un accord de volontés.'}]}]}))
 await page.addInitScript(()=>{window.__spoken=[];window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{cancel(){},speak(u){window.__spoken.push({text:u.text,lang:u.lang})}}})})
 await page.goto('./#/revision');await attendreAccueil(page);await page.getByRole('button',{name:'Mit Audio lernen',exact:true}).click();await page.getByRole('button',{name:'Spielen',exact:true}).click()
 expect(await page.evaluate(()=>window.__spoken[0])).toEqual({text:'Un contrat',lang:'fr-FR'})
 await page.getByLabel('Vorlesesprache').selectOption('en');await page.getByRole('button',{name:'Spielen',exact:true}).click()
 expect(await page.evaluate(()=>window.__spoken.at(-1).lang)).toBe('en-US');expect((await etat(page)).savedDecks[0].language).toBe('en')
})
