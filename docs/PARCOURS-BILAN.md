# Du devoir au prochain contrôle

Livraison BILAN-20261025-CODEX-03, PR #112.

## Promesse et accès

« Comprends tes erreurs. Prépare ton prochain contrôle. » L’accueil élève et l’entrée sans compte présentent cette promesse et deux accès : commencer à réviser, voir un exemple de bilan. Les missions, la reprise de lecture, la progression et les espaces professeur restent disponibles.

- `/#/exemple-bilan` : exemple rédigé, gratuit, sans compte, sans génération ni envoi de fichier. Cas fictif de TVA en Terminale gestion-finance, copie fictive, barème 2/5 expliqué, méthode et trois exercices différents corrigés. Aucun XP ni résultat réel modifié. Les contenus pédagogiques de l’exemple restent en français, avec une indication traduite ; les commandes et offres sont traduites dans les cinq langues.
- `/#/offres` : répartition prévue. Gratuit : cours, exercices, flashcards, suivi et saisie des notes/questions manquées. Premium : analyse du sujet et de la copie, bilan expliqué et parcours vers les cours. Ultimate : Premium plus exercices personnalisés générés et corrigés, questions rédigées corrigées et chatbot de cours.
- `/#/mes-notes` : parcours réel existant de note, questions manquées ou dépôt sujet/copie. Les bilans affichent leurs limites et des liens vers les cours correspondants.

Aucune vente ni facturation ouverte. Aucun tarif inventé, nouveau verrou ou droit commercial activé. Les outils restent accessibles aux comptes connectés pendant le développement. Comparatif, boutique, formulaire et conditions sont cohérents. Une note automatique est une estimation expliquée, jamais officielle ; aucun résultat futur garanti. Aucun faux professeur, avis ou résultat d’élève.

## Fiabilité du parcours réel

- Seuls les cours de la matière et du thème choisis sont chargés pour l’analyse. Réponse validée par le contrat existant ; aucune faiblesse ou question acceptée avec un identifiant extérieur aux cours transmis.
- Le service existant est conservé. Il compare sujet et copie, doit refuser les fichiers illisibles et les compétences hors des cours, cite les erreurs observées ou déclarées. Le client distingue bilan issu de fichiers et difficultés déclarées. `unreadable` et `out_of_scope` ne produisent aucun exercice inventé.
- Trois fichiers maximum par dépôt, six en tout, 6 Mo au total, PDF/JPEG/PNG/WebP ; taille, format, fichier vide et signature contrôlés avant envoi. Conseils de cadrage/lumière, PDF sans mot de passe, 30 pages maximum. Le serveur reste responsable de la lecture effective et du refus d’une copie inexploitable.
- Consentement explicite avant transmission. Aucune nouvelle conservation de fichier ou donnée personnelle sur le serveur. Les fichiers restent seulement en mémoire dans cette page et ne sont jamais inclus dans le brouillon.
- Délai maximal de deux minutes incluant les étapes préparatoires. Annulation accessible pendant l’analyse ; pas de double envoi simultané. Quotas, reconnexion, fichier invalide, indisponibilité et réponse incomplète ont des messages distincts. Questions/fichiers sélectionnés restent sur la page après erreur.
- Brouillon texte et bilan dans `sessionStorage`, séparés par compte (ou essai invité), restaurés après rechargement du même onglet. Pas de PDF, photo, nom de fichier ou jeton dans ce brouillon. Les fichiers doivent être resélectionnés après rechargement. Un échec du stockage est visible. Ajouter la note sauvegarde le bilan avec la progression existante. Les réponses d’entraînement restent uniquement dans la page, explicitement indiqué.
- Les deux nouvelles routes directes sont reconnues par la page 404 ; leurs vues anonymes sont regroupées dans le compteur guide existant. Aucun nouveau champ analytique ni migration.

## Vérification et limites

Tests unitaires : calculs/barème de la démonstration, séparation et corruption des brouillons, limites des fichiers, ciblage des cours, annulation d’une étape bloquée. Parcours navigateur sans compte, axe AA clair/sombre 320 px, comparaison des offres, dépôt avec consentement, erreur de quota, copie illisible, annulation, délai maximal, reprise/sauvegarde, allemand hors ligne et parcours historiques.

Les appels sont simulés et tout réseau extérieur est bloqué pendant les tests. Aucune copie réelle envoyée à un fournisseur pour cette livraison. Les validations structurelles ne prouvent pas une infaillibilité pédagogique du modèle : le cours, les critères expliqués et le professeur restent les références. Aucun changement de schéma, RLS, fonction Edge, fournisseur, clé, réglage d’authentification ou donnée NAH.
