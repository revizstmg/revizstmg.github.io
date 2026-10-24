# Journal partagé — propriétaire, Claude et Codex

Ce fichier sert de relais entre les sessions. Il ne déclenche aucun agent et ne
constitue pas une messagerie en temps réel. Chaque participant doit avoir accès
au dépôt GitHub et lire la version à jour pour voir les annonces des autres.
Le propriétaire décide des priorités et tranche les désaccords.
La répartition des tâches et des fichiers entre Claude et Codex est dans
`docs/TACHES.md` : chacun travaille dans son couloir de fichiers.

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

| EXOS-20261018-CODEX-01 | Codex | Exercices strictement liés au chapitre : `app/src/data/index.js`, contenu Première SDGN si nécessaire, tests, README | Terminé, fusionné | [PR #3](https://github.com/revizstmg/revizstmg.github.io/pull/3) | Suivre la publication automatique ; aucune reprise nécessaire sur cette correction |

| AUDIT-20261018-CODEX-01 | Codex | Audit global en lecture : code, contenu, parcours, Supabase réel, publication et publicité ; cartographie publique dans `docs/AUDIT-2026-10-18.md`, résultats de sécurité détaillés dans le chat | Terminé, à fusionner | [PR #5](https://github.com/revizstmg/revizstmg.github.io/pull/5) | Lire `docs/AUDIT-2026-10-18.md`, puis annoncer séparément chaque correction |

| NAV-20261018-CODEX-01 | Codex | Boucler de la dernière fiche à la première du même chapitre : `Course.jsx`, `Chapter.jsx`, traductions, parcours et README | À relire | `fix/retour-premiere-fiche`, PR #7 | Validation CI puis fusion |

| CLASSE-20261018-CODEX-01 | Codex | Vérifier le code avant de rejoindre une classe : `classroom.js`, formulaires Classe, Classement et inscription, tests, traductions | Terminé, fusionné | [PR #8](https://github.com/revizstmg/revizstmg.github.io/pull/8) | Suivre la publication automatique |

| COMPTE-20261018-CODEX-01 | Codex | Isoler les sessions élève/professeur sur un PC : auth, store, connexion/déconnexion, tests | Terminé | `fix/isolation-comptes`, PR #10 | Fusion et publication suivies dans la PR |

| SHOP-20261018-CODEX-01 | Codex | Refonte boutique : catalogue, niveaux, paliers de mérite, store, profil, tests et README | Terminé | `feat/refonte-boutique`, PR #11 | Fusion et publication suivies dans la PR |

| I18N-20261019-CODEX-01 | Codex | Traductions sur toutes les pages, boutique/catalogue, moteur, accessibilité et tests | Terminé | `fix/traductions-partout`, PR #12 | Fusion et publication suivies dans la PR |

| DOC-20261018-CLAUDE-01 | Claude | Répartition des tâches demandée par le propriétaire : `docs/TACHES.md` (nouveau) et lien depuis ce journal | Terminé, fusionné le 20 octobre (demande du propriétaire) | `claude/repartition-taches`, [PR #13](https://github.com/revizstmg/revizstmg.github.io/pull/13) | Le propriétaire relit, ajuste et fusionne ; Claude attend sa décision sur C01 (comptes partagés avec NAH) |

| PEDAGO-20261019-CODEX-01 | Codex | X06 : deux corrections SDGN Première ; X01 : finaliser les cinq jeux de la PR #6 ; contenu, moteur et tests uniquement | Terminé | [PR #15](https://github.com/revizstmg/revizstmg.github.io/pull/15) | Valider les corrections et les parcours |

| PROGRAMME-20261019-CODEX-01 | Codex | Limiter le programme bac de Première au français et aux maths : study.js, Programme.jsx et tests | Terminé | [PR #16](https://github.com/revizstmg/revizstmg.github.io/pull/16) | Publication suivie dans les Actions |

| HOME-20261019-CODEX-01 | Codex | Refonte accueil : Home, CSS dédié, reprise de lecture Chapter/Course, présentation Welcome, traductions et tests | Terminé | [PR #17](https://github.com/revizstmg/revizstmg.github.io/pull/17) | Validation et publication suivies dans la PR ; aucun changement auth/store |

| HOME-RETOUR-20261019-CODEX-01 | Codex | Retour au visuel précédent, matières en haut, conservation des deux cartes progression/communauté ; Home/CSS/tests/README | Terminé | `fix/accueil-classique` | Publication et validation complète suivies dans la PR |

| MATIERES-20261019-CODEX-01 | Codex | Cases matières compactes : quatre colonnes ordinateur, deux mobile ; Home/CSS/tests | Terminé | `fix/matieres-compactes` | Publication suivie dans la PR |

| FORMULES-20261019-CODEX-01 | Codex | Retrait Express/Formulaire, atelier de calcul par formules ; routes, Home, moteur, traductions et tests | Terminé | `feat/atelier-formules` | Publication suivie dans la PR |

| TROUSSE-20261019-CLAUDE-01 | Claude | Demande du propriétaire : « Réviser & réussir » de l'accueil plus discret, sans afficher tous les outils d'un coup. Fichiers : nouveau `components/OutilsAccueil.jsx`, `Home.jsx` (fichier de Codex : la section remplacée par ce composant), tests, README | Terminé | `claude/accueil-outils`, PR #22 | Fusion demandée par le propriétaire ; publication suivie dans la PR |

| AUDITSITE-20261019-CODEX-01 | Codex + trois agents lancés | Inspection UX, fiabilité, pédagogie/accessibilité ; PDF, version texte et actions partagés | Terminé | [PR #25](https://github.com/revizstmg/revizstmg.github.io/pull/25) | PDF et plan dans `docs/audits/2026-10-19/` ; affectations à confirmer |

| INSPECTION-20261020-CLAUDE-01 | Claude | Demande du propriétaire : cinq agents inspectent tout le site (fonctionnalités, interface, parcours, technique, pédagogie) et livrent un PDF d'améliorations, mis en commun avec Codex ; plus la vérification des cours et exercices du 19 octobre. Fichiers : `docs/audits/2026-10-20/`, `docs/audits/README.md`, ce journal | Terminé | `claude/rapport-ameliorations` | Le propriétaire choisit les priorités ; chacun réserve ses chantiers ici |

| PROG-20261019-CLAUDE-01 | Claude | Ne plus perdre la progression (tâches C03 à C06) : sauvegarde complète et versionnée, fusion entre appareils, déconnexion sans perte, dates du calendrier de l'élève. Fichiers : `app/src/progression.js` (nouveau), `store.jsx` (persistance, fusion, synchronisation, déconnexion, dates ; pas les fonctions de score), `data/srs.js`, `auth.js`, `push.js`, `EtatSauvegarde.jsx` (nouveau), `Layout.jsx` et `Customizer.jsx` (boutons de déconnexion), une ligne de date dans `Home.jsx` et `DailyChallenge.jsx`, tests, README, confidentialité | Terminé, fusionné le 20 octobre (demande du propriétaire) | `claude/progression-fiable`, [PR #14](https://github.com/revizstmg/revizstmg.github.io/pull/14) | Contrôler une vraie sauvegarde après publication |

| SUPPR-20261019-CLAUDE-01 | Claude | Suppression complète du compte demandée par le propriétaire (C01, partie suppression) : fonction `revizstmg_supprimer_compte` complétée (signalements de l'élève, duels de classe reçus, exclusions, jetons) et appliquée sur Supabase ; effacement de tout ce qui reste sur l'appareil ; confidentialité et CGU. Fichiers : `supabase/**`, `auth.js`, `Profile.jsx`, `push.js`, `Privacy.jsx`, `Cgu.jsx`, tests | Terminé, fusionné le 20 octobre (demande du propriétaire) | `claude/suppression-compte`, PR #18 | Essayer une suppression avec un compte de test |

| NOTES-20261019-CLAUDE-01 | Claude | « Mes notes de classe », partie gratuite (voir le document des offres) : saisie de la note, matière puis chapitre dans des menus déroulants, liste de ce qu'il faut améliorer. Fichiers : nouvelle page `pages/MesNotes.jsx`, `progression.js` et `store.jsx` (nouveau champ synchronisé), route dans `App.jsx` (fichier commun), lien depuis `Profile.jsx`, tests, README | Terminé, fusionné le 20 octobre (demande du propriétaire) | `claude/mes-notes`, PR #20 | Suivre l'usage ; « comment l'améliorer » attend l'offre Premium |

| CORRECTIONS-20261020-CLAUDE-01 | Claude | Demande du propriétaire : « fusionne les PR et règle les 10 gros problèmes » de l'inspection du 20 octobre. Lot 1 : hors ligne, progression sur l'appareil, inscription, 12 erreurs de contenu bloquantes, CI à l'heure de Paris. Lot 2 : maîtrise (`store.jsx`, `data/index.js`, `scripts/plugin-contenu.mjs`, `content/commun/nombre-chapitres.json`), séance du jour et barre du bas (`pages/Seance.jsx`, `pages/Cours.jsx`, `navTabs.js`, `Home.jsx`), exercice en plein écran, « Refaire mes erreurs » et « Pourquoi ? » (`games/GameHost.jsx`, `games/common.jsx`), carnet espacé (`store.jsx`, tous les modes), une fenêtre par visite (`fenetres.js`), accueil professeur et parent (`AccueilProf.jsx`, `Layout.jsx`), traductions (`localisation/public.*.json`). Contenu et générateur : couloir de Codex, à la demande du propriétaire | En cours | Lot 1 : [PR #27](https://github.com/revizstmg/revizstmg.github.io/pull/27), lot 2 : [PR #28](https://github.com/revizstmg/revizstmg.github.io/pull/28), fusionnées et publiées | Vrais sujets par épreuve, au format du Bulletin du 17 septembre 2026 (règles d'accès appliquées le 20 octobre) |
| LISTE-20261020-CLAUDE-01 | Claude | Demande du propriétaire : points 1 à 10 de la liste du 20 octobre (le propriétaire indique que Codex traite les points 11 à 28). Indicateur de sauvegarde (`components/EtatSauvegarde.jsx`, `Layout.jsx`), menus et fenêtres au clavier (`components/clavier.js`, `Layout.jsx`, `Customizer.jsx`, `Dictionary.jsx`, `Accessibility.jsx`, `FocusFullscreen.jsx`, `InstallApp.jsx`, `games/GameHost.jsx`, `pages/Chapter.jsx`), barre de l'atelier (`pages/FormulaWorkshop.jsx`), règles d'accès de la base | Terminé | [PR #31](https://github.com/revizstmg/revizstmg.github.io/pull/31) fusionnée et publiée ; règles d'accès appliquées le 20 octobre (`claude/regles-acces-appliquees`) | Aucune |

| POINTS10-28-20261020-CODEX-01 | Codex | Points 10–28 : atelier (10/23), classe/réseau (11/18), calendrier (12/22), UI (14/16/20/21/24/25), PWA (17), dossiers préparatoires (13/15/19/26/27/28) | Terminé (lot livré, suites ouvertes) | `feat/points-10-28` / [PR #30](https://github.com/revizstmg/revizstmg.github.io/pull/30) | Point 10 intégré avec #31 : une seule barre ; suites partielles tracées dans le bilan. Base de production non modifiée sans accord explicite. |

| FINITIONS-20261020-CLAUDE-01 | Claude | Demande du propriétaire (« termine alors tout ») : suites des points 10–28 restés partiels ou non faits après la limite de Codex — 6/7 (études de documents par thème), 13 (sujets de maths anticipée), 14 (axe), 18 (duel), 19 (code parent), 25 (retours), 27 (vitesse) ; #35 fusionnée, #24 fermée avec note | Terminé (15 et 26 : décision ou relecture du propriétaire) | [PR #36](https://github.com/revizstmg/revizstmg.github.io/pull/36), [PR #37](https://github.com/revizstmg/revizstmg.github.io/pull/37) | Voir l'entrée détaillée ci-dessous |

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

### EXOS-20261018-CODEX-01 — Codex — 18 octobre 2026

- Demande : chaque question doit porter uniquement sur le chapitre associé,
  après constat de questions hors cours en sciences de gestion de Première.
- Cause : le générateur ajoutait la banque du thème et les définitions des autres
  sections ; les flashcards et les définitions avaient aussi des compléments hors
  chapitre. Deux textes à trous SDGN regroupaient neuf questions de chapitres différents.
- Réalisé : génération, distracteurs, flashcards et définitions limités à la
  section ; suppression du placement arbitraire des jeux et des mélanges de
  calculs du thème dans les chapitres ; cas pratiques uniquement sur rattachement
  explicite. Les neuf questions SDGN sont conservées et réparties par chapitre.
- Portée : moteur commun à toutes les matières ; aucun changement Supabase.
  Les chapitres courts peuvent proposer moins d'exercices. Les tests du thème
  restent transversaux. Les anciennes notes des deux jeux à trous remplacés ne
  sont pas transférées aux nouveaux jeux (identifiants propres à chaque chapitre).
- Vérifications : `npm test` : 154 tests réussis ; compilation réussie ; trois parcours navigateur ciblés réussis
  (SDGN personnalité, formes d'exercices en droit, calcul lié au chapitre en maths).
  Tests de régression ajoutés pour l'isolation et les neuf questions réaffectées.
  Empreintes de contenu régénérées intentionnellement pour la suppression des
  compléments hors chapitre dans toutes les matières.
- Validation complète : 154 tests et 76 parcours navigateur réussis sur GitHub
  (exécution `39145878970`). Audit supplémentaire de 54 chapitres SDGN : aucun
  choix de QCM ni flashcard générée absent du cours associé (424 jeux inspectés,
  140 cartes). Les jeux rédigés à la main ont été relus pour les rattachements SDGN.
- Fusionné : PR #3, commit `c2eec03`. Publication automatique lancée par la fusion
  sur `main` ; son résultat se consulte dans les Actions GitHub. Aucune reprise
  nécessaire sur cette correction ; Claude peut choisir une autre tâche.

### AUDIT-20261018-CODEX-01 — Codex — 18 octobre 2026

- Demande : audit transversal du projet et de la publicité fournie en conversation.
- Rapport : `docs/AUDIT-2026-10-18.md` ; inventaire de 19 matières, 94 thèmes,
  806 chapitres, 31 pages et 33 routes. Sources auditées : `124b8af` ; sources
  applicatives identiques à la publication `d37bb2f`.
- Vérifications : 154 tests relancés et réussis ; dernière CI de publication
  contrôlée (`39146348193`, tests et publication réussis). Reproductions locales
  du fuseau Paris, de la fusion multi-appareil, des scores, du dictionnaire et
  de la sauvegarde ; réseau simulé pour ces reproductions.
- Contrôles réels Supabase : catalogues des règles, privilèges, fonctions et
  déclencheurs, migrations et fonctions Edge déployées, Advisor sécurité.
  Aucune donnée d'élève lue, aucune modification de la base. Les détails de
  sécurité sont remis au propriétaire dans le chat, avec renvoi public à l'état
  déjà documenté dans `supabase/README.md`.
- Publicité : vidéo de 32,125 s, images et transcription locale examinées ;
  fichier original conservé hors dépôt.
- À reprendre : priorités et limites dans le rapport. Points fonctionnels
  vérifiés : sauvegarde/fusion, dates civiles, scores, rattachements de cinq jeux,
  couverture pédagogique, dictionnaire et disponibilité réelle de la vision.
  La correction précédente de Codex a rendu cinq jeux inaccessibles et laissé
  50 sections sans activité autonome : les réparer sans réintroduire de questions
  hors chapitre. Le rapport inclut la comparaison avant/après.
- Portée de cette PR : documentation uniquement ; aucune correction fonctionnelle.

### NAV-20261018-CODEX-01 — Codex — 18 octobre 2026

- Demande : après la dernière fiche, revenir à la fiche 1 du même chapitre.
- Réalisé : la flèche suivante boucle dans le cours courant au lieu d’ouvrir le
  chapitre suivant ou le test du thème. Le mode plein écran reste ouvert ; le
  clavier suit la même règle. Le compteur conserve le numéro de fiche.
- Vérifications : 154 tests unitaires réussis, compilation réussie ; trois
  parcours navigateur couvrent la lecture normale, le plein écran au clavier
  et le dernier chapitre d’un thème. Aucune modification Supabase.
- Branche : `fix/retour-premiere-fiche` ; PR #7. Le résultat de la validation
  complète, la fusion et la publication sont consultables dans cette PR et ses Actions.

### CLASSE-20261018-CODEX-01 — Codex — 18 octobre 2026

- Demande : refuser un code erroné au lieu de rejoindre une classe fictive.
- Cause : les formulaires enregistraient toute chaîne d’au moins deux caractères,
  sans consulter `revizstmg_classe`. Le contrôle d’exclusion laissait aussi passer
  les pannes réseau.
- Réalisé : formulaire commun pour Classe et Classement, validation de l’existence
  et de l’exclusion avant l’enregistrement du profil et du code local. Une erreur
  laisse le formulaire ouvert ; les doubles envois sont bloqués. Même contrôle
  pour le code facultatif à l’inscription, avec reprise sans recréer le compte.
- Vérifications finales : 154 tests unitaires, compilation et onze parcours
  ciblés réussis ; validation complète GitHub : 90 parcours navigateur réussis
  (exécution `39154662729`). Codes inconnus puis valides, exclusions, pannes
  de recherche, d’exclusion et d’enregistrement, ainsi que reprise de l’inscription.
- Supabase : lecture seule, code inexistant = zéro résultat ; la fonction de
  recherche est autorisée aux comptes connectés. Aucune migration ni donnée modifiée.
- Fusionné : PR #8, commit `c3e2bce`. Publication automatique lancée par la fusion ;
  son résultat se consulte dans les Actions sur `main`.

### COMPTE-20261018-CODEX-01 — Codex — 18 octobre 2026

- Demande : le rôle professeur reste associé au compte élève après alternance
  des comptes sur un même PC.
- Reproduit : quatre régressions de sessions tardives échouaient avant correction :
  un renouvellement professeur pouvait remplacer la session élève, la déconnecter,
  rouvrir une session fermée, ou faire repartir une requête avec un autre compte.
  Au démarrage, le rôle local n’était pas remplacé si un compte était déjà mémorisé.
- Réalisé : réponses de session vérifiées avant application, requêtes liées au
  compte d’origine, restauration commune du profil et du rôle serveur pour les
  connexions et le démarrage. La progression ne fusionne qu’à identité égale.
  Les trois entrées de déconnexion passent par le même nettoyage local ; la
  sauvegarde finale précède la fermeture de session.
- Vérifications : 164 tests unitaires réussis et compilation réussie ; onze
  parcours de codes de classe réussis, puis trois parcours de comptes validés
  (rôle périmé, ancienne identité et aller-retour élève/professeur/élève).
  La première CI a validé 91 parcours ; deux scénarios ajoutés nécessitaient
  des données de bonus quotidien et une simulation PC/app installée, corrigées
  et validées localement. La CI complète finale figure dans les Actions de la PR #10.
- Portée : application uniquement, aucune modification Supabase ni rôle modifié
  dans les comptes réels. Branche `fix/isolation-comptes`.

### SHOP-20261018-CODEX-01 — Codex — 18 octobre 2026

- Demande : refonte complète de la boutique, davantage d’objets et des mois
  Premium/Ultimate offerts pour des niveaux et résultats élevés.
- Réalisé : 50 articles dans cinq collections, recherche/tri/filtres, inventaire,
  articles rares verrouillés, packs de gels, titres de profil, bannières d’accueil,
  cadeaux uniques de niveau. Anciens identifiants, prix et achats conservés.
  Douze niveaux historiques conservés ; niveaux 20/30 à 20 000/73 500 XP.
- Programme : Premium nécessite 20 thèmes à 90 % minimum et le niveau 20 ;
  Ultimate, 30 thèmes à 95 % et le niveau 30. Chaque thème compte une fois.
  Le propriétaire a précisé que le contenu des offres sera défini plus tard.
  Les mois sont donc réservés pour leur lancement, après vérification ; aucune
  activation d’abonnement ni débit. Brouillon e-mail facultatif, jamais d’envoi
  automatique. Conditions explicites dans la boutique et les CGU.
- Persistance : le solde et les gels utilisent une version de portefeuille, mise à
  jour aussi lors des gains, pour éviter qu’une ancienne copie rembourse les achats.
  Cela reste une fusion par dernière modification, pas une comptabilité serveur
  transactionnelle des achats simultanés sur plusieurs appareils. Achats, stock et réservations synchronisés dans la progression
  existante ; paliers uniques conservés en fusion. Les objets de profil ne passent
  pas au compte suivant. Les cadeaux cosmétiques restent rééquipables.
- Vérifications : 174 tests unitaires réussis, compilation réussie, six parcours
  boutique/exercices réussis ; contrôles supplémentaires réussis après les derniers
  ajustements du mode sombre et du palier Ultimate. Aperçus PC et mobile examinés.
  Seuils calibrés sur les 36 à 47 thèmes disponibles par filière. Les résultats
  complets de CI et la publication sont consultables dans la PR #11 et ses Actions.
- Limite : pièces et scores côté client ; l’activation commerciale devra être
  vérifiée côté serveur ou par les éditeurs lors du lancement. Aucun changement
  Supabase, aucun paiement mis en place, aucune fonction Premium inventée.

### I18N-20261019-CODEX-01 — Codex — 19 octobre 2026

- Demande : les traductions doivent fonctionner partout, notamment dans la boutique.
- Réalisé : couverture intégrale des clés existantes dans EN/ES/IT/AR (39 clés
  manquantes dans trois langues, 41 en arabe), 262 textes publics intégrés par
  langue, catalogue et états de boutique localisés sans changer les identifiants.
  Dates/nombres et lecture vocale adaptés aux cinq langues ; alignements logiques.
- Couverture des pages : compilation des littéraux publics du JSX et des libellés
  accessibles via composants React, sans observation/mutation du DOM. Les noms,
  saisies et messages variables restent exclus ; les modèles sont interpolés
  localement. Le code, les formules et les exclusions explicites sont préservés.
  Titres légaux, FAQ, matières et ressources publiques utilisent une annotation.
- Moteur : sources IT/AR corrigées, fichiers par langue, cache/regroupement des
  requêtes, deux requêtes simultanées, découpage UTF-8 sous la limite du service,
  absence de réponse périmée après bascule de langue, panne/quota signalés avec relance.
- Vérifications : 182 tests unitaires réussis, compilation réussie et 12 parcours
  navigateur ciblés réussis : cinq langues, achats/équipement/réservations, bascule
  sans rechargement, confidentialité du profil et des brouillons, panne et relance.
  Régression sur les accents vérifiée à la compilation. Consignes et conseils
  publics des projets/coach annotés ; brouillons conservés dans leur langue.
  CI complète sur le code `39f2d06` : 182 tests unitaires et 105 parcours
  navigateur réussis (Actions `39171897995`). Publication suivie dans la PR #12.
- Portée : interface et textes publics ; les contenus publics hors catalogue
  intégré dépendent toujours du service en ligne. Les messages privés et les
  saisies ne sont pas traduits automatiquement. Aucun changement Supabase.

### DOC-20261018-CLAUDE-01 — Claude — 18 octobre 2026, soir (heure de Paris)

- Demande du propriétaire : un fichier qui répartit de nombreuses tâches entre
  Codex et Claude pour qu'ils ne se gênent pas.
- Réalisé : `docs/TACHES.md`, deux couloirs de fichiers (Supabase, comptes,
  sauvegarde, dates, exploitation, pages légales et projets accompagnés pour
  Claude ; contenu, moteur d'exercices, scores, traductions et pages de révision
  pour Codex), fichiers communs à annoncer, 18 tâches Claude (C01-C18) et
  16 tâches Codex proposées (X01-X16), dépendances entre couloirs. Les tâches de
  Codex sont des propositions du propriétaire : Codex les annonce lui-même ici
  quand il les commence. Lien ajouté en tête de ce journal.
- Vérifications : relecture de l'audit, des PR ouvertes (#6) et de l'état réel de
  Supabase en lecture seule (règles d'accès finales et suppression du compte non
  appliquées ; rappels push installés, aucun abonné). Documentation uniquement :
  aucun changement du site ni de Supabase.
- Points signalés au propriétaire : la suppression du compte prévue efface aussi
  le compte de connexion partagé avec NAH, à décider avant C01 ; la branche
  `claude/competences-demandes-60d791` (13/10, hors journal) modifie
  `.claude/settings.json` et `CLAUDE.md` et entrerait en conflit avec `main`.
- PR #13 fusionnée le 20 octobre 2026, à la demande du propriétaire.
- Prochaine action : C01 après la décision du propriétaire sur les comptes NAH.

### PEDAGO-20261019-CODEX-01 — Codex — 19 octobre 2026 (Paris)

- Demande : commencer les priorités annoncées, X06 puis X01.
- SDGN Première : coût du travail = salaire brut + cotisations patronales ; les
  cotisations salariales déjà incluses ne sont plus ajoutées une seconde fois.
  Le corps du cours concorde avec son tableau final. Exemple de « savoir »
  reformulé en « Connaître les règles comptables de débit et de crédit ».
  Source de contrôle : simulateur Urssaf cité dans F11 de l’audit.
- Reprise sélective du code `66a6b77` de la PR #6 sur la version actuelle : cinq
  rattachements explicites, banques EN/ES bornées aux six verbes et aux règles de
  leur chapitre, sélection mélangée de dix questions. Les introductions ne
  promettent plus des questions toujours inédites. Identifiants conservés.
- Vérifications : 183 tests unitaires, compilation et huit parcours navigateur
  ciblés réussis, dont les cinq activités rétablies. Régression d’accès et de
  maîtrise maximale à 100 % pour les cinq jeux. Empreintes mises à jour
  volontairement pour les six thèmes concernés, aucune autre empreinte modifiée.
  Validation complète et publication suivies dans les Actions de la PR #15.
- Portée : contenu, TypedGen et tests uniquement ; aucun changement des fichiers
  de sauvegarde/dates travaillés par Claude dans la PR #14. Le journal et le README
  reçoivent uniquement les informations de cette tâche.
- Branche `fix/sdgn-et-exercices`, PR #15 ; remplace la PR #6 à sa fusion.

### PROGRAMME-20261019-CODEX-01 — Codex — 19 octobre 2026 (Paris)

- Demande : le programme bac de Première STMG doit faire réviser uniquement
  le français et les mathématiques pour les épreuves anticipées.
- Cause : le calendrier était déjà correct, mais les objectifs du jour utilisaient
  la file de révision de toute la filière. Le filtrage est désormais appliqué
  avant la sélection des quatre objectifs, même si une autre matière est urgente.
- Avancement de cette page : thèmes maîtrisés et total calculés sur le même
  périmètre (français/mathématiques en Première, filière complète en Terminale).
  Les révisions générales disposent toujours de toutes les matières.
- Vérifications : 186 tests unitaires et compilation réussis ; parcours navigateur
  réussi avec SDGN maîtrisé/en retard, quatre objectifs français ou maths,
  progression ciblée à zéro et lien vers une matière autorisée. Aucune empreinte
  de contenu modifiée. Validation complète et publication dans les Actions.
- Périmètre : study.js, Programme.jsx et leurs tests ; aucun fichier de sauvegarde
  ou de dates modifié. Branche `fix/programme-premiere`, PR #16.

### HOME-20261019-CODEX-01 — Codex — 19 octobre 2026 (Paris)

- Demande : refonte libre de l’accueil, avec possibilité de revenir au rendu précédent.
- Réalisé : fond papier et palette vert profond, thème conseillé selon les besoins,
  matières en grille avec décompte de thèmes, outils regroupés, progression et
  espaces partagés secondaires. Étude de gestion en Première, Grand Oral en Terminale.
- Reprise : la dernière fiche et sa page sont conservées sur cet appareil,
  séparément par identifiant de compte ; les comptes déjà configurés entrent
  directement. Le formulaire d’entrée présente la valeur du site et met l’essai
  sans compte en évidence. Aucun changement des règles d’authentification.
- Traductions : nouveaux textes en français, anglais, espagnol, italien et arabe ;
  titres des cours via le moteur public existant. Mode sombre conservé.
- Vérifications : 188 tests unitaires et compilation ; 10 parcours navigateur réussis : mobile,
  bureau, reprise de lecture, arabe/sombre, pagination et comptes.
  Les résultats définitifs et la publication sont suivis dans la PR #17.
- Périmètre : Home/CSS, présentation Welcome, Chapter/Course, repère local,
  dictionnaires publics, tests, README. Aucun changement store/auth/SRS/Supabase,
  réservés à Claude dans la PR #14. Un chevauchement Home est à rebaser si nécessaire.
- Branche `feat/nouvel-accueil`, PR #17. Version publiée avant cette refonte :
  `621551e`. En cas de retour arrière, révoquer la fusion de cette PR pour préserver
  les autres travaux ; ne pas réinitialiser main.

### HOME-RETOUR-20261019-CODEX-01 — Codex — 19 octobre 2026 (Paris)

- Retour demandé au bandeau sombre et or, aux cartes de matières et aux tuiles
  d’outils de l’accueil précédent. Les matières passent juste après le bandeau,
  avant les récompenses de série et les raccourcis.
- Conservation des cartes « Chaque séance compte » et « Ton coin à toi » avec
  leurs chiffres réels et liens Badges/Classe/Amis/Boutique. Le CSS du grand bloc
  vert et de l’illustration est supprimé ; seuls les styles des deux cartes restent.
- Conservation de la reprise à la dernière fiche par compte, des traductions et
  de la distinction Étude de gestion en Première / Grand Oral en Terminale.
- Périmètre : Home.jsx, Home.css, tests accueil et README ; aucun changement
  d’authentification, de store, de contenu ou de base. Branche `fix/accueil-classique`.
- Vérifications : 188 tests unitaires, compilation et quatre parcours navigateur
  réussis (mobile/bureau, reprise, arabe/sombre). Matières avant 550 px en haut
  de page aux deux largeurs ; pas de débordement horizontal. Publication et
  validation complète suivies dans la PR.

### MATIERES-20261019-CODEX-01 — Codex — 19 octobre 2026 (Paris)

- Demande : retrouver les petites cases matières sur deux lignes.
- Réalisé : quatre colonnes sur ordinateur et deux colonnes sur téléphone,
  icône/titre/décompte/progression conservés ; le reste de l’accueil est inchangé.
- Périmètre : Home.jsx, Home.css, test accueil et README. Le parcours vérifie
  le nombre réel de lignes aux deux largeurs et l’absence de débordement.
- Validation : 188 tests unitaires, compilation et quatre parcours accueil
  réussis. Grille vérifiée visuellement sur ordinateur. Branche
  `fix/matieres-compactes` ; publication suivie dans la PR.

### FORMULES-20261019-CODEX-01 — Codex — 19 octobre 2026 (Paris)

- Demande : supprimer Révision express et Formulaire ; choisir des formules pour
  générer automatiquement des exercices numériques.
- Réalisé : atelier avec recherche, filtre matière, sélection multiple, un à cinq
  exercices par formule, nouvelles valeurs, saisie numérique, correction avec
  substitution des valeurs, bilan et nouvelle série. 40 formules du catalogue,
  filtrées par niveau/spécialité. Aucun score de chapitre ni XP modifié.
- Anciennes pages supprimées ; `/express` et `/formules` redirigent vers
  `/atelier-formules`. Les préférences d’onglets Express/Formules migrent vers
  le nouvel atelier. Routage 404 et fil d’Ariane mis à jour. La mesure conserve
  la clé existante « formules » sans changement de serveur ni de base.
- Contenu : nouveau JSON commun, expressions arithmétiques interprétées sans eval,
  nombres et corrections calculés localement. Contrôle des saisies à virgule,
  point, espaces et chiffres arabes ; aucun champ saisi transmis à la traduction.
- Traductions : titre/navigation dans les cinq langues, nouveaux textes UI dans
  les quatre dictionnaires publics ; noms/formules pédagogiques par le moteur
  public existant. Aucun changement d’authentification/store/Supabase.
- Vérifications : 192 tests unitaires, compilation et six parcours navigateur
  (accueil, reprise, arabe/sombre, séance et redirections), calculs de référence,
  4 000 tirages, filtrage et sélection. Empreintes des cours inchangées.
- Branche `feat/atelier-formules` ; référence PR et publication suivies dans la PR.

### TROUSSE-20261019-CLAUDE-01 — Claude — 19 octobre 2026 (Paris)

- Demande du propriétaire : sur l'accueil, « Réviser & réussir » ne doit plus
  montrer toutes les options d'un coup ; quelque chose d'original et de discret.
- Résultat : une seule carte. En haut, « Conseillé maintenant » : un outil choisi
  d'après la situation de l'élève (bac dans moins de 30 jours → bac blanc ;
  thèmes de la filière à réviser aujourd'hui → révision intelligente ; chapitres
  à revoir → favoris ; sinon le programme jusqu'au bac). En dessous, « Ta
  trousse · 8 outils » : les icônes empilées des autres outils, une ligne qui se
  déplie en liste compacte. Fermée par défaut ; l'appareil se souvient du choix
  (`stmg_trousse_ouverte`). Mêmes outils et mêmes libellés qu'avant (Grand Oral en
  Terminale, étude de gestion en Première), plus l'atelier de formules de la PR #23.
- `Home.jsx` (couloir de Codex) : la section et les tuiles devenues inutiles sont
  remplacées par `<OutilsAccueil />`. Le reste de l'accueil ne change pas. Le
  parcours de l'étude de gestion ouvre la trousse avant de cliquer.
- Vérifications : 194 tests unitaires (dont 6 pour l'outil conseillé),
  compilation, 116 parcours navigateur (dont la trousse), captures sur téléphone
  (clair, sombre) et ordinateur.
- Branche partie de `main` : indépendante des PR #14, #18 et #20 (la PR #14
  touche deux autres lignes de `Home.jsx`, sans conflit). À jour avec `main`,
  cases matières compactes de la PR #21 comprises.

### INSPECTION-20261020-CLAUDE-01 — Claude — 20 octobre 2026 (Paris)

- Demandes du propriétaire : vérifier tous les cours et exercices (cinq agents) ;
  analyser les fonctionnalités et l'interface (deux agents, tableaux) ; inspecter
  chaque recoin du site (trois agents) et rédiger un PDF d'améliorations ; « met
  en commun avec Codex sur GitHub ».
- Livraison : [dossier](audits/2026-10-20/README.md), [PDF de 89 pages](audits/2026-10-20/RevizSTMG-ameliorations-du-site-2026-10-20.pdf).
  480 propositions (fonctionnalités 118, interface 157, parcours 78 dont 43
  défauts, technique 65, pédagogie 62) et 217 erreurs de contenu (12 bloquantes),
  chacune avec effort, impact, priorité ou correction proposée.
- Avec l'audit de Codex (AUDITSITE-20261019-CODEX-01) : la synthèse rattache les
  dix constats partagés aux actions A01 à A23, et les erreurs de contenu
  complètent la PR #24. Rien n'est attribué : responsables à choisir ici.
- Points à signaler à tous :
  - 60 règles d'accès sur 64 restent ouvertes dans les migrations appliquées ;
    les règles prêtes dans `supabase/a-valider/` attendent l'accord du propriétaire ;
  - le BO spécial n° 4 du 17 septembre 2026 (session 2027 : épreuves écrites,
    épreuve anticipée de français, Grand Oral) n'a pu être lu qu'en extraits :
    à relire avant d'écrire des sujets ;
  - la PR #14 corrige déjà les dates (dont les intervalles de révision espacée)
    et la synchronisation complète ; ne pas les réimplémenter.
- Méthode : version `6a32b03` servie en local, Chromium (téléphone et
  ordinateur, clair et sombre, arabe, accessibilité, hors ligne), faux serveur
  Supabase pour les comptes. Aucune modification du site, du dépôt ni de la base
  pendant l'analyse. Captures et scripts non versionnés.
- Branche `claude/rapport-ameliorations` : livraison documentaire uniquement.

### PROG-20261019-CLAUDE-01 — Claude — 19 octobre 2026, nuit (heure de Paris)

- Demande du propriétaire : « Fait tout » sur le chantier proposé, ne plus
  jamais perdre la progression d'un élève (C03 à C06 de `docs/TACHES.md`, constats
  F01 à F04 de l'audit).
- C06, dates : « aujourd'hui », série, défi du jour, rappels et révision espacée
  prennent le jour du calendrier de l'appareil, et non plus le jour UTC (veille
  jusqu'à 1 h ou 2 h du matin à Paris). Calculs sur la date seule, sans effet des
  changements d'heure. Tout passe par `data/srs.js`.
- C03, sauvegarde : toute la progression part sur le compte deux secondes après
  chaque changement, et tout de suite quand l'élève quitte l'application. Une
  version (`_sync.rev`) protège la copie du compte : l'écriture n'aboutit que si
  cette copie n'a pas changé depuis la dernière lecture ; sinon, on fusionne
  d'abord, puis on renvoie. Hors ligne ou en cas d'échec, un bandeau « Non
  sauvegardé » s'affiche (`EtatSauvegarde.jsx`), avec un nouvel essai automatique
  (15 s à 5 min) et un envoi immédiat au retour du réseau.
- C04, fusion (`progression.js`) : pièces, gels, XP et réponses comptés appareil
  par appareil (un achat n'est plus remboursé, deux gains simultanés comptent
  tous les deux). Favoris, paquets, fiches, carnet d'erreurs, notes, date du bac
  et point de reprise sont datés élément par élément : la dernière modification
  l'emporte, suppression comprise (trace oubliée après 120 jours). La récompense
  de la semaine n'est plus perdue à la fusion. Une copie d'une ancienne version
  de l'application suit les anciennes règles.
- C05, déconnexion : la progression part d'abord. Si c'est impossible (hors
  ligne, échec, session expirée), l'élève est prévenu et choisit : rester
  connecté ou se déconnecter quand même. La session est ensuite fermée sur
  Supabase (`/auth/v1/logout`), plus seulement sur l'appareil. Les rappels push
  sont arrêtés dans la même étape (3 s au plus sans service worker).
- Vérifications : `npm test` : 229 tests réussis (nouveaux : `dates.test.js`,
  quatre fuseaux et changements d'heure ; `fusion.test.js`, scénarios à deux
  appareils de l'audit ; `sauvegarde.test.js`, envoi conditionné à la version ;
  `auth-session.test.js` complété). Compilation réussie. Parcours navigateur
  complets sur la version compilée : 110 réussis, dont `sauvegarde.spec.js`
  (note envoyée, hors ligne puis retour du réseau, autre appareil entre-temps,
  déconnexion retenue puis forcée), répété trois fois sans échec. Aucune
  requête vers la vraie base : réseau simulé dans tous les tests.
- Limite : Supabase n'est pas joignable depuis la session de Claude. Le filtre
  de version (`progress->_sync->>rev`) suit la syntaxe documentée de PostgREST
  mais n'a pas été essayé contre la vraie base : à surveiller après publication
  (bandeau « Non sauvegardé » chez un élève en ligne = filtre refusé).
- Fichiers hors de mon couloir, changés au minimum : `Home.jsx` et
  `DailyChallenge.jsx` (la date du jour vient de `srs.js`), phrase du portefeuille
  dans la section boutique du README. Fichiers communs : `Layout.jsx` (bouton de
  déconnexion, bandeau de sauvegarde), `tests/parcours/eleve.js` (date du jour).
- Textes nouveaux, en français dans le JSX de `EtatSauvegarde.jsx` : traduits
  par le service en ligne tant qu'ils ne figurent pas dans
  `localisation/public.*.json`. Aucune clé ajoutée aux dictionnaires.
- Supabase : aucune modification ; la progression reste dans `profiles`.
- Branche partie de `claude/repartition-taches` (PR #13) : à fusionner après elle.
- Fusionnée le 20 octobre 2026 à la demande du propriétaire.
- Prochaine action : contrôle d'une
  vraie sauvegarde après publication.

### SUPPR-20261019-CLAUDE-01 et NOTES-20261019-CLAUDE-01 — Claude — 19 octobre 2026 (Paris)

- Demande du propriétaire : « met en place le fait de supprimer son compte et que
  toutes les données soient supprimées de partout (GitHub, Supabase…). Ensuite
  construis les notes. » NAH devant être détruit, le compte de connexion partagé
  peut être supprimé entièrement (décision attendue dans C01, désormais prise).
- Supabase : accord explicite du propriétaire pour la fonction de suppression.
  Le reste de `a-valider/` (règles d'accès, nettoyage) n'est pas concerné.
- GitHub : vérifié, le dépôt ne contient aucune donnée d'élève (statistiques
  agrégées seulement).
- Chevauchements : aucune PR de Codex ouverte. `App.jsx` (route de la page des
  notes) est un fichier commun : une ligne ajoutée.
- SUPPR, résultat : la fonction `revizstmg_supprimer_compte` efface aussi les
  signalements de l'élève, les duels de classe où il est adversaire, ses
  exclusions, ses rappels sur téléphone, ses jetons de connexion et son journal de
  connexion, puis le compte lui-même. Migration
  `20261019075848_revizstmg_suppression_compte.sql`, appliquée sur Supabase sous
  ce nom ; retirée de `a-valider/` et de `A_COLLER_DANS_SUPABASE.sql`. Sur
  l'appareil, « Supprimer mon compte » vide tout le stockage du navigateur et
  recharge l'application. Confidentialité (section 7), README et
  `supabase/README.md` décrivent ce qui est effacé et ce qui reste un temps
  (journaux et sauvegardes de Supabase, e-mails reçus, autres appareils).
- Vérifications : 233 tests unitaires, compilation, 116 parcours navigateur, base
  locale jetable avec les règles de `a-valider/` : 30 vérifications réussies,
  aucune ratée (dont le compte, le profil, les signalements, les rappels, les
  duels et les exclusions de A effacés, ceux de B gardés).
- Limite : la suppression n'a pas été essayée sur un vrai compte de la base.
- Prochaine action : relecture de la PR #18 ; puis NOTES sur `claude/mes-notes`.
- NOTES, résultat : page `#/mes-notes` (`pages/MesNotes.jsx`), lien dans Mon
  espace. L'élève écrit sa note sur 20 (« 15,50 » ou « 15.5 ») ; la matière puis
  le chapitre (thèmes des cours de sa filière, plus « Toute la matière ») se
  choisissent dans des menus. « Ce qu'il faut améliorer » : tout chapitre sous
  10/20 et, dans chaque matière où au moins deux chapitres sont notés, celui à la
  moyenne la plus basse. Pas de conseils ni de liens vers les exercices : c'est
  la partie Premium du document des offres. Calculs dans `src/notesClasse.js`.
- Stockage : champ `notesClasse` de la progression, sauvegardé sur le compte et
  fusionné entre appareils comme les autres éléments datés (suppression
  comprise). `profiles` n'est lisible que par l'élève (règles vérifiées sur
  Supabase, lecture seule) : ni la classe, ni le professeur, ni l'espace parent
  ne voient les notes. Elles sont dans l'export et partent avec le compte.
- Fichiers communs ou hors couloir, changés au minimum : `App.jsx` (route),
  `pwa/404.html` (adresse connue), `mesure.js` (l'écran compte comme « moi » :
  un nom d'écran à lui demanderait de modifier la fonction SQL de mesure).
  Textes en français dans le JSX, traduits par le service en ligne ; aucune clé
  ajoutée aux dictionnaires. Confidentialité et README complétés.
- Vérifications : 251 tests unitaires (dont 16 pour les notes : saisie,
  classement, fusion entre appareils), compilation, 121 parcours navigateur (dont
  la saisie, les menus, le classement, le rechargement et la suppression d'une
  note), page vérifiée sur téléphone en clair et en sombre.
- Supabase : aucune modification.

### CORRECTIONS-20261020-CLAUDE-01 — Claude — 20 octobre 2026 (Paris)

- Demande du propriétaire : « Fusionne les PR et règle les 10 gros problèmes »
  (résumé de l'inspection, `docs/audits/2026-10-20/`). PR #13, #14, #18 et #20
  fusionnées après mise à jour avec `main` et CI verte.
- Problème 1 (règles d'accès) : vérifié en lecture seule sur Supabase (59 règles
  ouvertes, 9 lignes de test orphelines), testé sur la base locale (21
  vérifications réussies). L'application n'a pas abouti : l'outil Supabase a
  expiré sans rien appliquer, et la suppression des 9 lignes a été bloquée par la
  protection des actions. Rien n'a changé dans la base. À appliquer par le
  propriétaire : `supabase/a-valider/A_COLLER_DANS_SUPABASE.sql` (parties 1 et 2).
- Lot 1, fait : page blanche hors ligne après une mise à jour et page d'erreur en
  cache (`pwa/sw.js`) ; copie de secours de la progression, stockage plein signalé,
  traductions mémorisées limitées ; essai sans compte protégé (confirmation avant
  effacement, progression reprise par un compte existant) ; inscription avec
  confirmation de l'e-mail terminée à la première connexion ; tests à l'heure de
  Paris dans la CI.
- Contenu (couloir de Codex, à la demande du propriétaire) : les 12 erreurs
  bloquantes du rapport (écriture d'achat avec escompte, critères DICP en SIG,
  Ricardo, utilité marginale, performance, ser/estar, tableau d'histoire, notions
  « Définir »…) ; 49 paires ajoutées à `notions-liees.json` ; moteur : étapes de
  méthode (« Définir », « Identifier »…) et numéros cerclés exclus des notions.
  Aussi : café à 10 %, Shoah, RGPD et consentement, Sécurité sociale (1958),
  « grand remplacement ». Empreintes de contenu mises à jour volontairement.
  Vérifié par 772 040 questions générées : aucune erreur bloquante ne ressort.
  Lot 1 fusionné (PR #27), CI verte.
- Lot 2 (problèmes 6, 7, 8 et 10), branche `claude/maitrise-parcours` :
  - maîtrise : chaque chapitre compte ses 3 meilleurs exercices (tous s'il en a
    moins), le thème prend la moyenne de ses chapitres ou le test du thème s'il
    est meilleur ; le chapitre de chaque exercice rédigé passe dans l'index léger
    et le nombre d'exercices par chapitre est calculé d'avance
    (`npm run chapitres`, vérifié par `tests/chargement.test.js`) ; réponse
    rédigée vide refusée au test du thème ; bac blanc, défi et coach hors de
    l'objectif de la semaine ;
  - parcours : bouton « Ma séance du jour » (erreurs dues, révision, prochain
    exercice du cours), barre du bas Accueil · Cours · Réviser · Bac blanc · Moi,
    page « Cours », exercice en plein écran, une seule fenêtre automatique par
    visite ;
  - révisions : carnet d'erreurs à boîtes (1, 3 puis 7 jours, sortie après trois
    réussites espacées), alimenté par tous les modes ; « Refaire mes erreurs » en
    fin de série (sans compter dans la maîtrise) ; « Pourquoi ? » sous chaque
    correction ;
  - professeur et parent : accueil du professeur (classes, élèves à relancer),
    onglets propres ; un parent sans profil d'élève n'a plus les menus d'élève ;
    104 textes récents traduits hors ligne en anglais, espagnol, italien et arabe.
  - Vérifié : 275 tests unitaires (UTC et heure de Paris pour la logique),
    construction, 133 parcours Playwright.
  - Mesure d'audience : `/cours` compte pour « matiere » et `/seance` pour
    « revision », sans changer la fonction SQL (accord du propriétaire requis).
- Problème 9 (épreuves), en partie, même branche :
  - le Bulletin officiel spécial n° 4 du 17 septembre 2026 (NOR MENE2622652N
    pour la STMG) n'a pas pu être lu : le site du ministère est bloqué par le
    réseau de l'environnement ; seuls des extraits de moteur de recherche sont
    lisibles (épreuves de 4 h, coefficient 16, dossiers documentaires). Aucun
    nouveau sujet n'a donc été écrit : ce serait inventer ;
  - fait : propositions des 85 QCM d'études de documents mélangées à chaque
    partie (`games/common.jsx`, `melangerChoix`) ; bac blanc QCM matière par
    matière par défaut, présenté comme un QCM et après les sujets au format de
    l'épreuve ; carte de l'épreuve anticipée de mathématiques pour la Première
    (date du calendrier officiel, renvoi au Bulletin, sans format inventé) ;
  - reste : écrire de vrais sujets par épreuve (barème, corrigé) après lecture
    du Bulletin, enrichir les sujets maigres (SIG : 2 questions), entraînement
    complet à l'épreuve anticipée de mathématiques.
- Lot 2 et problème 9 fusionnés (PR #28), CI verte ; vérifié avant fusion :
  276 tests unitaires, construction, 134 parcours Playwright.

### LISTE-20261020-CLAUDE-01 — Claude — 20 octobre 2026 (Paris)

- Demande du propriétaire : « Fais de 1 à 10 » (liste en 28 points du 20 octobre ;
  le propriétaire indique que Codex fait les points 11 à 28).
- Déjà faits avant cette tâche, vérifiés par les tests existants : 1 (tout est
  sauvegardé), 3 (anciennes sauvegardes), 4 (minuit et changements d'heure),
  5 (récompense hebdomadaire après fusion), 6 (exercices liés à leur chapitre,
  17 études de documents rattachées), 7 (écriture de 19 €, responsabilité des
  associés).
- Fait : 2, indicateur « Enregistré / En attente / Non enregistré » dans
  l'en-tête ; 9, menus et fenêtres au clavier (Échap, Tab qui reste dans la
  fenêtre, retour du focus ; l'exercice en plein écran garde le focus sans
  quitter sur Échap) ; 10, barre « Générer mes exercices » collée en bas de
  l'écran dans l'atelier.
- Point 8 (règles d'accès) : état réel vérifié en lecture (59 règles dont 43
  ouvertes, fonctions privées en place, 9 lignes de test orphelines). Deux essais
  d'application : l'outil Supabase a expiré sans rien appliquer (il attend une
  confirmation à l'écran). Rien n'a changé dans la base.
- Vérifié : 276 tests unitaires, construction, 138 parcours Playwright (dont
  `tests/parcours/clavier.spec.js` et l'indicateur dans `sauvegarde.spec.js`).
- Bulletin officiel spécial n° 4 du 17 septembre 2026 lu (PDF) : l'écrit de
  management, sciences de gestion et numérique 2027 ne porte que sur la partie
  commune ; le sujet de l'app contient encore une partie « enseignement
  spécifique ». Maths anticipées (session 2028, passée en juin 2027) : 2 h sans
  calculatrice, automatismes (6 points) puis 2 ou 3 exercices (14 points).
- Point 8 fait le 20 octobre : le propriétaire a collé le script dans Supabase →
  SQL Editor. Vérifié sur la vraie base : 64 règles réservées aux comptes
  connectés, aucune ouverte à tous, RLS active sur les 16 tables, aucune ligne
  orpheline ; la clé publique seule reçoit 401 sur ces tables ; le parent lit
  toujours son enfant par le code. Fichiers rangés dans `supabase/migrations/`
  (`20261020151400…`, `20261020151401…`), test local : 30 vérifications réussies.

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

### AUDITSITE-20261019-CODEX-01 — 19 octobre 2026 (Paris)

- Demande : trois agents inspectent le site puis livrent un PDF d’améliorations ;
  partager le résultat avec Claude sur GitHub. Les trois agents ont terminé.
- Rapports : UX/UI (14 points), fiabilité (14), pédagogie/accessibilité (11).
  Consolidation en 23 actions couvrant les 39 points, avec priorité, preuve,
  impact, effort indicatif, critère de livraison et coordination.
- Livraison : [rapport texte](audits/2026-10-19/README.md),
  [PDF de 19 pages](audits/2026-10-19/RevizSTMG-audit-global-2026-10-19.pdf),
  [plan partagé](audits/2026-10-19/PLAN-ACTIONS.md), rapports agents et preuves.
- Source applicative auditée : `6a32b03`. Build frais séparé réussi ;
  198 tests unitaires réussis. Inspection code des 34 routes, balayage UX
  de 29 routes à deux largeurs (chargements distingués des pages rendues),
  24 visites pédagogiques plus reprises des pages lourdes, contrôles ciblés
  sur site publié et build frais. Aucun vrai compte ni donnée réelle modifiés.
- Recette du livrable : PDF ouvert, 19 pages et liens contrôlés, extraction
  de toutes les fiches, rendu visuel vérifié, correspondance 39 points/23 actions.
  Générateur et données du rapport sont inclus pour une mise à jour cohérente.
- Coordination : #14 couvre déjà sauvegarde/fusion/état/récompense/date ;
  préconisation relecture/recette/intégration, pas une réimplémentation concurrente.
  #18 suppression, #20 notes et #13 répartition restent à confronter avant
  de démarrer un chantier. Les nouveaux responsables sont proposés, jamais
  imposés à Claude. La PR #24 reste la référence des anomalies de cours.
- Limites : aucune certification de droits serveur, RGPD ou WCAG ; aucune
  relecture factuelle exhaustive des 806 sections. Les risques non vérifiés
  sont distingués des bugs reproduits. Aucun correctif de production livré.
- Branche `docs/audit-site-20261019`, PR #25 : livraison documentaire uniquement.

### POINTS10-28-20261020-CODEX-01 — Codex — 20 octobre 2026

- Répartition demandée : Codex 10–28, Claude 1–9 ; le point 10 est réservé à
  Codex pour supprimer le chevauchement de la demande initiale.
- Code et limites détaillés : [suivi point par point](audits/2026-10-20/POINTS-10-28.md).
- Atelier : lancement fixe, reprise locale isolée par compte/filière, indices,
  bilan par formule et reprise des erreurs. Classe : file durable pour les
  résultats des QCM, envois confirmés et contrôles d'identité.
- Interface : date passée, premiers objets, réglages séparés, sommaires légaux,
  explication de la maîtrise et de l'entraînement, alternance des objectifs.
- PWA : confirmation du cache complet de la version active. Session : changement
  d'identité dans un autre onglet pris en compte sans réinitialiser un simple
  renouvellement de jeton. Banque historique inutilisée retirée de l'entrée JS.
- BO 2027 enfin lu : retrait de l'enseignement spécifique dans l'écrit de
  management ; dossiers existants explicitement partiels, pas un vrai sujet complet.
- Dépendances : aucune migration Supabase appliquée ; contrats des gains vérifiés
  et de la rotation parent proposés. Relecture humaine des cours et rédaction de
  vrais sujets restent ouvertes. Ne pas annoncer les 19 points comme tous achevés.
- Recette en cours : premiers contrôles de reprise, date et réglages réussis ;
  reprise des tests complets séparément des mesures de performance. Résultats
  définitifs et référence de publication à consigner avant clôture de la PR #30.

- Intégration du 20/10 : la PR #31 a été fusionnée pendant la recette de #30.
  Fusion des améliorations clavier/sauvegarde, union des dictionnaires et des
  contrôles de traduction. Point 10 commun aux deux lots : une seule barre de
  lancement conservée avec la reprise et le bilan par formule du point 23.
  La recette finale porte sur l’ensemble des deux lots, pas sur #30 isolément.

### POINTS10-28-20261020-CODEX-01 — livraison et recette intégrée

- PR #30 fusionnée (`5f1e386`), code `9dcf0c6`, après intégration de #31.
  Une seule barre d’atelier ; améliorations clavier et sauvegarde conservées.
- Validation finale : 286 tests unitaires, construction, 143 parcours navigateur
  ([CI](https://github.com/revizstmg/revizstmg.github.io/actions/runs/39444696450)).
- PWA : contrôle de tous les fichiers, représentations `Vary: Origin` comprises,
  et correspondance avec la version affichée. Un ancien cache complet n’est pas
  présenté comme une confirmation du nouveau téléchargement.
- [Bilan point par point](audits/2026-10-20/POINTS-10-28.md),
  [mesures](audits/2026-10-20/PERFORMANCE.md), contrats serveur et grille éditoriale
  disponibles dans le même dossier. Le poids initial baisse de 2,8 % après
  intégration de #31 ; les deux mesures de temps ne valent pas garantie téléphone.
- Ne pas déclarer tous les points 10–28 terminés : 13/14/15/18/19/25/26/27 gardent
  les limites ou suites indiquées. Aucun gain commercial activé, aucune migration
  appliquée, aucune relecture humaine des cours inventée.
- Publication réussie : [workflow main](https://github.com/revizstmg/revizstmg.github.io/actions/runs/39445531708),
  143 parcours réussis à nouveau ; fichiers compilés déposés par le bot dans
  `38278fe`, GitHub Pages construit. Contrôle public du 20/10 à 15:14 UTC :
  accueil, réglages, atelier (un seul bouton et indices), aucune exception JS ;
  versions HTML/worker identiques `ccd9d4b219`. Les requêtes hors du domaine du
  site ont été bloquées ; aucun compte réel utilisé.
- Passation : lot livré, suites explicites dans le bilan. Aucune action annoncée
  au nom de Claude ; son lot #31 est conservé et la recette a porté sur l’ensemble.

- Actualisation après #32 : selon la PR de Claude, le propriétaire a appliqué
  les règles d’accès du point 8 et Claude les a vérifiées en lecture seule.
  Ne pas redemander cette action. Les contrats de gains vérifiés et de rotation
  du point 19 concernent des changements supplémentaires encore non livrés.

### CONFIDENTIALITE-20261020-CODEX-02 — Codex — 20 octobre 2026

- Périmètre annoncé : actualiser le paragraphe de confidentialité qui présente
  encore les espaces sociaux comme ouverts, après l’application des règles
  rapportée dans #32. Texte d’interface et quatre traductions hors ligne seulement.
- Aucune action Supabase ; aucune modification des règles, des données ni des
  autres sections juridiques. Recette par la chaîne existante avant publication.
- Branche : `fix/confidentialite-acces`. État : livré (#35).

- #35 : paragraphe actualisé et traduit hors ligne dans les quatre langues ;
  retrait de l’ancienne description d’espaces encore ouverts. Tests locaux :
  286 réussis ; CI #39447931411 réussie. Fusion effectuée par Claude, voir son
  journal ci-dessous. Publication ultérieure #39470972806 et Pages #39471834104
  réussies. La tentative de contrôle public supplémentaire depuis cet environnement
  a échoué sur une réponse 502 du proxy ; elle ne constitue pas une recette réussie.
  Le contrôle public précédent du lot principal reste consigné plus haut.

### FINITIONS-20261020-CLAUDE-01 — Claude — 20 octobre 2026

- Demande du propriétaire : terminer ce qui restait de la liste des 28 points
  après la limite de Codex. Le statut de Codex et ses entrées ne sont pas modifiés.
- #35 (confidentialité, Codex) passée en prête et fusionnée à la demande du
  propriétaire, CI verte ; #24 (audit du 19 octobre) fermée avec une note : ses
  trois anomalies sont corrigées (écriture GF dans #28, dossiers et responsabilité
  des associés dans #36).
- PR #36 (fusionnée) : 17 études de documents retirées des chapitres et ouvertes
  depuis l'onglet « Outils » du thème ; droit-t8 précisé (SARL/SAS, cas de la
  SNC) ; code parent de 10 caractères tiré par `crypto` et bouton « Renouveler
  le code » (suppression puis republication, sans changement de base) ; score
  de duel gardé et renvoyable si l'envoi échoue.
- PR #37 : test axe permanent (21 pages, clair et sombre, fenêtre, exercice) et
  corrections de contraste ; style commun `lien-retour` pour tous les retours,
  avec un test ; démarrage plus léger (données propres à une page chargées
  avec elle, polices variables : 336 → 288 ko sur l'accueil émulé, mesure dans
  `audits/2026-10-20/PERFORMANCE-TELEPHONE.md`) ; sujets d'entraînement à
  l'épreuve anticipée de mathématiques au format du BO (session 2028), avec
  correction ; la page Bac blanc disait « session 2027 », corrigé en 2028.
- Restent au propriétaire : point 15 (gains vérifiés par le serveur) seulement
  utile avant d'activer des offres payantes, dont le contenu n'est pas décidé —
  contrat dans `audits/2026-10-20/DEPENDANCES-SERVEUR.md` ; point 26 (relecture
  humaine des traductions) — grille dans `audits/2026-10-20/RELECTURE-ET-SUJETS.md`.
  Sujets complets de droit-économie et de management : documents réels sourcés
  et relecture d'un professeur nécessaires, non inventés ici.
- Aucune action sur la base Supabase dans ce lot ; tests sans accès à la vraie base.


### CLASSES-20261020-CODEX-03 — Codex

- Demande directe du propriétaire : retirer « ✓ Enregistré » de l’en-tête,
  permettre plusieurs classes aux professeurs et élèves.
- Périmètre : EtatSauvegarde.jsx, Classe.jsx, classroom.js, store.jsx,
  traductions et tests concernés. Intervention dans le couloir social signalée
  au propriétaire ; aucune PR concurrente ouverte au démarrage.
- Branche `fix/classes-multiples` ; aucune mutation de la base prévue.
- Livré dans #39, commit `c9de5b8`, fusion `8b01a9e`.
- Le statut positif « ✓ Enregistré » est masqué ; attente et échec conservés.
- Élèves : liste des adhésions lue sur le serveur, ajout d’une autre classe,
  sélection et sortie de la seule classe choisie. Les autres adhésions restent.
- Professeurs : le chargement initial précède la création ; une restauration
  tardive du profil ne masque plus les classes déjà chargées. Erreurs visibles.
- Changement de classe : onglets et contenu précédent réinitialisés, réponses
  tardives des métadonnées ignorées. Nouveaux libellés traduits en cinq langues.
- Validation : 293 tests unitaires locaux ; compilation ; 18 parcours ciblés.
  Recette GitHub #39487525128 : 293 tests, UTC et Paris, 152 parcours réussis.
  Les parcours reproduisent le défaut au rechargement professeur et vérifient
  deux classes élève, les échecs, la sortie et la persistance après rechargement.
- Aucun changement de schéma ni aucune donnée réelle modifiée pour les tests.
- Publication : workflow main #39488296011 réussi (293 tests et 152 parcours),
  compilation déposée par le bot dans `9db697d`, Pages #39488980292 réussi.
  Contrôle public : HTML et service worker servent la même version `96dfe3609b`.
  Correction fusionnée, publiée et suivi partagé.

### GOOGLE-20261020-CODEX-04 — Codex

- Demande directe du propriétaire : installer la balise et le fichier de
  vérification Google Search Console fournis, puis expliquer l’envoi du sitemap.
- Périmètre : une balise dans app/index.html ; fichier de vérification dans
  app/pwa/ (nom exact indiqué dans son contenu). Aucun accès au compte Google.
- PR #41 de Claude repérée : elle modifie également l’en-tête HTML pour le SEO.
  Intervention limitée à la vérification, signalée au propriétaire ; aucun
  changement du sitemap, du générateur ni des pages publiques de cette PR.
- PR #42 fusionnée (`319ad43`), code `ce7c09f`.
- Balise installée dans le head source ; fichier fourni copié sans changement
  sous son nom attendu `google8fdda423e86f83bd.html`. Le nom de téléversement
  « google search.html » n’est pas le nom attendu par Google.
- Compilation locale contrôlée : balise unique, contenu exact du fichier,
  sitemap XML valide. 293 tests unitaires locaux réussis ; CI #39492799529
  réussie, avec 152 parcours navigateur. Aucun compte Google manipulé.
- L’échec signalé par le propriétaire correspond à un fichier encore absent
  avant déploiement (404 vérifié). Explication donnée : attendre sa présence,
  valider la propriété puis accéder aux menus Sitemaps et Inspection de l’URL.
- Publication main #39493540102 réussie, version compilée `af2aef7`,
  Pages #39494203369 construit. Contrôle public réussi : fichier exact à son
  URL sans paramètre, balise présente à la racine et sitemap XML accessible.
- Reste au propriétaire : cliquer Valider dans Search Console, envoyer
  sitemap.xml puis demander l’indexation de https://revizstmg.github.io/.

### SITEMAP-20261020-CODEX-05 — Codex

- Demande du propriétaire : trouver une solution au statut Search Console
  « Impossible de récupérer », malgré un test Google d’URL active réussi.
- Diagnostic existant : XML conforme au schéma officiel, réponses 200 identiques
  navigateur/Googlebot/Inspection, aucune redirection HTTPS, DNS GitHub Pages,
  robots.txt autorise la lecture. La cause interne de Google n’est pas établie.
- Périmètre : sitemap texte alternatif app/pwa/sitemap.txt, déclaré aussi dans
  robots.txt ; rapport de diagnostic. Format officiellement accepté par Google.
  Nouvelle URL et format distinct pour tester le refus de l’entrée XML existante.
- PR #41 de Claude conservée : aucun changement de ses générateurs ni des pages
  de cours. Le sitemap XML reste déclaré ; le texte liste l’accueil existant.
- Branche `fix/sitemap-texte`, PR #44. Ajout réalisé et documenté dans
  audits/2026-10-20/DIAGNOSTIC-SITEMAP.md. Compilation et 293 tests locaux
  réussis ; contenu texte exact, équivalence avec les URL XML et déclarations
  robots contrôlés. Publication par la chaîne main avant contrôle HTTP public.
- PR #44 fusionnée (`54b90b1`), code `d0b6752`. Chaîne main #39497302917
  réussie (293 tests, 152 parcours), compilation publiée dans `6cb76d8`,
  Pages #39497916170 réussi. Contrôle public : texte exact, 200 text/plain,
  référence robots présente, XML toujours valide.
- Le propriétaire a confirmé que son test Google réussi concernait bien
  /sitemap.xml. Le diagnostic documente cette divergence avec le rapport.
- Le contournement n’est pas annoncé comme un succès Search Console avant que
  le propriétaire ait envoyé sitemap.txt et vérifié son état dans Google.

### NOM-SITE-20261021-CODEX-06 — Codex

- Demande du propriétaire : proposer RévizSTMG comme nom dans Google à la place
  de GitHub, sur le sous-domaine actuel, sans acheter de nom de domaine.
- Périmètre : données structurées WebSite dans app/index.html, cohérentes avec
  og:site_name déjà présent, nom visible et canonique existante.
- PR #41 de Claude identifiée : elle travaille aussi le head et prévoit WebSite.
  Insertion limitée annoncée au propriétaire ; préserver une seule déclaration
  WebSite lors de son intégration. Aucun changement de titre ni de contenu ici.
- Branche `fix/nom-site-google` ; validation, publication et contrôle public prévus.
  Le nom reste une préférence transmise à Google, pas un affichage garanti.
- PR #47 : WebSite ajouté, nom RévizSTMG et alternatives RevizSTMG / hostname.
  Validation locale : 293 tests (29 fichiers) réussis, compilation réussie,
  JSON-LD source et dist parsés et uniques ; canonique, og:site_name et jeton
  Search Console conservés. Publication automatique main à contrôler ensuite.
- PR #47 fusionnée dans e313913 (code 6f3a00b). Chaîne main #39579591861
  réussie : 293 tests en UTC puis à l’heure de Paris, compilation et parcours
  navigateur : 151 réussis au premier essai, un réussi après relance automatique
  (seance.spec.js, reprise des erreurs sur téléphone ; instabilité à surveiller).
  Compilation publiée par 81aa1dd ; GitHub Pages confirme built pour ce commit.
- Contrôle HTTP public après publication : 200, un seul WebSite RévizSTMG valide,
  URL https://revizstmg.github.io/, canonique, og:site_name et jeton Google conservés.
  L’affichage dans les résultats Google n’est pas encore confirmé : Google choisit
  le nom et doit réexplorer l’accueil. Aucun achat de domaine nécessaire.

### EXAMENS-20261021-CODEX-07 — Codex

- Demande : créateur d’examen blanc par demande libre, 60/120/180/240 minutes.
- Périmètre : nouveau créateur dans BacBlanc, chargement des matières demandées,
  sujet structuré et barème, copie chronométrée persistée par compte sur cet
  appareil, impression et corrigé après remise. Interface traduite.
- Fonction Edge dédiée examen-blanc : IA côté serveur, accès authentifié,
  validation entrée/sortie, cours fournis comme contexte, disponibilité explicite.
  Aucun changement de table ni de réglage d’une fonction existante.
- Hors couloir signalé au propriétaire : ajout autonome dans supabase/functions,
  accès au client auth existant sans le modifier. PR #41 SEO conservée.
- Branche feat/examens-personnalises ; tests logique, parcours simulés sans base
  réelle et contrôle du déploiement prévus. Aucun faux résultat IA de secours.
- PR #49 : implémentation terminée. Tests locaux finaux : 306 tests / 30 fichiers,
  compilation réussie et quatre parcours téléphone simulés réussis (création
  Première + Terminale, reprise, remise à échéance, quota et impression CSS).
- Fonction examen-blanc v1 déployée seule sur wyydagcjkbivtbuhbzon avec JWT requis
  et vérification utilisateur côté serveur. Contrôles réels non payants : GET 200
  ready:false ; POST avec clé publique seule 401 login_required.
  Aucune clé Gemini/Anthropic présente : génération réelle non activée et non
  testée avec un fournisseur réel. Pas de faux sujet ni de bascule cachée.
- Copie locale uniquement, pas de synchronisation entre appareils. Compteur de
  requêtes en mémoire par instance, pas un quota global de facturation. Limites
  documentées dans supabase/functions/examen-blanc/README.md. Aucune table modifiée.
- Pour Claude : fonction ajoutée hors couloir annoncée ; les paramètres de photo
  et rappels sont intacts. Prévoir l’ajout de ce flux IA dans la confidentialité
  lors de sa prochaine passe juridique ; information déjà explicite avant envoi.
- Chaîne main #39586195505 interrompue avant publication : le parcours de création
  écrivait deux captures temporaires sous /workspace/work, chemin absent du runner
  GitHub. Correction de test annoncée : retirer ces captures de développement,
  sans changer la fonctionnalité ni affaiblir les assertions. Branche
  fix/examens-parcours-ci. Publication à revérifier après chaîne complète.
- PR #50 fusionnée dans 518dfa9 (correctif 63c1cdd). Vérifications locales après
  correction : 306 tests et quatre parcours réussis. Chaîne main #39587091716
  entièrement réussie : 306 tests en UTC, 306 à l’heure de Paris, compilation et
  156 parcours navigateur réussis sans relance signalée. Version compilée 63eef3f,
  GitHub Pages confirme built sur ce commit.
- Contrôle public : accueil et fichier BacBlanc actif accessibles, nouveau
  créateur et appels examen-blanc présents ; métadonnées Google conservées.
  Fonction réelle : GET 200 ready:false, POST visiteur 401 ; OPTIONS CORS 200
  autorise les appels depuis le site. Aucune génération fournisseur réelle faite.
- Reste pour l’activation : ajouter une clé fournisseur dans les secrets Supabase
  (procédure dans supabase/functions/examen-blanc/README.md), cliquer Réessayer
  dans le créateur, puis vérifier un premier sujet réel. Fonctionnalité livrée
  et publiée ; génération IA honnêtement désactivée tant que cette clé manque.

### BAC-PDF-20261021-CODEX-08 — Codex

- Demande : refonte esthétique de Bac blanc, droit-économie et management sous
  forme de PDF complets, au format du bac, sans questions à remplir dans l’app.
- Périmètre : BacBlanc et nouveau catalogue d’annales officielles 2026 du ministère,
  liens directs aux fichiers originaux, page repensée en cartes de sujets ; PDF
  téléchargeables sujet/corrigé séparés pour les créations personnalisées.
- Maintien des entraînements maths et QCM dans une section secondaire, retrait
  des dossiers partiels de droit/management de cette page. Pas de fausse annale.
- Fichiers communs/hors couloir annoncés au propriétaire : ajout de jsPDF épinglé
  dans package.json/package-lock pour créer les PDF localement, chargé à la demande.
  Aucun changement Supabase. Règles 2027 et annales 2026 distinguées.
- Branche feat/bac-blanc-pdf ; sources ministérielles et vérification PDF prévues.
- PR #52 : annales originales ministérielles 2026 pour droit-économie et MSGN,
  trois centres chacune (six PDF contrôlés : HTTP 200 et signature PDF).
  Métropole relue : 8 pages en droit-économie, 15 en MSGN. Source : page des
  examens 2026 du ministère ; BO MENE2622652N distingué pour la session 2027.
- Refonte éditoriale vert profond/crème, couvertures, cartes, choix des centres.
  Dossiers partiels retirés, QCM de droit/économie/management retirés de cette
  page (y compris la sélection globale). Maths et autres QCM conservés.
- Créateur personnalisé : deux vrais PDF A4 téléchargeables, sujet/corrigé séparés,
  rédaction sur papier ; plus de champs de réponse dans l’app. jsPDF 4.2.1 épinglé,
  importé à la demande. Aucun changement serveur ni de clé IA.
- Validation locale : 308 tests, compilation et quatre parcours téléphone réussis.
  PDF extraits avec pdftotext : accents/euro conservés, réponses absentes du sujet
  et présentes dans le corrigé ; couverture rendue et inspectée. Nouvelle page
  inspectée en capture mobile ; traductions hors ligne enrichies dans 4 langues.
- Audit dépendances production : aucune alerte jsPDF ; deux alertes modérées de
  react-router / react-router-dom déjà présents, hors périmètre de cette refonte.
  Les annales fonctionnent sans IA ; les créations attendent toujours une clé.
- Chaîne main #39590257984 : 153 parcours réussis, deux contrôles globaux
  d’accessibilité refusent le contraste des numéros décoratifs en vue mobile
  (2:1 au lieu de 3:1). Le contrôle local précédent était en largeur bureau.
  Correction ciblée annoncée : retirer la transparence de ces numéros, conserver
  les tests et vérifier cette fois les deux largeurs, clair et sombre.
- PR #52 fusionnée dans e2be309 (code bc41c3c), PR #53 dans 1430ba3
  (correctif f3d3dee). Après correction : 308 tests locaux réussis, compilation,
  contrôles axe à 393 et 1280 pixels en clair et sombre sans défaut détecté.
- Chaîne main #39591430830 réussie : 308 tests UTC, 308 Europe/Paris,
  compilation et 155 parcours navigateur réussis. Version compilée 3f700d2,
  GitHub Pages confirme built sur ce commit.
- Contrôle public HTTP : accueil 200, fichier BacBlanc actif contient les
  annales officielles et les téléchargements PDF séparés ; CSS public comprend
  le correctif de contraste. Métadonnées Google préservées. Rendu bureau et
  mobile inspecté ; PDFs générés rendus avec les polices système et relus.
- Livré : accès immédiat aux six sujets officiels complets 2026 sans IA,
  rédaction sur papier, présentation refondue. Aucun corrigé officiel d’annale
  promis : seuls les sujets personnalisés exportent leur proposition de corrigé.
  La génération de ces sujets attend toujours une clé IA, sans changement serveur.

### 21 octobre 2026 — Codex — charte éditoriale commune (en cours)
- Demande propriétaire : étendre la présentation approuvée de Bac blanc aux autres pages.
- Périmètre : styles communs, en-têtes des pages, accueil, boutique et espace personnel ; Layout et pages partagées / sociales limités à la présentation. Préserver les travaux SEO de Claude, les comportements, traductions, thèmes, cours et données. Aucun changement Supabase.
- Accueil : matières hautes, petites cartes sur deux lignes et blocs progression / communauté conservés.
- Validation prévue : tests unitaires, compilation, parcours et accessibilité clair/sombre mobile/bureau, puis publication et contrôle public.
- Extension nécessaire du périmètre : workflow deploy.yml. La chaîne de la PR #55 échoue avant les parcours : ubuntu-latest désigne Ubuntu 26.04, non pris en charge par Playwright 1.56.1. Fixer le job navigateur sur Ubuntu 24.04, sans retirer ni assouplir les contrôles.
- Livré via PR #55 : code 2013c22, correctif de chaîne 78a5a82, fusion 50fbe41. Charte dans app/src/editorial.css ; en-têtes des pages, cartes et boutons communs, accueil / boutique / profil harmonisés. Bandeaux de lecture compacts ; disposition des matières et blocs progression / communauté préservés.
- Validation locale : 308 tests réussis et compilation ; accessibilité des 21 pages principales en clair/sombre sur téléphone réussie. Contrôle complémentaire de 18 pages en clair/sombre à 1280 px : aucun défaut axe ni débordement horizontal. Cours et chapitre vérifiés en grand texte / fort contraste à 393 px dans les deux thèmes : aucun défaut détecté. Captures accueil, cours, boutique et chapitre inspectées.
- Chaînes de branche #39593912698 et #39593919705 réussies ; chaîne main #39594689890 réussie (tests UTC / Paris, compilation et 155 parcours). Aucun contrôle retiré. Les essais navigateur bloquent les accès extérieurs ; aucune donnée Supabase touchée.
- Publication automatique 28047cd : GitHub Pages built confirmé. Contrôle public : accueil HTTP 200, CSS index-B2LrS7AE.css contient la charte et le thème sombre, fichiers Cours / Chapter / Shop / Profile portent les nouveaux styles. Annales officielles et téléchargements PDF distincts toujours présents ; métadonnées Google conservées.

### 21 octobre 2026 — Codex — impression compacte (en cours)
- Demande : réduire le nombre de pages imprimées, notamment le cours de GF sur la TVA.
- Périmètre : styles d’impression communs / lecteur de cours et parcours PDF de vérification. Supprimer les sauts forcés et les blocs indivisibles trop grands ; garder tous les textes, tableaux et définitions. Aucun changement au contenu pédagogique ni à Supabase.
- Demande ajoutée pendant le travail : retirer les QCM chronométrés de Bac blanc et présenter le créateur personnalisé comme les cartes de sujets PDF de la capture. Périmètre étendu à BacBlanc, CreateExam et leurs parcours ; conserver annales officielles, maths de Première et exports sujet / corrigé, sans modification serveur.
- Chaîne main #39632801672 : échec d’un ancien parcours Première attendant encore le sélecteur QCM retiré. Correction annoncée des assertions dans seance.spec.js pour vérifier le sujet de maths et l’absence des QCM. Même fichier : corriger une assertion intermittente sur le compteur (frontière de mot contre texte du bouton/question concaténé), en ciblant le compteur lui-même ; conserver le contrôle du nombre d’erreurs rejouées.
- Livré : PR #57 (code 79309fc, fusion b17b125), puis PR #58 (tests c76d220, fusion 78195c0). Lecture imprimée continue, marges 12 mm, texte 11 pt, encadrés compacts, tableaux fragmentables par ligne et définitions conservées une seule fois lorsqu’elles figurent déjà dans le cours. Présentation écran des cours inchangée.
- Bac blanc : QCM chronométrés retirés ; créateur présenté dans une carte avec couverture papier, responsive, même style que les annales. Annales officielles, sujet de maths de Première et exports PDF sujet / corrigé conservés. Message d’indisponibilité IA ajusté dans les cinq langues. Aucun changement de serveur, de clé ni de données.
- Validation locale : 308 tests et compilation réussis. PDF A4 réels avant/après : TVA 4 → 1 page, droit (chapitre 2 du thème 5) 3 → 1 ; aperçu du thème GF 3 → 2. PDF TVA rendu et inspecté, texte extrait avec accents / euro et dernière ligne du tableau présents. Nouveau parcours vérifie toutes les fiches imprimées et au plus deux feuilles A4 ; neuf parcours existants ciblés réussis, puis trois contrôles du fichier seance.spec.js réussis après correction. Contrôle axe mobile 393 px / bureau 1280 px, clair / sombre : aucun défaut détecté sur Bac blanc. Aucun contenu pédagogique modifié ; accès extérieurs bloqués dans les parcours.
- Chaîne main #39633883893 réussie : 308 tests UTC, 308 Europe/Paris, compilation et 156 parcours réussis. Version compilée 937da49, GitHub Pages built confirmé. Contrôle public : accueil HTTP 200, CSS index-By4756up.css contient l’impression continue et les marges 12 mm ; créateur en carte et retrait des QCM confirmés dans le fichier BacBlanc actif. Annales et téléchargements sujet / corrigé toujours présents ; métadonnées Google conservées.

### 21 octobre 2026 — Codex — diagnostic de génération Gemini (en cours)
- Propriétaire : clé Gemini ajoutée, mais première analyse échoue. GET confirme ready:true ; dernier POST observé 502 en environ 300 ms. Le fournisseur n’est pas diagnostiquable avec le message générique actuel.
- Périmètre : fonction examen-blanc, diagnostic fournisseur par lecture des métadonnées du modèle (sans génération payante, secret ni prompt exposé), tests serveur. Aucun changement de base ou d’authentification. Fonction partagée du couloir serveur : correctif nécessaire à l’activation explicitement demandée par le propriétaire.
- Fonction v3 puis v4 déployée, JWT toujours requis et vérification utilisateur POST conservée. 18 tests ciblés réussis et contrôle direct du classement des quotas. Clés normalisées (espaces de copie retirés côté serveur), diagnostic par métadonnées et erreurs catégorisées / journaux sans clé, prompt ni réponse fournisseur brute. GET du diagnostic réel : 200 ready:true, Google accepte l’accès au modèle. Cette vérification ne prouve pas une génération réussie. Nouvelle tentative authentifiée demandée au propriétaire pour capturer la catégorie exacte du refus, sans accéder à sa session.
- Nouvelle tentative du propriétaire après v4 : exam_provider_failure HTTP 404, provider_model_unavailable à l’étape plan. Métadonnées accessibles mais génération refusée pour le modèle. Correctif prévu : modèle Flash stable actuel, normalisation des identifiants et repli borné sur 404 uniquement, sans masquer les erreurs de quota / permissions. Référence : documentation officielle Google Gemini, modèles et dépréciations vérifiés le 21 octobre 2026.
- Après correction du 404, nouvelles tentatives du propriétaire : Gemini renvoie 503 (service indisponible), les 21 octobre 16:58 UTC. Ajouter une reprise différée bornée et une alternative Flash stable sur 404/503 uniquement, délai global de fournisseur borné, sans repli sur permissions / quota ni modèle Pro. Source Google : guide officiel troubleshooting, recommandation de backoff sur 503.
- PR #60 fusionnée dans 40983be (diagnostic), PR #61 dans 1e1a15d (404), PR #62 dans 5193937 (503). Fonction examen-blanc v6 ACTIVE, JWT requis ; source 8f6ad41. Flash 3.6 par défaut, alternative Flash 3.8, une reprise différée sur 503, délai fournisseur global 120 s. Aucun repli sur quota / permissions et aucune réponse factice.
- 22 tests serveur ciblés réussis : génération / contrat, accès authentifié, refus fournisseur, confidentialité des diagnostics, normalisation des clés / noms, modèle introuvable, indisponibilité et limite des reprises. Sonde réelle v6 : HTTP 200 ready:true sur les métadonnées. POST visiteur vérifié 401 sur v4, contrôle conservé. Aucun changement de base.
- Génération authentifiée réelle encore à confirmer : le propriétaire a été invité à refaire analyse puis création après v6. La présence d’une clé ou l’accès au modèle ne constituent pas une preuve de génération complète. Chaîne complète main #39640231645 lancée, pas encore déclarée réussie à ce stade.

### 21 octobre 2026 — Codex — intégration Groq
- Autorisation propriétaire : clé GROQ_API_KEY enregistrée, brancher la génération sur Groq. Périmètre : fonction examen-blanc et tests ; aucun changement de base ni autre fonction du projet partagé.
- Priorité Groq si clé présente, modèle Llama 3.3 70B, validation pédagogique et authentification conservées. Vérifier connexion, erreurs de quota et réponses structurées avant livraison.
- Liste réelle des modèles Groq vérifiée avec la clé serveur : Llama 3.3 absent ; choix effectif openai/gpt-oss-120b (JSON et sorties longues supportées dans la documentation Groq). GROQ_API_KEY prioritaire, EXAM_GROQ_MODEL permet de fixer un autre modèle. Aucun basculement payant automatique en cas de quota.
- Déploiement de la fonction seule, JWT conservé. Sonde lecture seule : ne prouve pas une génération authentifiée complète ; celle-ci reste à confirmer par le propriétaire.
- Livraison serveur v13 : sonde Groq ready:true, modèle accessible. 320 tests unitaires réussis (31 fichiers), dont 25 sur les examens ; aucune génération réelle réalisée sans session de l’élève. PR #64, code 2d4e5ef. Essai complet demandé au propriétaire.

### 21 octobre 2026 — Codex — volume de génération Groq
- Retour propriétaire : analyse réussie, création échouée. Journal serveur : HTTP 413 fournisseur. Documentation des limites gratuite : GPT OSS 120B 8K tokens/minute. Examiner une génération répartie plutôt que supprimer des cours ou livrer un sujet incomplet.
- Conclusion : la connexion / l’analyse ne suffisent pas à valider une épreuve complète sur l’offre gratuite ; le fournisseur refuse la création (413). Ne pas annoncer la fonctionnalité opérationnelle. Pas de suppression de cours, de basculement payant ni de sujet artificiel pour contourner la limite. Génération par étapes nécessiterait une conception dédiée (reprise et quotas), non livrée dans cette intégration.

### 21 octobre 2026 — Codex — retour Gemini
- Demande explicite : remettre Gemini. Priorité à la clé Gemini si présente, Groq conservé uniquement en absence de clé Gemini ; aucun basculement automatique sur erreur. Périmètre : sélection du fournisseur et test, fonction examen-blanc uniquement. Clés, base et modèles inchangés.
- Vérifications : 321 tests réussis (31 fichiers). Fonction v14 déployée avec JWT requis ; configuration réelle provider:gemini et métadonnées ready:true. Cette sonde ne prouve pas la disponibilité de generateContent ; création authentifiée à réessayer. PR #66, code ca8fbe8.

### 21 octobre 2026 — Codex — dossier documentaire et correction de copie
- Propriétaire confirme génération Gemini fonctionnelle. Demande : davantage de documents, questions sur documents et connaissances, dépôt fichier/photo avec note IA.
- Périmètre : créateur, PDF, traductions, fonction examen-blanc et tests. Dossiers 4/6/8/10 documents selon durée ; équilibre documentaire/connaissances vérifié pour nouveaux sujets, compatibilité des anciens maintenue.
- Correction Gemini multimodale PDF/JPEG/PNG/WebP, limites de volume/type des deux côtés, consentement avant envoi, aucune copie binaire en base ni localStorage. Note indicative calculée à partir des points validés par question ; copie illisible/inadéquate ne produit pas de note globale inventée. Authentification et quotas conservés ; aucune migration ni autre fonction partagée touchée. Skill Supabase appliqué.
- Périmètre complété : page Confidentialité, afin de décrire la correction Gemini et le stockage local du seul bilan, sans fichier. Aucun consentement payant / abonnement ajouté à ce service demandé.
- Livré par PR #67 : code 627ca1b, présentation 20acd71, fusion 00f711f. Fonction examen-blanc v15 ACTIVE avec JWT et vérification utilisateur conservés. Contrôles réels : provider gemini, métadonnées ready:true, appel grade visiteur refusé login_required. Aucune génération/correction réelle facturée pour les tests.
- 328 tests unitaires réussis (31 fichiers), 6 parcours ciblés de création/copie réussis avant la finition des boutons ; contrôle axe de la copie corrigée réussi, rendu mobile inspecté. Deux premières tentatives navigateur sans binaire Chromium ont échoué avant ouverture ; navigateur installé puis essais effectués sans accès extérieur. Une assertion de transcription répétée a été précisée à la première question, sans modifier les contrôles du résultat.
- Chaîne de publication main #39657504995 en cours : tests UTC/Paris et compilation passés ; parcours complets puis mise en ligne à confirmer. La qualité OCR réelle d’une copie manuscrite doit être vérifiée avec le propriétaire ; les essais automatisés utilisent des réponses simulées.
- Vérification finale après finition : 328 tests réussis, compilation actuelle et six parcours ciblés réussis, y compris axe sur la copie corrigée. Une relance locale utilisait encore le précédent dist avec des icônes dans les libellés ; recompilation puis six parcours réussis, sans changement ni assouplissement des assertions.
- Main #39657504995 entièrement réussi : 328 tests UTC, 328 Europe/Paris, compilation, 159 parcours navigateur. Publication compilée 093d9cb ; GitHub Pages en cours de construction au moment du premier contrôle public (ancienne version servie). Aucun contrôle supprimé et aucune base de données modifiée.
- Publication confirmée : GitHub Pages built sur 093d9cb, chaîne Pages #39658246214 réussie. Vérification publique HTTP : index-Bjmqk8vK.js charge BacBlanc-CKvt8WQ6.js, contenant le dépôt, l’accord Gemini et le bouton de correction. Première correction de copie manuscrite réelle à confirmer par l’élève ; aucun fichier personnel manipulé durant les tests.

### 21 octobre 2026 — Codex — choix des chapitres d’examen
- Demande : choisir les chapitres avec le prompt ou laisser faire l’IA. Périmètre créateur, sélection filtrable (niveau, matière, recherche), traductions et parcours. Mode automatique préservé ; mode manuel sans appel IA d’analyse, limites identiques (1 à 24 chapitres), confirmation du périmètre avant création. Aucun changement serveur ni base.
- Livré via PR #69 : code 75b33bf, test de filtre 5c5fffd, fusion 49ef166. 328 tests unitaires et compilation réussis ; six parcours existants puis les deux nouveaux parcours réussis après ciblage des listes par leur rôle combobox. La première tentative utilisait un sélecteur de label exact qui incluait les options ; aucun comportement d’interface ni contrôle du choix des chapitres n’a été assoupli.
- Parcours manuel : sélection Première + Terminale, aucun appel d’analyse, deux cours sélectionnés seulement envoyés ; recherche sans résultat, 24 maximum, effacement et retour automatique vérifiés. Contrôle axe du sélecteur sans violation, capture mobile inspectée. Chaînes de branche #39661715367 et #39661706252 réussies. Publication main #39674671350 en cours.
- Chaîne main #39674671350 entièrement réussie : 328 tests UTC, 328 Europe/Paris, compilation et 161 parcours navigateur réussis. Publication compilée fbaa39d, construction Pages lancée. README mis à jour pour le choix manuel et le dépôt/correction de copie déjà livré. Aucun changement serveur ou de base pour ce choix manuel.
- Publication publique confirmée : Pages built sur fbaa39d, chaîne Pages #39675453144 réussie ; fichier Bac blanc public contient les deux modes et la recherche des chapitres. Choix manuel terminé et en ligne ; aucune configuration Supabase à modifier.


### RAPPORTS-20261021-CODEX-01 — Codex — corrections des rapports Gmail
- Demande du propriétaire : analyser les rapports de Claude et corriger les problèmes signalés.
- Périmètre : contenu philosophie (art/justice), économie (thèmes 6/7), générateur de questions et variantes, tests de non-régression et empreintes ; scripts de rapport et tests si un diagnostic inconnu est présenté comme une panne.
- Branche : `fix/rapports-claude-pedagogie`. Lecture des PR ouvertes #41/#46 : référencement, sans chevauchement fonctionnel.
- Extension annoncée au propriétaire : scripts `app/scripts/**` du couloir Claude pour les états de contrôle. Aucune modification Supabase ou NAH.
- État : en cours ; comparer les alertes anciennes à main, sourcer les corrections pédagogiques, exécuter tests/compilation/parcours avant livraison. Les autorisations de la routine Claude ne peuvent être modifiées depuis ce dépôt.

- Bilan RAPPORTS-20261021-CODEX-01 : PR #71, corrections sourcées dans `docs/RELECTURE-RAPPORTS-CLAUDE.md`. Philosophie art/justice et économie 6/7 corrigées ; variantes, exclusion des synonymes dans les distracteurs/faux, contexte complet des trous et déduplication des variantes. Rapports : inconnu ≠ échec, dates valides, pas de verdict vert incomplet, diagnostic API et délai borné.
- Vérifications finales : 335 tests UTC et 335 Paris, compilation réussie, 161 parcours navigateur réussis, aucun contrôle retiré. Premier passage invalide pendant installation du navigateur/recompilation ; reprise complète stable réussie. Branche distante comparée aux fichiers testés sans écart applicatif.
- État : corrections terminées, validation GitHub puis fusion/publication suivies dans la PR. Aucune base ou fonction Supabase modifiée. Limite restante : rattachement/permissions de la routine claude.ai à vérifier dans Claude ; `.claude/settings.json` autorise déjà les commandes npm refusées dans l’ancien rapport.

- Validation GitHub : chaîne de branche #39682493784 réussie (code c39a8dd ; les commits suivants ne modifient que les deux documents de bilan/coordination). PR #71 prête à relire. Fusion tentée mais refusée par le contrôle automatique d’autorisation : l’accord explicite de fusion/publication n’a pas été reconnu dans la demande de correction. Aucun contournement ; aucune mise en ligne effectuée. Prochaine action : accord explicite du propriétaire pour fusionner #71 et publier, puis suivi de main/Pages.

- 22 octobre 2026 : le propriétaire autorise explicitement la fusion et la publication. PR #71 fusionnée par squash dans `2814dd48250f9a1f19bfe9ef03e91a2ae6ad2357`. Le blocage d’autorisation ci-dessus est levé. Les tests locaux (335 UTC/Paris et 161 parcours) et la CI de branche #39682493784 sont réussis ; les seuls changements après ce code validé concernent la documentation. Publication automatique sur main en cours ; état final et références de publication suivis dans la PR #71. Aucun changement Supabase/NAH.

### REVISION-20261022-CODEX-01 — Codex — refonte Réviser
- Demande : harmoniser Révision avec Cours et Bac blanc. Branche `feat/revision-et-variete`.
- Périmètre : Revise.jsx, CSS dédié, traductions du studio, parcours navigateur et README. Séance, carnet, flashcards, paquets et objectif hebdomadaire conservés.
- Base synchronisée sur origin/main 778b7dd ; corrections #71/#72 conservées. Le moteur et le contenu ne sont pas modifiés dans cette livraison. Ancien travail de variété des exercices conservé séparément dans le stash revision-travail-preserve.
- État : vérification de la nouvelle présentation, puis publication. Aucune modification Supabase/NAH.
- Validation locale sur la version 7f803c3 : 335 tests unitaires réussis, compilation réussie, cinq parcours ciblés réussis (studio, carnet, flashcards), contrôle axe sans violation aux largeurs 393/1280 en clair et sombre. Captures inspectées ; aucun débordement horizontal. PR #73 ; validation GitHub et publication suivies dans la PR.

### TEMPS-20261022-CODEX-01 — Codex — compteur et barres par thème
- Demande : corriger les durées et leur affichage. Branche fix/temps-par-theme. Périmètre : compteur ciblé dans store.jsx (couloir Claude, extension signalée au propriétaire), StatsCharts, séance guidée, carnet, tests. Aucun changement de synchronisation/base.
- Constat : visites de moins de 5 s abandonnées ; séance/carnet sans attribution au thème ; durées non validées dans les barres.
- Correctif : conservation des fractions de seconde, horloge monotone et intervalle borné après suspension ; attribution séance/carnet au thème ; barres avec durées valides, titres complets et temps < 1 min. Historique conservé, sans inventer un recalcul du passé.
- Validation locale : 335 tests existants réussis et trois nouveaux tests ciblés réussis ; compilation réussie ; parcours court passage/séance réussit. Première tentative navigateur invalidée par installation de l’horloge simulée après démarrage du compteur : installation avancée avant navigation, assertions conservées. Publication automatique soumise à la CI complète. PR #74.

### TEMPS-HISTORIQUE-20261022-CODEX-01 — Codex — anciennes durées corrompues
- Retour propriétaire et capture : anciennes valeurs de plusieurs milliards d’heures ; #74 ne réparait pas l’historique. Branche fix/anciens-compteurs-temps.
- Périmètre : validation/migration des compteurs, fusion de progression (extension du couloir Claude signalée), affichage, tests. Les valeurs impossibles sont archivées séparément, sans inventer leur durée réelle. Borne physique : temps écoulé depuis la création du site, premier commit cb91b38 du 6 juillet 2026. Empêcher leur retour depuis une ancienne sauvegarde. Aucun changement Supabase/NAH.
- Réalisé : nettoyage à la lecture et avant fusion, archive synchronisée `themeTimeInvalid` pour préserver les originaux ; durées impossibles exclues des barres, des nouveaux cumuls, des badges de temps et de l’instantané parent. Message explicatif dans les cinq langues. Les durées normales, XP et autres progrès sont conservés.
- Validation locale : 341 tests unitaires réussis, compilation réussie et deux parcours temps réussis, dont reproduction des valeurs de la capture, conservation de 1 h 48/5 min et rechargement. Tests de fusion dans les deux sens : une ancienne copie corrompue n’écrase pas un compteur réparé. PR #75 ; publication conditionnée aux contrôles automatiques complets.

### LANGUES-20261022-CODEX-01 — Codex — langues étudiées à l’inscription
- Demande : proposer arabe, anglais, italien et espagnol à l’inscription. Branche feat/langues-inscription.
- Périmètre : composant de choix réutilisé à l’inscription/essai et dans les réglages ; progression synchronisée `studyLanguages` ; affichage des cours de langues choisis. Extension signalée : Welcome/Profile et champ ciblé store/progression du couloir Claude. Aucune PR concurrente sur ce périmètre (#41/#46 référencement uniquement).
- Le choix est multiple, distinct de la langue d’interface ; sans choix, ancien affichage conservé. Cours actuellement présents : anglais et espagnol. Arabe/italien sélectionnables, annoncés à venir ; aucun cours inventé. Aucune migration, aucun changement Auth/RLS ni donnée NAH.
- Réalisé : sélecteur à l’étape études de l’inscription, dans l’essai et les réglages ; champ studyLanguages sauvegardé dans le JSON de progression existant et fusionné par date ; bibliothèque Langues et paquet de flashcards limités à la sélection. Arabe/italien annoncés à venir. Aucun changement des langues de l’interface ni des cours.
- Validation locale : 345 tests unitaires, compilation et 14 parcours ciblés réussis. Recompilation finale après finition de l’identifiant du paquet, puis les deux nouveaux parcours réussis ; captures clair/sombre inspectées et axe sans violation sur Mon espace. Premier test a détecté qu’un tableau vide par défaut masquait le choix d’un autre compte : valeur initiale non configurée corrigée en null, test conservé, suite complète réussie. Vérifiés : inscription simulée et envoi du choix, réglages, rechargement, filtrage et absence de fuite entre comptes. PR #76 ; publication soumise à la CI complète.
- Main #39766913351 : 345 tests UTC/Paris et compilation réussis ; 167 parcours réussis, un échec axe pendant l’inversion des couleurs de l’onglet Réglages (transition de thème). Publication bloquée, aucune nouvelle version compilée livrée. Suite fix/contraste-reglages-langues : supprimer uniquement la transition des couleurs de ces deux boutons, conserver l’animation de mouvement et tous les contrôles.
- Suite #77 : boutons Mes progrès/Réglages limités à une transition de mouvement, sans interpolation des couleurs. 345 tests unitaires, compilation et deux parcours Langues réussis, avec les assertions axe immédiates inchangées. Aucune règle d’accessibilité désactivée. Publication complète à suivre sur main.

### RETOURS-20261022-CODEX-01 — Codex — retour pédagogique maths
- Demande : lire les réponses de prospection et corriger les erreurs signalées. Branche fix/retour-prof-maths.
- Périmètre : cours probabilités math-c6, test de non-régression et empreinte ciblée, README. Retirer la mise en gras du libellé générique conditions pour interroger la propriété mathématique plutôt que le mot de liaison. Aucun changement Supabase.
- État : annoncé avant modification ; suggestions d’enrichissement distinctes du défaut. Aucun courriel ni coordonnée personnelle publié dans le dépôt.
- Réalisé : libellé générique retiré de la mise en gras ; le trou porte désormais sur deux issues. Contexte indépendant/identique et probabilité constante conservé. Empreinte relue : seul math-c6 change. Test protège le cas exact ; pas de tolérance générale ajoutée sans connaître la réponse saisie.
- Validation locale : 346 tests unitaires réussis, compilation réussie, huit parcours exercices réussis. Code 4649f28, PR #78. Enrichissement des probabilités/automatismes : suggestions recensées, hors correction de ce défaut précis. CI complète et publication automatiques à suivre ; aucune modification Supabase.

### FORMULES-20261022-CODEX-02 — Codex — catalogue complet de calcul
- Demande : enrichir largement l’atelier avec les formules des cours de Première et Terminale, même peu utilisées. Branche feat/atelier-formules-complet.
- Périmètre : catalogue JSON, générateur numérique, liens de cours explicites, présentation/filtrage du catalogue, tests et README. Inventaire du formulaire et des cours ; distinguer calculs et moyens mnémotechniques non numériques. Aucun changement Supabase ni cours pédagogique.
- État : annoncé avant code.
- Extension annoncée : traductions des nouveaux filtres dans app/src/localisation/public.*.json (clés ciblées uniquement). 169 entrées numériques et inventaire dans docs/ATELIER-FORMULES.md ; les références sans calcul (mnémotechniques/SQL) restent des références.
- Réalisé : 40 → 169 formules, références de cours explicites sans heuristique sur le numéro, filtres programme/matière/domaine, recherche et sélection en lot. Génération sqrt/binomiale et queue de loi, précision de probabilités 4 décimales, reprise jusqu’à 5 exercices par formule. Les 40 identifiants existants sont conservés.
- Vérifications : 348 tests unitaires réussis, compilation finale réussie, 13 tests ciblés de génération/reprise puis sept tests avec contrôle de couverture du formulaire réussis ; trois parcours navigateur réussis (ancienne séance, Première, filtres et reprise 845 exercices). Empreintes pédagogiques inchangées. Aucun contrôle retiré ; assertion Première actualisée car la probabilité conditionnelle est bien présente dans le cours de Première.
- Code 00fccbd, PR #79 ; intégration et publication automatique suivies dans la PR. Aucun changement de base ou fonction Supabase.

### REVISION-20261022-CODEX-03 — Codex — trois parcours par matière
- Demande : suivre le fil par matière/chapitre, erreurs filtrées, QCM des acquis mélangés ; deux sélecteurs et un lancement direct. Branche feat/revision-trois-parcours.
- Périmètre : Revise et composant de parcours, moteur dédié, lecture par matière, GameHost et tests/traductions. Extension annoncée : store/progression (couloir Claude), collection datée reussites dans la progression JSON existante, sans migration ni changement Supabase.
- État : annoncé avant code ; conserver présentation et bibliothèque de paquets.
- Réalisé en cours : sélecteur de chapitre avec sections réelles groupées par thème ; chemins directs sans choix de mode supplémentaire ; collection datée reussites (2 000 dernières), reprise locale distincte par matière ; résultats du QCM mélangé attribués à chaque thème. Extension traductions public.*.json annoncée par la mise à jour utilisateur.
- Validation : 356 tests unitaires réussis, compilation réussie et 15 parcours ciblés réussis ; après finitions de reprise/efficacité/isolation, 32 tests ciblés et quatre parcours des trois méthodes réussis. Axe du sélecteur sans violation ; clair/sombre 393/1280 sans débordement, capture du choix mobile inspectée. Premier passage : 14/15, sélecteur du test ne tenant pas compte de la lettre devant la réponse QCM ; sélecteur corrigé, assertions de résultat/sauvegarde conservées et renforcées.
- Code 4b18cf2, PR #80. Calculs réussis capturés et convertis en QCM avec figures ; acquis toutes matières ou matière seule ; points répartis par thème, sans déclarer des leçons non étudiées comme travaillées. Aucune migration Supabase. Mise en ligne soumise à la chaîne complète de main ; résultat suivi dans la PR.

### LANGUES-20261022-CODEX-04 — Codex — cours arabe et italien
- Demande : terminer les langues encore absentes et créer leurs cours. Branche feat/cours-arabe-italien.
- Périmètre : contenu langues (nouveaux thèmes lng-ar et lng-it), rattachements explicites des exercices, nom de matière, tests, empreintes ciblées, documentation et traductions ciblées. Conservation intégrale des cours anglais/espagnol. Aucun changement Supabase ni sauvegarde.
- Annoncé avant code ; vérification du programme applicable et distinction arabe standard/dialectes. Les nouveaux cours seront accessibles par les choix de langues existants et les parcours de révision.

- Extension signalée au propriétaire : app/scripts/plugin-contenu.mjs, ajout du seul indicateur sectionOnly dans l’index léger. QCM dédiés autorisés uniquement avec cet indicateur ET un rattachement valide, sans modifier le placement des anciens QCM de synthèse.
- Relecture : mise à jour du repère commun p1-lng-axes, qui annonçait encore huit axes de l’ancien programme. Identifiant conservé ; cours et questions alignés sur les six axes par langue applicables en 2026, sans imposer six axes en STMG. Cours de grammaire anglais/espagnol inchangés.
- Réalisé : 16 thèmes supplémentaires, 64 fiches affichées (dont des rappels partagés entre niveaux), 156 questions rédigées, tableaux de notions et exercices générés strictement locaux. Arabe standard explicite, italien, textes originaux identifiés, applications STMG/ETLV et axes propres aux niveaux. Filtrage des cours et des trois parcours par langues, y compris p1-langues.
- Relecture de sources et limites dans docs/COURS-LANGUES.md. Les productions ouvertes ne sont pas annoncées comme corrigées automatiquement ; pas d’enregistrement natif ajouté. Validation initiale : 363 tests unitaires réussis, puis actualisation sourcée de la fiche commune obsolète et complément Maghreb ; vérifications finales en cours. Les tests ciblés ont détecté le QCM non placé, corrigé par sectionOnly et rattachement explicite ; assertions conservées.
- Validation après intégration : 363 tests unitaires et huit parcours navigateur réussis ; compilation réussie, captures mobiles arabe/italien clair/sombre inspectées. Le premier parcours a été interrompu car le test cherchait « Suivant » au lieu du libellé réel « Question suivante » ; sélecteur corrigé, assertions de sauvegarde à 100 % et de réussites conservées, huit parcours ensuite réussis.
- Finition : vocabulaire propre à chacun des 24 axes culturels ; les tableaux ne répètent plus les deux mêmes notions de méthode. Nouvelle vérification finale de cette finition en cours, sans changement des parcours ou des langues déjà livrées. PR #81.
- Finition relue : 363 tests unitaires réussis à nouveau ; empreintes actualisées uniquement pour le lexique des nouveaux axes et les paquets Langues. Aucun autre contenu pédagogique modifié. Publication et suite complète suivies dans la PR #81.

### EXERCICES-20261022-CODEX-05 — Codex — répétitions QCM et trous
- Retour propriétaire : exercices de chapitre identiques. Branche fix/variete-questions-chapitre.
- Périmètre annoncé : génération strictement par section, sélection des questions à chaque partie/rejouer, QCM/Trou/GameHost, tests et empreintes relues, compte des chapitres et README. Pas de modification des cours ni de Supabase.
- Diagnostic initial : le même lot de trous est réutilisé dans trois formats ; seul le premier terme en gras de chaque phrase est considéré ; Rejouer mélange le même lot sans nouveau tirage.
- Réalisé : banques complètes et tirages courts avec historique par compte/exercice dans l’onglet ; variantes de mots masqués, une seule variante de phrase par partie ; phrases distinctes entre trous/saisie/QCM. Répartition des notions entre QCM direct/inverse ; suppression du quiz qui recopiait ces QCM.
- Extension nécessaire : revisionPaths, pour conserver les réussites réellement jouées sans déduire toute une banque d’un score 100 %. Les anciennes réponses restent consultables et les synonymes relus sont préservés. Pas de modification de store, du schéma ou de Supabase.
- Tests pédagogiques : contrôle des phrases à trous étendu à leurs trois formats, avec mêmes exigences de contexte/alias et propriété de Bernoulli. Test navigateur du quiz doublon remplacé par une vérification de son absence et de l’ouverture du QCM du chapitre ; contrôle des neuf cartes réelles au lieu du seuil artificiel de dix.
- Validation finale locale : 374 tests unitaires réussis, compilation réussie et 17 parcours navigateur réussis, dont deux comparaisons des questions réellement affichées avant/après Rejouer (QCM et trous), révisions, anciens exercices de langues et accessibilité clair/sombre. Empreintes relues : seules celles des exercices assemblés changent ; aucun fichier de cours modifié. Le chargement de l’empreinte avait dépassé sa limite lors d’exécutions concurrentes : relancé seul, sans modifier de délai ni supprimer de contrôle, puis suite complète réussie.
- Confirmation du propriétaire : le défaut concerne les deux cas (entre exercices et au lancement suivant). Les deux sont couverts par les tests. Source et publication suivies dans la PR #82.

### NOTES-20261023-CODEX-06 — notes et révisions ciblées
- Demande : questions manquées gratuites ; bilan et exercices Premium ; lecture sujet/copie Ultimate.
- Branche feat/notes-revisions-personnalisees. Périmètre : MesNotes, notesClasse, composant dédié, contrats IA et fonction examen-blanc, tests et README. Extension du couloir Claude annoncée au propriétaire ; aucune migration ni donnée NAH.
- Accès payants contrôlés côté serveur ; aucune offre active détectée à ce stade. Photos transmises uniquement sur action explicite, jamais stockées dans la progression.
- État : en cours, annonce avant code.
- Réalisation : questions manquées (6 000 caractères) et bilan/exercices enregistrés avec la note ; mise à jour sans duplication et fusion par date. Analyse Gemini multimodale réutilisée via action study, validation et droit serveur Premium/Ultimate daté ; aucune activation de compte. Documentation et traductions ciblées ajoutées. Les offres restent à ouvrir commercialement.
- Vérifications en cours : contrats, accès serveur, sauvegarde/fusion et parcours notes. Aucune modification de schéma, de Storage ou de NAH.
- Validation finale : 381 tests unitaires réussis, compilation réussie, deux parcours navigateur réussis (saisie/rechargement des questions manquées ; bilan simulé, corrigé masqué puis révélé, sauvegarde/reprise). Les premiers passages ont détecté deux libellés non traduits ; dictionnaires corrigés, aucun contrôle retiré. Fonction examen-blanc v16 déployée avec JWT, validation des fichiers et droits serveur. Aucun compte réel activé ni fichier personnel envoyé pour les tests.
- Compléments : 16 contrôles contrats/traductions réussis, dix parcours notes/examens réussis après retrait des fichiers. Réponse publique réelle : service prêt (200) et analyse anonyme refusée (401). Finition : nouvelle question = champ de réponse neuf, pour éviter de conserver la réponse d’un exercice précédent.
- La dernière compilation (service worker 4e34a44318) et les deux parcours notes ont réussi après la finition des champs de réponse. Référence de réalisation : PR #83 ; droits payants à connecter au futur lancement des offres, sans activation d’abonnement ni facturation dans ce chantier.
- Prise de photo directe ajoutée pour le sujet et la copie (caméra arrière sur mobile), avec ajout de plusieurs photos dans la limite du dépôt. Nouvelle suite complète : 381 tests réussis ; compilation 4cfe851207 réussie. Derniers parcours notes en cours, puis fusion/publication automatique de #83.
- Dernière reprise caméra : deux parcours réussis (17,3 s), y compris les champs caméra et le rechargement du bilan. Réalisation terminée et vérifiée localement, publication automatique à suivre sur main. Fonction serveur v16 active ; aucune activation d’abonnement utilisateur. Commits applicatifs 3d88f93, 814ee41 et 1eb8778 ; PR #83.

### TUTEUR-20261023-CODEX-07 — compréhension des cours
- Demande : chatbot qui reformule jusqu’à compréhension, même après 50 échanges ; Ultimate selon le choix antérieur du propriétaire.
- Branche feat/tuteur-comprehension-cours. Périmètre : Chapter, composant tuteur, contrat et action tutor dans examen-blanc (extension du couloir Claude annoncée), traductions, tests et README. Aucun changement SQL/NAH/abonnement réel.
- Pas de plafond total de reformulations ; historique visible conservé pendant la visite, contexte réseau borné pour les coûts et protection horaire distincte de la génération d’examens. Cours du chapitre uniquement. État : réservé avant code.
- 383 tests unitaires réussis, dont 55 réponses autorisées côté serveur et 55 tours avec contexte borné. Première vérification navigateur : discussion et refus Ultimate fonctionnels ; axe détecte que l’historique défilant doit recevoir le focus clavier. Correctif tabIndex/focus visible, sans désactiver de règle ; reprise des quatre parcours.
- Réalisation terminée : bouton « Je n’ai pas compris » sous le lecteur de chaque chapitre ; cinq suggestions et saisie libre, historique visible sans plafond de tours, contexte limité aux 19 derniers messages, clé compte/chapitre et annulation des demandes à la sortie. Réponses privées non enregistrées dans la progression, ni utilisées pour attribuer des XP/notes.
- Dernière validation : 383 tests unitaires réussis, compilation 0b7128ed08 réussie, quatre parcours navigateur réussis (chat, contexte tronqué, changement de chapitre, contrôle axe, refus Ultimate et conservation des notes). Les règles axe sont inchangées.
- Fonction examen-blanc v17 déployée, accès Ultimate vérifié côté serveur, protection horaire distincte ; GET réel 200 ready et POST anonyme 401. Aucun abonnement activé, aucune migration, donnée NAH ou fichier personnel utilisé en test. PR #84 ; publication automatique à suivre après fusion. #83 : chaîne complète main réussie, compilation 30d975b, Pages en cours au dernier contrôle.

### MOBILE-20261023-CODEX-08 — ergonomie téléphone
- Demande : croix trop haute dans le lecteur agrandi et refonte de l’espace mobile.
- Périmètre : Course, Layout (fichier commun annoncé), MobileMenu si nécessaire, CSS mobile dédié/import, styles des pages principales, tests mobiles et README. Branche feat/mobile-confort-navigation. Aucun cours, compte ou Supabase modifié.
- Objectifs : fermeture du lecteur accessible en bas avec zones sûres, hauteur dynamique, navigation stable, cibles tactiles, formulaires sans zoom forcé, grilles et espacements adaptés aux petits écrans et au paysage. Design vert/crème/doré conservé.
- État : réservé avant code ; PR #41/#46 ouvertes sur le référencement uniquement, pas de conflit de périmètre identifié.
- Première vérification : fermeture accessible aux trois dimensions et pagination conservée. Axe détecte l’absence de focus sur la zone de lecture défilante des petits écrans : zone rendue accessible. La navigation masquée sur simple focus masquait aussi les pages avec recherche autofocus : remplacé par une détection de la réduction effective du viewport par le clavier, avec retour à l’orientation normale. Aucun contrôle retiré.
- Extension de périmètre : BandeauCookies, ajustement mobile du bandeau informatif afin qu’il ne recouvre pas la barre de navigation ; son bouton garde une cible tactile suffisante et le bandeau s’efface temporairement pendant la saisie au clavier. Aucun texte ou comportement de consentement modifié.
- Validation intermédiaire complète : 383 tests unitaires, compilation, puis 17 parcours navigateur réussis (accessibilité globale clair/sombre, fenêtres/jeux, clavier, dix pages en deux thèmes, trois tailles de lecteur, ordinateur et impression TVA sur deux pages maximum). Captures lecteur/menu et pages accueil/révision/bac blanc inspectées.
- Finitions en vérification finale : conserver la référence de hauteur lors du passage entre champs avec clavier Android ouvert ; ne pas appliquer la taille du logo au compteur de concentration ; respecter les zones sûres physiques en interface RTL. Les contrôles restent tous présents.
- Dernière validation applicative : 383 tests unitaires réussis, compilation a639f66102 réussie, dix parcours ciblés réussis après finitions (clavier Android simulé lors du passage entre champs, navigation non recouverte, menu, ordinateur, impression). Captures du lecteur et du menu vérifiées. Chemins de capture placés dans les artefacts Playwright pour être portables sur GitHub Actions.
- Réalisation terminée : CSS mobile dédié, commandes de fermeture en bas, menus/bandeau accessibles, champs et cibles tactiles adaptés, prise en compte des barres système et du clavier. Branche/PR #85 ; validation GitHub et publication automatique à suivre. Aucun changement de cours, données utilisateur ou Supabase.

### CONTROLE-20261023-CODEX-09 — questions rédigées et accès IA
- Demandes : outils IA accessibles pendant le développement, toutes les options prévues dans la future offre Ultimate ; nouvelle catégorie Questions type de contrôle par chapitre, rédaction et correction sur 5 fondée sur ses notions clés.
- Branche feat/questions-controle-acces-ouvert. Périmètre : Chapter, composants contrôle/tuteur/notes, contrats et handler examen-blanc (couloir Claude annoncé), traductions, tests, README. Aucune migration, activation d’abonnement, donnée utilisateur ou NAH.
- Barème explicite de cinq critères ancrés dans le seul cours ; points recomptés par le serveur, note indicative sans attribution d’XP. Connexion et protections contre les abus conservées. Réservation avant code.
- Réalisé : accès sans abonnement pour study/tutor (Auth non anonyme conservée), mention future Ultimate ; carte de rédaction et raccourci sous le cours, barème 5 × 1, citations validées, somme côté serveur, reprise de réponse et nouvelle question. Réponses temporaires, aucune sauvegarde/XP annoncée. PR #86.
- Première passe de tests : une traduction de la boutique manquait après modification du texte ; ajoutée aux quatre dictionnaires, sans supprimer de contrôle. Validation finale en cours.
- Compilation 77f9aa6b16 réussie ; six parcours navigateur réussis (rédaction/correction/reprise, erreur sans perte de réponse, isolation du chapitre, tuteur et notes). Contrôle axe du nouveau bloc réussi. Fonction examen-blanc v18 active avec JWT ; GET public 200 ready et POST anonyme 401. Aucune copie personnelle ni abonnement réel utilisé en test. Suite unitaire finale en cours après ajout de la traduction de boutique.
- Confirmation séparée de #85 : chaîne main 39877456292 et Pages 39878124974 réussies, compilation adbedb2 ; entrée JavaScript publique identique à Git et styles de fermeture lecteur/menu présents.
- Validation finale : 385 tests unitaires réussis (41 fichiers), compilation 77f9aa6b16 réussie, six parcours navigateur réussis et git diff --check propre. Les tests des anciennes restrictions payantes ont été adaptés à l’ouverture expressément demandée ; les contrôles d’authentification, formats, contexte et erreurs restent présents. Aucun contenu de cours ni empreinte modifié. Réalisation da45dc3, intégration de la compilation précédente par merge 22e9574 ; publication automatique de #86 à suivre.

### CONTROLE-20261023-CODEX-10 — correction qui reste en attente
- Retour : création des questions correcte, correction sans réponse visible.
- Branche fix/correction-controle-attente. Périmètre : ChapterControl, attente réseau bornée incluant Auth et lecture de réponse, tests et handler examen-blanc si diagnostic nécessaire (couloir Claude annoncé). Pas de migration ni donnée personnelle.
- Réservation avant code ; journaux consultés uniquement pour catégories techniques.
- Diagnostic : journal technique réel exam_request_failure / timeout, le 23 octobre à 11 h 02 (Paris). L’ancien timer n’annulait que fetch ; une attente Auth non annulable pouvait garder busy actif. Correction de l’attente globale via Promise.race, bouton Annuler, saisie conservée. Correction Gemini concise, raisonnement LOW documenté, plafond 3 500 jetons et délai fournisseur 60 s ; création et autres actions préservées. Tests en cours.
- Retour du propriétaire après v19 : erreur générique encore présente. Les journaux disponibles ne contiennent pas encore cette nouvelle tentative (pas d’invocation authentifiée v19 visible à ce contrôle). Ajout de diagnostics sans contenu ni identité pour distinguer requête invalide, JSON invalide et contrat invalide. Schéma de sortie Gemini imposé à la seule correction : cinq entrées, index 0–4 et valeurs numériques. Validation finale du barème inchangée ; aucun résultat factice ni assouplissement des points.
- Vérifications applicatives : compilation 2fdd20f7bb et trois parcours navigateur réussis, incluant un fournisseur qui ne répond jamais, annulation, expiration des 75 s, conservation de la saisie et nouvelle tentative réussie. Huit tests ciblés serveur/attente réussis. Fonction v20 active avec schéma de sortie de correction et diagnostics contrôlés ; Auth/JWT préservés. Suite complète finale en cours, sans modification de cours ni empreinte.
- Limite de validation : réponses IA simulées dans les tests ; le retour réel du propriétaire après v19 reste en échec, donc la résolution réelle de sa correction n’est pas encore confirmée. Ne pas annoncer une réussite de cette tentative. Il faudra une nouvelle tentative sur la version publiée et lire son code technique si nécessaire.
- Validation finale du code : 390 tests unitaires réussis (42 fichiers), compilation et trois parcours navigateur réussis ; contrôle git diff --check propre. Nouveau schéma et diagnostics vérifiés dans la suite complète et les huit tests ciblés. Réalisation 875785a / PR #87 ; publication de l’interface à suivre. Retour réel du propriétaire non confirmé comme résolu, à vérifier après mise à jour.

### REVISER-20261023-CODEX-11 — simplifier la page Réviser
- Demande : retirer les trois indicateurs À revoir aujourd’hui / À renforcer / Bien acquis, supprimer le bloc Carnet d’erreurs et garder uniquement les flashcards dans Les bons outils à portée de main.
- Branche fix/reviser-epure. Périmètre : Revise, styles si nécessaire, adaptation des parcours existants et README. Préserver les trois parcours par matière, les flashcards et les données de progression/erreurs ; aucune suppression de données ou modification Supabase.
- Réservation avant code. Correction #87 confirmée ensuite par le propriétaire (« parfait »), après sa nouvelle tentative sur la version publique.
- Réalisé : suppression du trio d’indicateurs, du carnet autonome, de la grille de matières et de l’objectif hebdomadaire de la bibliothèque ; seuls les flashcards et leurs actions restent dans les outils. Les trois méthodes sont conservées ; l’action du parcours erreurs est renommée Retravailler mes erreurs dans les cinq langues, sans carnet ni perte de données.
- Tests adaptés aux nouveaux chemins (pas supprimés) : anciennes questions toujours retravaillables par matière, lien Pourquoi vers le cours et espacement effectif à trois jours vérifiés ; flashcards/import, filtres matière/chapitre, acquis et reprise conservés. Assertions sur l’absence du carnet et des indicateurs, bibliothèque limitée aux flashcards.
- Validation : 390 tests unitaires réussis (42 fichiers), compilation f050aed006 réussie et huit parcours navigateur réussis, dont accessibilité et affichage 393/1280 px clair/sombre. Capture mobile inspectée, git diff --check propre. Aucun cours, empreinte, stockage ou Supabase modifié. PR #88 ; publication automatique à suivre.

### ACCUEIL-20261023-CODEX-12 — donner envie de réviser
- Demande : accueil sans doublon des matières de Cours ; reprise du dernier cours, séance, progrès/objectifs, accès Voir tous les cours et présentation très soignée.
- Branche feat/accueil-envie-reviser. Périmètre : Home et CSS dédié, traductions, parcours existants et README. Style vert/crème/doré et cartes de progression/communauté conservés. Accueil professeur et données inchangés ; aucune modification Supabase.
- Réservation avant code. Priorité mobile, actions immédiatement identifiables, reprise au repère réellement enregistré, accueil débutant explicite.
- Réalisé : grand accueil éditorial personnalisé, illustration de fiches en CSS, carte de reprise/commencement, séance et accès à tous les cours. Suppression de la grille de matières. Habitudes/objectifs, progression et communauté hiérarchisés ; outils conseillés en fin de page. Traductions dans les quatre langues et maintien de l’accueil professeur.
- Première vérification : 390 tests unitaires et compilation réussis ; reprise exacte à la fiche et six parcours de séance réussis. Quatre tests accueil ont rencontré des sélecteurs devenus ambigus (deux liens Programme et deux kicker), corrigés en ciblant la fonction vérifiée sans retirer les assertions. Ajustement pour écrans 320 × 568 : séance accessible dès le premier écran. Vérification finale en cours.
- Demande ajoutée pendant le chantier : Google renvoie vers une 404 NAH après sélection du compte. Code Auth lu : redirect_to correspond à l’origine et au chemin de RévizSTMG. Aucune fonction disponible dans le connecteur pour modifier Auth URL Configuration et aucun identifiant Management configuré localement. Le propriétaire est dirigé vers Supabase Authentication / URL Configuration pour ajouter l’URL exacte https://revizstmg.github.io/ aux Redirect URLs. Aucune modification de configuration ou de données effectuée ; retour du propriétaire attendu. Le jeton visible dans la capture n’a été ni copié ni utilisé.
- Validation finale : 390 tests unitaires réussis (42 fichiers), compilation et 11 parcours navigateur réussis, dont 320 × 568, reprise exacte, accueil professeur et arabe sombre avec bannière claire personnalisée. Contrôles axe conservés et réussis ; captures ordinateur et petit téléphone inspectées. PR #89, publication automatique à suivre. Aucun cours, donnée, empreinte ou réglage Supabase modifié.

### OAUTH-20261023-CODEX-13 — retour Google vers l’accueil
- Demande : supprimer la 404 affichée après connexion Google et ouvrir l’accueil.
- Périmètre : Welcome (fichier partagé annoncé), parcours OAuth et documentation. Branche fix/retour-google-accueil. Aucune modification Supabase, données ou NAH.
- Diagnostic : consumeOAuthRedirect nettoie le fragment par replaceState, sans notifier HashRouter ; le chemin OAuth reste en mémoire et finish ne redirige que depuis /. Navigation explicite vers /accueil après consommation prévue ; vrais liens inexistants conservés en 404.
- Correction : Welcome navigue explicitement vers /accueil après consommation du retour OAuth, avant restauration du profil ou finalisation du nouveau compte. Tests de connexion existante, inscription, conservation de session et rechargement, et vraie 404 ; tous les appels Supabase sont simulés. PR #90. Le propriétaire confirme par ailleurs que l’URL autorisée avec barre finale résout le retour vers NAH.
- Publication précédente #89 : chaîne principale réussie, compilation 07756ec et Pages 39936522255 réussie ; vérification publique séparée avant annonce finale.
- Validation finale : 390 tests unitaires, compilation et trois parcours OAuth/404 réussis. Le nouveau compte garde la complétion du profil (email Google conservé) et, sans filière, l’écran de choix après rechargement ; le compte configuré arrive et reste sur l’accueil. Un premier sélecteur de test cherchait l’email sans son préfixe ✓ ; corrigé sans retirer la vérification. Aucun appel à la base réelle. Accueil #89 vérifié publiquement : entrée assets/index-C3jTr2-8.js identique à Git.

### LANGUES-20261023-CODEX-14 — guides pratiques PDF et ressources
- Demande : remplacer tous les cours de langues par des PDF complets pour apprendre à parler, vidéos et conseils.
- Périmètre : nouvel espace Langues/ressources et guides originaux anglais, espagnol, italien, arabe ; routes App (partagé annoncé), catalogue Cours, subjectsForTrack et tests. Anciennes routes redirigées ; anciens contenus conservés en archive technique pour ne pas détruire les historiques, retirés du catalogue et des parcours proposés. Aucune base ni donnée personnelle modifiée.
- Branche feat/guides-langues ; réservation avant code. Liens vers éditeurs reconnus, guides téléchargeables avec sources et limites (arabe standard/dialectes). Design vert/crème/doré, mobile et choix de langue direct.
- Extension annoncée : recherche globale (data/index.js) pour ne plus proposer les anciens chapitres de langues ; le lien vers la matière reste. Les jeux archivés gardent leur intégrité technique, mais les parcours et routes actuels utilisent les guides.
- Réalisé : atelier en quatre langues (choix direct, langue étudiée présélectionnée), PDF originaux de 18 fiches chacun, vidéos/liens, routine et conseils. Routes anciennes renvoyées à l’atelier ; offre langues sans chapitres dans subjectsForTrack et recherche sans anciennes fiches. Archives et résultats préservés. Guides A4 de 11–12 pages et arabe connecté vérifiés visuellement ; source et générateur local versionnés.
- Première validation : dix parcours réussis, deux contrôles axe ont révélé un contraste insuffisant des boutons non sélectionnés en sombre ; couleur corrigée sans retirer le contrôle. La traduction du nouveau libellé catalogue a été ajoutée aux quatre dictionnaires. Deux ressources externes en 404/maintenance remplacées ; YouTube inaccessible au réseau de test remplacé par le site BBC Learning English accessible.
- Validation finale : 396 tests unitaires réussis (43 fichiers), compilation 6aea7dcba9 et 12 parcours ciblés réussis. Derniers PDF A4 et noms des langues traduits recompilés : deux parcours guides supplémentaires réussis et 15 tests ciblés guides/traductions réussis. Vérifications axe clair/sombre, fichiers PDF réellement servis, téléchargement, anciennes routes, choix d’inscription conservé, absence d’anciens cours dans Réviser, et captures mobile/ordinateur inspectées. Aucun contrôle supprimé ; anciens tests de cours adaptés au remplacement expressément demandé. PR #91, publication automatique à suivre.

### LANGUES-20261023-CODEX-15 — finaliser la publication des guides
- Suite #91 : première installation Ubuntu très lente, relance réussie. Contrôles complets : 187 parcours réussis, trois réussis à la reprise ; trois échecs bloquent la publication, dont deux anciens parcours dynamiques qui attendent les cours supprimés et un contraste du bouton PDF influencé par les styles globaux/transition.
- Périmètre : spécificité/transition du bouton PDF dans Languages.css et adaptation du parcours dynamique themes.spec.js aux ressources pour toutes les anciennes routes de langues. Contrôles axe conservés et attente de fin des animations avant mesure dans le parcours Langues. Branche fix/validation-guides-langues, aucun contenu ni Supabase modifié.
- Validation de la finalisation : compilation et quatre parcours réussis, couvrant les 29 anciens thèmes des deux niveaux, leurs 58 adresses thème/fiche, quatre PDF servis et axe clair/sombre. Quinze tests unitaires guides/traductions réussis. Spécificité du bouton PDF renforcée et transition de couleur supprimée ; aucune règle axe désactivée. Les deux anciens parcours dynamiques conservent toutes leurs adresses vérifiées avec le nouveau comportement. PR #92.

### CI-20261023-CODEX-16 — téléchargement Ubuntu de publication
- Publication des guides : le miroir azure.archive.ubuntu.com télécharge très lentement les dépendances Playwright (confirmé dans les journaux du run 39940928830). Une nouvelle machine permettait l’installation, mais le run 39943002603 rencontre de nouveau la même lenteur.
- Périmètre annoncé : .github/workflows/deploy.yml, remplacement du seul miroir Azure Ubuntu par archive.ubuntu.com avant l’installation existante. Même version Ubuntu/Playwright, mêmes tests, compilation et publication ; aucun contrôle retiré ni donnée/secret modifié. Branche fix/miroir-ubuntu-publication.
- Vérification : YAML analysé, shell bash -n valide, remplacement testé sur une source fictive ; dépôt security.ubuntu.com préservé. Comparaison structurée avec HEAD : seule la commande d’installation du navigateur change, toutes les autres étapes sont identiques. Validation réelle par la chaîne GitHub complète à suivre, sans tests locaux répétés pour ce seul changement de workflow.

### CI-20261023-CODEX-17 — liste réelle des miroirs APT
- Journaux de la tentative 1 du run 39943852884 récupérés par l’archive API : APT utilise file:/etc/apt/apt-mirrors.txt, qui contient encore Azure. La correction #93 ne couvrait que sources.list et *.sources/*.list ; elle était donc insuffisante sur cette image.
- Périmètre annoncé : inclure uniquement /etc/apt/apt-mirrors.txt dans le remplacement déjà prévu ; tests, paquets et versions identiques, security.ubuntu.com préservé. Branche fix/liste-miroirs-apt, workflow et journal uniquement.
- Vérifié sur une arborescence APT temporaire reproduisant mirror+file et apt-mirrors.txt : script réel exécuté, miroir standard substitué, source sécurité conservée. YAML et shell valides ; comparaison structurée confirme que seule cette étape change. Validation GitHub complète à suivre.

### LANGUES-20261023-CODEX-18 — vrais manuels PDF, exercices corrigés et vidéos
- Retour : guides trop peu remplis. Demande de vrais cours détaillés, nombreux mini-exercices avec correction et beaucoup de vidéos.
- Périmètre : sources des quatre guides dans app/resources/langues, générateur PDF, présentation Languages et tests associés. Exploiter les cours existants vérifiés en les organisant en leçons, enrichir les explications et les activités ; corrigés séparés avec justification, liens vidéo réels ou recherches explicitement nommées, jamais de faux identifiant vidéo. Pages plus denses et navigation cliquable.
- Branche feat/manuels-langues-complets, réservation avant code. Aucune modification de base, compte ou ancien historique. Publication #91–94 confirmée : 56c1615, Pages 39987074093, quatre PDF publics vérifiés, 193 parcours réussis.
- Réalisé : manuels de 50 pages anglais / 52 espagnol / 46 italien / 46 arabe, avec respectivement 24/25/26/26 leçons, 110/122/86/86 mini-exercices et 50/32/48/46 liens directs vers des pages avec lecteur vidéo (176 au total). Leçons détaillées issues du contenu RévizSTMG, exemples et vocabulaire, exercices complémentaires originaux, documents joints quand nécessaires, corrigés expliqués distincts, productions modèles non présentées comme uniques.
- Corrections éditoriales propres aux nouveaux manuels : cash flow distingué du solde de trésorerie ; ser/estar nuancé en contexte ; formulations génériques de correction remplacées par des explications. Choix de QCM mélangés avec suivi de la bonne réponse. Sommaire, signets et aller-retour énoncé/corrigé cliquables ; exercice numérotés dans l’ordre de lecture, supports répétés évités et mise en page plus dense. Le catalogue léger évite de charger le texte complet dans la page ; vidéothèque repliée et filtrable par niveau.
- Vérifications : 396 tests unitaires réussis (43 fichiers), compilation, quatre parcours langues/inscription réussis, puis deux parcours finaux des guides et 15 tests ciblés guides/traductions réussis. Les 252/277/204/203 liens internes des PDF sont résolus, tous les exercices apparaissent dans l’ordre et tous les liens vidéo sont présents ; signets et pages de cours/corrigés inspectés, dont l’arabe. Corrigés et contextes contrôlés ; dernière retouche de mise en page arabe vérifiée dans les PDF définitifs. Publication complète à suivre via PR #95 ; aucun historique ni Supabase modifié.

### LANGUES-20261023-CODEX-19 — allemand étudié et interface
- Demande : ajouter l’allemand, y compris aux traductions. Branche feat/allemand-traductions, réservation avant code.
- Périmètre : sélection des langues étudiées, manuel allemand complet et ressources, catalogue Langues, dictionnaires et sélecteur de langue d’affichage ; tests associés. Fichiers partagés i18n/translate et normalisation de langue concernés ; aucune modification Supabase, authentification ou données NAH.
- Réalisé : allemand ajouté aux langues étudiées (inscription/réglages, sauvegarde existante) et aux six langues d’interface. Dictionnaires allemands locaux : interface générale, boutique, révision, examens et correction de copies, avec conservation des variables ; choix mobile et lecture vocale de-DE. Les descriptions, conseils et routines de la page Langues, ainsi que les libellés connus du fil d’Ariane, utilisent le catalogue hors ligne.
- Manuel allemand original : 25 leçons (prononciation, cas, conjugaisons, syntaxe, communication et STMG), 100 exercices corrigés, 28 pages vidéo DW Nicos Weg vérifiées avec sources vidéo présentes. PDF A4 de 44 pages, 230 liens internes résolus et 193 signets ; toutes les vidéos figurent dans le PDF, caractères ä/ö/ü/ß préservés. Les quatre anciens PDF sont conservés.
- Contrôles locaux : première suite complète de 398 tests réussie ; 22 tests ciblés réussis après ajout du contrôle de couverture des messages IA. Compilation et six parcours navigateur réussis : deux niveaux de langues, inscription/sauvegarde de l’allemand, réglages persistants, interface allemande mobile et boutique complète sans traduction externe. Contrastes axe clair/sombre conservés. Premier scénario allemand adapté au menu mobile (le sélecteur desktop est caché sur téléphone), puis réussi. Dernière retouche des libellés/fil d’Ariane : compilation et recontrôle allemand en cours ; publication PR #96 à suivre. Aucun changement Supabase ni ancien contenu/historique.
- Validation finale locale : compilation 0036eba816 réussie ; deux parcours allemands supplémentaires réussis après retouche du fil d’Ariane et des libellés des guides, avec boutique sans accès au service de traduction. Les six parcours ciblés précédents et les 22 tests ciblés restent référencés ci-dessus. Prêt pour fusion/publication #96 et contrôles complets GitHub.

### LANGUES-20261024-CODEX-20 — double relecture des cinq PDF
- Demande explicite : lancer deux agents pour examiner chaque PDF de langues en détail, identifier fautes et améliorations. Agent 1 : anglais/espagnol/italien ; agent 2 : arabe/allemand. Lecture des sources et des PDF, rapports précis hors dépôt ; corrections confirmées intégrées par Codex.
- Périmètre : app/resources/langues, générateur/tests si un défaut de rendu est établi, rapport de relecture dans docs. Branche fix/relecture-cinq-manuels ; aucune modification de base, compte ou historique. Réservation avant correction.
- Double relecture terminée : agent 1, 75 leçons et 318 exercices EN/ES/IT ; agent 2, 51 leçons et 186 exercices AR/DE. Rapports et addenda dans docs/relectures-langues, synthèse docs/RELECTURE-MANUELS-LANGUES-20261024.md. Dix-sept familles de constats EN/ES/IT et six AR/DE intégrées.
- Corrections : 12 consignes conjugaison/traduction incohérentes, règles EN/ES trop absolues, article an STMG, run classé hors famille i-a-u, cash flow, questions de compréhension limitées aux faits du document, comparaison italienne, prérequis EN/IT/AR/DE ajoutés aux leçons associées, duel arabe, faux amis et consignes allemandes. En arabe et italien, les bases précèdent désormais les six axes culturels de Première ; liens et IDs conservés. Bandeau de leçon maintenu avec son titre.
- Vérifications : 219 URL externes HTTP200, dont 204 pages avec marqueur vidéo ; 1 166 liens internes résolus, absence de texte hors A4/page quasi vide/astérisques de Markdown parasites après régénération. PDF définitifs : 51/52/47/47/44 pages (EN/ES/IT/AR/DE). Deux agents ont recontrôlé les correctifs dans les PDF.
- Validation locale : 399 tests unitaires réussis (43 fichiers), compilation et trois parcours réussis ; après dernier ajustement de pagination, sept tests de guides réussis et recompilation en cours. Publication par PR #97, aucune modification d’anciens cours archivés, de comptes ou de Supabase.
- Derniers contrôles : compilation 58e904979d et deux parcours guides supplémentaires réussis après correction de pagination. Vérification effective des 126 bandeaux : chacun se trouve sur la même page que son titre. Aucun contrôle supprimé. Prêt pour fusion #97 et vérification complète de la publication.

### MISSIONS-20261024-CODEX-01 — missions et défis de chapitre
- Demande : mettre en place les mécaniques proposées, en commençant par missions courtes et défis de chapitre ; progression par compétences et accès simple depuis l’accueil. Branche feat/missions-defis-chapitres, réservation avant code. Aucune PR active ne recouvre ces fichiers (PR SEO #41 et diagnostic #46 ouvertes).
- Périmètre : nouveaux moteur/progression de missions, page et carte d’accueil, liens de chapitre/révision, routes App, GameHost et traductions. Extension indispensable annoncée au propriétaire : store.jsx et progression.js pour sauvegarder/fusionner les étapes entre appareils ; aucune modification d’authentification, de schéma ou de donnée Supabase. App.jsx commun réservé dans cette tâche.
- Parcours : reconnaître, appliquer, défi final en deux manches, indices explicites, bilan et reprise des étapes ; réussite autonome puis espacée pour renforcer la maîtrise. Exercices strictement du chapitre choisi, supports existants et apprentissages préservés. Objectifs collectifs existants continuent de recevoir les activités ordinaires ; aucun nouveau gain commercial ni dépendance IA ajouté.

- Intégration complémentaire de cette tâche : onglet Réviser actif et fil d’Ariane, reconnaissance des liens directs dans app/pwa/404.html, mesure.js classe les missions sous le nom existant revision (aucun schéma modifié).
- Réalisé : moteur de missions limité au chapitre, carte accueil et accès Réviser/Exercices, trois compétences à 80 %, défi en deux manches avec seuil par manche, indices et maîtrise autonome puis espacée. Fusion monotone et séparation des comptes ; apparence crème/vert/doré, mobile 320 px, six langues. Documentation : docs/MISSIONS-CHAPITRES.md.
- Validation locale : 407 tests unitaires réussis (TZ=Europe/Paris), compilation réussie. 17 parcours distincts vérifiés entre accueil, séance et missions, dont lancement/fin des deux manches, reprise, sélecteurs, traduction arabe/allemande, absence de débordement et audit axe WCAG AA clair/sombre sur 320 px. Les XP ordinaires ont également été vérifiés dans le navigateur. Aucun contrôle ni empreinte de contenu supprimé ou mis à jour. PR #98 ; publication automatique à vérifier après fusion.

### COURS-20261024-CODEX-02 — interface cours, définitions et exercices
- Demande : harmoniser ces trois espaces avec les interfaces appréciées du site. Branche feat/interface-cours-editoriale, réservation avant code.
- Périmètre : Chapter, lecteur Course, Theme/Subject et catalogue des cours si utile, styles dédiés et traductions nécessaires. En-tête vert profond, lecture crème, définitions mieux structurées et cartes d’exercices ; accès mobile et impression préservés. Aucun contenu pédagogique, moteur de questions, sauvegarde ou Supabase modifié. Pas de chevauchement avec les PR #41 et #46.
- Réalisé : bibliothèque sous forme de volumes, thèmes/chapitres en cartes, en-tête vert et onglets contrastés, lecteur papier et encadrés harmonisés, définitions numérotées en grille, défi final mis en avant et grille des jeux avec les questions rédigées à la suite. Fenêtre d’exercice harmonisée ; titres longs et commandes mobiles ajustés. Textes/traductions existants réutilisés. Les styles décoratifs ne s’appliquent qu’à l’écran ; contenu et pagination fonctionnelle inchangés.
- Validation locale : 407 tests unitaires réussis, compilation réussie, 14 parcours ciblés réussis ; après ajustement final des titres et de la structure sémantique des définitions, recompilation et 8 parcours de confirmation réussis. Axe AA sur les trois onglets en clair/sombre à 320/390/1280 px, bibliothèque/matière/thème accessibles, fermeture du lecteur à 320/390/844 px, navigation clavier et retour fiche 1. TVA imprimée complète sur au plus deux pages A4. Aucun snapshot pédagogique modifié, aucun contrôle retiré. PR #99 ; publication automatique à vérifier après fusion.

### COURS-20261024-CODEX-03 — contraste du retour au chapitre précédent
- Le contrôle complet de la PR #99 relève un contraste de 4,45:1 sur le petit texte « Précédent » du lecteur droit-t5/1, face au nouveau fond papier. Publication bloquée ; version précédente conservée.
- Périmètre : CourseStudio.css, couleur explicite var(--c-ink) du paragraphe secondaire du lecteur. Aucun contrôle retiré. Branche fix/contraste-pagination-cours ; reprise du contrôle axe complet et de la publication.

- Second constat du même run : le nouveau parcours bibliothèque mesurait le bouton Enregistrer pendant le fondu d’arrivée (couleurs intermédiaires). Le test attend désormais la fin des animations finies, comme le contrôle accessibilite.spec.js existant, puis exécute toutes les mêmes règles axe. Aucun contrôle désactivé ni seuil abaissé.
- Validation de la correction : 407 tests unitaires réussis, compilation et trois parcours d’accessibilité complets réussis (21 pages en clair/sombre, fenêtre et exercice), puis les quatre parcours de la refonte réussis. PR #100 ; aucune assertion ni règle d’accessibilité retirée. Relance de la publication automatique de #99 après fusion.

### ACCUEIL-20261024-CODEX-04 — flèche sans action dans la progression
- Retour : la flèche de « Chaque séance compte. » semble utilisable mais n’a aucune action. Périmètre : suppression du seul span décoratif dans Home.jsx ; lien Badges conservé. Branche fix/fleche-decoration-accueil. Aucun changement de donnée ou de contenu pédagogique.

- Réalisé et publié (#101, source 93c8266, compilé e1d07db) : 407 tests unitaires, compilation et cinq parcours accueil locaux réussis ; 205 parcours GitHub réussis, Pages 40094785595 réussi. Module public Home-BLU0nCXz.js vérifié octet pour octet, flèche absente du titre.

### CLASSE-20261024-CODEX-05 — refonte complète de l’espace classe et nom libre
- Demande explicite : permettre au professeur de nommer sa classe (ex. Droit Mme… 1STMG04), moderniser et simplifier l’ensemble de l’espace classe.
- Périmètre indispensable annoncé au propriétaire : Classe.jsx, classroom.js (couloir Claude), composants dédiés, CSS, traductions et tests. Réservation exclusive de ces fichiers ; aucune tâche active concurrente ne les recouvre. Branche feat/espace-classe-complet. Lecture préalable du schéma et des droits existants ; privilégier les champs label et métadonnées déjà prévus, sans toucher aux tables NAH.
- Parcours visé : création avec nom, renommage et intitulé partagé avec les élèves ; vue d’ensemble lisible, travail/quiz, échanges, membres et suivi, réglages professeur séparés. Conserver et rendre accessibles les fonctions de groupe, objectif, direct et résultats existantes ; erreurs visibles, mobile et six langues. La publication de la flèche de l’accueil (#101) se poursuit indépendamment ; ses 407 tests unitaires et cinq parcours accueil locaux sont déjà réussis.
- Réalisé : nom libre à la création et renommage persistant (label, 60 caractères), intitulés partagés avec les élèves, actualisation ; vue d’ensemble et raccourcis selon le rôle, quatre entrées principales et espaces complémentaires regroupés. Suivi professeur, groupes, annonces, réglages et création de quiz harmonisés. Formulaires conservés sur erreur ; retours d’échec explicites. Présentation mobile, six langues locales et contrastes clair/sombre.
- Contrôles : 415 tests unitaires réussis à l’heure de Paris, compilation réussie. Parcours ciblés de création/bascule/rechargement, nom partagé et renommage, erreurs réseau, groupes, annonces, quiz, allemand/arabe hors ligne et axe AA à 320 px. Dernier défaut détecté et corrigé : deux frères React partageaient la même clé, ce qui dupliquait la barre professeur lors de la création ; clés distinctes et parcours de création/renommage revalidés. Aucun contrôle supprimé.
- Aucun schéma, RLS, réglage d’authentification ni donnée NAH modifié. Tests REST simulés, sans écriture sur des comptes réels ; accès MCP Supabase indisponible sans link_id, non contourné. Documentation : docs/ESPACE-CLASSE.md. Livraison par PR #102, publication conditionnée aux contrôles complets GitHub.

### CLASSE-20261024-CODEX-06 — actualiser le parcours de renvoi des résultats
- Le contrôle complet #102 a réussi 213 parcours sur 214 ; seul le test historique points-10-28 cherche encore le bouton QCM renommé Quiz et travail. Périmètre : uniquement le sélecteur de navigation de ce test et ce journal. Aucune assertion de sauvegarde/renvoi ni règle retirée. Publication de la refonte bloquée tant que la suite n’est pas verte. Branche fix/parcours-quiz-classe, réservation avant code.
- Correction : bouton recherché par son nom actuel Quiz et travail. Quatre parcours points-10-28 réussis localement, dont résultat conservé après HTTP503/rechargement puis renvoyé une seule fois avec score et identité vérifiés. Aucun changement applicatif ni assertion retirée. PR #103 ; relance complète et publication de #102 après fusion.

### CLASSE-20261024-CODEX-07 — menu burger mobile de l’espace classe
- Demande : regrouper toutes les rubriques de classe dans un beau menu burger sur téléphone. Branche feat/menu-burger-classe-mobile. Périmètre : Classe.jsx/CSS (couloir Claude, extension indispensable annoncée au propriétaire), nouveau composant de navigation, dictionnaire classes et parcours navigateur concernés. Aucun chevauchement avec les PR ouvertes #41/#46.
- Prévu : panneau mobile vert/crème/doré, toutes les rubriques et accès directs aux groupes/réglages professeur, état actif, fermeture après choix, Échap, focus et défilement accessibles. Onglets ordinateur conservés. Aucun contenu pédagogique, Supabase, authentification ou sauvegarde modifié. Réservation avant code.
- Livraison précédente confirmée : #102/#103, compilé 6050b02, suite complète 40117204581 réussie (214 parcours) et Pages 40117676929 réussi ; module/CSS publics vérifiés. La présente tâche reprend cette version publiée.
- Extension explicite du propriétaire pendant le travail : rendre Ma classe, Amis, Boutique et Classements faciles à trouver sur ordinateur. Ajout réservé : insertion d’un composant dédié dans Layout.jsx (fichier partagé), styles propres et parcours desktop ; liens directs visibles, état actif et traductions existantes. Annoncé au propriétaire avant code ; aucun changement de menus/configuration personnels sauvegardés.
- Réalisé : bouton Menu de la classe sous 768 px, panneau natif isolant le fond et bloquant son défilement, toutes les rubriques avec état actif ; accès directs professeur aux groupes/réglages. En-tête et fermeture restent visibles pendant le défilement. Échap, croix, clic extérieur, fermeture après choix et au passage desktop ; cycle clavier via le crochet commun. Onglets desktop conservés. Quatre accès permanents dans Layout à partir de 1024 px : Ma classe, Amis, Boutique, Classement, avec état actif et traductions existantes. Six langues pour le panneau ; aucune préférence sauvegardée modifiée.
- Validation locale finale : 415 tests unitaires réussis (Europe/Paris), compilation et 26 parcours navigateur réussis. Contrôles : pages principales et fenêtre/exercice axe AA clair/sombre, menus et retour du focus, défilement/fermeture visible à 320 px, changement de largeur, groupes/réglages accessibles, allemand/arabe, liens desktop à 1024/1440 px, renvoi unique des résultats après HTTP503/rechargement. Le premier essai a relevé un arrêt natif sur la racine du dialogue : corrigé en réutilisant le crochet clavier, mêmes assertions conservées. Documentation docs/ESPACE-CLASSE.md, PR #104 ; publication complète à vérifier après fusion. Aucun changement de contenu, base ou historique.

### NAV-20261024-CODEX-08 — menu principal mobile à gauche et choix des onglets
- Retour du propriétaire : menu mobile peu satisfaisant, à placer en haut à gauche et mieux organiser pour choisir les onglets. Clarification obtenue : concerne tout le site. Périmètre réservé : Layout.jsx (partagé), nouveau menu et styles dédiés, choix d’onglets avec les préférences existantes, dictionnaire local et tests navigateur concernés ; extraction possible de l’éditeur existant de Customizer.jsx pour le réutiliser sans dupliquer les règles. Aucun changement de store, sauvegarde, authentification ou Supabase. Branche feat/menu-principal-mobile-gauche ; pas de chevauchement avec #41/#46.
- Menu prévu : navigation essentielle, communauté, outils secondaires regroupés, réglages rapides ; choix des 2 à 5 onglets et ordre depuis le menu. Panneau latéral gauche, fermeture toujours visible, clavier, mobile et six langues. Accès desktop #104 conservés. Réservation avant code.
- #104 est publié : b5df112 / compilé 6bb2935, CI 40119065109 réussi (216 premiers passages réussis, un réussi à la relance, un ignoré par une condition de tirage préexistante), Pages 40119546060 réussi et fichiers publics vérifiés.
- Réalisé : menu principal placé en haut à gauche sur téléphone (portrait/paysage et RTL), panneau latéral gauche vert/crème/doré avec fermeture fixe, navigation essentielle et communauté visibles, outils secondaires repliés, réglages et langues regroupés. Éditeur d’onglets directement dans le menu : ajout par liste, retrait, ordre, limites 2–5 et retour par défaut ; composant NavigationTabs partagé avec Customizer, préférences existantes conservées. Les liens desktop et le menu spécifique à la classe sont conservés.
- Validation : compilation réussie, 415 tests unitaires réussis à l’heure de Paris. 16 parcours clavier/mobile/langue réussis au premier lot ; étiquetage explicite du sélecteur d’ajout corrigé après le test de l’éditeur. Parcours complet de l’éditeur revalidé, puis huit parcours finaux de navigation réussis : 320/390 px, paysage 844×390, axe AA clair/sombre, allemand/arabe, position à gauche, ordre et persistance, limites et réinitialisation, liens desktop 1024/1440 px. Aucune assertion supprimée ; tests historiques adaptés au nouveau défilement et au choix de langue. Documentation docs/NAVIGATION-MOBILE.md ; PR #105, publication complète à vérifier après fusion.

### UI-20261024-CODEX-09 — charte sobre et informations vérifiables
- Demande : aucun faux avis/faux chiffre ; retirer dégradés et boutons pilule, remplacer les émojis par des icônes, supprimer tirets longs et raccourcir les titres, au maximum une animation par session, retirer les tags IA.
- Périmètre réservé : présentation globale, CSS, composants/UI, textes des pages et dictionnaires, traduction publique et transformation JSX à la compilation si nécessaire ; Layout/Customizer et autres pages partagées (extension indispensable explicitement annoncée au propriétaire). Vite/scripts de présentation concernés. Ne modifier ni cours/exercices/scores, ni sauvegarde/authentification/Supabase. Pas de chevauchement avec les PR #41/#46.
- Audit préalable des avis et statistiques : conserver uniquement les données réelles/calculées ou les exemples clairement identifiés. Retirer les badges IA promotionnels sans présenter les productions automatiques comme un travail humain vérifié. Validation clair/sombre, mobile/desktop, textes et icônes accessibles ; publication conditionnée à la suite complète.
