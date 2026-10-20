# Répartition des tâches — Claude et Codex

Répartition demandée par le propriétaire le 18 octobre 2026 et rédigée par Claude
à sa demande. Le propriétaire reste seul à décider : il peut déplacer une tâche,
en ajouter ou changer l'ordre. Ce fichier ne lance aucun travail ; pour commencer
une tâche, chacun l'annonce dans le tableau de `docs/COORDINATION.md`, avec sa
branche et sa PR. Chacun ne modifie que la colonne « État » de ses propres tâches
ici, et ne change jamais celle de l'autre.

## Principe : deux couloirs de fichiers

Pour ne pas se gêner, chaque participant a ses fichiers. Une tâche d'un couloir ne
modifie pas les fichiers de l'autre couloir. Si c'est indispensable, l'auteur le
signale au propriétaire avant de commencer.

### Fichiers de Claude

- Supabase : `supabase/**` (migrations, fonctions Edge, tests SQL, scripts en attente).
- Comptes et espaces partagés : `app/src/auth.js`, `reseau.js`, `classroom.js`,
  `friends.js`, `parent.js`, `leaderboard.js`, `push.js`, `mesure.js`, `ficheVision.js`.
- Sauvegarde, fusion et dates : `app/src/store.jsx` (persistance, `mergeProgress`,
  synchronisation, déconnexion, dates du jour), `app/src/data/srs.js`.
- Pages : `Privacy.jsx`, `Cgu.jsx`, `Profile.jsx` (compte, données, rappels),
  `Classe.jsx`, `Friends.jsx`, `Leaderboard.jsx`, `Parent.jsx`, `PhotoFiche.jsx`,
  `GrandOral.jsx`, `EtudeGestion.jsx`.
- Composants : `DossierProjet.jsx`, `CompteRequis.jsx`, `SignalerErreur.jsx`,
  `ReminderScheduler.jsx`, `LiveMode.jsx`.
- Projets accompagnés : `app/content/commun/grand-oral.json`, `etude-gestion.json`,
  `outils-projet.json`.
- Exploitation : `app/scripts/**`, `statistiques/**`,
  `.github/workflows/statistiques.yml`, `.claude/**`, `app/pwa/sw.js`,
  `app/pwa-postbuild.mjs`, mise à jour des dépendances (`package.json`,
  `package-lock.json`) pendant une fenêtre annoncée.

### Fichiers de Codex

- Contenu : `app/content/**`, sauf les trois fichiers « projets accompagnés » ci-dessus.
- Moteur d'exercices : `app/src/data/index.js` et les autres fichiers de
  `app/src/data/` (sauf `srs.js`), `app/src/games/**`, `qcmgen.js`, `calc.js`.
- Scores et badges : `badges.js`, et dans `store.jsx` les seules fonctions de
  score (`chapterScore`, `subjectScore`, `globalScore`).
- Traductions et dictionnaire : `app/src/i18n.js`, `app/src/i18n/**`,
  `translate.js`, `Dictionary.jsx`.
- Pages de révision et de boutique : `Course.jsx`, `Chapter.jsx`, `Theme.jsx`,
  `Subject.jsx`, `Revise.jsx`, `Programme.jsx`, `Shop.jsx`, `Home.jsx`,
  `BacBlanc.jsx`, `Express.jsx`, `DailyChallenge.jsx`, `Coach*.jsx`.
- Empreintes du contenu : `app/tests/__snapshots__/contenu.test.js.snap`.
- Documents de relecture : `docs/AUDIT-*.md`, `docs/RELECTURE.md`.

### Fichiers communs : prévenir avant de les modifier

`README.md` et `docs/COORDINATION.md` : chacun modifie ses propres sections.
`CLAUDE.md` et `AGENTS.md` : modification avec l'accord du propriétaire.
`Welcome.jsx`, `Layout.jsx`, `App.jsx`, `app/tests/parcours/eleve.js`,
`.github/workflows/deploy.yml`, `app/vite.config.js` : une seule tâche à la fois,
annoncée dans le journal.

Pour ajouter un texte d'interface, Claude écrit la clé en français dans `i18n.js`,
dans un bloc commenté à la fin du dictionnaire. Codex traduit ensuite ce bloc dans
les autres langues, dans une tâche à part.

## Couloir de Claude

| ID | Tâche | Fichiers | Terminé quand | Priorité | État |
|---|---|---|---|---|---|
| C01 | Finaliser la sécurité de la base : règles d'accès des tables sociales, nettoyage, suppression du compte compatible avec NAH (base et comptes partagés) | `supabase/**`, `auth.js`, `Profile.jsx` | Script testé sur une base locale, décision du propriétaire sur les comptes NAH, script appliqué avec son accord, « Supprimer mon compte » fonctionne | 1 | à faire, décision attendue |
| C02 | Après C01 : mettre à jour confidentialité, CGU, `CLAUDE.md`, `supabase/README.md` (espaces protégés, e-mail effacé, essai sans compte et mesure d'audience nuancés) | `Privacy.jsx`, `Cgu.jsx`, docs | Textes conformes à l'état réel de la base | 1 | à faire |
| C03 | Sauvegarder tous les champs de progression (notes, fiches, paquets, Grand Oral…) avec un numéro de version ; erreur de sauvegarde visible ; reprise au retour du réseau (audit F02) | `store.jsx`, `auth.js` | Un test montre qu'une note modifiée est envoyée ; l'élève voit « non sauvegardé » hors ligne | 2 | terminé, à fusionner (PR #14) |
| C04 | Fusion entre appareils : dates de modification, suppressions conservées, pièces dépensées comptées juste (audit F04) | `store.jsx` (`mergeProgress`), tests | Les scénarios à deux appareils de l'audit passent | 2 | terminé, à fusionner (PR #14) |
| C05 | Déconnexion : vérifier la correction de la PR #10, sauvegarde avant fermeture, révocation de la session côté serveur (audit F03) | `auth.js`, `store.jsx` | Test : aucune perte à la déconnexion ; la session est fermée sur Supabase | 2 | terminé, à fusionner (PR #14) |
| C06 | Dates civiles en heure de Paris : répétition espacée, série, « aujourd'hui » ; passages heure d'été/hiver (audit F01) | `srs.js`, `store.jsx` | Tests sous `TZ=Europe/Paris` et deux autres fuseaux | 2 | terminé, à fusionner (PR #14) |
| C07 | Lecture des signalements par le propriétaire : vue protégée ou export, tri par thème, marquer « traité » | `supabase/**`, `app/scripts/**` | Le propriétaire liste et traite les signalements sans écrire de SQL | 3 | à faire |
| C08 | Purge automatique : abonnements push inactifs, signalements traités anciens, comptes inactifs depuis 24 mois (promis par la confidentialité) | `supabase/**` | Tâche planifiée testée en local, appliquée avec accord | 3 | à faire |
| C09 | Rappels téléphone : essai sur un vrai téléphone avec le propriétaire, aide d'installation (iPhone), texte du rappel adapté (série, jours avant le bac) | `push.js`, `sw.js`, `supabase/functions/revizstmg-rappels` | Rappel reçu sur Android et iPhone | 3 | à faire |
| C10 | Routine du matin : la rendre plus légère (limite d'utilisation atteinte le 18/10), mail garanti, dépôt attaché | `.claude/**`, `app/scripts/**`, consignes de la routine | Sept rapports reçus d'affilée | 2 | à faire |
| C11 | Statistiques : heure du workflow hors heure pleine (retards GitHub), signalements et rappels dans le rapport | `statistiques.yml`, `app/scripts/**` | Relevé présent avant 7 h | 4 | à faire |
| C12 | Fiche par photo : afficher la disponibilité réelle, proposer automatiquement la lecture sur l'appareil, et préparer un déploiement sûr de `fiche-vision` (quotas, taille, coût) à soumettre au propriétaire (audit F10) | `PhotoFiche.jsx`, `ficheVision.js`, `supabase/functions/fiche-vision` | Aucune promesse d'IA non disponible | 3 | à faire |
| C13 | Connexion Google et confirmation d'e-mail : vérifier le retour sur RévizSTMG une fois l'adresse ajoutée dans Supabase, messages d'erreur clairs | `auth.js` (et `Welcome.jsx` après annonce) | Connexion Google réussie de bout en bout | 1 | réglage du propriétaire attendu |
| C14 | Mise à jour contrôlée des dépendances (Vitest, React Router…), sans `audit fix --force` | `package.json`, `package-lock.json` | `npm audit --omit=dev` sans alerte ; tous les tests verts | 4 | à faire, fenêtre à annoncer |
| C15 | Politique de sécurité du contenu (CSP) limitant les origines de scripts | `index.html`, `vite.config.js` (après annonce) | Site fonctionnel, CSP active, tests verts | 4 | à faire |
| C16 | Hors ligne : préchargement du service worker fiable (pas d'activation sur un cache incomplet) | `sw.js`, `pwa-postbuild.mjs` | Test d'une première visite interrompue | 4 | à faire |
| C17 | Grand Oral : intégrer la grille d'évaluation 2027 quand le propriétaire la fournit | `grand-oral.json`, `GrandOral.jsx` | Grille officielle dans l'auto-évaluation | 3 | document attendu |
| C18 | Classe et amis : tests de bout en bout contre une base locale (fonctions de la base réellement présentes, pas seulement réseau simulé) | `supabase/tests/**`, tests | Les fonctions utilisées par le site sont vérifiées | 3 | à faire |

## Couloir de Codex

| ID | Tâche | Fichiers | Terminé quand | Priorité | État |
|---|---|---|---|---|---|
| X01 | Terminer la PR #6 : cinq jeux rattachés à leur cours (audit F06) | contenu langues et philosophie, `data/index.js`, tests | PR fusionnée, score maximal atteignable | 1 | proposé |
| X02 | Score de thème : compter les exercices générés avec un dénominateur stable, sans dépendre du tirage (audit F05) | `store.jsx` (fonctions de score), `data/index.js`, tests | Réussir tous les exercices d'un chapitre fait monter le score du thème | 2 | proposé |
| X03 | Badges globaux calculés sur la filière de l'élève (audit F08) | `badges.js`, `store.jsx` (`globalScore`) | Toute la filière réussie donne 100 % | 2 | proposé |
| X04 | Entraînement propre aux 50 chapitres qui n'en ont pas, sans notions d'autres chapitres (audit F07) | `app/content/**`, `data/index.js` | Plus aucun chapitre sans activité, ou rôle « méthode / exemple » affiché | 2 | proposé |
| X05 | Relire les 344 sections sans définition extraite : améliorer l'extraction ou compléter le tableau final | `app/content/**`, `data/index.js` | Liste traitée, choix documenté | 3 | proposé |
| X06 | Corriger les deux erreurs de SDGN Première : coût du travail (brut + cotisations patronales) et « tables de conjugaison comptable » (audit F11) | `app/content/p1-sgn/**` | Cours et tableau final concordants | 1 | proposé |
| X07 | Management de Terminale : vérifier dans le programme officiel si SWOT et choix stratégiques relèvent de la Première, et les masquer du cours si c'est le cas | `data/index.js` (`PREREQ_SECTIONS`), contenu | Décision sourcée sur le programme officiel | 3 | proposé |
| X08 | Relecture par matière avec sources et statut de validation (méthode de `docs/RELECTURE.md`), en commençant par les spécialités | `app/content/**`, `docs/RELECTURE.md` | Une matière relue par passe, corrections sourcées | 3 | proposé |
| X09 | Dictionnaire : langues source italien et arabe, avertissement avant l'envoi d'un texte à MyMemory (audit F09) | `translate.js`, `Dictionary.jsx`, `i18n` | Les cinq langues fonctionnent ; l'élève est prévenu | 2 | proposé |
| X10 | Traduire les blocs de textes ajoutés par Claude (signalement, essai sans compte, rappels, suppression du compte) | `i18n.js`, `i18n/**` | Plus aucun texte français dans les autres langues | 3 | proposé |
| X11 | Identifiants de chapitre stables au lieu de `thème::index`, avec reprise des progressions existantes (migration à faire avec Claude pour la partie sauvegarde) | `data/index.js`, contenu ; `store.jsx` avec Claude | Insérer une section ne déplace plus les scores | 4 | proposé |
| X12 | Accessibilité : focus des fenêtres, navigation au clavier, lecteurs d'écran, contrastes des palettes personnalisées | composants et pages du couloir de Codex | Contrôle clavier et lecteur d'écran documenté | 3 | proposé |
| X13 | Maths : vérifier les QCM chiffrés et calculs (distracteurs plausibles, arrondis, unités) dans toutes les matières chiffrées | `qcmgen.js`, `calc.js`, contenu | Aucune réponse juste parmi les distracteurs sur 1 000 tirages | 3 | proposé |
| X14 | Gestion-finance, mercatique, RH, SIG : cas pratiques chiffrés supplémentaires rattachés à leur chapitre | `app/content/**` | Chaque thème de spécialité a au moins un cas pratique | 4 | proposé |
| X15 | Boutique : suivi après la refonte (équilibrage des prix, clarté des paliers Premium/Ultimate) | `Shop.jsx`, `data/shop.js` | Retours du propriétaire intégrés | 4 | proposé |
| X16 | Coach, express, défi et bac blanc : questions toujours rattachées à leur thème et sans doublon avec le carnet d'erreurs | `data/study.js`, `coachAI.js`, `dailyChallenge.js` | Tests de rattachement | 4 | proposé |

## Dépendances entre les couloirs

- X02 et X03 modifient les fonctions de score de `store.jsx`, C03 à C06 la
  sauvegarde du même fichier : l'un des deux rebase sa branche sur `main` avant de
  fusionner, et ne touche pas aux fonctions de l'autre.
- X10 suit les tâches de Claude qui ajoutent du texte.
- X11 a besoin de C04 (fusion par version) pour reprendre les anciennes progressions.
- Toute tâche qui touche à Supabase suit les consignes de `CLAUDE.md` : aucune
  modification de la base sans l'accord explicite du propriétaire.
