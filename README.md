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
> Ce document décrit l'application après la refonte d'octobre 2026 : mettez-le à
> jour à chaque changement visible par l'élève.

L’accueil conserve son bandeau sombre et or, avec les matières de la filière
juste en dessous, en cases compactes : quatre colonnes sur ordinateur (deux
lignes), deux colonnes sur téléphone, puis les outils : « Réviser & réussir » ne
montre que l’outil conseillé à l’élève selon sa situation (bac proche, révisions
du jour, chapitres à revoir, sinon le programme) ; les autres sont rangés dans
« Ta trousse », qui se déplie à la demande (`components/OutilsAccueil.jsx`). Les cartes « Chaque séance compte » et
« Ton coin à toi » regroupent progression et communauté. Un compte déjà
configuré entre sans écran d’attente.
La dernière fiche consultée est conservée sur cet appareil, séparément pour
chaque compte, et accessible depuis « Reprendre ».

L’espace Réviser reprend la présentation éditoriale de Bac blanc : séance guidée, carnet d’erreurs et flashcards, puis bibliothèque de matières / paquets et objectif hebdomadaire. Les compteurs viennent de la progression réelle ; le carnet reste accessible même vide. Les raccourcis internes font défiler la page sans changer la route.

Le temps par thème conserve aussi les courtes visites, les séances guidées et le carnet d’erreurs. Les anciennes valeurs dépassant toute la durée d’existence du site sont archivées dans `themeTimeInvalid`, exclues des compteurs et des barres, et ne reviennent pas lors d’une fusion. Leur durée réelle n’est pas estimée ; seuls ces compteurs repartent de zéro. Les durées inférieures à une minute sont indiquées « < 1 min » ; l’arrière-plan et les longues suspensions ne gonflent pas le compteur.

À l’inscription (et dans les réglages), l’élève peut sélectionner les langues étudiées : arabe, anglais, italien et espagnol. Ce choix multiple est distinct de la langue d’interface et synchronisé avec la progression. La bibliothèque Langues affiche les cours des langues sélectionnées ; sans choix, les cours existants restent visibles. L’arabe standard et l’italien disposent désormais de cours en Première et Terminale : grammaire, vocabulaire et ETLV, compréhension écrite, expression/médiation et six axes culturels propres à chaque niveau. Le choix filtre aussi les trois parcours de révision. Sources, périmètre et limites : [docs/COURS-LANGUES.md](docs/COURS-LANGUES.md).

L’atelier de formules remplace les anciens espaces Révision express et Formulaire.
Il propose un à cinq exercices par formule choisie, accepte les réponses avec
virgule ou point et affiche un bilan local sans modifier la maîtrise des chapitres.
Les anciennes adresses redirigent vers `/atelier-formules`.

Le créateur d’examen blanc accepte une demande et une durée de 60, 120, 180 ou
240 minutes. L’élève peut laisser l’IA choisir le programme ou sélectionner de
1 à 24 chapitres, avec filtres de niveau / matière et recherche. En mode manuel,
la vérification du périmètre ne nécessite pas d’appel IA d’analyse. Après
confirmation, seuls les cours choisis sont envoyés à la génération Gemini.
Les nouveaux sujets contiennent au moins 4/6/8/10 documents selon la durée,
avec questions documentaires et connaissances personnelles du cours, et deux
PDF séparés (sujet / corrigé). Les anciens sujets restent accessibles.

Après rédaction sur papier, « Déposer ma copie » accepte un PDF ou des photos
JPEG/PNG/WebP (6 fichiers, 6 Mio au total). Après accord de l’élève, Gemini lit
la copie et propose une correction détaillée et une note indicative sur 20.
Les points sont validés et additionnés côté serveur ; une réponse illisible
empêche une note globale inventée. Les fichiers ne sont pas sauvegardés par le
site ; le bilan reste sur cet appareil pour ce compte, sans modifier notes de
classe, XP ou récompenses. Une vraie lecture manuscrite reste à vérifier avec
l’élève ; les tests automatisés ne font aucun appel réel au fournisseur.

Dans le lecteur de cours, la flèche après la dernière fiche revient à la
première fiche du même chapitre, en lecture normale comme en plein écran.

Pour rejoindre une classe (depuis Classe, Classement ou l'inscription), le code
est vérifié auprès du serveur avant d'être enregistré. Un code inconnu ou une
vérification indisponible laisse l'élève hors de la classe et affiche une erreur.

Sur un PC partagé, le rôle est rechargé depuis le profil du compte connecté.
La déconnexion efface l'identité, la classe et la progression locales après une
sauvegarde ; une réponse tardive de l'ancien compte ne peut pas remplacer la session.

La progression part sur le compte deux secondes après chaque changement, et
tout de suite quand l'élève quitte l'application. La copie du compte n'est
remplacée que si elle n'a pas changé depuis la dernière lecture ; sinon,
l'application fusionne d'abord les deux (`src/progression.js`). Hors ligne ou en
cas d'échec, un bandeau « Non sauvegardé » s'affiche et l'envoi reprend tout
seul au retour du réseau. Dans l'en-tête, un indicateur dit en permanence où en
est la sauvegarde : « Enregistré », « En attente » ou « Non enregistré »
(`IndicateurSauvegarde`, `components/EtatSauvegarde.jsx`). Si la sauvegarde échoue au moment de se déconnecter,
l'élève est prévenu et choisit ; la session est ensuite fermée sur le serveur.

Fusion entre appareils : les pièces, les gels, l'XP et les réponses sont comptés
appareil par appareil. Une dépense n'est jamais remboursée, et deux gains faits
en même temps sur deux appareils comptent tous les deux. Les favoris, paquets,
fiches, questions du carnet d'erreurs, notes, notes de classe, la date du bac et le point de
reprise sont datés : la dernière modification l'emporte, suppression comprise.
Le reste ne fait que progresser (meilleur score, union des badges). Une copie
écrite par une ancienne version de l'application suit les anciennes règles.

Les dates (« aujourd'hui », série, défi du jour, révision espacée, rappels) sont
celles du calendrier de l'appareil, et non le jour UTC (`src/data/srs.js`).

La boutique propose 50 articles (ambiances, avatars, bannières, titres, gels),
avec recherche, filtres, tri et inventaire. Les achats existants sont conservés.
Les niveaux sont prolongés : niveau 20 à 20 000 XP, niveau 30 à 73 500 XP.
Les cadeaux de progression se récupèrent une fois ; les objets exclusifs restent
équipables depuis l’inventaire. Le portefeuille se fusionne appareil par appareil (voir plus haut) : un achat
n’est remboursé ni par une ancienne sauvegarde ni par un gain fait ailleurs au
même moment. Le calcul reste fait sur l’appareil, pas par le serveur.
Les achats et réservations font partie de la
progression synchronisée. Un titre équipé apparaît sur le profil, une bannière
sur l’accueil.

Premium et Ultimate restent des offres à définir. Le programme annonce un mois
Premium offert au lancement avec 20 tests distincts à 90 % et 20 000 XP, un mois
Ultimate avec 30 tests distincts à 95 % et 73 500 XP. La réservation locale ne
constitue pas une attribution vérifiée ni un abonnement actif : une demande par
brouillon e-mail permet aux éditeurs de vérifier les résultats avant attribution.
Aucun envoi automatique, carte bancaire ni renouvellement ; aucune fonctionnalité
payante ou date de lancement inventée. La validation et l’activation commerciales
ne sont pas automatisées côté client. Conditions détaillées dans les CGU.

La traduction couvre FR/EN/ES/IT/AR. Toutes les clés de l’interface sont présentes
pour les quatre langues étrangères ; 262 textes publics supplémentaires et le
catalogue complet de la boutique sont intégrés dans des fichiers chargés à la
demande (`src/localisation/public.*.json`). La langue change les dates, nombres,
libellés accessibles et le sens de lecture arabe sans modifier les identifiants,
les achats ni les saisies.

Le plugin Babel `scripts/plugin-traductions.mjs`, utilisé en développement,
compilation et tests, prend en charge les littéraux publics du JSX oubliés par
`useT`. Il conserve la propriété du DOM à React. Les variables interpolées sont
remplacées par des marqueurs : les noms et saisies restent dans le navigateur.
Les valeurs des champs, le code, les formules, les URL, les marques et les
éléments `translate="no"` ne sont pas traduits. Les chaînes dynamiques publiques
(catalogues, cours) sont explicitement annotées avec `usePublicText`, `TextePublic` ou
`CourseText` ; ne jamais appliquer la traduction automatique à un message privé.

Les textes publics non intégrés utilisent MyMemory avec cache, regroupement des
demandes identiques, deux requêtes simultanées et découpage UTF-8. Une panne ou
un quota affiche une information avec relance, au lieu de présenter une erreur
comme une traduction. Ces compléments de contenu nécessitent une connexion et
la disponibilité du service ; les traductions intégrées de la boutique n’en
ont pas besoin. Le passage de langue ne réutilise pas un ancien résultat.

## Ce que fait l'application

| Domaine | Contenu |
|---|---|
| Matières | 11 matières de Terminale : tronc commun (management, droit, économie, maths, philosophie, histoire-géo, langues) et spécialités (gestion-finance, mercatique, RH & communication, SIG). Plus les matières de Première. |
| Parcours | Matière → thème → chapitre, avec les onglets Cours, Définitions et Exercices. Chaque chapitre annonce son nombre d'exercices et de notions ; le cours se termine par un tableau « Notions et définitions ». |
| Exercices | Une vingtaine de types : QCM, vrai/faux, texte à trous, saisie, tri, association, remise en ordre, calcul, memory, requêtes SQL, cas pratique, étude de documents, compréhension en langue… Le nombre d’exercices dépend des notions réellement présentes dans le chapitre. Ils sont tirés uniquement de son cours : notions et cas concrets en deux séries, vrai/faux, termes à écrire, association, memory, textes à trous, mot manquant, dates, quiz du chapitre mêlant toutes les formes (`sectionExercises`, `src/data/index.js`). |
| Étude de gestion | Pour la Première : un espace qui accompagne le projet — consignes et règles officielles, démarche, liste du dossier ; les sources de l'élève avec leur fiabilité ; l'analyse de son organisation (tableau de caractérisation, diagnostic interne et externe, PESTEL) ; ses arguments construits avec la méthode A-E-I, reliés aux sources et notés avec une grille (note sur 20) ; blocs repliables pour alléger la lecture ; export du dossier en texte (`content/commun/etude-gestion.json`, `pages/EtudeGestion.jsx`). |
| Grand Oral | Pour la Terminale, le même accompagnement adapté à l'épreuve : règles de la session 2027 (20 min de préparation, 10 min de présentation, 10 min d'échange, coefficient 12), ce que le jury évalue, démarche, conseils, banque de questions ; les deux questions et le plan ; sources ; analyse de l'organisation ; arguments A-E-I rattachés à chaque question, notés avec une grille qui ajoute un critère d'oral ; chronomètre aux durées de l'épreuve, enregistrement et auto-évaluation sur les critères du jury ; export de la préparation (`content/commun/grand-oral.json`, `pages/GrandOral.jsx`). Les outils communs aux deux espaces sont dans `components/DossierProjet.jsx` et `content/commun/outils-projet.json`. |
| Séance du jour | Un bouton sur l'accueil, et la première question est à l'écran : jusqu'à trois étapes enchaînées sans menu — les erreurs du carnet dues ce jour-là, un thème dont la révision est due (ou fragile), puis le prochain exercice du cours là où l'élève s'est arrêté (`src/data/seance.js`, `pages/Seance.jsx`). |
| Navigation | Menus et fenêtres utilisables au clavier : Échap ferme, Tab reste dans la fenêtre, le focus revient sur le bouton qui l'a ouverte (`components/clavier.js`) ; dans un exercice en plein écran, Échap ne fait pas quitter. Barre du bas par défaut : Accueil · Cours · Réviser · Bac blanc · Moi (personnalisable ; pour un professeur : Accueil · Classe · Cours · Moi). Les exercices s'ouvrent en plein écran. Une seule fenêtre automatique par visite, dans cet ordre : information sur les cookies, récompense du jour (créditée dans tous les cas), invitation à installer l'app (`src/fenetres.js`). |
| Révision | Flashcards et répétition espacée (planifiée d'après le résultat de chaque séance), carnet d'erreurs révisé question par question (une question ratée revient le lendemain, puis 3 et 7 jours plus tard ; elle sort après trois réussites espacées ; tous les modes l'alimentent : exercices, test du thème, bac blanc, défi, coach, sujets), « Refaire mes erreurs » en fin de série (sans compter dans la maîtrise), « Pourquoi ? » sous chaque correction (à quelle notion correspond la proposition choisie à tort, et le chapitre à revoir), défi du jour, sujets au format des épreuves écrites de spécialité (4 h) présentés en premier, QCM chronométré matière par matière (annoncé comme un QCM, pas comme le format de l'épreuve ; « toute la filière » reste possible), sujets d'entraînement à l'épreuve anticipée de mathématiques pour la Première (format du BO spécial n° 4 du 17 septembre 2026 : 2 h sans calculatrice, automatismes sur 6, trois exercices sur 14 ; nombres tirés au hasard et calculables de tête, copie rendue puis corrigée question par question ; le total ne compte que les résultats, pas la rédaction ni les 2 points de langue ; `src/data/sujetMaths.js`, `games/SujetMaths.jsx`), propositions des QCM d'études de documents mélangées à chaque partie (la bonne réponse était toujours « A »), programme avec les dates officielles des épreuves, atelier de formules : sélection par matière, barre « Générer mes exercices » toujours visible en bas de l'écran, 40 formules de calcul adaptées à la filière, exercices numériques renouvelés et corrections détaillées, méthodologie par épreuve. |
| Mes notes de classe | L'élève saisit la note reçue en classe (sur 20, « 15,50 » accepté) ; la matière, puis le chapitre, se choisissent dans des menus tirés des cours de sa filière, avec « Toute la matière » pour un bac blanc. La page dit ce qu'il faut améliorer : chaque chapitre sous 10/20 et, dans chaque matière, le chapitre à la moyenne la plus basse. Notes privées (avec la progression du compte, jamais publiées), fusionnées entre appareils, comprises dans l'export et effacées avec le compte (`pages/MesNotes.jsx`, `src/notesClasse.js`). C'est la partie gratuite du document des offres ; « comment l'améliorer » (Premium) et les exercices par l'IA (Ultimate) restent à construire. |
| IA | Coach IA qui analyse les résultats et propose un plan. Fiches créées à partir de photos de cours (fonction `fiche-vision`, pas encore déployée). |
| Professeur et parent | Le professeur a son propre accueil : ses classes, le nombre d'élèves actifs et d'élèves à relancer, l'accès au tableau de bord, aux quiz et aux cours (`components/AccueilProf.jsx`). Un parent sans profil d'élève sur l'appareil n'a que l'espace parent : ni série, ni XP, ni menus d'élève. |
| Social | Comptes élève et prof, classes (mur, quiz, duels, groupes), amis et duels, classement hebdomadaire et ligues, espace parent (seulement si l'élève active le partage ; code de 10 caractères tiré au hasard, que l'élève peut renouveler s'il a circulé). Un duel entre amis dont l'envoi du score échoue garde le score sur l'appareil et propose « Réessayer l'envoi ». Réservé aux comptes connectés : la base ne montre une classe qu'à ses membres et à son professeur (`supabase/README.md`). Essai sans compte possible (progression sur l'appareil, `components/CompteRequis.jsx`). |
| Motivation | XP, niveaux, badges, série de jours, boutique de pièces, objectifs de la semaine (le bac blanc, le défi et le coach ne les remplissent pas). Maîtrise d'un thème : chaque chapitre compte ses 3 meilleurs exercices (tous s'il en a moins) ; le thème prend la moyenne de ses chapitres, ou le test du thème s'il est meilleur ; une réponse rédigée vide ne compte pas comme réussie. |
| Confort | Application installable (PWA), hors ligne, rappels de révision (avec un compte, même téléphone fermé : `src/push.js`, fonction Edge `revizstmg-rappels`), bouton « Signaler une erreur » sous chaque exercice et chapitre, interface en français, anglais, espagnol, italien et arabe (les écrans récents sont traduits hors ligne dans `src/localisation/public.*.json`, vérifié par `tests/traductions.test.js` ; le reste passe par le service de traduction), réglages d'accessibilité (dys, contraste, lecture audio), écran de secours si une page plante. |
| Données | « Télécharger mes données » (fichier JSON) et « Supprimer mon compte » dans Mon espace : la fonction `revizstmg_supprimer_compte` (appliquée le 19 octobre 2026) efface tout ce que l'élève a publié ou envoyé, puis son compte, adresse e-mail comprise ; l'application vide ensuite le stockage du navigateur (`supabase/README.md`). |

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
  `EMPREINTE_DETAIL=1 npm test` (ou `npm run test:detail`, plus court) écrit le
  détail de chaque thème dans `tests/.detail/` pour comparer deux versions.
- **Logique** (`tests/logique.test.js`) : niveaux, scores (maîtrise d'un
  thème : 3 exercices réussis par chapitre, ou le test du thème s'il est
  meilleur ; chaque thème peut atteindre 100 %), fusion de la progression de l'appareil et du compte,
  répétition espacée, récompenses, badges, calculs chiffrés, filières.
- **Sauvegarde** : `tests/fusion.test.js` (deux appareils : suppressions,
  notes, pièces, gels, XP, anciennes copies), `tests/sauvegarde.test.js` (envoi
  conditionné à la version du compte), `tests/dates.test.js` (quatre fuseaux,
  passages à l'heure d'été et d'hiver) et `tests/parcours/sauvegarde.spec.js`
  (note envoyée, hors ligne, autre appareil, déconnexion).
- **Règle des hooks** (`tests/hooks.test.js`) : aucun composant n'appelle un hook
  React après un `if (…) return`, ce qui laisse un écran blanc quand la condition
  change (par exemple à la déconnexion).
- **Parcours** (`tests/parcours/`) : écran de connexion, accueil, un cours suivi
  d'un QCM fait jusqu'au bout, les 25 pages de l'app, et chaque thème des 19
  matières. Les parcours démarrent avec un élève fictif déjà inscrit et bloquent
  tout accès extérieur : ils ne touchent jamais la vraie base Supabase.
  `secours.spec.js` vérifie la déconnexion depuis chaque page réservée aux élèves
  et l'écran de secours (`components/EcranSecours.jsx`) qui remplace une page
  plantée sans emporter le reste du site.
- **Accessibilité** (`tests/parcours/accessibilite.spec.js`) : axe-core (règles
  WCAG 2.2 A et AA) sur 21 pages en clair et en sombre, une fenêtre ouverte et
  un exercice en cours. Il ne remplace pas un essai avec un lecteur d'écran.
  `tests/retours.test.js` vérifie que chaque « ← Retour / Quitter » utilise la
  même classe `lien-retour`.
- **Vitesse sur téléphone** : `node scripts/mesure-mobile.mjs <dist> [<autre dist>]`
  compare des versions compilées sur un Pixel 7 émulé, processeur ralenti 4 fois
  et 4G lente (`docs/audits/2026-10-20/PERFORMANCE-TELEPHONE.md`).

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

**Rapport par mail.** Chaque matin, la routine de vérification (Claude) contrôle le
site puis envoie un rapport à revizstmg@gmail.com (objet « Rapport du JJ/MM/AAAA », rangé
sous le libellé Gmail « Rapports Claude ») : la vérification (construction,
tests, CI, mise en ligne, problèmes trouvés), les chiffres clés, un tableau
analytique (valeur et écart sur 7 et 30 jours), la répartition des élèves et des
graphiques d'évolution (comptes inscrits, comptes actifs, visites). Le HTML est
produit par `app/scripts/rapport-mail.mjs` (rendu : `app/scripts/rapport.js`, testé
par `tests/rapport.test.js`) à partir de `statistiques/dernier.json` (le relevé
complet du workflow) et de `statistiques/historique.json`. Les comptes antérieurs
au 12 octobre 2026 y sont reconstitués d'après leur date de création.
La routine ne lance que des scripts npm (`npm run rapport -- --verif … --sortie …`
pour le mail), autorisés sans demande dans `.claude/settings.json`.

**Mesure d'audience.** `app/src/mesure.js` compte les écrans affichés (un compteur
par jour et par écran, sans cookie ni identifiant) et le fichier de statistiques
en donne les visites. Elle est active depuis le 12 octobre 2026 (table et
fonctions : `supabase/migrations/20261012173929_revizstmg_statistiques.sql`).

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
  n'ont besoin que de l'index léger (il porte aussi le chapitre de chaque
  exercice rédigé) et de `content/commun/nombre-chapitres.json`, le nombre
  d'exercices de chaque chapitre qui comptent pour la maîtrise. Ce fichier est
  calculé : après avoir changé un cours ou des exercices, lancez
  `npm run chapitres` (un test le signale sinon). Les pages d'une matière (matière, thème,
  chapitre) attendent sa matière ; le bac blanc, le coach IA,
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
                                pas opposer dans un exercice (notions-liees.json),
                                dates des épreuves de la session (epreuves.json)
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
| `etudes-documents.json` | études de documents (droit, économie) : un dossier par thème, ouvert depuis l'onglet « Outils » du thème, hors de la maîtrise par chapitre (il porte sur plusieurs chapitres) |
| `exercices-sections.json` | section du cours à laquelle chaque exercice est rattaché |

Les exercices et flashcards d’un chapitre utilisent exclusivement sa section de
cours, y compris pour les mauvaises réponses des QCM. Aucun complément depuis
les autres chapitres, la banque du thème ou celle de la matière. Les jeux
rédigés à la main doivent avoir un rattachement explicite valide dans
`exercices-sections.json` ; les jeux couvrant plusieurs chapitres restent au
niveau du thème. En sciences de gestion de Première, les anciens textes à trous
transversaux ont aussi été découpés par chapitre. Les quatre entraînements de verbes et
de grammaire EN/ES utilisent des banques limitées aux formes, règles et exemples
explicités dans leur cours ; dix questions sont mélangées à chaque partie.

Les exercices de calcul désignent leur générateur par un nom (`"gen": "tva"`,
voir `src/calc.js`), comme les exercices de langues générés (`"gen": "genVerbEN"`,
voir `src/data/langgen.js`). Une question de QCM chiffrée peut aussi porter un
`"gen"` (`"taux_evolution"`, `"raison_baisse"`…, voir `src/qcmgen.js`) : elle est
refaite avec de nouveaux nombres à chaque partie, et le texte écrit sert de
secours. Les calculs ne sont proposés dans un chapitre que si leur rattachement est
explicite. Les calculs mêlés restent réservés au test du thème.

### Le code qui s'en sert

- `src/content/contenu.js` lit les fichiers JSON.
- `src/data/index.js` assemble les thèmes (couches dans l'ordre, masquage des
  prérequis de Première, dédoublonnage) et génère les exercices, flashcards,
  définitions clés, tests de thème et quiz à partir du texte des cours.
- Les autres fichiers de `src/data/` sont des moteurs :

| Fichier | Rôle |
|---|---|
| `srs.js` | répétition espacée |
| `epreuves.js` | dates des épreuves de la session (`content/commun/epreuves.json`, à mettre à jour chaque année d'après le Bulletin officiel) |
| `sujetBac.js` | sujets au format des épreuves écrites de spécialité, composés à partir des études de documents et des cas pratiques |
| `sujetMaths.js` | sujets d'entraînement à l'épreuve anticipée de mathématiques (Première), générés et corrigés |
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

- RévizSTMG partage encore sa base Supabase avec NAH.

Relecture des exercices de probabilités : le texte à trous du schéma de Bernoulli interroge les deux issues plutôt que le libellé générique « conditions », en conservant les autres hypothèses dans son contexte.

L’atelier propose 169 formules de calcul de Première et Terminale : mathématiques, gestion-finance, économie, management, mercatique et RH. Vue complète ou par filière, filtres par matière/domaine, sélection en lot, exercices à valeurs renouvelées, correction détaillée et lien de cours explicite. Voir [l’inventaire](docs/ATELIER-FORMULES.md). Les probabilités concernées sont arrondies à quatre décimales ; les séances longues restent reprenables sur l’appareil.

Réviser propose trois parcours avec un choix de matière et un chapitre facultatif : reprise au prochain exercice, erreurs filtrées (toutes, pas seulement celles dues) et QCM des acquis réparti entre les chapitres, dans une matière ou toutes les matières. Les bonnes réponses QCM/vrai-faux/textes à trous/saisie/calculs sont conservées dans la progression (2 000 dernières) ; les anciens exercices à 100 % complètent cet historique sans inventer les bonnes réponses des scores partiels. Les textes à trous/saisies sont convertis en QCM seulement si des choix relus du même chapitre existent. Les repères de lecture restent locaux et séparés par compte et matière.

Les QCM et textes à trous des chapitres conservent désormais une banque de
questions, avec des tirages courts renouvelés à chaque partie. Un historique
local à l’onglet et au compte privilégie les questions non encore proposées.
Les phrases sont réparties entre trous, saisie et QCM du mot manquant : une même
phrase ne remplit plus trois exercices. Les autres mots en gras peuvent fournir
des variantes, en conservant leur phrase entière. Pour un cours court, des
répétitions restent possibles ; aucun contenu d’un autre chapitre n’est ajouté.
Les acquis reposent sur les réponses réellement jouées, jamais sur toute une
banque déduite d’un score de partie parfait.

### Questions manquées et entraînement après un devoir
Dans Mes notes, la saisie gratuite conserve les questions manquées avec la note. Le bilan IA et les nouveaux exercices sont réservés à Premium/Ultimate ; la lecture du sujet et de la copie (PDF/photos) à Ultimate. L’IA utilise uniquement les cours du chapitre choisi et signale une lecture impossible ou une compétence hors périmètre. Les fichiers ne sont pas sauvegardés dans la progression. Le bilan et les exercices sont conservés lors de l’ajout de la note, exportés et supprimés avec elle. Les réponses d’entraînement sont temporaires ; correction par comparaison, sans note automatique ni promesse de résultat.

Les offres commerciales restent à ouvrir : aucun paiement ni activation automatique n’est ajouté. Le serveur vérifie `app_metadata.revizstmg_subscription = { plan: "premium" | "ultimate", expires_at: "date ISO" }` via Auth, jamais les métadonnées éditables par l’élève. Ce droit doit être attribué par un système de facturation de confiance lors du lancement ; aucun compte réel n’a été modifié pour cet ajout.

### Tuteur de compréhension Ultimate
Chaque chapitre propose « Je n’ai pas compris ». L’élève discute du cours ou choisit une reformulation simple, un exemple concret ou une décomposition pas à pas. Le tuteur doit varier son approche et vérifier la compréhension par une petite question, sans attribuer de note. Aucun plafond total de reformulations : une conversation peut dépasser 50 échanges. L’écran conserve la discussion pendant la visite ; seuls les 19 derniers messages et le cours de la section ouverte sont transmis à chaque demande. La discussion est réinitialisée au changement de chapitre/compte et n’est pas enregistrée dans la progression.

L’action serveur `tutor` exige Ultimate actif selon le même droit Auth administré que l’analyse des copies. Les offres restent à ouvrir commercialement. Protection contre les rafales : 120 requêtes/heure par utilisateur et instance chaude, indépendante du quota d’examens ; il ne s’agit ni d’une limite totale de conversation ni d’un quota de facturation durable. Les limites du fournisseur restent applicables. Aucune donnée de classe, note ou copie n’est envoyée au tuteur.
