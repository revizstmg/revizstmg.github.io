# RévizSTMG — inspection des parcours et des défauts

*Inspection des parcours réels et des défauts — 19 et 20 octobre 2026, version en ligne servie en local.*

## 1. Synthèse

**Périmètre.** Version en ligne servie en local (http://localhost:4201), parcourue avec Chromium (Playwright) en 320, 390 et 1 440 px, en iPhone simulé, en sombre, avec les réglages d'accessibilité, en cinq langues, hors ligne et avec le service worker. Profils joués : visiteur, essai sans compte, Première, Terminale dans les quatre spécialités (GF, Mercatique, RH-Communication, SIG), professeur, parent. Les fonctions en ligne ont été jouées avec un faux serveur Supabase (connexion, inscription, profil, classe, parent). Environ 370 captures dans `inspection/parcours/captures/`, scripts dans `inspection/parcours/`.

**Ce qui marche bien.**
- Aucune erreur JavaScript sur les 35 routes visitées ni pendant les parcours ; aucun débordement horizontal à 320, 390 et 1 440 px, ni en arabe (droite à gauche correct).
- Adresses fausses bien gérées : route inconnue, matière, thème ou chapitre inexistant → page « Introuvable » avec un lien pour remonter ; anciennes adresses (`/express`, `/formules`, paquet inexistant) redirigées.
- Hors ligne solide : le service worker met 101 fichiers en cache ; accueil, matières, thèmes, bac blanc, défi, coach IA et rechargement complet fonctionnent sans réseau.
- Le moteur d'exercices tient : QCM, vrai/faux, textes à trous, réponses à écrire, association, flashcards, calcul, compréhension vont jusqu'à la correction et au score ; carnet d'erreurs rejouable ; paquets de flashcards enregistrables et rejouables en plein écran.
- Déconnexion puis reconnexion d'un compte : XP, pièces, notes et date du bac retrouvés. Espace classe du professeur et tableau de bord parent complets avec des données simulées. Thème sombre propre, réglages d'accessibilité efficaces sans casser la mise en page.

**Les 10 améliorations les plus importantes.**
1. **La maîtrise ne bouge pas quand l'élève travaille** : les exercices des chapitres (l'essentiel de ce qu'il fait) ne comptent pas dans le pourcentage du thème, de la matière et de l'accueil ; 11 exercices réussis laissent « 0 % » (D1, D23).
2. **Inscription avec confirmation d'e-mail : le compte devient inutilisable** (profil jamais créé, connexion refusée par un code de classe invisible) (D2).
3. **L'essai sans compte perd ses données** : « Se déconnecter » efface tout sans prévenir, et se connecter à un compte existant écrase la progression d'essai, contrairement à la promesse affichée (D3, D4).
4. **La synchronisation du compte est incomplète** : filière, classe quittée, photo, notes de thème, Grand Oral, date du bac ne partent pas (ou repartent en arrière) (D5, D6, D8, D18).
5. **Un exercice ou un sujet de 4 h ne survit pas à un rechargement ou au geste « retour »**, et « Quitter » ne demande jamais de confirmation (D11, D12, D24).
6. **Le test du thème se valide à vide** (14 réponses vides → 82 %), ce qui ouvre aussi les « mois Premium offerts » de la boutique (D9).
7. **Un bac blanc remplit l'objectif de la semaine** (17 « cours » d'un coup, récompense, chiffres vus par le parent et la classe) (D10).
8. **Premier écran trop fermé** : CGU, confidentialité, FAQ et guide cachés derrière la connexion ; l'espace parent n'est pas proposé (D15, D17).
9. **Professeur et parent reçoivent l'interface d'un élève** (accueil, série, boutique, pas d'onglet Classe pour le prof) (D14, D27).
10. **Trop de fenêtres à l'arrivée** et bandeau d'installation posé sur la barre d'onglets du téléphone ; libellés restés en français dans les autres langues (D13, D37, D16).

## 2. Défauts trouvés

Gravité : **bloquant** (perte de données, impasse ou chiffre central faux), **important** (gêne réelle d'un parcours fréquent), **mineur** (finition). Les captures sont dans `inspection/parcours/captures/`. « Code » : constaté à la lecture du code, non reproductible ici.

| n° | Profil | Écran / route | Étapes pour reproduire | Ce qui se passe | Ce qui devrait se passer | Gravité | Capture |
|---|---|---|---|---|---|---|---|
| D1 | Élève (toutes filières) | Chapitre → Exercices ; thème, matière, accueil | GF T1, chapitre 1 : faire les 11 exercices (flashcards à 100 %, QCM, vrai/faux…) puis ouvrir le thème, la matière et l'accueil | Maîtrise du thème 0 %, matière 0 %, accueil 0 %. Seuls le test du thème et les rares jeux écrits à la main comptent. Même constat en RH (seul « rh-t1-trou » compte), SIG (15 % grâce au seul « Tri »), Première SGN (rien) | Chaque exercice réussi fait monter le chapitre, le thème, la matière et l'accueil | bloquant | T-gestion-finance-gf-t1-0-theme-progression-apres.png |
| D2 | Visiteur qui s'inscrit | Écran de connexion | Créer un compte élève (nom, Terminale, code classe) quand Supabase demande de confirmer l'e-mail, puis se connecter avec le mot de passe | « Compte créé ! Vérifie ton e-mail » ; aucun profil créé côté serveur ; à la connexion : « Ce code ne correspond à aucune classe » (le code saisi reste en mémoire, champ absent de l'écran de connexion) ; sans code (d’après le code) : « Profil du compte indisponible » | Profil enregistré dès l'inscription, complété à la première connexion ; code de classe vérifié plus tard, sans bloquer | bloquant | B2-confirmation.png, B3-connexion-apres-confirmation.png |
| D3 | Essai sans compte | Menu ☰ → « Se déconnecter » | Essai avec 500 XP, 200 pièces, un chapitre ; menu → Se déconnecter | Aucune confirmation ; XP, pièces, chapitres, prénom et filière effacés ; écran de connexion | Pas de « Se déconnecter » en essai, ou avertissement clair et proposition de créer un compte | bloquant | v09-menu-essai.png, v10-apres-deconnexion-essai.png |
| D4 | Essai → compte existant | Bandeau « Créer mon compte » → « Déjà un compte ? » | Essai (500 XP, 300 pièces, chapitre, favori, notes), puis connexion à un compte qui a 100 XP | Après connexion : 100 XP, 50 pièces, chapitres, favoris et notes de l'essai perdus, alors que l'écran promet « Rien de ce que tu as fait ne sera perdu » | Fusion de l'essai avec le compte (meilleur des deux) | important | A2-apres-connexion.png |
| D5 | Compte connecté | Accueil → « Changer » (`/changer`) | Passer de Terminale GF à Première, relancer l'app | Retour en Terminale GF : rien n'est envoyé au profil, qui l'emporte au démarrage | Filière enregistrée sur le compte | important | C1-filiere-apres-relance.png |
| D6 | Compte connecté | Thème → Outils → Mes notes ; Mon espace → date du bac ; Grand Oral | Écrire une note, une date, une question de Grand Oral ; observer les envois au serveur | 0 envoi en 5 s : ces données ne partent qu'au prochain gain d'XP ou à la déconnexion ; une autre machine ne les voit pas | Toute modification d'une donnée du compte est envoyée (anti-rebond) | important | — (journal réseau, p5-compte.txt) |
| D7 | Compte connecté | Badges → « Réinitialiser ma progression » | Confirmer la réinitialisation, puis relancer | Écran de connexion comme après une déconnexion, alors que la session reste ouverte ; après relance, toute la progression revient (2 400 XP) | Vraie remise à zéro (appareil + compte) dans Mon espace, ou bouton retiré | important | E1-apres-reinitialisation.png, E2-apres-relance.png |
| D8 | Élève connecté | Classe → « Changer de classe » | Cliquer, puis relancer l'app | Sans confirmation ; seul l'appareil change ; après relance l'élève est de nouveau dans la classe | Confirmation et mise à jour du profil | important | — (p9-parent-prof.txt) |
| D9 | Élève | Thème → Test du thème | Répondre au QCM au hasard, laisser vides les 14 questions rédigées, cliquer « Voir le corrigé » puis « Je maîtrisais » | 82 %, +216 XP ; quiz du thème enregistré à 82 % ; ces tests comptent pour les « mois Premium / Ultimate offerts » | Réponse écrite exigée avant le corrigé ; part auto-évaluée plafonnée | important | i4-test-theme-vide.png |
| D10 | Élève | Bac blanc | Lancer 20 questions, en répondre 5, « Rendre ma copie » | Aucune confirmation malgré 15 questions vides ; 17 thèmes ajoutés à l'objectif de la semaine → 5/5, « Récupérer la récompense » (+60 XP), « 17 cours cette semaine » dans Mon espace, transmis au parent et à la classe | Le bac blanc ne compte pas comme cours travaillé ; confirmation si des questions sont sans réponse | important | i5-bac-blanc-resultat.png |
| D11 | Élève | Chapitre → exercice en cours | En plein QCM (question 3/4) : recharger, ou faire « retour » (geste Android, bouton du navigateur) | Rechargement : retour au chapitre, onglet Cours, série perdue. Retour : on quitte le chapitre pour la page du thème | L'exercice a sa propre adresse ; reprise proposée ; confirmation avant de quitter | important | i1-rechargement-exercice.png, i2-retour-arriere-exercice.png |
| D12 | Élève de Terminale | Bac blanc → Sujets au format de l'épreuve (4 h) | Ouvrir « Droit et économie », travailler, toucher « Quitter » ou recharger | Aucune confirmation, aucune sauvegarde : le travail d'un sujet de 4 h est perdu | Sauvegarde automatique, reprise, confirmation | important | sb-sujet.png |
| D13 | Élève sur téléphone | Accueil, première visite | Commencer l'essai, fermer le bandeau cookies | Le bandeau « Installe RévizSTMG » (90 px de haut, au-dessus de tout) recouvre la barre d'onglets jusqu'à sa fermeture | Bandeau placé au-dessus de la barre ou dans la page, et pas dès la première minute | important | ip-apres-cookies.png |
| D14 | Professeur | Accueil, barre d'onglets | Se connecter avec un compte prof | Accueil d'élève (« Commencer », série, défi, boutique) ; bandeau « TERMINALE STMG · » suivi de rien ; matières sans spécialité ; barre Accueil/Réviser/Boutique/Amis/Classement, sans « Classe » ; la classe n'est atteignable qu'en bas de l'accueil | Accueil prof (classes, codes, activité des élèves, QCM) et onglet Classe | important | r-prof-accueil.png |
| D15 | Visiteur sans profil | `#/cgu`, `#/confidentialite`, `#/faq`, `#/guide` | Ouvrir ces adresses, ou le lien « Lire » de l'étape 3 de l'inscription (nouvel onglet) | L'écran de connexion recouvre la page : impossible de lire les CGU et la politique de confidentialité avant d'y consentir | Pages légales et FAQ lisibles sans compte | important | v02-sans-profil-cgu.png |
| D16 | Élève en en / es / it / ar | Accueil, chapitre, Grand Oral, FAQ, Programme | Choisir une autre langue | « Conseillé maintenant », « Ta trousse · 8 outils », titres d'exercices, Grand Oral et FAQ restent en français ; sans le service de traduction, bandeau « Some text could not be translated » sur chaque page | Textes d'interface intégrés aux fichiers de langue ; bandeau discret, une seule fois | important | l-en-accueil.png, m3.png |
| D17 | Parent | Premier lancement | Arriver sur le site et chercher l'espace parent | Rien sur l'écran de connexion ; le bouton « Je suis parent » de l'écran de choix est caché dessous ; chemin réel : « Créer un compte » → « Parent » → « Continuer » | Lien « Je suis parent » visible dès le premier écran | important | p-parent-inscription.png |
| D18 | Compte (appli installée) | Personnaliser → photo de profil | Changer sa photo, relancer l'app en ligne | La photo reste sur l'appareil et est remplacée au démarrage par celle du serveur (vide) | Photo enregistrée sur le profil du compte | important (code) | — |
| D19 | Élève | Défi du jour | Répondre à 2 questions (corrections vues), recharger | Retour à l'intro, mêmes questions dans le même ordre : on refait le défi en connaissant les réponses ; les erreurs du défi n'entrent pas dans le carnet | Défi commencé repris où il en était ; erreurs au carnet | mineur | i3-defi-fin.png |
| D20 | Élève | Accueil, défi du jour, série | Ouvrir l'app à 0 h 30 (heure de Paris) le lendemain d'un jour travaillé | Pas de récompense de connexion ; défi « relevé ! Reviens demain » : le jour change à 2 h (heure d'été), 1 h (hiver), car la date est calculée en UTC | Jour calculé à l'heure locale | mineur | — (p12-minuit.txt) |
| D21 | Élève | Association, Memory, Flashcards, Remise en ordre, Texte à trous | Choisir le mode « Défi » (« Chronomètre + score ») | Aucun chronomètre ; 15 XP par bonne réponse au lieu de 10 | Chronomètre réel, ou pas de choix de mode pour ces jeux | mineur | — |
| D22 | Élève | Chapitre → Flashcards | Toucher « Je savais » sur chaque carte, rejouer | 100 %, 10 XP et 10 pièces par carte, à chaque partie, sans contrôle | XP limité (par jour ou par paquet) pour l'auto-évaluation | mineur | T-gestion-finance-gf-t1-0-exo12-fin.png |
| D23 | Élève | Thème → onglet Progression | Ouvrir l'onglet après avoir travaillé | « Détail par jeu » liste 9 jeux (« QCM — Comptabilité & TVA », « Flashcards — Définitions clés »…) que l'élève ne voit pas dans ses chapitres ; tous restent à « — » | Lister les exercices réellement proposés, par chapitre | mineur | T-gestion-finance-gf-t1-0-theme-progression-apres.png |
| D24 | Élève | Exercice, test du thème, défi | « ← Quitter » après quelques réponses | Sortie immédiate, sans confirmation, réponses perdues | Confirmation dès qu'une réponse a été donnée | mineur | — |
| D25 | Élève | Réviser → Mes flashcards → paquet enregistré | Finir le paquet | Au plus 15 XP, et seulement via « Terminer maintenant » ; la croix ✕ ne donne rien ; aucun effet sur la révision espacée | Même barème que dans le chapitre ; résultat pris en compte | mineur | k1-paquet.png |
| D26 | Élève | Réviser → Carnet d'erreurs | Rater « Écris le terme », « Complète — à écrire », association, memory, calcul, bac blanc, test du thème | Rien n'entre dans le carnet (seuls QCM, vrai/faux et trous y vont) | Toutes les questions ratées vont au carnet | mineur | i6-revision.png |
| D27 | Parent | Menu ☰ de l'espace parent | Ouvrir le menu | « Accueil » et « mon espace » ramènent sur /parent ; série « 0 » dans l'en-tête ; outils d'élève (dictionnaire, personnaliser) | Menu de parent (espace, aide, langue) | mineur | p-parent-menu.png |
| D28 | Parent | Espace parent sans réseau | Saisir le code de l'enfant hors connexion | Message « Aucun élève trouvé pour ce code » au lieu d'une erreur de connexion | « Pas de connexion, réessaie » | mineur (code) | — |
| D29 | Élève | Mon espace → Personnaliser ; Coach ; icône chronomètre de l'en-tête | Cliquer dans le navigateur | Écran « réservé à l'application installée » ; rien ne l'annonçait dans la trousse ni dans l'en-tête | Verrou signalé avant le clic, ou version navigateur | mineur | m1.png |
| D30 | Compte | Mon espace | Vouloir corriger son prénom ou son nom | Aucun écran pour le faire (la fonction existe mais n'est jamais appelée) | « Mes informations » modifiables | mineur (code) | — |
| D31 | Élève | `/changer` puis Favoris | Passer de Terminale GF à Première | Les thèmes de Terminale restent en favoris et sont conseillés sur l'accueil | Favoris d'une autre filière masqués ou proposés au tri | mineur | — |
| D32 | Élève | Accueil, carte « Chaque séance compte → » | Toucher la flèche | Rien : flèche décorative qui ressemble à un lien | Lien vers Mon espace, ou pas de flèche | mineur | v07-accueil-essai.png |
| D33 | Élève | Chapitre (`/subject/…/chapter/…`) | Ouvrir un chapitre | Deux fils d'Ariane (« Gestion & Finance › Règles comptables » puis « Gestion et Finance › Règles comptables › Chapitre 1 ») et deux boutons ✕ ; titre de l'onglet = nom du thème | Un seul fil, un seul ✕, titre = chapitre | mineur | g-subject_gestion-finance_theme_gf-t1_chapter_0.png |
| D34 | Élève | Menu, Mon espace, `/changer`, accueil | Observer les libellés | « mon espace » en minuscules (menu et titre d'onglet, aussi « my space », « mi espacio ») ; « Léa, Qu'est-ce que tu veux réviser ? » ; « Gestion Et Finance » ; « Belle nuit, Léa » / « Good night » en salutation | Casse et formules corrigées (« Bonne soirée ») | mineur | m7.png |
| D35 | Élève en arabe | Accueil | Choisir l'arabe | Date au calendrier hégirien (« ٩ جمادى الأولى ») | Calendrier grégorien | mineur | l-ar-accueil.png |
| D36 | Élève en anglais / arabe | Accueil | Choisir l'anglais | « Gestion et Finance » traduit « Management and Finance », à côté de « Management (MSGN) » | « Accounting and Finance » (ou nom gardé) | mineur | l-en-accueil.png |
| D37 | Visiteur → essai | Arrivée sur l'accueil | Commencer l'essai | Récompense de connexion (modale) + toast « Badge débloqué » + bandeau cookies + bandeau essai en même temps, puis bandeau d'installation | Un message à la fois, l'accueil d'abord | mineur | v07-accueil-essai.png |
| D38 | Élève | Recherche (🔍) | Chercher « zzzz », puis « TVA » | Sans résultat : « — « zzzz » — » ; « TVA » ouvre le thème entier (26 chapitres), pas le chapitre « La TVA » | Message clair ; résultats par chapitre et par notion | mineur | — |
| D39 | Élève | Amis, hors connexion | Ouvrir l'onglet Amis | « Classement momentanément indisponible » | « Liste d'amis indisponible hors connexion » | mineur | o-amis.png |
| D40 | Élève | Récompense de connexion | Manquer un jour en ayant un gel de série | La série est sauvée mais la fenêtre ne dit pas qu'un gel a été utilisé | « 1 gel utilisé, série sauvée » | mineur (code) | — |
| D41 | Première / Terminale | `/grand-oral`, `/etude-de-gestion` | Ouvrir l'adresse de l'autre niveau | Espaces accessibles hors filière, sans mention | Mention « réservé à la Terminale / Première » | mineur | — |
| D42 | Élève | Accueil → « Chapitre au hasard » | Toucher le bouton | Ouvre un thème entier (liste de 20 chapitres et plus), pas un chapitre | Ouvrir un chapitre, de préférence non commencé | mineur | — |
| D43 | Élève | Exercice → « Signaler une erreur » | Signaler une question fausse | Seuls le titre et l'identifiant de l'exercice partent : l'élève doit recopier la question | Question affichée et réponse donnée jointes automatiquement | mineur (code) | — |

**Bilan : 43 défauts — 3 bloquants, 15 importants, 25 mineurs.**

## 3. Améliorations de parcours

Effort : S (moins d'un jour), M (quelques jours), L (une semaine ou plus). Impact de 1 (faible) à 5 (fort). Priorité : P1 (à faire d'abord), P2, P3.

| n° | Parcours | Constat | Amélioration proposée | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|
| A1 | Progression | Les exercices des chapitres ne comptent pas (D1, D23) | Maîtrise d'un chapitre = moyenne de ses exercices ; maîtrise du thème = moyenne des chapitres + test ; onglet Progression par chapitre | M | 5 | P1 |
| A2 | Essai → compte | Données d'essai perdues (D3, D4) | En essai : remplacer « Se déconnecter » par « Créer mon compte » ; à la connexion, fusionner l'essai avec le compte (même règle que `mergeProgress`) | S | 5 | P1 |
| A3 | Inscription | Profil perdu si l'e-mail doit être confirmé (D2) | Envoyer nom, niveau, spécialité dans les métadonnées d'inscription et créer le profil à la première connexion ; ne jamais bloquer la connexion sur le code de classe | M | 5 | P1 |
| A4 | Compte multi-appareil | Synchronisation partielle (D5, D6, D8, D18) | Une seule fonction « enregistrer sur le compte » qui suit tous les champs de progression et le profil (filière, classe, photo, nom) | S | 4 | P1 |
| A5 | Exercice | Rechargement ou retour = série perdue (D11) | Adresse propre par exercice (`…/chapter/0/exo/qdef`) et avancement gardé dans `sessionStorage` ; « Reprendre là où tu t'étais arrêté ? » | M | 4 | P1 |
| A6 | Sujet de bac 4 h | Rien n'est sauvegardé (D12) | Sauvegarde automatique des réponses et du temps restant ; reprise au retour ; confirmation avant de quitter | M | 4 | P1 |
| A7 | Fin d'exercice | L'écran de score n'offre que Rejouer / Changer de mode / Terminé | Boutons « Exercice suivant » et « Revoir mes erreurs » ; indiquer ce qui reste à faire dans le chapitre | S | 4 | P1 |
| A8 | Test du thème | Validable à vide (D9) | Corrigé visible seulement après une réponse écrite ; mots-clés du corrigé surlignés ; échelle « je l'avais / en partie / pas du tout » | S | 4 | P1 |
| A9 | Premier lancement | Pages légales et parent cachées (D15, D17) | Page d'accueil publique : présentation, « Essayer sans compte », « Se connecter », « Je suis parent », « Je suis prof », liens CGU / confidentialité / FAQ | M | 4 | P1 |
| A10 | Objectif de la semaine | Gonflé par le bac blanc (D10) | Ne compter que les chapitres réellement ouverts (cours lu ou exercice du chapitre) ; même règle pour le parent et la classe | S | 3 | P2 |
| A11 | Bac blanc | Rendu sans confirmation, erreurs perdues, minuteur relancé au rechargement | Confirmation « 15 questions sans réponse » ; erreurs au carnet ; heure de fin sauvegardée | S | 3 | P2 |
| A12 | Quitter | Aucune confirmation (D24) | Fenêtre « Quitter ? Tes réponses seront perdues » dès la première réponse | S | 3 | P2 |
| A13 | Arrivée | Fenêtres empilées (D37, D13) | File d'attente : un seul message à la fois ; bandeau d'installation au-dessus de la barre d'onglets et seulement à la 3e visite | S | 3 | P2 |
| A14 | Professeur | Interface d'élève (D14) | Accueil prof : mes classes, codes, élèves actifs cette semaine, QCM à valider ; onglet « Classe » dans la barre ; pas de série ni de boutique | L | 4 | P2 |
| A15 | Parent | Menu et en-tête d'élève (D27, D28) | Mode parent : en-tête sans série, menu « Espace parent / Ajouter un enfant / Langue / Aide », erreurs de réseau distinguées du code inconnu | M | 3 | P2 |
| A16 | Parent | Un seul enfant par appareil | Relier plusieurs enfants (fratrie) et passer de l'un à l'autre | M | 2 | P3 |
| A17 | Langues | Textes restés en français (D16, D36) | Intégrer FAQ, Grand Oral, titres d'exercices et trousse aux fichiers de langue ; relire les noms de matières traduits ; bandeau d'échec affiché une fois par session | M | 3 | P2 |
| A18 | Date du jour | Jour calculé en UTC (D20) | Une seule fonction « jour local » pour la série, le défi, l'accueil et la révision espacée | S | 2 | P2 |
| A19 | XP et pièces | Rejeu illimité, flashcards auto-évaluées, mode Défi sans chrono (D21, D22, D25) | Plafond d'XP par exercice et par jour ; flashcards à 2 XP par carte ; mode Défi seulement là où il y a un chronomètre | S | 3 | P2 |
| A20 | Carnet d'erreurs | Types manquants (D26) | Tous les exercices, le défi, le bac blanc et le test du thème alimentent le carnet ; bouton « Ajouter au carnet » sur une question réussie de justesse | M | 3 | P2 |
| A21 | Recherche | Thèmes seulement, message vide (D38) | Indexer chapitres, définitions et formules ; ouvrir le chapitre exact ; « Aucun résultat : essaie un autre mot » | M | 3 | P2 |
| A22 | Réinitialisation | Fausse remise à zéro (D7) | Déplacer dans Mon espace › Zone sensible ; effacer aussi le compte ; double confirmation | S | 2 | P2 |
| A23 | Mes informations | Nom, filière, classe, e-mail, mot de passe non modifiables au même endroit (D30) | Écran « Mes informations » dans Mon espace | M | 3 | P2 |
| A24 | Classe | Quitter sa classe sans effet durable (D8) | Confirmation, mise à jour du profil, retour au formulaire de code | S | 3 | P2 |
| A25 | Hors connexion | Classe, Amis, Parent ne disent pas qu'on est hors ligne (D39) | Bandeau « Hors connexion : ces espaces reviendront avec le réseau » ; actions mises en attente | M | 3 | P2 |
| A26 | Signalement | La question n'est pas jointe (D43) | Joindre automatiquement l'énoncé, les choix et la réponse donnée | S | 3 | P2 |
| A27 | Fonctions réservées à l'appli | Coach et Personnaliser verrouillés sans préavis (D29) | Cadenas 🔒 visible dans la trousse et l'en-tête ; minuteur du coach aussi dans le navigateur | S | 2 | P3 |
| A28 | Défi du jour | Relance possible, erreurs perdues (D19) | Mémoriser les questions déjà vues et reprendre ; erreurs au carnet | S | 2 | P3 |
| A29 | Changement de filière | Favoris d'une autre filière conseillés (D31) | Confirmation du changement ; proposer de retirer favoris et carnet de l'ancienne filière | S | 2 | P3 |
| A30 | Chapitre | Doublons de navigation (D33) | Un seul fil d'Ariane, un seul ✕ ; titre d'onglet = chapitre | S | 2 | P3 |
| A31 | Thème | 20 à 26 chapitres dans une liste, compteur « 0/20 » | Repère « tu en es au chapitre 4 », bouton « Continuer », chapitres terminés repliés | S | 3 | P2 |
| A32 | Inscription (étape « Que veux-tu travailler ? ») | Les chapitres touchés deviennent des favoris « à revoir » | Utiliser ce choix comme point de reprise, pas comme favori ; liste raccourcie à la matière choisie | S | 2 | P3 |
| A33 | Hasard | « Chapitre au hasard » ouvre un thème (D42) | Ouvrir un chapitre non commencé, de préférence dans la matière la plus faible | S | 2 | P3 |
| A34 | Gel de série | Utilisation silencieuse (D40) | Mention « 1 gel utilisé » dans la fenêtre de récompense | S | 1 | P3 |
| A35 | Libellés | Casse et formules (D34, D35) | Relecture : « Mon espace », « Bonne soirée », date grégorienne en arabe | S | 1 | P3 |

**78 lignes au total (43 défauts + 35 améliorations).**

## 4. Ce qui n'a pas pu être testé, et pourquoi

| Domaine | Pourquoi | Ce qui a été fait à la place |
|---|---|---|
| Vrai serveur Supabase (inscription, connexion Google / Apple, e-mails de confirmation et de mot de passe oublié, classes, amis, duels, ligue, mode Direct, suppression de compte) | Consigne de lecture seule et réseau extérieur bloqué | Faux serveur avec `page.route` pour la connexion, l'inscription avec confirmation, le profil, la classe d'un prof et le tableau de bord parent ; le reste jugé sur le code |
| Application installée (mode autonome) : Coach de révision, Personnaliser, onglets personnalisés, photo de profil | Le mode d'affichage « standalone » ne s'émule pas dans Chromium sans interface | Écrans de verrouillage vérifiés dans le navigateur ; synchronisation de la photo jugée sur le code (D18) |
| Service worker en conditions réelles (mise à jour d'une version à l'autre, quota de stockage) | Une seule version disponible en local | Installation, cache (101 fichiers) et navigation hors ligne vérifiés |
| Vrais téléphones (Safari iOS, clavier virtuel, encoche, gestes, vibrations) | Pas d'appareil physique | Chromium avec agent iPhone, écran tactile et 320 / 390 px |
| Lecture audio des cours, enregistrement du Grand Oral, micro | Aucune voix de synthèse ni micro dans le navigateur de test (0 voix) | Présence des boutons vérifiée |
| Fiches à partir d'une photo (OCR) et fonction « fiche-vision » | Pas de photo de cours, OCR et fonction distante non disponibles hors réseau | Écran et boutons vérifiés ; le bouton « Générer » reste inactif sans photo |
| Traductions en ligne (MyMemory) | Réseau bloqué | Langues jugées avec le service indisponible (cas réel d'un élève hors ligne ou d'un quota dépassé) |
| Rappels de révision et notifications | Permissions et envoi serveur non simulables ici | Non testé |
| Effets dans la durée : révision espacée sur plusieurs jours, remise à zéro de la semaine, série sur plusieurs jours | Le temps ne peut être avancé que ponctuellement | Passage de minuit testé avec l'horloge simulée (D20) |
| Memory et une partie des associations jouées jusqu'au bout | Le robot de test répond au hasard et n'a pas toujours fini ces deux jeux | Association terminée en RH (100 %) ; écran de fin du Memory non vu |
| Impression de la fiche PDF | La boîte d'impression ne s'ouvre pas en mode sans interface | Bouton 🖨️ présent |
| Lecteurs d'écran (VoiceOver, TalkBack) | Pas d'outil dans l'environnement | Ordre de tabulation vérifié au clavier sur l'accueil |

### Méthode et fichiers

- Scripts Playwright : `inspection/parcours/p1-visiteur.mjs` (premier lancement, essai), `p2-eleve.mjs` (élève, tous les exercices d'un chapitre ; joué pour GF, Mercatique, RH, SIG, Première SGN, Maths, Langues), `p3-boutons.mjs` (35 routes, chaque bouton, 320 et 390 px), `p5-compte.mjs` (faux Supabase), `p6-interruptions.mjs`, `p7-paquet.mjs`, `p8-langues.mjs`, `p9-parent-prof.mjs`, `p10-affichage.mjs` (sombre, accessibilité, grand écran, hors ligne), `p11-outils.mjs`, `p12-minuit.mjs`, `p13-direct.mjs` ; outils communs dans `lib.mjs`.
- Relevés bruts : `inspection/parcours/captures/*.txt` ; captures : `inspection/parcours/captures/*.png` (planches `m1.png` à `m7.png`).

## Annexe — notes prises pendant l'inspection

- Lecture du code : `App.jsx`, `store.jsx`, `Layout.jsx`, `Welcome.jsx`, `CompteRequis.jsx`, `Landing.jsx`, `auth.js`.

### Repérés à la lecture du code (tous confirmés ensuite, voir le tableau)

- Essai sans compte : le menu mobile affiche « Se déconnecter » ; un clic efface toute la progression locale sans confirmation (`logout` → `withoutAccount`).
- Inscription avec confirmation d'e-mail : le profil (prénom, nom, niveau, spécialité, code classe) n'est pas enregistré ; une connexion par mot de passe ensuite échoue (« Profil du compte indisponible »).
- Essai puis « J'ai déjà un compte » : la progression d'essai est remplacée (`restoreAccountState` → `withoutAccount`), contrairement à la promesse « rien ne sera perdu ».
- Changement de filière via `/changer` : seulement local ; un compte retrouve son ancienne filière au prochain lancement (`restoreAccountState` reprend `profile.level`).
- Synchronisation : l'effet d'envoi ne surveille pas `grandOral`, `etudeGestion`, `notes`, `erreurs`, `srs`, `savedDecks`, `fiches`, `bacDate`, `dailyChallenge`, `themeTime` ; ces données ne partent sur le compte que si l'XP ou un autre champ suivi change.

### Constats en navigateur

- D-essai-deco : essai sans compte, menu ☰ → « Se déconnecter » : aucune confirmation ; XP 500 → 0, pièces 200 → 0, chapitres, prénom et filière effacés ; retour à l'écran de connexion (captures v09, v10).
- D-legal : sans profil, `#/cgu`, `#/confidentialite`, `#/faq`, `#/guide` sont recouverts par l'écran de connexion (capture v02-sans-profil-cgu). Les liens « CGU / Politique » de l'étape 3 de l'inscription ouvrent un nouvel onglet… qui affiche l'écran de connexion.
- D-popups : arrivée après l'essai : récompense de connexion (modale) + toast « Badge débloqué » + bandeau cookies + bandeau essai empilés (capture v07).
- D-maitrise : 11 exercices du chapitre 1 de GF thème 1 terminés (dont flashcards à 100 %) → maîtrise du thème 0 %, matière 0 %, accueil 0 %. Les exercices générés (`gf-t1::0::…`) ne comptent pas dans `chapterScore`, qui ne prend que les jeux écrits à la main + le test. L'onglet Progression liste 9 jeux (QCM — Comptabilité & TVA, Flashcards — Définitions clés…) dont la plupart ne sont jouables nulle part seuls.
- D-defi-xp : mode « Défi » (chronomètre promis) sans chronomètre pour Association, Flashcards, Memory, Ordre, Trou ; il rapporte 15 XP par bonne réponse au lieu de 10.
- D-flash-xp : flashcards auto-évaluées (« Je savais ») : 100 % et 40 XP + 40 pièces en 5 clics, rejouables à l'infini.
- D-essai-connexion (faux Supabase) : essai avec 500 XP, 300 pièces, 1 chapitre, 1 favori, des notes → « Créer mon compte » → « Déjà un compte ? Se connecter » → connexion : XP 100, pièces 50, chapitres {}, favoris [], notes {} (tout l'essai est perdu, alors que l'invitation promet « Rien de ce que tu as fait ne sera perdu »).
- D-inscription-confirmation : inscription (prénom, nom, Terminale, code classe) avec confirmation d'e-mail → message « Compte créé ! Vérifie ton e-mail… » ; aucun profil créé côté serveur ; à la connexion suivante, message « Ce code ne correspond à aucune classe » (le code saisi à l'inscription reste en mémoire, champ invisible sur l'écran de connexion) → impasse.
- D-filiere : compte connecté → Accueil → « Changer » → Première : accueil en Première, mais rien n'est envoyé au profil ; après relance : retour en Terminale GF.
- D-synchro : compte connecté → notes de thème, date du bac, Grand Oral : 0 envoi au serveur en 5 s (envoyés seulement à la déconnexion ou au prochain gain d'XP).
- D-reset-compte : compte connecté → Badges → « Réinitialiser ma progression » → confirmation → écran de connexion (comme une déconnexion) alors que la session reste ouverte ; après relance, tout revient (2 400 XP).
- OK : déconnexion puis reconnexion d'un compte → XP, pièces, notes et date du bac retrouvés.
- OK : aucune page ne déborde horizontalement à 320 px ni à 390 px (35 routes).
- D-rechargement : en plein QCM (question 3/4), rechargement → retour au chapitre, onglet Cours ; la série en cours est perdue sans avertissement (capture i1).
- D-retour : en plein exercice, retour arrière du navigateur / geste Android → on quitte le chapitre pour la page du thème (l'exercice n'a pas d'adresse propre) (capture i2). « ← Quitter » après 2 réponses : aucune confirmation.
- D-defi-relance : défi du jour, 2 réponses (corrections vues) puis rechargement → écran d'intro, mêmes questions dans le même ordre : l'élève peut recommencer en connaissant les réponses. Les erreurs du défi n'entrent pas dans le carnet d'erreurs.
- D-test-vide : test du thème GF T1 : 8 QCM répondus au hasard, 14 questions rédigées laissées vides et déclarées « Je maîtrisais » → 82 %, +216 XP, quiz du thème enregistré à 82 % (capture i4). Les tests distincts à 90 % conditionnent les « mois Premium offerts » de la boutique.
- D-bac-blanc-semaine : un bac blanc de 20 questions (5 répondues, rendu sans confirmation malgré 15 questions vides) ajoute 17 thèmes à l'objectif de la semaine → « 5 / 5 », bouton « Récupérer la récompense » (+60 XP) et « 17 cours cette semaine » dans Mon espace, sans avoir ouvert un seul cours.
- D-carnet-types : le carnet d'erreurs ne reçoit que les QCM, vrai/faux et textes à trous ; « Écris le terme », « Complète — à écrire », association, memory, calculs, défi du jour, bac blanc et test du thème n'y entrent jamais. Le rejeu du carnet fonctionne (QCM, V/F, trous : capture i6).
- D-paquet-xp : un paquet de flashcards enregistré rapporte au plus 15 XP (et seulement via « Terminer maintenant » ; la croix ✕ ne donne rien), alors que les mêmes cartes jouées dans le chapitre rapportent 10 XP par carte.
- D-classe-quitter : élève connecté → Classe → « Changer de classe » : aucune confirmation, seul l'appareil est modifié ; après relance, l'élève est de nouveau dans la classe (profil serveur inchangé).
- D-parent-acces : premier lancement → aucun accès direct à l'espace parent sur l'écran de connexion ; il faut « Créer un compte » → « Parent » → « Continuer ». Menu du parent : « Accueil » et « mon espace » renvoient sur /parent ; série « 0 » affichée dans l'en-tête ; outils élève (dictionnaire, personnaliser) proposés.
- OK parent : avec un faux serveur, code inconnu → « Aucun élève trouvé pour ce code. » ; code valide → tableau de bord complet (série, niveau, temps, objectif, synthèse, matières), lien mémorisé.
- D-prof-accueil : professeur → accueil d'élève (« TERMINALE STMG · » suivi de rien, série, défi du jour, boutique, « Commencer ») ; barre du bas Accueil / Réviser / Boutique / Amis / Classement, sans « Ma classe » ; la classe n'est accessible que par le bas de l'accueil (« Ton coin à toi »). Matières affichées sans spécialité (pas de GF/RH/Mercatique/SIG).
- OK prof : espace classe (code, copier, créer une classe, classement, objectif, QCM, mur, membres, onglet Prof avec tableau de bord et export) s'affiche avec des données simulées.
- D-specialites : toutes les spécialités ont le même défaut de maîtrise : RH T1 ch.1 (10 exercices, dont 2 à 100 %) → seul « rh-t1-trou » compte ; SIG T2 ch.1 (13 exercices) → 15 % grâce au seul « Tri » écrit à la main ; Mercatique T1 ch.1 : 4 exercices seulement ; Première SGN T1 ch.1 : 3 exercices, aucun ne compte.
- D-langues : en, es, it, ar : « Conseillé maintenant », « Ta trousse · 8 outils » restent en français ; titres des exercices (« QCM — les notions du chapitre », « Texte à trous — série 1 »…), Grand Oral et FAQ entièrement en français (hors ligne ou service de traduction indisponible : bandeau « Some text could not be translated » sur chaque page). « Gestion et Finance » traduit « Management and Finance » à côté de « Management (MSGN) » (même confusion en arabe). « mon espace / my space / mi espacio » en minuscules dans le menu et le titre d'onglet. En arabe, la date d'accueil est au calendrier hégirien (« ٩ جمادى الأولى ») au lieu du calendrier grégorien. Pas de débordement en arabe (sens de lecture correct).
- D-salutation : « Belle nuit, Claire » / « Good night, Léa » affiché à l'ouverture la nuit (formule d'au revoir, pas de salutation).
