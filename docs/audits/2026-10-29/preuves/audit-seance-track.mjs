import {chromium} from '/workspace/revizstmg.github.io/app/node_modules/playwright/index.mjs'
import {preparer,etatEleve,attendreAccueil} from '/workspace/work/audit-apprentissage/app/tests/parcours/eleve.js'
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:390,height:844}})
const q={q:'Quel compte enregistre la TVA collectée ?',choices:['44571','512','607','401'],answer:0,exp:'La TVA collectée est enregistrée au compte 44571.'}
const errors=await preparer(page,etatEleve({track:{level:'premiere-stmg'},erreurs:[{id:'qcm|'+q.q,themeId:'gf-t1',type:'qcm',q,boite:0,due:'2026-01-01',le:'2026-01-01'}]}))
await page.goto('http://127.0.0.1:4175/#/seance');await attendreAccueil(page)
console.log('QUESTION',await page.locator('[data-exercice]').innerText());console.log('ERRORS',errors)
await page.screenshot({path:'/workspace/work/audit-seance-hors-filiere.png'})
await browser.close()
