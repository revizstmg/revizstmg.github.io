# Audit07 — Examens

Version auditée : `f0f70220fd34f6fbba1d6416f3c99e6a0cd3e1e7` (source `05bd1531da93f095780ec1492b756459153a722a`), racine compilée servie sur 127.0.0.1:4217, worktree détachée `wt-07`. SHA256 de l’index : `c0cb4337d48b30af6dd6e3fe3556fea854d8b8a7f5e2ae60e7f2089c4d8ea309`.

Référence fournie, non relancée : CI41503625386,691 unitaires par fuseau UTC/Paris et359 parcours ; publication Pages41506196286 annoncée confirmée. Audit en lecture seule, aucun fichier suivi modifié, aucun build, sous-agent, compte réel, génération facturée ou mutation Supabase. Réseau externe bloqué par `tests/parcours/eleve.js`. EPS futur exclu.

## Exécutions et couverture

Commandes depuis `wt-07/app` :

```sh
npx playwright test --config audit07.config.mjs examen-personnalise.spec.js excellence.spec.js bac-niveaux.spec.js
npx vitest run tests/examen-personnalise.test.js tests/excellence.test.js tests/acces-serveur.test.js
```

Rejeu et nouvelles sondes :

```sh
npx playwright test --config audit07-rejeu.config.mjs examen-personnalise.spec.js audit07-new.spec.js --grep 'quota IA|chapitres manuels|retour au mode|sonde nouvelle'
```

Le rejeu change uniquement l’enveloppe globale du test de90s à180s ; les assertions et leurs attentes explicites sont conservées. Les traces initiales restent dans `preuves-07/results/`, les nouvelles dans `rejeu-results/`.

Configuration locale : Pixel7 par défaut, un worker, aucun réessai automatique, serveur statique Python sur 4217. Journaux et sortie structurée dans `preuves-07/`.

Couverture sélectionnée : trois variantes Première390 / Terminale1280 et390 ; création et téléchargement PDF sujet/corrigé, reprise ; service indisponible ; quota429 et prompt conservé ; dépôt avec consentement, ordre des pièces et formats, bilan illisible sans note ; choix manuel de chapitres entre niveaux, filtres sans résultat, plafond24 et effacement ; concours grand écran et mobile, quatre sessions et dossier complet, barème5/5/5/3/2, calcul de note depuis critères, copie conservée, téléchargement, séparation des sessions, annulation, délai150s, panne fournisseur, absence de compte, allemand et accessibilité320clair/1280sombre.

Première exécution :15 réussis,3 timeouts90s,0 ignoré (471,425s). Les64 tests unitaires ciblés passent sur3 fichiers (190,43s). Deux nouvelles sondes réussies : analyse POST suspendue interrompue à180s simulées, prompt et durée60min conservés, bouton réactivé, aucun sujet inventé ; six destinations annales et reprise d’une réponse de maths après rechargement, puis remise partielle et verrouillage des réponses. Les trois rejeux isolés réussissent : quota23,2s, choix manuel32,9s, effacement24chapitres28,1s. La seconde exécution réussit5/5 (deux sondes et trois rejeux,2,0min), sans ignoré. Au total :20 scénarios navigateur distincts contrôlés avec succès,23 exécutions dont les3 timeouts initiaux conservés, et64 unitaires ciblés réussis. Ces nombres ne représentent pas autant de fonctions uniques.

## Défauts reproduits

Aucun défaut produit confirmé dans le périmètre échantillonné. Les trois dépassements de délai initiaux ne se reproduisent pas au rejeu isolé, avec les assertions métier intactes ; ils sont classés comme limites temporelles de l’exécution sous charge, pas comme défauts de quota ou de sélection.

## Contrats, risques de lecture et limites

Contrats source#161 relus, avec le skill [Supabase](skill://plugin_asdk_app_69d3e5ee6a708191baa733f7b8931995/supabase/SKILL.md) : l’identité vient de `auth/v1/user`, pas de metadata utilisateur ; la correction Premium exige une génération du même mois, le plan est dispensé ; le plafond par fonction précède le compteur global. Tests REST/RPC et fournisseurs entièrement simulés, pas de certification du déploiement réel, des secrets, de RLS, du quota réellement appliqué ni de l’atomicité réelle en base. Notes de lecture dans `preuves-07/lecture-contrats.md`.

La correction d’un examen sauvegardé le mois précédent en Premium demande une nouvelle génération : c’est le contrat explicite de `docs/PAIEMENTS.md:64`, non classé comme défaut nouveau. La création et le dépôt n’ont pas de bouton d’annulation explicite sur la page, contrairement au concours ; leur délai client est180s et quitter la page interrompt la requête. Ce constat de lecture ne constitue pas une panne reproduite.

Les liens des six annales sont contrôlés dans l’interface ; aucune disponibilité distante du ministère certifiée par le navigateur, dont le réseau externe est bloqué. Les PDF du concours sont locaux et leurs empreintes font partie des tests ciblés. Aucune vérification de qualité pédagogique exhaustive des générations, ni certification d’un lecteur d’écran humain ou de toutes les combinaisons durée/chapitres/langues.

## Outillage

Worktree absente au premier accès : créée en détaché à la révision requise avant toute exécution. Avertissement Node NO_COLOR/FORCE_COLOR sans incidence fonctionnelle. Trois timeouts initiaux à90s sont conservés dans les journaux JSON et les traces ; quota sans POST avant arrêt, disponibilité et assetsHTTP200. Rejeux tous inférieurs à33s après baisse de charge. Charge machine observée voisine de12 pendant la campagne ; les durées de test ne sont pas des mesures de performance produit.

## Remise

Worker navigateur terminé, aucun processus de test laissé actif. `git diff --exit-code` réussit : aucun fichier suivi modifié. Preuves : `parcours.log/json`, `rejeu.log/json`, `unitaires.log`, configurations et sondes copiées, trois traces initiales et capture viewport `maths-reprise.png` (1082×2202). Aucun autre rapport de cette campagne consulté.
