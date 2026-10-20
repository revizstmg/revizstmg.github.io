# Audit pédagogique, révisions et accessibilité — 19 octobre 2026

## Méthode et périmètre

Lecture seule du code, des consignes AGENTS/CLAUDE/COORDINATION et de l’audit de cours du 19 octobre. Aucun cours modifié, aucune donnée réelle consultée, aucun compte créé, aucun backend appelé. Navigation publique avec état élève fictif injecté dans le stockage local ; seul le domaine revizstmg.github.io autorisé, service worker désactivé. Profils Première à 390 × 900 et Terminale GF à 1280 × 900. Ce protocole ne teste pas la synchronisation réelle ni les permissions côté serveur.

Routes visitées pour les deux profils : Programme, Bac blanc, Coach IA, Réviser, Atelier de formules, Méthodo, Guide, Grand Oral, Étude de gestion, Confidentialité, CGU et un lecteur de cours (Droit T8 / SDGN T1). Les premières captures des bacs blancs/lecteurs précédaient la fin du chargement : reprise dédiée des pages lourdes, résultats complémentaires conservés en `site-review-pedago/loaded-routes.json`. La reprise a confirmé les quatre écrans lourds (Bac blanc et lecteur, dans chaque profil), avec titre attendu et contenu chargé. Les 24 routes/profils ont ainsi été affichés jusqu’au contenu. Aucun débordement horizontal ni exception JavaScript dans ces visites ; ce constat n’est pas une certification d’accessibilité.

Sources : `app/src/pages/`, `components/Accessibility.jsx`, `components/Layout.jsx`, `components/DossierProjet.jsx`, `games/Exam.jsx`, `data/study.js`, `data/formulaPractice.js`, `localisation/PublicText.jsx`, `content/commun/atelier-formules.json`. Le rapport de cours précédent est réutilisé explicitement : pas de nouvelle relecture exhaustive des 806 sections.

## Ce qui fonctionne et doit être conservé

- Programme Première filtré français/mathématiques ; calendrier avec source et rappel de vérifier sa convocation.
- Atelier : sélection multiple, recherche, matière, génération locale, correction chiffrée et substitution des valeurs, saisies à virgule, absence d’effet sur la maîtrise des chapitres clairement annoncée.
- Dossiers de projet : sources, analyse, arguments A-E-I, auto-évaluation explicitement désignée ; enregistreur oral local et éphémère.
- Options dyslexie, contraste et grand texte gratuites ; boutons nommés dans le lecteur et pagination au clavier ; états de chargement en `role=status` ; alerte de traduction partielle prévue avec relance.
- Politique de confidentialité détaillant les sous-traitants, données locales, traduction externe et limites des espaces partagés.

## Recommandations et anomalies

### PED-01 — P1 — Corriger les trois anomalies pédagogiques déjà confirmées

Type : anomalies de contenu confirmées dans l’audit antérieur, non corrections nouvelles. Effort : S pour l’écriture et la formulation juridique, M/L pour les 17 dossiers.

1. GF T1, chapitre 20, cycle d’achat : écriture déséquilibrée de 19 € ; le débit 607 doit être 1 900 € lorsque l’escompte de 19 € est comptabilisé au crédit 765.
2. Études de documents manuelles : au moins quatre dossiers interrogent d’autres chapitres que leur rattachement. Fractionner les 17 dossiers à examiner en exercices centrés sur leur section ; réserver le transversal à une zone de thème explicitement identifiée. Ne pas simplement changer l’index d’un dossier mixte.
3. Responsabilité des associés : ne pas la déduire de la seule personnalité morale ; préciser SARL/SAS ou autre forme sociale et ses règles.

Preuve : audit cours précédent `docs/AUDIT-COURS-2026-10-19.md` (PR #24). L’ancien contrôle technique portait sur 19 matières/806 sections, mais ne valide pas l’exactitude factuelle de chacune. Critère de livraison : contre-exemples corrigés et tests de contenu ciblés ; relecture humaine matière par matière ensuite.

### PED-02 — P1 — Rendre la modale Accessibilité utilisable au clavier

Type : anomalie d’accessibilité, code confirmé et reproduction navigateur. Effort : M (composant de modale partagé).

`components/Accessibility.jsx:26` affiche une surcouche fixe sans rôle dialog, sans aria-modal, sans focus initial, sans confinement ni restauration du focus ; absence de gestion Échap. Le bouton du footer l’ouvre. Reproduire : ouvrir Accessibilité, presser Échap, puis Tab depuis le dernier commutateur. Le panneau reste ouvert et le focus sort du panneau vers BODY ; elle peut même rester présente après changement de route. Le script initial de vérification a été bloqué par cette surcouche après navigation, ce qui matérialise le problème.

Amélioration : modale native `<dialog>` ou composant accessible commun, nom via aria-labelledby, focus initial et retour au déclencheur, tabulation confinée, fermeture Échap. Passer aussi en revue Recherche, Dictionnaire, Personnalisation et partage de cartes : plusieurs surcouches n’ont pas la sémantique complète, même quand Échap fonctionne déjà.

Critère : tout utilisable sans souris ; focus jamais perdu derrière un panneau ouvert ; contrôle NVDA/VoiceOver et zoom 200 % avant de déclarer conforme.

### PED-03 — P1 — Distinguer entraînement QCM et véritable sujet de bac

Type : amélioration de promesse pédagogique, pas un bug de calcul. Effort : S pour les libellés, M/L pour élargir les sujets.

`i18n/fr.js` décrit le Bac blanc « comme le jour J » ; `games/Exam.jsx` transforme un score de QCM en /20 et en appréciation « niveau mention Bien/Très bien ». Ce format sélectionne QCM et vrai/faux (`data/study.js`) sur toute la filière. De vrais sujets structurés existent séparément en Terminale.

Amélioration : deux entrées explicites « Entraînement chronométré (QCM) » et « Sujet au format de l’épreuve » ; afficher durée officielle/barème/compétences dans la seconde, et « score d’entraînement, non prédiction de note au bac » dans la première. Conserver les félicitations sans attribuer une mention officielle à partir d’un quiz. Donner priorité aux maths/français pour le mode épreuves anticipées en Première, tout en conservant les autres matières dans un entraînement général clairement nommé.

### PED-04 — P1 — Gérer une date de bac dépassée

Type : anomalie d’état temporel, source confirmée ; reproduction navigateur publique avec profil fictif dans `interactions.json`. Effort : S, à coordonner avec la PR #14 dates/progression.

`pages/Programme.jsx:51` utilise `dLeft > 0 ? J-n : itsToday` : toute date passée devient « C’est aujourd’hui ». La saisie n’interdit pas une date passée. Différencier futur / aujourd’hui / épreuve passée, proposer mise à jour de session ; garder la date personnalisable. Ne pas fermer les deux jours différents sous une seule condition `<= 0`.

### PED-05 — P2 — Atelier : sélectionner sans parcourir puis remonter toute la page

Type : amélioration d’usage mobile. Effort : M.

Capture Première : 18 formules, page de 3 201 px à 390 px de largeur ; compteur et bouton « Générer mes exercices » placés avant la liste. L’élève qui coche en bas doit remonter. Barre discrète fixe/sticky avec nombre sélectionné, total d’exercices et bouton lancer ; catégories repliables ; choix « séance de 5 minutes / 5 exercices » ; conserver la possibilité de composer librement. Éviter de précocher de nombreuses formules.

Critère : sélectionner une formule en bas de catalogue et démarrer sans remonter ; barre ne masque aucun contrôle et respecte les zones sûres mobile.

### PED-06 — P2 — Atelier : transformer une correction numérique en progression pédagogique

Type : évolution de produit. Effort : M.

La séance est en état React : rechargement/quitter perd le travail ; pas de lien d’une formule vers le cours associé ; bilan global uniquement, pas de distinction par formule ; correction immédiate sans choix d’indice/réessai. Les catégories ne sont pas des rattachements chapitre/niveau détaillés.

Proposition : afficher notion/prérequis, exemple travaillé, indice facultatif, nouvelle tentative comptée séparément ; bilan par formule avec « revoir le cours » et « refaire mes erreurs ». Sauver une séance locale par compte, proposer reprendre/abandonner avec avertissement de sortie. Maintenir l’indépendance avec la maîtrise des chapitres tant qu’aucune politique de score n’a été définie. Ajouter des problèmes contextualisés et unités, plutôt que seulement des substitutions numériques.

### PED-07 — P2 — Nommer clairement le Coach et rendre son conseil explicable

Type : amélioration de compréhension/confiance. Effort : S/M.

Le libellé « Coach IA » et « Une IA qui analyse… » contraste avec un moteur déterministe local (`data/coachAI.js`, règles/seuils/banque). Cela n’est pas un chatbot ni une correction libre par modèle. Préférer « Entraînement personnalisé », expliquer pourquoi tel thème est proposé, ce qui est connu et ce qui manque encore. L’état sans données est utile ; ajouter un petit diagnostic facultatif de 5 questions et laisser choisir une matière au lieu d’imposer la première de la filière.

### PED-08 — P2 — Programme : varier les objectifs et expliquer la maîtrise

Type : recommandation de pédagogie. Effort : M, coordonner avec PR #14.

Capture nouveau profil Première : quatre objectifs de maths successifs, aucun français, bien que le filtrage français/maths fonctionne. `reviewQueue` conserve l’ordre source en cas d’égalité et `dailyPlan` prend les quatre premiers. Introduire un équilibrage doux entre matières à priorité égale, sans écarter les lacunes urgentes ; afficher l’estimation de durée et ce qui termine un objectif. Préciser score de quiz/exercices, seuil de maîtrise et thème versus chapitre. Les pourcentages ne constituent pas une preuve d’acquisition durable : prévoir rappel espacé et contrôle différé.

### PED-09 — P2 — Uniformiser accordéons, sélections et annonce des changements

Type : anomalies sémantiques repérées dans le code. Effort : M.

`pages/Methodo.jsx:22` ouvre/ferme un bloc sans aria-expanded/aria-controls ; les boutons matière/durée de Bac blanc n’exposent pas leur sélection avec aria-pressed/radiogroup ; `Customizer.jsx:385-387` nomme des boutons uniquement « ↑ », « ↓ », « ✕ ». Réutiliser les accordéons correctement annotés de DossierProjet. Nommer « Monter [onglet] », « Retirer [onglet] », etc. Ajouter un lien d’évitement vers main et une politique de focus après navigation ; aucun lien d’évitement trouvé dans Layout. Vérifier le focus après la correction et au nouvel exercice, pas seulement l’affichage `aria-live`.

### PED-10 — P2 — Traductions pédagogiques hors ligne et validation humaine

Type : recommandation de qualité ; le fonctionnement en panne n’a pas été recertifié ici. Effort : L par matière, M pour la mécanique.

Le moteur prévoit traduction des textes publics hors catalogue via MyMemory, cache et message de traduction partielle. La politique l’explique. Pour formules, définitions juridiques, énoncés et corrigés essentiels, livrer un catalogue relu plutôt que dépendre exclusivement de traduction automatique. Garder les symboles/unités et une option voir original français ; relire arabe/RTL et langues en contexte. Ne pas traduire les brouillons privés. Critère : une séance essentielle dans chaque langue fonctionne hors ligne après téléchargement ; aucun mélange silencieux de langues, termes disciplinaires vérifiés.

### PED-11 — P1 — Aligner la confiance affichée avec la protection réelle annoncée

Type : risque explicitement documenté côté utilisateur ; aucune vérification Supabase indépendante dans cet audit. Effort : M/L dépendant des migrations et de l’accord propriétaire.

Privacy affiche « Conforme au RGPD » tout en expliquant, section 6, que les données partagées peuvent être lues au-delà de la classe. Ne pas considérer la simple information comme correction de cette limite. Priorité à l’isolation/visibilité effective avant de promouvoir des échanges d’élèves. Afficher les audiences près des actions publier/rejoindre, pseudonyme par défaut, photo facultative, contrôles de suppression compréhensibles. Le bouton suppression et la suppression de l’identité de connexion doivent avoir une promesse claire et un état vérifiable (PR #18 déjà en cours, ne pas dupliquer). Faire valider juridiquement les textes avant une activité payante ou lancement des offres ; cet audit n’émet pas une certification RGPD.

## Ordre proposé

1. Erreurs pédagogiques, modales clavier, promesses bac/coach et dates (PED-01 à 04 + 11).
2. Atelier pratique mobile, liens cours/erreurs, sémantique accordéons et navigation (05, 06, 09).
3. Diagnostic/équilibrage/révisions différées et traduction relue par matière (07, 08, 10).

Efforts indicatifs : S = quelques heures ; M = 1 à 3 jours ; L = plusieurs jours avec relecture métier. À confirmer selon critères et dépendances. Aucun P0 nouveau confirmé dans ce périmètre ; la limite d’accès aux données partagées doit être qualifiée par l’agent chargé de la sécurité, sans minimiser son urgence.

## Limites

Pas de relecture exhaustive du contenu ni comparaison complète au Bulletin officiel ; pas de vrais comptes élève/professeur/parent ; pas de soumission réelle, envoi mail, microphone réel, paiement, synchronisation multi-appareil ou test backend ; pas de test manuel au lecteur d’écran ni mesure exhaustive des contrastes AA. FR évalué visuellement ; mécanisme de traduction relu dans le code. Les PR #14 (progression/dates), #18 (suppression) et #20 (notes) sont ouvertes : constats sur état publié/main, à confronter à ces corrections avant créer des tickets concurrents. Aucune correction de production appliquée.

## Preuves navigateur complémentaires

- `interactions.json` : date fictive 18 octobre 2026 affichée « C’est aujourd’hui ! » pendant l’audit du 19 octobre ; panneau Accessibilité `dialogCount: 0`, trois commutateurs encore présents après Échap, focus BODY après Tab depuis le dernier.
- Même fichier : Proportion, 10 / 78 × 100 = 12,82 %, saisie 0, correction puis bilan 0/1 : la séance de calcul observée fonctionne ; elle ne prouve pas toutes les formules.
- `loaded-routes.json` : Bac blanc et lecteurs Droit/SDGN chargés dans les deux profils, aucun débordement ou erreur JS. Captures `premiere-stmg-programme.png`, `premiere-stmg-atelier-formules.png`, `accessibility.png` et leurs équivalents bureau disponibles dans le dossier de travail.
