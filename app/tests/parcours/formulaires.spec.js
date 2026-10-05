// Formulaire de création de compte : messages à côté des champs, bouton bloqué
// tant qu'un champ est invalide, piège à robots invisible. Rien n'est envoyé à
// Supabase (réseau extérieur bloqué, voir eleve.js).
import { test, expect } from '@playwright/test'
import { preparer } from './eleve.js'

test('création de compte : chaque champ explique ce qui ne va pas', async ({ page }) => {
  const erreurs = await preparer(page, null)
  await page.goto('./')
  await page.getByRole('button', { name: /Créer un compte/ }).click()

  const email = page.getByLabel('Adresse e-mail')
  const mdp = page.getByLabel('Mot de passe', { exact: true })
  const suivant = page.getByRole('button', { name: 'Suivant' })

  await email.fill('lea.martin@exemple')
  await mdp.click() // quitter le champ e-mail affiche l'erreur
  await expect(page.getByText(/Adresse incomplète/)).toBeVisible()
  await expect(email).toHaveAttribute('aria-invalid', 'true')

  await email.fill('lea.martin@exemple.fr')
  await expect(page.getByText(/Adresse incomplète/)).toHaveCount(0)

  await mdp.fill('abcdef')
  await expect(page.getByText('8 caractères minimum, avec au moins une lettre et un chiffre.')).toBeVisible()
  await expect(suivant).toBeDisabled()
  await mdp.fill('bacstmg26')
  await expect(page.getByText('✓ 8 caractères minimum, avec au moins une lettre et un chiffre.')).toBeVisible()
  await expect(suivant).toBeEnabled()

  // Le piège à robots existe mais reste hors de vue et hors du parcours clavier.
  const piege = page.locator('#w-site')
  await expect(piege).toHaveAttribute('tabindex', '-1')
  expect(await piege.evaluate((el) => el.getBoundingClientRect().right)).toBeLessThan(0)

  await suivant.click()
  const prenom = page.getByLabel('Prénom')
  await prenom.fill('Léa2')
  await page.getByLabel('Nom', { exact: true }).click()
  await expect(page.getByText(/Lettres uniquement/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Suivant' })).toBeDisabled()
  await prenom.fill('Léa')
  await expect(page.getByText(/Lettres uniquement/)).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Suivant' })).toBeEnabled()
  expect(erreurs).toEqual([])
})
