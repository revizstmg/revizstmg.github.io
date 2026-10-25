import {test,expect} from '@playwright/test'
import {preparer,attendreAccueil} from './eleve.js'

test('chargement : polices découvertes tôt, panneaux différés puis utilisables au clavier',async({page})=>{
 await preparer(page)
 await page.setViewportSize({width:1280,height:900})
 const panels=[]
 page.on('request',r=>{if(/\/(Accessibility)-.*\.js/.test(r.url()))panels.push(r.url())})
 await page.goto('./#/accueil');await attendreAccueil(page)
 expect(panels).toEqual([])
 const preloads=page.locator('link[rel=preload][as=font]')
 await expect(preloads).toHaveCount(2)
 for(const font of await preloads.evaluateAll(links=>links.map(l=>l.href))){
  expect((await page.request.get(font)).status()).toBe(200)
  expect(await page.evaluate(url=>performance.getEntriesByName(url).length,font)).toBe(1)
 }
 // Le lien permanent reste le point d’entrée clavier, même lorsque le module est différé.
 await page.getByRole('button',{name:/Accessibilité/}).last().click()
 await expect(page.getByRole('dialog')).toBeVisible()
 expect(panels.some(u=>u.includes('/Accessibility-'))).toBe(true)
 await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0)
 await expect(page.getByRole('button',{name:/Accessibilité/}).last()).toBeFocused()
})
