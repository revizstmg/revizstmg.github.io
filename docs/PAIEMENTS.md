# Paiements : abonnements Premium et Ultimate (Stripe, mode test)

État au 28 octobre 2026 : **mode test uniquement**. Aucune vraie carte n'est débitée.
## Grille validée le 7 novembre 2026

- Premium : **9,99 € TTC/mois** ; Ultimate : **19,99 € TTC/mois**, sans engagement.
- Go : exclusivement sur devis pour les lycées, **20 €/élève/an + 500 €/établissement/an**. Aucun achat Go individuel.
- Les nouvelles souscriptions annuelles sont retirées. Les abonnements historiques (dont Ultimate à 14,99 €/mois et les anciens annuels) restent reconnus et gérables, sans migration automatique.
- Le nouveau prix Ultimate utilise `revizstmg_ultimate_mensuel_1999`. À la première demande authentifiée de souscription, le serveur crée si nécessaire ce prix sur le produit existant, avec idempotence, sans transférer ni modifier les anciennes clés. Il vérifie montant, devise et périodicité avant Checkout ; une incohérence bloque l’achat.
- `GET ?check=tarifs` expose uniquement la grille et le mode de paiement, sans création Stripe ni donnée personnelle.
- Les droits d’accès et quotas IA ne sont pas modifiés par cette mise à jour.

Les sections datées ci-dessous documentent aussi le fonctionnement historique.

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

Décision du propriétaire : **gratuit** = les cours, les exercices de base, les amis, la boutique et la classe (décision du 31 octobre 2026) ; **Premium** = les fonctions réservées de `PAGES_PAYANTES` (bac blanc, sujets, révision, flashcards, outils de méthode, Grand Oral, étude de gestion, notes…) et **chaque fonction d'IA une fois par mois** ; **Ultimate** = Premium avec l'IA presque illimitée.

- Code : `app/src/data/acces.js` (niveau du compte, liste `PAGES_PAYANTES`, quota `QUOTA_IA_MENSUEL`), `app/src/components/Reserve.jsx` (écran « Réservé aux abonnés » enveloppant toutes les routes), `reserverIA(id)` dans `app/src/data/ia.js`.
- Modifier ce qui est gratuit : ajouter ou retirer un préfixe dans `PAGES_PAYANTES` (une seule liste, testée par `tests/acces.test.js`).
- Une « utilisation » d'IA : un contrôle compte à la question (la correction est la suite), un examen personnalisé à la génération (la correction est la suite), le tuteur au début d'une discussion. Ultimate n'a pas de quota mensuel, seulement le garde-fou de 60 demandes par jour.
- L'abonnement est lu par la fonction `revizstmg-paiement` (action `etat`) et gardé sur l'appareil : sans réseau, un abonné ne perd pas son accès ; une résiliation est vue dès que le serveur répond.
- Les parcours de test simulent un élève Premium (`preparer(page, etat, { abonnement })` dans `tests/parcours/eleve.js` ; `abonnement: null` = compte gratuit).

### Période de grâce des comptes existants (décision du 29/10/2026)
Les comptes créés avant le 30 octobre 2026 (00:00 UTC) gardent, sans abonnement, l'accès qu'ils ont aujourd'hui (niveau Ultimate : tous les outils, IA comme avant, 60 demandes par jour au plus) jusqu'au 30 novembre 2026. Un bandeau l'annonce sur les pages réservées. Constantes `COMPTES_ANTERIEURS_A` et `GRACE_JUSQUA` dans `supabase/functions/examen-blanc/acces.js` (copie dans `fiche-vision`), lues aussi par le site ; la date de création vient du compte (`created_at`), vérifiée par le serveur. Pour prolonger ou raccourcir la grâce : changer `GRACE_JUSQUA` et redéployer.

### Ce qu'un navigateur peut et ne peut pas contourner

- **L'IA (ce qui coûte de l'argent) : non contournable.** Le serveur (`examen-blanc` et `fiche-vision`, fichier `acces.js`) lit lui-même l'abonnement (`revizstmg_abonnements`) et compte les utilisations (`revizstmg_ia_usage`, fonctions `revizstmg_ia_reserver` / `revizstmg_ia_rendre`, réservées à la clé de service) **avant** tout appel au fournisseur. Réponses : 402 `abonnement_requis` (gratuit), 403 `quota_mensuel` (Premium : une utilisation par fonction et par mois), 429 `rate_limit` (60 par jour). La réservation est atomique (deux requêtes simultanées ne dépassent pas le quota) et rendue si le fournisseur échoue. Les étapes de suite (message suivant du tuteur, correction d'un contrôle, plan et correction d'un examen) ont un petit plafond mensuel à part (`SUITES_PREMIUM`), pour qu'on ne puisse pas les appeler sans l'étape initiale. Sans clé de service ou si la base ne répond pas, l'accès est refusé. `fiche-vision` exige désormais un compte connecté.
- **Les pages du site : on ne peut pas les cacher.** Le site est hébergé en statique (GitHub Pages) : son code et ses données sont publics, l'écran « Réservé aux abonnés » (`Reserve.jsx`) guide l'élève mais un utilisateur averti peut l'ignorer. Ce qui est réservé repose surtout sur du code et des cours déjà publics, et l'IA (la seule partie coûteuse) est verrouillée côté serveur. Verrouiller aussi les données du classement demanderait de modifier les règles RLS de tables RévizSTMG existantes : non fait.
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

### Après les six agents testeurs (02/11/2026) : corrections
Décisions du propriétaire : garder le meilleur niveau pendant la grâce, réserver aux abonnés les outils de l'onglet « Outils » d'un thème (bac blanc du thème, paquet de flashcards, notes), adapter les liens des pages gratuites, prouver l'étape initiale d'une suite.
- **Grâce** : `niveauCompte` prend le meilleur de l'abonnement et de la grâce (un ancien compte qui paie Premium garde Ultimate jusqu'au 30/11).
- **Suites** (message suivant du tuteur, correction d'un contrôle ou d'un examen) : acceptées seulement si l'étape initiale de la même fonction est comptée ce mois-ci (lecture de `revizstmg_ia_usage` côté serveur), en plus de leur petit plafond. Le plan d'un examen reste dispensé de cette preuve. Une discussion commencée un mois et poursuivie le suivant doit être recommencée.
- **Plafonds journaliers** : celui de la fonction est réservé avant le compteur global `_jour`, un refus ne brûle donc plus les 60 demandes des autres fonctions.
- **Double abonnement** (deux onglets, session de paiement restée ouverte) : le webhook résilie le second s'il y a déjà un abonnement actif chez Stripe (journal `abonnement_double_resilie`, remboursement du premier prélèvement à faire à la main dans Stripe) ; `resilier` annule tous les abonnements actifs du client ; les sessions Checkout expirent après 30 minutes.
- **Export RGPD** : « Télécharger mes données » ajoute l'abonnement et les compteurs d'utilisation de l'IA (action `etat`).
- **Repli « course » du contrôle** : le site ne compte plus l'utilisation du mois (le serveur la rend).
- Pas de nouveau code d'erreur pour le plafond journalier : le message « patiente » du site reste, il se lève le lendemain.

### Après les dix vérificateurs (03/11/2026) : corrections
- **Quotas IA** : une suite accepte la preuve du mois courant ou du précédent ; les plans d'examen ont un plafond mensuel à part (12) ; plafonds journaliers ajoutés pour la série et le contrôle (20) ; une réponse inutilisable (hors sujet, JSON invalide) ne rend l'utilisation du mois qu'une fois par jour et par fonction ; le repli sans IA d'un contrôle compte comme l'étape initiale, la correction qui suit passe.
- **Webhook Stripe** : si la lecture du premier abonnement échoue (hors « introuvable »), l'erreur est relancée (Stripe rejoue) au lieu d'écraser ; le second abonnement résilié est remboursé au mieux (journal `abonnement_double_resilie`, champ `remboursement`) ; `resilier` supprime aussi le client Stripe du compte.
- **Migration** `20261102120000_revizstmg_securite_4_classe_mur_duels.sql` (mur de classe, anonymat via `revizstmg_mur`, membres, exclusion et classement, suppression d'un compte professeur, duels et demandes d'ami) : à appliquer APRÈS la mise en ligne du nouveau site (l'ancien client ne lit plus `class_wall` directement) ; testée sur Postgres local par `supabase/tests/lancer.sh`.
- **Site** : bandeau de session expirée, copie de secours effacée à la déconnexion, correction des traductions et des textes d'offres, exercices et contenus (voir l'historique git).
- **Reste à décider** (propriétaire) : mentions légales (« non commercial », rétractation, remboursement à la suppression, seuil d'âge), traductions à faire relire par des natifs, vouvoiement de ~350 chaînes de l'interface allemande.

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
