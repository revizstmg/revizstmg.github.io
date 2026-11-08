# Audit comptes, social et boutique

Audit en lecture seule de HEAD/origin/main `6ae93a192` (8 novembre 2026). Sources et parcours synthétiques ; aucun appel métier réel à Supabase, aucune inscription, aucun achat ni message envoyé.

## Couverture et résultats

67 parcours navigateur ciblés réussis (6 min 36 s), avec comptes synthétiques, abonnements simulés et réseau externe bloqué. Journal : `/workspace/output/audit-site-comptes/parcours.log`.

Périmètre exécuté : comptes et OAuth, changement de rôle/compte, erreurs sociales et reprises, classes multiples professeur/élève, code de classe, renouvellement du code parent, collections de boutique et compensation des anciens reçus, navigation desktop/mobile, paramètres et récompenses. Les tests de boutique couvrent la récupération persistante, les objets équipables et les reprises sans double crédit. Aucun suivi personnalisé n’est distribué par les nouvelles collections.

Sondes complémentaires : CTA XP en compte gratuit, serveur Auth silencieux, ouverture de Parcours en Premium. Preuves et scripts dans `/workspace/output/audit-site-comptes/`.

Les tests réussis ne prouvent pas l’absence de tout défaut : deux scénarios complémentaires ci-dessous révèlent des problèmes non couverts par ces parcours.

## Défauts reproduits

Deux défauts reproduits : C1 et C2 ci-dessous.

## Limites

Les parcours utilisent des serveurs simulés et bloquent le réseau externe. Ils ne certifient ni la configuration OAuth réelle ni les règles SQL déployées.

## Constat reproduit C1 : le bouton pour gagner de l’XP mène les comptes gratuits vers un mur payant (5/10)

- Étapes : compte synthétique sans abonnement, ouvrir Boutique, cliquer « Gagner des XP → ».
- Réel : navigation vers `/#/seance`, puis « Réservé aux abonnés ». Le compte gratuit peut gagner de l’XP dans les cours, mais ce bouton ne l’y conduit pas.
- Attendu : accès direct à une activité gratuite, ou mention Premium explicite avant la navigation.
- Sources : `app/src/components/RewardVault.jsx:11`, lien `to="/seance"` ; `app/src/data/acces.js`, `/seance` dans `PAGES_PAYANTES`.
- Preuves : `/workspace/output/audit-site-comptes/cta-xp-gratuit.png`, `probes.json` (réseau externe bloqué, abonnement simulé null).
- Alternative : pointer ce CTA vers `/cours` ou une séance de base réellement gratuite ; garder l’upsell comme action distincte.

## Constat reproduit C2 : connexion bloquée si le serveur Auth ne répond pas (7/10)

- Étapes : ouvrir la connexion, saisir une adresse et un mot de passe synthétiques valides, simuler une requête `/auth/v1/token?grant_type=password` qui reste en attente, avancer l’horloge du navigateur de 120 secondes.
- Réel : le bouton reste désactivé sur « Un instant… », aucune alerte ni reprise n’est proposée. L’option d’essai reste disponible mais la connexion ne se débloque pas d’elle-même.
- Attendu : après un délai borné, afficher une erreur de connexion et rendre la tentative renouvelable.
- Source : `app/src/auth.js:52`, `gotrue`, utilise `fetch` directement, alors que `withNetworkTimeout` existe et borne les autres API. `Welcome.jsx:232` attend cette promesse avec `busy=true`. La même primitive sert à l’inscription et à la récupération ; ces deux dernières branches n’ont pas été reproduites ici séparément.
- Preuves : `auth-probe.json`, `auth-probe.png`, `auth-probe.mjs` et `probes.json` dans `/workspace/output/audit-site-comptes/`. Aucun vrai appel Auth : réseau extérieur bloqué et route simulée suspendue.
- Alternative : utiliser la primitive de délai réseau dans `gotrue`, libérer l’état occupé et conserver les champs pour réessayer. Ajouter une sonde de serveur silencieux, distincte d’un HTTP 503 immédiat.


## Cohérence commerciale à clarifier, non qualifiée comme faille (6/10)

La boutique indique que « les suivis pédagogiques personnalisés restent réservés à Ultimate » (`app/src/components/RewardVault.jsx:12`). Pourtant, un compte Premium accède au formulaire de Parcours et à ses objectifs personnalisés : note visée, heures disponibles et matières difficiles. Le code de Parcours précise que le plan se recalcule à chaque résultat (`app/src/pages/Parcours.jsx:2`) ; il s’agit d’un calcul local, sans génération IA.

- Preuve navigateur : `/workspace/output/audit-site-comptes/premium-parcours.png`, entrée `premium-parcours` de `probes.json` ; formulaire accessible et aucun mur payant avec Premium simulé. Le plan final n’a pas été créé dans cette sonde.
- Sources : `app/src/components/Reserve.jsx:54` accepte tout abonnement non gratuit pour les pages payantes ; `/parcours` est dans `app/src/data/acces.js:20`. Premium est présenté comme « Tout le site pour réviser » dans `app/src/data/studyJourney.js:24`.
- Décision nécessaire : préciser si « suivi personnalisé » vise seulement les bilans et entraînements générés, ou inclut également ce plan local. Si le plan reste Premium, préciser la phrase de boutique pour éviter une promesse contradictoire ; sinon, appliquer un accès Ultimate cohérent dans la grille et le garde d’accès.
- Ce constat ne démontre ni contournement de sécurité ni accès non autorisé à des données.

## Améliorations et contrôles complémentaires

1. Ajouter aux tests de connexion le cas d’un serveur silencieux et un état d’attente borné (C2). Les erreurs HTTP immédiates déjà testées ne couvrent pas cette panne.
2. Tester chaque CTA de la boutique avec un compte gratuit, pas seulement avec Premium, pour garantir un parcours XP compréhensible (C1).
3. Vérifier en environnement de recette les politiques RLS réellement appliquées, l’OAuth Google et le renouvellement des codes parents avec deux comptes distincts. Ces contrôles externes n’ont volontairement pas été réalisés ici et ne sont pas des défauts démontrés.

## Limites détaillées

Aucune vraie inscription, mutation Supabase, interaction sociale externe, commande, paiement, appel IA ou lecture de données personnelles. Les parcours simulent les réponses réseau ; ils ne certifient pas la disponibilité de production, les autorisations SQL déployées, Google OAuth ou les webhooks Stripe. Le comportement hors connexion complet et tous les lecteurs d’écran n’ont pas été audités exhaustivement.

Une sonde de personnalisation d’avatar n’a pas abouti ; elle ne constitue pas une anomalie confirmée et n’est pas comptée dans les défauts. Aucun résultat de sonde interrompue ou de délai local sous charge n’a été interprété comme un défaut du site.

Aucune modification du produit ni des données. Seul ce rapport a été écrit dans le dépôt.
