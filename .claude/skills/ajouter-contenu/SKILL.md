---
name: ajouter-contenu
description: Ajouter ou corriger du contenu pédagogique de RévizSTMG (cours, chapitre, exercices, QCM, flashcards, définitions, pièges, formules, cas pratiques, études de documents, Grand Oral, étude de gestion). À utiliser dès qu'une demande touche à ce que l'élève lit ou à quoi il s'entraîne, dans n'importe quelle matière de Première ou de Terminale STMG.
---

# Ajouter ou corriger du contenu

Le contenu est en JSON dans `app/content/`. On le corrige là, **jamais dans le code**.
Référence complète : `README.md`, section « Le contenu ».

## 1. Trouver le bon fichier

- `app/content/<matière>/matiere.json` : la matière et ses `chapters` (`cours`,
  `formulas`, `games`). Les matières de Première commencent par `p1-`.
- Les couches (`cours-complets.json`, `approfondi-N.json`, `definitions.json`,
  `pieges.json`, `cas-pratiques.json`, `etudes-documents.json`,
  `exercices-sections.json`…) sont indexées par id de thème.
- `app/content/commun/` : formules, méthodologie, glossaire, Grand Oral, étude de
  gestion, dates des épreuves, réponses acceptées, notions liées.
- Lisez un chapitre voisin du même fichier et imitez sa structure exacte.

## 2. Règles de fond (non négociables)

- **Aucune notion inventée** : tout doit correspondre au programme officiel de STMG.
  En cas de doute sur une notion, une date ou un chiffre, vérifiez (programme,
  Bulletin officiel) avant d'écrire.
- Les **cours de Terminale** ne contiennent que des notions de Terminale. Les
  notions de Première servent seulement à formuler des exercices.
- Un cours est rédigé **en texte**, sans tableau au milieu : seul un tableau
  « Notions et définitions » peut terminer un chapitre (`docs/ARCHITECTURE.md`).
- Tout est en français, avec la typographie française (« », espaces avant : ; ? !).
- Les exercices automatiques sont générés à partir du texte du cours
  (`src/data/index.js`) : un cours clair donne de bons exercices.
- Calculs : un exercice chiffré désigne son générateur par `"gen"` (`src/calc.js`,
  `src/qcmgen.js`, `src/data/langgen.js`) pour avoir de nouveaux nombres à chaque
  partie ; le texte écrit sert de secours.
- Deux notions proches qu'il ne faut pas opposer dans un QCM vont dans
  `commun/notions-liees.json` ; une autre bonne réponse acceptée, dans
  `commun/reponses-acceptees.json`.

## 3. Vérifier

```bash
cd app
npm test
```

- L'empreinte de contenu (`tests/contenu.test.js`) **doit** changer, et seulement
  pour les thèmes touchés. Pour voir le détail : `npm run test:detail`, puis
  comparez `tests/.detail/`.
- Si le changement est bien celui voulu : `npm run test:maj`, puis relancez
  `npm test`.
- Si une empreinte change pour un thème que vous n'avez pas touché, cherchez
  pourquoi avant de mettre à jour.
- Pour un gros ajout : `npm run build && npm run test:parcours` (chaque thème de
  chaque matière est ouvert dans le navigateur).

## 4. Livrer

Suivez le skill `publier` (branche, commit en français, fusion dans `main`).
Dans le message de commit et le résumé, donnez la matière, le thème et ce que
l'élève verra de nouveau.
