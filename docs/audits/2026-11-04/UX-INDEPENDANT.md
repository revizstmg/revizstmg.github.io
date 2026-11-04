# Audit indépendant : parcours et présentation

Version source : `90c6a46357308624aa8b76f5046a7bc316bcb536` (EPS simplifiée, PR176). Compilation locale partagée en lecture : index SHA256 `c924cef174de0f546e68bd3d6d483732b7d3e00058655f324836eef8997be5a9`.

Audit sans changement produit, sans compte réel, services externes bloqués. Les messages de sauvegarde hors ligne sur les captures sont provoqués par ces blocages ; ils ne constituent pas un incident de production.

## Défauts reproduits

### UX-01 : partage de flashcards invisible et inaccessible au clavier (priorité haute)

Dans Réviser, avec un paquet enregistré, utiliser Partager sur un navigateur sans partage natif. Le clic fait défiler vers le paquet ; le voile apparaît mais le dialogue est au-dessus de l’écran. À390×844, son rectangle est x28,y-1982,largeur334,hauteur309. La capture ne montre que le voile et les cartes derrière. Le focus reste sur le bouton Partager, Échap laisse le dialogue ouvert. Le champ du code n’a pas de nom accessible (règle axe `label`).

Preuves : `ux-preuves/share.json`, `share-dialog.png`, sonde `audit-share.mjs`. Compte et paquet fictifs. Source : `app/src/pages/Revise.jsx:165` (bloc fixed rendu dans la page animée), ligne173 (textarea), ligne171/174 (actions).

Alternative concrète : rendre le dialogue dans un portail sur body, comme AudioReview et FlashcardsPage ; utiliser useFenetreClavier, placer le focus à l’ouverture, le rendre au déclencheur à la fermeture, ajouter label/aria-label au code. Après copie, annoncer « Code copié » ou une erreur au lieu de rester silencieux. Le partage natif reste utilisable quand le navigateur le propose.

### UX-02 : le mode Focus n’occupe pas l’écran (priorité haute, constat antérieur encore ouvert)

Coach → Plein écran, à844×390. Le dialogue mesure2320px de haut et commence ày154 ; Jouer est ày1394 et n’est pas touchable dans la fenêtre. Le menu supérieur et la navigation inférieure restent visibles, le minuteur lui-même ne l’est pas. Ce constat était déjà signalé dans l’audit du2novembre ; il est reproduit sur cette source et ne doit pas être compté comme nouveau.

Preuves : `ux-preuves/focus.json`, `focus-landscape.png`, sonde `audit-focus.mjs`. Source : `app/src/components/FocusFullscreen.jsx:29` ; l’élément fixed est rendu dans l’ancêtre animé de Coach.

Alternative concrète : portail body, hauteur100dvh, zone intérieure défilable et disposition compacte en paysage, contrôles accessibles sans demander le plein écran natif. Garder Échap et le retour de focus ; vérifier centre des boutons à320×568,390×844,844×390 et bureau.

## Améliorations proposées, distinctes des bugs

1. **Réviser reste trop long sur petit écran.** Avec un nouvel élève à320×568, le contenu principal mesure3200px. Plusieurs portes concurrentes coexistent : séance, mission, vacances, trois méthodes, commencer un cours, toutes les matières, flashcards et bac blanc. Preuve : `ux-preuves/manual.json` entrée revision, code Revise.jsx lignes73à162. Garder d’abord Reprendre / Mes erreurs / Mes acquis, puis une bibliothèque Flashcards ; ranger mission et vacances dans un volet secondaire. Il s’agit d’une proposition ergonomique, pas d’un blocage technique.
2. **Conserver la sélection de révision dans l’URL.** RevisionPath stocke mode/matière/chapitre uniquement en état React ; un rechargement ne retrouve pas cette sélection. Utiliser des paramètres lisibles et le bouton Retour du navigateur pour revenir du questionnaire au choix précédent. Source : Revise.jsx `pathMode`, RevisionPath.jsx `sid`, `tid`. La perte des réponses en cours n’a pas été testée : ne pas la déduire de ce constat.
3. **Mieux annoncer le résultat du partage.** copyShare absorbe les erreurs de presse-papiers et n’affiche aucun succès. Après correction UX-01, proposer un statut visible/localisé et permettre de sélectionner le code si l’accès au presse-papiers est refusé. Source : Revise.jsx `copyShare`.
4. **Rendre l’offre plus concrète pour un parent.** La page Offres liste beaucoup d’outils. À320px, il faut comparer plusieurs longs inventaires. Proposer trois lignes comparables : cours, entraînement corrigé, accompagnement personnalisé ; laisser les autres outils dans « Tout ce qui est inclus ». Conserver les limites exactes (Premium une utilisation mensuelle par aide, Ultimate plafond annoncé), prix et avertissements, sans promesse de note garantie. Preuve : entrée guest de manual.json.

## Contrôles et limites

- Balayage initial de34adresses à320px clair : zéro débordement horizontal, zéro exception collectée, zéro violation axe A/AA sur main.33adresses sont des destinations valides ; `/subject/anglais` est un contrôle d’adresse inconnue, pas la route des guides (`/subject/langues`). Les premières6destinations ont aussi passé axe à1280px sombre. Journal : ux-preuves/scan.log.
- Quatre contrôles manuels achevés à320×568 : visiteur Offres, accueil professeur, Paramètres avec grand texte/dys/contraste, Réviser élève ; aucun débord ni exception. Preuve : manual.json. Les statistiques et comptes y sont synthétiques.
-42parcours existants lancés :4ont terminé avec succès avant interruption (fenêtre de recherche/exercice accessible,3variantes Bac blanc Première/Terminale).6ont affiché un dépassement de temps pendant plusieurs suites concurrentes ; ils ne sont pas assimilés à des bugs produit. Les32autres ne disposent pas d’un verdict final. L’environnement est devenu indisponible puis a redémarré, interrompant les processus. Aucun contrôle ni assertion n’a été retiré. Journal brut conservé dans ux-preuves/existing.log.
- Une sonde initiale de partage a utilisé browser.newPage au lieu d’un contexte explicite, interdit par axe ; corrigée avant la preuve finale. Les sondes micro ont ciblé des contrôles erronés et ne constituent aucune preuve de panne de dictée ; elles ne figurent pas parmi les défauts.
- Pas de certification des RLS appliquées, OAuth réel, délivrabilité, permissions micro sur appareil, qualité de correction Gemini, paiement, push, exactitude exhaustive de tous les cours ou liens vidéo. Les simulations ne permettent pas ces conclusions.
- Cet audit explore les parcours et les états ciblés ; il ne garantit pas l’absence de toute erreur sur tout appareil.
