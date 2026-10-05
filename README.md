# RévizSTMG

Application de révision pour le bac STMG (Première et Terminale) : cours, exercices
corrigés générés automatiquement, flashcards, bac blanc, coach IA, révision entre amis
et en classe. Installable sur téléphone et utilisable hors ligne.

- **En ligne :** https://revizstmg.github.io
- **Code source :** `app/`
- **Version compilée :** les fichiers à la racine du dépôt (`index.html`, `sw.js`,
  `manifest.webmanifest`, icônes). Le workflow de publication les régénère :
  ne les modifiez jamais à la main.

> Jusqu'en octobre 2026, l'application vivait dans le dépôt `Gabriel-Merlin/NAH`,
> à côté du site du lycée contre le harcèlement. Elle a été déplacée ici avec tout
> son historique. Les deux projets partagent encore le même projet Supabase.
>
> Ce document décrit l'application **avant la refonte d'octobre 2026**. Mettez-le à
> jour à chaque étape de la refonte.

## Ce que fait l'application

| Domaine | Contenu |
|---|---|
| Matières | 11 matières de Terminale : tronc commun (management, droit, économie, maths, philosophie, histoire-géo, langues) et spécialités (gestion-finance, mercatique, RH & communication, SIG). Plus les matières de Première. |
| Parcours | Matière → thème → chapitre, avec les onglets Cours, Définitions et Exercices. |
| Exercices | Une vingtaine de types : QCM, vrai/faux, texte à trous, saisie, tri, association, remise en ordre, calcul, memory, requêtes SQL, cas pratique, étude de documents, compréhension en langue… |
| Révision | Flashcards à répétition espacée, révision express de 5 minutes, défi du jour, bac blanc chronométré, programme, formulaire, méthodologie par épreuve, Grand Oral. |
| IA | Coach IA qui analyse les résultats et propose un plan. Fiches créées à partir de photos de cours (fonction `fiche-vision`, pas encore déployée). |
| Social | Comptes élève et prof, classes (mur, quiz, duels, groupes), amis et duels, classement hebdomadaire et ligues, espace parent. |
| Motivation | XP, niveaux, badges, série de jours, boutique de pièces, objectifs de la semaine. |
| Confort | Application installable (PWA), hors ligne, rappels de révision, interface en français, anglais et espagnol, réglages d'accessibilité (dys, contraste, lecture audio). |

## Démarrer

Il faut Node.js 18 ou plus récent.

```bash
cd app
npm install
npm run dev       # serveur de développement : http://localhost:5173 (pages sous /#/…)
npm run build     # compile l'application dans app/dist/
npm run preview   # sert la version compilée pour la vérifier
```

`npm run build` vide `app/dist/` avant d'y écrire, puis lance `pwa-postbuild.mjs`.
`app/dist/` n'est pas versionné : c'est le workflow de publication qui recopie son
contenu à la racine.

## Tests

```bash
cd app
npm test              # logique et contenu (quelques secondes)
npm run build && npm run test:parcours   # parcours dans un vrai navigateur (~3 min)
```

- **Contenu** (`tests/contenu.test.js`) : une empreinte de tout ce que voit l'élève,
  thème par thème (cours assemblé, exercices générés, flashcards, définitions,
  tests de thème, quiz). Le hasard des exercices est fixé, donc un même code donne
  toujours la même empreinte. Si vous corrigez un cours exprès, mettez les
  empreintes à jour avec `npm run test:maj`. Si l'empreinte change alors que vous
  n'avez touché qu'au code, c'est que l'élève verra autre chose : cherchez pourquoi.
  `EMPREINTE_DETAIL=1 npm test` écrit le détail de chaque thème dans
  `tests/.detail/` pour comparer deux versions.
- **Logique** (`tests/logique.test.js`) : niveaux, scores, répétition espacée,
  récompenses, badges, calculs chiffrés, filières.
- **Parcours** (`tests/parcours/`) : écran de connexion, accueil, un cours suivi
  d'un QCM fait jusqu'au bout, les 25 pages de l'app, et chaque thème des 19
  matières. Les parcours démarrent avec un élève fictif déjà inscrit et bloquent
  tout accès extérieur : ils ne touchent jamais la vraie base Supabase.

## Mise en ligne

Travaillez sur une branche, puis fusionnez dans `main`. Le workflow
`.github/workflows/deploy.yml` se lance à chaque envoi qui touche `app/` :

1. sur **toutes les branches** : tests de la logique et du contenu, compilation,
   parcours dans le navigateur ;
2. sur **`main` seulement**, et si tous les tests sont verts : la version compilée
   et testée est copiée à la racine du dépôt, puis GitHub Pages republie le site.

Un test qui échoue bloque donc la mise en ligne. Il n'y a aucun secret à
configurer. Le réglage GitHub Pages est « Deploy from a branch », branche `main`,
dossier `/`. Pour republier sans rien changer, lancez le workflow à la main depuis
l'onglet Actions.

## Statistiques

[`statistiques/STATISTIQUES.md`](statistiques/STATISTIQUES.md) donne les chiffres
principaux : utilisation (comptes, comptes actifs, niveaux et spécialités,
classes, défis entre amis, suivi des parents), contenu (thèmes, chapitres,
exercices, flashcards), tests, CI et mise en ligne, et l'évolution sur 14 jours.
Le workflow `.github/workflows/statistiques.yml` le met à jour chaque matin à 6 h,
heure de Paris (`app/scripts/statistiques.mjs`) ; `statistiques/historique.json`
garde une ligne par jour. Les chiffres d'utilisation viennent de la fonction
Supabase `revizstmg_statistiques()`, qui ne renvoie que des nombres agrégés.
Pour une mise à jour immédiate, lancez le workflow à la main depuis l'onglet Actions.

**Mesure d'audience.** `app/src/mesure.js` compte les écrans affichés (un compteur
par jour et par écran, sans cookie ni identifiant) et le fichier de statistiques
en donne les visites. Elle est prête mais **inactive** : la table et les deux
fonctions côté base attendent un accord (`supabase/a-valider/`). Une fois
appliquées, passer `MESURE_ACTIVE` à `true`.

## Règles de l'interface

- **Contraste (WCAG AA, 4,5:1).** Pour écrire en couleur d'accent :
  `var(--c-accent-texte)` ; pour un fond sous du texte blanc : `var(--c-accent-fort)`.
  Pour écrire dans la couleur d'une matière : classe `texte-matiere` et
  `style={{ '--mc': couleur }}` (éclaircie en mode sombre). Les couleurs des
  matières (`matiere.json`) sont choisies pour rester lisibles sous du texte blanc.
- **Formulaires.** Les règles (e-mail, mot de passe, prénom, messages des espaces
  partagés, pièges à robots) sont dans `app/src/formulaires.js`, testées par
  `tests/formulaires.test.js`. Une erreur s'affiche sous le champ concerné.
- **Liens.** `npm test` vérifie que chaque lien interne mène à une route
  (`tests/liens.test.js`). Le workflow « Vérifier les liens » ouvre chaque lundi
  les liens vers d'autres sites et échoue si l'un est cassé.
- **Adresse inconnue.** Dans l'app, `pages/Introuvable.jsx` (avec un lien vers le
  niveau qui existe encore). Hors de l'app, GitHub Pages sert `app/pwa/404.html`,
  qui renvoie `revizstmg.github.io/cgu` vers `/#/cgu` ; sa liste de routes doit
  suivre `App.jsx` (vérifié par le test des liens).

## Comment c'est construit

- **React 18**, **React Router 6** (`HashRouter`), **Tailwind CSS 3**, **Vite 5**.
- **Chargement à la demande.** Le build produit `index.html` et un dossier
  `assets/` de fichiers dont le nom change avec le contenu :
  - le code commun de l'app (~590 Ko, ~200 Ko compressés), chargé au démarrage
    avec un **index léger du contenu** (noms, couleurs, identifiants des thèmes et
    des exercices), fabriqué à la compilation par `scripts/plugin-contenu.mjs` ;
  - un fichier par page (`React.lazy` dans `App.jsx`) ;
  - un fichier de contenu par matière (`contenu-droit-….js`, de 11 à 156 Ko),
    chargé quand l'élève ouvre la matière.
- **Qui charge quoi.** Le store, l'accueil, les menus, la recherche et les scores
  n'ont besoin que de l'index léger. Les pages d'une matière (matière, thème,
  chapitre) attendent sa matière ; le bac blanc, la révision express, le coach IA,
  le défi du jour et les duels attendent les matières de la filière de l'élève. Ces
  attentes passent par `src/content/Contenu.jsx`, qui affiche « Chargement du
  cours… » le temps nécessaire.
- **Hors ligne.** `pwa-postbuild.mjs` copie `app/pwa/` (manifest, service worker,
  icônes) et écrit dans le service worker la liste de tous les fichiers compilés.
  À l'installation, il les met tous en cache : après la première visite, toute
  l'app marche sans réseau.
- **Mises à jour.** Le service worker va d'abord chercher la page sur le réseau,
  ce qui donne toujours la dernière version. Le script de publication garde en
  ligne les fichiers de la version précédente, et l'app se recharge une fois si un
  fichier d'une ancienne version manque (`main.jsx`).
- Avec `base: './'` et le routage par `#`, le site fonctionne depuis n'importe quelle
  adresse, sans configuration de serveur.

## Arborescence

```
.github/workflows/deploy.yml   compile et publie à chaque modification de app/
supabase/migrations/           migrations des 17 tables (voir supabase/README.md)
supabase/functions/fiche-vision/   fonction « fiche par photo » (Gemini ou Claude)
index.html, sw.js, …           version compilée servie par GitHub Pages (générée)
app/
  content/              le contenu pédagogique, en JSON (voir plus bas)
  tests/                tests de la logique, du contenu et des parcours
  scripts/              index léger du contenu, publication, inventaire du code
  index.html            page d'entrée de Vite
  vite.config.js        build vers app/dist (un fichier par page et par matière)
  pwa-postbuild.mjs     ajoute manifest, service worker et icônes après le build
  pwa/                  manifest.webmanifest, sw.js, icônes (gen-icons.mjs les régénère)
  src/
    main.jsx            démarrage
    App.jsx             toutes les routes
    store.jsx           état de l'élève : progression, XP, badges, série, réglages
    pages/              28 écrans (accueil, matière, thème, chapitre, bac blanc, coach IA, amis…)
    components/         mise en page, affichage des cours, outils transverses
    games/              un composant par type d'exercice, orchestrés par GameHost.jsx
    content/            lecture et chargement du contenu (contenu.js, Contenu.jsx)
    data/               assemblage du contenu et moteurs (voir plus bas)
    auth.js             comptes élève et prof (Supabase Auth + table profiles)
    classroom.js        espace Classe
    friends.js          amis et duels
    leaderboard.js      classement hebdomadaire
    parent.js           espace parent
    ficheVision.js      appel de la fonction fiche-vision
    ocr.js              lecture du texte d'une image (Tesseract, chargé à la demande)
    i18n.js, translate.js   langues de l'interface et traduction du contenu
    notify.js, pwa.js   rappels et installation
```

## Le contenu (`app/content/`)

Le contenu pédagogique est en **JSON**, rangé par matière. On le corrige dans ces
fichiers, sans toucher au code. Les tests de contenu (`npm test`) vérifient ensuite
ce que l'élève verra.

```
content/
  ordre.json                    ordre d'affichage des matières
  <id-matière>/                 un dossier par matière : gestion-finance, droit,
                                p1-maths (Première)…
    matiere.json                la matière et ses thèmes de base
    <couche>.json               une couche de contenu, indexée par id de thème
  commun/                       formules, méthodologie, glossaire, boutique,
                                définitions de secours par matière,
                                réponses acceptées en plus du mot attendu
                                (reponses-acceptees.json), notions liées à ne
                                pas opposer dans un exercice (notions-liees.json)
```

**`matiere.json`** contient un `id`, un `name` et un tableau `chapters`. Chaque
chapitre (un thème du programme) a :
- `cours` : les sections du cours ;
- `formulas` : les formules ;
- `games` : les exercices écrits à la main.

**Pour ajouter un chapitre**, ajoutez un objet dans `chapters`. Les exercices
automatiques sont créés à partir du cours.

**Les couches** enrichissent les thèmes au moment de l'assemblage. Une matière n'a
que les couches qui la concernent.

| Fichier | Rôle |
|---|---|
| `cours-complets.json` | remplace le cours de base par un cours complet |
| `cours-reels.json` | cours « par l'exemple réel » (remplace le corps du cours) |
| `enrichissements.json` | exemples résolus et sections ajoutés à la fin |
| `approfondi-1.json` à `approfondi-4.json` | cours approfondis, méthodes de calcul, études de cas |
| `philo-longue-duree.json`, `histoire-approfondie.json`, `management-approfondi.json`, `sic-si.json` | cours détaillés propres à une matière |
| `definitions.json` | définitions clés par thème |
| `pieges.json` | erreurs fréquentes |
| `cas-pratiques.json` | cas d'entreprise chiffrés |
| `etudes-documents.json` | études de documents (droit, économie) |
| `exercices-sections.json` | section du cours à laquelle chaque exercice est rattaché |

Les exercices de calcul désignent leur générateur par un nom (`"gen": "tva"`,
voir `src/calc.js`), comme les exercices de langues générés (`"gen": "genVerbEN"`,
voir `src/data/langgen.js`).

### Le code qui s'en sert

- `src/content/contenu.js` lit les fichiers JSON.
- `src/data/index.js` assemble les thèmes (couches dans l'ordre, masquage des
  prérequis de Première, dédoublonnage) et génère les exercices, flashcards,
  définitions clés, tests de thème et quiz à partir du texte des cours.
- Les autres fichiers de `src/data/` sont des moteurs :

| Fichier | Rôle |
|---|---|
| `srs.js` | répétition espacée |
| `study.js` | file de révision, bac blanc |
| `coachAI.js` | analyse des résultats |
| `dailyChallenge.js` | défi du jour |
| `rewards.js` | récompenses de connexion |
| `langgen.js` | exercices de langues générés |
| `tracks.js` | niveaux et spécialités proposés à l'entrée |
| `keyterms.js`, `pieges.js`, `formulas.js`, `methodo.js`, `glossary.js`, `shop.js` | accès au contenu correspondant |

### Règles de contenu

- Les **cours de Terminale** ne contiennent que des notions de Terminale. Les notions
  de Première servent uniquement à formuler des **exercices**.
- **Aucune notion inventée** : tout doit correspondre au programme officiel de STMG.

## Comptes et données (Supabase)

**Configuration.** L'application utilise le projet Supabase `wyydagcjkbivtbuhbzon`,
qu'elle partage avec le site NAH. Il est configuré dans `app/src/supabase.js`. La clé
« anon » est publique par conception : la sécurité repose sur les règles RLS de
chaque table.

**Sans compte**, tout fonctionne en local dans le navigateur. **Avec un compte**, la
progression est aussi enregistrée dans la colonne `progress` de la ligne `profiles`
de l'élève, ce qui permet de la retrouver sur un autre appareil.

**Tables utilisées par l'application (17) :**
- `profiles`
- `leaderboard`
- `friend_user`, `friend_request`, `friend_duel`
- `class_member`, `class_meta`, `class_wall`, `class_quiz`, `class_quiz_result`,
  `class_duel`, `class_group`, `class_ban`
- `teacher_class`, `live_session`, `live_player`
- `child_stats`

**Schéma :** les migrations de ces tables sont dans `supabase/migrations/`, identiques
à celles appliquées sur Supabase. La marche à suivre pour modifier la base et l'audit
de sécurité sont dans `supabase/README.md`. **À corriger avant d'ouvrir l'application
à des classes :** sauf `profiles`, ces tables sont lisibles et modifiables par
n'importe qui possédant la clé publique.

**Fonction `fiche-vision`** (`supabase/functions/fiche-vision/`) : elle transforme
des photos de cours en fiche structurée avec Gemini (gratuit) ou Claude. Le code est
prêt, mais **elle n'est pas encore déployée**. La marche à suivre est dans le README
de son dossier.

## Limites connues (ce que la refonte doit régler)

- Les règles RLS des tables sociales (classe, amis, parent) laissent tout lire et
  tout modifier avec la clé publique (voir `supabase/README.md`).
- RévizSTMG partage encore sa base Supabase avec NAH.
