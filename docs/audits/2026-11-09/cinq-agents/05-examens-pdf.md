# Audit examens, PDF et productions

Audit en lecture seule de `origin/main` `c702938bb55b3456733cd7726951b67940fcd2f4`, repris le 9 novembre 2026 après l’interruption de la première passe. Aucun fichier produit, test suivi, schéma ou donnée élève modifié. Tous les parcours emploient des comptes fictifs et bloquent les services externes.

## Défaut confirmé E5-01 : la recherche des chapitres peut dépasser son délai et rester bloquée

**Importance : 7/10.** Le délai de trois minutes protège la requête réseau d’examen, mais pas la préparation du catalogue qui la précède. Un module de cours sans rapport avec la demande peut bloquer l’analyse.

### Reproduction

1. Ouvrir une session de test Terminale, avec l’abonnement et l’état du service d’examen simulés.
2. Bloquer les service workers pour exercer le chargement réseau non mis en cache.
3. Dans le navigateur, laisser en attente uniquement la requête du module `assets/contenu-p1-langues-*.js` ; les autres ressources restent accessibles.
4. Ouvrir Bac blanc et saisir « Tester mes connaissances de management en terminale STMG ».
5. Appuyer sur « Analyser ma demande », puis avancer l’horloge du navigateur de 181 secondes.

**Attendu :** à l’expiration du délai prévu de 180 secondes, arrêter l’attente, afficher une erreur compréhensible et réactiver le formulaire, en conservant la demande.

**Observé :** le module est toujours en attente ; le bouton et le champ restent désactivés ; « Recherche des chapitres dans les cours… » reste affiché ; aucune alerte n’apparaît. **Zéro POST d’examen a été envoyé** : ce défaut survient avant Gemini et ne démontre aucun dysfonctionnement fournisseur. La demande reste présente, mais l’élève doit quitter/recharger la page pour reprendre ce scénario.

**Cause dans le code :**

- `app/src/components/CreateExam.jsx:68` crée un timer qui annule seulement un `AbortController`.
- `app/src/components/CreateExam.jsx:71` attend `examCatalog()` sans délai indépendant ; le contrôle du signal n’arrive qu’à la ligne 75.
- `app/src/data/examenPersonnalise.js:10` attend `chargerTout()`.
- `app/src/data/index.js:284` utilise `Promise.all` sur toutes les matières, et `:287` inclut le catalogue complet. Le module de langues de Première suffit donc à bloquer une demande de management de Terminale.

**Correction proposée :** borner aussi l’ensemble de la phase de préparation par une promesse d’échéance et libérer l’état occupé à l’expiration ; afficher le motif « contenus indisponibles » avec reprise. À plus long terme, charger uniquement les matières pertinentes au lieu de rendre l’analyse dépendante de tous les cours.

**Preuves :** `/workspace/output/audit-cinq-20261109/examens/module-bloque.json`, `module-bloque-apres-181s.png` et `sonde-module-bloque.mjs`. La première sonde, qui laissait les service workers actifs, n’interceptait pas le module et n’établissait aucun défaut ; seule la seconde, avec `serviceWorkers: 'block'` et `moduleBlocked: true`, fonde ce constat.

## Contrôles exécutés

### Première passe récupérée : 20 parcours réussis

Journal complet : `/workspace/output/audit-cinq-20261108/examens/parcours.log`, terminé par `20 passed (4.2m)`.

Couverture : Bac blanc Première et Terminale (téléphone et ordinateur), choix EPS/performances/AFL/export et séparation des comptes, étude de gestion et catégories/argumentation, création d’examen avec PDF distincts et reprise, service désactivé, quota, choix manuel des chapitres, dépôt de copie avec consentement, fichiers/photos et ordre, réponse illisible et refus des formats invalides, Grand Oral, notes de classe et entraînements issus du bilan. Les réponses des fonctions de génération/correction sont simulées.

### PDF : 61 fichiers, 503 pages

Extraction PyMuPDF des PDF de `app/dist`, sans modification : 48 sujets/corrigés préconçus, cinq guides de langues (anglais, allemand, espagnol, italien, arabe), cinq dossiers officiels du Prix et trois références EPS.

- Aucun caractère NUL extrait.
- Aucune page dépourvue simultanément de texte et d’image.
- Aucun texte détecté hors des limites horizontales de page.
- Empreintes et détail par fichier : `/workspace/output/audit-cinq-20261109/examens/pdf-controles.json`.

Ces contrôles techniques ne constituent ni une certification linguistique ni une vérification mathématique et pédagogique de chaque réponse. Le contrôle public octet par octet est effectué séparément par l’agent principal.

### Reprise ciblée du 9 novembre

**14 parcours complémentaires réussis en 2 min 24 s**, avec un seul worker : les deux niveaux des guides de langues et leurs anciennes routes, concours/Prix sur ordinateur et téléphone, défilement indépendant, correction simulée contrôlée, annulation/délai/erreur fournisseur simulés sans fausse note, séparation des sessions, accès sans compte, accessibilité à 320 px et en sombre, interface allemande, sujets prêts sans fournisseur, téléchargements et aperçus. Journal : `/workspace/output/audit-cinq-20261109/examens/parcours.log`.

Bilan de ce volet : **34 parcours réussis** (20 récupérés + 14 repris), **61 PDF / 503 pages contrôlés techniquement**, **un nouveau défaut confirmé** dans une sonde distincte. La preuve synthétique partageable est `05-examens-preuves.json`.

## Limites

- Aucun véritable appel Gemini, Groq ou autre fournisseur ; ni facturation, quota serveur, déploiement Edge ou correction réelle de copie validés.
- Aucun envoi de document ou donnée personnelle, inscription au concours, achat ou mutation Supabase/NAH.
- L’exactitude de toutes les formulations des cinq langues et de tous les corrigés n’est pas certifiée par cette passe. La vérification de pagination/encodage ne la remplace pas.
- Les fonctions déjà couvertes par les parcours récupérés sont considérées testées pour ces scénarios précis, sans prétendre à l’absence de tout défaut.
