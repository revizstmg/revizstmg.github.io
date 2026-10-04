# CLAUDE.md

RévizSTMG : application de révision du bac STMG, en ligne sur
https://revizstmg.github.io. Documentation complète : `README.md`.

## Où est quoi

- `app/` : le code source (React, Vite, Tailwind).
- La racine (`index.html`, `sw.js`, `manifest.webmanifest`, icônes) : la version
  compilée que sert GitHub Pages. Elle est générée par le workflow
  `.github/workflows/deploy.yml` : ne la modifiez jamais à la main.
- `supabase/functions/fiche-vision/` : la fonction « fiche par photo ».

## Commandes

```bash
cd app
npm install
npm run dev      # http://localhost:5173, routes sous /#/
npm run build    # compile dans app/dist/ (fichier unique + PWA)
```

- Il n'y a pas de tests automatiques. Après une modification, vérifiez dans un
  navigateur le parcours concerné.
- La mise en ligne est automatique : quand `app/` change sur `main`, le workflow
  compile et publie. Travaillez sur une branche, puis fusionnez dans `main`.

## Contenu

- Le contenu est dans `app/src/data/`, avec un fichier par matière.
- `data/index.js` assemble les matières, applique les couches d'enrichissement et
  génère les exercices et les flashcards à partir du texte des cours.
- Les cours de Terminale ne contiennent que des notions de Terminale. Les notions de
  Première servent seulement à formuler des exercices.
- N'inventez aucune notion : tout doit correspondre au programme officiel de STMG.
- L'interface et le contenu sont en français.

## Supabase

- Le projet `wyydagcjkbivtbuhbzon` est partagé avec le site NAH (dépôt
  `Gabriel-Merlin/NAH`). Ne touchez pas aux tables de NAH (`candidatures`,
  `signalements`, `questions_anonymes`, `sondages`…).
- La clé « anon » est publique : chaque table doit avoir des règles RLS.
- Il n'existe pas de schéma à jour : avant de modifier la base, vérifiez son état
  réel sur Supabase.
