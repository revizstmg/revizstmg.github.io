import { test,expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { preparer,attendreAccueil } from './eleve.js'
const ID='00000000-0000-4000-8000-000000000001'
async function setup(page){
 const errors=await preparer(page)
 await page.addInitScript(id=>localStorage.setItem('stmg_session',JSON.stringify({token:'test',refresh:'r',expires_at:9999999999,user:{id}})),ID)
 return errors
}
test('question rédigée : barème, note, reprise, autre question et isolement chapitre',async({page})=>{
 const errors=await setup(page),requests=[]
 await page.route('https://*.supabase.co/**',async route=>{
  const url=new URL(route.request().url()),reply=data=>route.fulfill({contentType:'application/json',body:JSON.stringify(data)})
  if(url.pathname.endsWith('/examen-blanc')){
   const b=route.request().postDataJSON();requests.push(b)
   return reply({control:b.step==='prepare'?{question:'Explique la méthode de dérivation et justifie chaque étape.',correction:'Réponse complète de référence.',criteria:Array.from({length:5},(_,i)=>({notion:`Notion ${i+1}`,expected:`Attendu ${i+1}`,source:b.course.text.slice(0,100)}))}:{points:5,feedback:'Le raisonnement est partiellement expliqué.',criteria:Array.from({length:5},(_,index)=>({index,points:index<3?1:0,feedback:'Justification et conseil pour cette notion.'}))}})
  }
  if(url.pathname.endsWith('/profiles'))return reply([{id:ID,role:'eleve',name:'Léa Test',level:'terminale-stmg',specialty:'gestion-finance',progress:{}}])
  return reply([])
 })
 await page.goto('./#/subject/maths/theme/math-c3/chapter/0');await attendreAccueil(page)
 await page.getByRole('button',{name:'Questions type de contrôle →',exact:true}).click()
 const panel=page.locator('[data-chapter-control]')
 await panel.getByRole('button',{name:'Créer une question',exact:true}).click()
 const answer=panel.getByLabel('Ta réponse rédigée')
 await expect(answer).toBeVisible()
 await expect(panel.getByText('Réponse complète de référence.',{exact:true})).not.toBeVisible()
 await answer.fill('Je calcule la dérivée puis je justifie son signe.')
 await panel.getByRole('button',{name:'Corriger ma réponse',exact:true}).click()
 await expect(panel.getByRole('heading',{name:'Note indicative · 3/5'})).toBeVisible()
 await expect(panel.getByText('Notion 1 · 1/1',{exact:true})).toBeVisible()
 await panel.getByText('Voir la réponse attendue',{exact:true}).click()
 await expect(panel.getByText('Réponse complète de référence.',{exact:true})).toBeVisible()
 await answer.fill('Je corrige mon raisonnement.')
 await expect(panel.getByRole('heading',{name:/Note indicative/})).toHaveCount(0)
 await panel.getByRole('button',{name:'Corriger ma réponse',exact:true}).click()
 await expect(panel.getByRole('heading',{name:'Note indicative · 3/5'})).toBeVisible()
 await panel.getByRole('button',{name:'Une autre question',exact:true}).click()
 await expect(answer).toHaveValue('')
 expect(requests.at(-1).previous).toHaveLength(1)
 expect(requests.every(r=>r.course.id==='math-c3::0'&&r.action==='control')).toBe(true)
 expect((await new AxeBuilder({page}).include('[data-chapter-control]').analyze()).violations).toEqual([])
 await page.goto('./#/subject/maths/theme/math-c3/chapter/1')
 await page.getByRole('button',{name:'Questions type de contrôle →',exact:true}).click()
 await expect(panel.getByRole('button',{name:'Créer une question',exact:true})).toBeVisible()
 expect(errors).toEqual([])
})
test('échec de correction : réponse conservée, aucune fausse note',async({page})=>{
 await setup(page)
 await page.route('**/functions/v1/examen-blanc',route=>{
  const b=route.request().postDataJSON()
  if(b.step==='correct')return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'provider_unavailable'})})
  return route.fulfill({contentType:'application/json',body:JSON.stringify({control:{question:'Explique la dérivation.',correction:'Correction.',criteria:Array.from({length:5},(_,i)=>({notion:`Notion ${i}`,expected:`Attendu ${i}`,source:b.course.text.slice(0,100)}))}})})
 })
 await page.goto('./#/subject/maths/theme/math-c3/chapter/0');await attendreAccueil(page)
 await page.getByRole('button',{name:'Questions type de contrôle →',exact:true}).click()
 const panel=page.locator('[data-chapter-control]')
 await panel.getByRole('button',{name:'Créer une question',exact:true}).click()
 await panel.getByLabel('Ta réponse rédigée').fill('Voici ma réponse à conserver.')
 await panel.getByRole('button',{name:'Corriger ma réponse',exact:true}).click()
 await expect(panel.getByRole('alert')).toContainText('Ta réponse est conservée')
 await expect(panel.getByLabel('Ta réponse rédigée')).toHaveValue('Voici ma réponse à conserver.')
 await expect(panel.getByRole('heading',{name:/Note indicative/})).toHaveCount(0)
})
