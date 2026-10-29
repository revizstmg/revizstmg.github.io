import {test,expect} from '@playwright/test'
import {preparer,etatEleve,attendreAccueil} from './eleve.js'

// Constats graves de l'audit d'utilisation (B-01 à B-07) : ce que l'utilisateur lit doit être juste et clair.

test('accueil : le bouton principal dit ce qu’il lance (B-03)',async({page})=>{
 const errors=await preparer(page,etatEleve())
 await page.goto('./#/accueil');await attendreAccueil(page)
 const action=page.getByRole('link',{name:/Commencer un cours/})
 await expect(action).toBeVisible()
 await expect(action).toHaveAttribute('href','#/cours')
 await action.click()
 await expect(page).toHaveURL(/#\/cours$/)
 expect(errors).toEqual([])
})

test('le minuteur est utilisable sans installation (B3-27)',async({page})=>{
 const errors=await preparer(page,etatEleve())
 await page.goto('./#/coach');await attendreAccueil(page)
 await expect(page.getByText('Un minuteur pour rythmer tes révisions, et des méthodes qui te correspondent.')).toBeVisible()
 await expect(page.getByText(/réservée à l’application installée/)).toHaveCount(0)
 await expect(page.getByRole('button',{name:/Démarrer|Commencer|Lancer/}).first()).toBeVisible()
 expect(errors).toEqual([])
})

test('un visiteur sans compte n’est pas déclaré « session expirée » (B-04)',async({page})=>{
 const errors=await preparer(page,etatEleve({account:null,profile:null}))
 // Un visiteur reste sur l'écran de connexion : on lit la page qui se trouve dessous, sans attendre la fin de l'accueil.
 await page.goto('./#/amis');await page.waitForTimeout(1500)
 await expect(page.getByText('Ta session a expiré')).toHaveCount(0)
 await expect(page.getByText(/Cet espace est réservé aux comptes/)).toBeVisible()
 await expect(page.getByRole('button',{name:'Créer mon compte'})).toBeVisible()
 expect(errors).toEqual([])
})

test('Première : le millésime des épreuves est expliqué (B-06)',async({page})=>{
 const errors=await preparer(page,etatEleve({track:{level:'premiere-stmg'}}))
 await page.goto('./#/programme');await attendreAccueil(page)
 await expect(page.getByRole('heading',{name:/Tes épreuves anticipées : juin 2027 \(bac session 2028\)/})).toBeVisible()
 expect(errors).toEqual([])
})

test('bilan : l’aveu « prévu dans Premium » est annoncé avant les champs (B-01)',async({page})=>{
 const errors=await preparer(page,etatEleve())
 await page.goto('./#/mes-notes');await attendreAccueil(page)
 await expect(page.getByText(/Le bilan expliqué et l’analyse de copie sont prévus dans Premium/).first()).toBeVisible()
 expect(await page.getByText(/Tu obtiens un bilan relié au cours/).count()).toBe(0)
 expect(errors).toEqual([])
})

test('parcours : valeurs courantes signalées, heures lisibles, manque expliqué (B-07)',async({page})=>{
 const errors=await preparer(page,etatEleve())
 await page.goto('./#/parcours');await attendreAccueil(page)
 await expect(page.getByText('Les choix déjà cochés sont des valeurs courantes : ajuste-les.')).toBeVisible()
 await page.getByRole('button',{name:'Voir mon parcours'}).click()
 await expect(page.getByRole('heading',{name:'Ton temps de révision ne suffit pas'})).toBeVisible()
 // « 130 h 42 », pas « 130 h42 » ; jamais « trop chargé » quand c'est le temps qui manque.
 await expect(page.getByText(/Il manque environ \d+ h pour atteindre/)).toBeVisible()
 expect(await page.getByText('Ton plan est trop chargé').count()).toBe(0)
 expect(errors).toEqual([])
})
