# Contre-audit indépendant transversal du 30 octobre 2026

## Conclusion

Aucun défaut confirmé à ce stade dans les vérifications ci-dessous. Ce résultat porte sur les parcours effectivement exécutés et les simulations décrites ; il ne certifie ni les intégrations de production ni toutes les combinaisons de navigateur, de langue et de rôle.

## Version et méthode

- Worktree détachée `/workspace/work/contre-audit-transversal`, compilation publiée `a0ba33ca5473842649bbf5aa3da5fd56cdf2dac9`, source `cbfda015` (#153), servie depuis sa racine par HTTP local sur 4189.
- Consignes AGENTS.md, CLAUDE.md et docs/COORDINATION.md lues. Aucun rapport nouveau d’un autre auditeur consulté. Aucun fichier applicatif modifié, aucune correction, aucun commit ni PR.
- Chromium Playwright, un worker et un navigateur à la fois pour les vérifications achevées. Une première invocation complémentaire a été interrompue avant toute assertion pour retirer son chevauchement initial avec la matrice ; ses scénarios non exécutés ne sont pas comptés. La suite a ensuite été relancée intégralement.
- Fixtures `app/tests/parcours/eleve.js` : identités, stockage et jetons fictifs, toutes les destinations externes bloquées, réponses paiement simulées. Aucun compte, mail, paiement, micro ou appel IA réel ; aucun accès réel à Supabase.
- Référence CI fournie par le coordinateur, non relancée : 688 tests UTC/Paris et 349 parcours. Les vérifications décrites ici ont été réalisées séparément.

## Couverture contrôlée

### Matrice originale de 45 vues

Quinze chemins par contexte : accueil, cours, révision, bac blanc, classe, amis, boutique, badges, moi, paramètres, apparence/langue, application, offres, CGU, confidentialité.

| Largeur | Langue et sens observés | Thème | Rôle synthétique | Abonnement simulé |
|---|---|---|---|---|
|1280|fr / ltr|clair|élève|Premium|
|390|de / ltr|sombre|professeur|Ultimate|
|320|ar / rtl|sombre|champ rôle parent avec profil et filière d’élève conservés|gratuit|

Sur ces 45 instantanés : aucun débordement horizontal, aucune exception JavaScript remontée, aucune violation axe WCAG A/AA dans `main`. Les titres paramètres/offres/juridique sont traduits et le document arabe est RTL. Les pages payantes testées sont fermées pour le compte gratuit. Le contexte marqué parent n’est pas une certification du parcours parent seul : il conserve volontairement la fixture d’élève et aucun enfant réel n’est lié.

Limite importante : instantanés après 500 ms, certains écrans paresseux (notamment bac blanc) encore en chargement ; le succès axe ne couvre donc pas nécessairement leur contenu final. Pas de relecture linguistique humaine de l’allemand ou de l’arabe. Les contrôles `main` n’équivalent pas à un audit exhaustif des en-têtes, pieds de page et lecteurs d’écran.

Preuves : `/workspace/work/transversal.mjs`, `/workspace/work/transversal-results.json`.

### 22 parcours ciblés réussis

Exécution intégrale : 22 réussis en 2,2 min, sans retry (`transversal-tests.log`).

- Clavier : menu mobile Entrée/Tab/Maj+Tab/Échap avec restitution du focus ; sélecteur de langue ordinateur ; exercice plein écran avec capture du focus et fermeture ; bouton atelier visible au-dessus de la navigation.
- Offres/paiement simulé : service absent, consentement majeur obligatoire, charge utile Premium mensuel exacte, état Ultimate annuel et portail, retour paiement confirmé ; axe et absence de débordement à 320px clair et sombre.
- Session absente : invitation à se reconnecter sans requête sociale anonyme.
- Paramètres : modification synthétique photo/profil, validation et changement simulé de mot de passe, grand texte, persistance au rechargement ; rubriques et navigation, rendu traduit FR/EN/DE/AR ; mode système et préférences conservées.
- Onglets : déplacement tactile, annulation, ordre conservé, raccourci clavier.
- Récompense : attribution unique, PDF téléchargé, objets conservés après rechargement.
- Révision : destination vers les matières et accès aux cours.

Sources contrôlées : `app/tests/parcours/clavier.spec.js`, `paiement.spec.js`, `parametres-recompenses.spec.js`, `parametres-rubriques.spec.js` ; commandes et configuration : `/workspace/work/transversal-playwright.config.mjs`. Artefacts : `/workspace/work/transversal-test-results/`.

### Contrôle interactif original et PWA

Menu à 320px :35 Tab successives restent dans la fenêtre ; Échap rend le focus au déclencheur. Mot de passe faible : message attendu «8 caractères minimum, avec des lettres et des chiffres. ».

Dans les paramètres Application, le vrai service worker local est contrôleur et le cache `revizstmg-be208d6fd3` est présent ; le statut annonce explicitement les cours téléchargés. Après `context.setOffline(true)`, les pages Cours, Révision, Paramètres et CGU s’affichent ; un rechargement complet des CGU fonctionne. Aucune exception. L’instantané du Bac blanc pris après 250 ms montrait « Chargement du cours… » : ce seul délai n’est pas un défaut et ne permet pas de certifier le bac hors ligne.

Sources : `sw.js:40` (installation atomique et cache complet), `sw.js:79` (message OFFLINE_STATUS), `app/src/components/OfflineStatus.jsx:6` (vérification de version et texte conditionnel), `app/src/components/clavier.js:23` (focus et fermeture), `app/src/pages/Settings.jsx:43` (validation mot de passe). Preuves : `/workspace/work/transversal-extra.mjs`, `/workspace/work/transversal-extra-results.json`.

## Constats prouvés et risques

Aucun constat de gravité critique, élevée, moyenne ou faible démontré dans cette couverture. Aucun quota de défauts imposé. Les limites suivantes sont des éléments non vérifiés, pas des anomalies prouvées :

- Paiement et portail Stripe réels, webhook, facturation, résiliation réelle et correspondance de l’état appliqué en production : simulations seulement.
- Droits serveur et quotas IA réellement appliqués, historique des codes et contraintes de production : non inspectés ; aucune modification de base/configuration. Le navigateur garde un état d’accès par identité (`app/src/data/acces.js:89`), avec garde contre les réponses anciennes à 99 ; cela ne prouve pas l’état du serveur.
- Installation native iOS/Android, notifications push, synchronisation périodique et comportement système : non exercés.
- Lecteur d’écran réel, zoom 200/400%, contraste de tous les états interactifs, qualité des traductions : non certifiés par axe.
- Parcours parent sans filière, liaison réelle d’enfant, classe/professeur réelle et données sociales multiutilisateur : non exercés.
- Lecture audio réelle, permission micro réelle, réseau cellulaire physique et navigation Safari/Firefox : non exercés.

## Complément audio, identité et réponses lentes

Six scénarios distincts supplémentaires exécutés (`audit-dix-correctifs.spec.js`, filtre `audio|paiement|abonnement`) : cinq réussis au premier passage, un réussi au rejeu isolé. Total : 28 scénarios ciblés distincts réussis au moins une fois, dont 27 au premier passage.

- Audio : focus capturé/restitué, Échap ferme, fermeture entre deux cartes annule la suivante ; Pause/Suivant/Jouer ne relance pas l’ancien délai dans le rejeu isolé.
- Réponse paiement de A après déconnexion : aucune redirection tardive.
- Changement d’identité : offre et consentement repartent de l’état du nouveau compte.
- Chargement paiement lent : délai borné et reprise disponible.

Écart de test documenté, non classé défaut produit : « audio : Pause/Suivant/Jouer » expire une fois au clic Suivant. Le snapshot montre déjà la carte 2/2 et un bouton Suivant désactivé. Le scénario demande Pause entre deux cartes en temps réel (avancement automatique après 500 ms) ; le premier clic a vraisemblablement été exécuté après cet avancement sous charge. Le rejeu identique isolé réussit en 5,7 s, sans modification de code ni d’assertion. Cette observation ne démontre pas une régression audio ; la dépendance temporelle du scénario reste à surveiller. Preuves : `/workspace/work/transversal-delays.log`, `/workspace/work/transversal-audio-replay.log`, snapshot `/workspace/work/transversal-test-results/audit-dix-correctifs-audio-9689d-éactive-pas-un-ancien-délai/error-context.md` (l’artefact a pu être nettoyé par le rejeu ; log initial conservé).

## Stabilisation finale du hors ligne

Le second contrôle original attend explicitement la disparition de « Chargement du cours » avant de lire les pages. Le Bac blanc affiche alors bien « RÉVIZSTMG · LA SALLE D’EXAMEN / Bac blanc » avec le réseau coupé. Les cinq destinations et le rechargement CGU réussissent encore, sans exception. Cela lève la réserve de chargement pour la page d’entrée Bac blanc, sans certifier les appels IA ni toutes les épreuves hors ligne. Preuves : `/workspace/work/transversal-extra-stable.mjs` et `/workspace/work/transversal-extra-stable-results.json`.
