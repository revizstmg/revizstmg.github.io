# Audit 04 — Première et langues

Audit indépendant en lecture seule du 2 novembre 2026, clôturé le 3 novembre après une interruption par limite d’utilisation. Base gelée `f0f70220fd34f6fbba1d6416f3c99e6a0cd3e1e7`, source `05bd1531da93f095780ec1492b756459153a722a`. Worktree `wt-04`, serveur statique `http://127.0.0.1:4214`, compilation racine servie sans rebuild. SHA-256 local index : `c0cb4337d48b30af6dd6e3fe3556fea854d8b8a7f5e2ae60e7f2089c4d8ea309`, identique à VERSION.json.

La référence de livraison fournie est CI41503625386 (691 unitaires dans chacun des fuseaux UTC/Paris,359 parcours) et Pages41506196286 ; elle n’a pas été relancée. Aucun autre rapport contemporain consulté, aucun sous-agent, changement de contenu, commit, accès à une donnée réelle ou publication.

## Méthode et preuves

Instructions AGENTS.md, CLAUDE.md et docs/COORDINATION.md lues dans la version gelée ; consigne spécifique de lecture seule prioritaire sur l’écriture du journal. Skill cloud-environment-runtime consulté pour le contexte d’exécution, aucune utilisation de secret ni réseau privé. Comptes de `app/tests/parcours/eleve.js` synthétiques ; réseau externe bloqué par ce helper, abonnement synthétique. Un worker navigateur, Chromium Pixel7. Les PDF et assets viennent du serveur local ; les services externes ne sont pas appelés.

Commandes exactes et configurations conservées dans `preuves-04/commandes.txt`, `audit04.config.js`, `audit04-sondes.config.js`, script inédit `audit04-sondes.spec.js`. Journaux, JSON Playwright, traces d’échec initial et captures de viewport sont dans le même dossier. Aucune capture pleine page des langues.

## Résultats

- 21 tests unitaires ciblés réussis, trois fichiers : `exercices-chapitre`, `programme`, `exercices-manuel`. Journal `unitaires.log`, durée73,64s. Ils vérifient notamment absence de notions étrangères au chapitre personnalité, mutation des chapitres voisins sans changement des exercices/cartes, refus des banques de secours, rattachements explicites, programme Première limité au français/maths et vérification des corrigés des cinq langues.
- Les cinq PDF locaux s’ouvrent et sont extractibles avec `pdfinfo`/`pdftotext` : EN51pages/1222950octets, DE44/842081, ES52/1228760, IT47/864301, AR47/1125645. Titres, sommaires initiaux et présence d’exercices/corrigés échantillonnés, résultats dans `pdf-samples.json`. Cela ne certifie ni chaque page ni chaque correction ou lien interne.

Sélection navigateur existante : **8 réussis,1 échec initial d’attente**, durée211,8s (`selection.log`, `selection.json`). Réussis : panne503/réessai et brouillons langues, rejet matière/thème incohérents, correction mini-exercices anglais et filtre, trois variantes de pagination SDGN (normal, plein écran/clavier, dernier chapitre), accueil Première et programme bac après progression SDGN. La reprise (`reprises.log`/`.json`) est achevée : **9 réussis,1 défaut**, durée115,1s. Le SDGN précédemment arrêté sur une attente a réussi en10,7s ; il n’est pas retenu comme défaut. Huit nouvelles sondes réussissent : catalogue/thème/cours/définitions/exercice pour SDGN, français et maths ; cinq langues avec PDF HTTP200 et signature `%PDF-`, lien de téléchargement identique, mini-exercice/correction, attributs des ressources et filtre vidéo. Captures de viewport conservées. La neuvième sonde relève le défaut décrit ci-dessous. Au total,18 scénarios navigateur distincts sélectionnés :17 ont une exécution réussie finale et1 révèle un défaut confirmé. Les reprises et exécutions interrompues ne sont pas comptées comme scénarios supplémentaires.


## Défaut confirmé — P3 : un index de chapitre invalide remplace le dernier thème

**Conditions** : compte Première synthétique avec accès aux cours, réseau extérieur bloqué, version compilée gelée, navigation par adresse modifiée. Ce n’est pas un lien invalide observé dans le catalogue normal.

1. Ouvrir `/#/subject/p1-sgn/theme/p1-sgn-t1/chapter/1`, attendre le lecteur. `stmg_progress_v2.lastChapter` vaut `{subjectId:"p1-sgn",chapterId:"p1-sgn-t1"}`.
2. Ouvrir `/#/subject/p1-sgn/theme/p1-sgn-t2/chapter/-1`.
3. La page affiche bien « Page introuvable », mais `lastChapter.chapterId` devient `p1-sgn-t2`.

Attendu : refuser le chapitre inexistant sans modifier la dernière ressource valide. Observé : l’état local mémorise un autre thème qui n’a pas été étudié. Impact limité : pollution du marqueur de dernier thème ; ce marqueur sert de repli pour la reprise d’accueil (`app/src/pages/Home.jsx:31`). Une position récente de lecture valide est prioritaire et peut masquer cette conséquence visuelle ; le mauvais lien de reprise d’accueil n’a donc pas été prétendu reproduit.

Cause vérifiée en lecture : `app/src/pages/Chapter.jsx:53` appelle `setLastChapter` dès que matière et thème existent, avant le refus `!chapter` à la ligne62. `app/src/store.jsx:452` remplace alors le marqueur. Aucun correctif réalisé.

Reproduit le2novembre (8,4s), puis isolément le3novembre (4,5s ; lancement6,95s), même différence de marqueur. Preuves : `reprises.json`, `confirmation.json`, journaux associés, capture `confirmation-results/audit04-sondes-nouvelle-so-0b73d-cohérentes-et-index-négatif/reprise-index-invalide.png`, trace et snapshot dans ce même dossier. La sonde joint aussi les objets avant/après.

Les deux premières routes de la sonde (matière/thème incohérents) sont refusées sans modifier le marqueur. L’assertion sur l’index négatif arrête le scénario : la dernière adresse index999 n’a pas été exécutée et reste non couverte. L’effet du chronomètre sur une route au mauvais index n’a pas été mesuré ; aucun second défaut n’en est déduit.

## Couverture et limites

Inventaire statique des huit matières Première dans `catalogue-premiere.json` : droit4thèmes, économie5, français4, histoire-géographie6, langues11 anciens thèmes, management3, maths7, SDGN4. C’est un inventaire source, pas une attestation fonctionnelle de chaque thème. Les langues actuelles ouvrent l’atelier et ses guides ; les anciens thèmes ne représentent pas des cours relus pendant l’audit.

Le contrôle fonctionnel échantillonne accueil Première, programme bac, SDGN, français, maths, lecteur et retour à la première fiche, définitions/exercices, frontières matière/thème/index et cinq langues. Les tests d’isolation structurale ne valent pas relecture pédagogique de tous les distracteurs. Les PDF sont lus techniquement et échantillonnés. Aucune attestation d’exhaustivité du programme officiel ni certification linguistique ; pas de relecture de toutes les notions. Les liens externes sont contrôlés par attributs et échantillons de catalogues ; leur disponibilité distante, les comptes tiers et leurs vidéos restent hors couverture car le réseau externe est bloqué. IA, Supabase réel, auth réelle, Stripe et quotas réels non certifiés.

## Incidents d’outillage

- Première commande a tenté d’écrire `app/audit04.config.js` alors que le cwd était déjà `app` : « No such file or directory ». Le shell n’étant pas en mode arrêt sur erreur, le lancement Playwright a ensuite démarré après création du bon fichier par la commande suivante. Dès constat, processus6517 et son worker6799 arrêtés ; lancement conservé6772/worker7521 seul ensuite. Aucun résultat du lancement accidentel n’est comptabilisé.
- Lecture groupée initiale des instructions et du long journal a dépassé la limite d’affichage (troncature signalée). Ce n’est pas une erreur du produit.
- Une première attente SDGN a échoué sur le titre avec délai15s ; le snapshot d’échec contient déjà le titre attendu. Trace conservée, reprise réussie en10,7s ; cette attente initiale reste classée comme incident de temporisation, aucune panne produit confirmée sur ce scénario.
- La première version de la sonde inédite supposait à tort un QCM de notions dans chaque section0. L’inspection de génération a confirmé que français section0 n’en propose pas et maths propose surtout des calculs : cela respecte l’exclusivité au chapitre. Lancement arrêté proprement (SIGINT, code130) après réussite SDGN ; sonde français interrompue, sept autres non exécutées dans ce lancement. Script initial et JSON/journal conservés (`audit04-sondes-initiale.spec.js`, `sondes-initiales.*`). Le script corrigé choisit français section2, où le QCM existe, et un exercice disponible dans les maths ; ce n’est pas une correction produit. Sonde d’index invalide renforcée avec changement de thème après inspection du code. La reprise séquentielle a vérifié les neuf sondes et le parcours SDGN existant. Après reprise de session le3novembre, seule la sonde du défaut a été rejouée ; aucun lot achevé relancé.

Clôture : aucun fichier suivi modifié (`git diff --name-only` vide, `git diff --check` réussi). Les fichiers temporaires de sondes/configuration sont non suivis dans la worktree et copiés dans les preuves. Worker de confirmation terminé ; serveur local arrêté.
