# RévizSTMG : analyse de l'interface et propositions

Version analysée : build en ligne servie en local (http://localhost:4201/), code dans `/var/tmp/analyse-site/app/` (lecture seule, réseau extérieur bloqué : Supabase, classement et amis ne répondent donc pas).
Date : 19 octobre 2026.

**Captures** : `/tmp/claude-0/-home-user-NAH/b00c6cf6-33b6-5d76-a12d-45338d0a337c/scratchpad/analyse/captures-interface/`
Préfixes : `tel-` téléphone 390×844, `pc-` ordinateur 1280×900 ; `clair` / `sombre` ; `ar` arabe ; `dys`, `contraste`, `grand` réglages d'accessibilité ; `p1` Première STMG ; suffixe `__page` = page entière. Planches de lecture (plusieurs captures côte à côte) : `scratchpad/analyse/montages/`.
**Mesures** (une fiche JSON par écran : hauteur, débordements, zones à toucher, contrastes WCAG calculés, tailles de police) : `scratchpad/analyse/scripts-interface/mesures/` ; scripts Playwright dans `scratchpad/analyse/scripts-interface/`.

## 0. Chiffres clés mesurés

| Mesure | Résultat | Commentaire |
|---|---|---|
| Écrans capturés | 29 routes × (téléphone clair, téléphone sombre, ordinateur clair) + ~60 états (menu, recherche, exercice, correction, fin de série, bac blanc, défi, premier lancement, arabe, accessibilité, Première) | toutes les routes de `App.jsx` |
| Débordement horizontal | **0 écran** sur 29 (téléphone et ordinateur) | très bon point |
| Longueur de l'accueil (téléphone) | **3,1 écrans** (2 604 px) ; la recommandation « Conseillé maintenant » commence au 2ᵉ écran | trop long pour un écran d'accueil |
| Pages les plus longues (téléphone) | Confidentialité 7,1 · Atelier de formules 6,1 · Badges 5,8 · CGU 5,1 · Moi 4,1 · Boutique 3,8 · Thème 3,7 écrans | |
| Actions pour atteindre une 1ʳᵉ question depuis l'accueil | **6 touchers** (matière → thème → chapitre → onglet Exercices → exercice → mode) ; 2 par le Défi du jour | Duolingo : 1 toucher (« Commencer la leçon ») |
| Zones à toucher < 24×24 px (WCAG 2.2, 2.5.8) | 6 à 12 par écran (fil d'Ariane 15-16 px de haut, liens du pied de page 20 px, « Changer » 16 px, « Badges → » 15 px) ; **42** dans l'Atelier de formules | bouton retour ✕ et menu ☰ : 36×36 px (< 44 Apple, < 48 Material) |
| Tailles de police sur l'accueil (téléphone) | 4 textes en **9 px**, 10 en **10 px**, 17 en 11 px | sous 12 px, illisible pour beaucoup ; ces tailles en px ignorent le réglage « Grand texte » |
| Contrastes sous 4,5:1 (calcul WCAG) | logo « STMG » du pied de page 3,05:1 ; résultat bac blanc « 12.5 » doré 2,37:1 et bouton « Terminé » blanc sur or 2,4:1 ; badges verrouillés (56 textes) ~3,4:1 ; lien de matière vert en sombre 3,43:1 ; « Bien — mention Assez bien » cyan 3,62:1 | le reste de l'app passe ; bon travail sur `--c-accent-texte` |
| Anneau de focus clavier | 2 px or à 72 % d'opacité sur crème ≈ **1,8:1** | WCAG 1.4.11 demande 3:1 |
| Lien d'évitement, piège du focus dans les fenêtres | **absents** : dans la recherche, le 2ᵉ Tab sort de la fenêtre ; aucune fenêtre n'a `role="dialog"` sauf l'écran d'accueil | |
| Audit automatique axe-core 4.10 (WCAG 2.2 A/AA, 15 écrans) | 1 seule violation (`aria-prohibited-attr`, Boutique) | bonne base technique ; les défauts sont surtout de conception |
| Longueur des lignes du cours | téléphone : 36-42 caractères (15 px) ; **ordinateur : 98-108 caractères** | idéal 50-75, WCAG 1.4.8 : ≤ 80 |
| Chargement simulé (CPU ×4, 4G lente 1,6 Mb/s) | accueil prêt en **2,4 s** (FCP 2,1 s) ; chapitre 3,4 s ; premier lancement 2,4 s | JS principal 564 Ko (175 Ko gzip) ; ~830 Ko transférés pour l'accueil (non compressés en local) |
| Local, sans ralentissement | pages prêtes en 110-450 ms (téléphone), 1,6 s pour le premier accueil sur ordinateur | |

## 1. Diagnostic par écran

Gravité : 🔴 haute (bloque ou fait fuir), 🟠 moyenne (gêne réelle), 🟢 faible (finition).

| Écran | Captures | Ce qui est réussi | Ce qui gêne | Gravité |
|---|---|---|---|---|
| Premier lancement : connexion | `tel-clair-premier-1-connexion`, `pc-clair-premier-*` | Écran épuré, charte « ivoire et or » soignée, accroche courte (« Des cours clairs. Des exercices ciblés. ») | Un nouveau venu tombe sur un **mur « Se connecter »** sans rien voir de l'app ; « Créer un compte » est un petit lien gris, « Essayer sans compte » un bouton secondaire tout en bas ; bouton désactivé gris en capitales serif espacées (« S E  C O N N E C T E R ») peu lisible ; champs signalés par un simple trait | 🔴 |
| Essai sans compte | `…-premier-2-essai`, `…-3-essai-rempli` | Seulement prénom + classe + spécialité, rassure (« rien ne sera perdu ») | Puis un 2ᵉ écran « Que veux-tu travailler ? » (liste de 8 matières dans une boîte défilante de 46 % de hauteur : défilement dans le défilement), puis 4,6 s d'animation « Bienvenue » : **3 écrans + 5 s** avant le premier contenu | 🟠 |
| Inscription en 3 étapes | `…-premier-6/7/8-inscription-*` | Étapes courtes, points de progression, erreurs affichées en quittant le champ, aide mot de passe | Case de consentement 16×16 px ; « CRÉER MON COMPTE » coupé sur 2 lignes ; le choix « Parent » mélangé à l'inscription élève ; aucun rappel de ce que le compte apporte | 🟠 |
| « Bienvenue » | `…-premier-13-bienvenue-*` | Moment élégant, cohérent avec la charte | Imposé 4,6 s à chaque inscription ; prénom en dégradé doré très pâle (contraste < 2:1) | 🟢 |
| Arrivée sur l'accueil après inscription | `…-premier-14-apres-bienvenue`, `tel-clair-bandeau-cookies`, `tel-clair-bandeau-installation`, `tel-clair-recompense-du-jour` | Récompense de connexion engageante | **Empilement d'interruptions** : bandeau « mode essai », fenêtre « +10 XP Génial ! », toast « Badge débloqué », puis bandeau cookies, puis bandeau d'installation qui **recouvrent la barre d'onglets** | 🔴 |
| Accueil | `tel-clair-accueil(__page)`, `montages/accueil-page.png`, `pc-clair-accueil` | Bandeau personnalisé (prénom, filière, date) très réussi ; bouton or « Reprendre : <chapitre> » ; grille des matières avec progression ; recommandation intelligente (`outilConseille`) | 3,1 écrans ; la recommandation n'arrive qu'après les 8 matières ; **la série est affichée 4 fois** (en-tête, bandeau, carte série, bloc stats) et l'XP 3 fois ; bloc « Tes efforts prennent forme » en **9-10 px**, palette vert-bleu (#193d43, #5e8471) hors charte, textes français codés en dur ; glyphes étranges ◉ ♧ ✦ ; « Commencer » mène à une matière, pas à une activité | 🔴 |
| En-tête et barre du bas | toutes | En-tête léger et translucide ; barre du bas avec pastille active ; zones sûres iPhone gérées | Barre par défaut = **Accueil, Réviser, Boutique, Amis, Classement** : 3 onglets sur 5 hors révision, dont 2 qui exigent un compte ; libellés 10 px ; le « retour » est une **croix ✕** (36 px) ; la barre reste affichée pendant les exercices ; `aria-label` de la barre = « Accueil » | 🔴 |
| Menu ☰ | `tel-clair-menu-ouvert` | Tout regroupé, croix visible, profil en tête | 5 réglages en émojis sans libellé (🔍📖🎨♿🌙) ; langues en codes « FR EN ES IT AR » ; « mon espace » en minuscule ; « Espace parent » dans le menu de l'élève ; `role="menu"` sans `menuitem` | 🟠 |
| Recherche | `tel-clair-recherche-vide/-tva/-aucun/-seuil` | Ouverture rapide, focus direct dans le champ | Ne cherche que les **titres de thèmes** : « TVA » → 1 seul thème ; « seuil de rentabilite » → **0 résultat** (accents, notions, définitions non indexés) ; état vide « — « xyzw » — » sans aide | 🔴 |
| « Dictionnaire » | `tel-clair-dictionnaire` | Utile pour les langues | C'est un **traducteur** (FR/EN/ES/IT/AR) appelé « Dictionnaire » : l'élève attend le lexique STMG (glossaire) | 🟠 |
| Personnalisation, Coach de révision | `tel-clair-personnaliser`, `tel-clair-coach`, `pc-clair-coach` | Message clair et bouton « Installer » | **Bloqués tant que l'app n'est pas installée**, y compris le choix des onglets du bas (sur ordinateur aussi) | 🔴 |
| Changer de filière | `tel-clair-changer` | Choix en 2 niveaux, badges « Complet » | « Léa, Qu'est-ce que… » (majuscule après virgule) ; bouton « Reprendre » marron hors du style des autres cartes | 🟢 |
| Matière | `tel-clair-subject_gestion-finance` | Liste numérotée très claire, une ligne par thème | Page presque vide (1 écran, pied de page au milieu) : ni progression globale, ni « reprendre », ni bac blanc de la matière | 🟢 |
| Thème | `tel-clair-subject_…_gf-t1(__page)`, `tel-clair-theme-onglet-*`, `tel-clair-theme-defile` | Onglets Chapitres / Outils / Test / Progression, nombres d'exercices et de notions par chapitre | **20 chapitres en grandes cartes (3,7 écrans)** ; « Méthodes & calculs » et « Études de cas » repliés tout en bas ; la barre d'onglets collante (`top-[52px]`) **passe sous l'en-tête** (86 px (mesuré) avec le fil d'Ariane) au défilement ; « Test du thème » sur 2 lignes | 🟠 |
| Chapitre : cours | `tel-clair-subject_…_chapter_0`, `tel-clair-cours-page2`, `tel-clair-cours-plein-ecran`, `pc-clair-…chapter_0` | Lecteur paginé (« Page 1/4 »), mode plein écran, encadrés « CAS », lecture à voix haute, impression PDF | ~45 % du premier écran pris par les en-têtes : **2 fils d'Ariane**, **2 croix**, surtitre en capitales sur 3 lignes ; texte 15 px avec beaucoup de gras (la hiérarchie se perd) ; bouton 🔊 posé sur la 1ʳᵉ ligne ; lignes de ~105 caractères sur ordinateur | 🔴 |
| Chapitre : définitions | `tel-clair-chapitre-definitions` | Liste terme / définition sobre, filet de couleur | Rien d'interactif (pas de « me tester sur ces définitions ») | 🟢 |
| Chapitre : liste d'exercices | `tel-clair-chapitre-exercices` | Cartes claires, puce « Nouveau », meilleur score | 13 exercices sans ordre conseillé ni durée ; la carte « Flashcards · Enregistrer » passe avant les exercices ; vocabulaire mêlé « jeux » / « exercices » | 🟠 |
| Choix du mode | `tel-clair-exercice-choix-mode` | Entraînement / Défi bien expliqués | Étape imposée à chaque exercice ; « ← Retour aux jeux » petit lien | 🟢 |
| Question | `tel-clair-exercice-question`, `-vraifaux-defi`, `-association`, `-trou`, `-flashcards`, `-saisie`, `tel-clair-test-theme-question` | Réponses en grandes cartes (lettres A-D), Vrai/Faux énormes, flashcards à glisser, micro pour répondre | En-tête, fil d'Ariane, barre du bas et pied de page restent visibles (distraction) ; « ← Quitter » = petit lien qui abandonne **sans confirmation** ; barre de progression vide à la question 1 ; bouton « Vérifier » désactivé vert pâle illisible | 🟠 |
| Correction | `tel-clair-exercice-correction-1/-2`, `tel-clair-defi-correction` | Couleur + icône ✅/❌ + secousse, explication immédiate, bouton « Question suivante » visible sans défiler (mesuré sur 4 questions) | « Presque… » même pour une réponse fausse ; l'explication répète la définition sans lien vers le passage du cours ; notation brute « u_(n+1) = u_n + r » | 🟠 |
| Fin de série | `tel-clair-exercice-fin-serie`, `tel-clair-defi-fin` | Score, étoiles, confettis si ≥ 80 %, rejouer | **Aucun récapitulatif des erreurs**, aucun « exercice suivant » : cul-de-sac ; 0/6 au défi affiche 💪 et **+33 XP** ; toast de badge par-dessus | 🔴 |
| Réviser | `tel-clair-revision`, `tel-clair-revision-avec-paquet` | « Reprends ta révision », compteurs à revoir / à renforcer / acquis, carnet d'erreurs avec « Refaire » : excellent | État vide correct mais générique ; compteurs sans explication ; les liens « Commencer » des matières en couleurs différentes | 🟢 |
| Bac blanc | `tel-clair-bac-blanc`, `-question`, `-derniere`, `-resultat` | Choix matière + durée, navigation libre entre questions, note sur 20 avec bilan par thème cliquable | « **12.5**/20 » (point anglais) en or 2,37:1 ; bouton « Terminé » blanc sur or 2,4:1 ; mentions en cyan ; la question défile sous l'en-tête ; pas de minuteur visible en permanence | 🟠 |
| Défi du jour | `tel-clair-defi`, `-question`, `-fin` | 2 touchers depuis l'accueil, série de défis | Récompense même à 0 %, fin sans correction ni suite | 🟠 |
| Moi (profil) | `tel-clair-moi(__page)`, `montages/moi-page.png` | Carte profil, statistiques, niveau par matière, rappels, export des données, suppression du compte bien isolée | 4,1 écrans qui mêlent statistiques, réglages, RGPD ; « Gestion **Et** Finance » (capitalize) ; « Personnaliser mon profil 🔒 APPLI » | 🟠 |
| Badges | `tel-clair-badges`, `tel-sombre-badges` | Grille lisible, conditions explicites | 56 cadenas identiques sur 5,8 écrans, textes à ~3,4:1 ; aucun « prochain badge » mis en avant | 🟠 |
| Boutique | `tel-clair-boutique`, `-collections`, `-recompenses`, `-mes-objets` | Soignée, onglets, « Ton prochain cap » | Héros sombre d'un écran entier **répété sur chaque onglet** ; en 2ᵉ position… de la barre principale | 🟠 |
| Classe, Classement, Amis | `tel-clair-classe`, `tel-clair-classement`, `tel-clair-amis` | Formulaires simples, code ami à copier | Classement › « Ma classe » = même formulaire que Classe ; la page Amis affiche « **Classement** momentanément indisponible » ; code ami en chiffres elzéviriens (Cormorant) : « 9XCBRV », le 9 ressemble à un g ; bouton « Envoyer » désactivé illisible | 🟠 |
| Programme, Grand oral, Étude de gestion, Méthodo, Atelier, Fiche photo, Coach IA | `tel-clair-programme`, `-grand-oral(-analyse)`, `-etude-de-gestion`, `-methodo`, `-atelier-formules`, `-fiches-photo`, `-coach-ia` | Gabarit commun (surtitre, titre serif, filet or), contenus utiles, chiffres clés de l'épreuve | ~200 px d'en-tête avant le contenu sur chaque page ; Atelier : 6,1 écrans, 42 cibles < 24 px, bouton « Générer » désactivé à 2:1 ; date au format du navigateur | 🟠 |
| Parent | `tel-clair-parent` | Explication claire en 2 temps | Bouton « Relier » **bleu canard** hors charte | 🟢 |
| FAQ, Guide, CGU, Confidentialité | `tel-clair-faq`, `-guide`, `-cgu`, `-confidentialite` | Textes clairs, bien structurés | FAQ : « onglet Classe » (n'existe pas par défaut) ; Guide : « Ouvre revizstmg.github.io » alors qu'on y est ; 7 écrans sans sommaire | 🟢 |
| Page introuvable | `tel-clair-page-inexistante` | Claire, bouton de retour | — | 🟢 |
| Ordinateur | `pc-clair-*`, `pc-sombre-*` | Même charte, rien ne déborde | Colonne unique de 896 px au milieu d'un écran de 1 280 ; **barre d'onglets de téléphone** en bas ; 7 icônes sans libellé en haut (⏱ 📖 🔍 🌙 🎨 🌐 avatar) | 🟠 |
| Mode sombre | `tel-sombre-*`, `pc-sombre-*`, `tel-sombre-premier-1-connexion` | Très réussi dans l'app : fonds chauds, or lisible, cartes distinctes, correction et fin de série bien contrastées | L'écran de connexion reste ivoire **mais avec des textes en couleurs « sombres »** (accroche et « Mot de passe oublié ? » à ~1,5:1) ; le bandeau d'accueil se fond dans le fond ; badges verrouillés illisibles ; lien de matière vert 3,43:1 | 🟠 |
| Arabe (RTL) | `tel-ar-*`, `tel-ar-sombre-*`, `pc-ar-*`, `montages/ar1.png`, `ar2.png`, `ar3.png` | Mise en page bien retournée (barre du bas, en-tête, chevrons, carte conseillée) ; rien ne déborde | Les **cours français** dans un conteneur RTL sont alignés à droite avec la ponctuation au début des lignes ; surtitre du chapitre en bidi mélangé ; « XP 450 / 420 » inversé ; chaînes françaises codées en dur (« Conseillé maintenant », « Ta trousse ») ; bandeau « échec de traduction » sur chaque page ; flèches → non retournées dans plusieurs blocs | 🔴 |
| Réglages d'accessibilité | `tel-dys-*`, `tel-contraste-*`, `tel-grand-*`, `montages/a1-a3.png`, `tel-clair-panneau-accessibilite` | Panneau toujours accessible, 3 interrupteurs clairs ; mode dyslexie (Verdana + espacements) appliqué partout | « Fort contraste » presque invisible (dégradés, opacités, couleurs mélangées inchangés) ; « Grand texte » (18,5 px) n'agrandit pas les textes en px (barre 10 px, grille des matières 14 px, bloc stats 9 px) ; la taille de police du navigateur est écrasée par `font-size: 16px` | 🟠 |
| Première STMG | `tel-p1-*`, `montages/p1.png` | Même structure, matières de Première, Étude de gestion dans la trousse | « Bac blanc… comme le jour J » proposé sur des matières sans épreuve en Première ; titre « Sciences de gestion et numérique » sur 2 lignes en serif 14 px dans la grille | 🟢 |

## 2. Tableau principal des propositions

Effort : S (moins d'une demi-journée), M (1 à 3 jours), L (plus). Impact : 1 (confort) à 5 (change l'usage). Priorité : P1 (à faire d'abord), P2 (ensuite), P3 (finition).
Les noms de captures sont relatifs au dossier `captures-interface/` (sans `.png`).

### 2.1 Premier lancement et inscription

| n° | Écran ou zone | Constat (capture) | Proposition concrète | Pourquoi | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|
| 1 | Écran d'entrée | Un nouveau venu arrive sur « Se connecter » (e-mail + mot de passe) sans rien voir de l'app (`tel-clair-premier-1-connexion`) | Remplacer par un écran vitrine : titre « Révise ton bac STMG, 10 min par jour », 3 puces illustrées (fiches de cours, exercices corrigés, bac blanc noté /20), bouton principal or pleine largeur 52 px « Commencer gratuitement » (= essai sans compte), lien secondaire « J'ai déjà un compte » en dessous | Engagement progressif : Duolingo fait faire la 1ʳᵉ leçon avant le compte (+20 % d'utilisateurs actifs selon Appcues) ; la plupart des visiteurs sont nouveaux | M | 5 | P1 |
| 2 | Essai sans compte | 3 écrans (prénom/classe → « Que veux-tu travailler ? » → « Bienvenue » 4,6 s) avant le 1er contenu (`…-premier-2-essai`, `…-12-plan`, `…-13-bienvenue-*`) | Un seul écran : 2 grosses tuiles « Première » / « Terminale » puis 4 tuiles de spécialité (apparition sous la tuile choisie) ; prénom demandé plus tard (sur l'accueil, carte « Comment tu t'appelles ? ») ; supprimer le choix des chapitres de l'inscription | Chaque écran d'inscription perd des utilisateurs ; viser « 1er exercice en moins de 60 s » | M | 5 | P1 |
| 3 | Choix « Où en es-tu ? » | Liste de 8 matières × thèmes dans une boîte défilante de 46 % de hauteur : défilement dans le défilement (`…-premier-12-plan`) | Déplacer ce choix vers une carte de l'accueil « Dis-nous où tu en es (facultatif) » qui ouvre une feuille plein écran, une matière à la fois | Évite le double défilement, garde l'onboarding court | S | 3 | P2 |
| 4 | Après l'inscription | L'élève atterrit sur l'accueil complet (3 écrans) | Enchaîner directement une « mini-séance » de 3 min : 1 page de cours du chapitre 1 + 3 questions, puis écran « Bravo, ta 1ʳᵉ séance est faite ! Crée ton compte pour la garder » | Effet de valeur immédiate (« aha moment ») avant de demander un effort | M | 5 | P1 |
| 5 | « Bienvenue » | Animation imposée 4,6 s, prénom en dégradé doré très pâle (`…-13-bienvenue-2`) | Durée 1,2 s, tap n'importe où pour passer (déjà) + bouton visible « Entrer », prénom en or foncé #84671b ; seulement à la création du compte, jamais à la connexion | Le luxe ne doit pas coûter de temps ; contraste du prénom < 2:1 | S | 2 | P2 |
| 6 | Interruptions | Bandeau « mode essai » + fenêtre « +10 XP Génial ! » + toast « Badge débloqué » + bandeau cookies + bandeau d'installation qui couvrent la barre du bas (`…-14-apres-bienvenue`, `tel-clair-recompense-du-jour`, `tel-clair-bandeau-cookies`, `tel-clair-bandeau-installation`) | File d'attente unique : au plus 1 sollicitation par session ; jour 1 : aucune (ni récompense ni installation) ; récompense quotidienne à partir du jour 2 ; installation après 3 sessions ou après un bac blanc ; badges regroupés dans l'écran de fin d'exercice | Les interruptions en cascade font fermer l'app ; HIG : n'interrompre que pour une information importante | M | 5 | P1 |
| 7 | Bandeau cookies | Bandeau flottant sur la barre d'onglets alors qu'il n'y a aucun cookie de suivi (`tel-clair-bandeau-cookies`) | Le supprimer (aucun consentement requis sans traceur) et garder la mention dans Confidentialité ; à défaut, le placer en haut, une ligne, fermeture 44 px | CNIL : pas de bandeau obligatoire sans traceur soumis à consentement ; libère la navigation | S | 3 | P2 |
| 8 | Boutons désactivés | « S E  C O N N E C T E R », « C O M M E N C E R  L'E S S A I » en capitales serif espacées sur gris (`…-premier-1-connexion`, `…-2-essai`) | Bouton en casse normale, Inter 17 px semi-gras ; actif dès le départ : au clic, champs manquants signalés en rouge avec message ; si désactivé, gris #57514a sur #e7e1d5 (≥ 4,5:1) | Les capitales espacées se lisent 10-20 % plus lentement ; un bouton gris n'explique pas ce qui manque | S | 3 | P2 |
| 9 | Champs de saisie | Champs réduits à un trait, placeholder serif #c9c3b8 (`…-premier-6-inscription-1`) | Champs en boîte : hauteur 48 px, bordure 1 px #a9a190 (3:1), fond blanc, rayon 12 px, libellé au-dessus en casse normale 14 px ; police Inter pour la saisie | Affordance du champ ; WCAG 1.4.11 (contraste 3:1 des contours de composants) | S | 3 | P2 |
| 10 | Inscription | 3 étapes (compte, identité, études) + choix du rôle | 2 étapes : (1) Google/Apple en tête puis e-mail + mot de passe avec œil « afficher », (2) prénom, nom, classe, code de classe facultatif ; rappeler en tête « Ton compte : progression sur tous tes appareils, ta classe, tes amis » | Moins d'étapes, valeur explicite | S | 3 | P2 |
| 11 | Consentement | Case 16×16 px (`…-premier-8-inscription-3`) | Toute la ligne cliquable (48 px de haut), case 24 px, lien « Lire » qui ouvre une feuille modale résumée | WCAG 2.5.8 (24 px), confort du pouce | S | 2 | P2 |
| 12 | Rôles Prof / Parent | Le choix Élève / Professeur / Parent est au milieu de l'inscription élève | Écran d'entrée : liens discrets « Je suis professeur » et « Je suis parent » en bas, chacun avec son parcours | L'élève (95 % du public) n'a pas à lire ces options | S | 2 | P3 |
| 13 | « Créer mon compte » | Libellé en capitales coupé sur 2 lignes à côté de « Retour » (`…-premier-9-inscription-3-terminale`) | « Créer mon compte » en casse normale sur une ligne, bouton pleine largeur ; « Retour » devient une flèche ‹ en haut à gauche | Lisibilité, cohérence avec le reste de l'app | S | 2 | P3 |

### 2.2 Accueil

| n° | Écran ou zone | Constat (capture) | Proposition concrète | Pourquoi | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|
| 14 | Ordre des blocs | 3,1 écrans ; la recommandation « Conseillé maintenant » arrive après les 8 matières, au 2ᵉ écran (`montages/accueil-page.png`) | Nouvel ordre : (1) bandeau réduit + carte « Ta séance du jour », (2) « Conseillé maintenant », (3) Défi du jour, (4) Mes matières en liste compacte, (5) raccourcis ; supprimer les blocs « Tes efforts… » et « Ton coin à toi » (voir maquette A) ; cible ≤ 2 écrans | Ce qui fait réviser doit être visible sans défiler (« above the fold ») | M | 5 | P1 |
| 15 | Bouton principal | « Commencer » mène à la page d'une matière, puis 5 touchers jusqu'à une question | « Continuer : La TVA · chapitre 1 » qui ouvre directement le cours au bon chapitre (ou la série d'exercices s'il est lu) ; sous-titre « 8 min · fiche + 5 questions » | Réduire de 6 à 1 toucher l'accès à l'activité | S | 5 | P1 |
| 16 | Doublons | Série affichée 4 fois (en-tête, bandeau, carte série, bloc stats), XP 3 fois, progression 2 fois (`tel-clair-accueil__page`) | Garder : série dans l'en-tête (🔥 3) + carte série ; XP et niveau seulement dans le bandeau ; supprimer le bloc « Chaque séance compte » (le déplacer dans Moi) | Densité d'information, chaque chiffre une seule fois | S | 3 | P1 |
| 17 | Bloc « Tes efforts prennent forme » | Textes de **9-10 px** fixes, palette vert-bleu (#193d43, #617375, #5e8471) hors charte, phrases françaises codées en dur, glyphes ◉ ♧ ✦ (`Home.css`, `tel-clair-accueil__page`) | S'il est gardé : tailles en rem (min 0,75 rem), couleurs `--c-ink` / `--c-accent-texte`, textes passés dans i18n, icônes du set SVG | Lisibilité (9 px = illisible), cohérence de la charte, traduction | S | 3 | P1 |
| 18 | Grille des matières | 8 cartes en 2 colonnes = 1,5 écran ; titres en Cormorant 14 px (`tel-clair-accueil`) | Sur téléphone : liste compacte (ligne 64 px : icône 32 px, nom Inter 16 px semi-gras, « 3 thèmes · 12 % », barre fine), triée par dernière ouverte, spécialité en premier ; grille 4 colonnes conservée sur ordinateur | Les 8 matières tiennent en ~1 écran ; le serif fin 14 px est peu lisible | S | 3 | P2 |
| 19 | « Chapitre au hasard » | 2ᵉ bouton du bandeau, aussi visible que l'action principale | Le déplacer dans les raccourcis (icône 🎲 « Au hasard ») | Un seul appel à l'action principal par écran | S | 2 | P2 |
| 20 | Outils (« Ta trousse ») | 8 outils cachés derrière « Ta trousse · 8 outils » fermée (`tel-clair-accueil-trousse-ouverte`) | Rangée horizontale défilante de 6 raccourcis carrés 72×72 px (Bac blanc, Réviser, Flashcards, Programme, Formules, Méthodo) + « Tout voir » | Découvrabilité : un repli fermé cache les fonctions (NN/g) | S | 4 | P1 |
| 21 | Objectif du jour | Aucun objectif quotidien visible ; seules la série et l'XP sont mises en avant | Anneau « 4/10 min aujourd'hui » dans le bandeau, objectif réglable (5/10/20 min) au 1er lancement, rempli par le temps d'étude réel (`useThemeTimer` existe déjà) | Objectif court et atteignable = habitude (Duolingo, Kartable) | M | 4 | P2 |
| 22 | Accueil vide | Nouvel élève : « 0 % de progression », « 0 thèmes maîtrisés », « 0 % » partout (`tel-clair-accueil`) | Masquer les compteurs à zéro et afficher « Ta 1ʳᵉ séance t'attend (8 min) » avec le bouton principal | Un tableau de zéros décourage | S | 3 | P2 |
| 23 | Date et salutation | « Lundi 19 Octobre » (capitalize met une majuscule au mois) | Afficher « lundi 19 octobre » avec seulement la 1ʳᵉ lettre en capitale via JS (`charAt(0).toUpperCase()`) | Typographie française | S | 1 | P3 |
| 24 | Note de bas d'accueil | « Contenu basé sur ton cours… Progression sauvegardée sur cet appareil » sous les blocs | La déplacer dans Moi › À propos ; afficher plutôt l'état de synchronisation dans Moi | Allège l'accueil | S | 1 | P3 |
| 25 | Bandeau d'accueil | Kicker « TERMINALE STMG · GESTION ET FINANCE » en capitales espacées sur 2 lignes, date, 4 statistiques, 2 boutons : ~430 px (`tel-clair-accueil`) | Bandeau de 220 px : avatar 48 px, « Bonsoir Léa », ligne « Terminale GF · Niveau 3 · 🔥 3 », puis le bouton « Continuer » ; filière en casse normale | Le bandeau occupe la moitié du premier écran | S | 4 | P1 |

### 2.3 Navigation (barre du bas, en-tête, menu, retour, fil d'Ariane, recherche)

| n° | Écran ou zone | Constat (capture) | Proposition concrète | Pourquoi | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|
| 26 | Barre du bas | Par défaut : Accueil, Réviser, **Boutique, Amis, Classement** ; Amis et Classement exigent un compte (`navTabs.js`, toutes captures) | Par défaut : **Accueil · Cours · Réviser · Bac blanc · Moi** ; Boutique, Amis, Classement, Badges accessibles depuis Moi et l'accueil | Material 3 et Apple : 3 à 5 destinations principales, d'égale importance, liées à la tâche principale | S | 5 | P1 |
| 27 | Libellés de la barre | Libellés 10 px (`text-[10px]`), gris clair sur crème | 12 px minimum (0,75 rem, suit le grand texte), icône 24 px, hauteur 56 px + zone sûre, actif en encre gras + pastille or | Lisibilité, WCAG 1.4.4 | S | 3 | P1 |
| 28 | Icônes de la barre | Émojis 🏠📚🛍️🤝🏆 (rendu différent selon iOS/Android, couleurs vives qui cassent la charte « sombre et or ») | Jeu d'icônes SVG trait 1,75 px (Lucide, Phosphor) en encre ; version pleine or pour l'onglet actif | Cohérence visuelle, lisibilité à petite taille | M | 3 | P2 |
| 29 | Personnaliser les onglets | L'éditeur d'onglets est dans « Personnalisation », **bloqué tant que l'app n'est pas installée** (`tel-clair-personnaliser`) | Rendre le choix des onglets accessible partout (Moi › Réglages › Barre du bas) et par appui long sur la barre | L'élève doit pouvoir réparer une barre qui ne lui convient pas | S | 3 | P2 |
| 30 | Bouton retour | Une croix ✕ 36×36 px en haut à gauche sur toutes les pages (`tel-clair-subject_gestion-finance` …) | Flèche « ‹ » 44×44 px, avec le nom du parent sur ordinateur (« ‹ Règles comptables ») ; la croix reste réservée à la fermeture d'une fenêtre ou d'un exercice | Apple HIG / Material : la flèche revient en arrière, la croix ferme ; 44 px (Apple), 48 dp (Material) | S | 4 | P1 |
| 31 | Doubles repères (chapitre) | 2 fils d'Ariane et 2 croix sur la même page (`tel-clair-subject_…_chapter_0`) | Garder le seul fil d'Ariane de l'en-tête (avec « Chapitre 1 » en dernier élément) et la seule flèche retour ; supprimer le fil et le ✕ internes | Redondance, perte de 60 px | S | 3 | P1 |
| 32 | Fil d'Ariane | Liens de 15-16 px de haut (mesuré), survol `violet-600` | Hauteur de ligne 32 px (padding 8 px), une seule ligne qui défile horizontalement, dernier élément tronqué « … » ; couleur de survol `--c-accent-texte` | WCAG 2.5.8 (24 px) ; cohérence | S | 2 | P2 |
| 33 | En-tête au défilement | En-tête + fil d'Ariane = 86 px (mesuré) fixes en permanence | En-tête qui se masque au défilement vers le bas et revient en remontant (comme Safari, Instagram) ; ou en-tête 48 px sans fil d'Ariane sur téléphone | +10 % de surface de lecture sur 844 px | M | 3 | P2 |
| 34 | Onglets collants | Les onglets Thème/Chapitre sont collés à `top: 52px` alors que l'en-tête mesure 86 px (mesuré) : ils **passent dessous** au défilement (`tel-clair-theme-defile`) | Variable CSS `--entete-h` mise à jour par `ResizeObserver` sur l'en-tête, `top: var(--entete-h)` | Bogue visible : onglets à moitié cachés | S | 3 | P1 |
| 35 | Menu ☰ : réglages rapides | 5 émojis sans libellé (🔍📖🎨♿🌙) (`tel-clair-menu-ouvert`) | Lignes avec libellé : « Rechercher », « Traduire », « Apparence », « Accessibilité », « Mode sombre » avec interrupteur | Une icône sans texte est ambiguë (NN/g) | S | 3 | P2 |
| 36 | Menu ☰ : langues et libellés | Langues en codes « FR EN ES IT AR », « mon espace » en minuscule, « Espace parent » dans le menu élève | Ligne « Langue : Français ›» qui ouvre la liste des noms complets ; « Mon espace » ; « Espace parent » dans Moi | Clarté | S | 2 | P2 |
| 37 | Menu ☰ : contenu | Le menu n'a que 5 destinations (Accueil, mon espace, Méthodo, Parent, Guide) | Sections « Réviser » (Programme, Méthodo, Formules, Fiche photo, Coach IA), « Progresser » (Badges, Boutique), « Ensemble » (Classe, Amis, Classement), « Aide » | Remplace les onglets retirés de la barre ; tout est trouvable à 2 touchers | S | 3 | P2 |
| 38 | Recherche : périmètre | Ne cherche que les titres de thèmes : « TVA » → 1 résultat, « seuil de rentabilite » → **0** (`tel-clair-recherche-tva`, `-seuil`) | Indexer titres de chapitres, notions, définitions (`glossary.js`, `keyterms.js`), formules ; recherche insensible aux accents (`normalize('NFD')`) et tolérante (distance 1) ; résultats groupés « Chapitres · Définitions · Formules » avec extrait | La recherche est le raccourci n°1 avant un contrôle | M | 5 | P1 |
| 39 | Recherche : accès et état vide | Loupe cachée dans ☰ sur téléphone ; état vide « — « xyzw » — » (`tel-clair-recherche-aucun`) | Loupe 44 px permanente dans l'en-tête ; état vide « Aucun résultat pour « xyzw ». Essaie : TVA, seuil, contrat » + 5 recherches récentes | 2 touchers de moins, aide en cas d'échec | S | 4 | P1 |
| 40 | « Dictionnaire » | C'est un traducteur FR/EN/ES/IT/AR (`tel-clair-dictionnaire`) | Le renommer « Traduire » (icône 文A) ; créer un « Lexique STMG » (glossaire existant) : mots du cours soulignés en pointillés → bulle de définition, et page lexique A-Z | L'élève qui ouvre « Dictionnaire » attend des définitions de gestion | M | 4 | P2 |
| 41 | Position de défilement | Toute navigation remonte en haut, même le retour arrière (Layout : `scrollTo(0,0)` à chaque changement d'adresse) | Restaurer la position au retour (`history.state` + `ScrollRestoration`), remonter seulement pour une nouvelle page | Revenir à la liste des 20 chapitres sans perdre sa place | S | 3 | P2 |
| 42 | Barre du bas pendant le travail | La barre et le pied de page restent visibles pendant les exercices et le bac blanc | La masquer en mode exercice/examen (voir n° 55) | Concentration, place | S | 4 | P1 |

### 2.4 Cours (thème, chapitre, lecteur)

| n° | Écran ou zone | Constat (capture) | Proposition concrète | Pourquoi | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|
| 43 | En-tête du chapitre | Surtitre en capitales sur 3 lignes + titre 2 lignes + 2 boutons : le texte du cours commence à ~400 px sur 844 (`tel-clair-subject_…_chapter_0`) | Surtitre une ligne « Thème 1 · Chapitre 1/26 » en casse normale 13 px ; titre 22 px ; imprimer/écouter/plein écran dans un menu « ⋯ » ; objectif : 1ʳᵉ ligne du cours à < 260 px | Le contenu doit dominer l'écran | S | 4 | P1 |
| 44 | Corps du texte | 15 px, interligne 1,6, 6 à 8 segments en gras par paragraphe (`tel-clair-cours-page2`) | 17 px sur téléphone (16 px minimum), 1 à 2 notions en gras par paragraphe, notion-clé surlignée (fond or 18 %) ; paragraphes de 4 lignes max | Trop de gras = plus de hiérarchie ; 16 px est le minimum confortable sur téléphone | M | 4 | P1 |
| 45 | Largeur de ligne (ordinateur) | 98-108 caractères par ligne (mesuré, `pc-clair-…chapter_0`) | `max-width: 68ch` sur les paragraphes du lecteur ; encadrés et tableaux peuvent rester plus larges | 50-75 caractères recommandés ; WCAG 1.4.8 ≤ 80 | S | 3 | P2 |
| 46 | Bouton 🔊 | Bouton « Lire à voix haute » 32 px posé sur la 1ʳᵉ ligne du texte (« La TVA 🔊 », `tel-clair-cours-page2`) | Barre d'outils du lecteur au-dessus de la feuille : « 🔊 Écouter · Aa · ⤢ Plein écran » en boutons 44 px | Ne jamais masquer le texte | S | 3 | P2 |
| 47 | Pagination | Flèches 48 px et points ; pas de balayage ; « Page 1/4 » | Balayage gauche/droite entre pages, durée « 2 min » par page ; dernière page = carte « Cours terminé ✓ — 5 questions pour vérifier (2 min) » qui lance l'exercice | Lien direct cours → exercice (6 touchers aujourd'hui) | M | 5 | P1 |
| 48 | Points de pagination | Points 6 px, `aria-hidden`, cliquables seulement à la souris | Boutons 24 px avec `aria-label="Page 2 sur 4"` | Clavier et lecteur d'écran | S | 2 | P2 |
| 49 | Liste des chapitres d'un thème | 20 chapitres en grandes cartes : 3,7 écrans ; « Méthodes & calculs » et « Études de cas » repliés tout en bas (`tel-clair-subject_…_gf-t1__page`) | Segments en haut « Cours (20) · Méthodes (4) · Cas (2) » ; lignes compactes 56 px (numéro 28 px, titre 15 px, méta 12 px) ; regroupement par parties du programme si elles existent | 20 chapitres sur ~2 écrans, méthodes trouvables | M | 4 | P1 |
| 50 | État des chapitres | La barre de progression n'apparaît que si le score > 0 | Icône d'état à droite : cercle vide (à faire), demi-cercle (lu), coche or (exercices ≥ 90 %) + « Reprendre ici » sur le dernier ouvert | Se repérer d'un coup d'œil | S | 3 | P2 |
| 51 | Page Matière | 3 thèmes et le pied de page au milieu de l'écran (`tel-clair-subject_gestion-finance`) | En tête : progression de la matière (anneau), bouton « Continuer », bouton « Bac blanc de la matière » ; flashcards de la matière en ligne secondaire | Page utile au lieu d'un relais vide | S | 3 | P2 |
| 52 | Onglets du thème | « Test du thème » coupé sur 2 lignes, onglets en `aria-current` (`tel-clair-theme-onglet-test`) | Libellés courts « Chapitres · Outils · Test · Progrès », pattern ARIA `tablist` | Lisibilité, accessibilité | S | 2 | P2 |
| 53 | Encadrés du cours | Encadré « CAS » bleu clair, encadrés de couleurs variées sans légende | Charte d'encadrés : Cas (bleu), À retenir (or), Piège (rouge), Méthode (vert), chacun avec icône et titre ; même rayon et filet | Repères visuels stables d'un cours à l'autre | S | 2 | P3 |
| 54 | Onglet Définitions | Liste statique ; parfois vide (« Les définitions clés… se trouvent dans les autres chapitres ») (`tel-clair-chapitre-definitions`) | Bouton « Me tester sur ces 4 définitions » (flashcards) en bas ; masquer l'onglet quand il est vide | Transformer la lecture en mémorisation active | S | 3 | P2 |
| 55 | Couleur de matière | Surtitre et liens du chapitre en vert matière #047857 : 3,43:1 en sombre (`tel-sombre-…chapter_0`) | Couleur de matière réservée aux pastilles/filets ; textes en `--c-accent-texte` ; en sombre éclaircir via `.texte-matiere` (déjà prévu) | Contraste 4,5:1, charte | S | 2 | P2 |
| 56 | Lecture à voix haute | Lecture lancée par un petit bouton, sans contrôle de vitesse | Mini-lecteur persistant au-dessus de la barre (lecture/pause, vitesse 0,8×-1,5×, page suivante) | Révision dans les transports, élèves dys | M | 2 | P3 |

### 2.5 Exercices (question, correction, fin de série)

| n° | Écran ou zone | Constat (capture) | Proposition concrète | Pourquoi | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|
| 57 | Mode immersif | En-tête, fil d'Ariane, barre du bas, pied de page visibles pendant les questions (`tel-clair-exercice-question`) | Pendant un exercice : en-tête réduit « ✕ · barre de progression · 3/10 » (48 px), sans fil d'Ariane, sans barre du bas, sans pied de page | Duolingo et Quizlet isolent la question ; concentration et place | M | 5 | P1 |
| 58 | Quitter | « ← Quitter » texte 14 px, sortie immédiate sans confirmation | Bouton ✕ 44 px en haut à gauche + feuille « Arrêter la série ? Tes 3 réponses sont gardées » (Continuer / Arrêter) | Évite les pertes par erreur ; cible 44 px | S | 4 | P1 |
| 59 | Choix du mode | Étape « Entraînement / Défi » avant chaque exercice (`tel-clair-exercice-choix-mode`) | Démarrer directement en Entraînement ; interrupteur « ⏱ Défi » dans l'en-tête de l'exercice ; mémoriser le dernier mode | Un toucher de moins à chaque exercice | S | 4 | P1 |
| 60 | Liste d'exercices | 13 exercices sans ordre conseillé, carte « Flashcards · Enregistrer » en tête (`tel-clair-chapitre-exercices`) | Bouton principal « Lancer la série du chapitre (10 questions variées · 5 min) » ; puis exercices dans l'ordre pédagogique (Flashcards → QCM → Vrai/Faux → Association → Cas) avec durée ; « Enregistrer les flashcards » en ligne secondaire | Un seul geste pour s'entraîner ; parcours guidé | M | 4 | P1 |
| 61 | Vocabulaire « jeux » | « Retour aux jeux », « Détail par jeu », onglet « Exercices » | Un seul mot : « exercices » partout | Cohérence, sérieux perçu par les profs et parents | S | 1 | P3 |
| 62 | Barre de progression | Vide à la question 1 (« Question 1/4 », barre à 0) | Barre segmentée (1 segment par question, coloré vert/rouge après réponse) | Retour visuel immédiat, motivation | S | 2 | P2 |
| 63 | Correction : texte | « Presque… » même pour une réponse fausse ; l'explication répète la définition (`tel-clair-exercice-correction-1`) | Titre « Pas tout à fait » ; ligne « Bonne réponse : B — Sur les ventes → dette envers l'État » ; puis explication en 1-2 phrases ; « Bravo ! » conservé | Retour explicite = meilleur apprentissage | S | 3 | P1 |
| 64 | Correction : lien au cours | Aucune passerelle vers le cours depuis la correction | Lien « Revoir dans le cours › » vers la page du chapitre et « ＋ Ajouter à mes flashcards » | Boucle cours ↔ exercice | M | 4 | P2 |
| 65 | Bouton « Question suivante » | Position variable selon la longueur de l'explication (mesuré : visible sans défiler sur 4/4 questions, mais à 656-681 px) | Bouton ancré en bas (sticky, 56 px, au-dessus de la zone sûre), toujours au même endroit pour le pouce | Geste répété 10 fois par série | S | 3 | P1 |
| 66 | Fin de série | Score + étoiles + « Rejouer / Changer de mode / Terminé » : aucun récapitulatif des erreurs ni suite (`tel-clair-exercice-fin-serie`) | Écran de fin : score, « Tes 3 erreurs » (question, ta réponse, bonne réponse, lien cours), boutons « Refaire mes erreurs » (principal), « Exercice suivant », « Retour au chapitre » | Quizlet/Anki reproposent les erreurs ; supprime le cul-de-sac | M | 5 | P1 |
| 67 | Couleur du score | 25 % affiché en vert vif ; 0 % au défi affiché avec 💪 et « +33 XP » (`tel-clair-exercice-fin-serie`, `tel-clair-defi-fin`) | Couleur selon résultat (< 50 % orange, ≥ 80 % vert) et message adapté (« On revoit ça ensemble ») ; XP d'effort seulement si ≥ 1 bonne réponse | Honnêteté du retour, crédibilité des récompenses | S | 3 | P2 |
| 68 | Toast « Badge débloqué » | Le toast couvre les boutons de fin et le pied de page (`tel-clair-exercice-fin-serie`, `tel-clair-bac-blanc-resultat`) | Intégrer le badge dans l'écran de fin (« 🏅 Nouveau badge : Premier pas ») ; toasts éventuels en haut, jamais sur des boutons | Ne pas masquer l'action suivante | S | 3 | P1 |
| 69 | Saisie et texte à trous | « Vérifier » désactivé vert pâle illisible (`tel-clair-exercice-trou`, `-saisie`) | Bouton encre actif dès 1 caractère, Entrée = Vérifier, `inputmode="decimal"` pour les calculs, bouton « Je ne sais pas » | Fluidité, contraste | S | 3 | P2 |
| 70 | Notation mathématique | « u_(n+1) = u_n + r » affiché brut (`tel-clair-defi-correction`) | Rendu avec `<sub>`/`<sup>` ou KaTeX (chargé à la demande) pour indices, puissances, fractions | Lisibilité des maths et de la gestion financière | M | 3 | P2 |
| 71 | Retour sensoriel | Retour seulement visuel | Vibration 15 ms sur bonne réponse (`navigator.vibrate`), sons doux désactivables dans Réglages | Renforcement, comme Duolingo | S | 2 | P3 |
| 72 | Raccourcis clavier | Aucun raccourci dans les exercices | 1-4 ou A-D pour répondre, Entrée pour continuer, V/F pour Vrai/Faux, Espace pour retourner une flashcard | Révision sur ordinateur plus rapide | S | 3 | P2 |
| 73 | « Signaler une erreur » | Lien rouge souligné sous Vrai/Faux, gris ailleurs (`tel-clair-exercice-vraifaux-defi`) | Même style partout : discret, gris 4,5:1, icône ⚑, dans le menu « ⋯ » de l'exercice | Cohérence, ne pas alarmer | S | 1 | P3 |
| 74 | Association | Paires faites peu visibles, pas d'en-têtes de colonnes (`tel-clair-exercice-association`) | En-têtes « Notion » / « Définition », chaque paire validée prend une même couleur et se grise | Compréhension de l'état | S | 2 | P3 |
| 75 | Flashcards | Compteur « 1 / 4 » discret ; pas de reprise des cartes ratées en fin de paquet (`tel-clair-exercice-flashcards`) | Compteur 16 px, en fin de paquet « Revoir les 2 cartes à revoir » (boucle jusqu'à tout savoir) | Principe de la répétition (Anki, Quizlet) | S | 3 | P2 |

### 2.6 Révision

| n° | Écran ou zone | Constat (capture) | Proposition concrète | Pourquoi | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|
| 76 | Page Réviser | Très riche (reprise, compteurs, point faible, carnet d'erreurs) mais aucun bouton unique (`tel-clair-revision-avec-paquet`) | En tête : « Réviser maintenant · 12 cartes · 6 min » qui enchaîne révisions dues + erreurs + flashcards ; détails en dessous | Une décision de moins pour l'élève | M | 4 | P1 |
| 77 | Compteurs « à revoir / à renforcer / acquis » | Trois cases colorées sans explication, non cliquables | Chaque case cliquable vers la liste filtrée ; info « ? » : « À revoir aujourd'hui = thèmes dont la date de révision espacée est arrivée » | Compréhension de la répétition espacée | S | 2 | P2 |
| 78 | Pastille d'onglet | Rien n'indique qu'il y a des révisions dues ou des erreurs à refaire | Pastille numérique sur l'onglet « Réviser » (ex. « 3 ») | Rappel non intrusif (Anki, Instagram) | S | 3 | P2 |
| 79 | Mes flashcards | Paquets enregistrés à la main depuis chaque chapitre | Étagère : un paquet par matière créé automatiquement avec les chapitres lus, nombre de cartes dues, couleur de matière | Moins de manipulations | M | 3 | P2 |
| 80 | Liens « Commencer » des matières | 8 couleurs de liens différentes sur la même page (`tel-clair-revision`) | Un seul style (encre ou or foncé) + pastille couleur de la matière | Charte, contraste (orange et rouge proches de 4,5:1) | S | 1 | P3 |

### 2.7 Bac blanc et Défi du jour

| n° | Écran ou zone | Constat (capture) | Proposition concrète | Pourquoi | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|
| 81 | Note sur 20 | « 12.5/20 » avec un point anglais, en or sur blanc 2,37:1 (`tel-clair-bac-blanc-resultat`) | « 12,5 / 20 » (`Intl.NumberFormat('fr-FR')`) en encre, chiffres Inter `lining-nums` | Format français, contraste | S | 3 | P1 |
| 82 | Bouton « Terminé » | Blanc sur or #c8a24e : 2,4:1 (`tel-clair-bac-blanc-resultat`, `tel-clair-defi-fin`) | Texte encre sur or (style `btn-gold` existant) ou fond or foncé `--c-accent-fort` | WCAG 1.4.3 | S | 3 | P1 |
| 83 | Barre d'examen | Minuteur et pastilles de questions défilent sous l'en-tête (`tel-clair-bac-blanc-question`) | Barre collante sous l'en-tête : « ⏱ 08:42 · Question 3/8 · ☰ » ; pastilles dans une feuille « Aller à la question » | Le temps et la position doivent rester visibles en examen | S | 4 | P1 |
| 84 | Rendre la copie | « Rendre ma copie » sans confirmation même avec des questions vides | Feuille « 2 questions sans réponse. Rendre quand même ? » | Éviter les erreurs coûteuses | S | 3 | P2 |
| 85 | Résultat | Liste de tous les thèmes ; le message « Touche un thème faible pour aller le réviser » tout en bas | En tête : « À revoir en priorité » (3 thèmes les plus faibles, bouton « Réviser ») ; correction question par question repliable ; mentions avec couleurs ≥ 4,5:1 (cyan 3,62:1 aujourd'hui) | Transformer la note en plan d'action | S | 4 | P2 |
| 86 | Choix de durée | Tuiles « 10 min / 8 / questions » sur 3 lignes (`tel-clair-bac-blanc`) | Libellé sur 2 lignes « 10 min » / « 8 questions » ; mémoriser le dernier choix | Lisibilité | S | 1 | P3 |
| 87 | Défi du jour : fin | Score + « Terminé » seulement ; pas de correction ni suite (`tel-clair-defi-fin`) | Liste des 6 questions corrigées, bouton « Continuer : ton thème le plus faible », « Prochain défi dans 7 h » | Fin de parcours utile | S | 4 | P2 |
| 88 | Première STMG | « Bac blanc… comme le jour J » sur SGN, management, droit alors que les épreuves de Première sont le français anticipé (et les maths anticipées) (`tel-p1-bac-blanc`) | Pour la Première : « Contrôle blanc » + section « Épreuves anticipées de Première » ; pour la Terminale, garder « Bac blanc » | Honnêteté pédagogique, confiance | S | 2 | P3 |

### 2.8 Profil et réglages

| n° | Écran ou zone | Constat (capture) | Proposition concrète | Pourquoi | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|
| 89 | Page Moi | 4,1 écrans mêlant statistiques, niveau par matière, badges, suivi parental, réglages, installation, rappels, RGPD (`montages/moi-page.png`) | 3 segments : « Progrès » (stats, matières, badges) · « Réglages » (apparence, accessibilité, langue, rappels, barre du bas, date du bac) · « Compte » (parent, données, déconnexion, suppression) | Trouver un réglage sans faire défiler 4 écrans | M | 3 | P2 |
| 90 | Personnalisation | Bloquée sans installation (`tel-clair-personnaliser`) ; « Personnaliser mon profil 🔒 APPLI » | Débloquer sur le web : thème clair/sombre/auto, taille du texte, onglets ; garder avatars et bannières comme bonus de l'app installée | Les réglages de confort ne doivent pas être des récompenses | S | 4 | P1 |
| 91 | Thème | Bascule à 2 états (clair/sombre) qui remplace définitivement la préférence du système | Choix à 3 : « Automatique (système) · Clair · Sombre » | Respect du réglage du téléphone le soir | S | 2 | P2 |
| 92 | Coach de révision | Minuteur de concentration bloqué sans installation (`tel-clair-coach`, `pc-clair-coach`) | Le débloquer partout (y compris sur ordinateur) | Outil de travail, pas exclusivité | S | 3 | P2 |
| 93 | Filière | « Gestion **Et** Finance » (`text-transform: capitalize`) (`tel-clair-moi`) | Retirer `capitalize`, afficher le nom tel quel | Typographie | S | 1 | P3 |
| 94 | Date du bac | Champ date natif « mm/dd/yyyy » selon le navigateur | `lang="fr"` sur le champ ou choix « Session 2027 » pré-rempli + date modifiable | Clarté | S | 1 | P3 |
| 95 | Statistiques | Tuiles « 0 XP », « 0 % précision », « 0 cours cette semaine » en serif à chiffres elzéviriens | Chiffres Inter 24 px `lining-nums`, libellés 12 px en casse normale ; courbe de progression dès le 1er jour (point unique) | Lisibilité des chiffres | S | 2 | P3 |

### 2.9 Classe et social

| n° | Écran ou zone | Constat (capture) | Proposition concrète | Pourquoi | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|
| 96 | Code ami / code de classe | « 9XCBRV » en Cormorant à chiffres elzéviriens : le 9 ressemble à un g (`tel-clair-amis`) | Police Inter `lining-nums tabular-nums`, groupes « 9XC-BRV », alphabet sans 0/O ni 1/I/l, bouton « Partager » (`navigator.share`) à côté de « Copier » | Un code doit se dicter et se recopier sans erreur | S | 3 | P2 |
| 97 | Message d'erreur Amis | Page Amis : « **Classement** momentanément indisponible » (`tel-clair-amis`) | « Impossible de charger tes amis (connexion). Réessayer » + bouton | Message juste et actionnable | S | 2 | P2 |
| 98 | Classement › Ma classe | Même formulaire de code qu'à la page Classe (`tel-clair-classement`) | État vide illustré « Rejoins ta classe pour voir le classement » + bouton vers Classe | Pas de doublon de formulaire | S | 2 | P3 |
| 99 | Regroupement social | Classe, Classement, Amis = 3 pages séparées, dont 2 en onglets principaux | Une destination « Ensemble » à 3 segments (Ma classe · Amis · Ligue), accessible depuis Moi et le menu | Moins de destinations de premier niveau | M | 3 | P2 |
| 100 | Fonctions avec compte en essai | En mode essai, Amis/Classement mènent à « Crée ton compte… » | Écran d'invitation avec bénéfice concret + ce qui sera gardé, et masquer ces entrées de la barre en mode essai | Ne pas proposer d'impasses | S | 2 | P2 |
| 101 | Boutons désactivés | « Rejoindre », « Envoyer » désactivés en gris plein ou or délavé illisibles (`tel-clair-classe`, `tel-clair-amis`) | Contour or + texte encre ; activation dès que le code a le bon format ; aide « 6 caractères » sous le champ | Contraste, compréhension | S | 1 | P3 |

### 2.10 Boutique et motivation

| n° | Écran ou zone | Constat (capture) | Proposition concrète | Pourquoi | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|
| 102 | En-tête de la Boutique | Héros sombre d'un écran entier répété sur les 4 onglets (`tel-clair-boutique-collections`, `-recompenses`, `-mes-objets`) | Héros complet seulement sur « À la une » ; sur les autres onglets, bande de 64 px « 🪙 248 · Niveau 4 » | Le contenu de l'onglet doit être visible | S | 3 | P2 |
| 103 | Badges | 56 cadenas identiques, 5,8 écrans, textes 3,4:1 (`tel-clair-badges`) | « Prochains badges » en tête (3 badges les plus proches avec barre « 12/50 questions ») ; grille 3 colonnes ; badges verrouillés en silhouette de leur icône ; textes ≥ 4,5:1 | But proche = motivation (effet de gradient d'objectif) | M | 3 | P2 |
| 104 | Séries | Deux séries (connexion et défis) + gels : confusion (`tel-clair-accueil__page`, `tel-clair-defi-fin`) | Une seule série « jours avec au moins un exercice », gel visible (❄️) dans l'en-tête ; l'XP de connexion n'est accordé qu'après le 1er exercice du jour | Récompenser l'étude, pas l'ouverture de l'app | M | 4 | P2 |
| 105 | Récompense quotidienne | Fenêtre plein écran avec confettis à chaque premier lancement du jour (`tel-clair-recompense-du-jour`) | Toast discret en haut « 🔥 4 jours · +25 XP » ; fenêtre seulement aux paliers (7, 30, 100 jours) | Moins d'interruptions, célébrations rares = plus fortes | S | 3 | P1 |
| 106 | XP et pièces | XP et pièces augmentent ensemble (pièces = XP) sans explication | Info « ? » : « XP = ta progression, pièces = à dépenser dans la Boutique » ; afficher les pièces seulement dans la Boutique | Comprendre les deux monnaies | S | 2 | P3 |
| 107 | Niveau | « 420 / 450 XP » abstrait (`tel-clair-moi`) | « Niveau 3 · encore 30 XP pour le niveau 4 » + barre | But concret | S | 2 | P3 |
| 108 | Confettis | Confettis sur récompense quotidienne, badge, score ≥ 80 % | Réservés aux vrais jalons (nouveau niveau, série de 7 jours, bac blanc ≥ 14) ; désactivés avec `prefers-reduced-motion` | Éviter la saturation | S | 2 | P3 |

### 2.11 Mode sombre

| n° | Écran ou zone | Constat (capture) | Proposition concrète | Pourquoi | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|
| 109 | Bandeau d'accueil sombre | Bandeau #17130d sur fond #14110c : il se fond dans la page (`tel-sombre-accueil`) | Fond du bandeau #2a2418 + filet or 1 px à 40 % | Séparer les plans (Material : élévation par éclaircissement en sombre) | S | 2 | P3 |
| 110 | Écran de connexion en sombre | L'écran d'entrée reste ivoire en sombre, mais certains textes prennent leur couleur « sombre » : l'accroche « Des cours clairs… » (#d4ccbd) et « Mot de passe oublié ? » (#d9bd77) deviennent presque invisibles sur l'ivoire (~1,5:1) (`tel-sombre-premier-1-connexion`) | Soit une vraie variante sombre de l'écran (fond #14110c, texte #f1e9dc, or #d9bd77), soit retirer toutes les classes `dark:` à l'intérieur de `.welcome-root` | Bogue de contraste sur le tout premier écran vu le soir | S | 3 | P1 |
| 111 | Textes par opacité | Badges verrouillés, « 13 » d'exercices, mentions en `opacity: .6-.7` → 3,4:1 (`tel-sombre-badges`) | Couleur de texte secondaire dédiée en sombre (#bdb4a2, ≥ 4,5:1) au lieu d'opacités | WCAG 1.4.3 | S | 2 | P2 |
| 112 | Barre d'état | `<meta name="theme-color" content="#1b1813">` unique | Deux balises avec `media="(prefers-color-scheme: …)"` (#f5f1e8 en clair) et mise à jour quand l'élève change de thème | Barre du navigateur assortie au thème | S | 1 | P3 |

### 2.12 Arabe et langues

| n° | Écran ou zone | Constat (capture) | Proposition concrète | Pourquoi | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|
| 113 | Cours français en interface arabe | Paragraphes français alignés à droite, ponctuation renvoyée au début (« .toi, le client final ») (`tel-ar-subject_…_chapter_0`) | `dir="ltr" lang="fr"` (ou `dir="auto"`) sur chaque bloc de cours, titre de chapitre, nom de matière, question d'exercice | Algorithme bidi : un texte latin dans un conteneur RTL est mal ponctué | S | 5 | P1 |
| 114 | Surtitre du chapitre | « THÈME 1 — APPLIQUER LES 1/26 فصل · RÈGLES COMPTABLES » mélangé (`tel-ar-…chapter_0`) | Isoler chaque segment avec `<bdi>` ; mettre le numéro « 1/26 » dans un `<bdi dir="ltr">` | Lisibilité | S | 3 | P1 |
| 115 | Nombres | « XP 450 / 420 » inversé dans le profil (`tel-ar-moi`) ; virgule latine dans « مساء الخير, Léa » | Envelopper les nombres et fractions dans `<bdi dir="ltr">` ; virgule arabe « ، » | Un 420/450 lu 450/420 est faux | S | 3 | P2 |
| 116 | Chaînes non traduites | « Conseillé maintenant », « Ta trousse · 8 outils », « Refermer ta trousse », « Essayer sans compte », « Commencer l'essai », « Tes efforts prennent forme »… codés en dur (`tel-ar-accueil__page`) | Les passer dans `i18n` (fr, en, es, it, ar) ; test automatique qui échoue si du français est codé en dur dans un JSX | Expérience multilingue complète | S | 3 | P1 |
| 117 | Bandeau d'échec de traduction | « تعذرت ترجمة بعض النصوص… إعادة المحاولة » sur chaque page (`tel-ar-*`) | Une seule fois par session, refermable, avec « Afficher en français » | Bruit permanent | S | 2 | P2 |
| 118 | Flèches en RTL | Flèches « → » de « Ton coin à toi », « Badges → » non retournées (`tel-ar-accueil__page`) | Classe `rtl:-scale-x-100` sur toutes les flèches directionnelles (déjà fait pour la carte conseillée) ; ne pas retourner les coches ni les logos | Material Bidirectionality : les icônes de direction se retournent | S | 2 | P2 |
| 119 | Police arabe | Cormorant et Inter n'ont pas de glyphes arabes : repli sur une police système ; `letter-spacing` des surtitres casse les liaisons | Charger Noto Naskh Arabic (titres) / Noto Sans Arabic (texte) pour `lang="ar"` ; `letter-spacing: 0` et pas de capitales en arabe | Lisibilité de l'arabe (les lettres liées ne supportent pas l'espacement) | S | 3 | P2 |
| 120 | Choix de la langue | Codes « FR EN ES IT AR » dans le menu ; aucune mention que les cours restent en français | Noms complets dans leur langue ; phrase « L'interface change de langue ; les cours restent en français (traduction automatique possible) » | Attentes claires | S | 2 | P2 |

### 2.13 Accessibilité

| n° | Écran ou zone | Constat (capture) | Proposition concrète | Pourquoi | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|
| 121 | Taille de base | `html { font-size: var(--scale, 16px) }` impose 16 px et ignore la taille choisie dans le navigateur | `font-size: 100%` puis `calc(100% * var(--echelle, 1))` | Respecter le réglage de l'élève (WCAG 1.4.4, RGAA 10.4) | S | 4 | P1 |
| 122 | Tailles en px | 9, 10, 11 px fixes (Home.css, barre du bas, `text-[10px]`, `text-[11px]`) que « Grand texte » n'agrandit pas (`tel-grand-accueil__page`) | Tout en rem, plancher 0,75 rem (12 px) ; 0,875 rem pour le texte secondaire | Lisibilité, cohérence du réglage | S | 4 | P1 |
| 123 | Anneau de focus | 2 px or à 72 % d'opacité ≈ 1,8:1 sur crème (mesuré au clavier) | `outline: 3px solid #84671b` (clair) / `#e8d5a4` (sombre), `outline-offset: 2px`, opaque | WCAG 1.4.11 et 2.4.7 : indicateur de focus visible à 3:1 | S | 3 | P1 |
| 124 | Lien d'évitement | Aucun « Aller au contenu » ; 8 arrêts de Tab (logo, coach, dictionnaire, recherche, thème, personnalisation, langue, menu) avant le contenu sur ordinateur | Lien d'évitement visible au focus, `<main id="contenu" tabindex="-1">` | RGAA 12.7, WCAG 2.4.1 | S | 2 | P2 |
| 125 | Fenêtres modales | Recherche, Accessibilité, Dictionnaire, Récompense, Personnalisation : pas de `role="dialog"`, le 2ᵉ Tab sort de la fenêtre (mesuré) | `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, piège du focus, retour du focus au bouton d'origine, Échap partout (élément `<dialog>` natif) | WCAG 2.4.3, RGAA 7.1 | M | 4 | P1 |
| 126 | Onglets | Thème, Chapitre, Boutique, Grand oral : boutons avec `aria-current` booléen | Pattern ARIA Tabs : `role="tablist"`/`tab`/`tabpanel`, `aria-selected`, flèches ← → | Lecteurs d'écran | S | 3 | P2 |
| 127 | Fort contraste | Effet à peine visible : dégradés, textes `color-mix`, opacités inchangés (`tel-contraste-accueil`, `tel-contraste-badges`) | En fort contraste : textes secondaires à 7:1, bordures 2 px, plus d'opacités, liens soulignés, bandeau d'accueil uni | Le réglage doit tenir sa promesse | M | 3 | P2 |
| 128 | Préférences système | Les réglages d'accessibilité sont manuels | Activer automatiquement « Fort contraste » avec `prefers-contrast: more`, réduire les animations avec `prefers-reduced-motion` (confettis, secousses, entrées de page) | Respect des réglages du téléphone | S | 2 | P2 |
| 129 | Correction et couleur | Bonne/mauvaise réponse signalées par couleur + émoji ✅/❌ ; rien d'annoncé | Texte visible « Ta réponse » / « Bonne réponse » sur les cartes ; annonce `aria-live="polite"` « Bonne réponse » / « Réponse fausse, la bonne réponse est B » | WCAG 1.4.1 (pas seulement la couleur), 4.1.3 | S | 3 | P2 |
| 130 | Repères ARIA | Barre du bas `aria-label="Accueil"` ; menu `role="menu"` sans `menuitem` | `aria-label="Navigation principale"` ; retirer `role="menu"` (liste de liens dans un `nav`) | Lecteurs d'écran | S | 1 | P2 |
| 131 | Cibles tactiles | ✕ retour et ☰ 36 px, 🖨️ 40 px, 🔊 32 px, « Changer » 16 px, « Badges → » 15 px, liens du pied de page 20 px (mesuré) | 44×44 px pour les icônes, padding vertical pour les liens texte (≥ 24 px, idéal 44) | WCAG 2.5.8 (24 px), Apple 44 pt, Material 48 dp | S | 3 | P1 |
| 132 | Atelier de formules | 42 cases à cocher < 24 px (`tel-clair-atelier-formules`) | Ligne entière cliquable 48 px, case 24 px, « Tout sélectionner » par matière | WCAG 2.5.8 | S | 2 | P2 |
| 133 | Mode dyslexie | Verdana + espacement : correct (`tel-dys-*`) mais capitales espacées des surtitres conservées | Proposer Lexend ou Andika (au choix), supprimer les capitales en mode dys, interligne 1,8 aussi dans les encadrés et exercices | Confort de lecture des élèves dys (fréquents au lycée) | S | 2 | P3 |
| 134 | Écoute des exercices | Lecture à voix haute seulement dans le cours | Bouton 🔊 44 px sur chaque question et chaque correction | Élèves dys, révisions auditives | M | 2 | P3 |
| 135 | Titre d'onglet | Accueil : « RévizSTMG — réviser le bac STMG » ; chapitre : nom du thème seulement | `document.title` = « La TVA · Chapitre 1 — RévizSTMG » ; « Accueil — RévizSTMG » | WCAG 2.4.2, repérage dans les onglets | S | 1 | P3 |

### 2.14 Performances perçues et chargement

| n° | Écran ou zone | Constat (capture) | Proposition concrète | Pourquoi | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|
| 136 | Chargement des pages | Indicateur générique pendant le chargement des pages et des matières | Squelettes (« skeleton ») de la forme de la page (bandeau, cartes, lignes) | Attente perçue plus courte, pas de saut de mise en page | S | 3 | P2 |
| 137 | Préchargement | Chapitre prêt en 3,4 s sur téléphone moyen simulé contre 2,4 s pour l'accueil | Précharger le paquet de la matière du bouton « Continuer » dès l'affichage de l'accueil (`import()` au repos) | Le chapitre suivant s'ouvre instantanément | S | 3 | P2 |
| 138 | Paquet JS initial | 564 Ko (175 Ko gzip) ; l'écran d'inscription (Welcome, 644 lignes + auth) est chargé même pour un élève connecté | Charger Welcome, Customizer, Dictionary à la demande ; cible < 120 Ko gzip pour l'accueil | Téléphones d'entrée de gamme, forfaits limités | M | 3 | P2 |
| 139 | Polices | 10 fichiers de police : Cormorant (500, 500 italique, 600, 700), EB Garamond (500, 600), Inter (400, 500, 600, 700) | Garder Cormorant 500 + Inter variable ; précharger la graisse du titre ; `font-display: swap` | Moins de requêtes, texte visible plus tôt | S | 2 | P3 |
| 140 | Animations d'entrée | `page-enter` 0,33 s + `animate-lux` 0,5 s cumulées sur chaque page | Une seule animation ≤ 200 ms (opacité seule) | Navigation plus vive | S | 2 | P3 |
| 141 | Hors ligne | Hors connexion, erreurs « Classement indisponible » ; rien ne dit que la progression est gardée | Pastille « Hors ligne · ta progression est enregistrée » dans l'en-tête quand `navigator.onLine === false` | Rassurer, expliquer | S | 3 | P2 |

### 2.15 Cohérence de la charte, typographie, icônes

| n° | Écran ou zone | Constat (capture) | Proposition concrète | Pourquoi | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|
| 142 | Hiérarchie des boutons | 4 styles de bouton principal : or dégradé, encre, couleur de matière (vert « Commencer le test », « Question suivante »), bleu canard (« Relier ») | Primaire = encre pleine (texte crème) ; secondaire = contour or ; tertiaire = lien ; or plein réservé aux récompenses ; couleur de matière seulement en accent (pastille, filet) | Un élève reconnaît l'action principale en 0,5 s | S | 4 | P1 |
| 143 | Couleurs hors charte | Vert-bleu de Home.css, bleu canard du parent, cyan des mentions, violet #7c3aed par défaut des barres (`GameProgress`), verts #15803d/#16a34a pour « fait » | Jetons de couleur documentés : encre, papier, carte, or, or-foncé, succès #2f7d4f, erreur #b4232c, info #2b6cb0 ; remplacer toutes les couleurs en dur | Charte « sombre et or » cohérente | S | 3 | P2 |
| 144 | Nom des couleurs | La palette Tailwind `violet` contient… de l'or (`tailwind.config.js`) | Renommer en `or` (ou `gold`) et remplacer `violet-*` dans le code | Évite les erreurs de développement | S | 2 | P3 |
| 145 | Chiffres | Cormorant à chiffres elzéviriens : « Niveau 3 », « 0% », « 420 » avec des chiffres qui descendent (`tel-clair-accueil`, `tel-clair-moi`) | Tous les nombres d'interface en Inter `font-variant-numeric: lining-nums tabular-nums` ; Cormorant seulement pour les titres ≥ 22 px | Lisibilité des données, alignement | S | 3 | P2 |
| 146 | Surtitres | Capitales espacées (0,28 em) à 11 px, parfois sur 3 lignes | Un mot ou deux, 12 px, espacement 0,08 em ; jamais sur plus d'une ligne | Lisibilité | S | 2 | P2 |
| 147 | Icônes | Mélange émojis (🏠🧠📝), glyphes Unicode (◉ ♧ ✦ ⤢ ⚑ ▸ ▾), icônes SVG maison (`Icon.*`) | Un seul jeu SVG (trait 1,75 px) pour l'interface ; émojis gardés pour le contenu ludique (badges, récompenses, matières) | Cohérence, rendu identique sur tous les téléphones | M | 3 | P2 |
| 148 | Gabarit d'en-tête de page | Surtitre + titre + filet + sous-titre ≈ 200 px sur chaque outil (Bac blanc, Défi, Programme…) (`tel-clair-defi`, `tel-clair-programme`) | Version compacte : titre 24 px + sous-titre 1 ligne (≈ 80 px) ; gabarit long réservé à l'accueil et à la boutique | Le contenu remonte d'un tiers d'écran | S | 3 | P2 |
| 149 | Vocabulaire | « jeux » / « exercices », « Réviser » / « Révision intelligente » / « Réviser & réussir », « mon espace » / « Moi » | Glossaire d'interface (10 mots) appliqué partout | Prévisibilité | S | 2 | P2 |
| 150 | Majuscules et coquilles | « Léa, Qu'est-ce que tu veux réviser ? », « mon espace », « Lundi 19 Octobre », « Gestion Et Finance » (`tel-clair-changer`, `tel-clair-moi`) | Corriger les chaînes et supprimer les `capitalize` CSS sur du texte français | Soin perçu | S | 1 | P3 |
| 151 | Pied de page | Pied de page complet (6 liens, auteurs) en bas de chaque écran, visible au milieu des pages courtes (Matière, Défi, Classe) | Dans l'app : liens légaux dans Moi › À propos ; pied de page seulement sur les pages publiques | Moins de bruit, l'app ressemble à une app | S | 3 | P2 |

### 2.16 Ordinateur

| n° | Écran ou zone | Constat (capture) | Proposition concrète | Pourquoi | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|
| 152 | Navigation sur grand écran | Barre d'onglets de téléphone en bas d'un écran de 1 280 px, colonne unique de 896 px (`pc-clair-accueil`) | ≥ 1 024 px : barre latérale gauche de 240 px avec libellés (même destinations), contenu en 2 colonnes (cours + définitions/exercices ; accueil + séance du jour) | Material : rail ou tiroir de navigation sur grands écrans | M | 4 | P2 |
| 153 | En-tête ordinateur | 7 icônes sans libellé (⏱ 📖 🔍 🌙 🎨 🌐 avatar) (`pc-clair-accueil`) | Champ de recherche visible (240 px), le reste dans un menu « Réglages » ; infobulles | Icônes sans texte ambiguës | S | 2 | P3 |

### 2.17 Application installée, professeurs et parents

| n° | Écran ou zone | Constat (capture) | Proposition concrète | Pourquoi | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|
| 154 | Invitation à installer | Bandeau d'installation dès la 1ʳᵉ session, après les cookies (`tel-clair-bandeau-installation`) | Proposer l'installation après 3 sessions ou après un bac blanc, avec bénéfices concrets (« rappel du soir, hors ligne, plein écran ») | Demander au bon moment (UX Planet sur les permissions trop tôt) | S | 3 | P2 |
| 155 | Raccourcis d'icône | Aucun raccourci dans le manifeste | `shortcuts` du manifeste : « Défi du jour », « Réviser », « Bac blanc » (appui long sur l'icône) | Accès en 1 geste depuis l'écran d'accueil du téléphone | S | 2 | P3 |
| 156 | Espace parent | Bouton « Relier » bleu canard hors charte ; aucun aperçu avant de saisir le code (`tel-clair-parent`) | Bouton encre de la charte ; aperçu « exemple de suivi » (données fictives) sous le formulaire | Rassurer le parent sur ce qu'il verra | S | 2 | P3 |
| 157 | Guide et FAQ | FAQ : « onglet Classe » (absent par défaut) ; Guide : « Ouvre revizstmg.github.io » dans l'app (`tel-clair-faq`, `tel-clair-guide`) | Mettre les textes à jour d'après la nouvelle barre ; dans l'app, guide = 3 cartes d'astuces contextuelles au lieu d'une page | Aide juste | S | 1 | P3 |

## 3. Les 15 chantiers à faire en premier

Classés par rapport impact / effort. Chaque ligne regroupe des propositions du tableau.

| Rang | Chantier | Propositions | Pourquoi d'abord (une phrase) |
|---|---|---|---|
| 1 | Barre du bas centrée sur la révision : **Accueil · Cours · Réviser · Bac blanc · Moi** | 26, 27, 37 | C'est l'élément vu sur chaque écran : aujourd'hui 3 onglets sur 5 (Boutique, Amis, Classement) détournent de la révision et 2 sont bloqués sans compte. |
| 2 | Première minute : écran vitrine + « Commencer gratuitement » + essai en un seul écran | 1, 2, 4 | Un nouveau venu voit un mur « Se connecter » puis 3 écrans et 5 s d'animation avant le moindre contenu ; c'est là que l'on perd le plus d'élèves. |
| 3 | Accueil réordonné avec un bouton « Continuer : <chapitre> » qui ouvre l'activité | 14, 15, 16, 20, 25 | L'accueil fait 3,1 écrans, répète la série 4 fois et met la recommandation au 2ᵉ écran ; un seul bouton doit mener à la séance du jour. |
| 4 | Exercice en mode immersif : sans barre ni pied de page, ✕ avec confirmation, sans étape « choix du mode » | 42, 57, 58, 59, 65 | 6 touchers et beaucoup de distractions séparent l'élève de la question ; Duolingo et Quizlet isolent la question pour garder l'attention. |
| 5 | Écran de fin de série avec « Tes erreurs » et « Refaire mes erreurs » / « Exercice suivant » | 66, 67, 68 | L'écran de fin actuel est un cul-de-sac sans correction récapitulative ; revoir ses erreurs est le geste qui fait le plus progresser. |
| 6 | Enchaînement cours → exercices (carte « Cours terminé → 5 questions », bouton « Lancer la série du chapitre ») | 47, 60, 64 | Le cours et les exercices sont dans deux onglets sans passerelle ; l'apprentissage actif doit suivre la lecture sans effort. |
| 7 | Recherche plein texte (notions, définitions, formules), insensible aux accents, loupe visible | 38, 39, 40 | « seuil de rentabilite » ne donne aucun résultat : la recherche est le raccourci de l'élève la veille d'un contrôle. |
| 8 | Une seule sollicitation par session (récompense, installation, cookies, badges) | 6, 7, 105, 154 | Jusqu'à 5 fenêtres et bandeaux se superposent à l'arrivée, dont 2 qui cachent la barre de navigation. |
| 9 | Arabe : `dir="ltr" lang="fr"` sur les contenus français, `<bdi>` pour les nombres, chaînes passées en i18n | 113, 114, 115, 116 | En arabe, les cours sont mal ponctués et certains chiffres inversés (« XP 450 / 420 ») : le contenu devient faux à la lecture. |
| 10 | Lecture du cours : en-tête compact, texte 17 px, moins de gras, 68 caractères max sur ordinateur | 31, 43, 44, 45, 46 | Les en-têtes prennent 45 % du premier écran du cours et le gras partout efface la hiérarchie des notions. |
| 11 | Tailles en rem, plancher 12 px, respect de la taille du navigateur, cibles 44 px | 17, 121, 122, 131 | Des textes de 9-10 px et des boutons de 36 px gênent tout le monde et rendent le réglage « Grand texte » inopérant. |
| 12 | Fenêtres accessibles (`<dialog>`, piège du focus, Échap) et anneau de focus visible à 3:1 | 123, 125 | Au clavier, le focus sort de la recherche dès le 2ᵉ Tab et l'anneau or à 1,8:1 est presque invisible. |
| 13 | Flèche retour 44 px, un seul fil d'Ariane, onglets collants qui ne passent plus sous l'en-tête | 30, 31, 34 | Correctifs rapides qui suppriment les doublons (2 croix, 2 fils d'Ariane) et un bogue visible au défilement. |
| 14 | Bogues de contraste rapides : textes pâles de la connexion en mode sombre, note « 12.5 » dorée, bouton « Terminé » blanc sur or | 81, 82, 110 | Trois correctifs de quelques lignes sur des écrans clés (1er écran le soir, résultat du bac blanc). |
| 15 | Une hiérarchie de boutons et des couleurs de charte uniques | 142, 143, 145 | Quatre styles de bouton principal et cinq couleurs hors charte brouillent la lecture et l'identité « sombre et or ». |

## 4. Maquettes textuelles des écrans clés réorganisés

### A. Accueil (téléphone 390 px), objectif : moins de 2 écrans, un seul bouton principal

```
┌────────────────────────────────────────┐
│ ◇ RévizSTMG              🔍   🔥 3   ☰ │  en-tête 52 px, loupe visible
├────────────────────────────────────────┤
│ ╔════════════════════════════════════╗ │  bandeau sombre et or, 220 px
│ ║ (LT)  Bonsoir Léa                  ║ │
│ ║       Terminale GF · Niveau 3      ║ │
│ ║  Objectif du jour   ◔  4 / 10 min  ║ │
│ ║ ┌────────────────────────────────┐ ║ │
│ ║ │ ▶  Continuer : La TVA          │ ║ │  bouton or 56 px
│ ║ │    Chapitre 1 · fiche + 5 q.   │ ║ │
│ ║ └────────────────────────────────┘ ║ │
│ ╚════════════════════════════════════╝ │
│ Conseillé maintenant                   │
│ ┌────────────────────────────────────┐ │
│ │ 🧠  3 thèmes à revoir · 6 min    › │ │
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │ ⚡  Défi du jour · 6 questions      │ │
│ │     série de défis : 2   [Relever] │ │
│ └────────────────────────────────────┘ │
│ Raccourcis                      Tout › │
│ [📝 Bac blanc][🃏 Flashcards][📐 Formules][🧭 Méthodo] →
│ Mes matières                           │
│ 💰 Gestion et Finance   ▓▓▓░░░ 12 %  › │  lignes de 56 px
│ 🏢 Management           ▓░░░░░  4 %  › │
│ ⚖️ Droit                ░░░░░░  0 %  › │
│ …  (8 matières ≈ 1 écran)              │
├────────────────────────────────────────┤
│  🏠        📖       🧠 ③      📝      👤 │  icônes 24 px, libellés 12 px
│ Accueil   Cours   Réviser  Bac blanc  Moi│
└────────────────────────────────────────┘
```

### B. Exercice en mode immersif, après une réponse fausse

```
┌────────────────────────────────────────┐
│ ✕    ▓▓▓▓▓▓░░░░░░░░░░░░░░░░    3 / 10   │  48 px ; ✕ = « Arrêter la série ? »
├────────────────────────────────────────┤
│                              ⏱ Défi ○  │  interrupteur Défi, mode mémorisé
│ Quelle est la bonne définition de       │
│ « TVA collectée » ?                     │  question 19 px
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ A  Sur les achats → créance   ✗    │ │  rouge + texte « Ta réponse »
│ │    Ta réponse                      │ │
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │ B  Sur les ventes → dette     ✓    │ │  vert + « Bonne réponse »
│ │    envers l'État   Bonne réponse   │ │
│ └────────────────────────────────────┘ │
│ ┌ C … ┐  ┌ D … ┐  (grisées)            │
│                                        │
│ Pas tout à fait.                       │
│ La TVA collectée est facturée sur les  │
│ ventes : l'entreprise la doit à l'État.│
│ Revoir dans le cours ›   ＋ Flashcard   │
├────────────────────────────────────────┤
│ ┌────────────────────────────────────┐ │  bouton ancré en bas, 56 px
│ │        Question suivante →         │ │  (Entrée au clavier)
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
   (pas de barre d'onglets, pas de pied de page)
```

### C. Fin de série

```
┌────────────────────────────────────────┐
│ ✕                                      │
│            7 / 10   ★★☆                │  score en encre, pas d'or pâle
│        Bien joué, Léa ! +70 XP         │
│        🏅 Nouveau badge : Premier pas   │  le badge est ici, pas en toast
│                                        │
│ Tes 3 erreurs                          │
│ ┌────────────────────────────────────┐ │
│ │ TVA collectée : ta réponse « sur   │ │
│ │ les achats » → bonne : « sur les   │ │
│ │ ventes »          Revoir le cours ›│ │
│ ├────────────────────────────────────┤ │
│ │ Prix HT / TTC …                    │ │
│ ├────────────────────────────────────┤ │
│ │ TVA à décaisser …                  │ │
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │   ↻  Refaire mes 3 erreurs         │ │  bouton principal
│ └────────────────────────────────────┘ │
│ ┌──────────────────┐ ┌───────────────┐ │
│ │ Exercice suivant │ │ Au chapitre   │ │  boutons secondaires
│ └──────────────────┘ └───────────────┘ │
└────────────────────────────────────────┘
```

### D. Premier lancement (écran vitrine puis essai en un écran)

```
┌────────────────────────────────────────┐   ┌────────────────────────────────────────┐
│               RévizSTMG                │   │ ‹                                      │
│                                        │   │ Tu es en…                              │
│    Révise ton bac STMG,                │   │ ┌──────────────┐  ┌──────────────┐     │
│    10 minutes par jour.                │   │ │ 📘 Première  │  │ 📕 Terminale │     │  tuiles 120 px
│                                        │   │ └──────────────┘  └──────────────┘     │
│  📖  Le cours en fiches courtes        │   │ Ta spécialité                          │
│  ✅  Des exercices corrigés tout de    │   │ (💰 Gestion-Finance) (🛍 Mercatique)   │
│      suite                             │   │ (👥 RH-Communication) (💻 SIG)         │
│  📝  Des bacs blancs notés sur 20      │   │                                        │
│                                        │   │ ┌────────────────────────────────────┐ │
│ ┌────────────────────────────────────┐ │   │ │   C'est parti : ma 1ʳᵉ séance →    │ │
│ │     Commencer gratuitement         │ │   │ └────────────────────────────────────┘ │
│ └────────────────────────────────────┘ │   │ Sans compte : ta progression reste sur │
│        J'ai déjà un compte             │   │ ce téléphone. Tu pourras la garder     │
│                                        │   │ plus tard en créant un compte.         │
│  Professeur ? · Parent ?               │   │                                        │
└────────────────────────────────────────┘   └────────────────────────────────────────┘
```

### E. Chapitre : lecteur compact (téléphone)

```
┌────────────────────────────────────────┐
│ ‹ Règles comptables       🔍   🔥 3  ⋯ │  ⋯ = imprimer, écouter, signaler
│ [ Cours ] [ Définitions ] [ Exercices 13 ]│  onglets collés sous l'en-tête
├────────────────────────────────────────┤
│ Thème 1 · Chapitre 1 sur 26            │  13 px, casse normale
│ La TVA : collectée, déductible,        │  titre 22 px
│ à décaisser                            │
│ ┌────────────────────────────────────┐ │
│ │ 💡 Cas                             │ │
│ │ Tu paies ton café 2,40 €…          │ │
│ └────────────────────────────────────┘ │
│ Décomposons ce prix. Le prix hors      │  17 px, 1-2 notions en gras
│ taxes (HT) est de 2,00 €. On y ajoute  │  par paragraphe
│ la TVA (0,40 €) pour obtenir le prix   │
│ toutes taxes comprises (TTC)…          │
│                                        │
│      ‹   ● ○ ○ ○   Page 1/4 · 2 min  › │  balayage gauche/droite
└────────────────────────────────────────┘
   dernière page : « Cours terminé ✓  → 5 questions pour vérifier (2 min) »
```

## 5. Méthode et limites

- Captures avec Playwright (Chromium) : élève fictif « Léa » injecté dans `localStorage`, réseau extérieur bloqué, téléphone 390×844 (échelle 2, tactile) et ordinateur 1280×900, thèmes clair et sombre, arabe, Première et Terminale, réglages dyslexie / fort contraste / grand texte ; premier lancement sans profil (connexion, essai, inscription, choix des chapitres, « Bienvenue »).
- Mesures automatiques sur chaque écran : hauteur de page, débordement horizontal, cibles < 24 px et < 44 px, contraste WCAG de chaque texte (fond calculé en remontant les ancêtres ; pour un dégradé, pire couleur du dégradé), tailles de police ; parcours clavier ; audit axe-core 4.10 (WCAG 2.2 A/AA) sur 15 écrans ; chargement avec CPU ×4 et 4G lente (1,6 Mb/s, 150 ms).
- Limites : sans réseau, le classement, les amis, la classe et la traduction automatique affichent leurs états d'erreur (c'est aussi ce que voit un élève hors ligne) ; les écrans professeur (création de classe, tableau de bord) n'ont pas été parcourus avec un vrai compte ; les octets mesurés en local ne sont pas compressés (GitHub Pages sert du gzip, environ 3 fois moins).
- Scripts réutilisables : `scripts-interface/routes.mjs` (toutes les routes pour une configuration), `interactions.mjs` (menu, recherche, exercice, correction, fin de série, bac blanc, défi, boutique), `premier.mjs` (premier lancement), `speciales.mjs` (chargement, longueur des lignes, clavier, axe), `montage.py` et `bandes.py` (planches).

## 6. Sources consultées

Normes et guides de conception
- WCAG 2.2, critère 2.5.8 « Target Size (Minimum) » (24 px, exceptions d'espacement et de texte) : [TabNav Academy](https://tabnav.com/academy/wcag/success-criterion-2.5.8), [BOIA](https://www.boia.org/blog/understanding-target-size-under-wcag-2.2-and-how-it-affects-people-with-disabilities), [DAISY Knowledge Base](https://kb.daisy.org/publishing/docs/wcag/target-size-minimum.html) ; référence officielle : https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html (non joignable depuis la session, citée pour mémoire).
- RGAA 4 et contrastes (4,5:1, 3:1 pour le gros texte et les composants) : [Table de correspondance RGAA 4 / WCAG 2.1, design.numerique.gouv.fr](https://design.numerique.gouv.fr/assets/pdf/RGAA4_vs_WCAG2.1.pdf), [exemple d'audit RGAA (Mobilize)](https://www.mobilize-fs.com/sites/default/files/media/pdf/Audit%20accessibilit%C3%A9%20RGAA%20Mobilize_0.pdf).
- Material Design 3, barre de navigation (3 à 5 destinations d'égale importance) : [Android Developers, Navigation bar](https://developer.android.google.cn/develop/ui/compose/components/navigation-bar?hl=ca), [Material 3 NavigationBar (Compose)](https://kotlinlang.org/api/compose-multiplatform/material3/androidx.compose.material3/-navigation-bar.html), [SAP Fiori pour Android, navigation bar M3](https://www.sap.com/design-system/fiori-design-android/v25-8/components/m3-standard-components/navigation-bar/usage).
- Apple Human Interface Guidelines, barres d'onglets et cibles de 44 pt : [Apple HIG – Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars), [Deque – touch target size (iOS)](https://dequeuniversity.com/rules/attest-ios/1.0/touch-target-size), [Uxcel – minimum tap target size](https://app.uxcel.com/courses/mobile-design/ios-app-design-712/minimum-tap-target-size-8996).
- Bidirectionnalité (RTL), icônes à retourner ou non : [Material Design – Bidirectionality](https://m2.material.io/go/design-bidirectionality), [Material 1 – Bidirectionality](https://m1.material.io/usability/bidirectionality.html), [Mozilla – RTL guidelines](https://firefox-source-docs.mozilla.org/code-quality/coding-style/rtl_guidelines.html), [Wikimedia Codex – Bidirectionality](https://doc.wikimedia.org/codex/main/style-guide/bidirectionality.html).
- Chiffres alignés et tabulaires : [MDN – font-variant-numeric](https://developer.mozilla.org/docs/Web/CSS/font-variant-numeric).
- Longueur des lignes (50-75 caractères, WCAG 1.4.8 ≤ 80) : [Optimal Line Length in Reading – revue de littérature (Visible Language)](https://journals.uc.edu/index.php/vl/article/view/5765), [CLEO – Clear design tips](https://www.cleo.on.ca/en/publications/clear-design-tips), [MediaWiki – Limiting content width](https://www.mediawiki.org/wiki/Reading/Web/Desktop_Improvements/Features/Limiting_content_width/de).
- Icônes et libellés : [Nielsen Norman Group – Icon Usability](https://www.nngroup.com/videos/icon-usability/), [US DOT – icônes et libellés](https://www.fhwa.dot.gov/publications/research/safety/03065/05.cfm).
- Cookies et consentement : [CNIL – solutions pour la mesure d'audience](https://www.cnil.fr/fr/solutions-pour-la-mesure-daudience), [CNIL – FAQ cookies](https://cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/FAQ).

Applications de référence (habitudes des lycéens)
- Duolingo, première leçon avant le compte et engagement progressif : [Appcues – The 10 best user onboarding experiences](https://www.appcues.com/blog/the-10-best-user-onboarding-experiences), [ReallyGoodUX – Duolingo user onboarding](https://www.reallygoodux.io/blog/duolingo-user-onboarding), [UX Planet – Duolingo UX analysis](https://uxplanet.org/duolingo-ux-analysis-9631ff3f4eb1) (le chiffre de +20 % d'utilisateurs actifs vient d'Appcues et n'a pas pu être vérifié à la source).
- Quizlet « Apprendre » et reprise des erreurs en fin de manche : [Using Quizlet (SlideShare)](https://www.slideshare.net/slideshow/using-quizlet/15162607), [Skritter – Learn mode and test mode](https://docs.skritter.com/article/270-learn-mode-and-test-mode).
- Anki (répétition espacée), Kartable, SchoolMouv, Notion, Instagram/TikTok : références d'usage générales (barre du bas à 5 onglets, en-tête masqué au défilement, objectif quotidien, mode plein écran pour l'exercice), sans source chiffrée.
