import {test,expect} from '@playwright/test'
import {preparer,attendreAccueil,etatEleve} from './eleve.js'
for(const type of ['qcm','trou'])test(`${type} : Rejouer change les questions visibles du chapitre`,async({page})=>{
 const errors=await preparer(page,etatEleve({track:{level:'premiere-stmg'}}))
 await page.goto('./#/subject/p1-sgn/theme/p1-sgn-t1/chapter/1');await attendreAccueil(page)
 await page.getByRole('button',{name:/Exercices/}).click()
 await page.locator(`[data-jeu="p1-sgn-t1::1::${type==='qcm'?'qdef':'trou0'}"]`).click()
 await page.getByRole('button',{name:/Entraînement/}).click()
 const sets=[]
 for(let round=0;round<2;round++) {
  const prompts=[]
  for(let n=0;n<10;n++) {
   if(await page.getByRole('button',{name:'Rejouer',exact:true}).count())break
   const view=page.locator('[data-exercice]')
   if(type==='qcm') {
    prompts.push(await view.getByRole('heading',{level:3}).innerText())
    await view.locator('button.choice-in').first().click()
   } else {
    prompts.push(await view.locator('p.mb-4.text-lg').innerText())
    await view.getByRole('textbox').fill('Réponse de test')
    await view.getByRole('button',{name:'Vérifier',exact:true}).click()
   }
   await view.getByRole('button',{name:type==='qcm'?/Question suivante|Voir mon score/:/Suivant|Voir mon score/}).click()
  }
  await expect(page.getByRole('button',{name:'Rejouer',exact:true})).toBeVisible()
  expect(prompts.length).toBeGreaterThanOrEqual(2)
  sets.push(prompts)
  if(round===0)await page.getByRole('button',{name:'Rejouer',exact:true}).click()
 }
 expect(sets[1].some(q=>!sets[0].includes(q))).toBe(true)
 expect(errors).toEqual([])
})
