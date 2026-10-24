import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil } from './eleve.js'
import { annaleUrl } from '../../src/data/annalesBac.js'
test('droit-économie et management : PDF officiels complets, sans dossiers à remplir', async ({ page }) => {
 const errors = await preparer(page)
 await page.goto('./#/bac-blanc'); await attendreAccueil(page)
 await expect(page.getByRole('heading', { name: 'Choisis ton épreuve.' })).toBeVisible()
 const law = page.getByRole('link', { name: 'Ouvrir le sujet PDF complet - Droit et économie' })
 const management = page.getByRole('link', { name: /Ouvrir le sujet PDF complet - Management/ })
 await expect(law).toHaveAttribute('href', annaleUrl('droit-eco'))
 await expect(management).toHaveAttribute('href', annaleUrl('msgn'))
 await page.getByLabel('Centre d’examen').first().selectOption('antilles')
 await expect(law).toHaveAttribute('href', annaleUrl('droit-eco','antilles'))
 await expect(page.getByRole('heading', { name: /Dossiers guidés/ })).toHaveCount(0)
 await expect(page.getByRole('button', { name: /Droit et économie/ })).toHaveCount(0)
 await page.screenshot({ path: test.info().outputPath('bac-blanc-mobile.png'), fullPage: true })
 expect(errors).toEqual([])
})
