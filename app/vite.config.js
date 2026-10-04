import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import contenuIndex from './scripts/plugin-contenu.mjs'

// Build en plusieurs fichiers dans app/dist/ : le code de l'app, chaque page,
// et le contenu de chaque matière arrivent séparément, à la demande.
// Le workflow « Tester et publier » copie ensuite app/dist/ à la racine du
// dépôt, que GitHub Pages sert sur https://revizstmg.github.io.
// `base: './'` + HashRouter => fonctionne depuis n'importe quelle URL
// (GitHub Pages, sous-dossier) sans configuration de serveur.
export default defineConfig({
  base: './',
  plugins: [react(), contenuIndex()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Un fichier par matière pour son contenu (content/<matière>/*.json).
        manualChunks(id) {
          const m = id.match(/[\\/]content[\\/]([a-z0-9-]+)[\\/][^\\/]+\.json$/)
          if (m && m[1] !== 'commun') return `contenu-${m[1]}`
        },
      },
    },
  },
})
