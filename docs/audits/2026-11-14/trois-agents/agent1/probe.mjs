import { chromium } from '/workspace/work/audit-global-20261109-1/app/node_modules/playwright/index.mjs';
import { preparer, etatEleve } from '/workspace/work/audit-global-20261109-1/app/tests/parcours/eleve.js';
import fs from 'node:fs';
const out='/workspace/output/audit-global-20261109/agent1';const b=await chromium.launch({headless:true});const results=[];
{
const p=await b.newPage();await preparer(p,null);await p.clock.install();let gets=0;
await p.route('**/auth/v1/token?*',r=>r.fulfill({json:{access_token:'fake',refresh_token:'fake-r',expires_in:3600,user:{id:'00000000-0000-4000-8000-000000000001',email:'lea@test.fr'}}}));
await p.route('**/rest/v1/profiles?*',r=>{gets++;});
await p.goto('http://127.0.0.1:4261/');await p.locator('#w-email').fill('lea@test.fr');await p.locator('#w-pass').fill('Faux-mot-de-passe123!');await p.getByRole('button',{name:'Se connecter',exact:true}).click();await p.waitForTimeout(150);await p.clock.runFor(65000);
results.push({case:'login_profile_silent',gets,buttons:await p.locator('button').evaluateAll(bs=>bs.map(b=>({text:b.innerText,disabled:b.disabled}))),text:(await p.locator('body').innerText()).slice(-1800)});await p.screenshot({path:out+'/login-silence.png'});await p.close();
}
{
const p=await b.newPage();await preparer(p,etatEleve());let patches=0;await p.route('**/rest/v1/**',r=>r.fulfill({json:[]}));await p.addInitScript(()=>{const orig=window.fetch;window.fetch=async(...a)=>{if(String(a[0]).includes('/rest/v1/profiles')&&a[1]?.method==='PATCH'){window.__patches=(window.__patches||0)+1;return {ok:true,status:200,json:()=>new Promise(()=>{})}}return orig(...a)}});
await p.goto('http://127.0.0.1:4261/#/parametres?rubrique=revision&reglage=examen');await p.clock.install();await p.getByLabel('Date de mon bac').fill('2027-06-15');await p.clock.runFor(65000);await p.getByLabel('Date de mon bac').fill('2027-06-16');await p.clock.runFor(65000);results.push({case:'save_body_silent',patches:await p.evaluate(()=>window.__patches||0),text:(await p.locator('body').innerText()).slice(-2200)});await p.screenshot({path:out+'/save-silence.png'});await p.close();
}
fs.writeFileSync(out+'/evidence.json',JSON.stringify(results,null,2));await b.close();
