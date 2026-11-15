import {chromium} from '/workspace/work/audit-global-20261109-2/app/node_modules/playwright/index.mjs'
import {preparer,etatEleve,etat} from '/workspace/work/audit-global-20261109-2/app/tests/parcours/eleve.js'
import fs from 'node:fs'
const browser=await chromium.launch({headless:true});const out={}
try{
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'})
 const errors=await preparer(page,etatEleve({track:{level:'premiere-stmg'}}))
 await page.goto('http://127.0.0.1:4262/#/atelier-formules')
 await page.locator('main select').nth(0).selectOption('all')
 await page.locator('main select').nth(2).selectOption('terminale')
 const cb=page.locator('main input[type=checkbox]').first();await cb.check()
 out.formuleAvant={label:await cb.locator('..').innerText(),programme:await page.locator('main select').nth(0).inputValue(),niveau:await page.locator('main select').nth(2).inputValue(),stock:await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([k])=>k.includes('formula_session'))))}
 await page.reload()
 out.formuleApres={programme:await page.locator('main select').nth(0).inputValue(),niveau:await page.locator('main select').nth(2).inputValue(),texte:await page.locator('main').innerText()}
 await page.screenshot({path:'/workspace/output/audit-global-20261109/agent2/atelier-recharge.png',fullPage:false})
 fs.writeFileSync('/workspace/output/audit-global-20261109/agent2/atelier.json',JSON.stringify(out,null,2));out.errors=errors;await page.close()
 const audio=await browser.newPage({viewport:{width:320,height:568},reducedMotion:'reduce'})
 await preparer(audio,etatEleve({savedDecks:[{id:'audit-audio',title:'Audio audit',language:'fr',cards:[{front:'Une notion',back:'Sa définition'}]}]}))
 await audio.addInitScript(()=>{Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{cancel(){},speak(){throw new Error('Synthèse indisponible')},getVoices(){return []}}});window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}}})
 const errs=[];audio.on('pageerror',e=>errs.push(e.message))
 await audio.goto('http://127.0.0.1:4262/#/revision');await audio.getByRole('button',{name:'Révision audio',exact:true}).click()
 await audio.getByRole('button',{name:'Jouer',exact:true}).click()
 out.audio={errors:errs,dialog:await audio.getByRole('dialog',{name:'Audio audit',exact:true}).innerText(),buttons:await audio.getByRole('dialog',{name:'Audio audit',exact:true}).getByRole('button').allTextContents()}
 fs.writeFileSync('/workspace/output/audit-global-20261109/agent2/sondes.json',JSON.stringify(out,null,2))
 await audio.screenshot({path:'/workspace/output/audit-global-20261109/agent2/audio-erreur.png'})
}finally{await browser.close()}
