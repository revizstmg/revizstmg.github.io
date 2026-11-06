import {test} from '@playwright/test'
import {preparer,etatEleve,etat} from './tests/parcours/eleve.js'
import {writeFileSync} from 'node:fs'
test('mesures ciblées des choix et de la suppression',async({page})=>{
 await page.setViewportSize({width:390,height:844})
 await preparer(page,etatEleve({savedDecks:[{id:'ux-synthetique',title:'Paquet fictif UX',cards:[{front:'Question',back:'Réponse'}]}]}))
 const data={synthetic:true,viewport:{width:390,height:844}}
 await page.goto('/#/revision');await page.locator('#revision-flashcards').waitFor()
 data.revision=await page.locator('main').evaluate(el=>({height:el.getBoundingClientRect().height,actions:el.querySelectorAll('button,a').length}))
 const del=page.locator('#revision-flashcards button').filter({hasText:'🗑'});data.deleteTarget=await del.boundingBox()
 let confirms=0;page.on('dialog',async d=>{confirms++;await d.dismiss()});await del.click()
 data.deletion={remaining:(await etat(page)).savedDecks?.length,confirms,undoVisible:await page.getByRole('button',{name:/Annuler/}).count()}
 await page.goto('/#/offres');await page.locator('.study-offers').waitFor()
 data.offers=await page.locator('.study-offers').evaluate(el=>({height:el.getBoundingClientRect().height,featureLines:el.querySelectorAll('.study-offer-grid li').length}))
 writeFileSync('../docs/audits/2026-11-05/ux-preuves/mesures.json',JSON.stringify(data,null,2))
})
