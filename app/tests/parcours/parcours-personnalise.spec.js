import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {preparer,etatEleve,attendreAccueil,etat} from './eleve.js'

const sansDebordement=page=>page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)
const axe=async(page)=>{
 await page.evaluate(() => Promise.all(document.getAnimations().map(a => a.finished.catch(() => {}))))
 expect((await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([])
}

test('parcours personnalisé : objectifs, test de positionnement, plan qui s’adapte',async({page},info)=>{
 const errors=await preparer(page,etatEleve())
 await page.goto('./#/parcours');await attendreAccueil(page)
 // 1. Objectifs
 await expect(page.getByRole('heading',{name:'Construisons ton parcours'})).toBeVisible()
 await axe(page)
 await page.getByLabel('Quelle note vises-tu au bac ?').selectOption('14')
 await page.getByLabel('Combien d’heures peux-tu réviser chaque semaine ?').selectOption('10')
 await page.getByRole('checkbox',{name:'Droit'}).check()
 await page.getByRole('button',{name:'Voir mon parcours'}).click()
 // 2. Plan
 await expect(page.getByRole('heading',{name:'Ton plan, semaine par semaine'})).toBeVisible()
 await expect(page.getByText(/Objectif 14 sur 20 · 10 h par semaine/)).toBeVisible()
 await expect(page.getByRole('heading',{name:'Cette semaine'})).toBeVisible()
 expect(await page.getByRole('link',{name:/^Ouvrir /}).count()).toBeGreaterThan(3)
 await expect(page.getByRole('progressbar',{name:'Avancement de la semaine'})).toBeVisible()
 expect((await etat(page)).parcours.objectifs).toMatchObject({noteVisee:14,heuresSemaine:10,difficiles:expect.any(Array)})
 await axe(page)
 expect(await sansDebordement(page)).toBe(true)
 await page.screenshot({path:info.outputPath('parcours-plan.png'),fullPage:false})
 // 3. Test de positionnement d'une matière
 await page.getByRole('button',{name:'Droit',exact:true}).click()
 await expect(page.getByRole('heading',{name:'Droit',level:1})).toBeVisible()
 for(let i=0;i<8;i++){
  const choix=page.locator('main button').filter({hasText:/^[A-D]\s*/}).first()
  const suivante=page.getByRole('button',{name:/(suivante|score|terminer|voir)/i})
  if(!(await choix.count())) break
  await choix.click()
  await suivante.last().click()
  if(await page.getByRole('heading',{name:'Ton plan, semaine par semaine'}).count()) break
 }
 await expect(page.getByRole('heading',{name:'Ton plan, semaine par semaine'})).toBeVisible({timeout:15000})
 await expect(page.getByRole('heading',{name:'Ton niveau de départ'})).toBeVisible()
 expect(Object.keys((await etat(page)).parcours.positionnement)).toEqual(['droit'])
 // 4. Trop peu d'heures : le plan le dit et propose un volume réalisable
 await page.getByRole('button',{name:'Modifier mes objectifs'}).click()
 await page.getByLabel('Combien d’heures peux-tu réviser chaque semaine ?').selectOption('1')
 await page.getByRole('button',{name:'Enregistrer'}).click()
 await expect(page.getByRole('heading',{name:'Ton temps de révision ne suffit pas'})).toBeVisible()
 await page.getByRole('button',{name:/^Passer à .* h par semaine$/}).click()
 await expect(page.getByRole('heading',{name:'Ton temps de révision ne suffit pas'})).toHaveCount(0)
 expect(errors).toEqual([])
})

test('parcours personnalisé : lisible sur petit écran, en sombre, et traduit hors ligne en allemand',async({page})=>{
 const requests=[]
 page.on('request',r=>{if(/mymemory|translate.googleapis/.test(r.url())) requests.push(r.url())})
 const errors=await preparer(page,etatEleve({lang:'de',parcours:{maj:1,objectifs:{noteVisee:12,heuresSemaine:5,difficiles:[]}}}))
 await page.setViewportSize({width:320,height:740})
 await page.goto('./#/parcours');await attendreAccueil(page)
 await expect(page.getByRole('heading',{name:'Dein Plan, Woche für Woche'})).toBeVisible()
 for(const dark of [false,true]){
  await page.evaluate(d=>document.documentElement.classList.toggle('dark',d),dark)
  expect(await sansDebordement(page)).toBe(true)
  await axe(page)
 }
 expect(requests).toEqual([])
 expect(errors).toEqual([])
})

test('accueil : le menu garde l’accès au parcours',async({page})=>{
 const errors=await preparer(page,etatEleve())
 await page.goto('./#/accueil');await attendreAccueil(page)
 await page.getByRole('button',{name:'Menu',exact:true}).click()
 await page.getByRole('dialog',{name:'Menu',exact:true}).getByText('Plus d’outils',{exact:true}).click()
 await page.getByRole('dialog',{name:'Menu',exact:true}).getByRole('link',{name:'Mon parcours',exact:true}).click()
 await expect(page).toHaveURL(/#\/parcours/)
 await expect(page.getByRole('heading',{name:'Construisons ton parcours'})).toBeVisible()
 expect(errors).toEqual([])
})
