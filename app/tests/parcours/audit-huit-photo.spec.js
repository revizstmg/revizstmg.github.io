import {test,expect} from '@playwright/test'
import {preparer,attendreAccueil,etat} from './eleve.js'
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j6QAAAABJRU5ErkJggg==','base64')
const file={name:'synthese.png',mimeType:'image/png',buffer:png}
const proof='test-results/'
async function setup(page){await preparer(page,undefined,{abonnement:'ultimate'});await page.goto('./#/fiches-photo');await attendreAccueil(page)}
test('sonde photo : image corrompue bloque tout envoi du lot',async({page})=>{
 await setup(page);let calls=0;await page.route('**/functions/v1/fiche-vision',r=>{calls++;return r.fulfill({json:{}})})
 await page.locator('input[type=file]').setInputFiles([file,{name:'cassee.png',mimeType:'image/png',buffer:Buffer.from('synthetic invalid image')}]);await page.getByRole('button',{name:'Analyser la photo',exact:true}).click()
 await expect(page.getByText('L’analyse IA a échoué cette fois. Utilise la lecture classique ci-dessous.',{exact:true})).toBeVisible();expect(calls).toBe(0)
 await page.screenshot({path:proof+'image-invalide.png'})
})
test('sonde OCR synthétique : texte, fiche locale, enregistrement et reprise',async({page})=>{
 await preparer(page);await page.addInitScript(()=>{window.Tesseract={recognize:async()=>({data:{text:'La performance financière mesure les résultats économiques obtenus.\nLa rentabilité représente les profits rapportés aux moyens engagés.\nComment améliorer durablement cette performance financière ?'}})}})
 await page.goto('./#/fiches-photo');await attendreAccueil(page);await page.locator('input[type=file]').setInputFiles(file)
 await page.getByRole('button',{name:/Lecture sur cet appareil/}).click();await expect(page.locator('textarea')).toHaveValue(/performance financière/)
 await page.getByPlaceholder('Titre de la fiche (optionnel)').fill('OCR synthétique audit08');await page.getByRole('button',{name:/Générer ma fiche/}).click();await page.getByRole('button',{name:/Enregistrer la fiche/}).click()
 await expect.poll(async()=>(await etat(page)).fiches?.length).toBe(1);await page.reload();await attendreAccueil(page)
 await expect(page.getByRole('button',{name:/OCR synthétique audit08/})).toBeVisible();await page.screenshot({path:proof+'ocr-fiche-reprise.png'})
})
test('sonde photo : tout recommencer invalide la réponse précédente tardive',async({page},info)=>{
 await setup(page);let release;let calls=0;await page.route('**/functions/v1/fiche-vision',async r=>{calls++;await new Promise(resolve=>release=resolve);return r.fulfill({json:{fiche:{title:'ANCIENNE PHOTO AUDIT08',questions:['Ancienne question synthétique'],definitions:[],keyInfo:[]}}})})
 await page.locator('input[type=file]').setInputFiles(file);await page.getByRole('button',{name:'Analyser la photo',exact:true}).click();await expect.poll(()=>calls).toBe(1)
 await page.getByRole('button',{name:/Tout recommencer/}).click();await expect(page.locator('img[alt^="Page "]')).toHaveCount(0);release();await page.waitForTimeout(500)
 const stale=await page.getByRole('heading',{name:'ANCIENNE PHOTO AUDIT08',exact:true}).count();if(stale)await page.getByRole('heading',{name:'ANCIENNE PHOTO AUDIT08',exact:true}).scrollIntoViewIfNeeded();await info.attach('observed',{body:JSON.stringify({staleResultCount:stale,calls}),contentType:'application/json'});await page.screenshot({path:proof+'photo-reset-tardif.png'})
 expect(stale,'Aucune ancienne fiche ne doit réapparaître après Tout recommencer').toBe(0)
})
