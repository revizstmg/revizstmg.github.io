import {test,expect} from '@playwright/test'
import {preparer,etatEleve,attendreAccueil} from './eleve.js'
test('contre-audit : mathématiques reprise après rechargement et sortie',async({page})=>{
 const errors=await preparer(page,etatEleve({track:{level:'premiere-stmg'}}));await page.goto('./#/bac-blanc');await attendreAccueil(page)
 await page.getByRole('button',{name:'Faire un sujet d’entraînement (2 h)'}).click()
 const field=page.getByLabel('Réponse à la question 1',{exact:true});await field.fill('42,75');const question=await page.locator('#enonce-a1').innerText()
 await page.reload();await attendreAccueil(page);await page.getByRole('button',{name:'Faire un sujet d’entraînement (2 h)'}).click()
 await expect(field).toHaveValue('42,75');await expect(page.locator('#enonce-a1')).toHaveText(question)
 await page.getByRole('button',{name:'← Quitter'}).click();await page.getByRole('button',{name:'Faire un sujet d’entraînement (2 h)'}).click();await expect(field).toHaveValue('42,75');expect(errors).toEqual([])
})
test('contre-audit : micro refusé puis nouvelle tentative',async({page})=>{
 const errors=await preparer(page);await page.addInitScript(()=>{Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>{throw new DOMException('Refus synthétique','NotAllowedError')}}});window.MediaRecorder=class{}})
 await page.goto('./#/grand-oral');await attendreAccueil(page);await page.getByRole('button',{name:/M'entraîner à l'oral/}).click()
 const button=page.getByRole('button',{name:'⏺ Enregistrer',exact:true});await button.click();await expect(page.getByText('Accès au micro refusé. Autorise le microphone pour t’enregistrer.')).toBeVisible();await expect(button).toBeEnabled();await button.click();await expect(button).toBeEnabled();expect(errors).toEqual([])
})
test('contre-audit : annulation Excellence et réponse tardive sans note',async({page})=>{
 const errors=await preparer(page);let pending
 await page.route('**/functions/v1/examen-blanc',route=>{pending=route})
 await page.goto('./#/excellence-economique');await attendreAccueil(page);await page.getByRole('button',{name:'Ouvrir le sujet',exact:true}).first().click();await page.getByRole('button',{name:'Commencer ma copie',exact:true}).click();await page.getByLabel('Ta composition',{exact:true}).fill('Copie synthétique : le pouvoir d’achat dépend du revenu disponible et des prix.');await page.getByRole('button',{name:'Rendre ma copie',exact:true}).click();await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Corriger ma copie',exact:true}).click();await expect.poll(()=>!!pending).toBe(true)
 await page.getByRole('button',{name:'Annuler l’attente',exact:true}).click();await expect(page.getByRole('alert')).toContainText('Attente annulée');await pending.fulfill({json:{excellence:{total:20,feedback:'Réponse tardive synthétique',criteria:['notions','documents','argumentation','structure','expression'].map(id=>({id,points:1,feedback:'Conseil synthétique.'})),passages:[],strengths:['Notion pertinente.'],priorities:['Approfondir.'],outline:['Introduction.','Développement.','Conclusion.']}}}).catch(()=>{});await page.waitForTimeout(300);await expect(page.getByRole('heading',{name:/Note indicative/})).toHaveCount(0);await page.reload();await page.getByRole('button',{name:'Reprendre ma copie',exact:true}).click();await expect(page.getByLabel('Ta composition',{exact:true})).toHaveValue(/Copie synthétique/);expect(errors).toEqual([])
})
test('contre-audit : disponibilité examen bloquée sans délai ni reprise après cinq minutes',async({page})=>{
 const errors=await preparer(page);await page.clock.install();let checks=0
 await page.route('**/functions/v1/examen-blanc',route=>{if(route.request().method()==='GET'){checks++;return}return route.fulfill({json:{}})})
 await page.goto('./#/bac-blanc');await attendreAccueil(page);await page.getByLabel('Quel examen veux-tu passer ?').fill('Réviser les notions de management de terminale.')
 await expect.poll(()=>checks).toBe(1);await page.clock.runFor(300001)
 const form=page.getByRole('region',{name:'Crée ton examen blanc'});await expect(form.getByRole('button',{name:'Analyser ma demande'})).toBeDisabled();await expect(form.getByText(/Vérification/)).toBeVisible();await expect(form.getByRole('button',{name:/Réessayer/})).toHaveCount(0)
 await page.screenshot({path:'/workspace/work/examens-disponibilite-bloquee.png',fullPage:true});expect(errors).toEqual([])
})
