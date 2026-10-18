# Journal partagé — propriétaire, Claude et Codex

Ce fichier sert de relais entre les sessions. Il ne déclenche aucun agent et ne
constitue pas une messagerie en temps réel. Chaque participant doit avoir accès
au dépôt GitHub et lire la version à jour pour voir les annonces des autres.
Le propriétaire décide des priorités et tranche les désaccords.

## À chaque session

1. Récupérer les références distantes (`git fetch origin`) et lire ce journal sur
   `origin/main`, les branches de travail concernées et les PR ouvertes.
2. Avant toute modification du code, annoncer une tâche avec un identifiant
   unique, son responsable, son objectif, les fichiers concernés et sa branche.
   Publier cette annonce sur une branche et ouvrir une PR brouillon pour qu'elle
   soit visible aux autres. Un brouillon local n'est pas une réservation partagée.
3. Si une tâche ouverte touche les mêmes fichiers ou la même partie de Supabase,
   se coordonner avec le propriétaire avant d'effectuer des changements concurrents.
   Deux annonces simultanées restent possibles : le journal n'est pas un verrou.
4. Travailler sur sa branche. Ne pas écraser les changements des autres et ne pas
   forcer la mise à jour d'une branche partagée. Relire les changements distants
   avant de fusionner. Respecter les consignes et validations de `CLAUDE.md`.
5. Avant de passer la main, mettre à jour sa propre entrée : résultat, fichiers,
   vérifications réellement effectuées, commit ou PR, limites et prochaine action.
   « Terminé » décrit la tâche ; préciser séparément si elle est fusionnée ou publiée.

Ne jamais mettre de secrets, de données d'élèves ou de clés privées dans ce journal.
Ne pas modifier le statut de Claude ou de Codex à leur place. Une modification de
Supabase reste soumise aux consignes d'autorisation de `CLAUDE.md`.

## Tableau de suivi

| ID | Responsable | Objectif et fichiers | État | Branche / PR | Prochaine action |
|---|---|---|---|---|---|
| COORD-20261018-CODEX-01 | Codex | Installer ce relais : `AGENTS.md`, `CLAUDE.md`, `docs/COORDINATION.md` | Terminé, fusionné | [PR #1](https://github.com/revizstmg/revizstmg.github.io/pull/1) | Claude lit le journal et annonce sa prochaine tâche |

| EXOS-20261018-CODEX-01 | Codex | Exercices strictement liés au chapitre : `app/src/data/index.js`, contenu Première SDGN si nécessaire, tests, README | Terminé, fusionné | [PR #3](https://github.com/revizstmg/revizstmg.github.io/pull/3) | Suivre la publication automatique ; aucune reprise nécessaire sur cette correction |

| AUDIT-20261018-CODEX-01 | Codex | Audit global en lecture : code, contenu, parcours, Supabase réel, publication et publicité ; cartographie publique dans `docs/AUDIT-2026-10-18.md`, résultats de sécurité détaillés dans le chat | Terminé, à fusionner | [PR #5](https://github.com/revizstmg/revizstmg.github.io/pull/5) | Lire `docs/AUDIT-2026-10-18.md`, puis annoncer séparément chaque correction |

| AUDIT-SUIVI-20261018-CODEX-01 | Codex | Réparer les cinq rattachements perdus lors de sa correction précédente ; borner les questions de langues au cours | Terminé, validation CI | [PR #6](https://github.com/revizstmg/revizstmg.github.io/pull/6) | Suivre la fusion/publication dans la PR ; périmètre distinct de l’audit |

États possibles : prévu, en cours, bloqué, à relire, terminé, abandonné.
Ajouter une ligne par tâche ; conserver l'historique utile.

## Passations

### COORD-20261018-CODEX-01 — Codex — 18 octobre 2026

- Demande : disposer d'un espace commun pour annoncer les actions prévues et réalisées.
- Réalisé : journal de coordination et points d'entrée pour Claude et Codex.
  Fusionné sur `main` par la PR #1 (commit `aa71d55`).
- Vérifications : relecture des consignes existantes et contrôle des différences Git.
- Portée : documentation uniquement ; aucun changement du site ni de Supabase.
- À reprendre : le propriétaire transmet à Claude le lien de ce fichier après
  fusion et lui demande de le lire au début et de le mettre à jour en fin de session.
  Aucune tâche n'a encore été attribuée à Claude.

### EXOS-20261018-CODEX-01 — Codex — 18 octobre 2026

- Demande : chaque question doit porter uniquement sur le chapitre associé,
  après constat de questions hors cours en sciences de gestion de Première.
- Cause : le générateur ajoutait la banque du thème et les définitions des autres
  sections ; les flashcards et les définitions avaient aussi des compléments hors
  chapitre. Deux textes à trous SDGN regroupaient neuf questions de chapitres différents.
- Réalisé : génération, distracteurs, flashcards et définitions limités à la
  section ; suppression du placement arbitraire des jeux et des mélanges de
  calculs du thème dans les chapitres ; cas pratiques uniquement sur rattachement
  explicite. Les neuf questions SDGN sont conservées et réparties par chapitre.
- Portée : moteur commun à toutes les matières ; aucun changement Supabase.
  Les chapitres courts peuvent proposer moins d'exercices. Les tests du thème
  restent transversaux. Les anciennes notes des deux jeux à trous remplacés ne
  sont pas transférées aux nouveaux jeux (identifiants propres à chaque chapitre).
- Vérifications : `npm test` : 154 tests réussis ; compilation réussie ; trois parcours navigateur ciblés réussis
  (SDGN personnalité, formes d'exercices en droit, calcul lié au chapitre en maths).
  Tests de régression ajoutés pour l'isolation et les neuf questions réaffectées.
  Empreintes de contenu régénérées intentionnellement pour la suppression des
  compléments hors chapitre dans toutes les matières.
- Validation complète : 154 tests et 76 parcours navigateur réussis sur GitHub
  (exécution `39145878970`). Audit supplémentaire de 54 chapitres SDGN : aucun
  choix de QCM ni flashcard générée absent du cours associé (424 jeux inspectés,
  140 cartes). Les jeux rédigés à la main ont été relus pour les rattachements SDGN.
- Fusionné : PR #3, commit `c2eec03`. Publication automatique lancée par la fusion
  sur `main` ; son résultat se consulte dans les Actions GitHub. Aucune reprise
  nécessaire sur cette correction ; Claude peut choisir une autre tâche.

### AUDIT-20261018-CODEX-01 — Codex — 18 octobre 2026

- Demande : audit transversal du projet et de la publicité fournie en conversation.
- Rapport : `docs/AUDIT-2026-10-18.md` ; inventaire de 19 matières, 94 thèmes,
  806 chapitres, 31 pages et 33 routes. Sources auditées : `124b8af` ; sources
  applicatives identiques à la publication `d37bb2f`.
- Vérifications : 154 tests relancés et réussis ; dernière CI de publication
  contrôlée (`39146348193`, tests et publication réussis). Reproductions locales
  du fuseau Paris, de la fusion multi-appareil, des scores, du dictionnaire et
  de la sauvegarde ; réseau simulé pour ces reproductions.
- Contrôles réels Supabase : catalogues des règles, privilèges, fonctions et
  déclencheurs, migrations et fonctions Edge déployées, Advisor sécurité.
  Aucune donnée d'élève lue, aucune modification de la base. Les détails de
  sécurité sont remis au propriétaire dans le chat, avec renvoi public à l'état
  déjà documenté dans `supabase/README.md`.
- Publicité : vidéo de 32,125 s, images et transcription locale examinées ;
  fichier original conservé hors dépôt.
- À reprendre : priorités et limites dans le rapport. Points fonctionnels
  vérifiés : sauvegarde/fusion, dates civiles, scores, rattachements de cinq jeux,
  couverture pédagogique, dictionnaire et disponibilité réelle de la vision.
  La correction précédente de Codex a rendu cinq jeux inaccessibles et laissé
  50 sections sans activité autonome : les réparer sans réintroduire de questions
  hors chapitre. Le rapport inclut la comparaison avant/après.
- Portée de cette PR : documentation uniquement ; aucune correction fonctionnelle.

### AUDIT-SUIVI-20261018-CODEX-01 — Codex — 18 octobre 2026

- Correctif distinct de l'audit : les cinq jeux inaccessibles ont un rattachement
  explicite à leur premier chapitre. Le jeu de dissertation correspond aux étapes
  expliquées dans son cours.
- Les anciennes banques de verbes et de grammaire EN/ES contenaient aussi des formes
  ou règles absentes de ces sections. Elles sont remplacées dans ces quatre jeux
  par des questions bornées au cours ; les verbes viennent des six lignes des
  tableaux, les règles et exemples de grammaire sont explicités dans la section.
  Dix questions sont mélangées et sélectionnées à chaque partie ; mêmes IDs et types.
- Vérifications : 155 tests réussis, compilation réussie, nouveau parcours de
  l'entraînement de verbes réussi ; régression sur les cinq jeux et sur le score
  maximal à 100 %. Empreinte des cinq thèmes concernés mise à jour volontairement.
- Branche : `fix/rattachements-audit`, PR #6. Les autres constats de l'audit restent
  à traiter, notamment les 50 sections sans activité propre et les scores des jeux
  générés. Aucune modification Supabase.

### Modèle à copier pour une nouvelle tâche

```text
ID : AAAAMMJJ-AGENT-SUJET
Responsable :
Date et heure (avec fuseau) :
Objectif :
Fichiers / périmètre Supabase :
État :
Branche / PR :
Actions prévues :
Actions réalisées :
Vérifications et résultats :
Blocages / décisions attendues :
Prochaine action :
```
