# Audit06 — Révision, 2 novembre 2026

## Version et méthode

Base détachée `f0f70220fd34f6fbba1d6416f3c99e6a0cd3e1e7`, source `05bd1531da93f095780ec1492b756459153a722a`. Empreinte locale de l’index compilé : `c0cb4337d48b30af6dd6e3fe3556fea854d8b8a7f5e2ae60e7f2089c4d8ea309`, identique à VERSION.json. Référence CI fournie :41503625386,691 unitaires par fuseau UTC/Paris et359 parcours ; ces suites générales n’ont pas été relancées.

Worktree `/workspace/work/audit10-20261102/wt-06`, racine compilée servie par Python3.12.14 sur4216. Node24.19.0, Playwright1.56.1, Chromium headless, appareil Pixel7. Un seul worker à la fois, zéro retry automatique. `AGENTS.md`, `CLAUDE.md` et `docs/COORDINATION.md` lus dans la base gelée ; aucune édition suivie ni compilation ni commit. Aucun rapport contemporain d’un autre agent lu et aucun sous-agent lancé.

Identité et abonnement synthétiques par `app/tests/parcours/eleve.js`, trafic externe bloqué ; fonction abonnement simulée. Voix simulée, horloge simulée pour temps/minuteur. Aucun appel IA facturé, aucune mutation réelle Supabase, aucun compte réel. Captures limitées au viewport : les copies temporaires `audit06-*.spec.js` remplacent uniquement les options fullPage des scénarios historiques. Config, commandes, copies exécutées, journaux et traces conservés sous `preuves-06/`.

## Couverture exécutée

Lot initial du2 novembre :17 scénarios,15 réussites et2 écarts initiaux,7,5min (`preuves-06/selected.log`, `results.json`). Après interruption de session, reprise du3 novembre limitée à4 scénarios :4 réussites en39,6s (`reprises.log`, `reprises.json`). Aucun lot général recommencé.

- Réviser : acquis filtrés par matière/chapitre, séance complète avec sauvegarde, mélange toutes matières attribué au bon thème ; erreurs sans question de matière extérieure ; reprise du fil propre à la matière malgré une visite ailleurs. Les4 scénarios historiques concernés réussissent.
- Flashcards : glissement droit, petit glissement sans validation, bouton À revoir, flèches clavier, compteurs et fin de série. Nouvelle sonde réussie de partage UI vers code puis import : Unicode composé/décomposé, arabe, chinois, emoji et caractères HTML conservés ; code invalide rejeté sans ajouter de paquet ; retournement clavier et texte verso vérifiés. Le HTML fourni est affiché comme texte. Capture `reprises/...unicode.../unicode-viewport.png`.
- Audio simulé : Échap, capture/restitution de focus ; Pause/Suivant/Jouer et invalidation du délai précédent ; fermeture avant expiration et callbacks périmés (voir qualification ci-dessous).
- Formules : choix, génération, entrée non numérique et alerte, bonne réponse décimale française, mauvaise réponse et correction, bilan1/2, redémarrage. Programme Première limité et anciennes routes redirigées ; catalogue169 formules, recherche/matière/domaine, lien de cours, reprise d’une séance845 exercices (pas exécution des845). Reprise hors filtre, refaire les erreurs et redémarrage conservent les formules. Les4 scénarios réussissent.
- Parcours personnalisé : objectifs14/20 et10h, matière difficile, plan hebdomadaire, positionnement Droit complet, sauvegarde du diagnostic, avertissement1h et adoption du volume proposé. Réussi à la reprise après fermeture du bandeau cookies ; vérifications Axe incluses.
- Vacances : parcours entier avec erreur initiale, rechargement/reprise,8 séances, bilan final distinct du bilan initial, scores0% puis100%, reprise après rechargement. Confirmation d’un remplacement issu d’une autre filière testée avec refus puis acceptation.
- Temps/progression : courte visite et séance guidée attribuées au thème ; réparation des durées énormes sans perte des valeurs normales ni des XP. Nouvelle sonde minuteur : pause à50s, navigation, reprise, fin naturelle, un seul XP pour1min, saut sans XP supplémentaire, rechargement avec phase et cycle repris. Horloge synthétique ; capture coach viewport.

Le passage transversal couvre navigation du menu vers les formules, liens de cours, persistance/rechargement, erreurs d’entrée, rendu mobile et contrôles Axe dans les scénarios acquis/parcours/vacances. Les nombres sont des exécutions, pas des fonctions uniques.

## Défauts reproduits

Aucun défaut produit confirmé dans cet échantillon. Aucun correctif produit réalisé.

## Écarts initiaux et qualification

1. **Audio, attente temporelle du test** : le test attendait seulement Q1,R1 mais recevait aussi Q2. Trace conservée : fin des callbacks à73535,567ms, clic Quitter effectif à74237,594ms, soit plus de700ms après, alors que la prochaine carte est prévue après450ms (`app/src/components/AudioReview.jsx:58`). Q2 avait commencé avant la fermeture ; ce résultat ne prouve pas un son après fermeture. La nouvelle sonde place fin des callbacks et clic Quitter dans une même tâche JS, puis rejoue les callbacks annulés et attend650ms : Q1,R1 seulement, réussite. Détails `preuves-06/qualification-audio.txt` et trace initiale ; source de protection `AudioReview.jsx:24` et suivantes. Limite : ce rejeu atomique vérifie la logique d’annulation sans reproduire un geste physique humain.
2. **Plan personnalisé, délai global90s** : le lot initial expire au clic Droit après les contrôles Axe et la capture. La trace comporte une interception par le bandeau cookies ; on ne conclut pas à une panne de positionnement. Reprise isolée conservant les assertions fonctionnelles, avec fermeture explicite du bandeau par OK : parcours complet réussi en27,7s. La cause exacte de toute la durée initiale n’est pas attribuée au seul bandeau ; charge machine et inspections Axe peuvent contribuer.

Les avertissements Node NO_COLOR/FORCE_COLOR sont de l’outillage. Les erreurs réseau prévues découlent du blocage externe et ne certifient pas la disponibilité des services réels. Aucun risque de lecture supplémentaire suffisamment étayé n’est retenu comme défaut.

## Intégrité et fin

`git diff --exit-code` réussi dans la worktree : aucun fichier suivi modifié. Les fichiers non suivis sont scripts/configs temporaires et lien node_modules, inventoriés dans `preuves-06/git-status.txt`. Scripts effectivement exécutés copiés dans les preuves. Aucun commit ni PR. Worker navigateur terminé après les4 reprises ; serveur statique arrêté à la remise.

## Limites

Échantillon ciblé de révision ; aucune certification de chaque combinaison matière/chapitre, de tous les cours ou de tous les appareils. Le glisser est simulé par pointeur Chromium, sans doigt physique. Les voix réelles, permissions audio et rendu des moteurs vocaux ne sont pas certifiés. La synchronisation réelle de la progression, RLS, Google et les services payants ne sont pas certifiés. Le changement de filière est échantillonné par programme Première/Terminale et remplacement d’un parcours vacances d’une autre filière, sans parcourir chaque changement de spécialité dans les réglages.
