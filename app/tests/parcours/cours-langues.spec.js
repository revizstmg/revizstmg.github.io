import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {preparer,etatEleve,attendreAccueil,etat} from './eleve.js'
for(const [sid,track] of [['langues',{level:'terminale-stmg',specialty:'gestion-finance'}],['p1-langues',{level:'premiere-stmg'}]]) {
 test(`${sid} : guides PDF, quatre langues, anciennes routes et mobile accessibles`,async({page},info)=>{
  const errors=await preparer(page,etatEleve({track,studyLanguages:['ar','it']}))
  await page.goto(`./#/subject/${sid}`);await attendreAccueil(page)
  await expect(page.getByRole('heading',{name:'Ose prendre la parole.'})).toBeVisible()
  await expect(page.getByRole('button',{name:/Arabe/})).toHaveAttribute('aria-pressed','true')
  for(const [lang,name] of [['en','Anglais'],['es','Espagnol'],['it','Italien'],['ar','Arabe']]) {
   await page.getByRole('button',{name:new RegExp(name)}).click()
   const open=page.getByRole('link',{name:/Ouvrir le guide PDF/})
   await expect(open).toHaveAttribute('href',new RegExp(`guide-${lang}.*pdf`))
   const pdf=await page.request.get(await open.getAttribute('href'))
   expect(pdf.ok()).toBe(true)
   expect((await pdf.body()).subarray(0,5).toString()).toBe('%PDF-')
   await expect(page.getByRole('link',{name:/Télécharger le PDF/})).toHaveAttribute('download',`RevizSTMG-guide-${lang}.pdf`)
   expect(await page.locator('.language-resources a').count()).toBe(3)
  }
  for(const dark of [false,true]) {
   await page.evaluate(d=>document.documentElement.classList.toggle('dark',d),dark)
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true)
   expect((await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([])
   await page.screenshot({path:info.outputPath(`langues-${dark?'sombre':'clair'}.png`),fullPage:true})
  }
  await page.setViewportSize({width:1280,height:900})
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true)
  await page.screenshot({path:info.outputPath('langues-ordinateur.png'),fullPage:true})
  await page.goto(`./#/subject/${sid}/theme/lng-ar-gram/chapter/0`)
  await expect(page.getByRole('heading',{name:'Ose prendre la parole.'})).toBeVisible()
  await expect(page.locator('.reader')).toHaveCount(0)
  await page.goto('./#/revision')
  await page.getByRole('button',{name:'Commencer la séance',exact:true}).click()
  await expect(page.getByLabel('Matière',{exact:true}).locator(`option[value="${sid}"]`)).toHaveCount(0)
  expect((await etat(page)).studyLanguages).toEqual(['ar','it'])
  expect(errors).toEqual([])
 })
}
