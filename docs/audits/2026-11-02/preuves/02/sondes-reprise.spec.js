import {test,expect} from '@playwright/test';
import {preparer,etatEleve,attendreAccueil} from './eleve.js';
const ME='00000000-0000-4000-8000-000000000001',OTHER='00000000-0000-4000-8000-000000000002';
const root='/workspace/work/audit10-20261102/preuves-02/';
async function social(page){
 const errors=await preparer(page,etatEleve(),{abonnement:null});
 const server={requests:[{id:'req1',from_device:OTHER,to_device:ME,from_name:'Noé Synthétique',from_code:'NOE234',status:'pending'}],fail:false,writes:[],duels:[]};
 await page.route('https://*.supabase.co/rest/**',async r=>{const req=r.request(),u=new URL(req.url()),p=u.pathname,m=req.method(),json=(body,status=200)=>r.fulfill({status,json:body});
 if(p.endsWith('/profiles'))return json([{id:ME,name:'Léa Synthétique',role:'eleve',level:'terminale-stmg',specialty:'gestion-finance',progress:{}}]);
 if(p.endsWith('/friend_user'))return json(m==='GET'?[{device_id:OTHER,name:'Noé Synthétique',code:'NOE234',xp:12}]:[{code:'LEA234'}]);
 if(p.endsWith('/rpc/revizstmg_trouver_ami'))return json([{device_id:OTHER,name:'Noé Synthétique'}]);
 if(p.endsWith('/friend_request')){
  if(m==='PATCH'){server.writes.push({m,body:req.postDataJSON()});if(server.fail)return json({message:'panne synthétique'},503);server.requests[0].status=req.postDataJSON().status;return json([]);}
  if(m==='DELETE'){server.writes.push({m});server.requests=[];return json([]);}
  if(m==='POST'){server.writes.push({m,body:req.postDataJSON()});return json([]);}
  const status=u.searchParams.get('status')?.slice(3);return json(server.requests.filter(x=>!status||x.status===status).filter(x=>!u.searchParams.has('from_device')||x.from_device===ME));
 }
 if(p.endsWith('/friend_duel')){if(m==='PATCH'||m==='DELETE'){server.writes.push({m,body:req.postDataJSON()});return server.fail?json({message:'panne synthétique'},503):json([]);}return json(u.searchParams.get('status')==='eq.pending'&&u.searchParams.has('b_device')?server.duels:[]);}
 return json([]);
 });
 return {errors,server};
}
test('nouveau : ami gratuit acceptation en erreur puis reprise et retrait',async({page})=>{
 const {errors,server}=await social(page);await page.goto('./#/amis');await attendreAccueil(page);
 server.fail=true;await page.getByRole('button',{name:/Accepter/}).click();
 await expect(page.locator('main')).toContainText('Ta demande n’a pas été confirmée');expect(server.requests[0].status).toBe('pending');
 server.fail=false;await page.getByRole('button',{name:/Accepter/}).click();
 await expect(page.getByRole('button',{name:'Retirer',exact:true})).toBeVisible();
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Retirer',exact:true}).click();
 await expect(page.getByRole('button',{name:'Retirer',exact:true})).toHaveCount(0);expect(server.requests).toEqual([]);await page.getByRole('textbox',{name:'Ajouter un ami',exact:true}).fill('noe234');await page.getByRole('button',{name:'Envoyer',exact:true}).click();await expect.poll(()=>server.writes.some(x=>x.m==='POST')).toBe(true);expect(server.writes.find(x=>x.m==='POST').body[0]).toMatchObject({from_device:ME,to_device:OTHER,status:'pending'});expect(errors).toEqual([]);
});
test('sonde : échec acceptation duel doit être visible dans onglet Duels',async({page},info)=>{
 const {server}=await social(page);server.duels=[{id:'duel-probe',a_device:OTHER,b_device:ME,a_name:'Noé Synthétique',status:'pending',chapter_label:'Contrat synthétique',questions:[{q:'Test ?',choices:['Oui','Non'],answer:0}]}];server.fail=true;
 await page.goto('./#/amis');await attendreAccueil(page);await page.getByRole('button',{name:/Duels/}).click();
 await page.getByRole('button',{name:/Relever/}).click();await expect.poll(()=>server.writes.length).toBe(1);
 await page.waitForTimeout(300);await page.screenshot({path:root+'duel-erreur-reproduction.png'});
 const before=await page.locator('main').innerText();await page.getByRole('button',{name:/🤝.*Amis/}).click();const after=await page.locator('main').innerText();
 await info.attach('etat-erreur',{body:JSON.stringify({writes:server.writes,duels:before,amis:after},null,2),contentType:'application/json'});
 expect(after).toContain('Ta demande n’a pas été confirmée');expect(before).toContain('Ta demande n’a pas été confirmée');
});
test('nouveau : mur erreur 503 garde texte puis publie sans HTML actif',async({page})=>{
 const errors=await preparer(page,etatEleve({classCode:'stmg-abc23'}),{abonnement:null});let fail=true,items=[],writes=[];
 await page.route('https://*.supabase.co/rest/**',async r=>{const req=r.request(),p=new URL(req.url()).pathname;if(p.endsWith('/class_wall')){if(req.method()==='POST'){writes.push(req.postDataJSON());if(fail)return r.fulfill({status:503,json:{}});items=[{id:'wall1',...req.postDataJSON()[0]}];}return r.fulfill({json:items});}return r.fulfill({json:[]});});
 await page.goto('./#/classe');await attendreAccueil(page);await page.locator('.class-menu-trigger').click();await page.getByRole('dialog').getByRole('button',{name:/Échanges/}).click();
 const text='Question synthétique <img src=x onerror="window.__xss=1"> sur le contrat.';await page.getByRole('textbox').fill(text);
 await page.getByRole('button',{name:'Publier',exact:true}).click();await expect(page.getByRole('alert')).toBeVisible();await expect(page.getByRole('textbox')).toHaveValue(text);
 fail=false;await page.getByRole('button',{name:'Publier',exact:true}).click();await expect(page.getByRole('textbox')).toHaveValue('');await expect(page.locator('main')).toContainText(text);expect(await page.evaluate(()=>window.__xss)).toBeUndefined();expect(writes.length).toBe(2);expect(errors).toEqual([]);await page.screenshot({path:root+'mur-reprise.png'});
});
test('nouveau : classement et ligue panne puis reprise compte premium',async({page})=>{
 const errors=await preparer(page,etatEleve({classCode:'stmg-abc23'}));let fail=true;
 await page.route('https://*.supabase.co/rest/**',async r=>{const p=new URL(r.request().url()).pathname;if(p.endsWith('/leaderboard')&&r.request().method()==='GET')return r.fulfill(fail?{status:503,json:{}}:{json:[{device_id:ME,name:'Léa Synthétique',courses:4}]});if(p.endsWith('/rpc/revizstmg_ligue'))return r.fulfill(fail?{status:503,json:{}}:{json:[{code:'stmg-a•••',members:2,total:8}]});return r.fulfill({json:[]});});
 await page.goto('./#/classement');await attendreAccueil(page);await expect(page.locator('main').getByRole('button',{name:'Réessayer',exact:true})).toBeVisible();fail=false;await page.locator('main').getByRole('button',{name:'Réessayer',exact:true}).click();await expect(page.locator('main')).toContainText('Léa Synthétique');fail=true;await page.getByRole('button',{name:/Ligue/}).click();await expect(page.locator('main').getByRole('button',{name:'Réessayer',exact:true})).toBeVisible();fail=false;await page.locator('main').getByRole('button',{name:'Réessayer',exact:true}).click();await expect(page.locator('main')).toContainText('stmg-a•••');expect(errors).toEqual([]);await page.screenshot({path:root+'ligue-reprise.png'});
});
