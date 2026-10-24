import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { preparer, attendreAccueil, etatEleve } from './eleve.js'

// Un élève de Première ouvre l'étude de gestion depuis l'accueil : les consignes
// sont rangées en catégories qui se déploient ; il écrit sa problématique, ajoute
// une source, analyse son organisation (caractérisation, diagnostic, PESTEL),
// construit un argument A-E-I relié à cette source, l'évalue, retrouve tout après
// rechargement et télécharge son dossier.
test('étude de gestion : catégories, source, analyse, argument A-E-I évalué, dossier', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve({ track: { level: 'premiere-stmg' } }))
  await page.goto('./')
  await attendreAccueil(page)
  // L'étude de gestion est rangée dans la trousse de l'accueil.
  await page.getByRole('button', { name: /Ta trousse/ }).click()
  await page.getByRole('link', { name: /Étude de gestion/ }).first().click()
  await expect(page.getByRole('heading', { level: 1, name: 'Étude de gestion' })).toBeVisible()

  // Les règles sont repliées : rien n'est affiché avant d'appuyer.
  await expect(page.getByText(/oral de 20 minutes/)).toHaveCount(0)
  await page.getByRole('button', { name: /Les règles/ }).click()
  await page.getByRole('button', { name: /Si tu passes l'évaluation ponctuelle/ }).click()
  await expect(page.getByText(/oral de 20 minutes/)).toBeVisible()

  // Le projet (ouvert d'emblée) et le dossier (à déplier).
  await page.getByLabel('Organisation étudiée').fill('Boulangerie Martin')
  await page.getByLabel('Ma problématique').fill('Comment la boulangerie mesure-t-elle sa performance ?')
  await page.getByRole('button', { name: /Mon dossier/ }).click()
  await page.getByLabel('Les raisons du choix de la problématique').check()
  await expect(page.getByRole('button', { name: /Mon dossier/ })).toContainText('1 / 5 parties prêtes')

  // Une source.
  await page.getByRole('tab', { name: /Sources/ }).click()
  await page.getByRole('button', { name: 'Ajouter la source' }).click()
  await expect(page.getByRole('alert')).toContainText('titre')
  await page.getByRole('combobox', { name: 'Type' }).selectOption('Entretien')
  await page.getByLabel('Titre *').fill('Entretien avec la gérante')
  await page.getByLabel('Auteur ou organisme', { exact: true }).fill('Mme Martin')
  await page.getByLabel('Date', { exact: true }).fill('mars 2026')
  await page.getByLabel('Auteur ou organisme identifié').check()
  await page.getByRole('button', { name: 'Ajouter la source' }).click()
  await expect(page.getByRole('button', { name: /\[1\] Entretien avec la gérante/ })).toContainText('Fiabilité 1/3')
  await page.getByRole('button', { name: /\[1\] Entretien avec la gérante/ }).click()
  await expect(page.getByText('Mme Martin, « Entretien avec la gérante », mars 2026')).toBeVisible()

  // L'analyse : tableau de caractérisation, diagnostic interne et externe, PESTEL.
  await page.getByRole('tab', { name: /Analyse/ }).click()
  await expect(page.getByLabel('Organisation étudiée')).toHaveValue('Boulangerie Martin')
  await page.getByRole('button', { name: /Tableau de caractérisation/ }).click()
  await expect(page.getByRole('table')).toBeVisible()
  await page.getByLabel('Type', { exact: true }).fill('Entreprise privée')
  await page.getByLabel('Taille', { exact: true }).fill('TPE')
  await expect(page.getByRole('button', { name: /Tableau de caractérisation/ })).toContainText('2 / 8 lignes remplies')
  await page.getByRole('button', { name: /Diagnostic interne et externe/ }).click()
  await page.getByRole('button', { name: 'Interne ou externe ?' }).click()
  await expect(page.getByText(/peut-elle agir dessus/)).toBeVisible()
  await page.getByLabel(/Forces/).fill('Clientèle fidèle\nSavoir-faire reconnu')
  await page.getByLabel(/Menaces/).fill('Nouvelle boulangerie industrielle')
  await page.getByRole('button', { name: /^PESTEL/ }).click()
  await page.getByLabel('Légal').fill('Normes d’hygiène')
  await expect(page.getByRole('button', { name: /^PESTEL/ })).toContainText('1 / 6 facteurs analysés')

  // Un argument A-E-I relié à la source.
  await page.getByRole('tab', { name: /Arguments/ }).click()
  await expect(page.getByText('Comment la boulangerie mesure-t-elle sa performance ?')).toBeVisible()
  await page.getByLabel('A - Affirmation *').fill('La boulangerie suit sa marge chaque mois.')
  await page.getByLabel('E - Explication').fill('La marge mesure la valeur créée par chaque vente.')
  await page.getByLabel('Notion du cours utilisée').fill('marge')
  await page.getByLabel('I - Illustration').fill('Marge de 40 % sur le pain en mars.')
  await page.getByRole('combobox', { name: "Source de l'illustration" }).selectOption({ label: '[1] Entretien avec la gérante' })
  await page.getByRole('button', { name: 'Ajouter l’argument' }).click()

  // L'argument se déploie ; on l'évalue avec la grille.
  const argument = page.getByRole('button', { name: /1\. La boulangerie suit sa marge chaque mois\./ })
  await expect(argument).toContainText('Note : 2/5')
  await argument.click()
  await expect(page.getByText('📎 Mme Martin, « Entretien avec la gérante », mars 2026')).toBeVisible()
  for (const critere of [/L'affirmation répond/, /L'explication déroule/, /L'illustration est concrète/]) await page.getByLabel(critere).check()
  await expect(argument).toContainText('Note : 5/5')
  await expect(page.getByText('20/20')).toBeVisible()

  // Tout est retrouvé après rechargement.
  await page.waitForTimeout(800)
  await page.reload()
  await page.goto('./#/etude-de-gestion')
  await page.getByRole('tab', { name: /Arguments \(1\)/ }).click()
  await expect(page.getByRole('button', { name: /1\. La boulangerie suit sa marge/ })).toContainText('Note : 5/5')

  // Le dossier se télécharge, avec l'auto-évaluation.
  const fichier = page.waitForEvent('download')
  await page.getByRole('button', { name: /Télécharger mon dossier/ }).click()
  const contenu = readFileSync(await (await fichier).path(), 'utf8')
  expect(contenu).toContain('Problématique : Comment la boulangerie mesure-t-elle sa performance ?')
  expect(contenu).toContain('Illustration : Marge de 40 % sur le pain en mars. [source 1]')
  expect(contenu).toContain('Auto-évaluation : 5/5')
  expect(contenu).toContain('Note de mes arguments (auto-évaluation) : 20/20')
  expect(contenu).toContain('Type : Entreprise privée')
  expect(contenu).toContain('Forces :\n   - Clientèle fidèle\n   - Savoir-faire reconnu')
  expect(contenu).toContain('L — Légal :\n   - Normes d’hygiène')
  expect(erreurs).toEqual([])
})

test('l’étude de gestion n’apparaît pas sur l’accueil de Terminale', async ({ page }) => {
  await preparer(page)
  await page.goto('./')
  await attendreAccueil(page)
  await expect(page.getByRole('link', { name: /Étude de gestion/ })).toHaveCount(0)
})
