import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {preparer,etatEleve,attendreAccueil} from './eleve.js'
const pages=['accueil','cours','revision','bac-blanc','boutique','classement','programme','moi','subject/droit/theme/droit-t5/chapter/1','subject/langues']
for(const theme of ['light','dark'])test('charte sobre sur les pages et fenêtres : '+theme,async({page},info)=>{
 test.setTimeout(180000)
 const errors=await preparer(page,etatEleve({theme}))
 await page.addInitScript(()=>{window.__motions=0;document.addEventListener('animationstart',()=>window.__motions++)})
 await page.setViewportSize({width:390,height:844})
 const findings=[]
 for(const path of pages){
  await page.goto('./#/'+path);if(path==='accueil')await attendreAccueil(page)
  await expect(page.locator('main h1').first()).toBeVisible()
  await page.waitForFunction(()=>document.getAnimations().every(a=>a.playState!=='running'))
  const audit=await page.evaluate(()=>({
   gradients:[...document.querySelectorAll('*')].filter(el=>/gradient\(/.test(getComputedStyle(el).backgroundImage)).map(el=>el.tagName+'.'+el.className).slice(0,4),
   round:[...document.querySelectorAll('button,a.rounded-full')].filter(el=>el.getBoundingClientRect().height>0&&parseFloat(getComputedStyle(el).borderTopLeftRadius)>10).map(el=>el.textContent).slice(0,4),
   emoji:document.querySelector('main').innerText.match(/\p{Extended_Pictographic}/gu)||[],
   longDash:document.body.innerText.includes('—')||document.body.innerText.includes('–'),
   svgGradient:document.querySelectorAll('linearGradient,radialGradient').length,
   overflow:document.documentElement.scrollWidth>innerWidth,

  }))
  expect(audit,path).toMatchObject({gradients:[],round:[],longDash:false,svgGradient:0,overflow:false})
  expect(audit.emoji.length,path).toBeGreaterThan(0)
  const result=await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa']).analyze()
  if(result.violations.length)findings.push({path,violations:result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))})
 }
 expect(findings).toEqual([])
 expect(await page.evaluate(()=>window.__motions)).toBeGreaterThan(1)
 await page.getByRole('button',{name:'Menu',exact:true}).click()
 await expect(page.locator('.site-menu-panel')).toContainText('📖')
 expect((await new AxeBuilder({page}).include('.site-menu-panel').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([])
 await page.screenshot({path:info.outputPath('menu-'+theme+'.png')})
 await page.keyboard.press('Escape')
 await page.goto('./#/accueil');await attendreAccueil(page)
 await page.setViewportSize({width:1280,height:900})
 await page.screenshot({path:info.outputPath('accueil-'+theme+'.png'),fullPage:true})
 await page.reload();await attendreAccueil(page)
 expect(await page.evaluate(()=>window.__motions)).toBeGreaterThan(0)
 await expect(page.locator('.welcome-hello')).toHaveCount(0)
 expect(errors).toEqual([])
})
test('préférence de mouvement réduit : aucune animation',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'})
 await preparer(page);await page.addInitScript(()=>{window.__motions=0;document.addEventListener('animationstart',()=>window.__motions++)})
 await page.goto('./#/accueil');await attendreAccueil(page)
 expect(await page.evaluate(()=>window.__motions)).toBe(0)
})
