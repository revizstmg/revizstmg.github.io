# Contre-audit indépendant : Première et mobile

Date : 30 octobre 2026. Agent 1. Aucun rapport des autres relecteurs consulté, aucun constat échangé.

## Base et méthode

- Worktree détachée `/workspace/work/contre-audit-premiere`, créée depuis `origin/main` après fetch. Compilation `a0ba33ca5473842649bbf5aa3da5fd56cdf2dac9`, parent source `cbfda015a6e814e872972d81ae0ee83a4d41a608` (#153).
- Compilation servie telle quelle sur http://localhost:4185 ; aucune reconstruction ni modification fonctionnelle. `AGENTS.md`, `CLAUDE.md` et journal de coordination lus. Rapport hors dépôt : aucun commit/PR.
- Référence communiquée par le coordinateur : CI41021772448 (688 tests UTC/Paris et349 parcours) et Pages41023616609 réussies ; suite intégrale non relancée.
- Chromium/Playwright, un worker pour cet audit, profil Première synthétique et helper `app/tests/parcours/eleve.js`. Services extérieurs bloqués ; abonnement Premium simulé, puis compte gratuit simulé. Aucun compte réel, paiement, mail, microphone ou génération facturée.

## Résultat

Aucun défaut produit actuellement reproduit dans le périmètre contrôlé. Cela ne constitue pas une validation exhaustive du site ou de ses fournisseurs.

## Couverture contrôlée

- Passage des31 routes : accueil, cours, révision, séance, atelier, programme, Bac blanc, Grand Oral, étude de gestion, langues Première, notes, profil, paramètres, classe, amis, classement, favoris, badges, minuteur, coach IA, photo, défi, méthodo, boutique, vacances, parcours, offres, guide, FAQ, CGU et confidentialité. À320 ×780, aucune exception/erreur console applicative ni débordement horizontal détecté. Certaines pages chargent après la première observation ; l'absence de h1 durant cette observation n'est pas interprétée comme une panne.
- Cours SDGN Première « La personnalité de l’individu » : ouverture directe, exercices, QCM d'entraînement, sortie, rechargement ; contenu chargé et titre retrouvés. Jeu strictement centré sur le chapitre (tempérament, personnalité, besoins), sans notions étrangères du test de régression.
- Test historique SDGN Première réussi ; test programme réussi : objectifs français/maths seulement malgré une progression SDGN préexistante, liens des objectifs fonctionnels.
- Test historique Bac blanc Première390px réussi : quatre rubriques, deux liens PDF, maths accessibles, pas de sujet Excellence de Terminale, redirection de la route Excellence vers Bac blanc, pas de débordement.
- Test historique formules Première réussi : filtre de classe, probabilité conditionnelle disponible, formules Terminale exclues, anciens liens `/express` et `/formules` redirigés.
- Gratuit320px : liste de cours et français accessibles ; Bac blanc affiche l'accès Premium avec lien Offres. Pas d'ouverture de paiement.
- Langues : test historique a passé sélection des cinq langues, réponses HTTP valides et signature `%PDF-` des cinq guides, attributs de téléchargement, ressources, premier contrôle sans débordement et AXE du contenu ; son exécution s'est arrêtée ensuite durant une capture pleine page (limite de test ci-dessous).
- Relecture source : routes et enveloppes de chargement (`app/src/App.jsx:99`), onglets cours/définitions/exercices (`app/src/pages/Chapter.jsx:149`), pagination et repère de lecture (`app/src/components/Course.jsx:166`), filtre de filière en séance (`app/src/data/seance.js:15`), programme Première (`app/src/pages/Programme.jsx:48`), catalogue/langues/PDF (`app/src/pages/Languages.jsx:16`), garde et liste des accès payants (`app/src/data/acces.js:20`).

## Limites et incidents de vérification

- Le scénario historique `cours-langues.spec.js` dépasse90 secondes sur `page.screenshot({fullPage:true})` à la ligne27, après ses assertions PDF/AXE. Trace synthétique initiale : `/workspace/work/premiere-test-results/cours-langues-p1-langues-g-91e11-outes-et-mobile-accessibles/trace.zip` (répertoire de résultats ensuite réutilisé). Ce dépassement de capture n'établit aucun défaut fonctionnel ; ni le reste de ce scénario ni son second passage sombre ne sont déclarés validés par cette exécution.
- Un scénario exploratoire local cherchait « Quitter » après le bilan du QCM. L'interface propose normalement « Terminé » : erreur du scénario, pas un défaut produit. Contrôle adapté et rejoué ci-dessous.
- Intégrations réelles Supabase/Auth/RLS, synchronisation sur serveur et entre appareils, inscriptions par mail/OAuth, classe réellement rejointe, interactions sociales réelles, paiements Stripe et résiliation non vérifiés. Les états réseau affichés avec services bloqués sont attendus.
- Microphone réel, qualité de synthèse vocale, retours des fournisseurs IA, correction facturée, liens/vidéos des sites tiers et exactitude pédagogique exhaustive des759 chapitres non vérifiés. Aucun droit serveur n'est certifié à partir d'une simulation client.

## Compléments rejoués et réussis

Deux scénarios locaux supplémentaires réussis sur compilation,48,2s, un worker :

1. À320px, ouverture des définitions SDGN, QCM entier jusqu'au bilan « Terminé », comparaison exacte de la progression locale avant/après rechargement ; ajout d'une note synthétique8,5/20 en SDGN et présence de la moyenne8,50/20 après nouveau rechargement. Zéro exception applicative.
2. Atelier Première : sélection Proportion, une question, saisie999, rechargement, « Reprendre ma séance », valeur999 conservée ; correction puis bilan accessibles. Langues Première : sélection des cinq langues, cinq PDF HTTP200 avec signature `%PDF-`, ouverture de la bibliothèque et filtre de niveau donnant des liens. Zéro exception applicative.

Scripts de preuve synthétiques : `audit-premiere.mjs`, `audit-detail.mjs`, `app/tests/parcours/contre-premiere-local.spec.js` et configuration locale `app/audit-premiere.config.js`, tous non suivis dans la worktree isolée. Bilan : quatre scénarios historiques réussis, un historique interrompu pendant capture ; trois scénarios locaux distincts réussis (gratuit, définitions/progrès/notes, atelier/langues). L'échec initial de sélecteur après bilan a été corrigé uniquement dans le scénario local.
