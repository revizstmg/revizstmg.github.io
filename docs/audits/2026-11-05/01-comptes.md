# Audit indépendant : comptes, parents, offres et sauvegarde

Base figée : `79d4fa01e8c05addd7dc1d33fbaebce9368b37a9`, application après les huit correctifs de PR179. Compilation partagée en lecture seule, port4301. Comptes et réponses synthétiques, réseau extérieur bloqué. Aucun changement produit ni service réel.

Notes de priorité :1 retouche mineure,4 confort,6 amélioration d’un parcours important,8 fiabilité/confidentialité ou préparation de la vente,10 panne critique établie. La note est un jugement de priorité, pas une mesure de gravité juridique.

## Points proposés

### AC01 · 9/10 · Finaliser les conditions avant les premiers paiements réels

**Type : préparation commerciale, constat documentaire ; pas une panne actuelle.** `app/src/pages/Cgu.jsx:21` présente encore l’éditeur comme élève non professionnel/non commercial. La section Abonnements est explicitement une version de test et son droit de rétractation est provisoire (`:55`). `docs/PAIEMENTS.md:78` demande encore validation du statut, conditions de vente, TVA, rétractation et remboursement à la suppression. Les écrans test sont correctement annoncés dans les scénarios contrôlés.

**Pourquoi9 :** ces décisions conditionnent l’encaissement et la confiance des parents. **Action :** valider le cadre avec une personne compétente, compléter les informations correspondant au statut retenu, préciser rétractation/service commencé/remboursements et achat d’un mineur ; conserver le mode test jusqu’à cette étape. **Effort : moyen à élevé**, avec décision du propriétaire. Aucun avis juridique définitif n’est donné ici.

### AC02 · 9/10 · Faire une recette serveur de précommercialisation et enregistrer les versions déployées

**Type : contrôle restant à certifier, pas une vulnérabilité de production démontrée.** `docs/PAIEMENTS.md:74` mentionne encore une migration de sécurité à appliquer et `:83` le refus des abonnements de test au passage réel. Les instructions de déploiement Edge sont également encore présentes dans la coordination. Des simulations de paiement réussies ne prouvent pas ces états.

**Pourquoi9 :** accès entre élèves, facturation et coûts de l’aide automatique doivent être contrôlés avant vente. **Action :** recette explicitement autorisée avec deux élèves, un professeur et un visiteur ; vérification RLS, versions Edge, quotas, paiement test, webhook retardé, résiliation/remboursement et suppression. Publier un journal daté avec les versions et les résultats, sans identifiants clients. **Effort : moyen.** Aucun secret, SQL ou déploiement réel n’a été touché par cet audit.

### AC03 · 8/10 · Annuler un export en cours quand le compte change

**Type : bug reproduit avec comptes synthétiques.** `app/src/pages/Profile.jsx:25` capture l’état au clic, attend l’état de paiement, puis fabrique le téléchargement sans garde d’identité supplémentaire. La fonction de paiement, elle, détecte un compte différent ; le catch transforme toute erreur en `abonnement_indisponible` puis continue l’export.

**Reproduction confirmée :** lancer le téléchargement sous A, retenir la réponse de paiement, changer la session du navigateur vers B, puis libérer la réponse. Un fichier dont `donnees.account.id` vaut A arrive après la transition ; aucun serveur réel n’a été utilisé. Il s’agit d’une exportation commencée par A qui doit être annulée lors du changement de session, pas d’une intrusion entre comptes distants.

**Action :** capturer l’identifiant au départ et vérifier session/compte après l’attente et avant la création du fichier ; annuler silencieusement après déconnexion/changement de compte. Ne pas transformer une erreur d’identité en simple absence de paiement. **Effort : faible.** Un fichier demandé avant une transition ne doit pas arriver dans la nouvelle session.

### AC04 · 7/10 · Compléter l’export des brouillons et dire ce qui est inclus

**Type : limitation confirmée par code et sonde de téléchargement.** L’export de `Profile.jsx:26` sérialise seulement le store, puis ajoute abonnement/usage. Les brouillons d’examen et le trio EPS utilisent leurs propres clés (`data/examenPersonnalise.js:46`, `data/epsPreparation.js:93`) ; ils n’y sont pas lus. Les contributions serveur propres au compte ne sont pas récupérées non plus.

**Sonde confirmée :** deux sentinelles placées dans les clés locales d’examen et d’EPS du compte courant sont absentes du JSON téléchargé ; le code ne lit que le store et les informations de paiement. Les contributions serveur non incluses sont un constat de code, pas une collecte réelle.

**Pourquoi7 :** «Télécharger mes données» peut être pris pour une sauvegarde complète alors que des préparations sont locales à cet appareil. **Action :** inventaire versionné des données de l’application, export des brouillons du compte courant et des données serveur personnelles pertinentes, manifeste indiquant les sections disponibles/manquantes. Éviter toute copie de données d’autres comptes ou élèves. **Effort : moyen.** Ne pas promettre une restauration si aucune fonction d’import n’est fournie.

### AC05 · 7/10 · Confirmer la publication du partage parent

**Type : bug de retour utilisateur reproduit.** Le store publie après3s puis absorbe l’erreur (`app/src/store.jsx:323`), alors que le réglage affiche déjà le code à communiquer. En cas de refus réseau, les parents peuvent recevoir un code non encore connu du serveur.

**Reproduction confirmée :** le POST synthétique `child_stats` retourne503. Le partage reste coché, le code est affiché et aucun avertissement de publication n’apparaît dans le contenu principal. Cela ne prouve pas que le service réel refuse la publication.

**Action :** état «partage en attente / publié / échec», bouton Réessayer, conserver le consentement et le brouillon sans prétendre qu’un code est utilisable tant que la publication n’est pas confirmée. Le retrait doit toujours rester disponible. **Effort : moyen.** Ce point est distinct de l’ancienne boucle de lecture Parent, déjà corrigée.

### AC06 · 6/10 · Distinguer une matière non évaluée d’une difficulté

**Type : amélioration pédagogique étayée par code et reproduction synthétique.** `store.jsx:1008` envoie toutes les matières avec score0 par défaut. `Parent.jsx:32` classe tout score inférieur à55 dans «À renforcer», sans savoir si la matière a été tentée. Un nouvel élève peut donc être présenté comme faible dans des matières jamais travaillées.

**Reproduction confirmée :** un enfant synthétique à zéro exercice affiche «À RENFORCER» avec «Management ·0%» et «Droit ·0%». Le premier contrôle comparait une casse différente ; seule son attente a été corrigée puis rejouée, sans changement produit.

**Action :** ajouter nombre d’exercices/chapitres évalués et un état «pas encore évalué» ; calculer points forts/faibles seulement sur des résultats existants ; préciser que ce pourcentage ne correspond pas à une note scolaire. **Effort : moyen.** Le problème n’est pas le calcul de la progression globale, mais l’interprétation donnée au parent.

### AC07 · 6/10 · Réparer les liens d’exercice des droits dans la confidentialité

**Type : mauvais chemin de navigation reproduit, avec action encore accessible ailleurs.** `Privacy.jsx:99` et`:100` envoient vers `/moi` en parlant de boutons Supprimer/Télécharger. Ceux-ci sont dans la section masquée tant que les réglages ne sont pas ouverts (`Profile.jsx:260`). Les paramètres structurés disposent désormais d’adresses directes.

**Reproduction confirmée :** le lien «Mon espace» de Confidentialité aboutit à `/#/moi`, où les boutons Télécharger/Supprimer ne sont pas affichés.

**Action :** lier vers `/parametres?rubrique=donnees&reglage=suppression` et `...&reglage=export` ; rectification vers `rubrique=compte&reglage=profil`. Vérifier aussi le guide et la FAQ pour les anciens chemins. **Effort : faible.** L’utilisateur peut retrouver les actions via Réglages, mais le chemin promis par le texte est trompeur.

### AC08 · 5/10 · Rendre la portée de la sauvegarde visible dans chaque outil

**Type : proposition ergonomique, appuyée sur les clés locales de brouillon.** La progression est synchronisée, mais plusieurs copies/préparations restent sur l’appareil ; la confidentialité le décrit, les élèves ne lisent pas nécessairement cette page.

**Action :** un libellé discret «Sur cet appareil» ou «Synchronisé avec ton compte», date de dernière sauvegarde et export depuis l’outil. Garder les contrôles à un seul endroit pour ne pas encombrer les écrans. **Effort : moyen.** Ce point complète AC04 sans demander une synchronisation de tout par défaut.

### AC09 · 4/10 · Expliquer le retrait d’un enfant dans l’espace parent

**Type : proposition de clarté.** Le bouton `parentUnlink` dit «Retirer ce compte» ; son action efface seulement le code de cet appareil (`Parent.jsx:99`, `:221`). Il ne supprime pas le compte de l’élève et ne désactive pas son consentement de partage.

**Action :** «Ne plus suivre cet élève sur cet appareil» et une courte confirmation expliquant la différence avec l’arrêt du partage côté élève. **Effort : faible.** Aucun défaut de suppression effective n’est allégué.

### AC10 · 4/10 · Prévoir un repli lorsque la copie du code parent est refusée

**Type : constat de code/amélioration.** `Profile.jsx:71` ignore l’exception de presse-papiers et ne donne aucun message d’échec. Le code reste affiché, mais le parent/élève n’a aucune explication.

**Action :** sélectionner le code et proposer une copie manuelle, annoncer réussite/échec ; harmoniser avec le partage flashcards désormais accessible. **Effort : faible.** Ne pas attribuer un refus système au serveur.

## Contrôles et limites

Série ciblée :21parcours réussis en4,6minutes le5novembre. Cinq micro-sondes :quatre réussites initiales ; la cinquième échouait uniquement sur la casse «À renforcer»/«À RENFORCER». Reprise isolée le6novembre :1réussite en4,1secondes, sans changement produit. Les vingt-et-un parcours terminés n’ont pas été relancés. Les assertions des sondes de constat réussissent lorsqu’elles observent le défaut : elles ne signifient pas que ce défaut est corrigé.

Preuves compactes et scripts dans [comptes-preuves](comptes-preuves/observations.json). Pas de build ni de suite générale relancée, un seul worker. Le helper bloque Supabase réel, fournisseurs d’aide, Stripe et tout envoi extérieur. Les captures/fixtures ne contiennent que des données fictives. Aucun test ne prouve les autorisations actuellement appliquées sur la base, les vrais e-mails de récupération, OAuth Google réel, la facturation Stripe ou les versions Edge déployées. Les huit anciennes corrections ne sont pas requalifiées en nouveaux défauts.
