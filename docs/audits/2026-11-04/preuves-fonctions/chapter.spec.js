import {test,expect} from '@playwright/test'
import {preparer,etatEleve,etat} from '../tests/parcours/eleve.js'
test('index invalide : conserve le dernier thème valide',async({page},info)=>{
 await preparer(page,etatEleve({track:{level:'premiere-stmg'}}))
 await page.goto('./#/subject/p1-sgn/theme/p1-sgn-t1/chapter/1');await expect(page.locator('.course-studio')).toBeVisible()
 const before=(await etat(page)).lastChapter
 await page.goto('./#/subject/p1-sgn/theme/p1-sgn-t2/chapter/-1');await expect(page.getByRole('heading',{name:'Page introuvable'})).toBeVisible()
 const after=(await etat(page)).lastChapter
 await info.attach('marqueur',{body:JSON.stringify({before,after}),contentType:'application/json'})
 expect(after).toEqual(before)
})
