import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil, etat } from './eleve.js'

// Essai sans compte : prénom et filière, puis l'application ; la progression
// reste sur l'appareil, les espaces partagés invitent à créer un compte, et
// « Créer mon compte » rouvre l'inscription. Rien n'atteint le réseau.
test('essai sans compte, puis invitation à créer son compte', async ({ page }) => {
  const erreurs = await preparer(page, null)
  await page.goto('./')
  await page.getByRole('button', { name: 'Essayer sans compte' }).click()
  await expect(page.getByRole('heading', { name: 'Essayer sans compte' })).toBeVisible()

  const accueil = page.getByRole('dialog')
  const commencer = accueil.getByRole('button', { name: /Commencer mes révisions sans compte/ })
  await expect(commencer).toBeDisabled()
  await accueil.getByLabel(/Prénom/).fill('Inès')
  await accueil.getByRole('button', { name: /Terminale/ }).first().click()
  await accueil.getByRole('button', { name: /Gestion et Finance/ }).first().click()
  await commencer.click()

  // Choix des chapitres (facultatif), puis « Bienvenue ».
  await page.getByRole('dialog').getByRole('button', { name: /Passer cette étape/ }).click()
  await attendreAccueil(page)
  await expect(page.getByText('Mode essai : ta progression reste sur cet appareil.')).toBeVisible()
  const e = await etat(page)
  expect(e.profile.firstName).toBe('Inès')
  expect(e.track).toEqual({ level: 'terminale-stmg', specialty: 'gestion-finance' })
  expect(e.account).toBeFalsy()

  // Récompense du jour (nouvel élève) : on la ferme.
  const recompense = page.getByRole('dialog').filter({ hasText: /XP/ })
  if (await recompense.count()) await recompense.getByRole('button').first().click()

  // Espace classe : réservé aux comptes.
  await page.goto('./#/classe')
  await expect(page.getByRole('heading', { name: /Crée ton compte pour rejoindre ta classe/ })).toBeVisible()
  await page.getByRole('main').getByRole('button', { name: 'Créer mon compte' }).click()
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Faisons connaissance' })).toBeVisible()
  expect(erreurs).toEqual([])
})
