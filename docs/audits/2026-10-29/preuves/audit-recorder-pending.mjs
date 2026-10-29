import {chromium} from '/workspace/revizstmg.github.io/app/node_modules/playwright/index.mjs'
import {preparer,etatEleve,attendreAccueil} from '/workspace/work/audit-apprentissage/app/tests/parcours/eleve.js'
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1280,height:900}})
const errors=await preparer(page,etatEleve())
await page.addInitScript(()=>{window.__mic=[];Object.defineProperty(navigator.mediaDevices,'getUserMedia',{value:()=>new Promise(resolve=>{window.__resolveMic=()=>resolve({getTracks:()=>[{stop(){window.__mic.push('track-stop')}}]})})});window.MediaRecorder=class{constructor(){this.state='inactive';this.mimeType='audio/webm'} start(){this.state='recording';window.__mic.push('rec-start')} stop(){this.state='inactive';window.__mic.push('rec-stop');this.onstop?.()}}})
await page.goto('http://127.0.0.1:4175/#/grand-oral');await attendreAccueil(page)
await page.getByRole('button',{name:/M'entraîner à l'oral/}).click()
await page.getByRole('button',{name:/^⏺ Enregistrer$/}).click()
await page.evaluate(()=>location.hash='#/accueil');await page.locator('.home-simple').waitFor()
await page.evaluate(()=>window.__resolveMic());await page.waitForTimeout(200)
console.log('ROUTE',page.url());console.log('MIC',await page.evaluate(()=>window.__mic));console.log('ERRORS',errors)
await browser.close()
