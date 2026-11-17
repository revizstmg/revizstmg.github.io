# RévizSTMG

Application de révision pour les élèves de Première et Terminale STMG, développée par Gabriel Merlin et Mathis. Cours, exercices, préparation aux épreuves, orientation et espaces de classe.

- **Application :** https://revizstmg.github.io
- **Cours publics sans JavaScript :** https://revizstmg.github.io/cours/
- **Offres :** https://revizstmg.github.io/#/offres
- **Source :** [`app/`](app/) ; **version publiée :** fichiers générés à la racine.
- **État de cette documentation :** 17 novembre 2026. Les prix et droits ci-dessous décrivent le code versionné, pas une vérification en temps réel des secrets, de la facturation ou de tous les services distants.

## Sommaire

1. [Fonctionnalités](#fonctionnalités)
2. [Offres et accès](#offres-et-accès)
3. [Installer et développer](#installer-et-développer)
4. [Architecture et fichiers](#architecture-et-fichiers)
5. [Contenu pédagogique](#contenu-pédagogique)
6. [Données, comptes et confidentialité](#données-comptes-et-confidentialité)
7. [Fonctions IA et services](#fonctions-ia-et-services)
8. [Langues, accessibilité et hors ligne](#langues-accessibilité-et-hors-ligne)
9. [Tests](#tests)
10. [Publication et référencement](#publication-et-référencement)
11. [Statistiques et rapports](#statistiques-et-rapports)
12. [Maintenance et limites](#maintenance-et-limites)

## Fonctionnalités

### Apprendre et réviser

| Espace | Fonctionnement | Source principale |
|---|---|---|
| Accueil | Reprise du dernier cours, accès aux cours et à l’entraînement, progression ; accueil distinct pour le professeur. | `app/src/pages/Home.jsx`, `app/src/components/AccueilProf.jsx` |
| Cours | Matière, thème, chapitre, fiches, définitions et exercices ; lecture agrandie, favoris, impression et signalement d’erreur. | `app/src/pages/{Cours,Subject,Theme,Chapter}.jsx` |
| Exercices | QCM, vrai/faux, trous, saisie, association, tri, ordre, calcul, memory, SQL et cas/documents selon le chapitre. Tirages courts à partir de banques, avec historique local des questions proposées. | `app/src/games/`, `app/src/data/questionSessions.js` |
| Réviser | Suivre le fil, comprendre ses erreurs, ancrer ses connaissances ; choix de matière et chapitre facultatif. Les acquis se fondent sur les réponses réellement jouées. | `app/src/pages/Revise.jsx`, `app/src/data/study.js` |
| Flashcards | Pile à retourner, glisser ou valider au clavier ; reprise des cartes ratées, paquets enregistrés, écoute, partage et import. | `app/src/components/PileCartes.jsx`, `app/src/pages/FlashcardsPage.jsx` |
| Séance | Jusqu’à trois étapes enchaînées à partir des erreurs, révisions dues et prochain exercice. | `app/src/pages/Seance.jsx`, `app/src/data/seance.js` |
| Atelier de formules | Filtres, sélection de formules, exercices chiffrés renouvelés et correction ; bilan distinct de la maîtrise des chapitres. | `app/src/pages/FormulaWorkshop.jsx`, [inventaire](docs/ATELIER-FORMULES.md) |
| Notes de classe | Notes, matière/chapitre, questions manquées ; bilan et entraînement selon les droits de l’offre. Données privées. | `app/src/pages/MesNotes.jsx`, `app/src/notesClasse.js` |
| Parcours personnalisé | Objectifs de note, temps disponible et programme de révision ; préparation des vacances. | `app/src/pages/{Parcours,Vacances}.jsx` |
| Parcours Avenir | Questionnaire d’intérêts et de contexte, notes facultatives, bilan explicable et formations/métiers à explorer. | `app/src/pages/Avenir.jsx`, [documentation](docs/PARCOURS-AVENIR.md) |

Le carnet d’erreurs autonome et les indicateurs « À revoir aujourd’hui / À renforcer / Bien acquis » ne constituent plus des rubriques de Réviser. Les données d’erreurs restent exploitées par les parcours. La bibliothèque d’outils de Réviser se concentre sur les flashcards.

**Orientation :** Parcours Avenir est distinct du parcours de révision Ultimate. Il ne prédit pas une admission et ne constitue pas un test psychométrique validé. Les intérêts restent prioritaires ; les notes apportent un ajustement limité. Les pistes couvrent notamment BTS, BUT, université, prépa ECT, écoles de commerce, finance et alternance, avec les conditions et limites présentées dans le dossier. Les réponses ne figurent pas dans le résumé partagé avec les parents.

### Préparer les épreuves

| Espace | Fonctionnement et limites |
|---|---|
| Bac blanc | Annales officielles de droit/économie et de management, sujets d’entraînement prêts à utiliser et création personnalisée. Les PDF officiels et les créations RévizSTMG sont identifiés séparément. |
| Première | Accès de découverte aux annales de Terminale ; carte d’entraînement à l’épreuve anticipée de mathématiques. Les sujets de mathématiques générés par l’application ne sont pas des annales officielles. |
| Terminale | Accès au Prix de l’excellence économique, dossiers d’archives, documents et copie dans un espace de rédaction partagé à l’écran. |
| Création d’examen | Demande libre, durée de 60, 120, 180 ou 240 minutes ; chapitres laissés au choix du modèle ou sélection manuelle de 1 à 24 chapitres. Le mode manuel vérifie le périmètre sans analyse IA préalable. Sujet et corrigé sont exportables séparément. |
| Dépôt de copie | PDF ou photos JPEG/PNG/WebP, jusqu’à 6 fichiers et 6 Mio au total, après consentement. Correction indicative sur 20 ; une lecture impossible doit être signalée. |
| Questions type de contrôle | Question rédigée liée au seul cours du chapitre, cinq critères d’un point et correction indicative sur 5 ; citations du cours, acquis et points à retravailler. Sans XP ni modification de maîtrise. |
| Étude de gestion | Dossier de Première : organisation, sources et fiabilité, diagnostic, arguments et export. |
| Grand Oral | Dossier de Terminale : questions, plan, sources, argumentation, minuteur, enregistrement et auto-évaluation. Les dates/règles officielles doivent être revérifiées à chaque session. |
| EPS | Choix de trois activités, référentiels et préparation à partir de performances actuelles/visées. Les barèmes locaux et les AFL doivent être confirmés avec l’enseignant ; ne pas assimiler une fiche d’entraînement à une note officielle. |

Références détaillées : [Prix de l’excellence](docs/PRIX-EXCELLENCE-ECONOMIQUE.md), [EPS](docs/EPS-TRIO.md), [bilan après devoir](docs/PARCOURS-BILAN.md). Les dates des épreuves sont centralisées dans `app/content/commun/epreuves.json`.

### Classe, communauté et motivation

- **Classes :** nom choisi par le professeur, code vérifié avant adhésion, mur, annonces, quiz, duels, groupes, direct et suivi professeur. Un code inconnu ou une panne ne doit pas inscrire l’élève localement comme si la vérification avait réussi.
- **Amis et duels :** comptes connectés, demandes et défis ; reprise d’envoi du score après panne, sans attribuer un ancien score à un autre compte.
- **Classement :** classement hebdomadaire et ligues ; accès distinct des classes/amis, voir la grille réelle ci-dessous.
- **Parent :** consultation d’un résumé seulement avec partage activé par l’élève ; code aléatoire de 10 caractères, renouvelable et révocable. Pas d’accès automatique aux notes/copies ou conversations privées.
- **Motivation :** XP, pièces, niveaux, badges, série, défis et objectifs hebdomadaires. La maîtrise utilise jusqu’aux trois meilleurs exercices de chaque chapitre, puis la moyenne du thème ou son test s’il est meilleur. XP et temps passé ne constituent pas une preuve de maîtrise.
- **Boutique :** objets virtuels et avantages prévus par son catalogue, inventaire et équipement ; les récompenses commerciales réservées demandent une vérification des éditeurs, pas un abonnement automatiquement activé par le navigateur.
- **Navigation :** menu sur téléphone et ordinateur, onglets favoris personnalisables, Paramètres organisé en rubriques et sous-rubriques.

## Offres et accès

### Prix versionnés

Source unique : [`supabase/functions/revizstmg-paiement/logique.js`](supabase/functions/revizstmg-paiement/logique.js), importée par le client. Version tarifaire du 7 novembre 2026.

| Offre | Prix dans le code | Distribution |
|---|---:|---|
| Premium | **9,99 € TTC/mois** | Individuelle |
| Ultimate | **19,99 € TTC/mois** | Individuelle |
| Go lycée | **20 €/élève/an + 500 €/établissement/an** | Établissements uniquement |

Seul l’abonnement **mensuel** est proposé actuellement pour les particuliers (`PERIODES=['mensuel']`). Les anciens prix annuels présents dans la logique sont historiques ; ils ne constituent pas une offre annuelle ouverte. Une hausse ne migre pas automatiquement les contrats existants.

**Paiements :** le dernier contrôle documenté était en mode Stripe TEST. Ce README ne certifie ni l’ouverture des paiements réels ni les valeurs actuelles des secrets distants. Procédure : [docs/PAIEMENTS.md](docs/PAIEMENTS.md). Go n’est pas une troisième souscription individuelle à acheter dans le parcours Premium/Ultimate.

### Droits réellement appliqués

Références : [`app/src/data/acces.js`](app/src/data/acces.js), [`app/src/components/Reserve.jsx`](app/src/components/Reserve.jsx) et les contrôles propres aux écrans. Le contenu statique public ne peut pas être rendu secret par une barrière React. Les droits IA sont revérifiés sur le serveur.

| Niveau | Accès général |
|---|---|
| Sans abonnement | Accueil, cours et exercices de base, favoris, programme, paramètres, orientation Avenir, pages d’information ; classe/amis/parent/boutique selon leurs conditions de compte ou de partage. |
| Premium et Ultimate | Séance, révision et paquets de flashcards, notes, badges, coach, bac blanc, Prix de l’excellence, préparation Grand Oral/étude de gestion, fiches-photo, défi, atelier, méthodologie, EPS et **classement**, selon `PAGES_PAYANTES`. |
| Ultimate | En plus, parcours de révision et programme Vacances ; accompagnement personnalisé selon les contrôles de chaque action. |

**Points à ne pas confondre :** les classes, amis et boutique ne demandent pas d’abonnement, mais le classement reste dans la liste payante du code actuel. Mes notes est également une route payante ; les anciens textes annonçant une saisie universellement gratuite ne décrivent donc pas la barrière de page actuelle. Le questionnaire Avenir gratuit n’est pas le parcours Ultimate.

### Quotas IA et période de grâce

La règle serveur est [`supabase/functions/examen-blanc/acces.js`](supabase/functions/examen-blanc/acces.js), dupliquée à l’identique dans `fiche-vision` et vérifiée par les tests.

- Gratuit : quota IA nul hors exception de grâce.
- Premium : une utilisation initiale par fonction et par mois ; suites distinctes, sous conditions de preuve de l’étape initiale : tuteur 20, contrôle 3, examen 6 ; valeur de secours 5 pour les autres suites. Plans d’examen : plafond séparé de 12/mois.
- Ultimate : pas de quota mensuel, **sans promesse d’usage illimité**. Garde-fou commun 60 demandes/jour et plafonds journaliers par fonction coûteuse : examen 20, excellence 10, étude 15, photo 15, série 20, contrôle 20.
- Les plafonds horaires en mémoire de certaines actions restent distincts des compteurs durables de facturation. Un quota serveur n’écarte pas les limites ou pannes du fournisseur.
- Grâce : comptes créés **avant le 30 octobre 2026 à 00h00 UTC**, accès Ultimate jusqu’au **30 novembre 2026 à 23h59 UTC**. Ce n’est pas une gratuité permanente pour tous les comptes.
- `ACCES_REFUSE_TEST=1` permet au serveur de refuser les abonnements de test à l’ouverture commerciale ; son état distant doit être vérifié lors du lancement.

## Installer et développer

Utiliser **Node.js 22**, comme la CI, et npm. Aucune clé privée fournisseur n’est nécessaire pour compiler l’interface ; les fonctions distantes ont leur propre configuration.

```bash
cd app
npm ci
npm run dev          # http://localhost:5173 ; routes sous /#/
npm run build        # produit app/dist/
npm run preview      # sert la compilation locale
```

Les dépendances et versions sont dans `app/package.json` et `app/package-lock.json`. Préférer `npm ci` pour reproduire le verrouillage. Les fonctions Edge ne sont pas lancées par Vite.

Avant toute intervention : lire [AGENTS.md](AGENTS.md), [CLAUDE.md](CLAUDE.md) et [docs/COORDINATION.md](docs/COORDINATION.md), annoncer le périmètre dans ce journal, travailler sur une branche et y consigner les vérifications/références avant transmission.

## Architecture et fichiers

React 18, React Router 6 avec `HashRouter`, Vite 5 et Tailwind CSS 3. Les pages de l’application vivent sous `/#/...` ; les cours publics sont des pages HTML distinctes sous `/cours/...`.

```text
app/
  content/             cours et couches pédagogiques JSON
  resources/langues/   sources des cinq manuels et exercices de langue
  scripts/             build du contenu, PDF, pages publiques, publication, rapports
  pwa/                 modèles manifest, service worker, icônes et page 404
  src/
    App.jsx            routes, gardes et chargement des pages
    store.jsx          état, progression, sauvegarde et actions du compte
    pages/             écrans de l’application
    components/        composants partagés et présentation
    games/             moteurs d’exercices, orchestrés par GameHost
    content/           index léger et chargement des matières
    data/              droits, filières, sujets, révision et autres moteurs
    auth.js            session, Auth et requêtes authentifiées
    reseau.js          accès REST/RPC avec délais et contrôles d’identité
    progression.js     fusion entre appareils
    push.js, notify.js  rappels serveur et notifications locales
    i18n/, localisation/ langues et catalogues publics
  tests/               tests unitaires et parcours Playwright
supabase/
  migrations/          historique versionné ; confronter aux migrations réellement appliquées
  functions/           services Edge et logique partagée client/serveur
.github/workflows/     validation, publication, liens et statistiques
statistiques/          relevés datés, historique et synthèse
assets/, index.html…   compilation publiée automatiquement, ne pas éditer à la main
```

### Chargement et compilation

- `app/src/content/Contenu.jsx` charge la matière ou la filière avant l’usage du contenu complet. L’accueil, les menus, les scores et la recherche utilisent un index léger ; ne pas supposer que `SUBJECTS` contient déjà les cours complets au démarrage.
- `app/src/data/index.js` assemble les couches et génère exercices, tests et flashcards. Les pages sont chargées à la demande avec `React.lazy`.
- `npm run build` exécute Vite, `scripts/pages-cours.mjs`, puis `pwa-postbuild.mjs`. Il génère aussi les sujets/corrigés prêts à utiliser, les pages publiques et leurs ressources.
- `app/dist/` est un résultat de compilation non versionné. Le workflow validé en copie le contenu à la racine via `app/scripts/publier.mjs`, en conservant les ressources nécessaires à la version précédente.
- Documentation d’architecture complémentaire : [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Les nombres de fichiers et anciennes pages cités dans des rapports historiques ne remplacent pas les routes courantes de `App.jsx`.

## Contenu pédagogique

### Périmètre et inventaire

L’ordre source comporte 19 entrées : 11 de Terminale et 8 de Première, dans [`app/content/ordre.json`](app/content/ordre.json). Les langues sont proposées par la bibliothèque de manuels ; leurs anciennes données peuvent subsister dans le catalogue pour préserver les résultats historiques.

Le relevé du **16 novembre 2026** dans [`statistiques/dernier.json`](statistiques/dernier.json) dénombre 110 thèmes, 861 chapitres, 3 890 séries, 18 848 questions et 2 256 flashcards. Ce sont des **comptages techniques datés**, pas des utilisateurs actifs, des contenus tous visibles pour une filière ni des exercices tous différents. Les archives peuvent contribuer à l’inventaire. Pour les chiffres à jour et leurs erreurs éventuelles : [statistiques/STATISTIQUES.md](statistiques/STATISTIQUES.md).

### Modifier un cours

Chaque matière a un `matiere.json` et ses couches : `cours-complets.json`, `cours-reels.json`, enrichissements, approfondissements, définitions, pièges, cas et études de documents selon la matière. Les objets de thème contiennent notamment `cours`, `formulas` et `games`.

- Modifier les **sources JSON**, jamais les fichiers compilés.
- Respecter la filière et les programmes officiels ; ne pas inventer une notion pour remplir un exercice.
- Les cours de Terminale restent de Terminale ; les prérequis de Première peuvent servir aux exercices appropriés.
- Les exercices, flashcards et mauvaises réponses d’un chapitre restent limités à **son cours**. Aucun remplissage depuis d’autres chapitres ou la banque entière de la matière.
- Les jeux manuels doivent avoir un rattachement explicite valide dans `exercices-sections.json`. Les dossiers transversaux restent au niveau du thème.
- Les textes à trous gardent une phrase complète et son contexte ; les variantes acceptées ne servent pas de mauvaises réponses. Sources : `content/commun/reponses-acceptees.json`, `notions-liees.json` et moteurs du contenu.
- Les calculs utilisent `app/src/calc.js` et `qcmgen.js` ; leurs nombres peuvent être renouvelés. Une répétition reste possible si le chapitre a peu de notions, sans ajouter artificiellement du contenu extérieur.
- La présentation du cours est rédigée ; le tableau « Notions et définitions » peut le terminer.

Après une modification voulue :

```bash
cd app
npm run chapitres     # recalcule le nombre d’exercices par chapitre
npm test             # examine les différences, ne pas accepter aveuglément une empreinte
npm run test:detail   # écrit le détail dans tests/.detail/
# npm run test:maj    # seulement si le changement pédagogique a été voulu et vérifié
npm run build
npm run test:parcours
```

Une empreinte différente après un changement censé être purement technique exige une investigation. Les tests ne remplacent pas une relecture par un enseignant.

### Langues

Anglais, espagnol, italien, arabe standard et allemand : sélection à l’inscription et dans les réglages, indépendante de la langue de l’interface. Sources : `app/resources/langues/{en,es,it,ar,de}.json`.

Les cinq guides PDF réunissent cours, vocabulaire, exemples, mini-exercices corrigés, signets, liens de correction et vidéos externes. Ils comportent des champs de réponse et de suivi remplissables ; l’enregistrement dépend d’un lecteur PDF compatible. Les vidéos nécessitent Internet et restent hébergées par leurs éditeurs. Les anciens cours de langues sont archivés, pas supprimés de l’historique des élèves.

```bash
cd app
node scripts/guides-langues.mjs
```

Voir [PDF interactifs](docs/PDF-LANGUES-INTERACTIFS.md) et les [rapports de relecture](docs/RELECTURE-MANUELS-LANGUES-20261024.md). Les rapports anciens décrivent leur propre périmètre ; ne pas réutiliser un tableau de quatre langues comme inventaire des cinq manuels actuels.

## Données, comptes et confidentialité

### Comptes et sauvegarde

- Essai sans compte : progression sur l’appareil. Les espaces partagés demandent leurs conditions de compte, rôle ou code parent.
- Compte élève/professeur : Supabase Auth et table `profiles`, progression dans `profiles.progress`. Le rôle est rechargé depuis le profil ; une identité locale seule ne donne pas les droits de la base.
- Sauvegarde différée d’environ 2 secondes après modification et tentative à la sortie. Un indicateur annonce l’état réel : enregistré, attente ou non enregistré. Panne/hors ligne : conservation locale et reprise, pas de faux succès.
- Fusion optimiste entre appareils : versions de progression vérifiées avant remplacement, puis fusion en cas de concurrence. Les pièces/XP utilisent des contributions par appareil ; des données éditables et suppressions ont des dates propres. Voir `app/src/progression.js` et les tests de fusion.
- Les réponses tardives ne doivent pas remplacer l’état d’un autre compte. Les résultats différés d’exercices sont protégés par l’identité du joueur et l’état monté de l’exercice.
- Le temps d’étude est interrompu en arrière-plan et lors des longues suspensions. Les valeurs historiquement aberrantes sont archivées dans `themeTimeInvalid`, exclues des totaux ; aucune durée réelle n’est inventée pour les remplacer.

### Supabase partagé

Projet configuré : **`wyydagcjkbivtbuhbzon`**, dans `app/src/supabase.js`. Hébergement statique GitHub Pages et backend Supabase sont deux services distincts.

Ce projet est historiquement partagé avec NAH. Malgré certaines notes historiques sur l’arrêt du site NAH, **ne pas considérer ses tables comme disponibles à la modification**. Lire [supabase/README.md](supabase/README.md), vérifier l’état actif et respecter les consignes d’autorisation avant toute mutation.

La clé publique/anon est publique par conception ; la sécurité repose sur Auth, les rôles et les règles RLS, pas sur la dissimulation de cette clé. Aucune clé `service_role`, fournisseur IA ou secret Stripe ne doit apparaître dans le client, les commits, captures ou journaux.

Les 21 tables ciblées par l’audit du 15 novembre 2026 : `profiles`, `leaderboard`, `friend_user`, `friend_request`, `friend_duel`, `class_member`, `class_meta`, `class_wall`, `class_quiz`, `class_quiz_result`, `class_duel`, `class_group`, `class_ban`, `teacher_class`, `live_session`, `live_player`, `child_stats`, `revizstmg_abonnements`, `revizstmg_ia_usage`, `revizstmg_signalements`, `revizstmg_visites`. Ce relevé n’est pas un audit exhaustif de toutes les tables du projet.

Les migrations versionnées ne suffisent pas à prouver l’état distant : certaines ont été appliquées manuellement. La garde professeur du mur a été corrigée par `20261116065015_revizstmg_mur_annonces_professeur.sql` ; validation sur table temporaire puis rollback, sans données métier modifiées.

### Export, suppression et partage

Paramètres > Confidentialité et données : export JSON et suppression du compte. La résiliation éventuelle est traitée avant le RPC de suppression ; un échec ne doit pas être présenté comme une suppression réussie. Le RPC `revizstmg_supprimer_compte` supprime les données RévizSTMG visées par la migration, les abonnements push et le compte Auth, puis le navigateur est vidé après confirmation.

Le partage parent n’est activé qu’avec l’accord de l’élève. Le retrait attendu ou échoué est présenté comme tel et repris au retour réseau. Consulter les [CGU](https://revizstmg.github.io/#/cgu) et la [confidentialité](https://revizstmg.github.io/#/confidentialite) pour les informations destinées aux utilisateurs.

## Fonctions IA et services

| Fonction Edge | Utilisation | Référence |
|---|---|---|
| `examen-blanc` | Analyse/création d’examen, corrections, questions rédigées, tuteur et accompagnements selon l’action. | `supabase/functions/examen-blanc/` |
| `fiche-vision` | Fiche à partir de photos et contrôles d’accès propres. | `supabase/functions/fiche-vision/` |
| `revizstmg-paiement` | État d’abonnement, Checkout, portail, résiliation et traitement des événements Stripe. | `supabase/functions/revizstmg-paiement/`, [paiements](docs/PAIEMENTS.md) |
| `revizstmg-rappels` | Envoi push périodique aux appareils inscrits selon les conditions du rappel. | `supabase/functions/revizstmg-rappels/`, [backend](supabase/README.md) |

La présence du code ou un déploiement réussi ne garantit pas une réponse fournisseur. Le modèle et les secrets **effectifs** dépendent de la configuration distante ; les journaux de versions précédentes ne prouvent pas un modèle actuel. Gemini est utilisé par les parcours décrits ; ne pas déduire un coût réel par action d’un tarif théorique sans mesurer les jetons, reprises et documents transmis.

### Envoi et conservation

- L’interface doit expliquer l’envoi au fournisseur et demander le consentement prévu avant une copie/photo.
- La génération reçoit les extraits du périmètre sélectionné, pas la totalité arbitraire des cours. Le tuteur reçoit le chapitre ouvert et un historique récent, pas les notes ni la classe.
- Les conversations du tuteur ne sont pas sauvegardées dans la progression ; elles sont réinitialisées au changement de chapitre/compte. Les bilans après devoir et sujets ont leur propre stockage/documentation.
- Les fichiers de copie ne sont pas sauvegardés par le site dans la progression ; ne pas en déduire une absence de traitement/conservation chez le fournisseur. Les informations de confidentialité restent applicables.
- Les notes générées sont indicatives. Les critères/points et citations sont validés côté serveur selon l’action ; cela ne certifie pas la justesse pédagogique d’une réponse automatique.
- Erreur, délai et annulation doivent rendre la main sans inventer un corrigé. Les limites ne sont pas identiques pour toutes les actions : consulter le client et l’action serveur concernés, plutôt qu’annoncer un délai unique pour toute l’IA.

### Rappels

`app/src/notify.js` gère permission et notification locale ; `app/src/push.js` inscrit l’appareil auprès des RPC `revizstmg_push_*`. La fonction périodique serveur est décrite dans `supabase/README.md`. iPhone : installation sur l’écran d’accueil et version compatible nécessaires.

Les intentions d’activation, d’arrêt et d’horaire doivent rester cohérentes avec le compte : une ancienne réponse ne doit ni réinscrire un rappel arrêté, ni confirmer l’ancien horaire, ni enregistrer la demande sous le compte suivant. Les contrôles de non-régression sont dans `app/tests/push-intention.test.js` et `app/tests/parcours/rappels-intention.spec.js`. Les API natives sont bornées ; une expiration n’est pas une preuve de désinscription réussie.

## Langues, accessibilité et hors ligne

Interface FR/EN/ES/IT/AR/DE ; catalogues dans `app/src/i18n/` et `app/src/localisation/public.*.json`. Le sens de lecture arabe, les libellés accessibles, les dates et les nombres suivent la langue. Les identifiants, saisies et achats ne changent pas.

Les textes intégrés se traduisent hors ligne. Les compléments publics non intégrés peuvent utiliser MyMemory avec cache et regroupement ; ils demandent Internet. Ne jamais annoter une saisie privée ou un message de classe pour en faire une traduction publique. `scripts/plugin-traductions.mjs`, `useT`, `usePublicText`, `TextePublic` et `CourseText` assurent l’intégration à React.

Règles d’interface :

- Pas d’avis/chiffres inventés ; distinguer données réelles, exemples fictifs et contrôles non exécutés.
- Aplats de couleur, boutons à coins discrets, émojis conservés, titres courts et aucune promotion trompeuse de l’IA.
- Mouvement réduit respecté ; au maximum une animation décorative par session. Les minuteries fonctionnelles ne sont pas décoratives.
- Accent texte : `var(--c-accent-texte)` ; fond avec texte blanc : `var(--c-accent-fort)` ; texte de matière : classe `texte-matiere` et variable `--mc`.
- Fenêtres : Échap, gestion du focus et navigation clavier via `app/src/components/clavier.js`. Les contraintes d’une épreuve peuvent distinguer fermeture et abandon.
- Réglages dys/contraste/audio et mise en page mobile ; les tests axe ne remplacent pas un test humain avec lecteur d’écran.

**Hors ligne :** le service worker met en cache les ressources prévues par la compilation après une installation réussie. Les cours/exercices locaux et fichiers disponibles en cache restent utilisables ; connexion, classe/amis, synchronisation, paiement, IA, vidéos et traductions externes demandent le réseau. Une page publique jamais mise en cache n’est pas magiquement disponible hors ligne. Ne pas promettre « tout fonctionne hors ligne après une visite » si l’installation du cache a échoué.

## Tests

```bash
cd app
npm test
TZ=Europe/Paris npm test
npm run build
npm run test:parcours
npm run test:detail
# Exemple de contrôle ciblé :
npm test -- --run tests/push-intention.test.js tests/push-deadline.test.js
```

| Contrôle | Ce qu’il vérifie |
|---|---|
| Contenu/empreintes | Cours assemblés, exercices et données visibles avec hasard fixé ; ne pas mettre à jour les empreintes pour masquer une régression. |
| Logique/fusion | Scores, dates locales, filières, récompenses, suppression, concurrence entre appareils et identités. |
| Accès/serveur | Droits, quotas, logique des corrections et contrats client/serveur, avec services simulés. |
| Parcours Playwright | Navigation, exercices, formulaires, modes gratuits/payants, erreurs et reprises dans Chromium ; téléphone par défaut. |
| Accessibilité | Contrôles axe sur les scénarios couverts, clavier, focus, clair/sombre et fenêtre d’exercice. |
| Traductions/liens | Couverture des catalogues, routes internes, 404 et contenus récents. |
| PDF | Génération, métadonnées, formulaires et liens selon les suites concernées. |

Les parcours utilisent [`app/tests/parcours/eleve.js`](app/tests/parcours/eleve.js) pour installer des profils fictifs et **bloquer les services extérieurs**. Aucun essai automatisé ne doit modifier la vraie base, envoyer un mail/notification, déclencher un paiement réel ou consommer une génération facturée. Les sondes publiques doivent conserver ces protections.

Dernière validation générale **livrée avant ce chantier** : [CI 43891276463](https://github.com/revizstmg/revizstmg.github.io/actions/runs/43891276463),16 novembre 2026 : 885 tests unitaires en UTC, 885 à Paris et 438 parcours navigateur, compilation et Pages réussis. [Bilan et preuves](docs/audits/2026-11-16/trois-bugs-corriges/README.md). Ces nombres sont datés ; consulter Actions et le journal de coordination pour les validations plus récentes. Aucun total de tests n’est une garantie d’absence de bug ou une validation pédagogique exhaustive.

## Publication et référencement

### Chaîne de livraison

1. Branche de travail et PR.
2. Workflow [`Tester et publier`](.github/workflows/deploy.yml) déclenché par les changements `app/**`, certains changements de workflow, PR concernées ou lancement manuel.
3. Sur la source concernée : `npm ci`, tests UTC et Paris, compilation, installation du navigateur, parcours.
4. Sur `main` seulement et après réussite : publication de l’artefact testé à la racine, commit automatique puis demande de reconstruction GitHub Pages.
5. Vérifier **la CI et le déploiement Pages**, puis les fichiers et comportements effectivement servis.

GitHub Pages : branche `main`, dossier `/`. Ne jamais corriger directement `index.html`, `assets/`, `sw.js`, PDF ou cours publics générés à la racine. Une modification documentaire seule ne relance pas nécessairement la chaîne applicative. Pour republier sans changement source, lancer le workflow manuellement.

La compilation du client ne demande pas de secret privé ; le déploiement et l’usage des services Edge exigent leurs propres secrets/réglages. L’ancienne phrase « aucun secret à configurer » ne s’applique pas à l’ensemble du backend.

### Cours publics et SEO

Le build produit du HTML lisible sans JavaScript pour le catalogue et les fiches, avec métadonnées, URL canonique, liens internes, sources, `sitemap.xml`, `sitemap.txt` et `llms.txt`. Les URL publiques et les routes interactives `/#/...` remplissent des rôles différents. Une page accessible en HTTP 200 n’est pas nécessairement indexée, et une demande Search Console ne garantit ni indexation ni classement.

Références : [référencement](docs/REFERENCEMENT-COURS-PUBLICS.md), [diffusion des ressources](docs/DIFFUSION-RESSOURCES.md), [méthode et sources](https://revizstmg.github.io/a-propos/). Toute nouvelle URL de production impose de revoir canoniques, sitemaps, OAuth/redirects, sources de PDF et configuration de paiement, sans modifier le domaine au seul niveau du README.

## Statistiques et rapports

- [`statistiques/STATISTIQUES.md`](statistiques/STATISTIQUES.md) : synthèse ; `dernier.json` : relevé détaillé ; `historique.json` : historique.
- Workflow [`Statistiques`](.github/workflows/statistiques.yml) : deux créneaux UTC, filtrés pour retenir 6h à Paris, et lancement manuel. L’exécution réelle peut être retardée par GitHub.
- Les comptages d’utilisation proviennent de `revizstmg_statistiques()` ; les données agrégées ne sont pas un accès aux profils individuels.
- Les écrans affichés sont mesurés par `app/src/mesure.js`, sans cookie ni identifiant dans ce compteur d’audience.
- Le mail de rapport est généré par `app/scripts/rapport-mail.mjs` et `rapport.js`. La routine externe Claude et ses autorisations ne sont pas garanties par un workflow GitHub réussi.
- Une panne GitHub/Supabase doit être marquée **non vérifiée**, pas transformée en zéro utilisateur, en date valide inventée ou en « Rien à signaler ». Au relevé du 16 novembre, la récupération d’utilisation Supabase a échoué ; les chiffres de contenu restaient disponibles séparément.

## Maintenance et limites

### Avant une mise en production commerciale

- Faire relire les cours, corrigés, barèmes et programmes par des enseignants ; tester avec des élèves réels et leur consentement.
- Vérifier les services réellement configurés : Auth/OAuth, modèles/quota/budget IA, notification, paiement LIVE, webhook, résiliation et suppression.
- Revoir la grille d’accès après la grâce, les mentions commerciales, la confidentialité et les conditions des récompenses. Ne pas annoncer une fonction gratuite si sa route la bloque.
- Vérifier les référentiels/date de session, PDF officiels et liens externes ; aucune page historique ne fait autorité pour une nouvelle session.
- Contrôler sauvegarde, erreurs, changements de compte et usage mobile avec les versions effectivement publiées.

### Maintenance courante

Après une modification : périmètre dans le journal, vérifications adaptées, tests requis, compilation si le produit change, PR, suivi de publication et preuve publique. Ne supprimer aucun contrôle pour faire passer la CI ; ne pas déclarer un audit d’agents terminé si ceux-ci n’ont pas livré leurs résultats.

Le [journal de coordination](docs/COORDINATION.md) conserve les livraisons. Les [audits](docs/audits/) conservent des états historiques : lire le statut et les rapports de correction avant de présenter un ancien défaut comme encore ouvert. Les nouvelles corrections des rappels sont suivies dans l’entrée `CORRECTIONS-RAPPELS-20261117`.

Limites structurelles connues : backend historiquement partagé avec NAH, portefeuille et certaines récompenses calculés côté client, dépendance aux fournisseurs pour l’IA/vidéos/traduction externe, absence de certification pédagogique exhaustive. Une couverture automatisée élevée et des contrôles RLS datés réduisent les risques sans les supprimer.
