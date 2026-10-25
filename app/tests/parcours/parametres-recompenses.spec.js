import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {preparer,etatEleve,attendreAccueil,etat} from './eleve.js'
const uid='00000000-0000-4000-8000-000000000001'
test('session absente : invitation à se reconnecter sans requête sociale anonyme',async({page})=>{
 const errors=await preparer(page);const social=[]
 page.on('request',r=>{if(/rest\/v1\/(class_|friend_|leaderboard|rpc\/revizstmg_ligue)/.test(r.url()))social.push(r.url())})
 await page.goto('./#/accueil');await attendreAccueil(page)
 await page.evaluate(()=>{localStorage.removeItem('stmg_session');window.dispatchEvent(new Event('stmg-session-change'))})
 for(const path of ['classe','amis','classement']){await page.goto('./#/'+path);await expect(page.getByRole('heading',{name:'Reconnecte-toi',exact:true})).toBeVisible()}
 expect(social).toEqual([]);await page.getByRole('button',{name:'Me reconnecter',exact:true}).click();await expect(page.getByRole('dialog').getByRole('button',{name:'Se connecter',exact:true})).toBeVisible();expect(errors).toEqual([])
})
for(const theme of ['light','dark'])test('paramètres : photo, mot de passe, accessibilité et données '+theme,async({page},info)=>{
 const errors=await preparer(page,etatEleve({theme,profile:{firstName:'Léa',lastName:'Test',photo:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9h0AAAAASUVORK5CYII='}}));const updates=[]
 await page.route('**/*.supabase.co/**',route=>{const req=route.request(),u=new URL(req.url());if(req.method()==='PUT'&&u.pathname==='/auth/v1/user'){updates.push({password:req.postDataJSON().password});return route.fulfill({json:{id:uid}})}if(req.method()==='POST'&&u.pathname==='/rest/v1/profiles'){updates.push(req.postDataJSON()[0]);return route.fulfill({json:req.postDataJSON()})}if(req.method()==='GET'&&u.pathname==='/rest/v1/profiles')return route.fulfill({json:[]});return route.abort('blockedbyclient')})
 await page.setViewportSize({width:320,height:780});await page.goto('./#/parametres');await attendreAccueil(page)
 await expect(page.getByRole('heading',{name:'Paramètres',exact:true})).toBeVisible();await page.getByRole('link',{name:'Mon compte',exact:true}).click();await page.getByRole('link',{name:'Mon profil',exact:true}).click();await page.getByRole('button',{name:'Supprimer ma photo',exact:true}).click();await page.getByLabel('Prénom',{exact:true}).fill('Inès');await page.getByRole('button',{name:'Enregistrer mon profil',exact:true}).click();await expect(page.locator('main').getByRole('status').first()).toContainText('Profil enregistré.');expect(updates.some(x=>x.photo===null&&x.name==='Inès Test')).toBe(true);expect((await etat(page)).profile.photo).toBeUndefined()
 await page.goto('./#/parametres?rubrique=compte&reglage=securite');await attendreAccueil(page)
 await page.getByLabel('Nouveau mot de passe',{exact:true}).fill('Nouveau123');await page.getByLabel('Confirmer le mot de passe',{exact:true}).fill('Autre123');await page.getByRole('button',{name:'Changer mon mot de passe',exact:true}).click();await expect(page.getByRole('alert')).toHaveText('Les deux mots de passe doivent être identiques.');expect(updates.filter(x=>x.password)).toHaveLength(0)
 await page.getByLabel('Confirmer le mot de passe',{exact:true}).fill('Nouveau123');await page.getByRole('button',{name:'Changer mon mot de passe',exact:true}).click();await expect(page.locator('main').getByRole('status').first()).toContainText('Mot de passe modifié.');expect(updates.filter(x=>x.password)).toEqual([{password:'Nouveau123'}]);await expect(page.getByLabel('Nouveau mot de passe',{exact:true})).toHaveValue('')
 await page.goto('./#/parametres?rubrique=accessibilite');await attendreAccueil(page)
 await page.getByRole('checkbox',{name:/Grand texte/}).check();await expect(page.locator('html')).toHaveClass(/a11y-big/);await page.getByRole('checkbox',{name:/Grand texte/}).uncheck()
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
 expect((await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([])
 await page.screenshot({path:info.outputPath('parametres-'+theme+'.png'),fullPage:true});await page.goto('./#/parametres?rubrique=compte&reglage=profil');await page.reload();await attendreAccueil(page);await expect(page.getByLabel('Prénom',{exact:true})).toHaveValue('Inès');await expect(page.getByRole('img',{name:'Photo de profil',exact:true})).toHaveCount(0);expect(errors).toEqual([])
})
test('appui prolongé tactile : déplacement, annulation et ordre conservé',async({page})=>{
 await preparer(page);await page.setViewportSize({width:390,height:844});await page.goto('./#/parametres?rubrique=apparence&reglage=onglets');await attendreAccueil(page)
 const cookie=page.getByRole('button',{name:'OK',exact:true});if(await cookie.isVisible())await cookie.click()
 await page.evaluate(()=>document.fonts.ready)
 const handle=page.getByRole('button',{name:'Déplacer Accueil',exact:true});await handle.evaluate(el=>el.scrollIntoView({block:'center'}));await page.evaluate(()=>new Promise(requestAnimationFrame));const box=await handle.boundingBox();const target=await page.locator('[data-tab-id="revision"]').boundingBox();const client=await page.context().newCDPSession(page),x=box.x+box.width/2,y=box.y+box.height/2
 await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await page.waitForTimeout(400);for(let i=1;i<=6;i++){await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y+(target.y+target.height/2-y)*i/6}]});await page.evaluate(()=>new Promise(requestAnimationFrame))}await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})
 await expect.poll(async()=>(await etat(page)).tabs).toEqual(['cours','revision','accueil','bacblanc','profil']);await page.reload();await attendreAccueil(page);expect((await etat(page)).tabs).toEqual(['cours','revision','accueil','bacblanc','profil'])
 const cancelHandle=page.getByRole('button',{name:'Déplacer Cours',exact:true});await cancelHandle.scrollIntoViewIfNeeded();const b=await cancelHandle.boundingBox();const saved=(await etat(page)).tabs;await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x+b.width/2,y:b.y+b.height/2}]});await page.waitForTimeout(400);await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:b.x+b.width/2,y:b.y+b.height+35}]});await client.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});expect((await etat(page)).tabs).toEqual(saved);expect(await page.locator('.navigation-tabs-editor li').evaluateAll(rows=>rows.map(row=>row.dataset.tabId))).toEqual(saved)
 await page.getByRole('button',{name:'Déplacer Cours',exact:true}).focus();await page.keyboard.press('ArrowDown');expect((await etat(page)).tabs[0]).toBe('revision')
})
test('récompense utile : collecte unique, vrai PDF et objets existants conservés',async({page})=>{
 const errors=await preparer(page,etatEleve({xp:6500,freezes:0,chapters:Object.fromEntries(Array.from({length:10},(_,i)=>['theme'+i,{quiz:90}]))}));await page.goto('./#/boutique');await attendreAccueil(page)
 const card=page.getByRole('article',{name:'Ton pack objectif bac',exact:true});await card.getByRole('button',{name:'Débloquer mon lot',exact:true}).click();expect((await etat(page)).freezes).toBe(5)
 const file=page.waitForEvent('download');await card.getByRole('button',{name:'Télécharger mon kit PDF',exact:true}).click();expect((await file).suggestedFilename()).toBe('revizstmg-kit-bac.pdf');await page.reload();await attendreAccueil(page);await expect(card.getByRole('button',{name:'Télécharger mon kit PDF',exact:true})).toBeVisible();expect((await etat(page)).freezes).toBe(5);expect(errors).toEqual([])
})

test('réviser : accès à toutes les matières à la place de la liste À réviser',async({page})=>{
 await preparer(page,etatEleve({chapters:{'droit-t5':{worked:true,quiz:50,games:{qcm:50}}}}));await page.goto('./#/revision');await attendreAccueil(page)
 await expect(page.getByRole('heading',{name:'Toutes les matières',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'À réviser',exact:true})).toHaveCount(0)
 await page.getByRole('link',{name:'Choisir ma matière',exact:false}).click();await expect(page).toHaveURL(/#\/cours$/);await expect(page.getByRole('link',{name:/Management/})).toBeVisible()
})
