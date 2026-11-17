# Deux défauts des fiches photo

Recherche ciblée du17novembre2026 sur `5a160b0bb` ; compilation publique `67bfcbc120c1e216a2d8e6f3f68b813a20a48d1f`. Aucun changement produit. Les corrections précédentes des rappels et de l’audio Grand Oral restent livrées ; ce rapport porte sur un autre composant et ses données. Priorités pratiques sur10, pas scores CVSS.

## 1. Brouillon et fiche de A réutilisables sous B : 7/10

**Condition reproduite :** lorsque l’événement interonglets de changement de session est traité, la progression locale de B est déjà disponible et son droit d’accès à la page est connu. Cette condition permet au store de restaurer B sans état vide intermédiaire. La sonde utilise un abonnement fictif actif, indépendamment de la période de grâce.

**Étapes :** sous A, ajouter une image synthétique, un titre et du texte, puis générer la fiche avec la structuration locale. Simuler l’arrivée de la copie de B et du changement de session. Attendre que le store identifie B, vérifier les champs, puis cliquer sur Enregistrer la fiche.

**Observé :** B conserve le texte, le titre, la prévisualisation de l’image (même URL blob) et le résultat de A. Après son clic, la progression locale de B contient la fiche avec le texte exact de A. Ce n’est pas seulement un ancien message visuel. Aucun enregistrement serveur réel n’a été testé : les réponses de services sont simulées.

**Cause :** `PhotoFiche.jsx:70–88` conserve ses champs/résultat dans des états locaux non rattachés à l’identité. L’effet dépendant de `state.account.id` invalide les traitements en attente mais ne vide pas les données déjà présentes. `doSave`, vers165, appelle ensuite l’action `saveFiche`, qui ajoute la fiche à la progression courante (`store.jsx:741–749`). Le garde-fou des réponses asynchrones ne suffit donc pas à isoler les brouillons.

**Contrôle :** sans copie locale B préalablement disponible, la transition passe par une sortie de page. À sa réouverture, aucun texte/image/fiche de A n’est présenté à B. Le défaut n’est donc pas annoncé pour tous les changements de compte. L’ordre d’événements retardé est simulé ; sa fréquence réelle n’est pas mesurée et une suspension physique de deux onglets n’a pas été reproduite.

**Impact :** exposition locale de documents sur appareil partagé et possibilité de mélange entre bibliothèques de fiches. Aucun accès à des comptes arbitraires ni fuite distante démontré.

**Correction recommandée :** identifier l’état de travail par son propriétaire et réinitialiser champs, résultat et photos au changement ; préserver les protections de génération/annulation existantes. Valider aussi l’identité avant la sauvegarde ou la création de flashcards.

Preuves : [état conservé et fiche enregistrée sous B](preuves/compte-copie.json), [capture](preuves/compte-copie.png), [contrôle sans copie préalable](preuves/compte-sans-copie.json).

## 2. Ressources image non libérées au départ de la page : 5/10

**Étapes :** ouvrir les fiches photo, ajouter une image, revenir à l’accueil ; répéter trois fois. Conserver les URL des prévisualisations et observer les appels à `URL.revokeObjectURL`.

**Observé :** les trois images n’apparaissent plus dans l’interface mais aucune de leurs URL n’est révoquée. Les trois ressources restent lisibles dans le même document par `fetch(blobURL)`, avec réponse200. Les lectures ne demandent aucune donnée distante.

**Contrôles :** Retirer et Tout recommencer révoquent bien l’URL de l’image ; une lecture ultérieure échoue. Ces deux chemins fonctionnent, contrairement au départ de la page.

**Cause :** `addPhotos` crée une URL pour chaque image ; `removePhoto` et `reset` la révoquent explicitement. Le nettoyage au démontage ne fait qu’annuler les opérations, sans révoquer les photos encore présentes. Une navigation interne conserve le même document et sa réserve de blob URLs.

**Impact :** accumulation de ressources temporaires sur des visites répétées, notamment avec des photos volumineuses. La sonde utilise de minuscules PNG : elle prouve l’absence de libération des ressources, **pas un volume de RAM consommé, une panne mémoire ou une lenteur mesurée**. Les ressources disparaissent au déchargement du document ; pas de conservation serveur démontrée.

**Correction recommandée :** révoquer les URL encore détenues au démontage/changement d’identité, sans révoquer par erreur les prévisualisations conservées lors de l’ajout ou du retrait d’une seule image. Garder les contrôles positifs Retirer/Tout recommencer.

Preuve : [trois ressources encore disponibles](preuves/ressources.json).

## Méthode

**5 sondes réussies en18,4secondes** : deux reproductions de défaut et trois contrôles normaux. Une sonde de défaut réussie signifie qu’elle constate le défaut ; ce n’est pas un bon fonctionnement du produit. [Journal](preuves/parcours.log), [script exécuté](preuves/sondes.spec.js).

Vrai site public avec profils, sessions, images et réponses REST fictifs. Génération locale par `buildFiche`, sans OCR ni appel IA réel. Le clic Enregistrer ne touche que la progression fictive et des services simulés. Aucun compte réel, donnée Supabase/NAH modifiée, paiement, message ou service facturable. Les chemins absolus du script sont ceux de l’environnement d’audit ; son helper autorise les fichiers publics du site et bloque les tiers.

Les notes et d’autres pistes ont été lues sans défaut supplémentaire suffisamment démontré ; aucune conclusion exhaustive n’en découle. Aucun correctif produit demandé/effectué dans cette passe et aucune nouvelle suite générale897/449 dupliquée.
