import { defineConfig, devices } from '@playwright/test'

// Parcours dans un vrai navigateur, sur la version compilée (npm run build).
// Aucun accès réseau extérieur : voir tests/parcours/eleve.js.
export default defineConfig({
  testDir: 'tests/parcours',
  timeout: 90000,
  expect: { timeout: 10000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173/',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'telephone', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173/',
    reuseExistingServer: !process.env.CI,
  },
})
