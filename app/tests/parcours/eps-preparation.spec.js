import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {preparer,etatEleve} from './eleve.js'
async function choose(page){
 await page.getByLabel('Femme',{exact:true}).check()
 await page.getByLabel('Sport 1',{exact:true}).selectOption('courses')
 await page.getByLabel('Sport 2',{exact:true}).selectOption('badminton')
 await page.getByLabel('Sport 3',{exact:true}).selectOption('yoga')
 await page.getByRole('button',{name:'Continuer',exact:true}).click()
}
test('trio EPS : choix simple, objectifs, AFL et fiche personnalisée imprimable',async({page},info)=>{
 const errors=await preparer(page,etatEleve(),{abonnement:'premium'});await page.goto('/#/sport-bac')
 await page.getByRole('button',{name:'Continuer',exact:true}).click();await expect(page.getByRole('alert')).toContainText('Choisis le barème')
 await choose(page)
 await expect(page.locator('.eps-prep-sport')).toHaveCount(3)
 await page.locator('#eps-0-current').fill('4:10');await page.locator('#eps-0-target').fill('3:56')
 await page.locator('#eps-1-current').fill('5');await page.locator('#eps-1-target').fill('9')
 await page.locator('#eps-2-current').fill('8');await page.locator('#eps-2-target').fill('8')
 await page.locator('.eps-prep-sport').first().getByText('Barème et critères',{exact:true}).click()
 await page.getByLabel('Répartition AFL 2 / AFL 3').first().selectOption('6-2')
 await expect(page.locator('.eps-prep-sport').first()).toContainText('3’56')
 await page.getByRole('button',{name:'Créer ma fiche',exact:true}).click()
 await expect(page.locator('.eps-sheet-sport')).toHaveCount(3)
 await expect(page.locator('.eps-sheet-sport').first()).toContainText('14 s')
 await expect(page.locator('.eps-sheet-sport').first()).toContainText('AFL 2 · sur 6')
 await expect(page.locator('.eps-sheet-sport').nth(1)).toContainText('Prochain repère à essayer : 6 /10')
 await expect(page.locator('.eps-sheet-sport').nth(2)).toContainText('Consolider les acquis')
 await page.emulateMedia({media:'print'});await page.pdf({path:info.outputPath('fiche-trio.pdf'),format:'A4'})
 await page.emulateMedia({media:'screen'});await page.reload()
 await expect(page.getByLabel('Sport 1',{exact:true})).toHaveValue('courses')
 await page.getByRole('button',{name:'Continuer',exact:true}).click();await expect(page.locator('#eps-0-current')).toHaveValue('4:10')
 expect(errors).toEqual([])
})
test('trio EPS : validation des champs, changement d’épreuve et refus des formats invalides',async({page})=>{
 await preparer(page,etatEleve());await page.goto('/#/sport-bac');await page.getByLabel('Homme',{exact:true}).check()
 for(const [n,id] of [[1,'courses'],[2,'natation-vitesse'],[3,'yoga']])await page.getByLabel(`Sport ${n}`,{exact:true}).selectOption(id)
 await page.getByRole('button',{name:'Continuer',exact:true}).click();await expect(page.getByRole('alert')).toContainText('trois champs différents')
 await page.getByLabel('Sport 2',{exact:true}).selectOption('badminton');await page.getByRole('button',{name:'Continuer',exact:true}).click()
 await page.locator('#eps-0-current').fill('3:99');await page.getByRole('button',{name:'Créer ma fiche',exact:true}).click()
 await expect(page.locator('#eps-0-current')).toHaveAttribute('aria-invalid','true');await expect(page.locator('.eps-sheet')).toHaveCount(0)
 await page.getByLabel('Épreuve',{exact:true}).selectOption('t180');await expect(page.locator('#eps-0-current')).toHaveValue('')
 await page.locator('.eps-prep-form').getByRole('button',{name:'Retour',exact:true}).click();await page.getByLabel('Sport 1',{exact:true}).selectOption('lancers');await page.getByRole('button',{name:'Continuer',exact:true}).click()
 await expect(page.getByText('Garçons 5 kg, filles 3 kg',{exact:true})).toBeVisible();await expect(page.locator('#eps-0-current')).toHaveValue('')
})
test('trio EPS : petit écran, clavier, contrastes et contrôles traduits',async({page},info)=>{
 await page.setViewportSize({width:320,height:568});await preparer(page,etatEleve({lang:'de'}));await page.goto('/#/sport-bac')
 await expect(page.getByRole('heading',{name:'Sport im Abitur',exact:true})).toBeVisible()
 await expect(page.getByLabel('Sportart 1',{exact:true})).toBeVisible()
 for(const dark of [false,true]){
  await page.evaluate(d=>document.documentElement.classList.toggle('dark',d),dark)
  await page.evaluate(()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{}))))
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  expect((await new AxeBuilder({page}).include('.eps-preparation').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([])
 }
 await page.screenshot({path:info.outputPath('trio-eps-mobile.png'),fullPage:true})
})
test('trio EPS : un autre compte sur le même navigateur ne retrouve pas le brouillon',async({page})=>{
 await preparer(page,etatEleve());await page.goto('/#/sport-bac');await choose(page)
 await page.locator('#eps-0-current').fill('3:40')
 await page.reload();await expect(page.getByLabel('Sport 1',{exact:true})).toHaveValue('courses')
 const switchAccount=async id=>{
  await page.evaluate(uid=>{
   const state=JSON.parse(localStorage.getItem('stmg_progress_v2'));state.account={...state.account,id:uid};localStorage.setItem('stmg_progress_v2',JSON.stringify(state))
   const session=JSON.parse(localStorage.getItem('stmg_session'));session.user={...session.user,id:uid};localStorage.setItem('stmg_session',JSON.stringify(session))
   const access=JSON.parse(localStorage.getItem('stmg_acces')||'null');if(access){access.uid=uid;localStorage.setItem('stmg_acces',JSON.stringify(access))}
  },id);await page.reload()
 }
 await switchAccount('00000000-0000-4000-8000-000000000002')
 await expect(page.getByLabel('Sport 1',{exact:true})).toHaveValue('')
 await switchAccount('00000000-0000-4000-8000-000000000001')
 await expect(page.getByLabel('Sport 1',{exact:true})).toHaveValue('courses')
 await page.getByRole('button',{name:'Continuer',exact:true}).click();await expect(page.locator('#eps-0-current')).toHaveValue('3:40')
})
