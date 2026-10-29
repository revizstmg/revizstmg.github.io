# Audit des fonctionnalités d’apprentissage de RévizSTMG

Date : 29 octobre 2026. Audit seul, aucune correction ni publication.

## Base, méthode et limites

- Source examinée : `origin/main` au commit `8764de549f21a8c2c867e257f767d46bf96ca8e6` (statistiques/documentation après la compilation publiée `a92f308c`). Instructions `AGENTS.md`, `CLAUDE.md` et journal de coordination lus.
- Worktree isolée : `/workspace/work/audit-apprentissage`. Artefact compilé du dépôt servi sur `http://127.0.0.1:4175/`, Chromium, profils synthétiques, services externes bloqués par le helper officiel `preparer`.
- Référence existante, non réexécutée intégralement pour cet audit : CI `40858828317`, 643 tests unitaires dans chacun des deux fuseaux et 328 parcours réussis ; Pages `40861043569`. Ces résultats ne prouvent pas les cas limites supplémentaires ci-dessous.
- Un lancement large de parcours existants a été interrompu, afin d’éviter de refaire la CI récente. Il n’est **pas** présenté comme une validation complète ni compté dans les conclusions.
- Aucun compte réel, aucune suppression/écriture réelle, aucune correction par IA facturée, aucun micro réel utilisé. La synthèse vocale et l’obtention du micro sont simulées de façon contrôlée pour vérifier les courses asynchrones.
- Les cinq constats ci-dessous ont chacun un résultat observable et un script de reproduction séparé. Les éventuels effets sur Chrome/Safari réels des autorisations micro demandent encore un essai sur appareil : ce qui est confirmé ici est la gestion défectueuse des promesses/flux dans le code applicatif, avec des interfaces de navigateur simulées.

## Résumé priorisé

| ID | Priorité proposée | Constat confirmé |
| --- | --- | --- |
| APP-01 | P1 | L’enregistreur du Grand Oral peut démarrer après fermeture, ou laisser un premier flux actif après un double clic et un arrêt. |
| APP-02 | P1 | Une séance de formules hors filtre par défaut, reprise après rechargement, plante lors de son redémarrage. |
| APP-03 | P2 | La révision audio continue l’enchaînement après fermeture, et peut lire une carte deux fois après Pause/Suivant. |
| APP-04 | P2 | La fenêtre de révision audio ne gère ni Échap, ni capture du focus, ni rôle de dialogue. |
| APP-05 | P2 | La séance du jour peut proposer une erreur d’une autre filière/niveau conservée dans l’historique. |

P1 = corriger avant de promouvoir largement la fonction concernée. P2 = dysfonctionnement réel à corriger ensuite. Les deux constats audio APP-03 et APP-04 concernent le même composant mais des mécanismes distincts : minuteur d’enchaînement et accessibilité de la fenêtre.

## APP-01 : cycle de vie de l’enregistrement micro

**Source :** `app/src/components/AudioRecorder.jsx:20-49`, puis arrêt aux lignes 55-58.

**Cas A, reproduction avec autorisation différée :**

1. Grand Oral, ouvrir « M’entraîner à l’oral » puis « Enregistrer ».
2. Laisser la promesse `getUserMedia` en attente (simulation d’une permission pas encore accordée).
3. Revenir à l’accueil, donc démonter l’enregistreur.
4. Résoudre la permission en fournissant un flux simulé.

**Attendu :** le flux tardif est immédiatement arrêté ; aucun enregistrement ne démarre après avoir quitté l’outil.

**Observé :** l’accueil est affiché, puis `MediaRecorder.start()` est appelé. Trace : `ROUTE .../#/accueil`, `MIC ['rec-start']`, aucune trace `rec-stop` ni `track-stop`. Aucune exception JavaScript.

**Cas B, reproduction avec deux clics avant résolution :**

1. Cliquer deux fois sur « Enregistrer » pendant l’attente de permission.
2. Résoudre les deux demandes.
3. Cliquer sur « Arrêter ».

**Observé :** deux demandes et deux enregistreurs sont créés. Trace : `PENDING 2`, `['rec-start-1','rec-start-2','rec-stop-2','track-stop-2']`. Le premier enregistreur/flux n’est pas arrêté par l’action de l’interface. Il n’est plus référencé par `recRef`/`streamRef`.

**Cause :** aucun verrou d’attente ni contrôle de montage/génération après l’`await` ; les références sont écrasées par les demandes concurrentes. Le nettoyage ne peut arrêter un flux qui n’est pas encore arrivé.

**Piste de correction :** verrouiller pendant l’autorisation, vérifier la validité de la demande après résolution, arrêter tout flux arrivé trop tard, et rattacher chaque arrêt au flux local du bon enregistreur. Vérifier aussi le nettoyage des intervalles.

**Preuves :**

- `preuves/audit-recorder-pending.mjs` et `.log`
- `preuves/audit-recorder-double.mjs` et `.log`

**Limite :** aucune capture réelle n’a eu lieu ; tests avec flux et MediaRecorder simulés. Le démarrage hors écran et la fuite de références sont confirmés, pas une transmission à un serveur (aucune transmission trouvée dans ce composant).

## APP-02 : crash du redémarrage de l’atelier après reprise

**Source :** `app/src/pages/FormulaWorkshop.jsx:17-30`, bilan/redémarrage ligne 72, accès à `question.formula` ligne 74 ; persistance dans `app/src/data/workshopSession.js`.

**Reproduction indépendante sur l’artefact compilé :**

1. Compte synthétique en Première STMG.
2. Atelier de formules, « Programme affiché » → « Toute la Première et Terminale STMG ».
3. Choisir « Montant de la TVA » (formule de Terminale), un exercice par formule, puis générer.
4. Recharger la page et cliquer sur « Reprendre ma séance ».
5. Donner une réponse, afficher « Voir mon bilan ».
6. Cliquer sur « Recommencer avec de nouvelles valeurs ».

**Attendu :** bilan par formule et nouvelle séance avec la formule précédemment choisie.

**Observé :** bilan sans la ligne de la formule, puis écran « Cette page a rencontré un problème ». Exception exacte : `TypeError: Cannot read properties of undefined (reading 'formula')` dans le module `FormulaWorkshop`.

**Cause :** la séance est persistée, mais `programme`/`level` ne le sont pas. Au rechargement, le filtre repasse à la filière courante. `sessionFormulas` est calculé à partir de ce filtre, qui exclut la formule de la séance ; le bouton lance une séance vide puis le rendu lit `question.formula` alors que `question` est absent. « Refaire mes erreurs » utilise également les formules filtrées et présente le même risque, non testé séparément.

**Piste de correction :** construire les formules du bilan/redémarrage depuis la séance conservée, indépendamment des filtres de découverte, et refuser proprement un démarrage vide. Conserver ou restaurer le programme affiché éviterait aussi la perte de sélection visible.

**Preuves :** `preuves/audit-formula-resume.mjs`, `.log`, `preuves/audit-formula-crash.png`.

**Portée :** un cas précis Première → catalogue entier → TVA a été testé. Il suffit à démontrer le mécanisme ; les autres formules/filtres n’ont pas tous été exécutés.

## APP-03 : enchaînement audio non annulé

**Source :** `app/src/components/AudioReview.jsx:36-56`, notamment le `setTimeout` ligne 45 et la fermeture ligne 62/66.

**Reproduction :**

1. Réviser, paquet synthétique de deux cartes, « Révision audio » puis « Jouer ».
2. La voix simulée termine la question et la réponse de la première carte.
3. Fermer la fenêtre pendant le délai de 450 ms précédant la carte suivante.
4. Attendre la fin du délai.

**Attendu :** après la fermeture, aucune nouvelle demande de synthèse vocale.

**Observé :** la fenêtre est fermée (`CLOSED 0` bouton Jouer), mais la trace contient `['QUESTION1','REPONSE1','QUESTION2']` : la deuxième carte est encore envoyée au synthétiseur.

**Variante contrôlée :** Pause → Suivant → Jouer pendant ce même délai produit `['QUESTION1','REPONSE1','QUESTION2','QUESTION2']` ; le vieux délai se superpose à la nouvelle lecture.

**Cause :** le délai n’est ni conservé ni annulé, et ne contrôle pas le numéro de génération. L’invalidation de `speak` et `synth.cancel()` n’invalident pas ce `setTimeout` ; la fermeture ne remet pas `playingRef.current` à `false`.

**Piste de correction :** minuteur référencé et annulé sur pause, saut et démontage ; garde de génération sur le callback et remise à zéro de l’état de lecture.

**Preuves :** `preuves/audit-audio-close.mjs` et `.log`, `preuves/audit-learning-edges.mjs` et `.log`. Voix simulée, aucun son privé réel.

## APP-04 : fenêtre audio non modale au clavier

**Source :** `app/src/components/AudioReview.jsx:61-66` ; rendu depuis `app/src/pages/Revise.jsx:163`.

**Reproduction :** Réviser → ouvrir l’audio d’un paquet → Échap → Tab.

**Attendu :** Échap ferme la fenêtre ; à l’ouverture le focus entre dans le dialogue et la tabulation reste dans ses contrôles ; fermeture avec retour au déclencheur.

**Observé :**

- Après Échap, le bouton « Jouer » existe toujours (`ESC 1`).
- Le focus initial reste sur « Révision audio », déclencheur situé dans la page derrière la fenêtre.
- Après Tab, il passe à « Partager », également derrière la fenêtre.
- Aucun élément `role=dialog` (`DIALOGS 0`).

**Impact :** navigation clavier et lecteur d’écran incohérente ; l’utilisateur peut activer des actions masquées par le voile.

**Piste de correction :** appliquer le mécanisme de fenêtre clavier déjà utilisé ailleurs (`useFenetreClavier`), avec rôle/nom de dialogue, capture et restauration du focus. Vérifier l’overlay au niveau du viewport, le composant restant dans une page animée.

**Preuves :** `preuves/audit-audio-focus.mjs` et `.log`. `preuves/audit-audio.png` montre le voile audio. Le défaut de couverture complète du viewport est visible mais n’est pas compté comme un sixième bug distinct.

## APP-05 : erreurs d’une autre filière dans la séance du jour

**Source :** `app/src/data/seance.js:15-28`, appelé dans `composerSeance` sans filtre `track`. La révision et l’étape « avancer » utilisent, elles, la filière.

**Reproduction :** profil synthétique de Première avec une erreur conservée d’un ancien parcours de Terminale Gestion et finance (`themeId=gf-t1`, QCM sur le compte de TVA collectée). Ouvrir `/seance`.

**Attendu :** la séance proposée pour la filière choisie exclut les erreurs de thèmes extérieurs, tout en conservant cet historique pour un éventuel retour à l’ancienne filière.

**Observé :** « Étape 1/2 · Tes erreurs à revoir », question « Quel compte enregistre la TVA collectée ? », avant l’étape d’avancement du programme de Première. Aucune exception.

**Cause :** `etapeErreurs` accepte tout `themeId` existant dans `ALL_CHAPTERS`, qui contient l’index de toutes les filières ; il ne reçoit pas le `track` courant.

**Piste de correction :** filtrer le carnet par les thèmes admissibles à la filière avant le regroupement. Tester aussi un changement de spécialité en Terminale.

**Preuves :** `preuves/audit-seance-track.mjs`, `.log`, `preuves/audit-seance-hors-filiere.png`.

**Limite :** le changement de filière n’a pas été effectué au moyen du formulaire durant ce test ; l’état synthétique représente son résultat avec historique conservé. La proposition hors filière est confirmée. Si le produit souhaite délibérément conserver toutes les anciennes erreurs dans la séance du jour, il faut rendre ce choix explicite dans l’interface plutôt que l’assimiler au programme choisi.

## Contrôles positifs supplémentaires

- Les six liens d’annales Droit-économie et Management (Métropole, Antilles-Guyane, centres étrangers) répondent en HTTP 206 avec `application/pdf` et signature `%PDF-` au contrôle par requête partielle. Cela confirme l’accessibilité des six fichiers au moment du contrôle, pas leur justesse pédagogique page par page. Preuve : `preuves/audit-annales-http.json`.
- Les cinq guides de langues passent `pdfinfo`, format A4 : arabe 47 pages, allemand 44, anglais 51, espagnol 52, italien 47. Preuve : `preuves/audit-langues-pdf-structure.json`. Aucune relecture linguistique exhaustive ni écoute de toutes les vidéos.
- Les scénarios personnalisés ci-dessus n’ont provoqué aucune requête IA facturée ni accès aux données réelles. Le seul écran d’erreur JavaScript observé dans ces cas est le crash d’atelier APP-02.

## Couverture honnête par famille

| Famille | Vérification supplémentaire de cet audit | Ce qui reste non vérifié ici |
| --- | --- | --- |
| Cours, lecteur, définitions, impression | Lecture des composants de chapitre, reprise et position ; référence à la CI récente | Pas de relecture des 759 chapitres ni de nouvelle impression physique exhaustive |
| Exercices, variété, flashcards | Lecture du déroulé des cartes et de la révision ; cas audio ciblés | Pas de nouveau parcours de chaque format sur chaque chapitre ; rattachement/variété couverts par les contrôles existants, sans preuve pédagogique universelle |
| Révision, séance, missions | Cas de carnet hors filière reproduit ; code des trois modes et de la séance examiné | Pas de campagne nouvelle de toutes les missions/variantes de réponses |
| Atelier de formules | Session hors filtre/rechargement/bilan/redémarrage reproduite | Pas de nouvelle vérification arithmétique exhaustive des 242 formules |
| Parcours et vacances | Lecture des points d’entrée et appui sur les tests récents | Pas de simulation manuelle nouvelle d’un programme de deux semaines |
| Langues, PDF, vidéos | Structure des cinq PDF et lecture de la sélection/mini-exercices | Pas de vérification de tous les lecteurs vidéo externes, ni de relecture native de tous les corrigés |
| Bac blanc / mathématiques / annales | Six URL officielles testées ; lecture du créateur et du dépôt de copie | Pas de composition réelle de 2-4 h ; pas d’examen généré avec un fournisseur réel |
| Prix de l’excellence économique | Lecture du brouillon/correction et référence à la CI | Pas d’envoi réel de copie ni d’évaluation de la qualité du correcteur |
| Grand Oral / étude de gestion | Cycle de vie micro reproduit, code et tests existants relus | Micro simulé ; pas d’essai matériel Chrome/Safari, ni de jugement pédagogique des productions |
| Notes de classe / bilans / tutorat / questions de contrôle | Lecture de la gestion de requêtes et de copies ; référence à la CI | Pas de fichiers d’élèves, d’inférence réelle, de quota fournisseur ni de garantie de disponibilité serveur |

## Recommandation de livraison

Corriger d’abord le cycle de vie micro et le redémarrage de l’atelier, puis les deux défauts audio et le filtrage de séance. Ajouter les reproductions comme contrôles ciblés avant de relancer la validation générale. Ces corrections ne doivent pas nécessiter de modification Supabase ni de données réelles. Une campagne d’acceptation séparée, autorisée et bornée en coût, sera nécessaire pour les fournisseurs d’IA et les permissions réelles sur mobile.
