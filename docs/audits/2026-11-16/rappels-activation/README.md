# Activations de rappel obsolètes

**Rapport historique :** scénarios corrigés et publiés le 17 novembre 2026. Voir le [bilan de livraison](../../2026-11-17/rappels-corriges/README.md).

Recherche ciblée du 16 novembre 2026 sur `63558b9e7` ; version publique compilée `6592783c46731d93f9f973841d7d8e90a07e232a`. Trois scénarios reproduits sur l’interface publique, autour d’une même absence d’invalidation des activations en cours. Ce ne sont pas trois causes indépendantes. Les priorités sur dix expriment l’impact pratique.

## Changement de compte : 7/10

Depuis Paramètres > Notifications, A active un rappel. La demande native d’abonnement reste en attente. La session bascule vers B par l’événement de stockage interonglets, puis l’abonnement commencé sous A se résout.

**Observé :** le RPC `revizstmg_push_abonner` part avec le jeton fictif de B, pour la demande commencée par A. La préférence locale de B est pourtant désactivée. Il s’agit d’une association indésirable de l’appareil au compte suivant dans le même navigateur, pas d’une fuite de données démontrée ni d’un accès à des comptes arbitraires.

**Cause :** `push.js:29–40` vérifie seulement la connexion avant ses attentes ; le RPC final utilise la session courante. Contrairement à la désactivation récemment corrigée, l’activation n’a pas de propriétaire capturé ni de garde après chaque attente.

## Désactivation pendant l’activation : 6/10

Activer le rappel, suspendre la réponse native de `subscribe`, désactiver le rappel, puis laisser cette réponse arriver.

**Observé :** le bouton et la préférence locale restent sur arrêt, mais l’ancienne activation envoie quand même `revizstmg_push_abonner`. Le texte « Rappel activé, même téléphone fermé. » apparaît alors que le bouton est désactivé. Une ancienne intention peut donc réinscrire les notifications après leur arrêt.

**Cause :** `Profile.jsx:368–385` ne conserve pas de génération d’opération et `activerRappelsPush` n’est pas invalidé par la désactivation. La fonction d’arrêt corrigée précédemment reste bornée ; ce nouveau défaut concerne l’activation qui lui survit.

## Modification de l’heure : 5/10

Activer à18h avec une souscription retardée, changer à20h et terminer cette seconde souscription avant la première.

**Observé :** les requêtes d’abonnement partent dans l’ordre `p_minute=1200` (20h), puis `p_minute=1080` (18h), alors que l’interface conserve20h. L’ancienne demande est donc envoyée en dernier. L’écrasement effectif en base n’est pas testé ici : le transport est simulé ; le défaut confirmé est l’envoi obsolète malgré le choix courant.

## Correction à envisager

Capturer le compte et une génération d’intention avant toute attente. Après chaque réponse, refuser de poursuivre si le compte, l’état activé ou l’horaire demandé a changé. Coordonner activation/désactivation et annuler ou compenser proprement toute souscription native devenue obsolète. Ne confirmer à l’écran que la dernière intention. Prévoir une échéance pour les API natives de l’activation, sans assimiler un délai à un succès.

## Preuves et limites

Les sondes utilisent le site public avec profils et jetons fictifs, fausse souscription native et réponses REST simulées. Aucun compte réel, notification envoyée, écriture Supabase/NAH, paiement, appel IA ou modification du produit. Les sondes réussissent lorsqu’elles **constatent le défaut**, ce ne sont pas des tests de bon fonctionnement. Une première sélection de route et un libellé de test ont été rectifiés avant confirmation ; aucune panne du produit n’est déduite de ces erreurs de sonde.

Les flashcards et d’autres pistes ont été lues sans nouveau défaut suffisamment établi ; aucune conclusion exhaustive n’en découle. Les trois bugs de la PR228 restent corrigés et ne sont pas recomptés.

Confirmation finale : les trois scénarios sont reproduits dans une même exécution, en11,2secondes. [Journal](preuves/confirmation.log), [sonde exécutée](preuves/sondes.spec.js), états [arrêt](preuves/arret.json), [identité](preuves/identite.json), [horaire](preuves/heure.json). Les chemins absolus de la sonde sont ceux de l’environnement d’audit ; son helper bloque les tiers et autorise uniquement les fichiers du site public.
