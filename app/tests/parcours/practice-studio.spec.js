import {readFileSync} from 'node:fs'
// Charger ce module Deno en ESM explicite, y compris sous Node 22 en CI.
const {practiceUnits}=await import('data:text/javascript;base64,'+Buffer.from(readFileSync(new URL('../../../supabase/functions/examen-blanc/practice.js',import.meta.url),'utf8')).toString('base64'))
import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {preparer,attendreAccueil} from './eleve.js'
const path='./#/subject/gestion-finance/theme/gf-t1/chapter/0'
async function start(page){await preparer(page);await page.addInitScript(()=>sessionStorage.setItem('stmg_fenetre_visite','aucune'));await page.goto(path);await attendreAccueil(page);await page.getByRole('button',{name:/Exercices/}).click()}
function bank(b){const lines=practiceUnits(b.course).map(u=>u.source);return {questions:b.targets.map((id,i)=>({q:`Situation fictive : ${['Un salarié prépare un compte rendu.','Le responsable doit vérifier une décision.','Une équipe compare deux méthodes.','Une erreur est signalée dans un dossier.','Un dirigeant cherche un indicateur.','Une organisation justifie son choix.'][i%6]} Pour appliquer ce passage du cours : « ${lines[Number(id.slice(1))]} », quelle analyse est correcte ?`,skill:i?'reasoning':'situation',choices:['La décision fondée sur le cours.','Une confusion de méthode.','Une conclusion non justifiée.'],answer:0,explain:'Il faut appliquer le mécanisme du cours et éviter de confondre collecte et validation.',unitIds:[id],source:lines[Number(id.slice(1))]}))}}
test('séries originales : passages du cours, correction sourcée, nouvelle série et conservation locale',async({page})=>{
 const requests=[];await start(page)
 await page.route('**/functions/v1/examen-blanc',route=>{const b=route.request().postDataJSON();requests.push(b);return route.fulfill({json:{practice:bank(b)}})})
 const studio=page.locator('[data-practice-studio]');await expect(page.locator('.chapter-memorisation')).not.toHaveAttribute('open','')
 await studio.getByRole('button',{name:'Créer ma série',exact:true}).click()
 await expect(studio.getByRole('heading',{level:3})).toContainText('Situation fictive')
 for(let n=0;n<requests[0].targets.length;n++){
 await studio.getByRole('button',{name:/La décision fondée sur le cours\./}).click()
 await studio.getByText('Retrouver cette notion dans le cours',{exact:true}).click();await expect(studio.locator('blockquote')).toContainText(' ')
 await studio.getByRole('button',{name:/Question suivante|Voir mon score/}).click()
 }
 await expect(studio.getByRole('status')).toContainText('Réponses justes')
 await studio.getByRole('button',{name:'Créer une nouvelle série',exact:true}).click();await expect.poll(()=>requests.length).toBe(2)
 expect(requests[1].previous.length).toBeGreaterThan(0);expect(requests[1].targets.some(id=>!requests[0].targets.includes(id))).toBe(true)
 await studio.getByRole('button',{name:'Fermer la série',exact:true}).click();await page.reload();await attendreAccueil(page);await page.getByRole('button',{name:/Exercices/}).click()
 await expect(studio.getByRole('button',{name:'Ouvrir ma série',exact:true})).toBeVisible();expect(requests.every(b=>b.action==='practice'&&b.course.id==='gf-t1::0')).toBe(true)
})
test('erreur et annulation ne remplacent pas la série ni le cours local',async({page})=>{
 await start(page);let count=0;await page.route('**/functions/v1/examen-blanc',route=>{count++;if(count>1)return;return route.fulfill({status:502,json:{error:'invalid_response'}})})
 const studio=page.locator('[data-practice-studio]');await studio.getByRole('button',{name:'Créer ma série',exact:true}).click();await expect(studio.getByRole('alert')).toContainText('manque de variété')
 await studio.getByRole('button',{name:'Créer ma série',exact:true}).click();await expect.poll(()=>count).toBe(2);await studio.getByRole('button',{name:'Annuler l’attente',exact:true}).click();await expect(studio.getByRole('alert')).toContainText('Attente annulée')
 await page.locator('.chapter-memorisation summary').click();await expect(page.locator('[data-jeu]').first()).toBeVisible()
 expect((await new AxeBuilder({page}).include('[data-practice-studio]').analyze()).violations).toEqual([])
})
