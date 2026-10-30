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
Les comptes créés avant le 30 octobre 2026 (00:00 UTC) gardent, sans abonnement, l'accès qu'ils ont aujourd'hui (niveau Ultimate : tous les outils, IA comme avant, 60 demandes par jour au plus) jusqu'au 30 novembre 2026. Un bandeau l'annonce sur les pages réservées. Constantes `COMPTES_ANTERIEURS_A` et `GRACE_JUSQUA` dans `supabase/functions/examen-blanc/acces.js` (copie dans `fiche-vision`), lues aussi par le site ; la date de création vient du compte (`created_at`), vérifiée par le serveur. Pour prolonger ou raccourcir la grâce : changer `GRACE_JUSQUA` et redéployer.

### Ce qu'un navigateur peut et ne peut pas contourner

- **L'IA (ce qui coûte de l'argent) : non contournable.** Le serveur (`examen-blanc` et `fiche-vision`, fichier `acces.js`) lit lui-même l'abonnement (`revizstmg_abonnements`) et compte les utilisations (`revizstmg_ia_usage`, fonctions `revizstmg_ia_reserver` / `revizstmg_ia_rendre`, réservées à la clé de service) **avant** tout appel au fournisseur. Réponses : 402 `abonnement_requis` (gratuit), 403 `quota_mensuel` (Premium : une utilisation par fonction et par mois), 429 `rate_limit` (60 par jour). La réservation est atomique (deux requêtes simultanées ne dépassent pas le quota) et rendue si le fournisseur échoue. Les étapes de suite (message suivant du tuteur, correction d'un contrôle, plan et correction d'un examen) ont un petit plafond mensuel à part (`SUITES_PREMIUM`), pour qu'on ne puisse pas les appeler sans l'étape initiale. Sans clé de service ou si la base ne répond pas, l'accès est refusé. `fiche-vision` exige désormais un compte connecté.
- **Les pages du site : on ne peut pas les cacher.** Le site est hébergé en statique (GitHub Pages) : son code et ses données sont publics, l'écran « Réservé aux abonnés » (`Reserve.jsx`) guide l'élève mais un utilisateur averti peut l'ignorer. Ce qui est réservé repose surtout sur du code et des cours déjà publics, et l'IA (la seule partie coûteuse) est verrouillée côté serveur. Verrouiller aussi les données sociales (amis, classement) demanderait de modifier les règles RLS de tables RévizSTMG existantes : non fait.
- Le compteur affiché sur l'appareil (`stmg_ia_mois`) n'est qu'un confort : le serveur a le dernier mot.

### Blocage serveur : appliqué le 29/10/2026 (avec l'accord explicite du propriétaire)
- Migration `revizstmg_ia_usage` appliquée sur le projet `wyydagcjkbivtbuhbzon` (permissions vérifiées : seuls les rôles de service réservent ou rendent une utilisation, un élève ne lit que ses compteurs, un visiteur n'a aucun accès ; aucune alerte du conseiller de sécurité Supabase).
- `examen-blanc` redéployée (version 30, `verify_jwt: true`), contrôlée fichier par fichier identique au dépôt ; l'ancienne version en ligne l'était aussi avant le changement.
- `fiche-vision` n'est toujours pas déployée : ne la déployer qu'avec `acces.js` (copie identique, vérifiée par test).
- Premier essai réel à faire par le propriétaire avec un compte non abonné créé après le 30/10/2026 (refus 402) puis avec un abonné de test (réponse normale).
### Après la relecture par trois agents (29/10/2026) : ce qui a été ajouté
- **Abonnement de test ≠ abonnement réel.** Le serveur de paiement ignore une ligne dont `mode_test` ne correspond pas au mode de la clé Stripe (test ou réel) et n'applique pas les événements du mode opposé ; `examen-blanc` et `fiche-vision` refusent les lignes de test quand le secret **`ACCES_REFUSE_TEST=1`** est réglé. **À régler au passage en réel**, en même temps que la clé `sk_live_…`, puis remettre à zéro les lignes de test : `update revizstmg_abonnements set statut='aucun', offre=null, periode=null, periode_fin=null, stripe_subscription_id=null, stripe_customer_id=null where mode_test;`
- **Suppression de compte** : le site appelle d'abord l'action `resilier` de `revizstmg-paiement` (abonnement résilié tout de suite chez Stripe) et arrête la suppression si cela échoue ; un webhook qui arrive pour un compte supprimé résilie l'abonnement et répond 200.
- **Webhook** : l'état de l'abonnement est relu chez Stripe à chaque événement (ordre non garanti), un ancien abonnement n'écrase pas un abonnement actif, et un second abonnement est refusé au paiement (contrôle aussi chez Stripe). Clé d'idempotence pour la création du client. `etat` ne renvoie plus les identifiants Stripe. **Non géré** : litiges et remboursements faits dans Stripe (résilier l'abonnement à la main depuis le tableau de bord ; le webhook mettra l'accès à jour).
- **Coût** : plafonds journaliers par fonction (`JOUR_PAR_FONCTION` : examen 20, excellence 10, étude 15, photo 15) en plus des 60 par jour ; les compteurs journaliers ne sont jamais rendus (un échec provoqué en boucle ne contourne pas les plafonds) ; seules les utilisations du mois sont rendues en cas d'échec.
- **`fiche-vision`** : clé du fournisseur dans un en-tête (plus dans l'URL), aucun détail d'erreur renvoyé au navigateur, délais, taille maximale et types d'image limités.
- **Site** : adresses comparées sans casse ni encodage (`/Bac-Blanc` ne contourne plus l'écran), délai de 8 s sur la lecture de l'abonnement, relecture à l'ouverture d'une page réservée et bouton « Vérifier à nouveau mon abonnement » (webhook en retard), compteur mensuel par compte, pas de refus local tant que l'abonnement n'a jamais été lu, tolérance de trois jours hors ligne, repères « Premium » sur les liens réservés, entrée « Mon abonnement » dans le menu, prix sur la page des offres, textes devenus faux corrigés (FAQ, CGU, confidentialité, boutique, guide, descriptions publiques).
- **À décider par le propriétaire / un juriste** : statut de l'éditeur (la mention « élèves, à titre non professionnel et non commercial » est incompatible avec la vente), TVA et « TTC », médiateur, remboursement au prorata et retrait de 14 jours (exécution immédiate d'un service numérique), `past_due` qui garde l'accès (régler Stripe pour annuler après échec des relances), accès des professeurs, pages `/badges`, `/coach`, `/coach-ia` et `/fiches-photo` aujourd'hui réservées.

## Passage en réel (à ne faire qu'après les points légaux)
- Entreprise, mentions légales et conditions de vente validées par un juriste (droit de rétractation de 14 jours, contenu numérique
  fourni immédiatement, TVA, remboursements, abonnement des mineurs). Les textes ajoutés aux CGU sont **provisoires**.
- Recréer produits, prix (mêmes `lookup_key`), portail et webhook en mode réel ; remplacer les secrets par `sk_live_…` et le
  `whsec_…` du mode réel. Le site détecte le mode via la clé et retire le bandeau « Mode test ».
- Régler le secret `ACCES_REFUSE_TEST=1` sur `examen-blanc` et `fiche-vision` et remettre à zéro les lignes `mode_test` (voir « Après la relecture »).
- Le contenu de chaque offre est décidé (voir « Ce que donne chaque offre ») ; vérifier qu'il correspond à ce que les CGU annoncent.

## Limites connues
- Supprimer son compte : le site résilie d'abord l'abonnement chez Stripe (action `resilier`) et arrête la suppression si cela échoue ; un compte supprimé hors du site (par exemple directement dans Supabase) n'est pas résilié automatiquement, sauf quand Stripe envoie un événement (le webhook résilie alors l'abonnement).
- Pas de facture ni de reçu personnalisés (ceux de Stripe sont envoyés selon les réglages du compte).
- Plafond des demandes : un seul appel de paiement par clic, sans limite serveur supplémentaire.
- Litiges et remboursements faits dans Stripe : l'accès n'est pas coupé automatiquement (résilier l'abonnement à la main).
