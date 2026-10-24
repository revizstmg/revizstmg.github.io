import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {preparer,attendreAccueil} from './eleve.js'
test('sans JavaScript : accueil réel, matières, chapitre complet et sources',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),page=await context.newPage();const scripts=[];page.on('request',r=>{if(r.resourceType()==='script')scripts.push(r.url())})
 await page.goto('http://localhost:4173/');await expect(page.getByRole('heading',{name:'Révision du bac STMG',exact:true})).toBeVisible();await page.getByRole('link',{name:'Lire les cours sans inscription',exact:true}).click();await expect(page.getByRole('heading',{name:'Cours du bac STMG',exact:true})).toBeVisible()
 await page.locator('a[href="/cours/terminale/droit/"]').click();await page.locator('.chapitres a').first().click();await expect(page.locator('article.cours')).toBeVisible();expect((await page.locator('article.cours').innerText()).length).toBeGreaterThan(200);await expect(page.getByRole('heading',{name:'Sources et vérification'})).toBeVisible();await expect(page.getByRole('link',{name:/Éduscol/})).toHaveAttribute('href',/eduscol\.education\.gouv\.fr/);expect(scripts).toEqual([])
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await context.close()
})
for(const theme of ['light','dark'])test('pages publiques : charte, accessibilité et retour aux exercices '+theme,async({page},info)=>{
 await preparer(page);await page.emulateMedia({colorScheme:theme});await page.setViewportSize({width:320,height:780});await page.goto('./cours/terminale/droit/');await page.locator('.chapitres a').first().click()
 await expect(page.locator('article.cours')).toBeVisible();const canonical=await page.locator('link[rel=canonical]').getAttribute('href');expect(canonical).toContain('https://revizstmg.github.io/cours/terminale/droit/')
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:info.outputPath('cours-public-'+theme+'.png'),fullPage:true})
 const target=await page.getByRole('link',{name:'Faire les exercices',exact:true}).getAttribute('href');await page.getByRole('link',{name:'Faire les exercices',exact:true}).click();await attendreAccueil(page);expect(new URL(page.url()).hash).toBe(target.slice(1));await expect(page.locator('main h1').first()).toBeVisible()
})
test('guide de langue public : PDF actuel et vidéos, sans ancien cours archivé',async({page})=>{
 await preparer(page);await page.goto('./cours/langues/de/');await expect(page.getByRole('heading',{name:'Cours d’allemand',exact:true})).toBeVisible();const pdf=page.getByRole('link',{name:'Ouvrir le guide PDF Allemand',exact:true});await expect(pdf).toHaveAttribute('href','/cours/langues/guide-de.pdf');const response=await page.request.get('/cours/langues/guide-de.pdf');expect(response.status()).toBe(200);expect((await response.body()).subarray(0,4).toString()).toBe('%PDF');await page.getByText(/La bibliothèque vidéo/).click();expect(await page.locator('details a').count()).toBeGreaterThan(20)
})
test('fiche déjà consultée : disponible hors ligne avec son contenu et sa propre adresse',async({page,context})=>{
 await preparer(page);await page.goto('./#/accueil');await attendreAccueil(page);await page.waitForFunction(()=>!!navigator.serviceWorker?.controller,null,{timeout:30000});await page.goto('./cours/terminale/droit/');await page.locator('.chapitres a').first().click();const url=page.url(),title=await page.locator('h1').innerText();await page.waitForFunction(async()=>!!(await caches.match(location.href)))
 await context.setOffline(true);await page.reload();await expect(page.locator('h1')).toHaveText(title);expect(page.url()).toBe(url);await expect(page.locator('article.cours')).toBeVisible();await context.setOffline(false)
})
