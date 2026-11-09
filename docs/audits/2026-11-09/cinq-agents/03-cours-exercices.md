# Audit cours et exercices : reprise du 9 novembre 2026

Référence auditée : `c702938bb55b3456733cd7726951b67940fcd2f4`. Lecture seule du produit, aucun fichier source/test modifié, aucun appel IA ou accès réel à des comptes. Le périmètre est annoncé dans `AUDIT-CINQ-AGENTS-SITE-20261108` du journal partagé.

## Couverture réelle

- Reprise des résultats du 8 novembre : 32 tests ciblés réussis dans six fichiers (rattachements, variété, textes à trous, langues et exercices manuels), journal `/workspace/output/audit-cinq-20261108/cours/tests-unitaires.log`.
- Nouvelle sonde exécutée avec `vite-node` depuis `app/` : 110 thèmes, 861 sections et 4 320 jeux produits pour ce tirage ; contrôle de 5 332 questions à choix. Aucun choix textuellement identique, aucun texte à trous dépourvu de blanc reconnu par le moteur. Ces nombres décrivent un tirage du contenu chargé, pas une certification pédagogique de chaque question ni de toutes les combinaisons aléatoires.
- Inspection sémantique ciblée de six sections et de leurs jeux manuels : GF, mercatique, RH-communication et SIG.
- Preuves nouvelles : `/workspace/output/audit-cinq-20261109/cours/verification.json`, `verification.log`, `rattachements.json`, `rattachements.log`. Scripts de reproduction dans le même dossier.

## Défaut confirmé C-01 : des jeux manuels mélangent encore des notions absentes du chapitre associé

**Priorité : 7/10.** Cela contrevient à l'exigence explicite de questions exclusivement liées au cours du chapitre. Le rattachement est valable numériquement mais n'est pas vérifié question par question.

### Reproduction principale : réserve légale dans le seuil de rentabilité

1. Charger la Gestion et Finance Terminale puis le chapitre `gf-t3`, index 5, « Le seuil de rentabilité et le point mort » (`/#/subject/gestion-finance/theme/gf-t3/chapter/5`).
2. Inspecter/jouer le texte à trous manuel `gf-t3-trou` jusqu'à « La réserve légale représente 5 % du bénéfice jusqu’à 10 % du ___ ».
3. Le correcteur attend **capital** et donne une explication sur la réserve légale. Le cours associé porte sur SR, taux de MCV et point mort ; il n'enseigne ni réserve légale ni affectation du résultat.

**Attendu :** les questions de ce chapitre mobilisent les notions qu'il enseigne. La question sur la réserve légale doit appartenir à un cours qui la définit, ou le jeu doit être scindé avec rattachements explicites.

**Sources :** `app/content/gestion-finance/exercices-sections.json:24` affecte tout `gf-t3-trou` à l'index 5 ; question dans `app/content/gestion-finance/matiere.json:954` ; cours réel dans `app/content/gestion-finance/approfondi-1.json:1871` ; mécanisme ajoutant le jeu entier dans `app/src/data/index.js:357`.

**Preuve :** `rattachements.json`, entrée `gf-t3`, contient côte à côte la section finale chargée et le jeu accessible ; la sonde `verification.json` retrouve effectivement cette question dans `jeuxDuChapitre`, et pas seulement dans une banque inutilisée.

### Autres occurrences vérifiées de la même cause

| Jeu / chapitre affecté | Question étrangère au contenu de cette section | Références |
|---|---|---|
| `mkg-t1-trou`, index 1, motivations/freins et processus d'achat | définition de **perception**, alors que cette section enseigne les mobiles, freins et étapes d'achat ; la perception apparaît dans d'autres sections du thème | `app/content/mercatique/exercices-sections.json:4`, `app/content/mercatique/matiere.json:418` |
| `rh-t2-trou`, index 2, cas de répartition des tâches et résolution du conflit | **conformisme** demandé alors que le cas enseigne organisation, négociation, médiation et arbitrage ; le conformisme figure dans les sections 0, 3 et 7 | `app/content/rh-communication/exercices-sections.json:6`, `app/content/rh-communication/matiere.json:781` |
| `sig-t1-trou`, index 2, commande en ligne et PGI | distinction entre SI et **système informatique** demandée sans être expliquée dans ce cas centré sur cohérence de la commande, stock et base unique | `app/content/sig/exercices-sections.json:4`, `app/content/sig/matiere.json:380` |

Ces quatre occurrences appartiennent au même défaut de contrôle des jeux manuels ; ne pas les compter comme quatre familles de pannes indépendantes. D'autres réponses absentes littéralement du cours sont des candidats de relecture, pas automatiquement des défauts : par exemple une conjugaison d'exercice peut être une application légitime d'une règle sans que sa phrase exacte figure dans le cours.

## Faux positifs de l'ancienne sonde écartés

1. Les huit « choix doublons » signalés par `sonde-resultats.json` utilisent une normalisation qui supprime accents, signes et vocalisation. Elle confond notamment `r < 0` avec `r > 0`, `è` avec `e` ou plusieurs formes arabes vocalisées. Ces distinctions sont pédagogiquement voulues. Le QCM corrige par indice. Le nouveau contrôle conservant ces distinctions trouve **zéro choix exactement répété** dans les 5 332 questions inspectées.
2. Les neuf « trous sans blanc » étaient recherchés uniquement avec quatre underscores. Les phrases manuelles utilisent trois underscores, et `app/src/games/Trou.jsx:24` accepte tout groupe d'au moins deux (`/_{2,}/`). Le nouveau contrôle trouve **zéro blanc manquant**.
3. `feedback` absent littéralement mais `feed-back` présent dans le cours n'est pas une notion étrangère. De même, `collecter` face à `collecte` ne prouve pas un mauvais rattachement.

## Amélioration pédagogique ciblée, distincte du défaut confirmé

**Priorité 4/10 :** préciser « marge sur coût variable **unitaire** » dans l'avertissement `app/content/gestion-finance/approfondi-1.json:1906`. Dire que diviser les charges fixes par « la marge en euros » donne des unités est ambigu : la marge totale en euros donne un ratio, seule la marge unitaire donne un nombre d'unités. Les autres formules du paragraphe SR/taux sont cohérentes. Relecture de formulation recommandée, sans prétendre une erreur de toute la méthode.

## Limites

- Pas de nouvelle exécution navigateur de ce volet : les reproductions supplémentaires sont faites sur le contenu réellement assemblé et les jeux retournés au moteur. Aucun résultat de test navigateur n'est inventé.
- Pas de validation exhaustive des programmes officiels, de chaque définition, des PDF ni de toutes les langues. L'ancienne sonde ne relevait aucune même source exactement répétée entre deux jeux d'une section pour son tirage ; cela ne garantit pas l'absence de répétitions sémantiques ou lors de relances.
- Aucune correction n'a été appliquée dans le cadre de cet audit.
