# Comprendre et appliquer

Demande du 25 octobre 2026 : sortir de la répétition des définitions, couvrir le contenu complet des chapitres, restaurer les animations et refaire les flashcards. Périmètre de la PR #118, sans modification des textes de cours ni suppression de résultats.

## Parcours de chapitre

« Comprendre et appliquer » passe avant les jeux de mémorisation. Une seule série à lancer, sans sélection de dizaines de boutons. Les anciens formats restent accessibles dans « Mémoriser les repères », fermé au départ ; son ouverture et le retour du focus sont conservés lorsqu’on quitte un jeu. Aucun identifiant de jeu ou résultat existant n’est supprimé.

La création est volontaire et demande un compte, comme les autres outils Gemini. Aucun appel de génération à l’ouverture du cours, à un rendu React ou au retour sur une série enregistrée. L’élève est prévenu que le cours et les précédentes questions sont envoyés au fournisseur, pas son identité ni ses réponses.

## Variété et couverture

Le moteur considère les passages de tout le texte du chapitre, y compris listes, mécanismes, exemples, étapes, tableaux et formules courtes, pas seulement les définitions. Jusqu’à six passages cibles par série, parmi les moins déjà proposés, pour parcourir le chapitre progressivement. Un passage proposé n’est pas une notion déclarée maîtrisée ; la progression continue de dépendre des résultats réels.

Gemini prépare des situations fictives autonomes, décisions argumentées, diagnostics d’erreur, analyses et calculs lorsque le cours enseigne la méthode. Les matières littéraires gardent leurs formes de raisonnement. De une à huit questions selon le contenu (au moins quatre lorsque quatre cibles sont disponibles), au moins deux types de raisonnement et une situation dès trois questions. Une seule réponse correcte par question ; justification et citation du cours après le choix.

Le serveur valide les cibles du chapitre, la couverture de toutes les cibles, les identifiants, les choix distincts, le barème QCM et les citations réellement présentes dans les passages. Il rejette les formulations de simple définition et les questions identiques ou trop proches des précédentes (comparaison de groupes de trois mots, chiffres neutralisés). Changer seulement les nombres ne crée pas une nouvelle question. Jusqu’à 60 questions précédentes accompagnent la demande. Ces contrôles ne remplacent pas une relecture pédagogique humaine ; une erreur du modèle reste possible et signalée.

Le cache local est séparé par compte, chapitre et empreinte de son texte. Révision d’un cours : nouveau cache. Le cours complet est limité à 60 000 caractères ; le contrôle de couverture vérifie tous les chapitres scolaires actuels. Aucune question d’un autre chapitre n’est ajoutée pour remplir un quota.

La série affichée est stable pendant le jeu et les mises à jour de progression. Une nouvelle série nécessite un nouveau clic. « Revoir cette série » rejoue explicitement le même contenu. Résultat QCM et erreurs/réussites passent par les mécanismes existants ; aucune maîtrise ou note d’IA n’est attribuée à la simple génération.

## Serveur et erreurs

Action practice de la fonction examen-blanc existante, JWT et vérification Auth /user conservés. Schéma de réponse Gemini, raisonnement limité, plafond mémoire existant de 12 demandes par heure et par utilisateur/instance chaude ; ce compteur n’est pas un plafond global de facturation. Aucun schéma, table, Storage, secret, abonnement ou donnée NAH modifié.

Délai fournisseur 120 s, attente client totale 150 s (y compris Auth et lecture), annulation possible. Une série invalide ou une erreur n’écrase pas la série précédente. Les jeux locaux restent disponibles sans compte et sans IA. Le cache ne contient aucune réponse d’élève. Échec de stockage affiché.

## Flashcards et animations

Cause de superposition : verso translucide et texte de la carte suivante derrière. Désormais, recto et verso sont opaques, avec perspective et faces cachées explicites, y compris WebKit. La pile derrière ne contient aucun texte. Bouton de retournement séparé, carte tactile, gestes gauche/droite et flèches conservés. Faces inactives aria-hidden/inert, réponse longue défilante et focalisable, entrée/sortie de la fenêtre au clavier. Une même interface vert/crème pour paquets enregistrés et jeux de chapitre.

La demande actuelle remplace la restriction précédente à une seule animation décorative par session. Entrées, retours de réponse et confettis sont rétablis. Bienvenue réapparaît une fois par compte et par ouverture d’onglet, avec entrée au clic/au clavier et sortie automatique ; rechargement dans le même onglet sans réaffichage. Le mouvement réduit désactive les animations et transitions, garde les textes visibles et le retournement immédiat. Les minuteries restent inchangées. Aplats, boutons sans pilules et absence de badges promotionnels IA restent conservés.

## Validation

Tests de contrat, couverture de tous les chapitres, rotation, isolation du cache, anti-répétition, Auth et absence d’écritures ; parcours de génération/correction/reprise/erreur/annulation, flashcards, gestes, clavier et accessibilité clair/sombre/petit écran/mouvement réduit. Les fournisseurs sont simulés dans les tests, aucune copie réelle envoyée. Compilation et publication suivies dans la PR #118.
