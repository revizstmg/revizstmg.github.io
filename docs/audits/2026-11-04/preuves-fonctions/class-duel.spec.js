import {test,expect} from '@playwright/test'
import {preparer,etatEleve,attendreAccueil} from '../tests/parcours/eleve.js'
test('duel classe : un double clic ne doit pas créer deux duels',async({page},info)=>{
 await preparer(page,etatEleve({classCode:'stmg-abc23'}))
 const quiz={id:'quiz-synthetic',title:'Quiz de test audit',status:'published',class_code:'stmg-abc23',questions:[{q:'Question synthétique ?',choices:['Oui correct','Non'],answer:0}]}
 let posts=0;let releases=[]
 await page.route('https://*.supabase.co/rest/**',async r=>{
  const p=new URL(r.request().url()).pathname,m=r.request().method()
  if(p.endsWith('/class_quiz'))return r.fulfill({json:[quiz]})
  if(p.endsWith('/class_duel')&&m==='POST'){posts++;await new Promise(resolve=>releases.push(resolve));return r.fulfill({json:[{id:'duel-synthetic-'+posts}]})}
  return r.fulfill({json:[]})
 })
 await page.goto('./#/classe');await attendreAccueil(page)
 await page.locator('.class-menu-trigger').click();await page.getByRole('dialog').getByRole('button',{name:/Quiz et travail/}).click()
 await page.getByRole('button',{name:/Duels/,exact:false}).click()
 await page.getByRole('button',{name:/Lancer un duel/}).click()
 await page.getByRole('button',{name:/Quiz de test audit/}).click()
 await page.getByRole('button',{name:/Oui correct/}).click()
 const send=page.getByRole('button',{name:'Voir mon score',exact:true})
 await send.dblclick()
 await expect.poll(()=>posts).toBeGreaterThan(0)
 await page.waitForTimeout(200)
 const observed=posts;releases.forEach(fn=>fn())
 await info.attach('double-envoi',{body:JSON.stringify({posts:observed}),contentType:'application/json'})
 expect(observed).toBe(1)
})
