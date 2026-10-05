# Architecture de RévizSTMG

Ce document décrit l'application telle qu'elle est (inventaire d'octobre 2026) et
l'architecture visée par la refonte. Pour régénérer les chiffres de l'inventaire :

```bash
cd app && node scripts/inventaire.mjs
```

## 1. État des lieux

### Volumes

| Dossier | Fichiers | Lignes | Taille |
|---|---:|---:|---:|
| `src/` (racine : store, comptes, services) | 21 | 4 945 | 355 Ko |
| `src/pages/` | 28 | 6 418 | 370 Ko |
| `src/components/` | 18 | 4 274 | 214 Ko |
| `src/games/` | 22 | 2 451 | 105 Ko |
| `src/data/` | 42 | 23 503 | **1 991 Ko** |

Le contenu pèse les deux tiers du code. Comme tout est compilé dans un seul
`index.html` de 2,7 Mo, chaque élève télécharge **toutes** les matières, même
celle qu'il n'ouvrira jamais.

### Comment l'app démarre

1. `main.jsx` monte `App.jsx`, qui déclare 30 routes (`HashRouter`).
2. `store.jsx` charge l'état de l'élève (localStorage, puis compte Supabase s'il
   y en a un). Il importe `data/index.js` pour calculer les scores : il n'a besoin
   que des identifiants des thèmes et de leurs exercices.
3. À l'import de `data/index.js`, **tout le contenu est assemblé d'un coup** (voir 1.4).

### Les écrans (`src/pages/`, 28 fichiers)

| Groupe | Pages |
|---|---|
| Entrée | `Landing` (choix du niveau), `Home` (tableau de bord) |
| Parcours de cours | `Subject` → `Theme` → `Chapter`, `Favoris`, `Programme` |
| Révision | `Revise` (file de révision), `FlashcardsPage`, `Express` (5 min), `DailyChallenge`, `BacBlanc`, `Formulas`, `Methodo`, `GrandOral` |
| IA | `Coach` (méthodes et minuteur), `CoachAI` (analyse des résultats), `PhotoFiche` (fiche par photo) |
| Social | `Classe` (1 438 lignes : mur, quiz, duels, groupes, tableau prof), `Friends` (amis et duels), `Leaderboard` (classement et ligues), `Parent` |
| Compte et motivation | `Profile`, `Badges`, `Shop` |
| Pages d'information | `Guide`, `Faq`, `Privacy` |

### Les jeux (`src/games/`, 22 fichiers)

`GameHost` choisit le composant selon `game.type` : `Qcm`, `VraiFaux`, `Trou`,
`Saisie`, `Tri`, `Association`, `Ordre`, `Memory`, `Calcul`, `CasPratique`,
`DocStudy`, `SqlQuery`, `Comprehension`, `TypedGen` (langues), `Flashcards`.
S'y ajoutent `ThemeTest`, `Exam` (bac blanc), `CoachSession`, `KahootQuiz`.
**`DuelQuiz.jsx` n'est importé nulle part** : c'est le seul fichier mort de l'app.

### Le contenu (`src/data/`)

`data/index.js` (954 lignes) importe 30 fichiers et, pour chaque thème :

1. part du thème de base de la matière (`gestion.js`, `droit.js`…) ;
2. applique les couches dans cet ordre : `lessons` (remplace), `coursreels`
   (remplace le corps du cours), `enrich`, `philocours`, `approfondir` 1 à 4,
   `sicsi` (ajoutent à la fin), `histoiredeep` et `managementdeep` (ajoutent en tête) ;
3. masque les sections « prérequis de Première » (`PREREQ_SECTIONS`) ;
4. supprime les doublons de sections (`dedupeCourse`) ;
5. remonte l'accroche « cours réel » en tête ;
6. fabrique une intro et un mémo « L'essentiel » quand il en manque ;
7. ajoute l'étude de documents aux exercices.

La page d'un thème range les chapitres en quatre catégories, selon le champ
`group` de chaque section : aucun (« Le cours »), `approf`, `methode`, `cas`.
Pour les couches `approfondir`, le `group` écrit dans le JSON l'emporte ;
sinon il est déduit du titre (`courseGroupOf` : « MÉTHODE » → `methode`,
« Étude de cas » / « Cas pratique » → `cas`). Les exemples traités et les
dissertations guidées sont rangés dans `cas` (dans `methode` en maths), pour que
« Le cours » ne contienne que des chapitres de cours.

Un titre de chapitre nomme ses notions essentielles (« La politique de prix :
élasticité, écrémage, pénétration, alignement »), pas une mise en situation.
Changer un titre n'est pas anodin : `dedupeCourse` fusionne deux sections de même
nature dont les titres partagent assez de mots, et `courseGroupOf` lit le titre.
Après un renommage, comparer le nombre de chapitres et leur catégorie avant et
après (`EMPREINTE_DETAIL=1 npm test`, voir le README).

Les exercices de chaque chapitre ne sont pas stockés : `themeChapters()` les
**génère à l'affichage** à partir du texte du cours (QCM, trous, tri…), avec
`shuffle()`. Chaque visite tire donc des questions différentes.

Nature des fichiers de `data/` :

| Type | Fichiers |
|---|---|
| Donnée pure, convertible en JSON telle quelle | les 11 matières de Terminale, `premiere`, `lessons`, `coursreels`, `enrich`, `philocours`, `approfondir` 1-4, `sicsi`, `histoiredeep`, `managementdeep`, `keyterms` (sauf une fonction), `pieges`, `caspratiques`, `docstudies`, `sections`, `formulas`, `methodo`, `glossary`, `comprehension`, `shop` |
| Donnée + 4 fonctions | `langues` : 4 exercices pointent vers un générateur de `langgen.js` (`gen: genVerbEN`…) |
| Code (moteurs) | `index`, `study`, `srs`, `coachAI`, `dailyChallenge`, `rewards`, `tracks`, `ficheAI`, `langgen` |

### Qui a besoin de quel contenu

| Besoin | Fichiers |
|---|---|
| Index léger (ids, noms, couleurs, ids d'exercices) | `store.jsx`, `tracks.js`, `StatsCharts`, `Home`, `Favoris` |
| Une seule matière | `Subject`, `Theme`, `Chapter`, `ThemeTest`, `Course` |
| Tout le contenu | `study.js` (bac blanc, file de révision, programme), `coachAI.js`, `Friends` (quiz de duel), recherche du `Layout` |

C'est ce qui rend le chargement à la demande possible : seules quelques pages
transversales ont besoin de tout.

## 2. Architecture visée

### Principes

- **Le contenu n'est pas du code.** Il vit en JSON, rangé par matière. On peut le
  corriger sans toucher au code, et les tests vérifient qu'il reste valide.
- **On ne charge que ce qu'on ouvre.** Au démarrage, l'app charge son code et un
  index léger. Le contenu d'une matière arrive quand l'élève l'ouvre. Les pages
  transversales (bac blanc, révision, coach IA, recherche) chargent tout.
- **Le hors-ligne reste complet.** Le service worker met en cache tous les
  fichiers après la première visite.
- **Rien ne change pour l'élève**, sauf la vitesse. Les tests le garantissent :
  le contenu assemblé et les exercices générés doivent rester identiques.

### Dossiers

```
app/
  content/                       le contenu, en JSON
    ordre.json                   ordre d'affichage des matières
    commun/                      contenu qui ne dépend d'aucune matière
      formules.json, methodo.json, glossaire.json, boutique.json,
      definitions-matieres.json, reponses-acceptees.json, notions-liees.json
    <id-matière>/                un dossier par matière (gestion-finance, droit…)
      matiere.json               la matière et ses thèmes de base
      cours-complets.json        couche lessons
      cours-reels.json           couche coursreels
      ...                        une couche = un fichier, seulement si la matière en a
  scripts/
    plugin-contenu.mjs           fabrique l'index léger à la compilation
    publier.mjs                  dépose la version compilée à la racine
    inventaire.mjs               inventaire du code (ce document)
  src/
    content/                     chargement et assemblage du contenu
      contenu.js                 lecture des fichiers, chargement par matière
      Contenu.jsx                attente du contenu dans les pages
    data/                        moteurs restants (study, srs, coachAI…)
    pages/, components/, games/  inchangés au départ
  tests/                         tests (contenu, logique, parcours)
```

Les clés des fichiers de couche restent les identifiants de thème actuels
(`gf-t1`, `droit-t5`…). Les 4 générateurs de langues sont désignés par leur nom
(`"gen": "genVerbEN"`) et retrouvés dans `langgen.js` au chargement.

### Chargement

- L'index léger (module `virtual:contenu-index`) est fabriqué à la compilation à
  partir des `matiere.json`. Il donne, pour chaque matière et chaque thème, ce
  dont le store et les menus ont besoin.
- `loadSubject(id)` importe les fichiers de la matière (un fichier par matière
  après compilation), assemble les thèmes comme aujourd'hui et complète l'index.
  Les objets de l'index sont complétés sur place : les pages qui les ont déjà en
  main voient le contenu arriver.
- `loadAll()` charge toutes les matières, pour les pages transversales.
- Le composant `<Contenu>` affiche un indicateur le temps du chargement.
- Les pages sont elles aussi chargées à la demande (`React.lazy`).

### Mise en ligne

Le build produit `index.html` et un dossier `assets/` de fichiers nommés selon
leur contenu (`assets/contenu-droit-DwRPmNwM.js`). Après les tests, le workflow
dépose ce résultat à la racine du dépôt avec `scripts/publier.mjs`, qui garde les
fichiers de la version précédente pour les élèves qui l'ont encore ouverte.

## 3. Étapes de la refonte

1. ✅ **Tests** : figer le comportement actuel avant de toucher à quoi que ce soit.
2. ✅ **Contenu en JSON** : 138 fichiers dans `app/content/`, résultat assemblé
   identique (empreinte inchangée).
3. ✅ **Chargement à la demande** : un fichier par page et par matière, index léger
   fabriqué à la compilation (`scripts/plugin-contenu.mjs`), `<Contenu>` pour
   attendre une matière, service worker qui met tout en cache. Démarrage : 590 Ko au
   lieu de 2,64 Mo.
4. Ensuite : trier les pages, ranger le code par fonctionnalité, unifier le moteur
   d'exercices, design commun. Le code commun (590 Ko) peut encore maigrir en
   chargeant à la demande les panneaux du `Layout` (personnalisation,
   dictionnaire, accueil).
