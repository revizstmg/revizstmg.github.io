# Audit05 — Terminale

Version gelée : `f0f70220fd34f6fbba1d6416f3c99e6a0cd3e1e7`, source `05bd1531da93f095780ec1492b756459153a722a`. Worktree détachée `wt-05`, compilation racine servie par `python3 -m http.server 4215 --bind 127.0.0.1`. SHA256 index local : `c0cb4337d48b30af6dd6e3fe3556fea854d8b8a7f5e2ae60e7f2089c4d8ea309`, identique à VERSION.json. Référence fournie : CI41503625386,691 unitaires dans chaque fuseau et359 parcours ; ces suites n’ont pas été relancées.

Audit en lecture seule du produit, un worker Chromium, données synthétiques de `app/tests/parcours/eleve.js`, réseau externe bloqué. Aucune modification suivie, aucun compte réel, aucune mutation Supabase. Configurations et sondes temporaires seront copiées dans `preuves-05/`.

## Commandes et méthode

- `git -C /workspace/revizstmg.github.io worktree add --detach /workspace/work/audit10-20261102/wt-05 f0f70220fd34f6fbba1d6416f3c99e6a0cd3e1e7`
- Lien `app/node_modules` vers les dépendances existantes ; aucun build.
- Depuis `wt-05/app` : `npx playwright test -c audit05.config.js audit05-new.spec.js pagination-cours.spec.js exercices-chapitre.spec.js audit-quatre-correctifs.spec.js audit05-favorite.spec.js --grep 'nouveau catalogue|TVA reprise|routes invalides|impression TVA|formats distincts|calculs du chapitre|philo-methode|matière et thème|favori GF'`.

## Erreurs d’outillage et limites initiales

Premier essai de création des fichiers : préfixe `app/` employé depuis le dossier `app`, donc deux erreurs « No such file or directory ». Corrigé avant contrôle navigateur, aucun fichier produit affecté.

Première exécution : attente8s trop courte sur le chargement de matière GF dans la machine partagée. L’assertion n’a pas vu `main h1` à temps, mais le snapshot final montre la matière normalement rendue. Erreur conservée (`run-initial.log`, `results-initial.json`, `test-results-initial/`). Interruption volontaire puis reprise avec attente20s/timeout90s et service worker bloqué. Ce délai seul n’est pas un défaut produit confirmé ; le hors ligne/PWA n’est pas couvert par la reprise.

## Lecture du code et limites de contenu

`app/src/pages/Chapter.jsx:26` et `Theme.jsx:38` vérifient l’appartenance du thème à la matière. `app/src/data/index.js:1114` ne rassemble que les jeux du chapitre et ses cartes ; `sectionDefinitions` (ligne1204) reprend les définitions de la section, avec ses propres paires et sans secours de matière. Ces lectures appuient la cohérence technique ; elles ne prouvent ni l’exactitude pédagogique de chaque proposition ni toutes les combinaisons possibles.

Le profil synthétique est Terminale/Gestion-Finance et Premium. Les autres spécialités sont échantillonnées par adresses directes ; la sélection de spécialité dans les paramètres relève d’un autre périmètre. Les services réels de compte, de sauvegarde, les fournisseurs IA et les règles de base déployées ne sont pas certifiés. Le réseau refusé peut afficher une sauvegarde en attente ; aucune preuve de synchronisation réelle n’en est déduite.

## Résultats récupérés et contre-vérifications du3 novembre

Le lot du2 novembre est allé à son terme après l’interruption de la conversation : **16 réussites,2 échecs,0 ignoré**, durée353,4s (`results.json`, `run.log`). Aucun lot relancé le3 novembre. Deux seules contre-vérifications isolées exécutées : **2 réussies en18,6s**, dont une caractérisation positive du défaut ci-dessous. Commande depuis `wt-05/app` :

`node node_modules/@playwright/test/cli.js test -c audit05-replay.config.js audit05-replay.spec.js --grep 'TVA reprise|contreverification'`

La première tentative de préparation de ce rejeu a répété une erreur de chemin `app/` depuis `app` ; elle a échoué avant le navigateur. Les fichiers du rejeu correct et son journal sont conservés. `git diff --exit-code` est passé après vérification : aucun fichier suivi modifié.

### Couverture fonctionnelle réellement obtenue

Les dix sondes nouvelles ont chacune parcouru catalogue, matière, dernier thème publié, premier chapitre, lecteur, onglet Définitions et disponibilité des exercices. Elles ont relevé zéro exception navigateur. Il s’agit d’échantillons de chapitres, et non de tous les chapitres de ces matières.

| Matière | Thème échantillonné | Chapitre lu | Jeux listés |
|---|---|---|---:|
| Gestion-Finance | gf-t3 | Marge sur coût variable et seuil de rentabilité |1|
| Management | mgmt-t3 | RSE, performance globale et parties prenantes |2|
| Droit | droit-t8 | Personnalité juridique et statut de l’animal |1|
| Économie | eco-actu | Utiliser une actualité au bac |2|
| Maths | math-c7 | Loi normale |1|
| Philosophie | philo-methode | Dissertation en bref |10|
| Histoire-géographie | hg-g3 | Atouts et contrastes du territoire français |1|
| Mercatique | mkg-t4 | Données, consentement, RGPD et omnicanal |3|
| RH-communication | rh-t4 | Coût du travail |1|
| SIG | sig-t4 | Rançongiciels et critères DICP |10|

Les autres contrôles réussis sont : refus d’une route matière/thème incohérente sans changement de reprise ; favori GF ajouté, conservé au rechargement et retiré ; ouverture de Memory et de deux formats QCM distincts dans le droit ; variation des nombres d’un exercice de taux en maths ; remise en ordre de dissertation ; impression TVA avec toutes les fiches visibles, contenu conservé et au plus2 feuilles A4.

La première sonde TVA visait par erreur `gf-t1/chapter/2`, qui correspond réellement aux immobilisations. Cet échec de mon hypothèse d’index est conservé dans `results.json` et n’est pas un défaut produit. La page publique compilée `cours/terminale/gestion-et-finance/appliquer-les-regles-comptables/la-tva-collectee-deductible-a-decaisser/index.html` pointe vers **`gf-t1/chapter/0`**, également visé par le test d’impression déjà réussi. Le rejeu sur cet index correct confirme : titre TVA,4 fiches, passage à la deuxième fiche, conservation après reload, boucle de la dernière à la première, QCM achevé avec2 questions. Capture `tva-score.png` :1/2 bonne réponse,50%, une erreur et bouton « Refaire mes erreurs (1) ». Ce parcours fournit un cycle complet avec erreur élève et bilan. Le carnet d’erreurs lui-même n’a pas été ouvert.

L’onglet Définitions et les formats ont été contrôlés fonctionnellement ; tous les libellés/réponses et la variété de tous les chapitres n’ont pas été relus. Les scripts `audit05-content.test.js` et `audit05-print.spec.js`, préparés avant interruption, n’ont pas été exécutés et n’apportent aucune couverture additionnelle. Aucune suite unitaire ni suite générale exécutée pour cet audit.

## Défaut reproduit T05-01 — Une adresse de chapitre invalide change le dernier thème

**Priorité proposée : P3, faible.** Prérequis : profil synthétique et navigation par adresse modifiée. Sur le même site, après ouverture de `/#/subject/maths/theme/math-c3/chapter/0`, `stmg_progress_v2.lastChapter` vaut `{subjectId:'maths',chapterId:'math-c3'}`.

1. Ouvrir `/#/subject/droit/theme/droit-t5/chapter/-1`.
2. La page affiche correctement « Page introuvable ».
3. Lire `JSON.parse(localStorage.stmg_progress_v2).lastChapter`.

Attendu : l’adresse invalide ne remplace pas le dernier thème valide. Observé : `{subjectId:'droit',chapterId:'droit-t5'}`. Le premier lot l’a observé sur `-1`. Le rejeu isolé remet maths avant chaque essai et confirme le même résultat pour **`-1`, `999` et `abc`**. Il ne s’agit pas d’un délai de chargement : la404 est bien affichée et l’écriture du thème droit est attendue explicitement par le test de caractérisation.

Cause cohérente dans le code : `app/src/pages/Chapter.jsx:39` ne trouve pas de chapitre pour ces indices ; l’effet ligne53 appelle néanmoins `setLastChapter(sid,tid)` dès lors que matière et thème existent, puis le rendu ligne62 affiche la404. Le setter `app/src/store.jsx:452` persiste le thème fourni sans validation du chapitre.

Impact établi : dernier thème local incorrect malgré refus de la page. Les consommateurs de ce marqueur peuvent recevoir un faux contexte (`data/seance.js:77`, `data/missions.js:17`, repli de `data/revisionPaths.js:24`). Leur comportement final n’a pas été exercé : ce sont des conséquences possibles de lecture. L’accueil privilégie le repère local détaillé `readPosition` (`pages/Home.jsx:29`), donc cet audit ne prétend pas que le bouton Reprendre de l’accueil ait été détourné dans ce scénario.

Preuves : échec original et attachement `index--1` dans `results.json` ; trace et snapshot dans `test-results/audit05-new-routes-invalides-index-préservent-reprise/` ; rejeu `results-replay.json`, attachement `indices`, `replay.log` ; capture viewport `index-invalide.png`. Sondes et configurations copiées dans `preuves-05/`. Aucun correctif appliqué.

## Risques non reproduits et limites finales

Aucun autre défaut confirmé. Les conséquences fonctionnelles du marqueur erroné sur missions/séance et l’exhaustivité pédagogique restent non vérifiées. Les accès et services externes ont été bloqués ou simulés par le helper ; sauvegarde distante, règles réelles, IA et abonnements déployés restent hors certification. La reprise détaillée est locale et testée pour TVA uniquement. Les18 scénarios du lot et leurs rejeux ne représentent pas18 fonctions exclusives ni une certification du catalogue entier.
