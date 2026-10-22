import {readFileSync} from 'node:fs'
import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {preparer,etatEleve,attendreAccueil,etat} from './eleve.js'
for(const [sid,track,prefix] of [['langues',{level:'terminale-stmg',specialty:'gestion-finance'},''],['p1-langues',{level:'premiere-stmg'},'p1-']]) {
 test(`${sid} : cours arabe/italien, exercices sauvegardés et révisions filtrées`,async({page},info)=>{
  const errors=await preparer(page,etatEleve({track,studyLanguages:['ar','it']}))
  await page.goto(`./#/subject/${sid}`);await attendreAccueil(page)
  await expect(page.getByRole('link',{name:/Arabe — Écriture et grammaire/})).toBeVisible()
  await expect(page.getByRole('link',{name:/Italien — Grammaire et conjugaison/})).toBeVisible()
  await expect(page.getByRole('link',{name:/Anglais —/})).toHaveCount(0)
  await expect(page.getByText(/cours.*à venir/)).toHaveCount(0)
  for(const lang of ['ar','it']) {
   const tid=`lng-${lang}-${prefix}gram`
   await page.goto(`./#/subject/${sid}/theme/${tid}/chapter/0`)
   await expect(page.locator('.reader')).toBeVisible()
   for(const dark of [false,true]) {
    await page.evaluate(d=>document.documentElement.classList.toggle('dark',d),dark)
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true)
    await page.screenshot({path:info.outputPath(`${lang}-${dark?'sombre':'clair'}.png`)})
   }
   await page.getByRole('button',{name:/Exercices/}).click()
   await page.locator(`[data-jeu="${tid}-s1-qcm"]`).click()
   await page.getByRole('button',{name:/Entraînement/}).click()
   const content=JSON.parse(readFileSync(new URL(`../../content/${sid}/matiere.json`,import.meta.url)))
   const questions=content.chapters.find(t=>t.id===tid).games[0].questions
   for(let i=0;i<questions.length;i++) {
    const prompt=await page.getByRole('heading',{level:3}).innerText()
    const question=questions.find(q=>q.q===prompt)
    expect(question).toBeTruthy()
    const right=question.choices[question.answer]
    await page.getByText(right,{exact:true}).click()
    await page.getByRole('button',{name:i+1===questions.length?/Voir mon score/:/^Question suivante/}).click()
   }
   await expect.poll(async()=>(await etat(page)).chapters?.[tid]?.games?.[`${tid}-s1-qcm`]).toBe(100)
   expect((await etat(page)).reussites.some(r=>r.themeId===tid)).toBe(true)
  }
  await page.goto('./#/revision')
  await page.getByRole('button',{name:'Commencer la séance',exact:true}).click()
  await page.getByLabel('Matière',{exact:true}).selectOption(sid)
  const options=await page.getByLabel('Chapitre (facultatif)',{exact:true}).locator('option').allTextContents()
  expect(options.some(x=>x.includes('Arabe —'))).toBe(true)
  expect(options.some(x=>x.includes('Italien —'))).toBe(true)
  expect(options.some(x=>/Anglais —|Espagnol —/.test(x))).toBe(false)
  expect((await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([])
  expect((await etat(page)).studyLanguages).toEqual(['ar','it'])
  expect(errors).toEqual([])
 })
}
