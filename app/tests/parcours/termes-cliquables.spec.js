import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { preparer, etatEleve } from './eleve.js'

// Les mots en gras d'un cours qui ont une définition au glossaire sont cliquables ;
// les autres restent un simple gras.
async function ouvrirChapitre(page, route) {
  await page.goto(`./#/subject/${route}`)
  await expect(page.locator('.terme-clic').first()).toBeVisible({ timeout: 15000 })
}

// Le lecteur de cours place plusieurs pages côte à côte : on prend un terme réellement
// à l'écran (rien ne le recouvre).
async function termeALEcran(page) {
  let index = -1
  await expect.poll(async () => {
    index = await page.evaluate(() => [...document.querySelectorAll('.terme-clic')].findIndex((el) => {
      el.scrollIntoView({ block: 'center', inline: 'nearest' })
      const r = el.getBoundingClientRect()
      const x = r.left + r.width / 2, y = r.top + r.height / 2
      if (r.width === 0 || x < 4 || x > innerWidth - 4 || y < 4 || y > innerHeight - 4) return false
      const haut = document.elementFromPoint(x, y)
      return haut === el || el.contains(haut)
    }))
    return index
  }, { timeout: 10000 }).toBeGreaterThanOrEqual(0)
  return page.locator('.terme-clic').nth(index)
}

test('un terme en gras ouvre sa définition, Échap la referme et rend le focus', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve())
  await ouvrirChapitre(page, 'droit/theme/droit-t5/chapter/1')
  const terme = await termeALEcran(page)
  const nom = (await terme.innerText()).trim()
  await expect(terme).toHaveAttribute('aria-expanded', 'false')
  await terme.click()
  await expect(terme).toHaveAttribute('aria-expanded', 'true')
  const definition = page.locator('.terme-def')
  await expect(definition).toBeVisible()
  await expect(definition.locator('.terme-def-titre')).toHaveText(nom)
  expect((await definition.locator('.terme-def-texte').innerText()).length).toBeGreaterThan(20)
  await page.keyboard.press('Escape')
  await expect(definition).toHaveCount(0)
  await expect(terme).toBeFocused()
  // Un clic ailleurs la referme aussi.
  await (await termeALEcran(page)).click()
  await expect(page.locator('.terme-def')).toBeVisible()
  await page.mouse.click(5, 5)
  await expect(page.locator('.terme-def')).toHaveCount(0)
  expect(erreurs).toEqual([])
})

test('la fenêtre de définition reste dans l’écran à 320 px et passe axe', async ({ page }) => {
  await preparer(page, etatEleve())
  await page.setViewportSize({ width: 320, height: 568 })
  await ouvrirChapitre(page, 'droit/theme/droit-t5/chapter/1')
  await (await termeALEcran(page)).click()
  const boite = await page.locator('.terme-def').boundingBox()
  expect(boite.x).toBeGreaterThanOrEqual(0)
  expect(boite.x + boite.width).toBeLessThanOrEqual(320)
  const axe = await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(axe.violations).toEqual([])
})

test('un gras sans définition reste un gras (pas un bouton)', async ({ page }) => {
  await preparer(page, etatEleve())
  await ouvrirChapitre(page, 'droit/theme/droit-t5/chapter/1')
  expect(await page.locator('main strong').count()).toBeGreaterThan(0)
  expect(await page.locator('main strong button, main button strong').count()).toBe(0)
})

test('dans le lecteur de cours plein écran, la définition passe devant et se lit', async ({ page }) => {
  await preparer(page, etatEleve())
  await page.setViewportSize({ width: 375, height: 667 })
  await ouvrirChapitre(page, 'droit/theme/droit-t8/chapter/1')
  await (await termeALEcran(page)).click()
  const def = page.locator('.terme-def')
  await expect(def).toBeVisible()
  // L'élément au centre de la fenêtre est bien la définition (rien ne la recouvre).
  const devant = await def.evaluate((el) => {
    const r = el.getBoundingClientRect()
    const haut = document.elementFromPoint(r.left + r.width / 2, r.top + 10)
    return !!haut && (el === haut || el.contains(haut))
  })
  expect(devant).toBe(true)
  // Échap ferme la définition sans fermer le lecteur.
  await page.keyboard.press('Escape')
  await expect(def).toHaveCount(0)
  await expect(page.locator('.reader-full')).toBeVisible()
})
