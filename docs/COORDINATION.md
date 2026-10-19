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

| DOC-20261018-CLAUDE-01 | Claude | Répartition des tâches demandée par le propriétaire : `docs/TACHES.md` (nouveau) et lien depuis ce journal | Terminé, à fusionner par le propriétaire | `claude/repartition-taches`, [PR #13](https://github.com/revizstmg/revizstmg.github.io/pull/13) | Le propriétaire relit, ajuste et fusionne ; Claude attend sa décision sur C01 (comptes partagés avec NAH) |

| PROG-20261019-CLAUDE-01 | Claude | Ne plus perdre la progression (tâches C03 à C06) : sauvegarde complète et versionnée, fusion entre appareils, déconnexion sans perte, dates du calendrier de l'élève. Fichiers : `app/src/progression.js` (nouveau), `store.jsx` (persistance, fusion, synchronisation, déconnexion, dates ; pas les fonctions de score), `data/srs.js`, `auth.js`, `push.js`, `EtatSauvegarde.jsx` (nouveau), `Layout.jsx` et `Customizer.jsx` (boutons de déconnexion), une ligne de date dans `Home.jsx` et `DailyChallenge.jsx`, tests, README, confidentialité | À relire | `claude/progression-fiable`, [PR #14](https://github.com/revizstmg/revizstmg.github.io/pull/14) | Le propriétaire relit et fusionne (après la PR #13) |

| PEDAGO-20261019-CODEX-01 | Codex | X06 : deux corrections SDGN Première ; X01 : finaliser les cinq jeux de la PR #6 ; contenu, moteur et tests uniquement | Terminé | [PR #15](https://github.com/revizstmg/revizstmg.github.io/pull/15) | Valider les corrections et les parcours |

| PROGRAMME-20261019-CODEX-01 | Codex | Limiter le programme bac de Première au français et aux maths : study.js, Programme.jsx et tests | Terminé | [PR #16](https://github.com/revizstmg/revizstmg.github.io/pull/16) | Publication suivie dans les Actions |

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
- PR #13, non fusionnée : la fusion revient au propriétaire après relecture.
- Prochaine action : C01 après la décision du propriétaire sur les comptes NAH.

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
- Prochaine action : relecture et fusion par le propriétaire, puis contrôle d'une
  vraie sauvegarde après publication.

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
