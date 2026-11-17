import {test,expect} from '/workspace/work/fix-economie-audits/app/node_modules/@playwright/test/index.mjs'
import {writeFileSync} from 'node:fs'
import {preparer,etatEleve,attendreAccueil,etat} from '/workspace/output/bugs-cibles-20261116/eleve.js'
const file={name:'cours-synthetique.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j6QAAAABJRU5ErkJggg==','base64')}
const raw='DOSSIER PRIVÉ SYNTHÉTIQUE A. La performance financière mesure les résultats économiques obtenus. Rentabilité : les profits rapportés aux moyens engagés. Comment améliorer durablement cette performance financière ?'
async function setup(page){
 await preparer(page);await page.addInitScript(()=>{window.revoked=[];const original=URL.revokeObjectURL.bind(URL);URL.revokeObjectURL=u=>{revoked.push(u);original(u)}})
 await page.goto('./#/fiches-photo');await attendreAccueil(page)
}
for(const cached of [true,false])test(`brouillon après changement de compte : ${cached?'copie B disponible':'contrôle sans copie B'}`,async({page})=>{
 await setup(page);await page.locator('input[type=file]').setInputFiles(file)
 await page.getByPlaceholder('Titre de la fiche (optionnel)').fill('DOSSIER_A_SYNTHETIQUE');await page.locator('textarea').fill(raw)
 await page.getByRole('button',{name:/Générer ma fiche de révision/}).click();await expect(page.getByRole('button',{name:/Enregistrer la fiche/})).toBeVisible()
 const image=await page.locator('img[alt="Page 1"]').getAttribute('src'),B='00000000-0000-4000-8000-000000000002'
 await page.route('https://*.supabase.co/rest/**',r=>{const q=r.request(),u=new URL(q.url());if(u.pathname.endsWith('/profiles')&&q.method()==='GET'&&u.searchParams.get('id')===`eq.${B}`)return r.fulfill({json:[{id:B,name:'Bob Audit',role:'eleve',level:'terminale-stmg',specialty:'gestion-finance',progress:etatEleve({profile:{firstName:'Bob',lastName:'Audit'},xp:500})}]});return r.fulfill({json:[]})})
 await page.evaluate(({B,cached,progress})=>{
  localStorage.setItem('stmg_acces',JSON.stringify({uid:B,ligne:{statut:'active',offre:'premium',periode_fin:'2999-01-01T00:00:00Z',mode_test:true},verifieLe:Date.now()}))
  if(cached)localStorage.setItem('stmg_progress_v2',JSON.stringify(progress))
  const old=localStorage.getItem('stmg_session'),next=JSON.stringify({token:'jeton-B-fictif',refresh:'r',expires_at:9999999999,user:{id:B,email:'b@test.fr'}});localStorage.setItem('stmg_session',next);window.dispatchEvent(new StorageEvent('storage',{key:'stmg_session',oldValue:old,newValue:next}))
 },{B,cached,progress:etatEleve({account:{id:B,email:'b@test.fr',role:'eleve'},profile:{firstName:'Bob',lastName:'Audit'},xp:500})})
 await expect.poll(async()=>(await etat(page)).account?.id).toBe(B)
 if(cached){
  await expect(page.locator('textarea')).toHaveValue(raw);await expect(page.getByPlaceholder('Titre de la fiche (optionnel)')).toHaveValue('DOSSIER_A_SYNTHETIQUE')
  expect(await page.locator('img[alt="Page 1"]').getAttribute('src')).toBe(image)
  await page.getByRole('button',{name:/Enregistrer la fiche/}).click();await expect.poll(async()=>(await etat(page)).fiches?.length||0).toBe(1)
  expect((await etat(page)).fiches[0].text).toBe(raw)
 }else{
  await page.goto('./#/fiches-photo');await attendreAccueil(page);await expect(page.locator('textarea')).toHaveValue('');await expect(page.locator('img[alt="Page 1"]')).toHaveCount(0);expect((await etat(page)).fiches?.length||0).toBe(0)
 }
 const report={cached,account:(await etat(page)).account.id,sourceImage:image,raw:await page.locator('textarea').inputValue(),fiches:(await etat(page)).fiches||[],revoked:await page.evaluate(()=>revoked)}
 writeFileSync(`/workspace/output/audit-fiches-20261117/compte-${cached?'copie':'sans-copie'}.json`,JSON.stringify(report,null,2));await page.screenshot({path:`/workspace/output/audit-fiches-20261117/compte-${cached?'copie':'sans-copie'}.png`})
})
test('quitter trois fois la page : URLs des trois images encore lisibles',async({page})=>{
 await setup(page);const urls=[]
 for(let i=0;i<3;i++){
  if(i){await page.goto('./#/fiches-photo');await attendreAccueil(page)}
  await page.locator('input[type=file]').setInputFiles(file);urls.push(await page.locator('img[alt="Page 1"]').getAttribute('src'))
  await page.goto('./#/accueil');await expect(page.locator('.home-simple')).toBeVisible()
 }
 const report=await page.evaluate(async urls=>({urls,revoked,readable:await Promise.all(urls.map(async url=>{try{return(await fetch(url)).status}catch{return'error'}}))}),urls)
 expect(report.readable).toEqual([200,200,200]);for(const url of urls)expect(report.revoked).not.toContain(url)
 writeFileSync('/workspace/output/audit-fiches-20261117/ressources.json',JSON.stringify(report,null,2))
})
for(const action of ['Retirer','Tout recommencer'])test(`contrôle : ${action} révoque bien l’image`,async({page})=>{
 await setup(page);await page.locator('input[type=file]').setInputFiles(file);const url=await page.locator('img[alt="Page 1"]').getAttribute('src')
 await page.getByRole('button',{name:new RegExp(action)}).click();await expect(page.locator('img[alt="Page 1"]')).toHaveCount(0)
 expect(await page.evaluate(()=>revoked)).toContain(url)
 expect(await page.evaluate(async u=>{try{return(await fetch(u)).status}catch{return'error'}},url)).toBe('error')
})
