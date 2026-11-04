import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {preparer,etatEleve} from './eleve.js'
test('EPS : catalogue, filtres et entraînement adapté imprimable',async({page},info)=>{
 await preparer(page,etatEleve(),{abonnement:'premium'});await page.goto('/#/cours')
 await page.getByRole('link',{name:/Sport au bac/}).click();await page.getByRole('button',{name:'Référentiel détaillé',exact:true}).click();await page.getByRole('button',{name:/Les 26 activités/}).click()
 await expect(page.getByRole('heading',{name:'Prépare ton épreuve'})).toBeVisible()
 await expect(page.locator('.eps-activities button')).toHaveCount(26)
 await page.getByLabel('Rechercher une activité').fill('sauvetage');await expect(page.locator('.eps-activities button')).toHaveCount(1)
 await page.locator('.eps-activities button').click();await expect(page.locator('#eps-current')).toContainText('Sauvetage aquatique')
 await page.getByRole('button',{name:'Créer mon programme'}).click()
 await expect(page.locator('.eps-week')).toHaveCount(4);await expect(page.locator('.eps-session')).toHaveCount(8)
 await expect(page.locator('.eps-plan')).toContainText('À sec, décrire le protocole d’alerte')
 await expect(page.locator('.eps-plan')).not.toContainText('En bassin, répéter')
 await page.getByLabel('Durée d’une séance').selectOption('20');await expect(page.locator('.eps-plan')).toHaveCount(0)
 await page.getByRole('button',{name:'Créer mon programme'}).click();await expect(page.locator('.eps-plan')).toContainText('20 min')
 await page.emulateMedia({media:'print'});await expect(page.locator('.eps-print')).toBeHidden();await expect(page.locator('.eps-plan')).toBeVisible();await page.pdf({path:info.outputPath('programme-eps.pdf'),format:'A4'})
})
test('EPS : barèmes ponctuels séparés du CCF et palier exact du 800 m',async({page})=>{
 await preparer(page,etatEleve(),{abonnement:'premium'});await page.goto('/#/sport-bac');await page.getByRole('button',{name:'Référentiel détaillé',exact:true}).click();await page.getByRole('button',{name:/Les 26 activités/}).click()
 await page.getByText('Repères nationaux du CA 1',{exact:true}).click()
 await expect(page.getByRole('table')).toContainText('3 min 08 s')
 await page.getByRole('button',{name:'Examen ponctuel',exact:true}).click();await expect(page.locator('.eps-activities button')).toHaveCount(3)
 await page.getByText('Tableau de performance du 800 m',{exact:true}).click()
 await page.getByRole('combobox',{name:'Tableau',exact:true}).selectOption('boys');await page.getByLabel('Minutes',{exact:true}).fill('2');await page.getByLabel('Secondes',{exact:true}).fill('32')
 await expect(page.locator('.eps-page [role=status]')).toContainText('10/10. Ce n’est pas la note finale')
 await page.getByLabel('Secondes',{exact:true}).fill('61');await expect(page.locator('.eps-page [role=status]')).toContainText('Saisis un temps valide')
 await page.getByRole('button',{name:/Danse/}).click();await expect(page.locator('.eps-score')).toContainText('Projet artistique')
 await expect(page.getByRole('link',{name:/Ouvrir le référentiel/})).toHaveAttribute('href','/eps/referentiel-ponctuel-2026.pdf')
})
test('EPS : petit écran, mode sombre et recherche vide',async({page})=>{
 await page.setViewportSize({width:320,height:568});await preparer(page,etatEleve({theme:'dark'}),{abonnement:'premium'});await page.goto('/#/sport-bac');await page.getByRole('button',{name:'Référentiel détaillé',exact:true}).click();await page.getByRole('button',{name:/Les 26 activités/}).click()
 await page.getByLabel('Rechercher une activité').fill('introuvable');await expect(page.locator('.eps-page [role=status]')).toContainText('Aucune activité')
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
 await page.getByLabel('Rechercher une activité').fill('');await page.getByLabel('Champ d’apprentissage').selectOption('5');await expect(page.locator('.eps-activities button')).toHaveCount(5)
})

test('EPS : contrôles traduits hors ligne et contraste dans les deux thèmes',async({page},info)=>{
 await preparer(page,etatEleve({lang:'de'}),{abonnement:'premium'});await page.goto('/#/sport-bac');await page.getByRole('button',{name:'Ausführlicher Bewertungsrahmen',exact:true}).click();await page.getByRole('button',{name:/Les 26 activités/}).click()
 await expect(page.getByRole('heading',{name:'Bereite dich auf die Prüfung vor'})).toBeVisible()
 await expect(page.getByRole('button',{name:'Trainingsplan erstellen'})).toBeVisible()
 for(const dark of [false,true]){
  await page.evaluate(d=>document.documentElement.classList.toggle('dark',d),dark)
  await page.evaluate(()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{}))))
  expect((await new AxeBuilder({page}).include('.eps-page').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([])
 }
 await page.screenshot({path:info.outputPath('eps-mobile.png'),fullPage:true})
})
