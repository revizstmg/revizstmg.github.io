import {test,expect} from '@playwright/test'
import {preparer,etatEleve} from './eleve.js'
test('choisir des formules, répondre et obtenir un bilan sans modifier la maîtrise',async({page},info)=>{
 const errors=await preparer(page)
 await page.goto('./#/accueil')
 await expect(page.locator('main a[href="#/express"]')).toHaveCount(0)
 await expect(page.locator('main a[href="#/formules"]')).toHaveCount(0)
 await page.getByRole('link',{name:/Atelier de formules/}).click()
 const generate=page.getByRole('button',{name:'Générer mes exercices',exact:true})
 await expect(generate).toBeDisabled()
 await page.getByRole('checkbox',{name:/^Proportion /}).check()
 await page.getByRole('checkbox',{name:/^Montant de la TVA /}).check()
 await page.getByLabel('Exercices par formule').selectOption('1')
 await page.screenshot({path:info.outputPath('atelier-selection.png'),fullPage:true})
 await generate.click()
 await expect(page.locator('main')).toContainText('Exercice 1 / 2')
 await page.getByLabel('Ton résultat',{exact:true}).fill('abc')
 await page.getByRole('button',{name:'Vérifier ma réponse'}).click()
 await expect(page.getByRole('alert')).toContainText('nombre valide')
 for(let i=0;i<2;i++){
  const values=(await page.locator('dd').allTextContents()).map(t=>Number(t.replace(/[\s\u00a0\u202f]/g,'').replace(',','.')))
  const title=await page.locator('main h2').innerText()
  const correct=title==='Proportion'?values[0]/values[1]*100:values[0]*values[1]/100
  await page.getByLabel('Ton résultat',{exact:true}).fill(i===0?correct.toFixed(2).replace('.',','):'-999999')
  await page.getByRole('button',{name:'Vérifier ma réponse'}).click()
  await expect(page.locator('main')).toContainText(i===0?'Bonne réponse !':'Voici la correction.')
  await page.screenshot({path:info.outputPath(`atelier-correction-${i}.png`),fullPage:true})
  await page.getByRole('button',{name:i===1?'Voir mon bilan':'Exercice suivant',exact:true}).click()
 }
 await expect(page.getByRole('heading',{name:'Séance terminée'})).toBeVisible()
 await expect(page.locator('main')).toContainText('1 / 2')
 await page.getByRole('button',{name:'Recommencer avec de nouvelles valeurs'}).click()
 await expect(page.locator('main')).toContainText('Exercice 1 / 2')
 expect(errors).toEqual([])
})
test('Première : uniquement les formules accessibles et anciens liens redirigés',async({page})=>{
 const errors=await preparer(page,etatEleve({track:{level:'premiere-stmg'}}))
 for(const path of ['express','formules']){
  await page.goto(`./#/${path}`)
  await expect(page).toHaveURL(/atelier-formules/)
  await expect(page.getByRole('checkbox',{name:/Montant de la TVA/})).toHaveCount(0)
  await expect(page.getByRole('checkbox',{name:/Probabilité conditionnelle/})).toHaveCount(0)
  await expect(page.getByRole('checkbox',{name:/^Proportion /})).toBeVisible()
 }
 expect(errors).toEqual([])
})
