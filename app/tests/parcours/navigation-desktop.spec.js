import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {preparer,etatEleve,attendreAccueil} from './eleve.js'

for(const [theme,width] of [['light',1024],['dark',1440]])test('accès communauté toujours visibles sur ordinateur : '+theme,async({page},info)=>{
 const errors=await preparer(page,etatEleve({theme}))
 await page.setViewportSize({width,height:900})
 await page.goto('./#/accueil');await attendreAccueil(page)
 const cookie=page.getByRole('button',{name:'OK',exact:true});if(await cookie.isVisible())await cookie.click()
 const nav=page.locator('header .desktop-quick-links')
 await expect(nav).toBeVisible();await expect(nav.getByRole('link')).toHaveCount(4)
 for(const [label,path] of [['Ma classe','/classe'],['Amis','/amis'],['Boutique','/boutique'],['Classement','/classement']]){
  const link=nav.getByRole('link',{name:label,exact:true})
  await expect(link).toBeInViewport();await expect(link).toHaveAttribute('href','#'+path)
  await link.click();await expect(page).toHaveURL(new RegExp('#'+path+'$'))
  await expect(link).toHaveAttribute('aria-current','page')
  await expect(nav.locator('[aria-current=page]')).toHaveCount(1)
 }
 await page.waitForFunction(()=>document.getAnimations().every(a=>a.playState!=='running'||a.effect?.getComputedTiming().iterations===Infinity))
 expect((await new AxeBuilder({page}).include('.desktop-quick-links').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([])
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false)
 await page.screenshot({path:info.outputPath('navigation-'+theme+'.png')})
 await page.setViewportSize({width:390,height:844});await expect(nav).not.toBeVisible()
 expect(errors).toEqual([])
})
