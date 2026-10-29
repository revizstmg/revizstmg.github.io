# Audit fonctionnel : comptes, navigation, espaces sociaux et offres

Date : 29 octobre 2026. Agent : audit_fonctions_comptes_navigation.

## Cadre et preuve de couverture

Base inspectée : `origin/main`, commit `8764de549f21a8c2c867e257f767d46bf96ca8e6` (statistiques ; application compilée `a92f308c4ba6c92901192666101c7db86fcd73b7`). Worktree isolée : `/workspace/work/audit-comptes-main`. Aucun code de l’application corrigé, aucun commit ni PR créé, aucune donnée réelle, migration ou configuration de service modifiée. Aucune requête IA et aucun paiement réel.

Sources d’instructions lues : AGENTS.md, CLAUDE.md, docs/COORDINATION.md. Skill Supabase lue ; index du changelog et documentation des sessions consultés. Les changements relevés (self-hosted/API_EXTERNAL_URL et bibliothèques Node) ne constituent pas la cause des défauts ci-dessous.

Le parent fournit la validation récente de main (643 tests unitaires UTC/Paris et 328 parcours navigateur, exécution 40858828317). Elle n’est pas présentée comme une nouvelle exécution de cet audit.

Audit indépendant :

- Lecture des flux auth/session, stockage local, espaces parents/amis/classes/classement, paramètres, boutique, abonnements et PWA.
- 50 scénarios historiques ciblés exécutés sur serveur de développement : 48 réussis, deux assertions de nombre exact de requêtes diffèrent à cause du double montage React StrictMode (`code-classe`, `paiement`). Les deux scénarios ont été rejoués sur la compilation publiée servie localement et réussissent. Aucun test ni assertion modifié pour l’audit.
- Explorations supplémentaires Chromium avec comptes et réponses réseau synthétiques. Les cas abonnement périmé et réponse Checkout tardive sont aussi reproduits sur la compilation publiée servie localement.
- Tous les accès externes des navigateurs sont bloqués ou simulés. Les domaines Stripe utilisés dans les reproductions sont fictifs et interceptés.

## Constats prioritaires

### CN-01 : P1 : le code parent est repris par un second compte sur le même navigateur

**Statut : défaut client reproduit ; conséquence serveur reproduite en simulation du SQL du dépôt, pas constatée sur les données de production.**

**Sources :** `app/src/parent.js:27` (clé globale `stmg_parent_code`), `:42` (publication avec ce code et l’identité du compte courant), `app/src/store.jsx:583` et `:167` (déconnexion/remise à zéro du state mais pas de cette clé). Définition de table : `supabase/migrations/20260916063355_create_child_stats_parent_space.sql:3` ; RPC : `supabase/migrations/20261013171408_revizstmg_securite_4_fonctions_app.sql:56`.

**Conditions :** deux comptes élèves distincts, nouvel usage de l’espace parent pour le second, même profil de navigateur, partage activé pour chacun. Si le second compte possède déjà une ligne ayant un autre code, le déclencheur conserve son code existant et le cas peut ne pas apparaître.

**Étapes :**

1. Pour le compte A, appeler `parentCode()` puis publier ses statistiques.
2. Se déconnecter ; ouvrir la session du compte B sans effacer le stockage du navigateur.
3. Appeler `parentCode()` et publier les statistiques de B.
4. Comparer les codes et les corps des deux publications.

**Attendu :** deux codes distincts, associés chacun à un seul compte. **Observé client :** même code, publications avec deux `device_id` différents.

Le schéma du dépôt ne déclare pas `code` unique. Sa RPC choisit la ligne la plus récente pour un code (`ORDER BY updated_at DESC LIMIT 1`). Une simulation fidèle de cette règle renvoie donc l’enfant B en consultant le code initial de A. Cela peut exposer la progression d’un autre enfant et rompre le sens du consentement au partage. **Aucune consultation d’un vrai enfant n’a été faite ; les contraintes et fonctions actuellement appliquées en production n’ont pas été confirmées.**

**Reproduction autonome :** `node preuves/audit-comptes-harness.mjs`. Preuve : `preuves/audit-comptes-collisions.json`, propriétés `parentCodesEqual: true`, `childFromCodeA: "Enfant audit B"`. Script utilisant les vrais modules client et une simulation locale du serveur.

**Piste de correction :** rattacher le code au compte, restaurer d’abord son code serveur, garantir l’unicité et traiter les collisions côté serveur. Vérifier les codes historiques avant toute migration ; ne pas modifier la base sans autorisation.

### CN-02 : P2 : même collision pour le code ami, avec risque d’ajouter la mauvaise personne

**Statut : défaut client reproduit ; résolution vers une autre identité simulée selon le SQL du dépôt.**

**Sources :** `app/src/friends.js:13`, `:29`, `:47` ; table `supabase/migrations/20260909072259_friends_feature.sql:4` ; RPC `supabase/migrations/20261013171408_revizstmg_securite_4_fonctions_app.sql:48`.

Même séquence A → déconnexion → compte B nouveau dans Amis. La clé globale `stmg_friend_code` reste celle de A ; `upsertMe` publie le même code pour B. Le dépôt a un index non unique et une recherche `LIMIT 1` sans sélection d’un propriétaire unique.

**Attendu :** le code partagé par B retrouve B. **Observé :** `friendCodesEqual: true` ; en simulation, la recherche du code affiché à B retrouve `Élève audit A`.

Même script et JSON que CN-01. Ce n’est pas une preuve d’accès à un compte réel ni d’une demande réellement envoyée. Les deux défauts ont une cause commune (clé locale globale), mais concernent deux annuaires distincts.

### CN-03 : P2 : l’abonnement affiché reste celui de A après une connexion B dans un autre onglet

**Statut : reproduit dans l’interface, y compris sur la compilation publiée, avec serveur d’abonnement simulé.**

**Sources :** `app/src/components/Abonnement.jsx:18`, `:21-38` (effet dépendant de `connecte`, un booléen, et non de l’identité du compte).

**Étapes :**

1. A ouvre Offres, le serveur simulé répond « Premium actif ».
2. Un second onglet de la même origine écrit la progression et la session de B, comme lors d’une connexion sur ce navigateur.
3. L’onglet Offres reçoit le véritable événement `storage` et son état devient celui de B.
4. La simulation répondrait « Ultimate » si l’état de B était demandé.

**Attendu :** effacer l’état de A et relire celui de B. **Observé :** l’identité courante est B, l’écran montre encore Premium et la date de A ; aucune requête d’état n’est envoyée avec le jeton B. Le booléen `connecte` reste vrai, donc l’effet ne repart pas.

**Preuves :** `preuves/audit-abonnement-compte-prod.mjs`, `preuves/audit-abonnement-compte-prod.json`, `preuves/audit-abonnement-compte.png`. La compilation n’émet qu’une lecture, avec le jeton synthétique A. Pas de données bancaires réelles, aucun accès effectif à un abonnement privé.

**Piste :** état et requêtes liés à `state.account.id`, remise à zéro à chaque changement, garde d’identité sur les réponses et sur le consentement du souscripteur.

### CN-04 : P2 : une réponse Checkout tardive redirige après la déconnexion

**Statut : reproduit dans l’interface et sur la compilation publiée, Stripe et serveur simulés.**

**Sources :** `app/src/components/Abonnement.jsx:47-56`, `app/src/data/abonnement.js:9-22`.

**Étapes :** ouvrir Offres avec A, cocher la condition d’âge/accord, cliquer l’offre ; conserver la réponse Checkout en attente ; déconnecter A (événement de stockage de l’autre onglet) ; attendre que l’écran indique « Connecte-toi… » ; livrer enfin la réponse de A.

**Attendu :** ignorer la réponse de l’ancienne session. **Observé :** redirection vers la page Checkout synthétique du compte A alors que `stmg_session` vaut `null`. `payer` n’a pas de garde après l’attente, et le helper ne vérifie pas que la session appartient toujours à l’auteur de la demande.

**Preuves :** `preuves/audit-paiement-retard-prod.mjs` et `preuves/audit-paiement-retard-prod.json` (`sessionAtRedirect: null`, URL fictive `checkout.stripe.audit/compte-A`). Cette redirection n’est pas un débit automatique ; aucun vrai Checkout n’a été ouvert.

**Piste :** capturer le propriétaire et une génération de requête, invalider au changement de compte/démontage, refuser toute navigation tardive. Appliquer aussi au portail.

### CN-05 : P2 : l’offre reste en chargement si le service de paiement ne termine pas sa réponse

**Statut : attente prolongée reproduite par simulation ; absence de borne applicative confirmée en lecture.**

**Sources :** `app/src/data/abonnement.js:9-22`, `app/src/components/Abonnement.jsx:21-38`, `:61`. À comparer au helper de délai réseau déjà présent dans `app/src/networkTimeout.js`.

Une requête d’état laissée ouverte maintient « Chargement des offres… » après 17 secondes, `aria-busy=true` et aucun bouton de reprise dans ce bloc. Aucun délai ni annulation n’est passé au `fetch`. Selon le réseau, le navigateur peut finir par abandonner ; l’application n’assure aucune borne ni sortie de cet état. Même faiblesse pour Checkout et portail.

**Preuves :** `preuves/audit-paiement-attente.mjs`, `preuves/audit-paiement-attente-final.json` (`loading:true`, `busy:1`, `paymentRetry:0`). Le bouton Réessayer de la sauvegarde générale, quand présent, ne relance pas le paiement.

**Piste :** délai et annulation explicites, état d’échec récupérable, reprise visible et limitation des requêtes concurrentes.

## Couverture fonctionnelle et limites

| Zone | Contrôle effectué | Conclusion limitée à cet audit |
| --- | --- | --- |
| Inscription, connexion, OAuth, reprise d’identité, changement élève/prof | Tests `comptes.spec.js`, `oauth.spec.js`, `code-classe.spec.js` ; lecture auth et store | Parcours simulés passants ; code inconnu/refus/erreur réseau contrôlés. OAuth Google réel, mails et révocation serveur non exécutés. |
| Classes professeur/élève | `classes-multiples.spec.js`, codes de classe ; lecture classroom/Classe | Création et nommage simulés, deux classes, bascule, départ d’une seule classe, groupes et accès contrôlés. RLS serveur et droits réels non certifiés. |
| Navigation mobile, personnalisation des onglets, traduction | `navigation-mobile.spec.js`, `parametres-rubriques.spec.js` | Clavier, fermeture, ordre et limites d’onglets, petits écrans, allemand/arabe et catégories de réglages passants. Pas de nouvelle couverture exhaustive de chaque navigateur natif. |
| Accueil simplifié | Validation récente du parent + lecture du source | Cours, entraînement, classe et progression conservés ; pas de nouvel audit esthétique. |
| Paramètres identité, sécurité, photo, suppression et export | Tests de rubriques + lecture Settings/Profile/auth | Structure et parcours simulés contrôlés. Aucun mot de passe réel, compte réel supprimé ni export personnel demandé. |
| Parent | Renouvellement de code testé ; nouvelle exploration CN-01 | Collision inter-comptes reproduite côté client ; impact de résolution seulement simulé. Rattachement anonyme par code prévu par le produit. |
| Amis et duels | Lecture friends/Friends et garde d’identité ; exploration CN-02 | Collision de codes reproduite ; pas de vrai ami invité ni duel de production joué. Certaines autres interactions étaient déjà couvertes par la CI récente, non répétées ici. |
| Classements | Lecture Leaderboard/leaderboard/reseau et règles du dépôt | Soumission et filtrage de semaine présents. Pas de classement réel lu ; résistance à la triche et identité effective côté base non vérifiées. |
| Boutique, XP, badges et récompenses | Lecture Shop/shop/store ; CI récente fournie par parent | Pas de nouvelle preuve d’attribution réelle. Récompenses commerciales présentées comme réservations à vérifier ; aucun mois offert activé. Valeurs gagnées côté serveur restent un point de lancement à valider. |
| Offres et abonnements | Tous les tests paiement ; explorations CN-03 à CN-05 | Mode simulé et compilation locale. Le chemin historique testé vers le portail fonctionne. Aucun vrai débit, webhook, remboursement ni secret Stripe consulté. |
| PWA, hors ligne et notifications | Lecture OfflineStatus/pwa et logique de service worker disponible | Pas de test d’installation, push sur téléphone réel, premier téléchargement complet ni mode avion de plusieurs jours. Ne pas présenter ces fonctions comme nouvellement validées sur appareils réels. |
| Pages légales | Lecture du cadre Offers et parcours de rubriques | Pas de validation juridique ni de contrôle de l’identité de l’exploitant. Traductions longues non relues par locuteur natif dans cet audit. |

## Accès au serveur : constat honnête

Une requête de lecture des seuls index PostgreSQL de `friend_user` et `child_stats` a été tentée via l’outil Supabase. Elle a été refusée avant exécution : `link_id` requis non fourni. Aucun contenu des tables n’a été demandé. En conséquence, l’audit ne confirme pas quelles migrations, contraintes d’unicité et politiques sont réellement appliquées, ni la configuration Auth/Stripe de production. La présence d’une protection dans le dépôt n’est pas assimilée à sa présence sur le serveur.

## Preuves et rejouabilité

Serveur source : `localhost:5192` ; compilation du site publiée servie localement par HTTP sur `localhost:5193`. Scripts et sorties décrits ci-dessus dans `/workspace/work/`.

- Régressions : `preuves/audit-comptes-regressions.log` (48/50 en développement, deux différences StrictMode détaillées), `preuves/audit-abonnement-prod.log` et `preuves/audit-code-classe-prod.log` (toutes deux rejouées avec succès sur la compilation).
- Les scripts synthétiques utilisent des identités fictives, des réponses réseau contrôlées et n’envoient rien à Supabase ni à Stripe.
- Ni absence d’erreur dans ces scénarios ni validation CI ne prouvent l’absence de tout bug. Les collisions et courses entre comptes sont précisément des conditions absentes des tests historiques.
