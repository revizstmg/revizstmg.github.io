import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {preparer,etatEleve,etat,attendreAccueil} from './eleve.js'
const axe=async page=>{
 await page.evaluate(()=>Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{}))))
 expect((await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([])
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true)
}
async function setup(page){
 await page.goto('./#/vacances');await attendreAccueil(page)
 await expect(page.getByRole('heading',{name:'Deux semaines pour retravailler tes difficultés, à ton rythme.'})).toBeVisible()
 await page.getByRole('combobox',{name:'Matière',exact:true}).selectOption('droit')
 for(let i=0;i<3;i++){
  if(i)await page.getByRole('button',{name:'Ajouter un chapitre'}).click()
  const select=page.getByRole('combobox',{name:`Chapitre ${i+1}`,exact:true})
  await expect(select).toBeVisible({timeout:60000})
  await select.selectOption({index:1})
 }
 await page.getByRole('button',{name:'Commencer mon bilan',exact:true}).click()
}
async function play(page,phase,{one=false,wrong=false}={}){
 while(await page.locator('[data-vacances-question]').count()){
  const id=await page.locator('[data-vacances-question]').getAttribute('data-vacances-question'),p=(await etat(page)).parcours.vacances
  const qs=phase==='initial'?p.initialQuestions:phase==='final'?p.finalQuestions:p.sessions[phase].questions
  const q=qs.find(q=>q.id===id)
  await page.locator('.vacances-choice').nth(wrong?(q.answer+1)%q.choices.length:q.answer).click()
  await expect(page.getByRole('status').filter({hasText:wrong?'À retravailler':'Bonne réponse'})).toBeVisible()
  if(one)return
  await page.getByRole('button',{name:/^(Question suivante|Terminer)$/,exact:true}).click()
 }
}
test('vacances : parcours entier, reprise, bilans distincts et séances adaptatives',async({page},info)=>{
 test.setTimeout(180000)
 const errors=await preparer(page,etatEleve());await setup(page)
 await play(page,'initial',{one:true,wrong:true})
 await page.reload();await attendreAccueil(page)
 await page.getByRole('button',{name:'Reprendre mon bilan',exact:true}).click()
 await play(page,'initial',{wrong:true})
 await expect(page.getByRole('heading',{name:'Mon programme',exact:true})).toBeVisible()
 const p=(await etat(page)).parcours.vacances
 expect(p.initialQuestions.every(q=>!p.finalQuestions.some(f=>f.q===q.q))).toBe(true)
 await axe(page)
 for(let i=0;i<8;i++){
  await page.getByRole('button',{name:'Commencer ma séance',exact:true}).click()
  await expect(page.getByRole('heading',{name:'Comprendre avant de répondre'})).toBeVisible()
  if(i===0){await axe(page);await page.screenshot({path:info.outputPath('seance.png'),fullPage:false})}
  await page.getByRole('button',{name:'Passer aux exercices',exact:true}).click()
  await play(page,i)
 }
 await page.getByRole('button',{name:'Faire mon bilan final',exact:true}).click();await play(page,'final')
 await expect(page.getByText('8 séances terminées sur 8',{exact:true})).toBeVisible()
 await expect(page.locator('.vacances-scores')).toContainText('0 %')
 await expect(page.locator('.vacances-scores')).toContainText('100 %')
 await page.reload();await attendreAccueil(page)
 await expect(page.getByRole('link',{name:'Continuer après les vacances'})).toBeVisible()
 await axe(page);expect(errors).toEqual([])
})
test('vacances : petit écran, sombre, allemand et liens vers les réglages parents',async({page})=>{
 const errors=await preparer(page,etatEleve({lang:'de'}))
 await page.setViewportSize({width:320,height:740});await page.goto('./#/vacances');await attendreAccueil(page)
 await expect(page.getByRole('heading',{name:'Zwei Wochen, um in deinem Tempo an Schwierigkeiten zu arbeiten.'})).toBeVisible()
 for(const dark of [false,true]){await page.evaluate(d=>document.documentElement.classList.toggle('dark',d),dark);await axe(page)}
 await page.getByRole('link',{name:'Elternfreigabe verwalten'}).click()
 await expect(page).toHaveURL(/reglage=parents/)
 await expect(page.getByRole('switch')).toHaveCount(1)
 expect(errors).toEqual([])
})
test('vacances : aucun partage sans accord et résumé sans réponses privées après activation',async({page})=>{
 const errors=await preparer(page,etatEleve())
 const published=[]
 await page.route(/supabase\.co/,async route=>{
  const request=route.request(),url=new URL(request.url())
  if(url.pathname.endsWith('/child_stats')&&request.method()==='POST')published.push(request.postDataJSON()[0])
  await route.fulfill({status:200,contentType:'application/json',body:'[]'})
 })
 await setup(page);await play(page,'initial')
 await page.waitForTimeout(3300);expect(published).toEqual([])
 await page.getByRole('link',{name:'Gérer le partage parent'}).click()
 await page.getByRole('switch',{name:/Partager ma progression/}).click()
 await expect.poll(()=>published.length).toBeGreaterThan(0)
 const summary=published.at(-1).subjects.find(s=>s.vacances).vacances
 expect(summary).toMatchObject({done:0,total:8,initial:100,final:null})
 expect(Object.keys(summary).sort()).toEqual(['date','done','final','initial','total'])
 await page.getByRole('switch',{name:/Partager ma progression/}).click()
 const before=published.length
 await page.goto('./#/vacances');await page.getByRole('button',{name:'Commencer ma séance'}).click();await page.getByRole('button',{name:'Passer aux exercices'}).click();await play(page,0)
 await page.waitForTimeout(3300);expect(published.length).toBe(before);expect(errors).toEqual([])
})
test('vacances : entrée depuis Réviser, programme et remplacement volontaire',async({page})=>{
 const errors=await preparer(page,etatEleve())
 await page.goto('./#/revision');await attendreAccueil(page)
 await page.getByRole('link',{name:'Préparer mes vacances'}).click();await setup(page);await play(page,'initial')
 const old=(await etat(page)).parcours.vacances.id
 page.once('dialog',d=>d.dismiss());await page.getByRole('button',{name:'Préparer un autre parcours'}).click()
 expect((await etat(page)).parcours.vacances.id).toBe(old)
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Préparer un autre parcours'}).click()
 await expect(page.getByRole('heading',{name:'Construire mon parcours'})).toBeVisible()
 await page.getByRole('button',{name:'Retour au parcours'}).click()
 await expect(page.getByRole('heading',{name:'Mon programme'})).toBeVisible();expect(errors).toEqual([])
})

test('vacances : présentation accessible aux parents sans compte ni filière',async({page})=>{
 const errors=await preparer(page,null)
 await page.goto('./#/vacances');await attendreAccueil(page)
 await expect(page.getByRole('heading',{name:'Vacances STMG',exact:true})).toBeVisible()
 await expect(page.getByRole('link',{name:'Essayer sans compte'})).toBeVisible()
 await expect(page.getByText('Ce parcours et son bilan sont accessibles pendant la phase de développement. Aucun paiement ni abonnement n’est ouvert ici.')).toBeVisible()
 await axe(page);expect(errors).toEqual([])
})
