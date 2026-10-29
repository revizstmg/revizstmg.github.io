import {chromium} from '/workspace/revizstmg.github.io/app/node_modules/playwright/index.mjs'
import {preparer,etatEleve} from '/workspace/work/audit-comptes-main/app/tests/parcours/eleve.js'
const browser=await chromium.launch(),context=await browser.newContext(),page=await context.newPage()
const errors=await preparer(page,etatEleve()),calls=[]
const B='00000000-0000-4000-8000-000000000002'
await page.route('**/functions/v1/revizstmg-paiement',r=>{
 const token=r.request().headers().authorization;calls.push(token)
 return r.fulfill({contentType:'application/json',body:JSON.stringify({mode:'test',abonnement:{offre:token.includes('audit-token-B')?'ultimate':'premium',periode:'mensuel',statut:'active',periode_fin:new Date(Date.now()+86400000*20).toISOString()}})})
})
await page.route('**/rest/v1/profiles**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(r.request().method()==='GET'?[{id:B,name:'Élève Audit B',role:'eleve',level:'terminale-stmg',specialty:'gestion-finance',progress:{}}]:[])}))
// Aucun profil valide au démarrage ne doit remplacer A par le profil B avant la bascule.
await page.unroute('**/rest/v1/profiles**')
await page.goto('http://localhost:5193/#/offres')
await page.getByText('Offre active',{exact:true}).waitFor()
const before=await page.locator('section[aria-labelledby="abo-titre"]').innerText()
await page.route('**/rest/v1/profiles**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(r.request().method()==='GET'?[{id:B,name:'Élève Audit B',role:'eleve',level:'terminale-stmg',specialty:'gestion-finance',progress:{}}]:[])}))
const tab=await context.newPage();await tab.goto('http://localhost:5193/favicon.png')
await tab.evaluate(B=>{
 const p=JSON.parse(localStorage.getItem('stmg_progress_v2'));p.account={id:B,email:'b@example.invalid',role:'eleve'};p.profile={firstName:'Élève',lastName:'Audit B'}
 localStorage.setItem('stmg_progress_v2',JSON.stringify(p))
 localStorage.setItem('stmg_session',JSON.stringify({token:'audit-token-B',refresh:'audit-refresh-B',expires_at:9999999999,user:{id:B,email:'b@example.invalid'}}))
},B)
await page.waitForFunction(B=>JSON.parse(localStorage.getItem('stmg_progress_v2')).account.id===B,B)
await page.waitForTimeout(1200)
const after=await page.locator('section[aria-labelledby="abo-titre"]').innerText()
await page.screenshot({path:'/workspace/work/audit-abonnement-compte.png'})
console.log(JSON.stringify({activeAccount:await page.evaluate(()=>JSON.parse(localStorage.getItem('stmg_progress_v2')).account.id),before,after,calls,errors},null,2))
await browser.close()
