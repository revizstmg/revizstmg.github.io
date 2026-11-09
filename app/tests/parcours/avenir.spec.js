import {test,expect} from '@playwright/test'
import {preparer,etatEleve,etat} from './eleve.js'
import {ETAPES,TOTAL} from '../../src/data/avenir.js'
test('orientation gratuite : validation, reprise et bilan sur mobile',async({page})=>{
 const errors=await preparer(page,etatEleve(),{abonnement:null});await page.setViewportSize({width:360,height:740});await page.goto('/#/parcours-avenir')
 await page.getByRole('button',{name:'Commencer mon questionnaire'}).click();await page.getByRole('button',{name:'Continuer',exact:true}).click()
 await expect(page.getByRole('alert')).toContainText('Réponds à chaque question')
 await page.locator('fieldset').first().getByText('Beaucoup',{exact:true}).click();await page.reload()
 await page.getByRole('button',{name:'Reprendre mon questionnaire'}).click();await expect(page.locator('fieldset').first().getByRole('radio').nth(4)).toBeChecked()
 for(let step=0;step<ETAPES.length;step++){
  for(const f of await page.locator('fieldset').all())await f.getByRole('radio').nth(step<8?(step===0?4:0):0).check()
  await page.getByRole('button',{name:step===ETAPES.length-1?'Voir mon bilan':'Continuer',exact:true}).click()
 }
 await expect(page.getByRole('heading',{name:'Des pistes à explorer'})).toBeVisible();await expect(page.getByRole('heading',{name:'Gestion et finance',exact:true}).first()).toBeVisible()
 await expect(page.getByRole('heading',{name:'Formations à comparer'})).toBeVisible();expect(Object.keys((await etat(page)).parcours.avenir.answers)).toHaveLength(TOTAL)
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.reload()
 await expect(page.getByRole('heading',{name:'Des pistes à explorer'})).toBeVisible();expect(errors).toEqual([])
})
test('inconnues : pas de fausse recommandation, effacement limité au questionnaire',async({page})=>{
 const answers=Object.fromEntries(ETAPES.flatMap(s=>s.questions.map(q=>[q.id,q.options?3:'?'])))
 await preparer(page,etatEleve({parcours:{objectifs:{noteVisee:16},avenir:{answers,finished:true,step:8,maj:2}}}),{abonnement:null});await page.goto('/#/parcours-avenir')
 await expect(page.getByText('Aucune piste ne se détache suffisamment.',{exact:false})).toBeVisible()
 await page.getByRole('button',{name:'Effacer mon questionnaire',exact:true}).click();await page.getByRole('button',{name:'Confirmer l’effacement'}).click()
 await expect(page.getByRole('button',{name:'Commencer mon questionnaire'})).toBeVisible()
 const saved=await etat(page);expect(saved.parcours.avenir.answers).toEqual({});expect(saved.parcours.objectifs.noteVisee).toBe(16)
})
test('menu desktop : accès à Parcours Avenir',async({page})=>{
 await preparer(page,etatEleve(),{abonnement:null});await page.setViewportSize({width:1280,height:900});await page.goto('/#/accueil')
 await page.getByRole('button',{name:'Menu',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Menu'})
 await dialog.locator('summary').filter({hasText:/outils/i}).click();await dialog.getByRole('link',{name:/Parcours Avenir/}).click()
 await expect(page.getByRole('heading',{name:'Parcours Avenir',exact:true})).toBeVisible()
})
