# Vérification des cours et exercices — 19 octobre 2026

Le contrôle technique porte sur les 19 matières. La revue pédagogique est ciblée :
ce rapport ne constitue pas une validation exhaustive de chaque cours et corrigé.
Les cinq agents demandés ont été lancés, mais leur exécution a été interrompue par
une limite d’utilisation avant les rapports finaux. Les constats ci-dessous ont
été reproduits par Codex sur le contenu réellement assemblé.

Version source contrôlée : `416738e` (atelier de formules compris).
Aucun cours ou exercice n’a été modifié pendant cette vérification.

## Résultats techniques

- 192 tests unitaires réussis, dont les contrôles de rattachement et les calculs.
- 19 matières, 94 thèmes et 806 sections de cours assemblées.
- 5 558 instances de jeux, 23 787 questions et 2 291 cartes inspectées dans cet assemblage.
- Aucun index de réponse invalide ni choix textuellement dupliqué dans les questions à choix contrôlées.
- Pour les choix et flashcards générés automatiquement par section : aucune absence
  textuelle dans la section associée, après normalisation des espaces, de la casse
  et des marqueurs gras. Cela ne démontre pas la qualité sémantique du contenu.
- 17 jeux d’études de documents présents. Plusieurs contreviennent à la règle du
  chapitre exclusif ; quatre exemples ont été reproduits ci-dessous. Il faut
  examiner les 17, sans présumer que chacun présente le même défaut.

Les nombres de jeux/questions/cartes désignent des instances de l’assemblage,
pas nécessairement des contenus uniques. Aucun test navigateur supplémentaire
n’a été lancé pour cet audit ; aucun contrôle de base de données n’était requis.

## 1. Priorité haute — écriture comptable déséquilibrée

Matière : Gestion et Finance, thème `gf-t1`, chapitre d’indice 20,
« Étude de cas guidée — un cycle d’achat complet ».

Source : [approfondi-1.json, ligne 833](../app/content/gestion-finance/approfondi-1.json#L833).
Le texte est bien présent dans le cours assemblé.

L’exemple calcule correctement un net commercial de 1 900 €, un escompte de 19 €,
un net financier de 1 881 €, une TVA de 376,20 € et un net à payer de 2 257,20 €.
Mais l’écriture proposée inscrit simultanément :

- débit 607 : 1 881 € ; débit TVA : 376,20 € ; total débit : 2 257,20 € ;
- crédit escompte 765 : 19 € ; crédit fournisseur : 2 257,20 € ; total crédit : 2 276,20 €.

L’écriture est déséquilibrée de **19 €**. Avec l’escompte comptabilisé séparément
au crédit de 765, le débit de 607 doit être **1 900 €**. Les deux totaux deviennent
alors 2 276,20 €. Corriger le cours et vérifier les exercices qui reprennent cet exemple.

## 2. Priorité haute — études de documents hors du chapitre associé

Le moteur conserve les jeux manuels rattachés par `GAME_SECTION` :
[index.js, ligne 341](../app/src/data/index.js#L341).
Un rattachement valide techniquement ne garantit pas que toutes les questions
portent sur le contenu de ce seul chapitre. Les jeux générés localement sont
contrôlés plus strictement que ces dossiers manuels.

### Première Droit, thème 1

`p1-droit-t1-doc` est placé au chapitre d’indice 2, « Les sources du droit et la
hiérarchie des normes » : [rattachement](../app/content/p1-droit/exercices-sections.json#L2).
Cependant le dossier interroge aussi sur les caractères de la règle de droit et
ses fonctions, enseignés aux chapitres d’indices 1 et 0.
Preuve : [dossier, ligne 119](../app/content/p1-droit/etudes-documents.json#L119).

### Première Économie, thème 1

`p1-eco-t1-doc` est placé au chapitre d’indice 1, « La rareté et les choix » :
[rattachement](../app/content/p1-economie/exercices-sections.json#L2).
Il demande aussi le coût d’opportunité, le rôle des agents et le circuit
économique, étudiés aux chapitres d’indices 2, 5 et 6.
Preuve : [dossier, ligne 124](../app/content/p1-economie/etudes-documents.json#L124).

### Terminale Droit, thème 8

`droit-t8-doc` est placé au chapitre d’indice 2, « La propriété intellectuelle :
marque, droit d’auteur et contrefaçon » :
[rattachement](../app/content/droit/exercices-sections.json#L20).
Les questions portent aussi sur l’entreprise individuelle, le contrat de société
(article 1832), la responsabilité des associés et la concurrence déloyale.
Ces notions ne sont pas enseignées dans cette section consacrée à la propriété
intellectuelle. Preuve : [dossier, ligne 357](../app/content/droit/etudes-documents.json#L357).

### Terminale Économie, thème 6

`eco-t6-doc` est placé au chapitre d’indice 2, « Déficit et dette publics : le coût
de l’intervention » : [rattachement](../app/content/economie/exercices-sections.json#L3).
Il demande notamment les fonctions de Musgrave et les défaillances de marché,
absentes de cette section sur le déficit et la dette.
Preuve : [dossier, ligne 3](../app/content/economie/etudes-documents.json#L3).

**Correction recommandée :** fractionner chaque dossier en exercices réellement
centrés sur une section, avec documents, questions et corrections correspondants.
Déplacer un dossier entier vers un autre chapitre ne suffit pas s’il traite
plusieurs chapitres. Un dossier transversal peut être conservé dans un espace de
révision du thème, mais ne doit pas être présenté comme exercice d’un seul chapitre.

## 3. Priorité moyenne — responsabilité des associés trop généralisée

Dans [Droit, études de documents, ligne 413](../app/content/droit/etudes-documents.json#L413),
la réponse attendue est « limitée à leurs apports » et le corrigé explique :
« La personnalité morale limite en principe la responsabilité aux apports. »

La personnalité morale ne suffit pas à déterminer cette responsabilité : elle
dépend de la forme sociale. Par exemple, en SNC les associés sont indéfiniment
et solidairement responsables (Code de commerce, article L221-1) ; pour les sociétés
civiles, voir notamment l’article 1857 du Code civil.

**Correction recommandée :** préciser une forme telle que SARL/SAS dans l’énoncé
et expliquer la responsabilité correspondante, au lieu de la déduire de la seule
personnalité morale. Cette généralisation doit être revue même si la formulation
« en principe » atténue la portée de l’affirmation.

## Couverture technique par matière

| Matière | Thèmes | Sections | Instances de jeux |
|---|---:|---:|---:|
| gestion-finance | 3 | 64 | 474 |
| management | 3 | 42 | 394 |
| droit | 4 | 53 | 386 |
| economie | 5 | 53 | 339 |
| maths | 7 | 53 | 213 |
| philosophie | 8 | 87 | 381 |
| histoire-geo | 6 | 87 | 709 |
| langues | 10 | 41 | 464 |
| mercatique | 4 | 39 | 300 |
| rh-communication | 4 | 35 | 234 |
| sig | 4 | 36 | 233 |
| p1-sgn | 4 | 54 | 424 |
| p1-management | 3 | 17 | 80 |
| p1-droit | 4 | 19 | 145 |
| p1-economie | 5 | 41 | 217 |
| p1-maths | 7 | 21 | 89 |
| p1-francais | 4 | 31 | 249 |
| p1-histoire-geo | 6 | 27 | 182 |
| p1-langues | 3 | 6 | 45 |

## Limites et suite recommandée

La revue factuelle détaillée de toutes les sections, notamment histoire,
philosophie, français et langues, n’a pas été achevée par les agents. Le contrôle
technique global les inclut, mais ne permet pas de déclarer leur contenu sans erreur.
Les calculs de l’atelier sont couverts par les tests, sans constituer une validation
indépendante exhaustive de toutes les formulations pédagogiques.

À traiter en premier : corriger l’écriture GF, découper les dossiers multi-chapitres,
puis ajouter des tests de contenu sur ces contre-exemples. Reprendre ensuite la
revue factuelle matière par matière. Les constats de ce rapport sont des résultats
d’audit ; ils ne sont pas encore des corrections publiées.
