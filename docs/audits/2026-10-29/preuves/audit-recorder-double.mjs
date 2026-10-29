import {chromium} from '/workspace/revizstmg.github.io/app/node_modules/playwright/index.mjs'
import {preparer,etatEleve,attendreAccueil} from '/workspace/work/audit-apprentissage/app/tests/parcours/eleve.js'
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1280,height:900}})
const errors=await preparer(page,etatEleve())
await page.addInitScript(()=>{window.__mic=[];window.__pending=[];let id=0;Object.defineProperty(navigator.mediaDevices,'getUserMedia',{value:()=>new Promise(resolve=>{const n=++id;window.__pending.push(()=>resolve({id:n,getTracks:()=>[{stop(){window.__mic.push('track-stop-'+n)}}]}))})});window.MediaRecorder=class{constructor(stream){this.id=stream.id;this.state='inactive';this.mimeType='audio/webm'} start(){this.state='recording';window.__mic.push('rec-start-'+this.id)} stop(){this.state='inactive';window.__mic.push('rec-stop-'+this.id);this.onstop?.()}}})
await page.goto('http://127.0.0.1:4175/#/grand-oral');await attendreAccueil(page)
await page.getByRole('button',{name:/M'entraîner à l'oral/}).click()
await page.getByRole('button',{name:/^⏺ Enregistrer$/}).click()
await page.getByRole('button',{name:/^⏺ Enregistrer$/}).click()
console.log('PENDING',await page.evaluate(()=>window.__pending.length))
await page.evaluate(()=>window.__pending.forEach(resolve=>resolve()));await page.waitForTimeout(100)
await page.getByRole('button',{name:/^⏹ Arrêter$/}).click();await page.waitForTimeout(100)
console.log('ROUTE',page.url());console.log('MIC',await page.evaluate(()=>window.__mic));console.log('ERRORS',errors)
await browser.close()
