# Audit apprentissage et examens

Audit en lecture seule du 8 novembre 2026, référence origin/main `6ae93a19268a9c2349166078e24a8992adefe43e`. Aucun changement produit, compte réel, appel IA payant ou mutation de base. Rapport sauvegardé progressivement.

## Défauts reproduits

### APP-01 · PDF : notations statistiques et probabilistes corrompues · priorité 8/10

- Source : `app/src/data/examPdf.js`, normalisation `clean` et police Times standard dans `text`.
- Reproduction locale sans IA : construire un sujet synthétique contenant « La moyenne est x̄ = ∑ xᵢ / n. On étudie P(A ∩ B) et P(A ∪ B). », puis télécharger sujet et corrigé.
- Attendu : notations lisibles, texte restant dans les marges.
- Réel : les deux documents contiennent 56 caractères NUL à l’extraction et des lignes déformées. Il s’agit de caractères courants en statistiques/probabilités, pas d’un ancien défaut √ déjà corrigé.
- Preuves : `/workspace/output/audit-site-apprentissage/repro.mjs`, `notions-sujet.pdf`, `notions-corrige.pdf`, images et textes homonymes ; `notions.json`.
- Alternative : police couvrant les notations acceptées et composition correcte, ou formatage mathématique contrôlé. Valider sur un ensemble représentatif plutôt que réparer uniquement le prochain symbole observé. Ne pas changer les valeurs ni supprimer une notation silencieusement.

### APP-02 · Atelier : formule de Terminale annoncée dans le programme de Première · priorité 5/10

- Sources : `app/content/commun/atelier-formules.json:1193` (f33), drapeau `terminale:false`, `coursePremiere:"eco-t7"` ; `app/src/data/formulaPractice.js:8` et `app/src/data/workshopSession.js:30`.
- Étapes : profil Première STMG, Atelier de formules, conserver « Mon programme », choisir « Taux de chômage », générer une question puis regarder « Revoir le cours ».
- Réel : la formule est présentée « Première et Terminale » ; le lien cible `#/subject/economie/theme/eco-t7`, un thème de Terminale. La formule numérique elle-même est correcte.
- Attendu : programme/étiquette cohérents avec l’année et le cours associé ; si cette notion est proposée comme ouverture, la signaler comme telle plutôt que l’inclure au programme Première.
- Preuves navigateur : `formule-niveau.mjs`, `formule-niveau.json` et `formule-niveau.png`, aucun message d’erreur JavaScript.
- Alternative : marquer cette entrée Terminale, ou distinguer explicitement les formules hors programme. Ajouter un contrôle de cohérence du niveau, pas seulement de l’existence de la destination.

### APP-03 · Accueil 320×568 : action principale masquée par les barres fixes · priorité 5/10

- Conditions : profil Terminale, petit écran 320×568, bannière « Non sauvegardé » visible et information cookies non fermée.
- Étapes : ouvrir l’accueil dans cet état ; rester au premier écran sans défiler.
- Attendu : l’action « Commencer un cours » reste visible et utilisable, ou une action équivalente est clairement accessible dans le premier écran.
- Réel : bouton à y 484,66, hauteur 46 ; barre cookies y 426–504, puis navigation fixe à partir de 504. Le bouton est donc entièrement couvert. Le parcours existant `tests/parcours/accueil.spec.js:28` échoue aussi : 530,66 au lieu de moins de 504.
- Preuves : `accueil-320.mjs`, `accueil-320.json`, `accueil-320.png`. Aucun message JavaScript. L’incident est conditionnel : les autres tailles testées passent et fermer les cookies/défiler permet de continuer.
- Sources : `app/src/pages/Home.css:4-16` (hauteur du héros), bandeau de sauvegarde et barres fixes.
- Alternative : réduire le héros sur les écrans bas, limiter la hauteur du bandeau de sauvegarde et réserver l’espace cumulé des barres fixes. Vérifier l’état normal **et** l’état hors ligne, pas seulement une page sans bandeau.

### APP-04 · Révision audio : voix choisie selon l’interface plutôt que la langue du contenu · priorité 5/10

- Sources : `app/src/components/AudioReview.jsx:11-12,30-35`, `app/src/pages/Revise.jsx:143,168`. Les paquets enregistrés depuis les cours conservent leurs textes français ; changer l’interface ne traduit pas ces contenus.
- Étapes : interface allemande, paquet de droit français, bouton « Mit Audio lernen », puis « Spielen ».
- Attendu : les textes français sont lus avec une voix française, ou la langue de lecture est explicitement sélectionnable par paquet.
- Réel : l’objet envoyé au moteur vocal contient `{text:"Un contrat",lang:"de-DE"}`. Le choix allemand est imposé à un texte français ; il peut donc être mal prononcé selon les voix installées. Le même couplage existe pour espagnol/anglais/italien/arabe.
- Preuves : `audio-langue.mjs`, `audio-langue.json`, `audio-langue.png`. Moteur vocal simulé localement pour inspecter le paramètre, sans synthèse externe ni donnée réelle.
- Alternative : stocker/déduire la langue du paquet ou proposer un choix de voix indépendant de la langue d’interface. Un paquet manuel multilingue nécessite une option explicite plutôt qu’un forçage systématique au français.

## Couverture et contrôles

- **54 parcours navigateur distincts : 53 réussis, un défaut confirmé** (APP-03). Comptes synthétiques, requêtes externes bloquées, assertions conservées. Les interactions IA utilisent les réponses simulées des tests, sans génération payante.
- Premier lot de 50 : 34 réussites, un échec réel, deux captures longues et treize refus de connexion après arrêt du serveur partagé. Les quinze parcours concernés ont été rejoués seuls sur un serveur indépendant : **15/15 réussis**. Ces incidents d’infrastructure ne constituent pas des défauts produit.
- Complément pagination/impression : **4/4 réussis**, dont retour de dernière fiche vers fiche 1 (lecture, plein écran/clavier, dernier chapitre) et cours TVA sur au plus deux feuilles A4.
- Parcours couverts : accueil téléphone/ordinateur et sombre/arabe ; rattachement des exercices au chapitre et reprise des acquis/erreurs ; flashcards recto-verso et petits écrans ; atelier de formules ; cinq langues et anciennes routes ; EPS, objectifs et impression ; sujets prêts Première/Terminale, PDF et petits écrans ; mathématiques anticipées de Première ; Prix, Grand Oral, étude de gestion et notes de classe. Les scénarios vérifient aussi plusieurs états d’erreur/annulation et des contrôles d’accessibilité.
- Journaux : `/workspace/output/audit-site-apprentissage/parcours.log`, `parcours-reprise.log`, `impression.log`. Les sondes dédiées aux quatre constats et leurs preuves sont dans le même dossier.

## Risques, améliorations et limites

- APP-01 expose un risque sur les futurs sujets générés contenant des notations non couvertes. La reproduction démontre le défaut du générateur dynamique ; elle ne prouve pas que tous les sujets prêts existants sont touchés. Les réparations récentes de √ et ≈ sont conservées et ne sont pas reclassées comme erreurs.
- La validation pédagogique demeure un échantillonnage ciblé : les tests établissent les rattachements et certains comportements, sans certifier chaque phrase de chaque cours, traduction, annale ou barème. Une relecture disciplinaire exhaustive reste distincte de cet audit fonctionnel.
- Aucun appel réel Gemini/Groq, aucune connexion réelle ni mutation Supabase : disponibilité des services, quotas, facturation et qualité effective d’une correction longue non certifiés ici. Les échecs sont testés avec simulation.
- Les langues passent dans les deux niveaux après reprise isolée ; les captures complètes sont lentes sous charge concurrente. Cela seul ne suffit pas à conclure à une lenteur vécue par l’élève.
- Pour les PDF, ajouter un contrôle de rendu des notations statistiques et probabilistes et une inspection visuelle des fichiers générés. Pour les niveaux, tester aussi l’appartenance du cours de destination au programme choisi. Pour le mobile, inclure l’empilement des bandeaux fixes dans les scénarios de première visite.
- Les ambiguïtés d’accès Premium/Ultimate et les parcours Boutique sont transmis à l’autre auditeur pour éviter les doublons. Aucun changement produit ni déploiement effectué.
