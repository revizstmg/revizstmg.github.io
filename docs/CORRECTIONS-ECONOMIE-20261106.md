# Corrections économiques du 6 novembre 2026

Deux relectures indépendantes ont relevé des erreurs dans les cours et exercices de Première et Terminale. Les corrections portent sur les fichiers pédagogiques JSON et leurs déclinaisons, sans changement de présentation ni modification des PDF officiels.

| Sujet | Correction livrée dans les sources |
| --- | --- |
| PIB, flux et stock | Le PIB est un flux de production sur une période ; le patrimoine est un stock. |
| PIB marchand et non marchand | Les productions non marchandes sont incluses, évaluées à partir des coûts. Travail domestique non rémunéré et services bénévoles non valorisés sont distingués. |
| PIB et croissance | Impôts nets des subventions sur les produits ajoutés à la somme des valeurs ajoutées ; croissance en volume et exemples à prix constants. |
| Production marchande | Prix économiquement significatif, sans imposer la couverture de tous les coûts ; financement associatif et public distingué. |
| Épargne et financement | Comparaison épargne/investissement dans un modèle explicitement simplifié, avec contre-exemple de l’épargnant ayant un besoin. |
| Autofinancement et actions | Ressources internes distinguées des apports extérieurs en capital ; dividende éventuel, non garanti. |
| Revenu disponible | Retrait du distracteur exact « consommation + épargne » ; conversion du taux d’épargne en pourcentage explicitée. |
| Patrimoine | Actifs, dettes pour le patrimoine net, transmissions et variations de valeur. |
| Novéo | Investissement de 500 000 €, autofinancement de 150 000 €, financement externe restant de 350 000 €. |
| Emprunt, déficit et dette | L’emprunt finance le déficit ; dette restant due de toutes les administrations publiques ; ajustements financiers distingués des déficits. |
| Chômage et halo | Le statut étudiant ou retraité ne suffit pas à classer ; critères BIT, délais et souhait de travailler précisés. |
| Politique monétaire | Eurosystème indépendant des gouvernements, objectif symétrique de 2 % à moyen terme ; budget et monnaie attribués aux bonnes autorités. |
| Thème 9 | Retrait des annonces « pas évalué à l’écrit ». Préparation écrite pour la session 2027, sans modifier les annales historiques. |

Les paragraphes, tableaux de définitions, résumés, flashcards, QCM, études documentaires et corrigés concernés ont été harmonisés. Les exercices générés héritent des textes corrigés. Les empreintes modifiées doivent se limiter aux thèmes économiques et aux deux paquets de cette matière.

## Sources officielles

Références consultées le 6 novembre 2026 :

- [Insee, PIB](https://www.insee.fr/fr/metadonnees/definition/c1365).
- [Insee, production marchande](https://www.insee.fr/fr/metadonnees/definition/c1352) et [non marchande](https://www.insee.fr/fr/metadonnees/definition/c2249).
- [Insee, capacité de financement](https://www.insee.fr/fr/metadonnees/definition/c1214) : solde du compte de capital ; le modèle scolaire épargne moins investissement est présenté comme simplifié.
- [Insee, chômage BIT](https://www.insee.fr/fr/metadonnees/definition/c1129).
- [Insee, patrimoine des ménages](https://www.insee.fr/fr/statistiques/fichier/5234985/Revenus-patrimoine-2024.pdf).
- [Agence France Trésor, périmètre](https://www.aft.gouv.fr/fr/definition-perimetre).
- [Ministère de l’Économie, dette publique](https://www.economie.gouv.fr/decryptage-5-minutes-pour-comprendre-la-dette-publique).
- [BCE, stabilité des prix](https://www.ecb.europa.eu/mopo/strategy/pricestab/html/index.fr.html) et [indépendance](https://www.ecb.europa.eu/ecb/orga/independence/html/index.fr.html).
- [BO spécial du 17 septembre 2026, note du 11 septembre, session 2027](https://www.education.gouv.fr/bo/2026/Special4/MENE2622652N), rubrique Droit et économie. Source ouverte via outil web malgré un refus 403 de l’accès HTTP direct.

## Contrôles et limites

Les deux rapports sources sont dans `docs/audits/2026-11-06/`. Leurs constats décrivent l’état avant correction ; cette note suit la livraison. Huit tests ciblés vérifient notamment le contenu assemblé et le QCM ambigu. La suite générale, la compilation et la publication sont consignées au journal de coordination avec leurs résultats réels.

Cette relecture n’est pas une certification de professeur ni une garantie d’absence de toute faute dans l’ensemble du site. Les anciens sujets du Prix vérifiés restent inchangés. Le nouveau sujet 2025-2026 sur l’épargne appartient au chantier distinct déjà préparé ; sa correction serveur demande un déploiement spécifique et n’est pas annoncée comme activée par ce lot.

## Livraison vérifiée

PR [#182](https://github.com/revizstmg/revizstmg.github.io/pull/182), source `87fa6e6dbdb66145e10d7b489a69cb1c5892152e`, compilation `2a42f9524dd9dae1af16ae6eb31708b154020fee`.

- 772 tests unitaires locaux réussis, puis 772 en UTC et 772 à Paris sur GitHub.
- Compilation et 392 parcours navigateur réussis dans la CI [42223595260](https://github.com/revizstmg/revizstmg.github.io/actions/runs/42223595260).
- Deux index pédagogiques régénérés après les deux échecs initiaux ; aucun contrôle retiré.
- Publication Pages réussie ; index et huit pages publiques distinctes comparés au commit compilé, HTTP 200 et empreintes identiques. Preuves : [economie-public.json](audits/2026-11-06/economie-public.json).

La lecture des fichiers du commit compilé a remplacé le téléchargement direct de l’artefact, indisponible depuis cet environnement. Les services externes des tests navigateur sont simulés ; ces vérifications ne certifient pas le fonctionnement réel de Gemini ou de Supabase, qui n’ont pas été modifiés par ce lot.
