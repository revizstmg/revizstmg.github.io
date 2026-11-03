# Audit 08 — Productions

**20 parcours distincts contrôlés : 18 réussis, deux défauts photo reproduits une seconde fois isolément. Aucun fichier suivi modifié.**

Audit indépendant en lecture seule, le 3 novembre 2026. Version gelée `f0f70220fd34f6fbba1d6416f3c99e6a0cd3e1e7`, source `05bd1531da93f095780ec1492b756459153a722a`. SHA-256 local de `index.html` : `c0cb4337d48b30af6dd6e3fe3556fea854d8b8a7f5e2ae60e7f2089c4d8ea309`, conforme à VERSION.json. Référence fournie : CI 41503625386, 691 unitaires par fuseau et 359 parcours ; non rejouée intégralement.

## Méthode et couverture réelle

Worktree détachée `wt-08`, racine publiée servie par `python3 -m http.server 4218 --directory ..` depuis `app/`. Playwright Chromium, profil Pixel 7, **un seul worker**, aucune reconstruction. `preparer` de `tests/parcours/eleve.js` bloque les destinations externes ; les réponses de compte, abonnement et IA sont simulées avec données synthétiques. Aucun appel IA facturé, vraie copie, mutation Supabase, paiement ou publication. EPS absent de cette version et exclu. Aucun rapport contemporain d’un autre agent lu, aucun correctif ni commit.

Le premier lot a exécuté 14 parcours ciblés, tous réussis (3,7 min) :

- Notes : bornes de note, séparateur décimal, matière/chapitre, questions manquées, priorités et moyenne, rechargement et suppression ; bilan inédit, correction masquée/révélée et sauvegarde avec la note.
- Photo : refus intégral de cinq images, maintien des quatre images déjà choisies lors d’un ajout excédentaire, transmission exacte de quatre images.
- Contrôle rédigé : question et cinq critères, correction et note recalculée, modification de réponse, autre question, isolation du chapitre ; erreur 503 sans fausse note ; annulation, délai maximal et reprise ; repli construit depuis le cours annoncé.
- Tuteur : 12 reformulations, cours transmis limité au chapitre ouvert, historique borné à 19 messages, changement de chapitre ; indisponibilité conservant le texte sans faux échange.
- Grand Oral : règles, deux questions, durées du chrono, auto-évaluation, source, analyse, argument rattaché à la seconde question, rechargement et téléchargement texte.
- Étude de gestion Première : règles, problématique, dossier, source et fiabilité, caractérisation/SWOT/PESTEL, argument A-E-I lié à une source, auto-évaluation, rechargement et téléchargement ; absence du lien Première sur l’accueil Terminale.
- Micro synthétique : permission tardive après navigation (piste arrêtée sans enregistrement), double clic pendant la permission (une seule demande), arrêt du flux. Ce n’est pas un contrôle acoustique d’un vrai micro.

Commandes et configuration reproductibles : `preuves-08/config.js`, script neuf `preuves-08/sondes.spec.js`. Journal du premier lot : `preuves-08/parcours.log`, résultat structuré : `preuves-08/historiques.json`.

Le second lot ajoute six parcours : quatre nouvelles sondes et deux parcours existants sur le bilan. Résultat initial : **4 réussis, 2 échoués (1,8 min)**. Les réussites vérifient un lot comprenant une image corrompue refusé avant tout appel, l’OCR synthétique jusqu’à la fiche enregistrée/rechargée, l’annulation du bilan et son brouillon retrouvé sans double envoi, le dépôt de deux PDF synthétiques soumis au consentement, le refus HEIC et la conservation après erreur 503. Les fichiers ne sont pas retrouvés dans le stockage du brouillon après rechargement, conformément au message de l’écran. Journaux et résultats : `preuves-08/sondes.log`, `sondes.json`.

Cela représente **20 parcours distincts : 18 réussis et 2 anomalies photo**, complétés par le rejeu isolé des anomalies. Les captures PNG sont des viewports (dimensions physiques liées au facteur d’échelle du Pixel 7), sans capture pleine page. Le passage transversal a porté sur navigation menu → outil, passage cours → tuteur/contrôle, changement de chapitre, rechargement et téléchargements ; il ne constitue pas une certification globale du site.

## Défauts reproduits

### PROD08-01 — Une ancienne analyse réapparaît après « Tout recommencer » (priorité moyenne)

Prérequis : compte synthétique Ultimate, une image PNG valide, réponse IA synthétique suspendue.

1. Ouvrir `/#/fiches-photo`, choisir une image et cliquer « Analyser la photo ».
2. Une fois la demande démarrée, cliquer « ↺ Tout recommencer » : les images disparaissent, champs et fiche sont vidés.
3. Libérer ensuite la réponse de la demande précédente, avec un titre distinct « ANCIENNE PHOTO AUDIT08 ».

Attendu : une remise à zéro invalide les résultats de l’opération précédente ; la nouvelle fiche reste vide.

Observé : l’ancienne fiche et sa question réapparaissent sous les champs vides. Une demande a été émise et un résultat périmé est affiché (`staleResultCount: 1`, attendu 0). L’élève peut reprendre ce contenu pour la nouvelle préparation alors qu’il vient d’effacer la précédente.

Références : `app/src/pages/PhotoFiche.jsx:125` (`runVision`, affectations après `await analyzeWithVision`) et `:177` (`reset` sans invalidation ni annulation). Preuve : `preuves-08/photo-reset-tardif.png`, assertion et observation structurée dans `sondes.json`, trace dans `sondes-browser/audit08-sondes-sonde-photo-b8031--réponse-précédente-tardive/trace.zip`. Scénario neuf dans `sondes.spec.js` : « tout recommencer invalide la réponse précédente tardive ».

### PROD08-02 — Analyse photo sans délai maximal ni reprise de la demande suspendue (priorité moyenne)

Prérequis : même compte synthétique ; requête `fiche-vision` interceptée et laissée sans réponse. Le réseau réel n’est pas sollicité.

1. Ouvrir `/#/fiches-photo`, sélectionner une image valide, cliquer « Analyser la photo ».
2. Laisser la demande sans réponse et avancer l’horloge navigateur de 300001 ms.

Attendu : au terme d’un délai borné, libérer l’attente, expliquer l’échec et rendre possible une nouvelle tentative, ou fournir une annulation explicite.

Observé : le bouton reste désactivé « Analyse en cours… », sans erreur ou action d’annulation de la demande. L’observation structurée est `busyAfterMs: 300001, busy: 1, calls: 1`. La lecture locale et la remise à zéro demeurent disponibles : il s’agit du blocage de cette analyse, pas de toute la page. Quitter/recharger abandonne le formulaire photo ; les cinq minutes sont simulées, pas une mesure de latence réelle.

Références : `app/src/ficheVision.js:49` et `:56` (`fetch` et lecture JSON sans signal ni délai), `app/src/pages/PhotoFiche.jsx:125` et `:211` (état « running » jusqu’au retour). Preuve : `preuves-08/photo-delai.png`, observation dans `sondes.json`, trace dans `sondes-browser/audit08-sondes-sonde-photo-0a12c-e-bouton-après-cinq-minutes/trace.zip`. Scénario neuf dans `sondes.spec.js` : « demande suspendue doit libérer le bouton après cinq minutes ».

## Risques de lecture et limites

Aucun autre risque non reproduit n’est élevé au rang de défaut dans ce rapport. La lecture des gardes et clés de compte des panneaux de cours et du brouillon de notes complète les parcours ; elle ne couvre pas toutes les transitions d’identité. La conservation est testée pour les notes/bilans et les éléments enregistrés des dossiers, pas pour toutes les saisies intermédiaires possibles.

Les sources et documents du Grand Oral/étude de gestion ont été contrôlés comme métadonnées, liens entre sources et arguments et export texte. Aucun jugement sur la véracité des sources ni sur la qualité pédagogique d’un vrai modèle n’est rendu. Les PDF de dépôt sont des octets synthétiques pour vérifier le contrat de sélection/envoi ; leur lecture réelle côté fournisseur n’est pas certifiée. L’OCR est simulé via `window.Tesseract` ; téléchargement du moteur, reconnaissance sur photo réelle et gestion de toutes les langues ne sont pas certifiés. Le micro est simulé, sans vraie permission OS ni capture sonore. Les règles Supabase réellement déployées, abonnements/quotas réels et réponses des fournisseurs IA restent non certifiés. Aucune suite générale ni build relancé.

## Outillage

Première préparation avec préfixe `app/` depuis un répertoire déjà `app` : création du lien/configuration échouée, corrigée avant le démarrage du worker effectif ; aucun parcours produit conclu sur cet essai. Un `BrokenPipeError` du serveur HTTP apparaît lors d’une navigation ; le parcours concerné et les assertions suivantes sont verts, aucun défaut applicatif déduit de ce journal serveur. Les deux échecs de sondes ci-dessus sont des assertions métier attendues sur les anomalies, pas des erreurs de lancement.

## Rejeu et clôture

Les deux anomalies ont été rejouées seules, dans de nouveaux contextes navigateur et avec un seul worker : **deux échecs identiques confirmés**, sans erreur de lancement. `preuves-08/rejeu.log`, `rejeu.json` et les deux traces sous `rejeu-browser/` conservent ce second passage. Cela fait 22 exécutions pour 20 parcours distincts ; les deux rejouées ne sont pas des fonctions supplémentaires. Commandes exactes : `preuves-08/commandes.txt`. Fin du worker le 3 novembre 2026 vers 20:11 UTC. Contrôle final `git diff --exit-code` réussi : aucun fichier suivi ni compilation modifié. Les scripts/configurations temporaires sont copiés dans les preuves.
