# RévizSTMG : les fonctionnalités à garder, améliorer ou créer

*Analyse du 19 octobre 2026, en lecture seule. Sources : le code de la version en ligne (`/var/tmp/analyse-site/`), un parcours complet dans un vrai navigateur (téléphone 390 × 844, élève fictif de Terminale gestion-finance, de Terminale SIG et de Première, réseau extérieur bloqué), le document des offres (Gratuit, Premium, Ultimate), les statistiques d'usage du dépôt et une recherche sur la concurrence. 59 captures sont rangées dans `captures-fonctions/` (préfixes `T-` Terminale, `P-` Première, `I-` interactions).*

**Ce qu'il faut retenir.** RévizSTMG a déjà beaucoup plus de fonctionnalités que d'élèves : 31 écrans, 19 matières, 806 chapitres, environ 27 000 questions, mais **11 comptes et 2 actifs sur 7 jours** (statistiques du 19 octobre). Les écrans réellement ouverts sont l'accueil, le chapitre, le thème et la matière ; le coach IA, le bac blanc, le défi, l'atelier de formules et les quiz de classe n'ont presque aucun usage. La priorité n'est donc pas d'ajouter des outils mais de **rendre fiable et lisible la boucle « lire → s'entraîner → être corrigé → revoir au bon moment »**, de **coller au format exact des épreuves de STMG** (là où la concurrence payante ne va pas pour cette filière) et de **faire venir les classes par les professeurs**.

## Comment lire les tableaux

- **Offre** : *Gratuit* (avec publicité discrète selon le document des offres), *Premium* (préparation intensive, sans publicité), *Ultimate* (Premium + fonctions d'IA facturées à l'usage). Tout ce qui sert à **apprendre** le programme reste gratuit, ainsi que l'accessibilité, les données personnelles, la vie de classe et les outils des professeurs.
- **Effort** : S = quelques jours ; M = une à trois semaines ; L = plus d'un mois ou un chantier de contenu relu par un professeur.
- **Impact** : de 1 (confort) à 5 (change la réussite ou l'adoption).
- **Priorité** : P1 = avant le lancement de Premium (janvier 2027) ; P2 = avant les épreuves de juin 2027 ; P3 = rentrée 2027 ou plus tard.

---

## 1. État des lieux

### 1.1 Ce que l'application fait déjà bien

- **Un contenu immense et fidèle à la filière.** 19 matières (11 de Terminale, 8 de Première), 94 thèmes, 806 chapitres, un tableau « Notions et définitions » en fin de chapitre, des exercices générés **uniquement** à partir du chapitre lu (pas de question hors cours), une relecture documentée (292 calculs vérifiés, dates d'histoire, citations de philosophie, requêtes SQL exécutées).
- **Des exercices variés et corrigés** : une vingtaine de types (QCM, vrai/faux, trous, saisie, tri, association, remise en ordre, memory, calcul à nombres renouvelés, SQL, cas pratique, étude de documents, compréhension en langue), avec un mode Entraînement (corrigé immédiat) et un mode Défi (chronomètre, plus d'XP).
- **Les vraies dates de la session 2027** (BO spécial n° 2 du 25 août 2026) et le **nouveau Grand Oral** (coefficient 12 en voie technologique à partir de 2027, 10 min + 10 min) sont déjà pris en compte, comme l'**épreuve anticipée de mathématiques** de Première dans le programme.
- **Deux espaces projet rares sur le marché** : l'étude de gestion (Première) et le Grand Oral (Terminale), avec sources, diagnostic, PESTEL, arguments A-E-I, grille d'auto-évaluation, chronomètre aux durées de l'épreuve et enregistrement local.
- **Un vrai respect de la vie privée** : pas de cookie publicitaire, mesure d'audience sans identifiant, OCR des photos fait sur l'appareil, téléchargement et suppression des données.
- **Installable et hors ligne**, en cinq langues avec le sens de lecture arabe, réglages dys / contraste / gros texte / lecture à voix haute.
- **Un espace professeur déjà riche** : tableau de bord de classe (élèves à risque, médiane, répartition, export CSV), groupes, annonces, mur de questions (avec anonymat), quiz, duels, mode en direct façon Kahoot.

### 1.2 Ce qui manque le plus

- **Le format réel des épreuves.** Le « bac blanc » est un QCM / vrai-faux chronométré qui mélange les matières (première question tirée pour une élève de gestion-finance : « Être libre, c'est nécessairement l'absence de toute règle. Vrai / Faux », capture `I-bac-blanc-qcm.png`), alors que l'écran promet « comme le jour J ». Les « sujets de 4 h » sont tirés d'un vivier minuscule (4 études de documents en droit, 4 en économie, 2 cas en management, **0 en SIG**) : un élève de SIG reçoit un sujet MSGN d'**une seule partie et deux questions** (`I-sujet-msgn-sig.png`).
- **Rien pour l'épreuve anticipée de mathématiques** de Première (2 h, QCM de 12 « automatismes » sur 6 points en voie technologique, puis 3 exercices sur 14 points) : aucun mot « automatismes » dans tout le contenu.
- **Pas d'entraînement rédigé corrigé** : les 10 « questions à rédiger » du test de thème, les dissertations de philosophie, la contraction et l'essai de français sont en auto-évaluation pure.
- **Pas de répétition espacée par carte** : la répétition espacée planifie des **thèmes** entiers, les flashcards n'ont pas de mémoire d'une séance à l'autre (contrairement à Anki ou Quizlet).
- **« Mes notes de classe »** (prévu dans les offres) n'existe pas encore.
- **Orientation après le bac STMG** (BUT GEA/TC/GACO, BTS, DCG, licences, Parcoursup) : absente, alors que c'est la grande question des Terminale entre janvier et mars.

### 1.3 Ce qui est confus ou peu utilisé

- **Trop d'outils qui font la même chose** : « Révision intelligente », « Programme » (objectifs du jour), « Coach IA » (plan sur 30 jours), « Coach de révision » (minuteur + quiz de méthodes), « Défi du jour », « Favoris », « Objectif de la semaine », « Bingo » de classe. Trois listes différentes disent à l'élève quoi faire aujourd'hui.
- **Des indicateurs qui se contredisent.** Pour la même élève : « 4 % de progression », « Niveau 8 », « 65 % de précision », « En progrès », 0 thème maîtrisé ; « Le contrat » marqué **« Point faible » à 31 %** alors que son test de thème est à **92 %** (`T-coach-ia.png`, cause : le score de thème ne compte pas les exercices générés, constat F05 de l'audit).
- **Un bug de date visible** : le plan du coach IA affiche « Aujourd'hui, Demain, **mar. 20 oct.** » — le 20 apparaît deux fois (décalage UTC/Paris, constat F01 de l'audit, toujours présent).
- **Des fonctions verrouillées sans raison pédagogique** : le Coach de révision (minuteur Pomodoro) et la personnalisation du profil sont réservés à l'application installée (`T-coach.png`) ; sur ordinateur, au CDI ou sur un Chromebook, l'élève tombe sur un cadenas.
- **Un quiz « Comment retiens-tu le mieux ? (visuel / auditif) »** dans le Coach : les « styles d'apprentissage » sont un neuromythe ; mieux vaut recommander des stratégies validées (rappel actif, espacement, entrelacement).
- **Des chapitres trop nombreux ou en double** : « Thème 1 — Appliquer les règles comptables » compte **20 chapitres** ; le thème SQL de SIG a trois chapitres qui se recouvrent, dont un à **0 exercice** (`I-theme-sig-t2.png`) ; 50 chapitres sans entraînement, 344 sans définition (audit).
- **Usage social nul pour l'instant** : 0 quiz de classe, 0 session en direct, 3 défis entre amis au total.

### 1.4 Tableau des fonctionnalités existantes

| Fonctionnalité existante | Ce qui marche | Ce qui coince | Verdict |
|---|---|---|---|
| Accueil (bandeau, matières, outil conseillé, trousse) | Personnalisé, matières en un coup d'œil, un seul outil mis en avant, « Reprendre » la dernière fiche | Deux cartes de progression redondantes ; le défi, la série et l'outil conseillé se concurrencent ; pas de « séance du jour » unique | **Améliorer** |
| Matière → thème → chapitre (Cours, Définitions, Exercices) | Parcours clair, cours paginé, lecture plein écran, impression PDF, lecture audio | Thèmes de 14 à 20 chapitres ; chapitres en double ; 50 sans exercice ; 344 sans définition | **Améliorer** (contenu) |
| Exercices de chapitre (≈ 20 types, Entraînement / Défi) | Corrigé immédiat, variété, nombres renouvelés en calcul | Distracteurs parfois ambigus (« Chacun reçoit une contrepartie » pour synallagmatique) ; questions hors contexte dans les séances mêlées (« Le thème 9 est surtout utile pour le grand oral ») | **Garder**, fiabiliser |
| Test du thème | QCM + questions rédigées + cas pratiques | Rédaction en auto-évaluation pure, sans grille | **Améliorer** |
| Flashcards et paquets (partage par code) | Pile agréable, partage sans serveur, audio | Aucune mémoire par carte, pas de création manuelle de cartes | **Améliorer** |
| Répétition espacée (par thème) | Rappels au bon moment, file « À réviser » | Granularité trop grossière ; décalage de jour en heure de Paris | **Améliorer** |
| Carnet d'erreurs | Excellente idée, une question réussie sort du carnet | Peu visible (en bas de « Réviser »), limité à 10 questions par série, sans explication de l'erreur | **Améliorer** |
| Défi du jour | Court (6 questions), série dédiée | Questions de toutes matières sans lien avec ce que l'élève révise ; fait doublon avec la série de connexion | **Fusionner** dans la séance du jour |
| Bac blanc QCM chronométré | Chronomètre, grille des questions, correction finale | Ne ressemble à aucune épreuve réelle de STMG ; mélange philo et gestion | **Améliorer** (renommer « Quiz chronométré ») |
| Sujets 4 h « au format de l'épreuve » | Bonne intention, documents réels | Vivier trop petit, 0 cas SIG, 2 questions pour 4 h, correction par mots-clés | **Améliorer** (chantier de contenu) |
| Programme jusqu'au bac | Dates officielles 2027, objectifs du jour, Première limitée au français et aux maths | Fait doublon avec le plan du coach IA et la révision intelligente | **Fusionner** |
| Coach IA (diagnostic, plan 30 jours, entraînement adaptatif) | Diagnostic par matière, plan cochable | N'est pas une IA (moteur de règles) : le nom crée une attente ; bug de date ; libellés « point faible » faux | **Améliorer** et renommer (« Mon diagnostic ») |
| Coach de révision (Pomodoro, méthodes) | Minuteur plein écran | Réservé à l'app installée ; quiz des styles d'apprentissage | **Fusionner** dans un mode « séance » ouvert à tous |
| Atelier de formules | 40 formules, nouvelles valeurs, virgule ou point acceptés | Bilan local qui ne compte pas dans la maîtrise ; pas de formules de SIG ni de mercatique avancée | **Garder**, relier à la maîtrise |
| Méthodo par épreuve | Démarches claires, exemples | Pas d'exercice guidé derrière chaque méthode | **Améliorer** |
| Grand Oral | Très complet, à jour de la session 2027, chrono + enregistrement | Pas de jury simulé (questions surprises), pas de retour sur le débit | **Garder**, enrichir |
| Étude de gestion (Première) | Accompagnement pas à pas, grille, export | Pas de partage avec le professeur, pas de suivi des étapes | **Garder**, relier au prof |
| Fiche par photo (OCR local) | Tout sur l'appareil, gratuit | Extraction fragile ; mode IA annoncé alors que la fonction n'est pas déployée | **Améliorer** |
| Dictionnaire / traduction | Glossaire + traduction | Envoi de texte libre à MyMemory sans avertissement clair | **Améliorer** |
| XP, niveaux, badges, série, gels | Motivation, niveaux étendus jusqu'au niveau 30 | 56 badges dont certains impossibles dans une filière (moyenne sur 19 matières) ; récompensent le volume plus que la maîtrise | **Améliorer** |
| Boutique (50 articles cosmétiques) | Belle, sans argent réel, mois Premium au mérite | 4 vues en 7 jours ; risque de détourner du travail | **Garder**, ne plus développer |
| Classe (mur, quiz, duels, groupes, direct, tableau prof) | Très complet pour un outil gratuit | 0 quiz créé ; quiz à écrire à la main sans reprendre les questions du programme ; mise à jour par sondage toutes les 4 s ; règles RLS à finir | **Améliorer** (priorité prof) |
| Amis et duels | Code ami, duels | Usage quasi nul ; doublon avec les duels de classe | **Fusionner** avec la classe |
| Classement hebdomadaire et ligues | Simple | Compare le volume (XP) ; peut décourager les élèves en difficulté | **Améliorer** (classement de progrès) |
| Espace parent | Lecture seule, partage décidé par l'élève | Indicateurs peu parlants (XP, niveau) ; aucune alerte utile | **Améliorer** |
| Rappels (push) | Arrivent même téléphone fermé avec un compte | Non testés sur vrais appareils | **Garder**, tester |
| Accessibilité (dys, contraste, gros texte, audio) | Présente et accessible depuis le profil | Pas de tiers-temps dans les épreuves chronométrées ; pas d'interligne réglable | **Améliorer** |
| Personnalisation (couleurs, onglets, avatar) | Appréciée des ados | Réservée à l'app installée | **Garder**, ouvrir à tous |
| Données (export JSON, suppression) | Conforme à l'esprit du RGPD | Export brut illisible pour un humain | **Améliorer** |

---

## 2. Les propositions

Colonnes : n° · fonctionnalité · pour qui · problème réglé · ce que ça fait concrètement · nouvelle (N) ou amélioration (A) · offre · effort · impact (1-5) · priorité.

### 2.1 Apprendre (comprendre le cours)

| n° | Fonctionnalité | Pour qui | Problème réglé | Ce que ça fait concrètement | N / A | Offre | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Leçons courtes avec objectif annoncé | Élève | Thèmes de 14 à 20 chapitres (« Appliquer les règles comptables » : 20) : l'élève ne voit pas la fin | Regroupe les chapitres d'un thème en 3 à 5 leçons de 5 à 8 fiches, chacune ouverte par « À la fin, tu sais… » tiré des capacités du programme officiel, et fermée par 3 questions de vérification | A | Gratuit | M | 4 | P2 |
| 2 | Chapitres sans doublon et tous entraînables | Élève, prof | 50 chapitres sans exercice, 344 sans définition, chapitres SQL de SIG en triple dont un à 0 exercice (`I-theme-sig-t2.png`) | Fusionne les chapitres qui se recouvrent ; ajoute à chaque chapitre restant au moins 5 questions et 2 définitions écrites à partir de son seul texte ; un test empêche de publier un chapitre sans entraînement | A | Gratuit | M | 4 | P1 |
| 3 | Capacités officielles cochables | Élève, prof | L'élève ne sait pas ce que le bac attend de lui sur un chapitre | En tête de chapitre, la liste des capacités du programme (« qualifier juridiquement une situation », « calculer et interpréter le seuil de rentabilité »…) ; chaque capacité devient verte quand ses exercices sont réussis | N | Gratuit | M | 4 | P2 |
| 4 | Définition en bulle dans le cours | Élève | Un mot en gras inconnu oblige à quitter la fiche ou à ouvrir le dictionnaire | Un appui sur une notion en gras (BFR, synallagmatique, élasticité-prix) ouvre sa définition courte, tirée du tableau « Notions et définitions », avec le lien vers son chapitre | A | Gratuit | S | 4 | P1 |
| 5 | « Revoir la base de Première » | Élève de Terminale | Les cours de Terminale masquent, à juste titre, les notions de Première, mais l'élève qui les a oubliées décroche | Quand une notion de Terminale s'appuie sur une notion de Première (seuil de rentabilité → marge sur coût variable, contrat → conditions de validité), un lien ouvre le chapitre de Première correspondant, sans le recopier dans le cours de Terminale | N | Gratuit | M | 3 | P2 |
| 6 | « Pourquoi ? » sous chaque correction | Élève | Les questions générées n'expliquent pas l'erreur (« Presque… Contrat synallagmatique → Obligations réciproques », `I-exo-correction.png`) | Sous chaque correction, la phrase exacte du cours d'où vient la question et un bouton « Relire ce passage » qui ouvre la fiche à la bonne page | A | Gratuit | S | 5 | P1 |
| 7 | Distracteurs non ambigus | Élève | Des mauvaises réponses presque justes (« Chacun reçoit une contrepartie » pour un contrat synallagmatique) découragent et trompent | Étend `notions-liees.json` aux paires proches (synallagmatique / à titre onéreux, efficacité / efficience, CA / VA) pour qu'elles ne soient jamais opposées dans un QCM ; le bouton « Signaler » propose « deux réponses justes » | A | Gratuit | S | 4 | P1 |
| 8 | Explique avec tes mots | Élève | Relire ne suffit pas ; l'auto-explication aide à comprendre | À la fin d'un chapitre, un champ « Explique-le à un ami en 3 phrases », puis la liste des idées clés à cocher (« J'ai parlé de l'offre et de l'acceptation ? ») ; rien n'est envoyé | N | Gratuit | S | 3 | P2 |
| 9 | Carte du thème | Élève | Les liens entre chapitres d'un thème ne se voient pas (SIG, cascade des SIG, mix marketing) | Un schéma par thème, dans l'esprit des infographies déjà présentes : chaque nœud est un chapitre, coloré selon la maîtrise, et un appui ouvre le chapitre | N | Gratuit | M | 3 | P3 |
| 10 | L'actu au programme | Élève, prof | L'épreuve d'économie analyse « un problème économique d'actualité », le cours reste intemporel | Une fois par mois, un court cas d'actualité vérifié (taux directeurs, inflation, une décision de justice, une campagne de marque) rattaché à 1 ou 2 chapitres, avec 3 questions | N | Gratuit | M | 3 | P3 |
| 11 | Recherche qui répond | Élève | La recherche liste des chapitres ; l'élève veut la réponse | Taper « BFR » ou « TVA à décaisser » affiche d'abord la définition et la formule, puis les chapitres ; fonctionne hors ligne | A | Gratuit | S | 3 | P2 |
| 12 | Ressources publiques reliées | Élève | Certains élèves comprennent mieux en vidéo ; l'hébergement statique ne permet pas d'en produire | Pour chaque thème, 1 à 3 liens vérifiés vers des ressources publiques gratuites (Lumni, Éduscol), contrôlés chaque semaine par le workflow de liens déjà en place | N | Gratuit | S | 2 | P3 |

### 2.2 Réviser et mémoriser

| n° | Fonctionnalité | Pour qui | Problème réglé | Ce que ça fait concrètement | N / A | Offre | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|---|---|
| 13 | Ma séance du jour | Élève | Cinq outils disent quoi faire aujourd'hui (révision intelligente, programme, plan du coach IA, défi, favoris) et se contredisent | Un seul bouton sur l'accueil : 5, 15 ou 30 minutes, composées des cartes dues, d'un thème faible, de 2 questions du carnet d'erreurs et d'un calcul ; remplace les objectifs du programme et le plan du coach IA | A (fusion) | Gratuit | M | 5 | P1 |
| 14 | Répétition espacée par carte | Élève | La répétition espacée planifie des thèmes entiers ; les flashcards oublient tout d'une séance à l'autre | Chaque carte et chaque notion ont leur prochaine date (algorithme de type FSRS, rétention visée 90 %, réglable) ; les cartes dues de toutes les matières alimentent la séance du jour | A | Gratuit | M | 5 | P1 |
| 15 | Un score de maîtrise unique et expliqué | Élève, prof, parent | « Le contrat » marqué « point faible » à 31 % alors que le test est à 92 % ; 4 % de progression, niveau 8 et 65 % de précision en même temps | Quatre états par chapitre (découvert, en cours, acquis, maîtrisé) calculés sur toutes les activités réellement proposées, y compris générées ; un « pourquoi ? » détaille le calcul ; les autres pourcentages disparaissent de l'accueil | A | Gratuit | M | 5 | P1 |
| 16 | Carnet d'erreurs au premier plan | Élève | Le carnet, la meilleure idée de l'app, est caché en bas de « Réviser » et limité à 10 questions | Pastille du nombre d'erreurs sur l'onglet ; chaque erreur revient à J+1, J+3 et J+7 avec d'autres propositions ; elle sort après deux réussites espacées ; filtre par matière | A | Gratuit | S | 5 | P1 |
| 17 | Révision entrelacée | Élève | Les exercices sont rangés par chapitre ; à l'épreuve, l'élève doit reconnaître seul quelle méthode utiliser | Séance « Mélange » de 3 thèmes déjà vus (seuil de rentabilité + TVA + amortissement ; contrat + responsabilité) ; l'entrelacement a donné 61 % contre 38 % en mathématiques (Rohrer et al., 2020) | N | Gratuit | S | 4 | P2 |
| 18 | Mes propres flashcards | Élève | On ne peut qu'enregistrer les paquets de l'app ou en importer par un code | Créer des cartes recto / verso (texte, image prise en photo) dans un paquet ou sous un chapitre ; elles entrent dans la répétition espacée | N | Gratuit | S | 4 | P2 |
| 19 | Flashcards à saisir et à l'envers | Élève | Retourner une carte en se disant « je savais » surestime ce qu'on sait | Modes « tape la réponse » (avec les réponses acceptées) et « définition → notion » ; le mode audio existant enchaîne un paquet comme un podcast | A | Gratuit | S | 3 | P3 |
| 20 | Fiche d'une page par thème | Élève | L'impression actuelle sort tout le cours ; l'élève veut une fiche à relire dans le bus | Mise en page A4 recto : notions, formules, pièges fréquents, 3 questions types ; impression ou PDF, aussi hors ligne | A | Gratuit | S | 3 | P2 |
| 21 | Favoris avec une raison | Élève | « Favoris » mélange « pas compris » et « à apprendre par cœur » | En marquant un chapitre : « pas compris », « à apprendre », « à refaire » ; les « pas compris » passent dans la séance du jour avec la relecture d'abord | A | Gratuit | S | 2 | P3 |
| 22 | Atelier de formules relié à la maîtrise | Élève | Les exercices de l'atelier ne comptent nulle part | Une formule réussie trois fois à des jours différents passe « acquise » et nourrit la maîtrise du chapitre ; ajout des formules de mercatique (taux de marque, indice de spécificité, panier moyen) et de RH (taux de rotation, d'absentéisme) présentes dans les cours | A | Gratuit | S | 3 | P2 |
| 23 | Révision de veille d'épreuve | Élève | La dernière semaine, l'élève ne sait pas quoi relire | De J-7 à J-1 pour chaque épreuve (philosophie, droit et économie, MSGN, Grand Oral, français, maths anticipées) : un programme jour par jour (notions clés, formules, un sujet, la fiche méthode) ; la version courte est gratuite, le plan complet relié au diagnostic est Premium | N | Gratuit / Premium | M | 4 | P2 |

### 2.3 S'entraîner au bac (le format exact des épreuves)

| n° | Fonctionnalité | Pour qui | Problème réglé | Ce que ça fait concrètement | N / A | Offre | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|---|---|
| 24 | Le « bac blanc » QCM devient « quiz chronométré » par épreuve | Élève | L'écran promet « comme le jour J » et mélange philosophie et gestion (`I-bac-blanc-qcm.png`) | Renommé honnêtement ; on choisit une épreuve (droit et économie, MSGN, philosophie, maths, français) et les questions ne viennent que de son programme | A | Gratuit | S | 4 | P1 |
| 25 | Vrais sujets MSGN | Élève de Terminale | Vivier de 2 cas de management et 0 cas de SIG : un élève de SIG reçoit 1 partie et 2 questions pour « 4 h » (`I-sujet-msgn-sig.png`) | Sujets en dossiers sur une organisation réelle, avec annexes, questions de management puis de l'enseignement spécifique (GF, mercatique, RHC, SIG) et barème indicatif ; au moins 6 sujets par spécialité, relus par un professeur, alignés sur la note de service de septembre 2026 pour la session 2027 | A (contenu) | 1 sujet gratuit, illimité en Premium | L | 5 | P1 |
| 26 | Vrais sujets de droit et économie | Élève de Terminale | 4 études de documents par matière, correction par mots-clés | Deux parties indépendantes notées sur 10 : partie juridique (faits qualifiés, problème de droit, règles, solution) et partie économique (documents d'actualité, calcul, argumentation) ; corrigé détaillé partie par partie | A (contenu) | 1 sujet gratuit, illimité en Premium | L | 5 | P1 |
| 27 | Épreuve anticipée de maths (Première) | Élève de Première | Rien ne prépare à la nouvelle épreuve (2 h, coefficient 2) : aucun « automatisme » dans le contenu | Sujet complet au format : 12 questions d'automatismes en QCM sans calculatrice (6 points), puis 3 exercices (second degré, suites, statistiques et probabilités) sur 14 points, chronométré ; corrigé détaillé | N | Gratuit (1 par semaine), illimité en Premium | M | 5 | P1 |
| 28 | Automatismes du jour | Élève de Première | Les automatismes (pourcentages, fractions, équations, lecture graphique) se travaillent par petites doses | 3 questions sans calculatrice chaque jour dans la séance du jour, nombres renouvelés par les générateurs existants (`calc.js`, `qcmgen.js`) | N | Gratuit | S | 4 | P1 |
| 29 | Réponse rédigée avec grille du corrigé | Élève | Les 10 « questions à rédiger » du test de thème se corrigent « honnêtement » sans repère | Après la rédaction, les attendus du corrigé en cases à cocher (« j'ai qualifié les faits », « j'ai cité l'article 1128 ») ; la note sur la question se calcule à partir des cases | A | Gratuit | S | 4 | P1 |
| 30 | Correction des rédactions par l'IA | Élève | Personne pour corriger une réponse rédigée le soir | Retour critère par critère (vocabulaire juridique, syllogisme, chiffres justifiés, lien avec les documents) sur le barème du sujet, jamais présenté comme une note du jury ; quota mensuel ; texte non conservé par le fournisseur | N | Ultimate | L | 4 | P2 |
| 31 | Consignes décodées | Élève | « Analyser », « justifier », « montrer que », « qualifier » n'attendent pas la même réponse | Une fiche par verbe de consigne avec ce que le correcteur attend et un exemple STMG, puis un exercice « quelle consigne demande quoi ? » | N | Gratuit | S | 4 | P2 |
| 32 | Méthodes suivies d'exercices guidés | Élève | La méthodo par épreuve s'arrête à la lecture | Chaque méthode (syllogisme juridique, A-E-I, calcul commenté, question de gestion argumentée) se termine par 3 exercices à étapes, avec l'étape à remplir à chaque fois | A | Gratuit | M | 4 | P2 |
| 33 | Annales officielles par chapitre | Élève, prof | L'élève ne sait pas comment son chapitre tombe au bac | Liste des sujets nationaux de STMG (2021 à 2026) avec lien vers la source officielle et, pour chaque question, le chapitre concerné ; corrigé rédigé par l'équipe | N | Gratuit (liens), Premium (corrigés détaillés) | L | 5 | P2 |
| 34 | Mode examen réaliste | Élève | Un sujet de 4 h se fait rarement d'une traite sur téléphone | Plein écran, chronomètre qui se met en pause et reprend, sauvegarde automatique ; option « sujet papier » : imprimer le sujet, composer à la main, puis saisir ses réponses chiffrées et cocher la grille | A | Premium | M | 3 | P2 |
| 35 | Philosophie pas à pas | Élève de Terminale | 26 chapitres de philosophie sans exercice ; la dissertation n'est jamais travaillée | Pour un sujet : repérer les notions et le problème, construire un plan en glissant arguments et exemples, rédiger l'introduction avec une liste de vérification ; même démarche pour l'explication de texte | N | Gratuit | M | 4 | P2 |
| 36 | Français écrit (voie technologique) | Élève de Première | Contraction et essai, commentaire : méthode lue, jamais pratiquée | Contraction avec compteur de mots et objectif « un quart, à 10 % près », essai avec plan à construire, commentaire avec repérage des procédés ; correction par grille | N | Gratuit | M | 4 | P2 |
| 37 | Oral de français | Élève de Première | Rien pour l'oral de l'épreuve anticipée | L'élève saisit ses textes du récapitulatif ; tirage au sort, chronomètre 30 min de préparation puis 12 min (explication linéaire et question de grammaire) et 8 min (présentation de l'œuvre et entretien), enregistrement local | N | Gratuit | M | 4 | P2 |
| 38 | Question de bac du jour | Élève | Le défi pose des questions sans contexte (« Le thème 9 est surtout utile pour le grand oral », `I-coach-ia-session.png`) | Le défi du jour devient une vraie question d'épreuve de la filière (un calcul de GF, un cas de droit, une question d'économie) avec son corrigé ; la série du défi est conservée | A | Gratuit | S | 4 | P2 |
| 39 | SQL et tableur en vrai | Élève de SIG et GF | La requête SQL est corrigée par tolérance ; le tableur n'est jamais pratiqué | Base SQL dans le navigateur (hors ligne) avec 3 bases d'entreprise ; exercices de formules de tableur (SI, RECHERCHEX, références absolues) vérifiées par le calcul | A | Gratuit | M | 3 | P3 |
| 40 | Langues au niveau visé | Élève | Grammaire et vocabulaire, peu d'expression ; LVA visée B2, LVB B1 | Compréhension de documents sur les axes culturels du programme, courte production écrite évaluée par une grille de niveau européen (auto-évaluation, IA en Ultimate) | A | Gratuit | M | 3 | P3 |
| 41 | Histoire-géographie : frises et cartes | Élève | Les repères chronologiques et spatiaux se retiennent mal en liste | Frises interactives à remettre en ordre et cartes à compléter à partir des repères du programme de la voie technologique | A | Gratuit | M | 3 | P3 |

### 2.4 Projets du bac : Grand Oral et étude de gestion

| n° | Fonctionnalité | Pour qui | Problème réglé | Ce que ça fait concrètement | N / A | Offre | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|---|---|
| 42 | Jury simulé du Grand Oral | Élève de Terminale | Le chronomètre existe, mais les 10 minutes d'échange (questions qui dépassent la question préparée) ne sont pas travaillées | Après la présentation, l'app tire 5 à 8 questions : sur la question choisie, puis sur d'autres parties du programme de la spécialité, une à la fois avec un temps de réponse ; en Ultimate, les questions s'appuient sur le plan rédigé par l'élève | A | Gratuit (banque), Ultimate (questions personnalisées) | M | 4 | P2 |
| 43 | Retour sur la voix, sans transcription | Élève de Terminale | Réécouter son enregistrement ne dit pas si l'on parle trop vite ou avec trop de silences | Analyse locale du son (Web Audio) : durée réelle, part de silences, longs blancs repérés sur une frise ; rien n'est envoyé | N | Premium | M | 3 | P3 |
| 44 | Partager sa préparation avec son professeur | Élève, prof | Le Grand Oral et l'étude de gestion restent sur l'appareil ; le professeur ne peut pas annoter | Bouton « Envoyer à mon professeur » : le professeur de la classe lit les questions, le plan, les sources et laisse des commentaires par partie | N | Gratuit | M | 4 | P2 |
| 45 | Étapes datées de l'étude de gestion | Élève de Première, prof | L'étude s'étale sur l'année, l'élève prend du retard sans le voir | Le professeur fixe les échéances (problématique, sources, diagnostic, arguments) ; l'élève voit l'étape en cours et reçoit un rappel ; le tableau de bord prof montre l'avancement de chacun | A | Gratuit | M | 4 | P2 |
| 46 | Études de gestion exemples, annotées | Élève de Première | « Ma problématique » : l'élève ne sait pas ce qu'est une bonne question | Trois études complètes annotées (une association, une PME, une organisation publique) : problématique faible puis reformulée, sources jugées, diagnostic, arguments notés avec la grille | N | Gratuit | M | 4 | P2 |
| 47 | Export mis en page | Élève | L'export actuel est un texte brut | Dossier Grand Oral ou étude de gestion en PDF propre (titre, plan, sources numérotées) prêt à imprimer pour le professeur ; l'export texte reste gratuit | A | Premium | S | 2 | P3 |

### 2.5 Motivation et habitudes

| n° | Fonctionnalité | Pour qui | Problème réglé | Ce que ça fait concrètement | N / A | Offre | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|---|---|
| 48 | Badges de la filière et du progrès | Élève | Les badges de score global se calculent sur les 19 matières : une filière réussie à 100 % ne donne que 42 % (audit F08) ; les badges récompensent surtout le volume | Badges calculés sur la filière de l'élève ; nouveaux badges de progrès (« +20 points sur ton thème le plus faible », « carnet d'erreurs vidé ») ; retrait des badges impossibles | A | Gratuit | S | 3 | P1 |
| 49 | Série souple | Élève | Une série quotidienne culpabilise et casse au premier jour d'absence | Objectif « 4 jours sur 7 » au choix, gels gagnés en révisant, jours de pause déclarés (vacances, maladie) ; jamais de message culpabilisant | A | Gratuit | S | 3 | P2 |
| 50 | Objectif de note par épreuve | Élève | Le travail n'est relié à aucun but concret | À l'inscription ou au profil : « je vise 12 en droit et économie » ; la séance du jour et le diagnostic montrent l'écart et ce qui le réduit le plus | N | Gratuit | S | 4 | P2 |
| 51 | Comptes à rebours par épreuve | Élève | Une seule date de bac (16 juin par défaut) alors que les épreuves s'étalent | Sur l'accueil, la prochaine épreuve (« Philosophie dans 238 jours ») et ce qui est prévu cette semaine pour elle ; ordre des deux écrits de spécialité précisé dès qu'il est confirmé | A | Gratuit | S | 3 | P2 |
| 52 | Bilan de la semaine | Élève | L'effort de la semaine ne se voit pas | Le dimanche soir, une carte : chapitres acquis, cartes retenues, erreurs corrigées, la priorité de la semaine suivante ; image partageable sans nom ni données personnelles | N | Gratuit | S | 3 | P2 |
| 53 | XP qui récompense la maîtrise | Élève | Refaire 20 fois un exercice facile rapporte plus que vaincre une difficulté | Pas d'XP pour un exercice déjà réussi le même jour ; bonus pour une erreur corrigée à J+7 et pour un chapitre qui passe « maîtrisé » | A | Gratuit | S | 3 | P2 |
| 54 | Rappels utiles, une fois par jour | Élève | Un rappel « c'est l'heure de réviser » ne dit pas quoi faire | Une notification par jour au plus, à l'heure choisie, avec le contenu (« 3 cartes de droit et 1 erreur à refaire, 6 min ») ; aucune entre 22 h et 7 h ; test sur iPhone et Android réels | A | Gratuit | S | 4 | P1 |
| 55 | Minuteur de concentration ouvert à tous | Élève | Le minuteur Pomodoro est réservé à l'app installée (cadenas sur ordinateur, au CDI, sur Chromebook) | Minuteur accessible partout et lancé depuis la séance du jour ; le temps de concentration s'ajoute au bilan de la semaine | A | Gratuit | S | 3 | P1 |
| 56 | « Comment réviser » à la place des styles d'apprentissage | Élève | Le quiz « visuel / auditif » repose sur un neuromythe | Mini-cours de 5 écrans sur les deux techniques jugées les plus utiles (se tester, espacer ; Dunlosky et al., 2013), l'entrelacement et le sommeil, chacune reliée à l'outil de l'app qui l'applique | A | Gratuit | S | 3 | P1 |
| 57 | Boutique : récompenses de maîtrise | Élève | 50 objets cosmétiques et peu de visites ; risque de détourner du travail | Plus d'ajout d'objets ; quelques récompenses débloquées par la maîtrise d'une matière (bannière « Juriste » au droit maîtrisé) ; pas d'achat en euros, jamais | A | Gratuit | S | 2 | P3 |
| 58 | Kit anti-stress et veille d'épreuve | Élève | Le stress fait perdre des points, rien ne l'accompagne | Respiration guidée de 2 minutes, liste du matériel (convocation, pièce d'identité, calculatrice en mode examen selon l'épreuve), que faire en cas de retard ou de malaise, numéros utiles | N | Gratuit | S | 3 | P2 |

### 2.6 Social et classe (côté élèves)

| n° | Fonctionnalité | Pour qui | Problème réglé | Ce que ça fait concrètement | N / A | Offre | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|---|---|
| 59 | Un seul espace « Mes groupes » | Élève | Amis, classe, classement et ligue sont quatre entrées pour un usage quasi nul (3 défis entre amis au total) | Fusion : une classe (avec professeur) ou un groupe de révision (entre amis), mêmes duels, même mur ; le classement devient un onglet du groupe | A (fusion) | Gratuit | M | 3 | P2 |
| 60 | Classement du progrès, pas du volume | Élève | Classer par XP décourage ceux qui partent de loin | Classement de la semaine sur les points de maîtrise gagnés ; pseudonyme possible ; participation volontaire | A | Gratuit | S | 3 | P2 |
| 61 | Objectif coopératif de classe | Élève, prof | Les duels opposent ; une classe se motive aussi ensemble | « 80 % de la classe a fini le test de droit avant vendredi » : barre commune, récompense cosmétique collective, aucun nom des retardataires affiché | A | Gratuit | S | 3 | P3 |
| 62 | Questions au mur rattachées à un chapitre | Élève, prof | Les questions du mur flottent sans contexte | Une question se pose depuis la fiche du cours (« Je ne comprends pas cette phrase ») ; une réponse validée par le professeur porte un badge et s'affiche sous la fiche pour toute la classe | A | Gratuit | S | 3 | P3 |
| 63 | Paquets de classe | Élève, prof | Le partage d'un paquet passe par un long code à copier-coller | Le professeur ou un élève publie un paquet de flashcards dans la classe ; un appui l'ajoute à sa révision espacée | A | Gratuit | S | 3 | P3 |
| 64 | Signaler, bloquer, modérer | Élève, prof | Mur, amis et duels sont des espaces d'échange entre mineurs ; aucun outil contre le harcèlement | Signaler un message ou un pseudo, bloquer un ami, filtre de mots, file de modération pour le professeur, lien vers le 3018 ; cohérent avec la mission de NAH | A | Gratuit | M | 5 | P1 |

### 2.7 Professeurs

| n° | Fonctionnalité | Pour qui | Problème réglé | Ce que ça fait concrètement | N / A | Offre | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|---|---|
| 65 | Devoir en un clic depuis le programme | Prof | Pour faire travailler un chapitre, le professeur doit tout recréer à la main | Le professeur choisit un chapitre, un thème, un test ou un sujet de l'app, fixe une date ; il voit qui l'a fait, le score et les questions les plus ratées ; l'élève le retrouve en tête de sa séance du jour | N | Gratuit | M | 5 | P1 |
| 66 | Quiz de classe à partir des questions de l'app | Prof | 0 quiz de classe créé : il faut tout taper | Cocher des questions dans les exercices d'un chapitre (QCM, vrai/faux, calcul) pour composer un quiz ou une partie en direct en 2 minutes | A | Gratuit | S | 5 | P1 |
| 67 | Carte de chaleur des notions | Prof | Le tableau de bord donne des moyennes par matière, pas où la classe bloque | Tableau élèves × chapitres coloré par maîtrise ; les 5 questions les plus ratées de la semaine avec le taux d'erreur, prêtes à reprendre en début de cours | A | Gratuit | M | 5 | P1 |
| 68 | Comptes élèves sans e-mail | Prof, élève | Demander une adresse e-mail à des élèves de 15 ans freine l'adoption et pose une question de consentement | Le professeur crée la classe ; les élèves entrent avec le code de classe et un pseudonyme (connexion anonyme Supabase), et peuvent relier une adresse plus tard pour garder leur progression | N | Gratuit | M | 5 | P1 |
| 69 | Kit de lancement en classe | Prof | Les professeurs ne savent pas présenter l'app en 5 minutes | Fiche PDF, diaporama de 5 diapositives, mot aux familles, code de classe en QR, une séance type de 20 minutes en salle informatique | N | Gratuit | S | 4 | P1 |
| 70 | Mode direct au vidéoprojecteur | Prof | Le direct existe mais reste inutilisé (0 session) et se met à jour par interrogation répétée du serveur | Questions de l'app, écran projetable, réponses anonymes par défaut, statistiques par question exportables, mises à jour en temps réel (Supabase Realtime) | A | Gratuit | M | 3 | P2 |
| 71 | Relecture par des professeurs | Prof, élève | « Aucune notion inventée » est une règle, mais la relecture humaine de 806 chapitres n'est pas faite | Espace relecteur : un professeur d'économie-gestion valide un chapitre, corrige ou signale ; le chapitre affiche « Relu par un professeur le … » ; les signalements des élèves arrivent dans cette file | N | Gratuit | M | 5 | P2 |
| 72 | Sujets maison du professeur | Prof | Le professeur veut donner son propre sujet type bac | Composer un sujet (documents, questions, barème), le diffuser à la classe ; parties chiffrées corrigées automatiquement, rédactions notées par le professeur avec la grille | N | Gratuit | L | 4 | P3 |
| 73 | Séquences prêtes à projeter | Prof | Préparer une activité de début de cours prend du temps | Pour chaque chapitre, une activité de 10 à 15 minutes : 5 questions de rappel, un mini-cas, la correction projetable | N | Gratuit | M | 3 | P3 |
| 74 | Accès par l'ENT (GAR) | Prof, établissement | Les élèves doivent créer un compte de plus | Référencement au Gestionnaire d'accès aux ressources : l'élève arrive depuis le médiacentre de l'ENT, sans identifiant supplémentaire, avec seulement les données strictement nécessaires | N | Gratuit (et licence établissement) | L | 4 | P3 |
| 75 | Licence établissement | Établissement | Une famille ne peut pas toujours payer Premium | Premium pour toute une classe (ordre de grandeur du document des offres : 50 € par classe et par an), facture, gestion des élèves par le professeur, sans publicité | N | Premium (établissement) | L | 3 | P3 |

### 2.8 Parents

| n° | Fonctionnalité | Pour qui | Problème réglé | Ce que ça fait concrètement | N / A | Offre | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|---|---|
| 76 | Bilan parent lisible | Parent | L'espace parent montre XP, niveau et pourcentages peu parlants | Une page par semaine : jours de travail, temps, matières travaillées, prochaines épreuves, une phrase d'encouragement à dire ; consultable dans l'app sans compte parent ; l'envoi par e-mail reste Ultimate | A | Gratuit (dans l'app), Ultimate (e-mail) | S | 3 | P2 |
| 77 | L'élève décide de ce que voit le parent | Élève, parent | Partage tout ou rien | Cases : temps et régularité, progrès par matière, notes de classe ; journal « tes parents ont consulté ton bilan le … » ; arrêt du partage en un geste | A | Gratuit | S | 4 | P1 |
| 78 | Guide des familles STMG | Parent | Les parents connaissent mal la filière et le calendrier | Épreuves et coefficients, dates 2027, aménagements (tiers-temps), « aider sans mettre la pression », après le bac STMG ; en cinq langues | N | Gratuit | S | 3 | P2 |
| 79 | Offrir Premium (paiement par un adulte) | Parent | L'élève mineur ne doit pas payer lui-même | Page « Offrir Premium à mon enfant » : paiement par l'adulte, sans renouvellement automatique, activation sur le compte de l'enfant par un code ; aucune monnaie virtuelle vendue | N | Premium | M | 3 | P1 |

### 2.9 Mes notes de classe

| n° | Fonctionnalité | Pour qui | Problème réglé | Ce que ça fait concrètement | N / A | Offre | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|---|---|
| 80 | Saisir ses notes | Élève | Les notes reçues en classe ne servent pas à orienter la révision | Note sur 20 (et coefficient), puis matière et chapitre dans des menus tirés des cours de la filière, date ; notes privées, comprises dans l'export et effacées avec le compte | N | Gratuit | M | 4 | P1 |
| 81 | Ce qu'il faut améliorer | Élève | L'élève ne sait pas par où commencer après un contrôle raté | Les chapitres aux notes les plus basses passent en tête de la séance du jour, avec relecture puis exercices | N | Gratuit | S | 4 | P1 |
| 82 | Comment l'améliorer | Élève | Savoir quoi retravailler ne suffit pas | Pour chaque chapitre faible : les fiches à relire, les exercices et la question d'annale à refaire, placés dans le plan jusqu'au bac | N | Premium | M | 4 | P2 |
| 83 | Simulateur de note du bac STMG | Élève, parent | L'élève ne mesure pas ce que vaut chaque épreuve | Moyennes de contrôle continu (40 %) et notes visées aux épreuves terminales, avec les coefficients officiels de la session 2027 (spécialités 16, Grand Oral 12, maths anticipées 2…) vérifiés sur Éduscol ; mention estimée | N | Gratuit | S | 4 | P2 |
| 84 | Relevé de notes en photo | Élève | Pas d'interface publique de Pronote ; tout ressaisir est pénible | Photo ou capture du relevé lue sur l'appareil (OCR déjà en place), l'élève valide chaque ligne et choisit le chapitre | N | Gratuit | M | 3 | P3 |
| 85 | L'IA sur l'énoncé raté | Élève | Comprendre pourquoi une question de contrôle a été ratée | L'élève photographie ou recopie l'énoncé : explication de la méthode pas à pas, puis 2 exercices du même type corrigés ; quota mensuel ; l'énoncé passe par le fournisseur d'IA, ce que la confidentialité dit clairement | N | Ultimate | L | 4 | P2 |

### 2.10 Orientation et après-bac

| n° | Fonctionnalité | Pour qui | Problème réglé | Ce que ça fait concrètement | N / A | Offre | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|---|---|
| 86 | Après le bac STMG | Élève de Terminale, parent | Rien sur la suite alors que les vœux se font de janvier à mars | Fiches BUT (GEA, TC, GACO, Carrières juridiques, Information-communication…), BTS (CG, MCO, NDRC, GPME, SAM, SIO…), DCG, licences de droit, AES, économie-gestion ; pour chacune les chapitres du programme qui comptent ; rappel que 50 % des places de BUT de spécialité proche sont réservées aux bacheliers technologiques | N | Gratuit | M | 4 | P2 |
| 87 | Calendrier Parcoursup et projet motivé | Élève de Terminale | Dates manquées, « projet de formation motivé » bâclé | Échéances Parcoursup 2027 avec rappels ; trame du projet motivé (ce que je sais faire, pourquoi cette formation, preuves) ; relecture par l'IA en Ultimate, sans rédiger à la place de l'élève | N | Gratuit, Ultimate (relecture) | M | 4 | P2 |
| 88 | Choisir sa spécialité de Terminale | Élève de Première | Le choix entre gestion-finance, mercatique, RH-communication et SIG se fait sans avoir goûté à chacune | Une mini-découverte par spécialité (2 fiches, 5 questions, un cas, les métiers et formations), et un comparatif selon ses résultats en Première, calculé sur l'appareil | N | Gratuit | S | 4 | P2 |
| 89 | Mes points forts pour l'orientation | Élève | L'élève ne relie pas ses réussites aux formations | À partir de sa maîtrise par matière (calcul local, sans profilage commercial) : « tu réussis en droit et en mercatique : regarde le BUT TC, le BTS NDRC… » | N | Gratuit | S | 3 | P3 |
| 90 | Annonces d'orientation contextuelles | Élève, éditeurs | Le gratuit doit être financé sans pister | Les seules annonces autorisées sur les pages d'orientation : salons, écoles et formations publiques ou partenaires, choisies d'après la page et jamais d'après l'élève, marquées « Publicité » avec le nom de l'annonceur | N | Gratuit | S | 2 | P3 |

### 2.11 Accessibilité et langues

| n° | Fonctionnalité | Pour qui | Problème réglé | Ce que ça fait concrètement | N / A | Offre | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|---|---|
| 91 | Temps majoré (tiers-temps) | Élève avec PAP, PPS ou aménagement | Tous les chronomètres (quiz, sujets de 4 h, défi, Grand Oral) sont au temps standard | Réglage « temps majoré d'un tiers » appliqué à toutes les épreuves chronométrées, comme le jour du bac ; affiché discrètement, jamais visible des autres élèves | N | Gratuit | S | 4 | P1 |
| 92 | Réglages de lecture fins | Élève dys | Le mode dys est un interrupteur unique | Interligne, espacement des lettres, choix de police (dont Luciole, conçue pour la basse vision), règle de lecture qui suit la ligne, surlignage des mots lus à voix haute | A | Gratuit | S | 3 | P2 |
| 93 | Exercices utilisables au clavier et au lecteur d'écran | Élève malvoyant | Glisser-déposer (tri, association, remise en ordre) sans alternative vérifiée | Alternative au clavier pour chaque type d'exercice, annonces du lecteur d'écran, tests sur VoiceOver, TalkBack et NVDA | A | Gratuit | M | 3 | P2 |
| 94 | Dictée vocale dans la bonne langue, avec avertissement | Élève | Le micro suit la langue de l'interface, pas celle de l'exercice d'anglais ; la reconnaissance peut passer par les serveurs du navigateur | Langue de l'exercice utilisée ; avant le premier usage, un message dit où part la voix, avec « ne plus utiliser » | A | Gratuit | S | 2 | P2 |
| 95 | Mode bilingue pour élèves allophones | Élève allophone | Un élève arrivé récemment comprend mal le vocabulaire de gestion | Le terme français reste affiché (l'épreuve est en français) avec sa traduction à côté en anglais, espagnol, italien ou arabe ; glossaire bilingue de la filière | A | Gratuit | M | 3 | P3 |
| 96 | Mode calme | Élève | Confettis, sons et animations gênent certains élèves (TDAH, sensibilité sensorielle) | Un réglage qui coupe animations, sons et effets de récompense, au-delà de la préférence du système | A | Gratuit | S | 2 | P3 |

### 2.12 Hors ligne, performances et fiabilité

| n° | Fonctionnalité | Pour qui | Problème réglé | Ce que ça fait concrètement | N / A | Offre | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|---|---|
| 97 | Sauvegarde visible et sûre | Élève | Notes et paquets peuvent ne pas être envoyés ; la déconnexion peut perdre les derniers changements (audit F02, F03) | Indicateur « Sauvegardé ✓ / en attente / à réessayer », file d'attente hors ligne envoyée au retour du réseau, déconnexion seulement après une sauvegarde réussie ou un choix explicite | A | Gratuit | M | 5 | P1 |
| 98 | Fusion entre appareils fiable | Élève | Un favori supprimé réapparaît, une note ancienne bat une récente, d'anciennes pièces reviennent (audit F04) | Dates de modification et suppressions enregistrées élément par élément ; solde de pièces calculé à partir des gains et des dépenses | A | Gratuit | M | 4 | P1 |
| 99 | Dates à l'heure de Paris | Élève | Le plan affiche « Demain » puis « mar. 20 oct. », le même jour deux fois ; une révision ratée prévue à J+1 tombe le jour même (audit F01) | Calcul des jours sur le calendrier local, testé à minuit et aux changements d'heure | A | Gratuit | S | 4 | P1 |
| 100 | Matières disponibles hors ligne, affichées | Élève | Une première visite interrompue ne garantit pas tous les chapitres hors ligne | Dans « Mon espace », la liste des matières avec « disponible hors ligne ✓ » et un bouton « Télécharger » ; vérification du cache au démarrage | A | Gratuit | S | 3 | P2 |
| 101 | Temps réel pour la classe | Prof, élève | Le mode direct et la classe interrogent le serveur toutes les 1,8 à 4 secondes (batterie, quotas) | Abonnements Supabase Realtime pour le direct, le mur et les duels | A | Gratuit | M | 3 | P2 |
| 102 | Économiseur de données | Élève | Forfaits mobiles limités | Réglage qui retarde les téléchargements lourds (OCR, polices, matières non ouvertes) au Wi-Fi et prévient avant plus de 5 Mo | N | Gratuit | S | 2 | P3 |
| 103 | Fin du verrou « application installée » | Élève | Coach et personnalisation affichent un cadenas hors de l'app installée (`T-coach.png`) | Fonctions ouvertes partout ; l'installation reste conseillée par un bandeau discret | A | Gratuit | S | 3 | P1 |

### 2.13 Données, confiance et sécurité

| n° | Fonctionnalité | Pour qui | Problème réglé | Ce que ça fait concrètement | N / A | Offre | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|---|---|
| 104 | Règles d'accès finies et base séparée | Tous | Les tables sociales restent lisibles et modifiables avec la clé publique ; base partagée avec NAH | Appliquer et tester les règles RLS en attente, finir la suppression de compte, séparer RévizSTMG de NAH avant d'ouvrir des classes ou d'encaisser | A | Gratuit | M | 5 | P1 |
| 105 | « Relu par un professeur » et sources | Élève, prof, parent | Rien ne dit à l'élève si un chapitre a été vérifié | Sous chaque chapitre : date de relecture, relecteur (fonction), texte officiel de référence ; page « Comment on vérifie le contenu » | N | Gratuit | M | 4 | P1 |
| 106 | Page « Qui voit quoi » | Élève, parent | L'élève ne sait pas ce que voient sa classe, ses amis, ses parents, son professeur | Un tableau simple (prénom, photo, XP, série, notes de classe, dossiers) par public, avec un lien vers chaque réglage | N | Gratuit | S | 4 | P1 |
| 107 | Prévenir avant tout envoi à un service tiers | Élève | Le dictionnaire envoie le texte libre à MyMemory ; la vision et la dictée passent par des tiers | Avant le premier envoi : quel service, quel texte, pourquoi ; choix « ne plus envoyer » ; mention dans la politique de confidentialité | A | Gratuit | S | 4 | P1 |
| 108 | « Mon offre » et droits vérifiés par le serveur | Élève, parent | Les mois offerts au mérite et les futurs abonnements sont locaux, falsifiables | Droits enregistrés dans une table protégée ; écran « Mon offre » (offre, échéance, quotas d'IA restants) ; les fonctions Premium restent visibles et ne bloquent jamais un cours ou un exercice | N | Gratuit / Premium | M | 4 | P1 |
| 109 | Emplacement publicitaire unique et sobre | Élève, éditeurs | La publicité prévue doit respecter le DSA (art. 28) et la LCEN | Un composant unique, images servies par RévizSTMG, mention « Publicité » et annonceur, accueil / matière / résultats seulement, jamais dans un cours, un exercice, un test, un sujet ou un oral ; masqué pour Premium, Ultimate, professeurs et licences établissement | N | Gratuit | S | 3 | P1 |
| 110 | Export lisible de ses données | Élève | L'export JSON est illisible pour un humain | En plus du JSON : un PDF « Mon parcours » (progression, notes de classe, dossiers Grand Oral et étude de gestion) | A | Gratuit | S | 2 | P3 |

### 2.14 Intelligence artificielle, encadrée

| n° | Fonctionnalité | Pour qui | Problème réglé | Ce que ça fait concrètement | N / A | Offre | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|---|---|
| 111 | Fiche par photo avec l'IA, déployée pour de vrai | Élève | Le mode IA est proposé alors que la fonction `fiche-vision` n'est pas en ligne (audit F10) | Afficher la disponibilité réelle ; une fois déployée : authentification, quota compté par le serveur, taille d'image limitée, aucune conservation des photos ; repli automatique sur la lecture locale | A | Ultimate | M | 3 | P2 |
| 112 | « Explique-moi autrement » limité au programme | Élève | Une explication différente aide à débloquer, mais une IA générale peut sortir du programme | Le tuteur répond seulement à partir des chapitres de l'app, cite la fiche source, refuse ce qui sort du programme de STMG, ne fait pas les devoirs à la place de l'élève | N | Ultimate | L | 4 | P3 |
| 113 | Questions proposées par l'IA, validées par un humain | Équipe, prof | 50 chapitres sans entraînement et 344 sans définition | Outil interne : l'IA propose des questions tirées du seul texte d'un chapitre, un professeur relecteur valide ou corrige avant publication ; l'élève ne voit que du contenu relu | N | Gratuit (outil d'équipe) | M | 4 | P2 |

### 2.15 Simplifier, renommer, retirer

| n° | Fonctionnalité | Pour qui | Problème réglé | Ce que ça fait concrètement | N / A | Offre | Effort | Impact | Priorité |
|---|---|---|---|---|---|---|---|---|---|
| 114 | « Coach IA » renommé « Mon diagnostic » | Élève, parent | Le « coach IA » est un moteur de règles local : le nom promet ce que l'outil ne fait pas (et l'offre Ultimate vendra une vraie IA) | Nouveau nom et texte d'accueil honnête ; le diagnostic par matière est gardé, le plan rejoint la séance du jour | A | Gratuit | S | 4 | P1 |
| 115 | Une trousse de 5 entrées | Élève | 10 outils dans la trousse, la plupart jamais ouverts (statistiques : révision 2 vues en 7 jours, coach et bac blanc 0) | Séance du jour · S'entraîner au bac · Mon projet (Grand Oral ou étude de gestion) · Outils (formules, méthodo, photo) · Mon diagnostic | A (fusion) | Gratuit | S | 4 | P1 |
| 116 | Accueil recentré | Élève | Série, défi, outil conseillé, deux cartes de progression et communauté se disputent l'écran | Ordre : reprendre, séance du jour, matières, prochaine épreuve ; la série et la boutique passent dans le profil | A | Gratuit | S | 3 | P1 |
| 117 | Retirer « Chapitre au hasard » | Élève | Ouvrir un chapitre au hasard n'aide pas à réviser | Remplacé par « Continuer ma séance » ou, pour un nouvel élève, « Commencer par le chapitre 1 de ta spécialité » | A (retrait) | Gratuit | S | 2 | P3 |
| 118 | Retirer le code mort et les doublons d'écrans | Équipe | `DuelQuiz.jsx` n'est importé nulle part ; duels de classe et d'amis font la même chose | Supprimer le code inutilisé, un seul moteur de duel, un seul moteur de quiz chronométré | A (retrait) | Gratuit | S | 2 | P3 |

**Total : 118 propositions.**

### 2.16 Répartition et pistes écartées

**Répartition des 118 propositions.** 42 en P1, 48 en P2, 28 en P3. 97 restent entièrement gratuites ; Premium apporte surtout **plus d'entraînement aux épreuves** (sujets illimités, mode examen, plan de veille complet, « comment l'améliorer », export mis en page, retour sur la voix) ; Ultimate regroupe **ce qui coûte à chaque usage** (correction des rédactions, fiche par photo avec l'IA, tuteur borné au programme, exercices sur l'énoncé raté, questions personnalisées du jury, e-mail aux parents, relecture du projet motivé). Rien de ce qui sert à apprendre le programme, à être accessible, à protéger ses données ou à travailler en classe ne devient payant.

**Pistes écartées volontairement.**

| Piste | Pourquoi l'écarter |
|---|---|
| Publicité ciblée, régie avec cookies | Interdite envers les mineurs connus sur une plateforme en ligne (DSA, art. 28) et contraire à la promesse de confidentialité |
| Vente de pièces, gels de série ou objets en euros | Public mineur ; mécanique de jeu d'argent ; contraire au document des offres |
| Tuteur IA généraliste ouvert | Sort du programme de STMG, coûte cher, fait les devoirs à la place de l'élève |
| Classement public par notes de classe | Humiliant pour les élèves en difficulté, données sensibles, contraire à la mission anti-harcèlement de NAH |
| Contenu réservé aux payants (modèle Kartable / SchoolMouv) | Fermerait l'app aux élèves qui ne peuvent pas payer et aux classes qui arrivent par les professeurs |
| Nouvelles collections de boutique | 4 vues en 7 jours : l'effort doit aller vers les épreuves |
| Connexion directe à Pronote | Pas d'interface publique documentée ; la saisie ou la photo du relevé suffisent |

---

## 3. Le top 15 à faire en premier

| Rang | n° | Fonctionnalité | Pourquoi maintenant |
|---|---|---|---|
| 1 | 104 | Règles d'accès finies et base séparée de NAH | Aucune classe ne doit être ouverte ni aucun euro encaissé tant que les tables sociales d'élèves mineurs restent modifiables avec la clé publique. |
| 2 | 97 | Sauvegarde visible et sûre | La promesse « progresse à ton rythme » ne tient pas si une note ou une séance peut disparaître à la déconnexion. |
| 3 | 15 | Un score de maîtrise unique et expliqué | Dire « point faible » à une élève qui a 92 % au test détruit la confiance dans tout le reste de l'app. |
| 4 | 13 | Ma séance du jour | Cinq outils concurrents sont aujourd'hui presque inutilisés ; un seul bouton de 5 à 30 minutes crée l'habitude quotidienne. |
| 5 | 14 | Répétition espacée par carte | Se tester et espacer sont les deux techniques les mieux prouvées, et c'est ce que font Anki et Quizlet que les lycéens connaissent déjà. |
| 6 | 16 | Carnet d'erreurs au premier plan | L'outil le plus utile de l'app est caché ; refaire ses erreurs à J+1, J+3, J+7 est le geste de révision le plus rentable. |
| 7 | 6 | « Pourquoi ? » sous chaque correction | Une correction qui renvoie à la phrase exacte du cours transforme chaque erreur en apprentissage, pour un coût faible. |
| 8 | 27 | Épreuve anticipée de maths en Première | Nouvelle épreuve de juin 2027, au format très précis (12 automatismes puis 3 exercices), totalement absente de l'app aujourd'hui. |
| 9 | 25 | Vrais sujets MSGN, y compris SIG | Coefficient 16 : c'est l'épreuve qui pèse le plus, et un élève de SIG reçoit aujourd'hui 2 questions pour « 4 h ». |
| 10 | 26 | Vrais sujets de droit et économie | Coefficient 16 aussi ; les deux parties sur 10 et la méthode juridique sont la marque de STMG que les concurrents généralistes couvrent mal. |
| 11 | 65 | Devoir en un clic depuis le programme | Les classes arrivent par les professeurs ; un devoir qui ne demande aucune saisie est la raison la plus simple d'adopter l'app. |
| 12 | 66 | Quiz de classe à partir des questions de l'app | 0 quiz créé à ce jour parce qu'il faut tout taper ; réutiliser les 27 000 questions existantes lève ce frein. |
| 13 | 68 | Comptes élèves sans e-mail | Entrer avec un code de classe et un pseudonyme supprime la première friction en salle et la question du consentement des moins de 15 ans. |
| 14 | 80 | Mes notes de classe (saisie et « ce qu'il faut améliorer », n° 81) | Prévu gratuit pour décembre dans le document des offres, c'est le pont entre la classe réelle et l'app, et la base de la valeur Premium. |
| 15 | 64 | Signaler, bloquer, modérer | Ouvrir mur, amis et duels à des mineurs sans outil contre le harcèlement serait incohérent avec la mission de NAH. |

**À glisser dans les mêmes semaines, car très peu coûteux (effort S)** : dates à l'heure de Paris (n° 99), « bac blanc » renommé quiz chronométré par épreuve (n° 24), « Coach IA » renommé « Mon diagnostic » (n° 114), fin du verrou « application installée » (n° 103), temps majoré (n° 91), réponses rédigées avec grille du corrigé (n° 29), définition en bulle (n° 4).

---

## 4. Sources consultées

### 4.1 Ce que fait la concurrence, et ce que RévizSTMG en retient

| Service | Ce qui marche chez eux | Ce qui leur manque pour un élève de STMG | Ce que RévizSTMG en tire (n°) |
|---|---|---|---|
| Kartable | Cours, quiz, exercices et annales corrigés, sections Bac, PDF hors ligne ; gratuit limité à 10 contenus, Premium affiché à 13,99 € par mois | Le contenu lui-même est payant | Annales par chapitre (33), fiche d'une page (20) ; tout le programme reste gratuit |
| SchoolMouv | Kit Bac (programme de révision, annales, méthodes du bac de français et du Grand Oral), flashcards, quiz quotidien IA, générateur IA de fiches à partir d'un cours scanné, planning, suivi des progrès | Payant, généraliste, peu de méthode propre à STMG | Séance du jour (13), veille d'épreuve (23), fiche par photo bornée (111) |
| Nomad Education | Gratuit de base, fiches, quiz expliqués, coaching ; contenus d'enseignants « enrichis par l'IA » ; Nomad+ payant (annales, fiches de spécialité) | Explications génériques, peu de format d'épreuve STMG | « Pourquoi ? » (6), relecture humaine affichée (71, 105) |
| digiSchool | Tuteur IA 24/7 « basé sur des ressources vérifiées », entraide entre élèves, cours particuliers payants | Entraide difficile à modérer | Tuteur borné au programme (112), modération (64) |
| Quizlet | Mode Apprendre qui fait revenir les termes ratés, mode Test, tuteur IA ; le gratuit a été restreint (Apprendre et Test limités), ce qui a fâché les élèves | Cartes faites par les élèves, souvent fausses ; restrictions mal reçues | Cartes à soi (18), carnet d'erreurs (16) ; ne jamais restreindre l'entraînement de base |
| Anki (FSRS) | Mémoire par carte, rétention visée réglable (90 % par défaut), moins de révisions pour le même résultat | Austère, pas de contenu STMG | Répétition espacée par carte (14) |
| Duolingo | Séries, gels de série, célébrations d'étapes, ligues hebdomadaires ; la série est son levier de rétention le plus fort | La série peut devenir une fin en soi | Série souple (49), XP de maîtrise (53), classement du progrès (60) |
| Khan Academy | Niveaux de maîtrise par compétence, défis de cours, devoirs et objectifs de maîtrise donnés par le professeur, synthèse de la semaine pour le professeur | Programme américain | Score de maîtrise (15), devoir en un clic (65), carte de chaleur (67) |
| Pronote / ENT | Notes, cahier de textes ; emploi du temps exportable en iCal | Aucune interface publique pour les notes ; ne fait pas réviser | Mes notes de classe (80), relevé en photo (84), accès par le GAR (74) |
| TikTok | Format court ; environ 20 % des élèves de bac général et 50 % de bac pro disent s'en servir pour réviser (enquête Hatier relayée par la presse) | Désinformation, aucun suivi | Séance de 5 minutes (13), question de bac du jour (38) |

**Ce qui est propre à RévizSTMG et que personne ne fait aussi bien pour cette filière** : les espaces Grand Oral et étude de gestion, les exercices tirés strictement du chapitre, les calculs de gestion à nombres renouvelés, le SQL de SIG, le tout gratuit, hors ligne et sans traceur. Les propositions renforcent cet avantage plutôt que de copier le volume des généralistes.

### 4.2 Dans le dépôt et l'application

- `/var/tmp/analyse-site/README.md`, `app/src/App.jsx` (33 routes), `app/src/pages/*.jsx`, `app/src/components/`, `app/src/data/` (`srs.js`, `coachAI.js`, `sujetBac.js`, `study.js`), `app/src/store.jsx`, `app/content/` (19 matières, `commun/epreuves.json`, `commun/grand-oral.json`).
- `docs/AUDIT-2026-10-18.md` (constats F01 à F11), `docs/COORDINATION.md`, `docs/ARCHITECTURE.md`, `docs/RELECTURE.md`.
- `statistiques/STATISTIQUES.md` (19 octobre 2026 : 11 comptes, 2 actifs sur 7 jours, écrans les plus vus).
- Document des offres : `/tmp/claude-0/-home-user-NAH/b00c6cf6-33b6-5d76-a12d-45338d0a337c/scratchpad/offres/offres.html`.
- Parcours dans le navigateur (Playwright, Chromium, 390 × 844, fuseau Europe/Paris, réseau extérieur bloqué) : scripts `/tmp/claude-0/-home-user-NAH/b00c6cf6-33b6-5d76-a12d-45338d0a337c/scratchpad/analyse/scripts/parcours.mjs` et `/tmp/claude-0/-home-user-NAH/b00c6cf6-33b6-5d76-a12d-45338d0a337c/scratchpad/analyse/scripts/interactions.mjs` ; 59 captures et les textes relevés (`T-textes.json`, `P-textes.json`, `I-textes.json`) dans `/tmp/claude-0/-home-user-NAH/b00c6cf6-33b6-5d76-a12d-45338d0a337c/scratchpad/analyse/captures-fonctions/`. Les fonctions en ligne (compte, classe, amis, parent, classement) ont été jugées sur le code : sans réseau, elles affichent « momentanément indisponible ».

### 4.3 Épreuves et programme

- Calendrier officiel du bac 2027 (cité par l'app) : [education.gouv.fr](https://www.education.gouv.fr/reussir-au-lycee/baccalaureat-brevet-cap-le-calendrier-2027-341384)
- Série STMG sur Éduscol (épreuves, coefficients, notes de service) : [eduscol.education.gouv.fr](https://eduscol.education.gouv.fr/5619/baccalaureat-technologique-serie-sciences-et-technologies-du-management-et-de-la-gestion-stmg)
- Note de service du BO spécial n° 4 du 17 septembre 2026 redéfinissant les épreuves terminales de STMG pour 2027 : [education.gouv.fr/bo/2026/Special4/MENE2622652N](https://www.education.gouv.fr/bo/2026/Special4/MENE2622652N) — **repérée par la recherche mais pas lisible depuis cet environnement** (accès bloqué) : à lire avant d'écrire les sujets des n° 25 et 26.
- Épreuves de STMG, version consolidée (académie de Lyon) : [ecogestion-legt.enseigne.ac-lyon.fr](https://ecogestion-legt.enseigne.ac-lyon.fr/legt/wp-content/uploads/2023/12/voie_t_stmg_doc_consolideepreuves.pdf)
- Sujet MSGN 2025 : [aufutur.fr](https://aufutur.fr/baccalaureat/bac-stmg-2025-sujet-management-sciences-gestion-numerique/) ; épreuves STMG 2027 : [allostmg.fr](https://www.allostmg.fr/epreuves), [digischool.fr](https://www.digischool.fr/articles/lycee/bac/bac-stmg/)
- Épreuve anticipée de mathématiques (format, 12 automatismes en voie technologique) : [letudiant.fr](https://www.letudiant.fr/bac/corriges-du-bac/article/sujets-corriges-bac-epreuve-anticipee-de-mathematiques-2026-premiere-generale-et-technologique.html), [cned.fr](https://www.cned.fr/l-actualite-de-la-formation/blog-lycee/bac-2026-les-sujets-0-de-l-epreuve-anticipee-de-mathematiques)
- Grand Oral coefficient 12 en voie technologique à partir de 2027 : [schoolmouv.fr](https://www.schoolmouv.fr/baccalaureat/grand-oral), [aufutur.fr](https://aufutur.fr/?p=25782), [digischool.fr](https://www.digischool.fr/articles/lycee/bac/bac-2027-ce-qui-change/)
- Bac de français 2026-2027 : [lycée Dumont (Versailles)](https://lyc-dumont-maurepas.ac-versailles.fr/IMG/pdf/bac_epreuve_anticipee_francais_2026-2027.pdf), [aufutur.fr](https://aufutur.fr/revisions/francais/bac-de-francais-epreuves-ecrites-orales/)

### 4.4 Concurrence et usages

- Kartable : [App Store](https://apps.apple.com/FR/app/id825500330)
- SchoolMouv : [Kit Bac et Brevet](https://www.schoolmouv.fr/fonctionnalites/kit-bac-et-brevet), [accueil](https://www.schoolmouv.fr/)
- Nomad Education : [Premium](https://nomadeducation.fr/premium), [espace presse](https://www.nomadeducation.fr/espace-presse/articles/2)
- digiSchool : [lycée](https://www.digischool.fr/lycee), [digiSchoolPass](https://www.digischool.fr/articles/digischool/rentree-des-classes-2024-offre-speciale-digischoolpass/)
- Quizlet : [restrictions du gratuit](https://bmgator.org/33901/news/changes-to-quizlet-cause-frustration-among-students/), [présentation](https://tech.yahoo.com/general/articles/quizlet-160943143.html)
- Anki / FSRS : [FAQ Anki](https://faqs.ankiweb.net/what-spaced-repetition-algorithm), [synthèse FSRS](https://domenic.me/fsrs/)
- Duolingo : [recherche sur les séries](https://blog.duolingo.com/duolingo-streak-research/), [Lenny's Newsletter](https://www.lennysnewsletter.com/p/behind-the-product-duolingo-streaks)
- Khan Academy : [contenus assignables](https://support.khanacademy.org/hc/fr/articles/18564282990861), [outils enseignants Khanmigo](https://support.khanacademy.org/hc/en-us/articles/14799047733645-What-teacher-tools-are-available-on-Khanmigo)
- Pronote (export iCal de l'emploi du temps) : [guide d'établissement](https://ecolelasource.ch/storage/1515/Synchro-calendrier_etudiant.pdf)
- Révisions sur TikTok (enquête Hatier relayée) : [diplomeo.com](https://diplomeo.com/actualite-revisions_bac_tiktok) ; équipement des 13-19 ans (Arcom, via LCP) : [lcp.fr](https://lcp.fr/index%2Ephp/actualites/effets-psychologiques-de-tiktok-sur-les-mineurs-une-commission-d-enquete-en-cours-de)

### 4.5 Apprentissage, orientation, droit

- Dunlosky et al. (2013), techniques d'étude : [Association for Psychological Science](https://www.psychologicalscience.org/news/releases/which-study-strategies-make-the-grade.html)
- Rohrer et al. (2020), entrelacement en mathématiques : [IES](https://ies.ed.gov/use-work/awards/interleaved-mathematics-practice), [The Learning Scientists](https://www.learningscientists.org/blog/2021/10/28-1)
- BUT et bacheliers technologiques : [Onisep](https://www.onisep.fr/formation/apres-le-bac-les-etudes-superieures/les-principales-filieres-d-etudes-superieures/les-but-bachelors-universitaires-de-technologie)
- GAR (accès aux ressources depuis l'ENT) : [gar.education.fr](https://gar.education.fr/wp-content/uploads/2022/03/GAR_A4_36pages_20191115.pdf)
- DSA, article 28 et lignes directrices de juillet 2025 : [Le Club des juristes](https://www.leclubdesjuristes.com/societe/numerique/protection-des-mineurs-en-ligne-la-commission-europeenne-publie-ses-lignes-directrices-11686/)
- CNIL, droits numériques des mineurs et 8 recommandations : [cnil.fr](https://www.cnil.fr/les-droits-numeriques-des-mineurs), [cnil.fr](https://www.cnil.fr/la-cnil-publie-8-recommandations-pour-renforcer-la-protection-des-mineurs-en-ligne)

### 4.6 Limites de cette analyse

- Les fonctions en ligne (classe, amis, parent, rappels, classement) n'ont pas pu être essayées sans réseau ; elles sont jugées sur le code et les statistiques.
- La progression simulée n'a pas déclenché les badges (ils se calculent au prochain résultat) : le « 0 badge » des captures vient de la simulation, pas d'un défaut.
- Les prix et fonctionnalités des concurrents viennent de fiches d'application et d'articles tiers, à revérifier avant toute communication.
- Le format précis des écrits de spécialité de la session 2027 doit être relu dans la note de service de septembre 2026 avant d'écrire de nouveaux sujets.
