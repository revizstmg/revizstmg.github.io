# Parcours Avenir

Rubrique d’orientation accessible depuis le menu et les onglets personnalisables, à `/#/parcours-avenir`. Elle est indépendante du parcours de révision Ultimate `/#/parcours` et ne nécessite pas d’abonnement.

## Questionnaire

56 questions en neuf étapes : six activités pour chacun des huit domaines (finance, commerce, RH, numérique, droit, économie, communication, entrepreneuriat), puis huit questions de contexte (durée, alternance, mobilité, point financier à vérifier, cadre, mode d’apprentissage, calcul, rédaction).

Les activités mesurent une envie déclarée de découverte, pas une compétence. Réponses de 0 à 4 et option inconnue. Les réponses inconnues sont exclues de la moyenne ; zéro est une réponse négative valide. Pour ressortir, un domaine nécessite au moins quatre réponses connues et deux envies positives (3 ou 4). Les domaines sont triés par moyenne, avec priorité à ceux respectant ces conditions. Les trois premières pistes sont détaillées ; les huit restent consultables. Les égalités ne doivent pas être interprétées comme des différences significatives. Si aucune piste ne se détache, la page propose de découvrir et d’échanger, sans recommandation artificielle.

Le contexte ajuste les conseils pratiques sans exclure un domaine ni modifier ses intérêts. Aucune probabilité d’admission, aucun diagnostic psychologique. Ce questionnaire interne n’est pas un test psychométrique validé. Les conditions d’admission, programmes et débouchés doivent être vérifiés pour l’année de candidature. Les exemples ne constituent pas un panorama exhaustif des possibilités après STMG.

## Bilan

Réponses positives citées, formations à comparer, métiers illustratifs et points de vigilance. Conseils sur l’encadrement, le budget, l’alternance et les soutiens ; trois démarches concrètes, sources Onisep/Avenir(s), Parcoursup et CROUS. Impression, modification et effacement avec confirmation.

## Données et coût

Calcul local sans appel de génération. Les textes publics statiques suivent le mécanisme de traduction du site ; les réponses ne lui sont pas envoyées. Sauvegarde habituelle sous `parcours.avenir` ; les réponses structurées, l’étape et l’état terminé sont repris après rechargement. La date propre au dossier évite qu’une ancienne copie du questionnaire l’emporte lors d’une fusion avec un parcours de révision plus récent. L’effacement garde un dossier vide horodaté pour ne pas restaurer d’anciennes réponses. Il conserve objectifs et positionnements. Aucun nouveau schéma ni réglage Supabase. Les réponses ne sont pas ajoutées au résumé partagé avec les parents.

## Validation

Onze tests unitaires ajoutés (dont cinq contrôles de couverture des langues) : intégrité des questions, nettoyage, absence de piste inventée, intérêts/contextes distincts, fusion/effacement et accès. Quatre parcours navigateur ajoutés (dont l’anglais sans accès externe) : 56 réponses avec validation et reprise sur mobile, bilan inconnu et effacement limité, accès depuis le menu desktop. Les premiers parcours ont révélé un conflit de traduction JSX ; la page utilise désormais directement `TextePublic`, et les trois parcours réussissent après compilation. Aucun contrôle supprimé. Rendu mobile et desktop inspectés ; compilation réussie.

Les tests ne contactent pas les services réels. Résultats complets et références de livraison consignés dans `docs/COORDINATION.md`.

Les contrôles complets ont également signalé deux oublis d’intégration, corrigés : route dans le modèle 404 et nom d’écran dans la mesure d’audience. L’orientation rejoint le compteur `guide` existant, sans migration ni mesure des réponses. Les onze contrôles liens/règles repris passent. Les quatre liens officiels affichés répondent HTTP 200 lors de la vérification.

Complément de traduction : environ190 nouvelles entrées dans chacun des cinq catalogues (questions, choix, contexte, conseils et métiers). Les noms officiels des diplômes français restent en français. Traductions initiales automatiques, couverture vérifiée et formulations retouchées, notamment les règles du bilan et les métiers ; une relecture par des locuteurs reste utile. Cinq contrôles supplémentaires couvrent les données du questionnaire hors ligne ; un quatrième parcours teste l’anglais avec services externes bloqués. Les21 contrôles repris (règles, liens, catalogues) passent. Le bilan explicite désormais que les envies positives sont les choix « Plutôt oui » ou « Beaucoup ».

## Livraison

PR #211 (fonctionnalité) et #212 (catalogues hors ligne) fusionnées. Source finale `62d40d90c`, fusion `80a06ba755c3c0a574e1c05ace20f1e7202f1253`. Workflow [42647628856](https://github.com/revizstmg/revizstmg.github.io/actions/runs/42647628856) réussi : **843 tests unitaires en UTC, 843 à Paris, 417 parcours navigateur**, compilation et dépôt automatique de la version testée. Compilation `57d1227eb2fd8b761408354ef323e9eab8c29e7a`. Aucun contrôle supprimé.

Pages [42650886162](https://github.com/revizstmg/revizstmg.github.io/actions/runs/42650886162) réussi. Le modèle 404, l’index, l’entrée active, le module et le style Avenir ainsi que les cinq catalogues actifs sont identiques à la compilation publiée. Contrôle public sur360×740 : essai sans compte par les écrans habituels, ouverture du questionnaire, réponse et reprise après rechargement, aucun débordement ni exception. Le premier essai du contrôle était arrêté par l’accueil commun : la reprise suit les boutons publics « Essayer sans compte », prénom de démonstration et niveau, plutôt que de contourner cet accueil. Les services externes sont bloqués ; aucun vrai compte ni donnée réelle utilisé. Preuves dans `docs/avenir-publication.json`.
