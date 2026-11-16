# Audit indépendant du site RévizSTMG

Date : 15 novembre 2026. Source : `08f6a79c6401b3dcb7369252aa809eb9c437fce7`. Compilation suivie testée : `8347153108807c4f81068e669ad123a245345875`.

## Résultat

Deux défauts nouveaux reproduits. Aucun correctif produit dans cet audit. Aucun compte réel, paiement, envoi de message, génération payante ou changement Supabase/NAH. Les services distants étaient simulés et les autres accès réseau bloqués. Les résultats sur erreurs réseau décrivent le client exécuté face à ces réponses simulées, pas un incident observé chez un utilisateur réel.

## BUG S1 — Retrait du suivi parental non confirmé et non repris après erreur réseau (7/10)

1. Compte élève fictif avec suivi parental actif et instantané publié sur le serveur simulé.
2. Ouvrir Paramètres → Confidentialité et données → Suivi parental.
3. Faire échouer uniquement le DELETE `child_stats`, puis désactiver le partage.
4. Rétablir le réseau simulé, émettre l’événement `online` et avancer l’horloge de 65 secondes sans recharger.

Résultat : le switch reste désactivé et affiche « Désactivé : rien n’est partagé », mais l’instantané simulé existe encore. Une seule tentative DELETE est enregistrée ; aucun nouvel essai au retour réseau. La prochaine ouverture peut retenter : le défaut porte sur la période avant rechargement et sur l’affirmation de retrait malgré l’échec.

Source : `app/src/store.jsx:331` à l’effet de retrait ; résultat booléen de `deleteMyChildStats()` ignoré. `app/src/parent.js:97` renvoie `false` en cas d’échec. Le correctif antérieur sur POST suspendu n’est pas remis en cause : il traite un autre scénario.

Preuves : `parent-revoke-offline.json`, `parent-revoke-offline.png`. Reproduction : `probe-parent.mjs`.

Amélioration attendue : mémoriser un retrait en attente par compte, reprendre au retour réseau, distinguer partage local désactivé et retrait distant confirmé. Ne pas réactiver le partage lors de la reprise.

## BUG S2 — Suppression de compte suspendue sans limite de temps (6/10)

1. Compte fictif, ouvrir Paramètres → Confidentialité et données → Suppression.
2. Simuler une réponse normale du préalable paiement, puis garder pendante la requête RPC `revizstmg_supprimer_compte`.
3. Confirmer la suppression et avancer l’horloge de 65 secondes après réception de cette requête.

Résultat : bouton toujours désactivé, « Un instant… » affiché, aucun message d’erreur ni possibilité de relancer dans cette vue ; session conservée. Lorsque le serveur simulé finit par répondre 200, la session est retirée et la page change : le blocage correspond bien à cette requête.

Source : `app/src/auth.js:330` (`supprimerCompte`, appel `authFetch` non borné), `app/src/pages/Profile.jsx:74` (attente avec état occupé).

Preuves : `delete-rpc-silent.json`, `delete-rpc-silent.png`. Reproduction : `probe-delete.mjs`. Les erreurs de sélecteur des premières sondes figurant dans `delete-probe.log` ne sont pas des défauts produit ; les deux preuves citées proviennent de la sonde corrigée.

Amélioration attendue : délai réseau borné et message clair avec état occupé libéré, sans annoncer une suppression non confirmée. Distinguer délai expiré et échec certain : la requête peut avoir abouti côté serveur.

## Couverture réalisée

- 82 ouvertures indépendantes, quatre profils (élève Terminale, élève Première, professeur, parent), largeurs 360/390/1280/1440 px. Aucun débordement horizontal, page 404 inattendue ou exception JavaScript relevé dans ce lot. Détail par vue : `smoke.json`, protocole : `smoke.mjs`.
- Rubriques sondées : accueil, cours, chapitre, langues, révisions, bac blanc, excellence économique, EPS, flashcards/révision, formules, Grand oral, notes, Avenir, parcours, vacances, classe, amis, boutique, classement, paramètres, favoris, guide, FAQ et pages légales. Une ouverture sans erreur ne certifie pas toutes les interactions de la rubrique.
- Suite navigateur terminée :422réussites et5échecs sur427, sans compte réel. B07 a réussi isolément ; les autres reprises sont documentées dans les corrections du16novembre. Les échecs initiaux restent dans le bilan et ne sont pas effacés par une reprise ultérieure.
- Aucune modification de fichier suivi ; seul lien `app/node_modules` préexistant à l’audit demeure non suivi.

## Améliorations et limites

- Faible priorité : fournir un retour explicite si la copie du code parent dans le presse-papiers échoue (`Profile.jsx`, `copyParentCode`). Le catch est silencieux ; connu d’un audit précédent, non compté comme nouveau bug.
- La vérification pédagogique exhaustive de chaque question, définition ou PDF n’a pas été effectuée. Les références des programmes et la qualité des corrigés nécessitent une relecture pédagogique dédiée.
- Les vrais parcours OAuth Google, abonnements, délivrance réelle des avantages, IA, permissions Supabase et appareil physique ne sont pas validés par ce lot fictif. Les agents distincts services et dépôt couvrent leurs périmètres complémentaires.
