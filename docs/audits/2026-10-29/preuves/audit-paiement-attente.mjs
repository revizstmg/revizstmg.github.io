import {chromium} from '/workspace/revizstmg.github.io/app/node_modules/playwright/index.mjs'
import {preparer,etatEleve} from '/workspace/work/audit-comptes-main/app/tests/parcours/eleve.js'
const browser=await chromium.launch(),page=await browser.newPage()
const errors=await preparer(page,etatEleve())
await page.route('**/functions/v1/revizstmg-paiement',()=>new Promise(()=>{}))
await page.goto('http://localhost:5192/#/offres')
await page.getByText('Chargement des offres…',{exact:true}).waitFor()
await page.waitForTimeout(17000)
console.log(JSON.stringify({seconds:17,busy:await page.locator('section[aria-busy="true"]').count(),loading:await page.getByText('Chargement des offres…',{exact:true}).isVisible(),paymentRetry:await page.locator('section[aria-busy="true"]').getByRole('button').count(),errors}))
await browser.close()
