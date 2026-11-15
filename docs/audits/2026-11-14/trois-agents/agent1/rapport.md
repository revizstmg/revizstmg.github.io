# Audit indépendant 1 : comptes, navigation et social

RévizSTMG, lecture seule, 14 novembre 2026. Révision 9eea90627. Produit identique à origin/main 8af4ab15f selon cadrage du responsable. Aucune modification du produit, de données réelles ou de tests suivis. AGENTS.md, CLAUDE.md, COORDINATION lus. Trois défauts nouveaux reproduits ; autres observations distinguées ci-dessous.

## Défauts confirmés

### A1-01. Connexion indéfiniment bloquée après authentification réussie, importance 7/10

Attendu : si le profil distant ne répond pas, afficher une erreur récupérable et rendre les actions disponibles. Observé : après 65 secondes, « UN INSTANT… », boutons connexion/création/essai désactivés, aucune erreur. Auth réussie mais chargement du profil non terminé.

Reproduction : démarrer sans compte local ; intercepter GoTrue login avec réponse de succès fictive ; laisser GET `/rest/v1/profiles?...` sans réponse ; soumettre e-mail et mot de passe fictifs ; avancer horloge navigateur de 65 s. Une seule lecture de profil est lancée. Aucun serveur réel contacté.

Source : `app/src/auth.js:338` fetchProfile attend authFetch puis json sans limite temporelle ; `app/src/components/Welcome.jsx:231` à 240 attend ce profil avec busy=true. La limitation de signIn ne couvre pas cette seconde étape. Preuves : `probe.mjs`, `evidence.json` cas login_profile_silent, `login-silence.png`.

### A1-02. Corps de sauvegarde silencieux bloque toutes les sauvegardes suivantes, importance 8/10

Attendu : après délai maximal, statut échec et possibilité de reprendre à la restauration réseau. Observé : PATCH profil HTTP200 dont json ne termine pas conserve « En attente ». Après modification de la date du bac puis une seconde modification, deux fenêtres de 65 s ne déclenchent toujours qu'une requête. La dernière date reste locale, sans clôture de l'envoi ni retour d'échec. Risque de fermeture de page avec une progression non sauvegardée en ligne ; aucune preuve de perte locale.

Reproduction : compte élève fictif ; remplacer uniquement fetch PATCH profils par réponse `ok:true,status:200,json:()=>new Promise(()=>{})` ; ouvrir `/#/parametres?rubrique=revision&reglage=examen` ; modifier Date de mon bac ; avancer65 s ; modifier à nouveau ; avancer65 s. Le serveur simulé a répondu aux en-têtes, jamais au corps.

Source : `app/src/auth.js:296` à327 envoyerProgression attend authFetch et json sans borne ; `app/src/store.jsx:525` réutilise envoi.current tant que la promesse ne finit pas, libération seulement après résolution à534. Preuves : `probe.mjs`, `evidence.json` cas save_body_silent, `save-silence.png`.

### A1-03. Score de duel d'un ancien compte attribuable à l'autre compte sur appareil partagé, importance 6/10

Attendu : seuls scores enregistrés sous l'identité actuelle peuvent être renvoyés. Un ancien score global sans propriétaire doit être ignoré ou explicitement réconcilié. Observé : B n'a répondu à aucune question de son duel avec A ; l'ancienne clé globale contient le score d'A pour ce même duel. Cliquer Jouer affiche « Ton score (777 pts) est gardé ». Réessayer émet PATCH `{b_score:777,b_total:9,b_done:true}`. C'est le même duel impliquant A et B : aucune collision UUID nécessaire.

Reproduction : compte B fictif dont le serveur simulé renvoie un duel live avec A, b_done=false ; seed `localStorage.stmg_duel_scores_attente` avec `{"duel-partage":{"points":777,"correct":9}}` provenant de l'ancienne version ; aller Amis > Duels > Jouer avec Alice > Réessayer l'envoi. Observer PATCH intercepté. Aucune écriture réelle.

Source : `app/src/pages/Friends.jsx:25` à47 fusionne systématiquement ancienne clé globale et clé du compte ; `:206` à210 considère ce score comme déjà joué ; `app/src/friends.js:126` à137 écrit sur le côté courant B ; déconnexion `app/src/store.jsx:599` à610 n'efface pas cette ancienne clé. Preuves : `social.mjs`, `social-evidence.json`, `duel-legacy.png`.

## Contrôles exécutés et couverture

- Sondes originales des trois défauts ci-dessus sur Chromium, bundle compilé suivi, serveur Python4261. Toutes les adresses externes interceptées ou bloquées.
- Smoke14 vues : accueil, cours, réviser, classe, classement, boutique, paramètres à390 et1440px. Aucun débordement horizontal et aucune exception JS observée. Les alertes de sauvegarde lors du smoke sont normales : le backend simulé retourne des listes vides, ne pas les compter comme défaut de production.
- Lot ciblé Playwright comptes, OAuth, classes multiples, code parent, navigation mobile/desktop, boutique, paramètres et anciens correctifs comptes : 46 réussis, 0 échec (2 minutes). Détail dans targeted-tests.json.
- Lecture ciblée auth/session/refresh, profil/suppression, orchestration de sauvegarde, identité publique, couche réseau sociale, amis/demandes/duels et gestion de migration de codes.

## Améliorations séparées des bugs

- Importance3/10 : copie du code parent refusée par navigateur silencieuse (`Profile.jsx:70`). Afficher une aide de copie manuelle comme celle du code ami ; le code reste visible, aucune fausse confirmation observée.
- Importance5/10 : ajouter aux contrôles réseau les cas « en-têtes reçus mais corps bloqué » et « connexion rétablie après promesse pendante ». Les scénarios habituels HTTP500/rejet réseau ne suffisent pas à déceler A1-01/A1-02.

## Suspicion technique non validée en bout en bout

- `auth.js:75` à104 : refreshSession sans délai maximal et promesse _refreshing mutualisée. Une réponse de renouvellement éternellement suspendue peut rester réutilisée après retour réseau. Même famille de robustesse que A1-01/A1-02 ; pas comptée comme quatrième bug reproduit.
- `auth.js:330` à336 : suppression de compte RPC sans délai maximal. Sonde delete.mjs n'a pas atteint cette RPC (calls0), donc aucune conclusion fonctionnelle. Ne pas présenter delete-evidence.json comme preuve d'un défaut.

## Limites

Pas de certification RLS/backend distant ni vérification des données NAH, aucun vrai OAuth Google/Apple, aucun e-mail/push envoyé, aucun vrai paiement/récompense commerciale, aucun appel IA. Les tests des classes/parents/amis utilisent des profils et réponses simulés : ils vérifient interface et requêtes, pas les permissions réellement déployées. Pas de lecteur d'écran réel, téléphone physique ou clavier iOS/Android. Pas de test de charge, de transaction multiappareil réel ou de fermeture brutale avec réseau réel. L'absence d'erreur au smoke ne démontre pas l'absence de tous défauts. Les autres agents couvrent pédagogie/PDF/Avenir et fonctionnalités hors de mon périmètre.
