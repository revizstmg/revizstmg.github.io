import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import contenuIndex from './scripts/plugin-contenu.mjs'

// Tests de la logique et du contenu (Node). Les parcours dans le navigateur
// sont dans tests/parcours/ et passent par Playwright.
export default defineConfig({
  plugins: [react(), contenuIndex()],
  test: {
    include: ['tests/**/*.test.{js,jsx}'],
    environment: 'node',
    testTimeout: 120000,
  },
})
