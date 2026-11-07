import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {preparer,etatEleve} from './eleve.js'
for(const level of ['premiere','terminale'])test(`sujets prêts ${level} : PDF immédiats même si la génération est indisponible`,async({page})=>{
 const errors=await preparer(page,etatEleve({track:{level:`${level}-stmg`,specialty:level==='terminale'?'gestion-finance':null}}))
 const calls=[]
 await page.route('**/functions/v1/examen-blanc',route=>{
  if(route.request().method()==='POST')calls.push(route.request().postData())
  return route.fulfill({contentType:'application/json',body:JSON.stringify({ready:false})})
 })
 await page.goto('./#/bac-blanc')
 const section=page.getByRole('region',{name:'Les sujets classiques'})
 await expect(section).toBeVisible()
 const select=section.getByLabel('Choisir une matière')
 await expect(select.locator('option')).toHaveCount(5)
 for(const matiere of await select.locator('option').evaluateAll(options=>options.map(o=>o.value))){
  await select.selectOption(matiere)
  await expect(section.getByRole('article')).toHaveCount(['Management','Droit et économie'].includes(matiere)?4:2)
 }
 await select.selectOption('Droit et économie')
 await expect(section).toContainText('120 min')
 await expect(section).toContainText('8 documents')
 await expect(section).toContainText('12 questions')
 await expect(section.getByRole('heading',{name:'Révision Première-Terminale',exact:true})).toBeVisible()
 await expect(section).toContainText('incluent des notions de Terminale')
 await expect(section).toContainText('10 questions')
 const quota=await page.evaluate(()=>localStorage.getItem('stmg_ia_mois'))
 for(const card of await section.getByRole('article').all())for(const name of ['Télécharger le sujet','Télécharger le corrigé']){
  const waiting=page.waitForEvent('download')
  await card.getByRole('link',{name,exact:true}).click()
  const file=await waiting,stream=await file.createReadStream(),chunks=[]
  for await(const chunk of stream)chunks.push(chunk)
  expect(Buffer.concat(chunks).subarray(0,5).toString()).toBe('%PDF-')
 }
 expect(calls).toEqual([])
 expect(await page.evaluate(()=>localStorage.getItem('stmg_ia_mois'))).toBe(quota)
 expect(errors).toEqual([])
})
for(const theme of ['light','dark'])test(`sujets prêts : lisibles et accessibles sur petit écran ${theme}`,async({page},testInfo)=>{
 await page.setViewportSize({width:320,height:700})
 await preparer(page,etatEleve({theme}))
 await page.goto('./#/bac-blanc')
 const section=page.getByRole('region',{name:'Les sujets classiques'})
 await section.scrollIntoViewIfNeeded()
 await page.evaluate(()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{}))))
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true)
 expect((await new AxeBuilder({page}).include('.bac-ready').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([])
 if(theme==='light')await section.screenshot({path:testInfo.outputPath('sujets-prets-mobile.png')})
})
test('sujets prêts : aperçu ordinateur',async({page},testInfo)=>{
 await page.setViewportSize({width:1280,height:900})
 await preparer(page,etatEleve())
 await page.addInitScript(()=>localStorage.setItem('stmg_cookies_info','1'))
 await page.goto('./#/bac-blanc')
 const section=page.getByRole('region',{name:'Les sujets classiques'})
 await section.scrollIntoViewIfNeeded()
 const cards=section.getByRole('article')
 await expect(cards).toHaveCount(4)
 const a=await cards.nth(0).boundingBox(),b=await cards.nth(1).boundingBox()
 expect(Math.abs(a.y-b.y)).toBeLessThan(2)
 expect(b.x).toBeGreaterThan(a.x+a.width)
 await section.screenshot({path:testInfo.outputPath('sujets-prets-desktop.png')})
})
