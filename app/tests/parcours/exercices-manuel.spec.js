import {readFileSync} from 'node:fs'
import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {preparer,etatEleve,attendreAccueil} from './eleve.js'
const en=JSON.parse(readFileSync(new URL('../../resources/langues/en.json',import.meta.url)))

test('langues : les exercices du manuel se font sur le site, corrigés comme le PDF',async({page},info)=>{
 const errors=await preparer(page,etatEleve({track:{level:'premiere-stmg'},studyLanguages:['en']}))
 await page.goto('./#/subject/p1-langues');await attendreAccueil(page)
 await expect(page.getByRole('heading',{name:`${en.exercises.length} exercices à faire en ligne.`})).toBeVisible()
 // Exercice 1 : texte à trous, réponse « has worked ».
 const un=page.locator('#manuel-en-ex-001')
 await un.getByLabel(/Ta réponse à l’exercice 1/).fill('have worked')
 await un.getByRole('button',{name:'Vérifier'}).click()
 await expect(un.getByText('✗ Pas tout à fait')).toBeVisible()
 await expect(un.getByText('has worked').first()).toBeVisible()
 await un.getByRole('button',{name:'Refaire'}).click()
 await un.getByLabel(/Ta réponse à l’exercice 1/).fill('Has worked')
 await un.getByRole('button',{name:'Vérifier'}).click()
 await expect(un.getByText('✓ Juste')).toBeVisible()
 // QCM (exercice 8 du PDF).
 const qcm=page.locator('#manuel-en-ex-004')
 await qcm.getByRole('radio',{name:/went/}).click()
 await expect(qcm.getByText('✓ Juste')).toBeVisible()
 // Filtre par leçon.
 await page.getByLabel('Leçon').selectOption({index:2})
 expect(await page.locator('[id^="manuel-en-ex-"]').count()).toBeLessThan(en.exercises.length)
 await page.getByLabel('Leçon').selectOption('')
 await page.evaluate(() => Promise.all(document.getAnimations().map(a => a.finished.catch(() => {}))))
 expect((await new AxeBuilder({page}).include('#manuel-exercices').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([])
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true)
 await page.screenshot({path:info.outputPath('exercices-manuel.png'),fullPage:false})
 expect(errors).toEqual([])
})
