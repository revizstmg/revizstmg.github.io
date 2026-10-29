import {chromium} from '/workspace/revizstmg.github.io/app/node_modules/playwright/index.mjs'
import {preparer,etatEleve} from '/workspace/work/audit-comptes-main/app/tests/parcours/eleve.js'
const browser=await chromium.launch()
const page=await browser.newPage({viewport:{width:1280,height:900}})
const errors=await preparer(page,etatEleve())
let pending,seen
const seenPromise=new Promise(r=>seen=r)
await page.route('**/functions/v1/revizstmg-paiement',async route=>{
 const b=route.request().postDataJSON()
 if(b.action==='etat')return route.fulfill({contentType:'application/json',body:JSON.stringify({mode:'test',abonnement:null})})
 if(b.action==='checkout'){pending=route;seen();return}
 return route.fulfill({contentType:'application/json',body:'{}'})
})
await page.route('https://checkout.stripe.audit/**',r=>r.fulfill({contentType:'text/html',body:'<h1>Page de paiement synthétique du compte A</h1>'}))
await page.goto('http://localhost:5193/#/offres')
await page.getByRole('checkbox',{name:/18 ans/}).check()
await page.getByRole('button',{name:/Mensuel : 9,99/}).click()
await seenPromise
const sentAs=await page.evaluate(()=>JSON.parse(localStorage.getItem('stmg_session')).user.id)
// Une déconnexion dans un autre onglet déclenche cet événement de stockage.
await page.evaluate(()=>{
 const old=localStorage.getItem('stmg_session');localStorage.removeItem('stmg_session')
 window.dispatchEvent(new StorageEvent('storage',{key:'stmg_session',oldValue:old,newValue:null,storageArea:localStorage}))
})
await page.getByText('Connecte-toi avec ton compte pour choisir une offre.',{exact:true}).waitFor()
await page.screenshot({path:'/workspace/work/audit-paiement-deconnecte.png'})
await pending.fulfill({contentType:'application/json',body:JSON.stringify({url:'https://checkout.stripe.audit/compte-A'})})
await page.waitForURL('https://checkout.stripe.audit/compte-A')
console.log(JSON.stringify({sentAs,sessionAtRedirect:await page.evaluate(()=>localStorage.getItem('stmg_session')),url:page.url(),errors}))
await browser.close()
