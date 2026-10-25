import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { preparer,attendreAccueil,etatEleve } from './eleve.js'
const chapter='./#/subject/p1-sgn/theme/p1-sgn-t1/chapter/1'
for(const size of [{width:320,height:568},{width:390,height:844},{width:844,height:390}]){
 test(`lecture agrandie : fermeture au pouce ${size.width}×${size.height}`,async({page},testInfo)=>{
  await page.setViewportSize(size)
  const errors=await preparer(page,etatEleve({track:{level:'premiere-stmg'}}))
  await page.goto(chapter);await attendreAccueil(page)
  const opener=page.getByRole('button',{name:/Appuyer pour lire en plein écran/})
  await opener.click()
  const dialog=page.getByRole('dialog',{name:'Cours',exact:true})
  const close=dialog.getByRole('button',{name:'Fermer',exact:true})
  await expect(close).toBeVisible()
  const box=await close.boundingBox()
  expect(box.y).toBeGreaterThan(size.height*.65)
  expect(box.y+box.height).toBeLessThanOrEqual(size.height)
  expect(box.height).toBeGreaterThanOrEqual(44)
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  await dialog.locator('.reader-full-scroll').evaluate(el=>el.scrollTop=el.scrollHeight)
  await expect(close).toBeInViewport()
  await expect(dialog.getByRole('button',{name:'Suivant',exact:true})).toBeVisible()
  expect((await new AxeBuilder({page}).include('.reader-full').analyze()).violations).toEqual([])
  if(size.width===390)await page.screenshot({path:testInfo.outputPath('mobile-lecteur.png')})
  await close.click();await expect(dialog).toHaveCount(0)
  await expect.poll(()=>page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden')
  expect(errors).toEqual([])
 })
}
for(const theme of ['light','dark']){
 test(`pages téléphone : grilles, navigation et formulaires ${theme}`,async({page},testInfo)=>{
  await page.setViewportSize({width:360,height:740})
  const errors=await preparer(page,etatEleve({theme}))
  await page.goto('./#/accueil');await attendreAccueil(page)
  for(const path of ['accueil','cours','revision','bac-blanc','boutique','mes-notes','moi','atelier-formules','classe','programme']){
   await page.goto(`./#/${path}`)
   await expect(page.locator('main h1').first()).toBeVisible()
   await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
   if(['accueil','revision','bac-blanc'].includes(path))await page.screenshot({path:testInfo.outputPath(`mobile-${path}-${theme}.png`),fullPage:true})
   const nav=page.locator('.mobile-bottom-nav')
   await expect(nav).toBeVisible()
   expect(await nav.getByRole('link').first().evaluate(el=>{const r=el.getBoundingClientRect();return !!document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('.mobile-bottom-nav')})).toBe(true)
   expect((await nav.getByRole('link').first().boundingBox()).height).toBeGreaterThanOrEqual(44)
  }
  await page.goto('./#/mes-notes')
  const input=page.getByLabel('Note sur 20',{exact:true})
  expect(await input.evaluate(el=>getComputedStyle(el).fontSize)).toBe('16px')
  await input.focus();await expect(page.locator('.mobile-bottom-nav')).toBeVisible()
  await page.evaluate(()=>{
   const v=window.visualViewport, original=Object.getOwnPropertyDescriptor(window,'innerHeight'), visual=Object.getOwnPropertyDescriptor(v,'height')
   window.__restoreMobileViewport=()=>{
    if(original)Object.defineProperty(window,'innerHeight',original);else delete window.innerHeight
    if(visual)Object.defineProperty(v,'height',visual);else delete v.height
    v.dispatchEvent(new Event('resize'));delete window.__restoreMobileViewport
   }
   Object.defineProperty(window,'innerHeight',{configurable:true,value:innerHeight-260})
   Object.defineProperty(v,'height',{configurable:true,value:v.height-260});v.dispatchEvent(new Event('resize'))
  })
  await expect(page.locator('.mobile-bottom-nav')).toBeHidden()
  await page.getByLabel('Question(s) manquée(s) · facultatif').focus()
  await expect(page.locator('.mobile-bottom-nav')).toBeHidden()
  await page.evaluate(()=>window.__restoreMobileViewport())
  await input.blur();await expect(page.locator('.mobile-bottom-nav')).toBeVisible()
  await page.getByRole('button',{name:'Menu',exact:true}).click()
  const menu=page.getByRole('dialog',{name:'Menu',exact:true})
  await expect(menu).toBeVisible()
  const menuBox=await menu.boundingBox()
  expect(menuBox.y).toBeGreaterThan(0)
  expect(menuBox.y+menuBox.height).toBeLessThanOrEqual(740)
  const menuClose=menu.getByRole('button',{name:'Fermer',exact:true})
  await expect(menuClose).toBeInViewport()
  expect((await menuClose.boundingBox()).y).toBeLessThan(100)
  if(theme==='light')await page.screenshot({path:testInfo.outputPath('mobile-menu.png')})
  await menu.locator('.site-menu-scroll').evaluate(el=>el.scrollTop=el.scrollHeight)
  await expect(menuClose).toBeInViewport()
  await expect(menu.getByRole('button',{name:/Se déconnecter/})).toBeInViewport()
  await page.keyboard.press('Escape');await expect(menu).toHaveCount(0)
  expect(errors).toEqual([])
 })
}

test('ordinateur : outils du haut et fermeture du lecteur conservés',async({page})=>{
 await page.setViewportSize({width:1280,height:800})
 const errors=await preparer(page,etatEleve({track:{level:'premiere-stmg'}}))
 await page.goto(chapter);await attendreAccueil(page)
 await expect(page.locator('.desktop-header-tools')).toBeVisible()
 await expect(page.locator('.mobile-menu-trigger')).toBeVisible()
 await page.getByRole('button',{name:/Appuyer pour lire en plein écran/}).click()
 const dialog=page.getByRole('dialog',{name:'Cours',exact:true})
 await expect(dialog.locator('.reader-close-top')).toBeVisible()
 await expect(dialog.locator('.reader-close-mobile')).toBeHidden()
 await dialog.locator('.reader-close-top').click()
 await expect(dialog).toHaveCount(0)
 expect(errors).toEqual([])
})
