import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {preparer,etatEleve,attendreAccueil} from './eleve.js'
async function audit(page){
 await page.waitForFunction(()=>document.getAnimations().every(a=>a.playState!=='running'||a.effect?.getComputedTiming().iterations===Infinity))
 return new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa']).analyze()
}
for(const [theme,width] of [['light',320],['dark',390],['light',1280]])test('cours, définitions et exercices harmonisés '+theme+' '+width,async({page},info)=>{
 const errors=await preparer(page,etatEleve({theme}))
 await page.setViewportSize({width,height:850})
 await page.goto('./#/subject/gestion-finance/theme/gf-t1/chapter/0');await attendreAccueil(page)
 await page.getByRole('button',{name:'OK',exact:true}).click()
 for(const [name,selector] of [['Cours','.reader'],['Définitions','.definition-studio'],['Exercices','.chapter-exercise-grid']]){
  await page.getByRole('button',{name:new RegExp(name)}).first().click()
  await expect(page.locator(selector)).toBeVisible()
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false)
  expect((await audit(page)).violations).toEqual([])
  await page.screenshot({path:info.outputPath(name+'.png'),fullPage:true})
 }
 await page.locator('[data-jeu]').filter({hasText:/QCM/}).first().click()
 await page.getByRole('button',{name:/Entraînement/}).click()
 await expect(page.locator('[data-exercice]')).toBeVisible()
 await expect(page.locator('[data-exercice] h3')).toBeVisible()
 await page.screenshot({path:info.outputPath('question.png'),fullPage:true})
 expect(errors).toEqual([])
})
test('bibliothèque, matière et chapitres accessibles sur petit écran',async({page})=>{
 const errors=await preparer(page)
 await page.setViewportSize({width:320,height:800})
 for(const route of ['/cours','/subject/gestion-finance','/subject/gestion-finance/theme/gf-t1']){
  await page.goto('./#'+route);await attendreAccueil(page)
  const cookies=page.getByRole('button',{name:'OK',exact:true});if(await cookies.isVisible())await cookies.click()
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false)
  expect((await audit(page)).violations).toEqual([])
 }
 expect(errors).toEqual([])
})
