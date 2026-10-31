import {test,expect} from '@playwright/test';
import {preparer,etatEleve,attendreAccueil,etat} from './eleve.js';
test('audit2: 320px toutes familles Terminale',async({page})=>{
 test.setTimeout(120000);
 const errors=await preparer(page,etatEleve({favorites:['gf-t1']}),{abonnement:'ultimate'});
 await page.setViewportSize({width:320,height:740});const overflows=[];
 for(const route of ['cours','favoris','revision','coach','coach-ia','fiches-photo','methodo','defi','moi','programme','parcours','vacances','bac-blanc','grand-oral','etude-de-gestion','mes-notes','parametres','amis','classe','boutique']){
  await page.goto('./#/'+route);await attendreAccueil(page);
  await expect(page.locator('main')).not.toBeEmpty();
  const width=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth}));
  console.log('ROUTE',route,JSON.stringify(width),await page.locator('h1').allTextContents());
  await expect(page.getByText('Une erreur inattendue',{exact:false})).toHaveCount(0);
  if(width.document>width.viewport+1)overflows.push({route,...width});
 }
 expect(errors).toEqual([]);expect(overflows).toEqual([]);
});
test('audit2: fiche personnelle texte et sauvegarde sans fournisseur',async({page})=>{
 const errors=await preparer(page,undefined,{abonnement:'ultimate'});
 await page.goto('./#/fiches-photo');await attendreAccueil(page);
 await page.getByPlaceholder('Titre de la fiche (optionnel)').fill('Audit synthétique');
 await page.locator('textarea').fill('La valeur ajoutée est la richesse créée par une entreprise. Elle se calcule en retirant les consommations intermédiaires du chiffre d’affaires.');
 await page.getByRole('button',{name:/Générer ma fiche de révision/}).click();
 await page.getByRole('button',{name:/Enregistrer la fiche/}).click();
 expect((await etat(page)).fiches.some(f=>f.title==='Audit synthétique')).toBe(true);
 await page.reload();await attendreAccueil(page);await expect(page.getByRole('heading',{name:/Mes fiches/})).toBeVisible();expect(errors).toEqual([]);
});
test('audit2: mauvaise association matiere theme apres chargement',async({page})=>{
 await preparer(page);
 await page.goto('./#/subject/maths/theme/math-c3/chapter/0');await attendreAccueil(page);
 await page.goto('./#/subject/gestion-finance/theme/math-c3/chapter/0');await attendreAccueil(page);
 console.log('MISMATCH',await page.locator('main').innerText());
 await page.screenshot({path:'/workspace/work/audit2-apprentissage-preuves/matiere-theme.png',fullPage:false});
 await expect(page.getByRole('heading',{name:'Page introuvable'})).toBeVisible();
});
test('audit2: cinq photos selectionnees et nombre envoye au fournisseur',async({page})=>{
 await preparer(page,undefined,{abonnement:'ultimate'});
 let sent=0;
 await page.route('**/functions/v1/fiche-vision',r=>{sent=r.request().postDataJSON().images.length;return r.fulfill({json:{fiche:{title:'Synthétique',questions:['Question synthétique'],keyInfo:[],definitions:[]}}});});
 await page.goto('./#/fiches-photo');await attendreAccueil(page);
 const buffer=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j6QAAAABJRU5ErkJggg==','base64');
 await page.locator('input[type=file]').setInputFiles(Array.from({length:5},(_,i)=>({name:`page-${i+1}.png`,mimeType:'image/png',buffer})));
 await expect(page.locator('img[alt^="Page "]')).toHaveCount(5);
 await page.getByRole('button',{name:'Analyser la photo',exact:true}).click();
 await expect.poll(()=>sent).toBeGreaterThan(0);
 console.log('PHOTO_COUNT',{selected:5,sent});
 await page.screenshot({path:'/workspace/work/audit2-apprentissage-preuves/photo-5-pages.png',fullPage:false});
 expect(sent).toBe(5);
});
test('audit2: export import flashcards aller retour Unicode',async({page})=>{
 const errors=await preparer(page,etatEleve({savedDecks:[{id:'unicode',title:'Économie العربية',cards:[{front:'Valeur ajoutée ?',back:'Richesse créée.'}]}]}));
 await page.goto('./#/revision');await attendreAccueil(page);
 await page.getByRole('button',{name:'Partager',exact:true}).click();
 const dialog=page.getByRole('dialog');const code=await dialog.locator('textarea').inputValue();expect(code.length).toBeGreaterThan(10);
 await dialog.getByRole('button',{name:'Quitter',exact:true}).click();
 await page.getByRole('button',{name:/Importer un paquet/}).click();
 await page.getByRole('textbox',{name:'Importer un paquet'}).fill(code);
 await page.getByRole('button',{name:'Importer',exact:true}).click();
 console.log('DECKS',JSON.stringify((await etat(page)).savedDecks));expect(errors).toEqual([]);
});
test('audit2: langues cinq PDF sans capture geante',async({page})=>{
 const errors=await preparer(page);
 for(const sid of ['langues','p1-langues']){
 await page.goto('./#/subject/'+sid);await attendreAccueil(page);
 for(const name of ['Anglais','Espagnol','Italien','Allemand','Arabe']){
 await page.getByRole('button',{name:new RegExp(name)}).click();
 const href=await page.getByRole('link',{name:/Ouvrir le guide PDF/}).getAttribute('href');
 const r=await page.request.get(href);expect(r.ok()).toBe(true);expect((await r.body()).subarray(0,5).toString()).toBe('%PDF-');
 console.log('PDF',sid,name,href,(await r.body()).length);
 }
 }
 expect(errors).toEqual([]);
});
test('audit2: coach minuteur pause navigation et favoris',async({page})=>{
 const errors=await preparer(page,etatEleve({favorites:['gf-t1']}));
 await page.clock.install();
 await page.goto('./#/coach');await attendreAccueil(page);
 await page.getByRole('button',{name:/Démarrer/}).click();await page.clock.runFor(2100);
 const paused=await page.getByText(/^24:[0-5][0-9]$/).innerText();
 await page.getByRole('button',{name:/Pause/}).click();await page.clock.runFor(62000);
 await expect(page.getByText(paused,{exact:true})).toBeVisible();
 await page.goto('./#/favoris');await attendreAccueil(page);
 await expect(page.getByRole('link',{name:/Règles comptables|Appliquer les règles comptables/})).toBeVisible();
 await page.locator('main button').last().click();expect((await etat(page)).favorites).toEqual([]);
 await page.goto('./#/coach');await attendreAccueil(page);await expect(page.getByText(paused,{exact:true})).toBeVisible();expect(errors).toEqual([]);
});
