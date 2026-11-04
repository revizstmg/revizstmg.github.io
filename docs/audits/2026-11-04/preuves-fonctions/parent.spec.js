import {test,expect} from '@playwright/test';
import {preparer,attendreAccueil} from '../tests/parcours/eleve.js';
for(const run of [1,2])test('parent lié : lectures répétées sans action '+run,async({page},info)=>{
 await preparer(page);await page.addInitScript(()=>localStorage.setItem('stmg_parent_link','PTEST23456'));let reads=0;
 await page.route('**/rpc/revizstmg_stats_enfant',route=>{reads++;if(reads>20)return;return route.fulfill({json:[{name:'Enfant Synthétique Boucle',xp:42,subjects:[]}]})});
 await page.goto('./#/parent');await attendreAccueil(page);await expect.poll(()=>reads).toBeGreaterThanOrEqual(12);
 await info.attach('lectures-sans-action',{body:JSON.stringify({reads,cap:20,linked:await page.evaluate(()=>localStorage.getItem('stmg_parent_link'))}),contentType:'application/json'});await page.screenshot({path:info.outputPath('parent-boucle.png')});
});
