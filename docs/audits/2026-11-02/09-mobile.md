# Audit09 — navigation, mobile et accessibilité

Version gelée : `f0f70220fd34f6fbba1d6416f3c99e6a0cd3e1e7`, source `05bd1531da93f095780ec1492b756459153a722a`. SHA-256 de l’index contrôlé : `c0cb4337d48b30af6dd6e3fe3556fea854d8b8a7f5e2ae60e7f2089c4d8ea309`, conforme à VERSION.json. Référence fournie : CI 41503625386, 691 unitaires par fuseau UTC/Paris et 359 parcours ; publication Pages 41506196286 confirmée par le coordinateur.

Audit en lecture seule dans le worktree détaché `wt-09`, racine compilée servie sur 127.0.0.1:4219 par `python -m http.server 4219 --bind 127.0.0.1`. Aucun build, suite générale, compte réel ou mutation externe. Données synthétiques et interception réseau de `app/tests/parcours/eleve.js`. Un seul worker Chromium ; captures du viewport exclusivement. La demande EPS ultérieure est hors version auditée.

## Méthode et commandes

```sh
python -m http.server 4219 --bind 127.0.0.1
app/node_modules/.bin/playwright test -c app/audit09.config.js audit09- --grep 'menu principal|choisir et ordonner|lecture agrandie|ordinateur : outils|paramètres par rubriques|paramètres structurés traduits|menu du téléphone|langue sur ordinateur'
```

Copies temporaires des quatre fichiers de parcours existants pour retirer seulement `fullPage:true`. Configuration, scripts complets et résultats dans `preuves-09/`. Les assertions métier restent celles de la version gelée. Sondes nouvelles : réordonnancement tactile natif Chromium par CDP (appui long puis déplacement), interface EN/ES à 320 × 568 sur accueil/cours/paramètres/boutique ; mouvement réduit avec menus et lecteur, réglage grand texte du panneau Accessibilité, focus Tab/Échap ; minuteur focus320 avec audit axe après stabilisation.

## Couverture exécutée

- Burger :320 × 640 clair,390 × 844 sombre,844 × 390 clair ; emplacement gauche, ouverture clavier, focus initial, défilement, fermeture accessible, verrouillage du fond, liens et navigation vers Amis.
- Onglets : ajout/retrait/ordre, minimum 2 et maximum 5, persistance au rechargement, retour aux valeurs par défaut, passage mobile→desktop.
- Menus DE et AR à 390 px ; réglages DE/AR à 320 px.
- Lecteur :320 × 568,390 × 844,844 × 390, desktop 1280 × 800 ; fermeture au pouce, bas de cours accessible, boutons Suivant/Fermer, audit axe, déverrouillage du fond.
- Réglages groupés :320 px clair et1280 px sombre, sept catégories, focus du titre, sécurité, navigation arrière, export synthétique, accès direct et absence de débordement.
- Clavier : burger mobile avec 25 Tab et Maj+Tab, Échap et restitution du focus ; liste de langue desktop avec restitution du focus.

## Limites

Échantillonnage Chromium, pas de certification Safari/iOS, matériel tactile réel, clavier virtuel natif ou lecteur d’écran humain. Axe ne démontre pas la conformité WCAG complète. Les contrastes ne sont évalués que sur les régions effectivement auditées et états stabilisés ; aucune certification de toutes les pages, traductions, couleurs personnalisées et combinaisons. Réseau externe bloqué, intégrations privées, base/RLS, paiement, IA et authentification réels non certifiés. Pas de relecture exhaustive des cours. Les scénarios se recoupent avec les autres audits ; ne pas additionner leurs nombres comme fonctions uniques.

## Résultats

Référence ciblée : **16/16 réussites**,0 ignoré,0 échec,0 instabilité ;315,999s (3 novembre 2026,20:04:52 UTC). Détail par scénario : `preuves-09/couverture-reference.tsv`, journal `parcours.log` et résultats structurés `resultats.json`. Six captures de viewport : menus 320/390/844, lecteur 390, réglages320 clair/1280 sombre. Les captures du lecteur 390 et du menu paysage 844 ont aussi été examinées visuellement.

Sondes : **4/4 assertions réussies**,0 ignoré/échec/instabilité ;90,398s (20:10:21 UTC). Les tests automatiques passent donc 20/20, mais leur examen visuel a révélé le défaut ci-dessous. La sonde Focus vérifiait débordement horizontal, contraste axe, confinement clavier et Échap ; elle ne vérifiait pas la position verticale du minuteur. La reproduction complémentaire ajoute cette assertion et échoue volontairement sur le défaut : **1/1 échec attendu pour documenter le constat**,3,6s. Ces 21 exécutions ne sont pas 21 fonctions uniques.

```sh
app/node_modules/.bin/playwright test -c app/audit09-sondes.config.js audit09-sondes.spec.js
app/node_modules/.bin/playwright test -c app/audit09-repro.config.js audit09-repro.spec.js
```

## Défaut reproduit09-01 — P2 : Focus plein écran hors viewport sur téléphone

Prérequis : élève synthétique Premium, thème clair, Chromium mobile320 × 568, mouvements normaux ; services externes bloqués. Route `/#/coach`.

1. Ouvrir le minuteur de révision, fermer la notice cookies si présente.
2. Cliquer « Plein écran ».
3. Attendre la fin de toutes les animations puis 500 ms supplémentaires.

Attendu : dialogue fixé au viewport, minuteur et bouton Jouer visibles à l’ouverture ; commandes accessibles au pouce et page derrière couverte.

Observé dans la première capture de la sonde puis dans une nouvelle session de reproduction isolée : le dialogue commence sous l’en-tête et sa hauteur suit le contenu de Coach, au lieu du viewport. Reproduction chiffrée : viewport 320 × 568 ; rectangle du dialogue x12,y275,largeur296,hauteur3316,828,bord inférieur3591,828. Jouer est ày2013,406 avec hauteur80 ; Passer et Réinitialiser ày2029,406. Les trois centres sont hors écran (`elementFromPoint` ne les atteint pas). La fermeture reste visible et Échap restitue le focus : il ne s’agit pas d’un blocage complet du site. Le timer est hors champ à l’entrée du mode censé éliminer les distractions.

Origine étayée : `app/src/components/FocusFullscreen.jsx:30` rend un `fixed inset-0` dans l’arbre courant ; `app/src/pages/Coach.jsx:256` l’insère dans son conteneur `animate-lux`. Celui-ci et `.page-enter` de `app/src/components/Layout.jsx:308` ont toujours une transformation calculée `matrix(1,0,0,1,0,0)` après stabilisation. Les animations CSS conservent leur état final (`both`) dans `app/src/index.css:200` et `:223`. Un ancêtre transformé fournit le bloc contenant d’un enfant fixed. Le lecteur de cours utilise déjà un portail vers body (`app/src/components/Course.jsx:287`) pour éviter ce cas. Piste de correction : appliquer le même principe au minuteur ; aucune correction effectuée pendant cet audit.

Preuves : `preuves-09/sondes-artifacts/audit09-sondes-sonde-focus-c2d7c-20-clavier-contraste-stable-chromium/focus320.png` (découverte), `preuves-09/repro-artifacts/audit09-repro-repro-focus-position-mobile-chromium/focus-repro320.png` (reprise), `repro.log` (rectangles et ancêtres), `repro.json`, et `repro-artifacts/audit09-repro-repro-focus-position-mobile-chromium/trace.zip`. L’assertion `dialog.y ===0` conserve l’échec initial exact. La reproduction attend la fin des animations : ce constat n’est pas attribuable à un contraste transitoire ou à la charge machine.

## Autres résultats et risques

Aucun autre défaut confirmé sur les états échantillonnés. Axe ne détecte aucune violation sur les régions testées (menus, catégories de réglages, lecteur et sondes EN/ES/Focus). Le minuteur illustre pourquoi ce résultat n’est pas une certification fonctionnelle ou d’accessibilité complète. Les 20 scénarios réussis et la reproduction en échec sont présentés séparément.

Relecture ciblée : gestion Tab/Maj+Tab/Échap et restitution du focus dans `components/clavier.js`, navigation/édition tactile dans `SiteMobileMenu.jsx` et `NavigationTabs.jsx`, règles de mouvement réduit dans `presentation/charte.css`, géométrie mobile dans `mobile.css`. Pas d’autre risque de code présenté comme défaut reproduit.

Outillage : avertissements Node `NO_COLOR`/`FORCE_COLOR` sans effet sur les assertions. Quelques recherches initiales visaient des noms de fichiers absents, puis ont été redirigées vers les vrais chemins ; aucun scénario navigateur bloqué par l’outillage. Les durées des audits axe ne sont pas assimilées à des défauts de performance du produit. Aucun fichier suivi modifié (`git diff --exit-code` et `git diff --check` réussis), aucun commit ni PR.
