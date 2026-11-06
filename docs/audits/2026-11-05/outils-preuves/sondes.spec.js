import {test,expect} from '@playwright/test'
import {writeFileSync} from 'node:fs'
import {preparer,etatEleve} from './eleve.js'
const out='/workspace/work/audit-outils-20261105/docs/audits/2026-11-05/outils-preuves/'
test('audit : impression copie longue et brouillon de demande',async({page})=>{
 await preparer(page);await page.goto('/#/excellence-economique')
 await page.getByRole('button',{name:'Ouvrir le sujet',exact:true}).first().click();await page.getByRole('button',{name:'Commencer ma copie',exact:true}).click()
 const answer='DEBUTPREUVECOPIE\n'+Array.from({length:90},(_,i)=>`Paragraphe ${i+1}. Une politique économique mobilise des instruments budgétaires et monétaires pour répondre aux déséquilibres. Elle doit être évaluée selon ses objectifs et ses limites.`).join('\n\n')+'\nFINPREUVECOPIE'
 await page.getByLabel('Ta composition',{exact:true}).fill(answer);await page.emulateMedia({media:'print'})
 const size=await page.getByLabel('Ta composition',{exact:true}).evaluate(el=>({scrollHeight:el.scrollHeight,clientHeight:el.clientHeight,length:el.value.length}))
 await page.pdf({path:out+'copie-longue.pdf',format:'A4'})
 writeFileSync(out+'copie-longue.json',JSON.stringify(size,null,2));expect(size.length).toBeGreaterThan(15000)
})
test('audit : demande examen avant génération perdue au rechargement',async({page})=>{
 await preparer(page);await page.route('**/functions/v1/examen-blanc',r=>r.fulfill({json:{ready:true}}));await page.goto('/#/bac-blanc')
 const form=page.getByRole('region',{name:'Crée ton examen blanc'}),field=form.getByLabel('Quel examen veux-tu passer ?')
 const prompt='Tester mes connaissances sur le management de première et terminale avec une étude de cas détaillée.'
 await field.fill(prompt);await form.getByLabel('240 min',{exact:true}).check();await page.reload()
 await expect(field).toBeVisible();const after=await field.inputValue();writeFileSync(out+'demande-rechargement.json',JSON.stringify({before:prompt,after,duration240:await form.getByLabel('240 min',{exact:true}).isChecked()},null,2))
 expect(after).toBe('')
})
