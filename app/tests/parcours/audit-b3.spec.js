import { test, expect } from '@playwright/test'
import { preparer, etatEleve, attendreAccueil } from './eleve.js'

test('le minuteur conserve le décompte en pause après rechargement sans XP gratuit', async ({page}) => {
 const errors=await preparer(page)
 await page.goto('./#/coach');await attendreAccueil(page)
 await page.getByRole('button',{name:/Démarrer/}).first().click()
 await expect(page.getByRole('button',{name:/Pause/}).first()).toBeVisible()
 await page.waitForTimeout(1400)
 const before=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('stmg_focus_session_v1:00000000-0000-4000-8000-000000000001')))
 expect(before.remaining).toBeLessThan(1500)
 await page.reload()
 await expect(page.getByRole('button',{name:/Reprendre/}).first()).toBeVisible()
 const after=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('stmg_focus_session_v1:00000000-0000-4000-8000-000000000001')))
 expect(after.remaining).toBeLessThanOrEqual(before.remaining)
 expect(after.remaining).toBeGreaterThan(before.remaining-10)
 expect(after.endsAt).toBeNull();expect(after.cycles).toBe(before.cycles)
 expect(errors).toEqual([])
})

test('les badges disponibles suivent la filière sans supprimer les anciens',async({page})=>{
 const errors=await preparer(page,etatEleve({track:{level:'premiere-stmg'},badges:['gestion_pro']}))
 await page.goto('./#/badges');await attendreAccueil(page)
 await expect(page.getByRole('heading',{name:'Badges de tes anciens parcours'})).toBeVisible()
 await expect(page.getByText('Maîtriser le Thème 2 de Gestion et Finance (analyse financière).')).toHaveCount(0)
 expect(errors).toEqual([])
})

test('atelier : filtre explicite du niveau et programme de la filière par défaut',async({page})=>{
 const errors=await preparer(page,etatEleve({track:{level:'premiere-stmg'}}))
 await page.goto('./#/atelier-formules');await attendreAccueil(page)
 await expect(page.getByLabel('Programme affiché')).toHaveValue('track')
 await page.getByLabel('Niveau',{exact:true}).selectOption('terminale')
 await expect(page.getByText(/0 \/ 0 formules disponibles/)).toBeVisible()
 await page.getByLabel('Programme affiché').selectOption('all')
 await expect(page.getByText(/0 \/ 0 formules disponibles/)).toHaveCount(0)
 expect(errors).toEqual([])
})

test('petits écrans : les cartes de révision ne débordent pas en français et en arabe',async({page})=>{
 await page.setViewportSize({width:320,height:740})
 const errors=await preparer(page)
 await page.goto('./#/revision');await attendreAccueil(page)
 for(const lang of ['fr','ar']){
  if(lang==='ar'){
   await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('stmg_progress_v2'));s.lang='ar';localStorage.setItem('stmg_progress_v2',JSON.stringify(s))})
   await page.reload();await expect(page.locator('html')).toHaveAttribute('dir','rtl')
  }
  await expect(page.locator('.revision-method').first()).toBeVisible()
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1)
  for(const button of await page.locator('.revision-method-action').all())expect((await button.boundingBox()).width).toBeLessThanOrEqual(288)
 }
 expect(errors).toEqual([])
})

test('CGU : traduction complète intégrée, sans service externe',async({page})=>{
 const calls=[];page.on('request',r=>{if(/mymemory|translate.googleapis/.test(r.url()))calls.push(r.url())})
 const errors=await preparer(page,etatEleve({lang:'de'}))
 await page.goto('./#/cgu');await attendreAccueil(page)
 await expect(page.locator('main')).not.toContainText('Ces conditions encadrent')
 await page.waitForTimeout(1000)
 expect(calls).toEqual([]);expect(errors).toEqual([])
})

test('le consentement photo garde une cible visible sur petit écran',async({page})=>{
 await page.setViewportSize({width:320,height:740})
 const errors=await preparer(page)
 await page.goto('./#/mes-notes');await attendreAccueil(page)
 await page.getByText('Déposer mon sujet et ma copie',{exact:true}).first().click()
 const consent=page.getByRole('checkbox',{name:/J’autorise leur envoi/}).first()
 await expect(consent).toBeVisible()
 const rect=await consent.boundingBox();expect(rect.width).toBeGreaterThanOrEqual(20);expect(rect.height).toBeGreaterThanOrEqual(20)
 await consent.check();await expect(consent).toBeChecked()
 expect(errors).toEqual([])
})

test('professeur : aucun niveau élève ou badge dans Mon espace',async({page})=>{
 const errors=await preparer(page,etatEleve({account:{id:'audit-prof',role:'prof'},xp:12345}))
 await page.goto('./#/moi');await attendreAccueil(page)
 await expect(page.getByText('Niveau par matière',{exact:true})).not.toBeVisible()
 await expect(page.getByRole('heading',{name:/Mes badges/})).not.toBeVisible()
 await expect(page.getByText('Mes classes',{exact:true})).toBeVisible()
 expect(errors).toEqual([])
})

test('un essai efface seulement ses données locales même avec une ancienne session',async({page})=>{
 const errors=await preparer(page,etatEleve({account:null}))
 await page.addInitScript(()=>{if(!window.name.includes('__b3_old_session__')){window.name+='__b3_old_session__';localStorage.setItem('stmg_session',JSON.stringify({token:'ancien-jeton-fictif',user:{id:'ancien-compte'},expires_at:9999999999}))}})
 const deletions=[];page.on('request',r=>{if(r.url().includes('revizstmg_supprimer_compte'))deletions.push(r.url())})
 await page.goto('./#/parametres?rubrique=donnees&reglage=suppression');await attendreAccueil(page)
 page.on('dialog',d=>d.accept())
 await page.getByRole('button',{name:'Effacer mes données locales',exact:true}).click()
 await expect.poll(()=>page.evaluate(()=>localStorage.getItem('stmg_session'))).toBeNull()
 await expect(page).not.toHaveURL(/suppression/)
 expect(deletions).toEqual([])
 expect(errors).toEqual([])
})
