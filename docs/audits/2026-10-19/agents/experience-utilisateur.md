# Audit UX/UI de RévizSTMG — 19 octobre 2026

## Méthode et portée réelle

Audit en lecture seule. Sources locales examinées : App, Home/Home.css, Layout, Welcome, Landing, Subject, Theme, Profile, Shop, FormulaWorkshop, OutilsAccueil et PhotoFiche. Un compte entièrement fictif a été injecté dans le stockage local via l'utilitaire des parcours ; aucun identifiant réel, aucune modification du serveur et aucun envoi social. Tous les domaines externes ont été bloqués. Le site publié a été consulté uniquement sur revizstmg.github.io. Les scripts et preuves sont dans `/workspace/work/site-review-ux/`.

Un premier balayage ouvre 29 routes à 390 × 900 et 1280 × 900, soit 58 ouvertures. Attention : le build app/dist existant est antérieur au dernier accueil « trousse ». Plusieurs premières observations arrivent pendant le chargement différé. Le fichier results.json distingue les pages effectivement rendues (titres présents) et les chargements. Ce balayage ne constitue donc pas 58 validations fonctionnelles. L'accueil publié actuel, l'atelier et le menu ont ensuite été examinés séparément sur le site publié. Aucune navigation exhaustive dans les 806 chapitres, aucun vrai parcours professeur/parent ni paiement ; aucun score réel et aucune interaction sociale serveur. Pas d'audit WCAG complet ni de mesure utilisateur réelle.

Routes ouvertes : /accueil ; /subject/droit ; /subject/droit/theme/droit-t5 ; /subject/droit/theme/droit-t5/chapter/0 ; /favoris ; /badges ; /classe ; /moi ; /coach ; /revision ; /parent ; /bac-blanc ; /programme ; /grand-oral ; /etude-de-gestion ; /coach-ia ; /fiches-photo ; /defi ; /atelier-formules ; /methodo ; /boutique ; /confidentialite ; /cgu ; /faq ; /guide ; /classement ; /amis ; /changer ; /inexistante. L'entrée sans compte a également été observée. Les compatibilités /express, /formules et ancienne route chapter sont lues dans App.jsx, pas rejouées ici.

## Points à conserver

- Les matières restent immédiatement après le bandeau, en grille compacte ; la trousse publiée remplace efficacement neuf grandes tuiles.
- Le bouton de reprise et la distinction Première/Terminale ont une place utile. Conserver la reprise à la fiche exacte.
- La boutique sépare collections, objets acquis et récompenses. Les conditions des mois offerts précisent correctement qu'aucune activation ou facturation immédiate n'a lieu.
- Atelier : véritable sélection multiple, nombre d'exercices annoncé, correction numérique, virgule acceptée, labels explicites et bilan annoncé aux technologies d'assistance.
- États vides utiles dans Favoris, Profil, Classe et Amis ; page introuvable avec retour. Aucun débordement horizontal n'a été détecté aux deux tailles dans les observations réalisées, ce qui ne couvre pas tous les textes/langues.

## Constats confirmés et améliorations

### UX-01 — Menu mobile : Échap ne ferme pas, focus derrière la surcouche

**Bug confirmé — P1 — effort 1 jour.** Sur /moi, ouvrir Menu, presser Échap : `[role=menu]` reste présent. Presser Tab ensuite focalise « Accueil » derrière la surcouche (`insideMenu:false`). Preuve reproductible : current.json, current-menu.png ; Layout.jsx:317-417. Le composant utilise role=menu sans fournir les interactions clavier correspondantes.

Impact : navigation clavier déconcertante ; utilisateur voyant et lecteur d'écran ne suivent plus le même contexte. Recommandation : soit un panneau de navigation avec balisage nav, fermeture Échap, focus initial dans le panneau, retour au déclencheur et gestion du fond ; soit implémenter complètement les interactions de menu. Vérifier également Recherche, langues, personnalisation et accessibilité : absence de gestion explicite commune du focus dans SearchOverlay, Layout.jsx:498-560. Ne pas présenter ce dernier point comme une reproduction de tous les dialogues.

### UX-02 — Atelier : action principale perdue après la sélection

**Problème ergonomique confirmé — P1 — effort 0,5 à 1 jour.** À 390 px, choisir la dernière formule entraîne scrollY=4241 ; « Générer mes exercices » se trouve à y=-3599 dans le viewport. Preuve mesurée sur le site publié : current.json. FormulaWorkshop.jsx:38-48 positionne tous les réglages avant toute la liste.

Impact : après avoir fait son choix, il faut remonter environ quatre écrans pour lancer la séance ; le compteur sélectionné est lui aussi invisible. Recommandation : barre récapitulative sticky avec « 3 formules · 6 exercices · Commencer », au-dessus de la navigation basse et des safe areas ; regroupement par matière repliable ; bouton « Voir ma sélection ». Conserver recherche et filtre, déjà présents.

### UX-03 — Textes essentiels de progression à 9 px

**Constat confirmé — P1 — effort 0,5 jour.** Home.css:57-67 impose 9 px aux libellés des statistiques et à « Ta progression est calculée… » ; footer 10 px, ligne 76. Visible sur current-accueil.png. Profile.jsx:126 utilise également 0,65rem pour les libellés de statistiques.

Impact : explication du sens des chiffres difficile à lire sur téléphone, particulièrement pour les élèves avec basse vision ou dyslexie. Recommandation : 12 à 13 px minimum pour métadonnées utiles, 14 à 16 px pour corps ; préserver les cases matières compactes demandées par le propriétaire. Mesurer contraste selon thème au lieu de conclure ici à une non-conformité globale.

### UX-04 — Croix utilisée comme bouton de retour

**Proposition fondée sur le code — P2 — effort 0,25 jour.** Layout.jsx:91-103 affiche ✕ avec label « Retour » et appelle navigate(-1). La même icône signifie « fermer » ailleurs, notamment Menu.

Impact : on s'attend à fermer une fenêtre alors que l'historique change. Recommandation : flèche retour (miroir RTL), libellé « Retour » accessible ; réserver la croix aux fenêtres et panneaux.

### UX-05 — Premier écran davantage orienté connexion que découverte

**Proposition — P1 — effort 1 à 2 jours.** L'entrée vierge observée affiche un formulaire pleine page : bénéfice en deux phrases, connexion, création de compte, puis essai sans compte. Preuve visitor.png (build antérieur ; structure confirmée Welcome.jsx:448 et suivantes). On ne voit pas encore d'exemple de cours ou d'exercice.

Impact : le nouvel élève doit choisir l'inscription avant de comprendre la qualité du contenu. Recommandation : conserver l'authentification mais rendre « Découvrir les cours » immédiatement identifiable ; exemple public de fiche et exercice, trois bénéfices concrets et indication claire de ce qui est sauvegardé en essai. Ne pas inventer de témoignages ou de résultats au bac.

### UX-06 — « Commencer » ouvre toujours la première matière

**Comportement confirmé par le code — P2 — effort 0,5 jour.** Sans historique, Home.jsx:109-111 dirige vers realSubjects[0], soit Gestion-Finance pour la filière fictive. Le libellé ne dit pas laquelle. « Chapitre au hasard » conserve une forte présence juste à côté.

Impact : proposition arbitraire qui n'aide pas à choisir sa priorité. Recommandation : libeller explicitement « Choisir une matière » et ancrer la grille, ou proposer un thème avec raison (« Premier thème de Gestion-Finance »). Garder l'aléatoire comme option secondaire sans imposer une nouvelle grande refonte.

### UX-07 — La boutique met d'abord en avant des objets hors de portée

**Comportement confirmé par le code et ancien build — P2 — effort 0,5 à 1 jour.** Shop.jsx:96 affiche exclusivement Nébuleuse, Phénix et Héritage doré dans « collection du moment ». Le compte neuf voit des verrous de 5 000, 12 200 et 10 000 XP. Il existe une collection plus large accessible via un onglet, mais aucun achat simple n'est mis en avant sur ce premier écran.

Impact : un débutant découvre surtout trois boutons désactivés et deux offres lointaines. Recommandation : un objet accessible, une progression intermédiaire et un objectif prestige ; CTA « Voir ce que je peux obtenir » ; explication locale courte pour gagner ses premières pièces. Conserver l'actuel catalogue et les conditions des offres en préparation.

### UX-08 — Action « Continuer à progresser » désactivée

**Comportement confirmé par le code — P2 — effort 0,5 jour.** Shop.jsx:62 désactive ce bouton lorsque les conditions ne sont pas atteintes. Le texte évoque pourtant une action de navigation.

Impact : contrôle visuellement cliquable mais sans aide pour avancer. Recommandation : séparer l'état « Conditions non atteintes » du lien actif « Faire un entraînement » vers la révision ; afficher clairement quelle condition manque.

### UX-09 — Profil très long : identité, statistiques, réglages et gestion du compte mélangés

**Proposition — P2 — effort 1 à 2 jours.** /moi atteint 3 477 px sur mobile dans le build examiné. Les actions accessibilité, onglets, date du bac, notifications et export se situent après plusieurs blocs statistiques ; suppression en bas. Profile.jsx:89-284.

Impact : réglage recherché enfoui dans un tableau de bord très long. Recommandation : deux sous-sections « Mes progrès » / « Réglages et compte », sans retirer la confirmation de suppression existante. Accès direct aux réglages depuis le menu. Conserver les graphiques dans Progrès et les états vides utiles.

### UX-10 — Étiquette « Coach IA » plus ambitieuse que l'outil visible

**Proposition de clarté — P2 — effort 0,5 jour.** i18n/fr.js:236 annonce une IA « qui analyse tes points faibles et te crée un entraînement sur-mesure ». CoachAI.jsx importe des fonctions locales de data/coachAI.js et commence par un diagnostic puis un entraînement structuré. Le dossier pédagogique/technique doit vérifier la portée de l'adaptation, pas supposer un service génératif.

Impact : attente possible de chat libre, explication rédigée ou génération personnalisée. Recommandation : « Entraînement personnalisé » en navigation, phrase factuelle « Questions choisies à partir de tes résultats », expliquer les limites ; réserver « IA » à une capacité effectivement disponible.

### UX-11 — Absence de résultat de recherche peu explicite

**Constat de code — P2 — effort 0,25 jour.** SearchOverlay, Layout.jsx:531-535 : zéro résultat affiche uniquement « — “requête” — ».

Impact : impossible de distinguer recherche vide et traitement en cours. Recommandation : « Aucun résultat pour… », suggestion de reformulation et accès à toutes les matières. Ajouter un compteur accessible et une liste de résultats à titre clair.

### UX-12 — Pages légales très longues sans sommaire visible

**Proposition — P2 — effort 0,5 jour.** Confidentialité 5 992 px et CGU 4 322 px sur mobile du build examiné ; titres présents et structurés. Le balayage ne vérifie pas l'exactitude juridique.

Impact : difficile d'atteindre rapidement droits, conservation, récompenses ou contact. Recommandation : sommaire d'ancres, résumé initial lisible (sans remplacer le texte), date de mise à jour et lien « Mes droits » depuis les réglages.

### UX-13 — Accessibilité des informations par couleur et petites cibles à consolider

**Piste à vérifier — P2 — effort 1 à 2 jours pour échantillon et corrections.** Subject.jsx:46-47 emploie du texte blanc sur la couleur brute de matière, contrairement à la consigne du projet qui prévoit les variables de contraste. Plusieurs liens secondaires mesurés sont sous 32 px de haut ; le menu mobile est à 36 px. Ceci ne suffit pas à déclarer une violation WCAG 2.2 (taille, espacement et exceptions sont à examiner).

Recommandation : matrice de contraste réel pour matières/thèmes clair/sombre/personnalisés, cibles tactiles confortables autour de 44 px lorsque possible, focus visible et zoom 200 %. Tests visuels nécessaires avec arabe/RTL et noms longs. Conserver les icônes et pourcentages qui doublent utilement la couleur.

### UX-14 — Accès par niveau : éviter les outils non pertinents via liens directs

**Proposition — P2 — effort 0,5 à 1 jour.** OutilsAccueil filtre correctement Grand Oral / Étude de gestion selon niveau. App.jsx rend cependant les deux routes à tous les profils ; le balayage du compte Terminale a ouvert Étude de gestion.

Impact : lien enregistré ou partagé peut conduire à un outil hors contexte. Recommandation : indicateur explicite « Outil de Première » et retour vers l'outil adapté ; décider si accès libre assumé ou redirection douce. Ne pas bloquer arbitrairement un enseignant voulant consulter les deux.

## Priorisation recommandée

1. Corriger le menu clavier, garder l'action Atelier accessible et augmenter les microtextes utiles (P1 ; environ 2 à 3 jours cumulés).
2. Clarifier l'entrée et la première action de révision sans déplacer les matières compactes appréciées (1 à 2 jours).
3. Rendre boutique et profil plus orientés vers l'action présente (2 à 3 jours).
4. Harmoniser vocabulaire et navigation secondaire ; lancer une vraie passe accessibilité avec élèves et technologies d'assistance (2 à 4 jours selon résultats).

Estimations de réalisation, hors recette pédagogique et dépendances serveur. Aucun P0 UX confirmé dans cette couverture. L'absence de P0 ici ne vaut pas certification du reste du site.

## Recette à prévoir après corrections

Téléphone 360/390 px et bureau 1280 px ; nouveau visiteur et élève récurrent ; clavier seul, zoom 200 %, lecteur d'écran ; sombre/clair ; français/arabe ; liste atelier longue et zéro résultat ; boutique débutant/avancé ; menus ouverts et navigation retour. Vérifier que cours restent haut placés et que les deux cartes demandées par le propriétaire sont préservées.

## Couverture mesurée et captures retenues

| Surface | Téléphone 390 px | Bureau 1280 px | Statut |
|---|---|---|---|
| Balayage du build antérieur | 29 routes ouvertes, 27 rendues | 29 ouvertes, 23 rendues | Échantillonnage initial, non-validation exhaustive |
| Site publié actuel /accueil | rendu complet, hauteur 2604 px | rendu complet, 1845 px | Captures live-390-accueil.png et live-1280-accueil.png |
| Site publié actuel /atelier-formules | rendu complet, 5141 px ; sélection dernière formule mesurée | rendu complet, 3028 px | Captures live-390-atelier-formules.png et live-1280-atelier-formules.png |
| Site publié actuel /boutique | rendu complet, 3197 px | rendu complet, 2049 px | Captures live-390-boutique.png et live-1280-boutique.png |
| /moi + menu | rendu et Échap/Tab reproduits | profil observé | current-menu.png, 390-moi.png ; détail current.json |
| Entrée visiteur | écran connexion observé | non rejouée | visitor.png, build antérieur |

Le balayage initial reste pendant Chargement sur /accueil et /fiches-photo en mobile, et /accueil, /subject/droit, son thème et chapitre échantillonnés, /bac-blanc, /programme au bureau. Ces absences de titre ne sont pas classées comme bugs de chargement : l'attente de 650 ms ne permet pas de le conclure. L'accueil a été revérifié complètement en direct dans les deux tailles ; les autres surfaces possèdent au moins un rendu valide dans l'autre taille, sauf aucune exception restante car /fiches-photo est rendu au bureau.

Captures à utiliser dans le PDF : prioritairement les six fichiers **live-*.png** dont la prise attend le h1 ; **current-menu.png** pour la navigation et **390-moi.png** pour la longueur du profil. Éviter les premières captures current-atelier-formules.png/current-boutique.png qui ont pu précéder le rendu : elles ont été remplacées par les live-*.png fiables. Les captures pleine page contiennent une barre basse fixe au niveau du viewport initial ; cela n'est pas la preuve qu'elle est fixée au milieu du document.

Dernière contre-vérification : les quatre pages sensibles /accueil, /atelier-formules, /boutique et /moi ont également été ouvertes sur le **build frais 6a32b03**, servi par le parent sur 127.0.0.1:4184. Le menu reste ouvert après Échap et la touche Tab sort du menu ; le bouton de génération reste hors écran après sélection en bas de l'atelier. Le fichier current.json final correspond à cette contre-vérification locale fraîche (même résultat que le site publié précédemment).
