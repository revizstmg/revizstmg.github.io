# Correction des activations de rappel

Suite aux [trois scénarios reproduits](../../2026-11-16/rappels-activation/README.md), les PR [231](https://github.com/revizstmg/revizstmg.github.io/pull/231) et [232](https://github.com/revizstmg/revizstmg.github.io/pull/232) sont fusionnées ; source finale `3d414b1d1ce90a24b6785540d1937f58358fb9ff`.

## Changements

- Chaque activation/arrêt porte une intention et un propriétaire. Après les attentes, une demande obsolète ne poursuit plus son inscription ni sa confirmation.
- Les changements de session et de stockage interonglets invalident les anciennes intentions d’une autre identité ; un simple renouvellement de jeton du même compte ne le fait pas.
- L’arrêt invalide immédiatement l’activation précédente. Une souscription native tardive devenue inutile est retirée, sans désinscrire une nouvelle activation en cours.
- Les écritures d’inscription/désinscription sont ordonnées. Si un enregistrement était déjà parti, le nouvel horaire ou l’arrêt est envoyé après lui, sous réserve que cette intention soit toujours courante.
- Les API natives d’activation ont une échéance (opération globale20s, attente initiale du service worker3s) ; arrêt global6s conservé. Un délai ne devient pas un succès annoncé. Une désinscription serveur déjà en file peut se terminer après le délai d’affichage si elle reste l’intention courante du même compte.
- La confirmation de l’interface est protégée par le numéro de demande et l’identité. L’ancien horaire n’est plus annoncé après le choix suivant.

## Vérifications ciblées

- **19 tests unitaires réussis** : les8tests de délai précédents et11nouveaux cas (activation normale, arrêt, changement de compte, nouvel horaire, arrêt/réactivation, écritures déjà parties, attentes natives silencieuses et invalidation du composant). Les timers de nettoyage des tests sont drainés entre les cas ; les assertions de délai à6s restent conservées.
- **10 parcours téléphone réussis** : les3nouveaux scénarios et les7scénarios précédents des exercices/suppression.
- **3 parcours ordinateur réussis** : les trois nouvelles régressions.
- Quatre parcours ciblés finaux réussis après ajout du cas d’échec courant : la disponibilité du rappel local reste expliquée sans annoncer une activation push réussie.
- Compilation finale réussie, aucun contrôle ni contenu pédagogique supprimé.

## README

Le README racine est restructuré depuis les sources : fonctionnalités, prix mensuels et Go réservé aux lycées, accès réellement codés, quotas/grâce, architecture, contenu/langues, sauvegarde/confidentialité, services IA, hors ligne, tests, CI/Pages, SEO et maintenance. Il distingue le code versionné de l’état distant, les inventaires datés des statistiques d’usage, et les documents historiques des règles actuelles. Les liens locaux ont été vérifiés. Aucune offre ou autorisation n’est modifiée par cette documentation.

## Limites des essais

Profils, jetons et services fictifs, API natives simulées : aucune inscription réelle aux notifications, écriture Supabase/NAH, génération facturée ou transaction de paiement. Les scénarios valident les décisions client et l’ordre des requêtes ; ils ne constituent pas une preuve d’envoi de notification sur un téléphone réel ni une revue exhaustive du navigateur ou du backend.

## Livraison terminée

- CI finale [44033487110](https://github.com/revizstmg/revizstmg.github.io/actions/runs/44033487110) réussie : **896 tests UTC**, **896 Paris**, compilation et **442 parcours navigateur**. [Extrait](preuves/ci-extrait.log). La première CI a été arrêtée avant publication afin d’intégrer le message d’échec et son test ; aucune validation partielle présentée comme générale.
- Compilation publiée automatiquement : `6e3b71fdf939cc2b1fb2cf4aef34a401cdc162b5` ; [Pages44035454002](https://github.com/revizstmg/revizstmg.github.io/actions/runs/44035454002) réussi.
- Vérification publique après Pages : **15 fichiers sur15 conformes à Git**, dont Profile et l’entrée active ; [empreintes](preuves/fichiers-publics.json).
- **4 parcours publics réussis** : refus d’activation après arrêt, changement de compte et horaire obsolète, ainsi qu’un échec courant correctement expliqué. [Journal](preuves/parcours-publics.log). Tous conservent les services fictifs et l’absence d’écriture réelle.
