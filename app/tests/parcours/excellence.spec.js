import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {preparer,attendreAccueil,etatEleve} from './eleve.js'
const copy='La hausse des prix réduit le pouvoir d’achat à revenu nominal inchangé. Les aides ciblées peuvent soutenir les ménages modestes, mais pèsent sur les finances publiques.'
const result={total:20,feedback:'Une explication pertinente à approfondir.',criteria:['notions','documents','argumentation','structure','expression'].map(id=>({id,points:1,feedback:'Explication du point et conseil.'})),passages:[{quote:'La hausse des prix réduit le pouvoir d’achat',feedback:'Mécanisme juste.',suggestion:'Précise les effets distributifs.'}],strengths:['Notions pertinentes.'],priorities:['Exploiter une donnée chiffrée.'],outline:['Introduction.','Effets et limites.','Conclusion.']}
async function setup(page,state=etatEleve()){
 const errors=await preparer(page,state)
 await page.addInitScript(()=>sessionStorage.setItem('stmg_fenetre_visite','aucune'))
 return errors
}
async function open(page){await page.goto('./#/excellence-economique');await attendreAccueil(page);await page.getByRole('button',{name:'Ouvrir le sujet',exact:true}).nth(2).click()}
test('concours sur ordinateur : dossier intégral, défilement séparé, copie remise et correction contrôlée',async({page})=>{
 await page.setViewportSize({width:1280,height:900});const errors=await setup(page);let body
 await page.route('**/functions/v1/examen-blanc',route=>{body=route.request().postDataJSON();return route.fulfill({contentType:'application/json',body:JSON.stringify({excellence:result})})})
 await page.goto('./#/bac-blanc');await attendreAccueil(page);await page.getByRole('link',{name:'Choisir un sujet →',exact:true}).click()
 await expect(page.getByRole('heading',{name:'Prix de l’excellence économique',exact:true})).toBeVisible()
 await expect(page.getByRole('button',{name:'Ouvrir le sujet',exact:true})).toHaveCount(4)
 await page.getByRole('button',{name:'Ouvrir le sujet',exact:true}).nth(2).click()
 await expect(page.locator('#ex-documents img')).toHaveCount(13)
 await page.getByRole('button',{name:'Commencer ma copie',exact:true}).click();await page.getByLabel('Ta composition',{exact:true}).fill(copy)
 const left=await page.locator('#ex-copy').boundingBox(),right=await page.locator('#ex-documents').boundingBox();expect(right.x).toBeGreaterThan(left.x+left.width)
 await page.locator('.excellence-document-scroll').evaluate(el=>el.scrollTop=1000)
 expect(await page.locator('.excellence-document-scroll').evaluate(el=>el.scrollTop)).toBeGreaterThan(500)
 await expect(page.getByLabel('Ta composition',{exact:true})).toHaveValue(copy)
 await page.getByRole('button',{name:'Rendre ma copie',exact:true}).click()
 await expect(page.getByRole('button',{name:'Corriger ma copie',exact:true})).toBeDisabled()
 await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Corriger ma copie',exact:true}).click()
 await expect(page.getByRole('heading',{name:'Note indicative · 5/20'})).toBeVisible()
 expect(body).toEqual({action:'excellence',subjectId:'2022',answer:copy})
 await expect(page.getByText('Mécanisme juste.',{exact:true})).toBeVisible()
 await page.reload();await page.getByRole('button',{name:'Reprendre ma copie',exact:true}).click()
 await expect(page.getByRole('heading',{name:'Note indicative · 5/20'})).toBeVisible();expect(errors).toEqual([])
})
test('téléphone : deux vues simples, reprise de la copie, téléchargement et séparation des sessions',async({page})=>{
 await page.setViewportSize({width:390,height:844});await setup(page);await open(page)
 await page.getByRole('button',{name:'Commencer ma copie',exact:true}).click();await page.getByLabel('Ta composition',{exact:true}).fill(copy)
 await page.getByRole('button',{name:'Documents',exact:true}).click();await expect(page.locator('#ex-documents')).toBeVisible();await expect(page.getByLabel('Ta composition',{exact:true})).toBeHidden()
 await page.locator('#ex-documents summary').first().click();await expect(page.locator('#ex-documents details').first()).toContainText('SESSION 2022-2023')
 await page.getByRole('button',{name:'Ma copie',exact:true}).click();await expect(page.getByLabel('Ta composition',{exact:true})).toHaveValue(copy)
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Télécharger ma copie',exact:true}).click();expect((await download).suggestedFilename()).toBe('copie-excellence-2022.txt')
 await page.getByRole('button',{name:'Les sujets',exact:false}).click();await page.getByRole('button',{name:'Ouvrir le sujet',exact:true}).first().click()
 await expect(page.getByRole('button',{name:'Commencer ma copie',exact:true})).toBeVisible();await page.getByRole('button',{name:'Les sujets',exact:false}).click()
 await page.getByRole('button',{name:'Reprendre ma copie',exact:true}).click();await expect(page.getByLabel('Ta composition',{exact:true})).toHaveValue(copy)
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true)
})
test('échec fournisseur, annulation et attente maximale : copie conservée sans fausse note',async({page})=>{
 await setup(page);let count=0
 await page.route('**/functions/v1/examen-blanc',route=>{count++;if(count>1)return;return route.fulfill({status:502,contentType:'application/json',body:JSON.stringify({error:'provider_unavailable'})})})
 await open(page);await page.getByRole('button',{name:'Commencer ma copie',exact:true}).click();await page.getByLabel('Ta composition',{exact:true}).fill(copy)
 await page.getByRole('button',{name:'Rendre ma copie',exact:true}).click();await page.getByRole('checkbox').check()
 const send=page.getByRole('button',{name:'Corriger ma copie',exact:true});await send.click();await expect(page.getByRole('alert')).toContainText('temporairement indisponible')
 await send.click();await expect.poll(()=>count).toBe(2);await page.getByRole('button',{name:'Annuler l’attente',exact:true}).click();await expect(page.getByRole('alert')).toContainText('Attente annulée')
 await page.clock.install();await send.click();await expect.poll(()=>count).toBe(3);await page.clock.runFor(150001);await expect(page.getByRole('alert')).toContainText('trop de temps')
 await expect(send).toBeEnabled();await expect(page.getByLabel('Ta composition',{exact:true})).toHaveValue(copy);await expect(page.getByRole('heading',{name:/Note indicative/})).toHaveCount(0)
})
for(const [width,theme] of [[320,'light'],[1280,'dark']])test(`concours accessible ${width} ${theme}`,async({page})=>{
 await page.setViewportSize({width,height:900});await setup(page,etatEleve({theme}));await open(page)
 await expect(page.getByRole('button',{name:'Commencer ma copie',exact:true})).toBeVisible()
 expect((await new AxeBuilder({page}).include('main').analyze()).violations).toEqual([])
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true)
})
test('sans compte : dossiers lisibles mais pas de copie ni appel de correction',async({page})=>{
 await setup(page,etatEleve({account:null}));await open(page)
 await expect(page.getByText('Les documents sont accessibles sans compte.',{exact:false})).toBeVisible();await expect(page.getByRole('button',{name:'Commencer ma copie',exact:true})).toBeDisabled()
})

test('allemand hors ligne : navigation du concours traduite et documents conservés en français',async({page})=>{
 await setup(page,etatEleve({lang:'de'}));await page.goto('./#/excellence-economique');await attendreAccueil(page)
 await expect(page.getByRole('heading',{name:'Preis für wirtschaftliche Exzellenz',exact:true})).toBeVisible()
 await page.getByRole('button',{name:'Aufgabe öffnen',exact:true}).first().click()
 await expect(page.getByRole('button',{name:'Meinen Aufsatz beginnen',exact:true})).toBeVisible()
 await page.getByRole('button',{name:'Dokumente',exact:true}).click();await page.locator('#ex-documents summary').first().click()
 await expect(page.locator('#ex-documents details').first()).toContainText('SESSION 2024-2025')
})
