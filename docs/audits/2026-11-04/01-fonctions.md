# Audit indépendant des fonctionnalités

Version source `90c6a46357308624aa8b76f5046a7bc316bcb536`, le 4 novembre 2026. Worktree isolée, compilation locale EPS identique à celle fournie par le coordinateur. Aucun changement produit, aucune donnée réelle, aucun paiement ni appel IA réel. Les requêtes externes ont été bloquées ou remplacées par des réponses synthétiques via le helper `preparer`. Lecture des consignes du dépôt et compétence Supabase appliquées ; aucun accès ou changement au projet réel.

## Défauts reproduits

Les cinq constats F01 à F05 étaient déjà signalés dans la campagne du 2 novembre. Ils restent présents dans la source actuelle et ont été reproduits de nouveau : ce ne sont pas cinq régressions dues à l’EPS.

### F01 · P2 · L’espace parent recharge en boucle

Un enfant synthétique étant déjà lié par `stmg_parent_link`, ouvrir `/#/parent` sans agir. Le RPC `revizstmg_stats_enfant` est appelé au moins 12 fois ; deux reproductions, réponses volontairement plafonnées 20 fois par sonde. La fréquence synthétique ne doit pas être extrapolée au trafic réel.

Cause : `app/src/pages/Parent.jsx:66` dépend de `t` ; `useT` dans `app/src/i18n.js:38` recrée sa fonction à chaque rendu ; l’effet ligne 78 redémarre après chaque chargement. Impact : requêtes inutiles, chargement instable, coût réseau et batterie.

Correction proposée : stabiliser le traducteur ou dépendre d’une clé de langue stable ; invalider les réponses obsolètes ; charger une seule fois au lien/changement d’enfant, puis proposer un bouton explicite Actualiser. Vérification : attendre quelques secondes après une réponse sans action, le compteur doit rester stable.

### F02 · P2 · Une fiche effacée revient après « Tout recommencer »

Dans `/#/fiches-photo`, ajouter une image synthétique, lancer l’analyse, suspendre sa réponse, cliquer Tout recommencer puis libérer l’ancienne réponse. La fiche ancienne réapparaît malgré les photos et champs vidés. Deux reproductions ; titre témoin `ANCIENNE PHOTO AUDIT08`.

Cause : `app/src/pages/PhotoFiche.jsx:130` applique son résultat après await sans numéro de génération ; `:179` remet l’interface à zéro sans invalider la demande. Le délai réseau90 s ajouté précédemment ne corrige pas cette course.

Correction proposée : AbortController et identifiant de génération, invalidés au reset, au changement des photos et au démontage ; protéger également l’OCR. Alternative de parcours : afficher Annuler l’analyse, conserver explicitement le brouillon choisi par l’élève, ne jamais réafficher un résultat abandonné.

### F03 · P2 · Échec d’acceptation de duel invisible

Compte gratuit, invitation de duel synthétique reçue, onglet Duels, bouton Relever ; la requête PATCH retourne 503. Aucun message d’échec n’apparaît dans cette vue. En allant dans Amis, le message « Ta demande n’a pas été confirmée » apparaît. Deux reproductions, requête observée avant assertion.

Cause : `app/src/pages/Friends.jsx:182` affecte `msg`, mais son rendu général est limité à Amis (`:318`, `:334`). Le rendu dans Duels (`:463`) dépend du sous-parcours de création qui n’est pas actif ici.

Correction proposée : une zone `role=alert` commune immédiatement sous les onglets ; message lié à l’action et bouton Réessayer. Conserver l’invitation et laisser les autres actions utilisables.

### F04 · P3 · Retour OAuth contenant un pourcentage

Ouvrir une session synthétique neuve sur `/#error=access_denied&error_description=Refus%20%C3%A0%20100%25`. Une URIError apparaît ; le dialogue d’erreur attendu ne fonctionne pas. Deux reproductions ; un refus simple sans pourcentage réussit.

Cause : `app/src/auth.js:229` applique `decodeURIComponent` à une valeur déjà décodée par URLSearchParams. Le `%` littéral provoque l’exception.

Correction proposée : utiliser directement la valeur décodée de URLSearchParams, sans second décodage. Tester `%`, accents, `+` et séquences invalides, avec un message visible et la possibilité de recommencer la connexion.

### F05 · P3 · Un chapitre inexistant modifie le marqueur de reprise

Ouvrir `/#/subject/p1-sgn/theme/p1-sgn-t1/chapter/1`, puis `/#/subject/p1-sgn/theme/p1-sgn-t2/chapter/-1`. La404s’affiche correctement, mais `stmg_progress_v2.lastChapter.chapterId` passe de `p1-sgn-t1` à `p1-sgn-t2`. Reproduit après rétablissement de l’environnement. Ce cas nécessite une adresse modifiée ; aucun lien invalide du catalogue normal n’a été observé.

Cause : `app/src/pages/Chapter.jsx:53` enregistre le thème avant de vérifier `!chapter` à la ligne 62. Correction : n’enregistrer la visite et ne lancer le suivi du temps que si le chapitre existe. Impact limité au marqueur de dernier thème ; la position récente de lecture peut préserver la reprise visuelle.

### F06 · P2 · Double envoi d’un duel de classe

Nouveau constat de cette campagne : dans Classe → Quiz et travail → Duels, choisir Lancer un duel et un quiz synthétique, répondre à sa question puis double-cliquer « Voir mon score » pendant que la réponse réseau est retenue. Deux POST de création `class_duel` sont envoyés pour le même résultat. Première reproduction par deux clics DOM, puis reproduction indépendante avec un véritable `locator.dblclick()` Playwright ; deux appels observés dans les deux cas. Aucun duel réel n’a été créé.

Cause : `app/src/pages/Classe.jsx:916` n’a ni verrou en vol ni état de transmission ; `app/src/games/Qcm.jsx:61` laisse le bouton de fin actif après chaque clic ; `app/src/classroom.js:186` crée une nouvelle entrée à chaque appel. Risque : invitations en doublon si le serveur accepte les deux créations, confusion et trafic inutile. L’existence de deux enregistrements dans la vraie base n’est pas certifiée par cette simulation.

Correction : verrou immédiat par ref avant l’appel, état Envoi en cours avec bouton désactivé, résultat conservé et réessai explicite en cas d’échec. Ajouter une clé d’idempotence côté serveur pour résister aux reprises réseau ; ne pas se limiter à une temporisation visuelle.

## Améliorations concrètes proposées

1. **Statut réseau par action.** Amis et Classement emploient encore un libellé générique de classement pour certaines pannes sociales. Préférer « Invitation non envoyée » ou « Message non publié » près du bouton concerné ; garder le texte saisi et un réessai. C’est une amélioration de compréhension, pas un échec serveur réel constaté.
2. **Distinguer clairement les récompenses disponibles.** Les mois offerts de la boutique restent des réservations futures, comme le vérifie son scénario. Montrer dès la carte « Réservable, activation ultérieure » et proposer d’abord un avantage utilisable immédiatement. Ne pas faire passer une réservation pour un abonnement actif.
3. **EPS : rattacher la grille du lycée.** L’assistant ne fabrique pas de note locale et donne les repères nationaux disponibles. Ajouter un endroit simple pour lire ou joindre la grille du professeur serait plus utile qu’une estimation universelle. Conserver les trois étapes et les limites explicites.
4. **Sauvegarde : indiquer sa portée.** Distinguer appareil/compte pour les brouillons, copies, programmes et fiches. Une même formule « Enregistré » ne doit pas laisser croire que chaque outil se synchronise entre appareils.
5. **Préparer une recette réelle avant commercialisation.** Les flux simulés ne prouvent ni les règles RLS actives, ni les versions Edge effectivement déployées, ni une correction manuscrite réelle, ni les webhooks et remboursements Stripe. Utiliser des comptes de recette et paiements de test, avec un protocole séparé autorisé. Les déploiements encore mentionnés en attente dans docs/PAIEMENTS.md doivent être vérifiés explicitement.

## Contrôles, incidents et limites

Inventaire source : 45 routes déclarées, y compris redirections et route404 ; ce nombre n’est pas un nombre de fonctionnalités certifiées.

Première série de 13 sondes : 9 réussites, 4 échecs. Trois échecs correspondent aux défautsOAuth/photo/duel ; le quatrième venait d’une ancienne simulation du mur qui ne répondait pas au nouveau RPC `revizstmg_mur`. Après adaptation de cette simulation uniquement, le mur conserve le texte sur 503 puis publie correctement. Aucun produit modifié pour faire passer cette sonde.

Contre-vérification de 6 sondes : 3 réussites (boucle parent mesurée deux fois, mur adapté), 3 échecs attendus révélant les défautsOAuth/photo/duel. La boucle parent est un défaut observé par une sonde qui réussit à démontrer sa répétition.

Une suite générale et un lot ciblé ont été interrompus. Le lot ciblé avait annoncé 98 scénarios et n’a pas terminé : ne pas le présenter comme 98 réussites. Avant coupure de l’environnement, les journaux montrent notamment achats/équipement/persistance boutique, réservations futures, contrôle rédigé et annulation/délai, classes multiples et renommage, reprise des saisies professeur, quiz et codes inconnus/exclus/erreurs de recherche. Une navigation a échoué lors de l’arrêt de mon ancien serveur ; ce cas doit être repris séparément. Le lancement unitaire n’a pas produit de bilan avant la coupure ; aucun résultat unitaire n’est revendiqué sur cette base.

Le 4 novembre, l’environnement a renvoyé « exec-server transport disconnected » puis a été marqué indisponible. Les processus de contrôle ont été arrêtés ; l’accès est revenu et les fichiers ont été conservés. Cet incident d’outillage ne constitue pas un défaut du site. Les contrôles légers repris ensuite seront notés ci-dessous.

Les captures et traces sont synthétiques. Les intégrations privées réelles, concurrence entre appareils réels, Safari/iOS natif, lecteurs d’écran humains, toutes les pages de tous les PDF, et la justesse de chaque notion de chaque cours ne sont pas certifiés. Aucune promesse de vérification exhaustive sans erreur restante.

Journaux locaux : `/workspace/work/audit-fonctions-probes.log`, `audit-fonctions-probes-final.log`, `audit-fonctions-focused.log`, `audit-fonctions-browser.log`. Traces sous `app/audit-probes-results/` et `app/test-results/` ; reproductions autonomes sous `app/audit-probes/`. Adapter les chemins et conserver le blocage du réseau extérieur avant de les rejouer.

## Reprise légère après l’incident

- 34 tests unitaires réussis sur 3 fichiers : auth-session (10), classes-identity (8), notes-classe (16), un seul worker, 3,86 s.
- Deux sondes supplémentaires confirment le marqueur invalide et le double envoi de duel de classe. La seconde est rejouée avec un double clic Playwright, même résultat.
- Compilation inspectée : index SHA-256 `c924cef174de0f546e68bd3d6d483732b7d3e00058655f324836eef8997be5a9`. Le contrôle porte sur cette compilation locale ; aucune affirmation de publication publique n’en découle.
- La reprise isolée du test Outils gratuit avait dépassé son attente 10 s sous charge, alors que son snapshot montre bien le lien Bac blanc et les deux autres liens attendus. Ce décalage n’est pas retenu comme disparition fonctionnelle. Une dernière reprise légère du test et du scénario de correction interrompu est consignée séparément.

Les deux dernières reprises réussissent : Outils gratuit (4,1 s) et correction en échec conservant la réponse (2,9 s), total 9,7 s. Les écarts de ces deux scénarios dans les séries interrompues ne sont donc pas retenus comme défauts produits. Rapport final : six défauts reproduits, dont cinq déjà connus et un nouveau double envoi de duel de classe. Aucun correctif produit réalisé.

Les scripts de reproduction et observations compactes sont conservés dans [preuves-fonctions](preuves-fonctions/observations.json). Pour rejouer, placer les scripts sous app/audit-probes, adapter un port isolé dans la configuration Playwright et créer test-results/audit-fonctions ; conserver le helper réseau bloqué. Les sondes qui démontrent un défaut échouent volontairement sur leur assertion de comportement attendu.
