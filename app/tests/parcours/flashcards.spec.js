// Flashcards : glisser au doigt, boutons et clavier valident la carte ; les
// compteurs suivent ; la série se termine sur l'écran des cartes à revoir.
import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil, etatEleve } from './eleve.js'

const cartes = Array.from({ length: 4 }, (_, i) => ({ front: `Notion ${i + 1}`, back: `Définition de la notion ${i + 1}.` }))

test('paquet enregistré : glisser, boutons et clavier', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve({ savedDecks: [{ id: 'essai', title: 'Paquet d’essai', color: '#7c3aed', cards: cartes }] }))
  await page.goto('./')
  await attendreAccueil(page)
  await page.goto('./#/revision/deck/essai')
  const carte = page.getByRole('button', { name: /Retourner la carte/ }).last()
  await expect(carte).toBeVisible()
  const b = await carte.boundingBox()
  const cx = b.x + b.width / 2, cy = b.y + b.height / 2

  // Glisser à droite au-delà du seuil = « Je savais ».
  await page.mouse.move(cx, cy); await page.mouse.down(); await page.mouse.move(cx + 160, cy, { steps: 8 }); await page.mouse.up()
  await expect(page.getByText('✓ 1')).toBeVisible()
  // Un petit glissement revient en place sans valider.
  await page.mouse.move(cx, cy); await page.mouse.down(); await page.mouse.move(cx + 30, cy, { steps: 10 }); await page.mouse.up()
  await page.waitForTimeout(500)
  await expect(page.getByText('2/4')).toBeVisible()
  // Bouton « À revoir », puis flèches du clavier.
  await page.getByRole('button', { name: /À revoir/ }).click()
  await expect(page.getByText('↩ 1')).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByText('✓ 2')).toBeVisible()
  await page.keyboard.press('ArrowLeft')
  await expect(page.getByText(/2 acquise\(s\) sur 4/)).toBeVisible()
  await expect(page.getByText(/2 à revoir/)).toBeVisible()
  expect(erreurs).toEqual([])
})
