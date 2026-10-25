import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {preparer,attendreAccueil,etatEleve} from './eleve.js'
const cards=Array.from({length:4},(_,i)=>({front:`Question unique ${i}`,back:`Réponse distincte ${i}. `+'Une explication développée pour vérifier le défilement interne et la lisibilité. '.repeat(12)}))
for(const [theme,width,reduced] of [['light',390,false],['dark',1280,false],['light',320,true]])test(`vrai retournement opaque ${theme} ${width}`,async({page},info)=>{
 if(reduced)await page.emulateMedia({reducedMotion:'reduce'})
 await page.setViewportSize({width,height:844});await preparer(page,etatEleve({theme,savedDecks:[{id:'studio',title:'Comprendre mon chapitre',cards}]}))
 await page.goto('./#/revision/deck/studio');await attendreAccueil(page)
 const flip=page.getByRole('button',{name:'Retourner la carte',exact:true});await expect(flip).toBeVisible()
 await expect(page.locator('.flash-front')).toHaveAttribute('aria-hidden','false');await expect(page.locator('.flash-back')).toHaveAttribute('aria-hidden','true')
 await expect(page.locator('.flash-stack-blank')).toBeEmpty()
 await flip.click();await expect(flip).toHaveAttribute('aria-pressed','true')
 await page.waitForTimeout(reduced?30:550)
 await expect(page.locator('.flash-front')).toHaveAttribute('aria-hidden','true');await expect(page.locator('.flash-back')).toHaveAttribute('aria-hidden','false')
 const style=await page.locator('.flash-back').evaluate(el=>({bg:getComputedStyle(el).backgroundColor,backface:getComputedStyle(el).backfaceVisibility,transform:getComputedStyle(el).transform}))
 expect(style.bg).toMatch(/^rgb\(/);expect(style.backface).toBe('hidden');expect(style.transform).not.toBe('none')
 const content=page.locator('.flash-back .flash-face-content');await content.evaluate(el=>el.scrollTop=el.scrollHeight);expect(await content.evaluate(el=>el.scrollTop)).toBeGreaterThan(0)
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true)
 expect((await new AxeBuilder({page}).include('.flashcard-studio').analyze()).violations).toEqual([])
 await page.screenshot({path:info.outputPath('verso.png')})
 await flip.focus();await page.keyboard.press('Space');await expect(flip).toHaveAttribute('aria-pressed','false')
})
test('Bienvenue animé une fois par onglet et entrée immédiate au clic',async({page})=>{
 await preparer(page,undefined,{bienvenue:true});await page.goto('./#/accueil')
 const hello=page.locator('.welcome-hello');await expect(hello).toBeVisible()
 expect(await page.locator('.welcome-title').evaluate(el=>getComputedStyle(el).animationName)).not.toBe('none')
 await hello.click();await expect(hello).toHaveCount(0)
 await page.reload();await attendreAccueil(page);await expect(page.locator('.welcome-hello')).toHaveCount(0)
})

test('Bienvenue reste lisible avec mouvement réduit',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await preparer(page,undefined,{bienvenue:true});await page.goto('./#/accueil')
 await expect(page.locator('.welcome-title')).toBeVisible();expect(await page.locator('.welcome-title').evaluate(el=>getComputedStyle(el).opacity)).toBe('1')
 expect(await page.locator('.welcome-title').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');await page.locator('.welcome-hello').click();await expect(page.locator('.welcome-hello')).toHaveCount(0)
})
