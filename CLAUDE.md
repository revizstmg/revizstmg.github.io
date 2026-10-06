# CLAUDE.md

RévizSTMG : application de révision du bac STMG, en ligne sur
https://revizstmg.github.io. Documentation complète : `README.md`.

## Où est quoi

- `app/` : le code source (React, Vite, Tailwind).
- La racine (`index.html`, `sw.js`, `manifest.webmanifest`, icônes) : la version
  compilée que sert GitHub Pages. Elle est générée par le workflow
  `.github/workflows/deploy.yml` : ne la modifiez jamais à la main.
- `supabase/migrations/` : le schéma de la base ; `supabase/functions/fiche-vision/` :
  la fonction « fiche par photo ».

## Commandes

```bash
cd app
npm install
npm run dev      # http://localhost:5173, routes sous /#/
npm run build    # compile dans app/dist/ (un fichier par page et par matière)
npm test         # logique + empreinte du contenu (secondes)
npm run test:parcours   # parcours navigateur, après un build (~3 min)
```

- Lancez `npm test` après chaque modification. Une empreinte de contenu qui change
  alors que vous n'avez touché qu'au code signifie que l'élève verra autre chose :
  ne mettez à jour les empreintes (`npm run test:maj`) que pour un changement de
  contenu voulu.
- Les parcours ne doivent jamais toucher la vraie base : ils bloquent tout accès
  extérieur (voir `tests/parcours/eleve.js`).
- La mise en ligne est automatique : quand `app/` change sur `main`, le workflow
  teste puis publie, seulement si tout est vert. Travaillez sur une branche, puis
  fusionnez dans `main`. L'architecture est décrite dans `docs/ARCHITECTURE.md`.

## Contenu

- Le contenu est en JSON dans `app/content/<matière>/` (voir README, section
  « Le contenu »). On le corrige là, jamais dans le code.
- `src/data/index.js` assemble les matières, applique les couches et génère les
  exercices et les flashcards à partir du texte des cours.
- Le contenu d'une matière est chargé à la demande : au démarrage, `SUBJECTS` et
  `ALL_CHAPTERS` n'ont que l'index léger (pas de `cours`, exercices réduits à leur
  `id`). Toute page qui lit le contenu doit passer par `<ContenuMatiere>` ou
  `<ContenuFiliere>` (`src/content/Contenu.jsx`), ou appeler `chargerMatiere`.
- Les cours de Terminale ne contiennent que des notions de Terminale. Les notions de
  Première servent seulement à formuler des exercices.
- N'inventez aucune notion : tout doit correspondre au programme officiel de STMG.
- Un cours est rédigé en texte, sans tableau au milieu : seul un tableau
  « Notions et définitions » peut terminer un chapitre (docs/ARCHITECTURE.md).
- L'interface et le contenu sont en français.

## Interface

- Contraste AA : texte en couleur d'accent → `var(--c-accent-texte)`, fond sous du
  texte blanc → `var(--c-accent-fort)`, texte dans la couleur d'une matière →
  classe `texte-matiere` + `style={{ '--mc': couleur }}` (README, « Règles de
  l'interface »).
- Validation des formulaires et anti-spam : `src/formulaires.js`. Mesure
  d'audience sans cookie : `src/mesure.js` (inactive, en attente d'accord).

## Supabase

- Le projet `wyydagcjkbivtbuhbzon` est partagé avec le site NAH (dépôt
  `Gabriel-Merlin/NAH`). Ne touchez pas aux tables de NAH (`candidatures`,
  `signalements`, `questions_anonymes`, `sondages`…).
- La clé « anon » est publique : chaque table doit avoir des règles RLS.
- Le schéma est dans `supabase/migrations/`. Toute modification de la base passe par
  un nouveau fichier de migration, appliqué sur Supabase sous le même nom
  (`supabase/README.md`).
- Sauf `profiles`, les tables sociales sont ouvertes à tous (`using (true)`) : n'y
  ajoutez pas de données sensibles avant d'avoir appliqué les corrections de
  l'audit (`supabase/README.md`).
