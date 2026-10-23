import { test,expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { preparer,attendreAccueil } from './eleve.js'
const ID='00000000-0000-4000-8000-000000000001'
test('tuteur : reformulations, contexte borné et isolation par chapitre',async({page})=>{
 const errors=await preparer(page)
 await page.addInitScript(id=>localStorage.setItem('stmg_session',JSON.stringify({token:'test',refresh:'r',expires_at:9999999999,user:{id}})),ID)
 const requests=[]
 await page.route('https://*.supabase.co/**',async route=>{
  const url=new URL(route.request().url())
  const reply=data=>route.fulfill({contentType:'application/json',body:JSON.stringify(data)})
  if(url.pathname.endsWith('/examen-blanc')){
   const b=route.request().postDataJSON();requests.push(b)
   return reply({tutor:{reply:`Explication différente ${requests.length}. Quelle étape te bloque ?`}})
  }
  if(url.pathname.endsWith('/profiles'))return reply([{id:ID,role:'eleve',name:'Léa Test',level:'terminale-stmg',specialty:'gestion-finance',progress:{}}])
  return reply([])
 })
 await page.goto('./#/subject/maths/theme/math-c3/chapter/0');await attendreAccueil(page)
 await page.getByText('Je n’ai pas compris · Tuteur IA',{exact:true}).click()
 const panel=page.locator('[data-course-tutor]')
 for(let i=0;i<12;i++){
  await panel.getByRole('button',{name:'Plus simplement',exact:true}).click()
  await expect(panel.getByText(`Explication différente ${i+1}. Quelle étape te bloque ?`,{exact:true})).toBeVisible()
 }
 expect(requests).toHaveLength(12)
 expect(requests.every(r=>r.action==='tutor'&&r.course.id==='math-c3::0'&&r.messages.length<=19)).toBe(true)
 expect(requests.at(-1).messages).toHaveLength(19)
 expect(requests.at(-1).messages[0].role).toBe('user')
 expect((await new AxeBuilder({page}).include('[data-course-tutor]').analyze()).violations).toEqual([])
 await page.goto('./#/subject/maths/theme/math-c3/chapter/1')
 await page.getByText('Je n’ai pas compris · Tuteur IA',{exact:true}).click()
 await expect(page.getByRole('log')).not.toContainText('Explication différente')
 expect(errors).toEqual([])
})
test('service indisponible : message conservé et aucun faux échange',async({page})=>{
 await preparer(page)
 await page.addInitScript(id=>localStorage.setItem('stmg_session',JSON.stringify({token:'test',refresh:'r',expires_at:9999999999,user:{id}})),ID)
 await page.route('**/functions/v1/examen-blanc',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'provider_unavailable'})}))
 await page.goto('./#/subject/maths/theme/math-c3/chapter/0');await attendreAccueil(page)
 await page.getByText('Je n’ai pas compris · Tuteur IA',{exact:true}).click()
 await page.getByLabel('Qu’est-ce qui te bloque ?').fill('Je ne comprends pas la dérivée.')
 await page.getByRole('button',{name:'Envoyer au tuteur'}).click()
 await expect(page.getByRole('alert')).toContainText('momentanément indisponible')
 await expect(page.getByLabel('Qu’est-ce qui te bloque ?')).toHaveValue('Je ne comprends pas la dérivée.')
 await expect(page.getByRole('log')).toHaveText('')
})
