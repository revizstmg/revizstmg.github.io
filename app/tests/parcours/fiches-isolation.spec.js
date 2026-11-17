import {test,expect} from '@playwright/test'
import {preparer,etatEleve,attendreAccueil,etat} from './eleve.js'
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
 if(!cached){await page.goto('./#/fiches-photo');await attendreAccueil(page)}
 await expect(page.locator('textarea')).toHaveValue('')
 await expect(page.getByPlaceholder('Titre de la fiche (optionnel)')).toHaveValue('')
 await expect(page.locator('img[alt="Page 1"]')).toHaveCount(0)
 await expect(page.getByRole('button',{name:/Enregistrer la fiche/})).toHaveCount(0)
 expect((await etat(page)).fiches?.length||0).toBe(0)
 expect(await page.evaluate(()=>revoked)).toContain(image)
 const own='DOSSIER SYNTHÉTIQUE B. La trésorerie représente les fonds disponibles pour régler les dépenses. Comment calculer et suivre cette trésorerie ?'
 await page.getByPlaceholder('Titre de la fiche (optionnel)').fill('DOSSIER_B_SYNTHETIQUE');await page.locator('textarea').fill(own)
 await page.getByRole('button',{name:/Générer ma fiche de révision/}).click();await page.getByRole('button',{name:/Enregistrer la fiche/}).click()
 await expect.poll(async()=>(await etat(page)).fiches?.length||0).toBe(1)
 expect((await etat(page)).fiches[0].text).toBe(own)
})
test('quitter trois fois la page : chaque image temporaire est libérée',async({page})=>{
 await setup(page);const urls=[]
 for(let i=0;i<3;i++){
  if(i){await page.goto('./#/fiches-photo');await attendreAccueil(page)}
  await page.locator('input[type=file]').setInputFiles(file);urls.push(await page.locator('img[alt="Page 1"]').getAttribute('src'))
  await page.goto('./#/accueil');await expect(page.locator('.home-simple')).toBeVisible()
 }
 const report=await page.evaluate(async urls=>({urls,revoked,readable:await Promise.all(urls.map(async url=>{try{return(await fetch(url)).status}catch{return'error'}}))}),urls)
 expect(report.readable).toEqual(['error','error','error']);for(const url of urls)expect(report.revoked).toContain(url)
})
for(const action of ['Retirer','Tout recommencer'])test(`contrôle : ${action} révoque bien l’image`,async({page})=>{
 await setup(page);await page.locator('input[type=file]').setInputFiles(file);const url=await page.locator('img[alt="Page 1"]').getAttribute('src')
 await page.getByRole('button',{name:new RegExp(action)}).click();await expect(page.locator('img[alt="Page 1"]')).toHaveCount(0)
 expect(await page.evaluate(()=>revoked)).toContain(url)
 expect(await page.evaluate(async u=>{try{return(await fetch(u)).status}catch{return'error'}},url)).toBe('error')
})

test('ajouter et retirer : les prévisualisations conservées restent lisibles',async({page})=>{
 await setup(page);await page.locator('input[type=file]').setInputFiles([file,{...file,name:'deux.png'}])
 const first=await page.locator('img[alt="Page 1"]').getAttribute('src'),second=await page.locator('img[alt="Page 2"]').getAttribute('src')
 await page.getByRole('button',{name:'Retirer',exact:true}).first().click()
 await expect(page.locator('img[alt^="Page "]')).toHaveCount(1)
 expect(await page.locator('img[alt="Page 1"]').getAttribute('src')).toBe(second)
 await page.locator('input[type=file]').setInputFiles({...file,name:'trois.png'})
 await expect(page.locator('img[alt^="Page "]')).toHaveCount(2)
 const third=await page.locator('img[alt="Page 2"]').getAttribute('src')
 expect(await page.evaluate(async u=>(await fetch(u)).status,second)).toBe(200)
 expect(await page.evaluate(async u=>(await fetch(u)).status,third)).toBe(200)
 expect(await page.evaluate(()=>revoked)).toEqual([first])
 await page.goto('./#/accueil');await expect(page.locator('.home-simple')).toBeVisible()
 expect(await page.evaluate(()=>revoked)).toEqual([first,second,third])
})

test('ancienne session : un clic de sauvegarde ne modifie plus la progression',async({page})=>{
 await setup(page);await page.locator('textarea').fill(raw);await page.getByRole('button',{name:/Générer ma fiche de révision/}).click()
 await page.evaluate(()=>localStorage.setItem('stmg_session',JSON.stringify({token:'jeton-B-fictif',refresh:'r',expires_at:9999999999,user:{id:'00000000-0000-4000-8000-000000000002',email:'b@test.fr'}})))
 await page.getByRole('button',{name:/Enregistrer la fiche/}).click()
 expect((await etat(page)).fiches?.length||0).toBe(0)
 await expect(page.getByText('Fiche enregistrée ✅',{exact:true})).toHaveCount(0)
})

test('réponse vision retardée après départ : aucune ancienne fiche ne revient',async({page})=>{
 await setup(page);let release,calls=0,completed=false
 await page.route('**/functions/v1/fiche-vision',async route=>{calls++;await new Promise(r=>release=r);try { await route.fulfill({json:{fiche:{title:'ANCIENNE_FICHE_A',questions:['Question synthétique ancienne'],definitions:[],keyInfo:[]}}}) } catch (error) { if (!route.request().failure()) throw error } finally { completed=true }})
 await page.locator('input[type=file]').setInputFiles(file)
 await page.getByRole('button',{name:'Analyser la photo',exact:true}).click();await expect.poll(()=>calls).toBe(1)
 await page.goto('./#/accueil');await expect(page.locator('.home-simple')).toBeVisible();release();await expect.poll(()=>completed).toBe(true)
 await page.goto('./#/fiches-photo');await attendreAccueil(page)
 await expect(page.getByRole('heading',{name:'ANCIENNE_FICHE_A',exact:true})).toHaveCount(0)
 await expect(page.locator('img[alt^="Page "]')).toHaveCount(0)
 await expect(page.locator('textarea')).toHaveValue('')
})
