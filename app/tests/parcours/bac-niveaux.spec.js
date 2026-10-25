import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {preparer,etatEleve,attendreAccueil} from './eleve.js'
for(const [level,width,title] of [['premiere-stmg',390,'Mathématiques'],['terminale-stmg',1280,'Prix de l’excellence économique'],['terminale-stmg',390,'Prix de l’excellence économique']])test(`quatre rubriques Bac blanc : ${level} ${width}`,async({page})=>{
 await preparer(page,etatEleve({track:{level,specialty:'gestion-finance'}}));await page.setViewportSize({width,height:900});await page.goto('./#/bac-blanc');await attendreAccueil(page)
 await expect(page.locator('.bac-preview-number')).toHaveText(['01','02','03','04'])
 await expect(page.getByRole('link',{name:/Ouvrir le sujet PDF complet/})).toHaveCount(2)
 await expect(page.getByRole('heading',{name:title,exact:true})).toBeVisible();await expect(page.locator('.bac-creator')).toBeVisible()
 if(level==='premiere-stmg'){
 await expect(page.getByRole('link',{name:/Choisir un sujet/})).toHaveCount(0)
 await page.goto('./#/excellence-economique');await expect(page).toHaveURL(/#\/bac-blanc$/)
 }else{
 await page.getByRole('link',{name:/Choisir un sujet/}).click();await page.getByRole('button',{name:'Ouvrir le sujet',exact:true}).first().click()
 if(width<768)await page.getByRole('button',{name:'Documents',exact:true}).click()
 const open=page.getByRole('button',{name:'Agrandir le PDF',exact:true});await open.click();const dialog=page.getByRole('dialog',{name:'Le dossier',exact:true});await expect(dialog).toBeVisible()
 await expect(dialog.locator('img')).toHaveCount(10)
 await expect(dialog.getByRole('link',{name:/Ouvrir le PDF dans un nouvel onglet/})).toHaveAttribute('href',/\/sujet\.pdf$/)
 await page.waitForFunction(()=>document.querySelector('.excellence-reader-pages img')?.naturalWidth>0)
 const before=await dialog.locator('img').first().boundingBox();await dialog.getByRole('button',{name:'Augmenter le zoom',exact:true}).click();expect((await dialog.locator('img').first().boundingBox()).width).toBeGreaterThan(before.width)
 const box=await dialog.locator('.excellence-reader-pages').boundingBox();expect(box.width).toBeGreaterThan(width-90);expect(box.height).toBeGreaterThan(500)
 await expect(dialog.getByRole('link',{name:/Ouvrir le PDF dans un nouvel onglet/})).toHaveAttribute('target','_blank')
 expect((await new AxeBuilder({page}).include('.excellence-pdf-reader').analyze()).violations).toEqual([])
 await dialog.getByRole('button',{name:'Fermer',exact:true}).click();await expect(dialog).toHaveCount(0);await expect(open).toBeFocused()
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true)
})
