---
name: nouvelle-page
description: Créer ou modifier une page, un écran, un jeu ou un composant de l'interface de RévizSTMG (React, Tailwind). À utiliser pour toute nouvelle fonctionnalité visible par l'élève, le parent ou le professeur, et pour corriger un bug d'affichage.
---

# Créer ou modifier une page

Code dans `app/src/` : écrans dans `pages/`, jeux dans `games/`, composants dans
`components/`. Architecture : `docs/ARCHITECTURE.md`.

## 1. Avant d'écrire

- Lisez une page existante proche (même genre d'écran) et reprenez ses composants,
  ses classes et son style de code.
- Une nouvelle route se déclare dans `src/App.jsx`. Elle doit aussi être ajoutée :
  - à la liste `ROUTES` de `app/pwa/404.html` (vérifié par `tests/liens.test.js`) ;
  - à la liste `PAGES` de `tests/parcours/parcours.spec.js` (la page est ouverte
    dans le navigateur).

## 2. Règles

- **Contenu chargé à la demande.** Au démarrage, `SUBJECTS` et `ALL_CHAPTERS` n'ont
  que l'index léger (pas de `cours`, exercices réduits à leur `id`). Toute page qui
  lit le contenu passe par `<ContenuMatiere>` ou `<ContenuFiliere>`
  (`src/content/Contenu.jsx`) ou appelle `chargerMatiere`.
- **Hooks React** : jamais un hook après un `if (…) return` (écran blanc,
  vérifié par `tests/hooks.test.js`).
- **Contraste AA** : texte en couleur d'accent → `var(--c-accent-texte)` ; fond
  sous du texte blanc → `var(--c-accent-fort)` ; texte dans la couleur d'une
  matière → classe `texte-matiere` + `style={{ '--mc': couleur }}`. Vérifiez aussi
  le mode sombre.
- **Formulaires** : validation et anti-spam uniquement via `src/formulaires.js`
  (une erreur s'affiche sous le champ concerné). Ajoutez une règle là, avec son
  test dans `tests/formulaires.test.js`.
- **Mesure d'audience** : `src/mesure.js`, sans cookie ni identifiant. N'ajoutez
  aucun autre traceur.
- **Données** : rien de sensible dans les tables sociales Supabase (voir le skill
  `migration-supabase`). Un changement de base demande l'accord du propriétaire.
- Interface en français ; mobile d'abord (l'app est surtout utilisée sur téléphone).
- Le contenu pédagogique reste dans `app/content/` (skill `ajouter-contenu`),
  jamais écrit en dur dans un composant.

## 3. Vérifier

```bash
cd app
npm test                                   # l'empreinte de contenu ne doit PAS changer
npm run build && npm run test:parcours     # pages dans un vrai navigateur
```

- Une logique nouvelle (calcul, score, tri) mérite un test dans `tests/`.
- Regardez la page pour de vrai (skill `run`, ou `npm run dev` puis
  http://localhost:5173/#/<route>), en clair et en sombre, à largeur de téléphone.
- Les parcours bloquent tout accès extérieur (`tests/parcours/eleve.js`) : ne
  contournez jamais ce blocage.

## 4. Livrer

Lancez `/code-review` sur le diff (et `/security-review` si la page touche aux
comptes, aux formulaires ou à Supabase), puis suivez le skill `publier`.
