import {test,expect} from '@playwright/test'
import {preparer,etatEleve,attendreAccueil} from './eleve.js'
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

test('duel classe : résultat conservé et même identifiant au réessai',async({page})=>{
 await preparer(page,etatEleve({classCode:'stmg-abc23'}));const ids=[]
 const quiz={id:'00000000-0000-4000-8000-000000000004',title:'Duel à renvoyer',status:'published',class_code:'stmg-abc23',questions:[{q:'Question synthétique ?',choices:['Oui correct','Non'],answer:0}]}
 await page.route('https://*.supabase.co/rest/**',r=>{
  const p=new URL(r.request().url()).pathname
  if(p.endsWith('/class_quiz'))return r.fulfill({json:[quiz]})
  if(p.endsWith('/class_duel')&&r.request().method()==='POST'){
   const payload=r.request().postDataJSON()[0];ids.push(payload.id)
   return ids.length===1?r.fulfill({status:503,json:{}}):r.fulfill({json:[payload]})
  }
  return r.fulfill({json:[]})
 })
 await page.goto('/#/classe');await attendreAccueil(page);await page.locator('.class-menu-trigger').click();await page.getByRole('dialog').getByRole('button',{name:/Quiz et travail/}).click();await page.getByRole('button',{name:/Duels/}).click();await page.getByRole('button',{name:/Lancer un duel/}).click();await page.getByRole('button',{name:/Duel à renvoyer/}).click()
 await page.getByRole('button',{name:/Oui correct/}).click();await page.getByRole('button',{name:'Voir mon score',exact:true}).click()
 await expect(page.getByRole('alert')).toContainText('Ton résultat est conservé');await expect(page.locator('main')).toContainText('1 / 1')
 await page.locator('main').getByRole('button',{name:'Réessayer',exact:true}).click();await expect(page.getByRole('button',{name:/Lancer un duel/})).toBeVisible()
 expect(ids).toHaveLength(2);expect(ids[0]).toMatch(/^[a-f0-9-]{36}$/);expect(ids[1]).toBe(ids[0])
})
