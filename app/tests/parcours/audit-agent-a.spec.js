import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {preparer,etatEleve,attendreAccueil} from './eleve.js'

const contraste=async(page,zone)=>{
 await page.evaluate(() => Promise.all(document.getAnimations().map(a => a.finished.catch(() => {}))))
 return (await new AxeBuilder({page}).include(zone).withRules(['color-contrast']).analyze()).violations
}

test('Entraînement personnalisé : le lien d’aide est lisible en thème clair (A-03)',async({page})=>{
 const errors=await preparer(page,etatEleve())
 await page.goto('./#/coach-ia');await attendreAccueil(page)
 await page.evaluate(()=>document.documentElement.classList.remove('dark'))
 expect(await contraste(page,'main')).toEqual([])
 expect(errors).toEqual([])
})

test('barre du bas : le libellé actif est lisible en thème clair (A-06)',async({page})=>{
 const errors=await preparer(page,etatEleve())
 await page.setViewportSize({width:390,height:760})
 await page.goto('./#/revision');await attendreAccueil(page)
 await page.evaluate(()=>document.documentElement.classList.remove('dark'))
 expect(await contraste(page,'.mobile-bottom-nav')).toEqual([])
 expect(errors).toEqual([])
})

test('paquet inconnu : un message au lieu d’un retour silencieux (A-08)',async({page})=>{
 const errors=await preparer(page,etatEleve())
 await page.goto('./#/revision/deck/inexistant');await attendreAccueil(page)
 await expect(page.getByText('Ce paquet n’existe plus, ou il n’est pas encore arrivé sur cet appareil.')).toBeVisible()
 await page.getByRole('link',{name:'Retour à la révision'}).click()
 await expect(page).toHaveURL(/#\/revision$/)
 expect(errors).toEqual([])
})

test('confidentialité : en anglais, la note « seule la version française fait foi » apparaît (A-02)',async({page})=>{
 const errors=await preparer(page,etatEleve({lang:'en'}))
 await page.goto('./#/confidentialite');await attendreAccueil(page)
 await expect(page.getByText('Legal text: only the French version of this page is authoritative.')).toBeVisible()
 expect(errors).toEqual([])
})

test('badges : aucune traduction externe en anglais (A-01)',async({page})=>{
 const requests=[]
 page.on('request',r=>{if(/mymemory|translate.googleapis/.test(r.url())) requests.push(r.url())})
 const errors=await preparer(page,etatEleve({lang:'en'}))
 await page.goto('./#/badges');await attendreAccueil(page)
 await expect(page.getByText('Create your profile and personalise your space.')).toBeVisible()
 await page.waitForTimeout(1200)
 expect(requests).toEqual([])
 expect(errors).toEqual([])
})
