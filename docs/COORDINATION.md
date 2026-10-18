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
