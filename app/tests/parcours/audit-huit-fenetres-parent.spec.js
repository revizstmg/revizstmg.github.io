import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {preparer,etatEleve} from './eleve.js'
test('parent : une lecture puis actualisation explicite, sans boucle',async({page})=>{
 await preparer(page);await page.addInitScript(()=>localStorage.setItem('stmg_parent_link','PTEST23456'));let reads=0
 await page.route('**/rpc/revizstmg_stats_enfant',r=>{reads++;return r.fulfill({json:[{name:'Enfant synthétique',xp:42,subjects:[]}]})})
 await page.goto('/#/parent');await expect(page.getByText('Enfant synthétique',{exact:true})).toBeVisible()
 const initial=reads;await page.waitForTimeout(600);expect(reads).toBe(initial);expect(reads).toBe(1)
 await page.getByRole('button',{name:'Actualiser',exact:true}).click();await expect.poll(()=>reads).toBe(2)
 await page.waitForTimeout(300);expect(reads).toBe(2)
})
test('partage : fenêtre visible, code nommé, clavier et retour du focus',async({page})=>{
 await page.setViewportSize({width:390,height:844});await preparer(page,etatEleve({savedDecks:[{id:'auditdeck',title:'Paquet synthétique',cards:[{front:'Question ?',back:'Réponse.'}]}]}))
 await page.addInitScript(()=>Object.defineProperty(navigator,'share',{configurable:true,value:undefined}))
 await page.goto('/#/revision');const trigger=page.locator('#revision-flashcards button').filter({hasText:'📤'});await trigger.click()
 const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();const box=await dialog.boundingBox();expect(box.y).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThanOrEqual(844)
 await expect(dialog.getByRole('textbox',{name:'Copier le code'})).toBeVisible()
 expect((await new AxeBuilder({page}).include('[role=dialog]').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([])
 const buttons=dialog.getByRole('button');await buttons.last().focus();await page.keyboard.press('Tab');await expect(buttons.first()).toBeFocused()
 await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(trigger).toBeFocused()
})
for(const viewport of [{width:320,height:568},{width:390,height:844},{width:844,height:390},{width:1280,height:800}])test(`focus : commandes accessibles ${viewport.width}x${viewport.height}`,async({page})=>{
 await page.setViewportSize(viewport);await preparer(page,etatEleve(),{abonnement:'ultimate'})
 await page.addInitScript(()=>{document.documentElement.requestFullscreen=async()=>{throw Error('Fullscreen unavailable in this test')}})
 await page.goto('/#/coach');const trigger=page.getByRole('button',{name:/plein écran/i});await trigger.click()
 const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();const rect=await dialog.boundingBox();expect(Math.abs(rect.y)).toBeLessThan(1);expect(rect.height).toBe(viewport.height)
 for(const button of await dialog.getByRole('button').all()){
  const b=await button.boundingBox();expect(b.y).toBeGreaterThanOrEqual(0);expect(b.y+b.height).toBeLessThanOrEqual(viewport.height)
  expect(await button.evaluate(el=>{const r=el.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('button')===el})).toBe(true)
 }
 await dialog.getByRole('button',{name:'Jouer',exact:true}).click();await expect(dialog.getByRole('button',{name:'Pause',exact:true})).toBeVisible()
 await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(trigger).toBeFocused()
})
