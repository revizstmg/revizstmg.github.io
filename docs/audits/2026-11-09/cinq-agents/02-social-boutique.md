# Audit social et boutique

9 novembre 2026. Référence auditée : `c702938bb55b3456733cd7726951b67940fcd2f4` (produit compilé précédemment publié, sans modification de code). Audit indépendant repris après interruption de la première passe.

## Couverture vérifiée

- Deux scénarios navigateur supplémentaires : sortie de classe depuis Classement ; copie du code ami lorsque le presse-papiers refuse.
- Deux sondes de logique : restauration du code de classe depuis un profil non actualisé ; réponse POST dont les en-têtes arrivent mais dont le corps reste silencieux.
- Boutique : **15 tests unitaires réussis** dans `shop.test.js` et `reward-kit.test.js`. Ils couvrent les droits/récompenses et la conservation d’Unicode dans la bibliothèque PDF. Cette exécution ne constitue pas une nouvelle vérification visuelle de chaque lot.
- Chromium avec comptes et abonnement simulés ; toutes les requêtes REST métier interceptées. Aucune inscription, adhésion, requête de modification réelle, IA, transaction financière ni message envoyé à un tiers.

## Défauts confirmés

### S1 — Sortie depuis Classement non persistante dans le profil — 6/10

**Étapes** : ouvrir `#/classement` avec un élève membre de `test-classe`, cliquer « Changer de classe », puis restaurer le même compte depuis son profil serveur inchangé.

**Observé** : le navigateur émet le DELETE de `class_member` et l’état local contient ensuite `classCode: ''`. Aucun PATCH ne remet `profiles.class_code` à null. Des PATCH de progression existent mais ne contiennent pas ce champ. La sonde de `restoreAccountState`, avec un profil conservant `class_code: 'test-classe'`, rétablit immédiatement ce code. Le chargement de Classement peut ensuite appeler `ensureMember` pour réinscrire ce compte.

**Attendu** : après suppression d’une adhésion, le code actif du profil et le choix local doivent rester cohérents lors d’une nouvelle connexion. Si le bouton a seulement pour but de choisir une autre classe, il ne doit pas supprimer silencieusement l’adhésion.

**Sources** : `app/src/pages/Leaderboard.jsx:167` (DELETE puis changement local, sans profil) ; `app/src/store.jsx:198` (profil prioritaire à la restauration) ; `app/src/store.jsx:471` (setter local seulement). Le chemin `app/src/pages/Classe.jsx:102` actualise correctement le profil : les deux comportements divergent.

**Preuves** : `/workspace/output/audit-cinq-20261109/social/resultats.json`, section `classe` ; `classe-apres-sortie.png` ; `restauration.json` (`''` avant, `test-classe` après) ; sondes reproductibles `sondes.mjs` et `restauration.mjs`.

**Précision** : l’interaction navigateur et le mécanisme de restauration sont reproduits séparément, avec données simulées. Pas de reconnexion réelle ni de réinscription sur la base de production. Une éventuelle course avec une écriture de membre déjà en vol n’a pas été reproduite : ne pas l’ajouter comme défaut confirmé.

**Correction suggérée** : réutiliser la même transition de classe que la page Classe, actualiser le profil et préserver/choisir une autre adhésion éventuelle ; gérer le changement de compte pendant l’action.

### S2 — « Copié » même lorsque le presse-papiers refuse — 3/10

**Étapes** : dans `#/amis`, remplacer l’API presse-papiers par une écriture refusée (`NotAllowedError`), cliquer « Copier le code » et regarder le libellé après 120 ms.

**Observé** : l’API refuse bien l’écriture ; le bouton affiche néanmoins **« ✓ Copié »**, et un rejet `Denied` est signalé par `pageerror`.

**Attendu** : annoncer le succès uniquement après résolution de `writeText` ; en cas d’échec, garder le code sélectionnable et donner une indication pour copier manuellement.

**Source** : `app/src/pages/Friends.jsx:148` ne fait ni `await` ni `.catch` sur la promesse. Le `try/catch` ne récupère donc pas le refus asynchrone. La page Classe traite déjà ce cas séparément.

**Preuves** : `copie-confirmation.json`, `copie-refusee-confirmee.png`, `copie-confirmation.mjs`, sous `/workspace/output/audit-cinq-20261109/social/`.

**Correction suggérée** : rendre la fonction asynchrone, attendre `navigator.clipboard.writeText`, afficher un message d’erreur/fallback et nettoyer le délai à la fermeture si nécessaire.

### S3 — Réponse POST sociale bloquée après réception des en-têtes — 6/10

**Étapes** : appeler `createGroup` avec une session fictive et un `fetch` simulé qui renvoie immédiatement HTTP 200, puis une méthode `json()` qui reste en attente.

**Observé** : la création reste en attente **après 17 001 ms**, alors que le délai réseau configuré est 15 000 ms. Aucune erreur ne remonte : `send` a libéré son délai dès la réception de la réponse, et `createGroup` lit ensuite le corps sans échéance. L’interface de gestion attend cette promesse avant son `finally` et reste occupée.

**Attendu** : la limite doit couvrir la lecture du corps et restituer le contrôle du formulaire avec une possibilité de réessai. Vérifier aussi le compte encore actif avant d’appliquer un retour tardif.

**Sources** : `app/src/reseau.js:38` à `45` ; `app/src/classroom.js:65` à `72` ; appel interface `app/src/pages/Classe.jsx:1446`. D’autres lectures POST de `friends.js` et `classroom.js` ont la même structure, mais n’ont pas toutes été reproduites individuellement.

**Preuves** : `corps-silencieux.json`, `corps-silencieux.log`, `corps-silencieux.mjs`, sous `/workspace/output/audit-cinq-20261109/social/`. Le mock intercepte tout `fetch` ; l’URL publique présente dans le journal n’a pas reçu la requête.

**Correction suggérée** : englober fetch, erreurs et lecture de corps dans une seule opération bornée ; ajouter une régression HTTP 200 + corps silencieux, sans se limiter au serveur qui ne renvoie jamais ses en-têtes.

## Limites et contrôles non exécutés

- Aucune vérification des politiques RLS réellement déployées, d’un vrai compte professeur/élève ou de Stripe. Les permissions effectives et les conséquences serveur des scénarios restent à vérifier en recette avec des comptes dédiés.
- Pas de nouvelle couverture intégrale de chaque action sociale, duel, lot ou appareil ; les trois défauts ci-dessus sont étayés, pas une garantie d’exhaustivité.
- Les sources et les journaux d’audits plus anciens ne sont pas présentés comme des tests réexécutés ici.
- Le changelog Supabase a été consulté pour cette inspection ; aucun changement Supabase ni NAH n’a été effectué.
