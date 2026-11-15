# Audit 2 : apprentissage et ressources

Produit audité : worktree audit-global-20261109-2, HEAD 9eea90627. Audit indépendant sans modification produit, compte fictif, requêtes externes bloquées, serveur compilé local :4262. Cette passe ne certifie pas chaque phrase des milliers de questions.

## Couverture réalisée

- Inventaire exécutable des données et jeux de chaque section Première/Terminale : 19 matières historiques, 861 sections, 4321 jeux. Deux matières historiques de langues (111 sections) sont remplacées dans les parcours actifs par les guides : 17 matières scolaires actives et 750 sections. Les totaux historiques ne correspondent donc pas aux seuls cours visibles.
- Tests ciblés : 49 réussis dans six fichiers reading-position, temps-theme, formula-practice, formules-plages, question-sessions et revision-paths. Ils contrôlent notamment reprise, normalisation des temps, formules, sessions et variété. Ils ne prouvent pas l’exactitude pédagogique exhaustive.
- Deux sondes navigateur indépendantes avec profil Première fictif : sélection/rechargement atelier en mobile 390×844 ; audio et panne moteur simulée en 320×568. Scripts, traces JSON et captures dans ce répertoire.
- Cinq PDF de langues publics inspectés par PyMuPDF : anglais 56 pages/220 champs/305 liens ; allemand 47/200/261 ; espagnol 55/244/312 ; arabe 50/172/308 ; italien 49/172/291. Aucune page sans texte. Tous contiennent cases, listes et champs texte. Un champ rempli avec « Élève audit 123 » a été enregistré puis relu pour chaque fichier. Copies de test exclusivement dans output. L’ouverture dans tous les lecteurs PDF et les liens vidéo externes n’ont pas été testés.

## Défauts reproduits

### A2-01 — Sélection de formules masquée après rechargement (4/10)

1. Profil Première, atelier de formules.
2. Programme : Toute la Première et Terminale ; niveau : notions de Terminale.
3. Cocher « Espérance (loi binomiale) », identifiant f14.
4. Recharger avant de générer la séance.

Attendu : retrouver le programme et la formule sélectionnée, ou annoncer clairement une sélection hors programme actuel.
Observé : programme revient à « Ma classe et ma spécialité », niveau Tous ; écran annonce 0 formules/0 exercices et génération indisponible. La sélection f14 reste dans localStorage. Repasser au programme complet la récupère : ce n’est pas une perte définitive des données.
Cause : FormulaWorkshop.jsx:17 initialise les filtres aux valeurs fixes ; lignes22 et26 sauvegardent selected mais pas programme/level ; ligne27 filtre la sélection selon ce programme réinitialisé.
Preuves : sondes.mjs, atelier.json, sondes.json, atelier-recharge.png.
Correction conseillée : persister programme/niveau avec selected ; migration des sessions anciennes et indication des sélections hors filtre.

### A2-02 — Panne de synthèse vocale : faux état lecture (4/10)

Test de robustesse synthétique, et non constat d’une panne de voix sur un appareil réel : remplacer speechSynthesis.speak par une fonction qui lève une erreur ; ouvrir Révision audio d’un paquet fictif ; cliquer Jouer.
Attendu : retour au bouton lecture, erreur lisible, possibilité réessayer/fermer.
Observé : erreur page « Synthèse indisponible », aucune explication utilisateur ; bouton reste Pause, sans son. Fermer reste possible.
Cause : AudioReview.jsx:39 appelle synth.speak sans protection ; ligne57 passe d’abord playing à true. Le chemin onerror:38 avance sans signaler les pannes asynchrones.
Preuves : sondes.mjs, sondes.json (audio.errors/dialog/buttons), audio-erreur.png.
Correction conseillée : traiter erreur synchrone et onerror, arrêter proprement et afficher un état indisponible sans ignorer silencieusement toute la liste.

## Améliorations séparées des bugs

- 6/10 : 43 sections actives n’ont aucun jeu local de mémorisation dans jeuxDuChapitre. Exemple math-c5 section Indépendance, exercices calculatrice/binomiale ; plusieurs synthèses et dissertations de philosophie. Ce n’est PAS absence totale d’exercices : les studios et questions rédigées restent distincts. Ajouter des exercices autonomes originaux de raisonnement pour ces sections améliorerait l’accès sans réseau ni correction distante. Liste intégrale dans inventaire.json.
- 3/10 : le bouton audio « Jouer » serait plus clair intitulé « Écouter ». Conserver le bon comportement de défilement et les commandes visibles sur petit écran.
- 5/10 : distinguer « temps page visible » de « temps réellement travaillé ». Le minuteur ignore les onglets masqués, mais ne détecte pas une longue absence devant une page laissée au premier plan. Ce constat n’est pas une preuve de double comptage ou d’unités corrompues.

## Faux positifs écartés

- Les anciens cours langues présents dans les JSON ne sont pas nécessairement proposés aux élèves : le routage utilise les guides.
- Pas de retour à des questions d’un autre chapitre pour remplir les sections peu fournies : l’absence de jeu peut précisément préserver le rattachement strict.
- decimals || 2 pourrait ignorer zéro, mais aucune formule actuelle ne déclare decimals:0 : pas de défaut utilisateur établi.
- Le texte à trous réutilise un champ lorsqu’un mot revient ; aucun exercice manuel à plusieurs blancs de mots distincts identifié par la sonde de données. Pas de bug affirmé sur cette seule lecture.
- Le timeout initial d’un sélecteur Playwright exact « Programme affiché » était un problème de sonde ; l’atelier se charge et fonctionne. Sonde corrigée par sélection du contrôle.
- Premier essai PyMuPDF : objet widget détaché lors de la libération de sa page ; script corrigé en conservant les pages. Aucune défaillance PDF produit.

## Limites

Pas de compte réel, réseau social, appel IA, base de données ou e-mail. Pas de simulation d’examen distant ni correction Gemini. Aucun test vidéo externe. Aucun avis de professeur n’est simulé. Pas de relecture ligne par ligne des 4321 jeux ou certification de tous les programmes officiels. Les contrôles de variété sont ceux des 49 tests ciblés et de l’inventaire ; cette passe n’ajoute aucune accusation pédagogique non étayée. Les parcours missions, flashcards complets et révision par matière méritent une passe navigateur supplémentaire ; ne pas les annoncer comme intégralement validés sur la seule base du code et des tests ciblés.
