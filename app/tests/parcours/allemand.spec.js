import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {preparer,etatEleve,attendreAccueil,etat} from './eleve.js'

test('allemand : langue étudiée indépendante, guide, affichage et préférences conservés',async({page},info)=>{
 const errors=await preparer(page,etatEleve({studyLanguages:['de'],lang:'fr'}))
 const requests=[]
 page.on('request',r=>{if(/mymemory|translate.googleapis/.test(r.url())) requests.push(r.url())})
 await page.goto('./#/subject/langues');await attendreAccueil(page)
 await expect(page.getByRole('button',{name:/Allemand/})).toHaveAttribute('aria-pressed','true')
 await expect(page.getByRole('link',{name:/Ouvrir le guide PDF/})).toHaveAttribute('href',/guide-de.*pdf/)
 await page.getByRole('button',{name:'Menu',exact:true}).click()
 await page.locator('.site-menu-languages summary').click()
 await page.getByRole('button',{name:'Deutsch',exact:true}).click()
 await page.keyboard.press('Escape')
 await expect(page.locator('html')).toHaveAttribute('lang','de')
 await expect(page.getByRole('heading',{name:'Trau dich zu sprechen.'})).toBeVisible()
 await expect(page.getByRole('button',{name:/Deutsch/}).last()).toHaveAttribute('aria-pressed','true')
 await expect(page.getByRole('link',{name:'PDF-Handbuch öffnen ↗'})).toHaveAttribute('href',/guide-de.*pdf/)
 for(const dark of [false,true]){
  await page.evaluate(d=>document.documentElement.classList.toggle('dark',d),dark)
  await page.evaluate(()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{}))))
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true)
  expect((await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([])
 }
 await page.screenshot({path:info.outputPath('allemand-mobile.png'),fullPage:true})
 await page.reload();await attendreAccueil(page)
 await expect(page.getByRole('heading',{name:'Trau dich zu sprechen.'})).toBeVisible()
 expect((await etat(page)).studyLanguages).toEqual(['de'])
 expect((await etat(page)).lang).toBe('de')
 expect(requests).toEqual([])
 expect(errors).toEqual([])
})
