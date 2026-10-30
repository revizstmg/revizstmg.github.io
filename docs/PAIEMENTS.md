# Paiements : abonnements Premium et Ultimate (Stripe, mode test)

État au 28 octobre 2026 : **mode test uniquement**. Aucune vraie carte n'est débitée.
Prix décidés par le propriétaire (TTC) : Premium 9,99 €/mois ou 90 €/an ; Ultimate 14,99 €/mois ou 130 €/an.

## Architecture
- **Stripe (test)** : produits `revizstmg_premium` et `revizstmg_ultimate`, quatre prix retrouvés par `lookup_key`
  (`revizstmg_{premium,ultimate}_{mensuel,annuel}`), portail client configuré (résiliation en fin de période), webhook vers
  `https://wyydagcjkbivtbuhbzon.supabase.co/functions/v1/revizstmg-paiement`.
- **Supabase** : fonction `supabase/functions/revizstmg-paiement` (déployée sans vérification JWT, car le webhook Stripe n'en a pas ;
  elle vérifie elle-même le jeton du compte ou la signature Stripe) et table `revizstmg_abonnements` (migration
  `20261028090000_revizstmg_abonnements.sql`) : lecture de sa propre ligne par l'élève, écriture réservée à la fonction.
- **Site** : `src/components/Abonnement.jsx` (page `/offres`), `src/data/abonnement.js`. Les prix affichés viennent de
  `supabase/functions/revizstmg-paiement/logique.js`, la même source que le serveur.
- **Parcours** : l'élève coche « j'ai 18 ans ou l'accord de mon représentant légal » → la fonction crée une session Stripe Checkout
  → paiement chez Stripe → retour sur `#/offres?paiement=ok` → le webhook écrit l'abonnement → la page l'affiche.
- Si la fonction n'est pas déployée, la page dit « Les paiements ne sont pas encore ouverts » et n'affiche aucun bouton.
- **Aucune fonctionnalité n'est verrouillée** par l'abonnement : le contenu de chaque offre n'est pas encore décidé.

## Mise en route (à faire par le propriétaire du projet)
1. Appliquer la migration `20261028090000_revizstmg_abonnements.sql` (nouvelle table, aucune table existante modifiée).
2. Déployer la fonction `revizstmg-paiement` **avec la vérification JWT désactivée**.
3. Saisir les secrets dans Supabase → Edge Functions → Secrets (jamais dans le dépôt) :
   `STRIPE_SECRET_KEY` (clé secrète de test `sk_test_…`) et `STRIPE_WEBHOOK_SECRET` (secret de signature `whsec_…` du point
   d'entrée webhook, visible dans le tableau de bord Stripe → Développeurs → Webhooks).
4. Essayer avec la carte de test `4242 4242 4242 4242`, puis résilier depuis « Gérer mon abonnement ».

## Ce que donne chaque offre (28/10/2026)

Décision du propriétaire : **gratuit** = les cours et les exercices de base ; **Premium** = tout le reste du site (bac blanc, sujets, révision, flashcards, outils de méthode, Grand Oral, étude de gestion, notes, classe, amis…) et **chaque fonction d'IA une fois par mois** ; **Ultimate** = Premium avec l'IA presque illimitée.

- Code : `app/src/data/acces.js` (niveau du compte, liste `PAGES_PAYANTES`, quota `QUOTA_IA_MENSUEL`), `app/src/components/Reserve.jsx` (écran « Réservé aux abonnés » enveloppant toutes les routes), `reserverIA(id)` dans `app/src/data/ia.js`.
- Modifier ce qui est gratuit : ajouter ou retirer un préfixe dans `PAGES_PAYANTES` (une seule liste, testée par `tests/acces.test.js`).
- Une « utilisation » d'IA : un contrôle compte à la question (la correction est la suite), un examen personnalisé à la génération (la correction est la suite), le tuteur au début d'une discussion. Ultimate n'a pas de quota mensuel, seulement le garde-fou de 60 demandes par jour.
- L'abonnement est lu par la fonction `revizstmg-paiement` (action `etat`) et gardé sur l'appareil : sans réseau, un abonné ne perd pas son accès ; une résiliation est vue dès que le serveur répond.
- Les parcours de test simulent un élève Premium (`preparer(page, etat, { abonnement })` dans `tests/parcours/eleve.js` ; `abonnement: null` = compte gratuit).

### Période de grâce des comptes existants (décision du 29/10/2026)
Les comptes créés avant le 1er novembre 2026 gardent, sans abonnement, l'accès qu'ils ont aujourd'hui (niveau Ultimate : tous les outils, IA comme avant, 60 demandes par jour au plus) jusqu'au 30 novembre 2026. Un bandeau l'annonce sur les pages réservées. Constantes `COMPTES_ANTERIEURS_A` et `GRACE_JUSQUA` dans `supabase/functions/examen-blanc/acces.js` (copie dans `fiche-vision`), lues aussi par le site ; la date de création vient du compte (`created_at`), vérifiée par le serveur. Pour prolonger ou raccourcir la grâce : changer `GRACE_JUSQUA` et redéployer.

### Ce qu'un navigateur peut et ne peut pas contourner

- **L'IA (ce qui coûte de l'argent) : non contournable.** Le serveur (`examen-blanc` et `fiche-vision`, fichier `acces.js`) lit lui-même l'abonnement (`revizstmg_abonnements`) et compte les utilisations (`revizstmg_ia_usage`, fonctions `revizstmg_ia_reserver` / `revizstmg_ia_rendre`, réservées à la clé de service) **avant** tout appel au fournisseur. Réponses : 402 `abonnement_requis` (gratuit), 403 `quota_mensuel` (Premium : une utilisation par fonction et par mois), 429 `rate_limit` (60 par jour). La réservation est atomique (deux requêtes simultanées ne dépassent pas le quota) et rendue si le fournisseur échoue. Les étapes de suite (message suivant du tuteur, correction d'un contrôle, plan et correction d'un examen) ont un petit plafond mensuel à part (`SUITES_PREMIUM`), pour qu'on ne puisse pas les appeler sans l'étape initiale. Sans clé de service ou si la base ne répond pas, l'accès est refusé. `fiche-vision` exige désormais un compte connecté.
- **Les pages du site : on ne peut pas les cacher.** Le site est hébergé en statique (GitHub Pages) : son code et ses données sont publics, l'écran « Réservé aux abonnés » (`Reserve.jsx`) guide l'élève mais un utilisateur averti peut l'ignorer. Ce qui est réservé repose surtout sur du code et des cours déjà publics, et l'IA (la seule partie coûteuse) est verrouillée côté serveur. Verrouiller aussi les données sociales (amis, classement) demanderait de modifier les règles RLS de tables RévizSTMG existantes : non fait.
- Le compteur affiché sur l'appareil (`stmg_ia_mois`) n'est qu'un confort : le serveur a le dernier mot.

### Blocage serveur : appliqué le 29/10/2026 (avec l'accord explicite du propriétaire)
- Migration `revizstmg_ia_usage` appliquée sur le projet `wyydagcjkbivtbuhbzon` (permissions vérifiées : seuls les rôles de service réservent ou rendent une utilisation, un élève ne lit que ses compteurs, un visiteur n'a aucun accès ; aucune alerte du conseiller de sécurité Supabase).
- `examen-blanc` redéployée (version 30, `verify_jwt: true`), contrôlée fichier par fichier identique au dépôt ; l'ancienne version en ligne l'était aussi avant le changement.
- `fiche-vision` n'est toujours pas déployée : ne la déployer qu'avec `acces.js` (copie identique, vérifiée par test).
- Premier essai réel à faire par le propriétaire avec un compte non abonné créé après le 01/11/2026 (refus 402) puis avec un abonné de test (réponse normale).

