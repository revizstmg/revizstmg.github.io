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

## Passage en réel (à ne faire qu'après les points légaux)
- Entreprise, mentions légales et conditions de vente validées par un juriste (droit de rétractation de 14 jours, contenu numérique
  fourni immédiatement, TVA, remboursements, abonnement des mineurs). Les textes ajoutés aux CGU sont **provisoires**.
- Recréer produits, prix (mêmes `lookup_key`), portail et webhook en mode réel ; remplacer les secrets par `sk_live_…` et le
  `whsec_…` du mode réel. Le site détecte le mode via la clé et retire le bandeau « Mode test ».
- Décider du contenu de chaque offre avant de verrouiller quoi que ce soit.

## Limites connues
- Supprimer son compte supprime la ligne d'abonnement (cascade) mais **n'annule pas l'abonnement chez Stripe** : à brancher avant
  le passage en réel (annulation dans `revizstmg_supprimer_compte` ou avertissement bloquant).
- Pas de facture ni de reçu personnalisés (ceux de Stripe sont envoyés selon les réglages du compte).
- Plafond des demandes : un seul appel de paiement par clic, sans limite serveur supplémentaire.
