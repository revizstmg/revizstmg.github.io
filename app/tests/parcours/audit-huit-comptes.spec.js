import {test,expect} from '@playwright/test'
import {preparer,etatEleve,attendreAccueil,etat} from './eleve.js'
test('OAuth refus : description contenant un pourcentage littéral',async({page},info)=>{
 const erreurs=await preparer(page,null)
 await page.route('https://*.supabase.co/**',r=>r.fulfill({json:{external:{google:true}}}))
 await page.goto('./#error=access_denied&error_description=Refus%20%C3%A0%20100%25')
 await page.waitForTimeout(1500)
 await info.attach('resultat',{body:JSON.stringify({erreurs,url:page.url(),texte:(await page.locator('body').innerText()).slice(0,1200)}),contentType:'application/json'})
 await page.screenshot({path:info.outputPath('oauth-pourcentage.png')})
 expect(erreurs).toEqual([])
 await expect(page.getByRole('dialog')).toBeVisible()
})
test('profil échec serveur : données locales conservées et réessai',async({page})=>{
 const erreurs=await preparer(page,etatEleve());let failing=true
 await page.route('https://*.supabase.co/rest/**',r=>r.request().method()==='POST'?r.fulfill({status:failing?500:200,json:failing?{message:'indisponible'}:r.request().postDataJSON()}):r.fulfill({json:[]}))
 await page.goto('./#/parametres?rubrique=compte&reglage=profil');await attendreAccueil(page)
 await page.getByLabel('Prénom',{exact:true}).fill('Élise');await page.getByRole('button',{name:'Enregistrer mon profil',exact:true}).click()
 await expect(page.getByRole('alert')).toBeVisible();expect((await etat(page)).profile.firstName).toBe('Léa')
 failing=false;await page.getByRole('button',{name:'Enregistrer mon profil',exact:true}).click();await expect(page.locator('main').getByRole('status').first()).toContainText('Profil enregistré.');expect((await etat(page)).profile.firstName).toBe('Élise');expect(erreurs).toEqual([])
})
test('changement de compte dans profil ouvert : formulaire suit B',async({page},info)=>{
 const B='00000000-0000-4000-8000-000000000002';await preparer(page)
 await page.route('https://*.supabase.co/rest/**',r=>r.fulfill({json:r.request().method()==='GET'?[{id:B,name:'Bob Nouveau',role:'eleve',level:'terminale-stmg',progress:{}}]:[]}))
 await page.goto('./#/parametres?rubrique=compte&reglage=profil');await attendreAccueil(page)
 await expect(page.getByLabel('Prénom',{exact:true})).toHaveValue('Léa')
 await page.evaluate(B=>{const old=localStorage.getItem('stmg_session');localStorage.setItem('stmg_session',JSON.stringify({token:'token-B',refresh:'r',expires_at:9999999999,user:{id:B,email:'b@test.fr'}}));window.dispatchEvent(new StorageEvent('storage',{key:'stmg_session',oldValue:old,newValue:localStorage.getItem('stmg_session')}))},B)
 await expect.poll(async()=>(await etat(page)).profile?.firstName).toBe('Bob')
 await page.goto('./#/parametres?rubrique=compte&reglage=profil');await attendreAccueil(page)
 await info.attach('identite-formulaire',{body:JSON.stringify({etat:await etat(page),prenomAffiche:await page.getByLabel('Prénom',{exact:true}).inputValue()}),contentType:'application/json'})
 await page.screenshot({path:info.outputPath('profil-changement-compte.png')})
 await expect(page.getByLabel('Prénom',{exact:true})).toHaveValue('Bob')
})
test('OAuth refus simple : message visible et connexion utilisable',async({page})=>{
 const erreurs=await preparer(page,null);await page.route('https://*.supabase.co/**',r=>r.fulfill({json:{external:{google:true}}}))
 await page.goto('./#error=access_denied&error_description=Refus%20Google')
 await expect(page.getByRole('dialog').getByText('Refus Google',{exact:true})).toBeVisible();await page.locator('#w-email').fill('nouveau@test.fr');await page.locator('#w-pass').fill('Motdepasse123');await expect(page.getByRole('dialog').getByRole('button',{name:'Se connecter',exact:true})).toBeEnabled();expect(erreurs).toEqual([])
})
