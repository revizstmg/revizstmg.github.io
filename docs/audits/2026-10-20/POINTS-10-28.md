# Répartition et livraison des points 10 à 28

Responsable : Codex. PR #30. Point 10 réservé à Codex pour éviter le doublon ;
Claude garde 1–9. Cette feuille ne parle pas au nom de Claude.

État du lot en cours de recette : « livré » ci-dessous désigne le code de la PR,
pas encore une preuve de publication. Les résultats de recette sont ajoutés après
exécution. Aucun changement de production Supabase dans ce lot.

| N° | État du code | Livraison et limites |
|---|---|---|
| 10 | Corrigé | Lancement de l’atelier fixé en bas de l’écran, au-dessus de la navigation. |
| 11 | Corrigé | Résultat de QCM conservé avant envoi, file séparée par compte ; renvoi après retour réseau, réouverture ou action manuelle ; retrait seulement après confirmation. Stockage refusé : avertissement et résultat gardé tant que la page reste ouverte. |
| 12 | Corrigé | Date passée = « Épreuve passée », date du jour seule = « C’est aujourd’hui ». |
| 13 | Partiel | BO 2027 lu ; retrait du dossier d’enseignement spécifique de l’écrit de management, dossiers partiels correctement nommés. Vrais sujets rédigés et barèmes restent à produire/revoir : [dossier éditorial](RELECTURE-ET-SUJETS.md). |
| 14 | Partiel | Plancher global de 12 px pour les anciens petits libellés, métadonnées agrandies sur accueil/boutique/profil/programme ; sélection des réglages et état ouvert de méthodologie explicites. Une recette AA complète des autres pages reste nécessaire ; aucune certification WCAG annoncée. |
| 15 | Décision et développement serveur requis | Contrats de correction, gains atomiques et droits commerciaux proposés dans [DEPENDANCES-SERVEUR.md](DEPENDANCES-SERVEUR.md). Aucun mois réellement activé sur la seule foi des scores clients. |
| 16 | Corrigé | Sélection de trois premiers objets aux prix les plus bas accessibles au niveau courant, lien vers une séance pour gagner les pièces ; achats existants conservés. |
| 17 | Corrigé | Statut hors connexion vérifie les entrées du cache de la version active ; pas de confirmation sur la seule présence de l’application installée. |
| 18 | Amélioré | Requêtes sociales interrompues après 15 s ; erreurs d’acceptation/suppression d’ami et actions de classe signalées ; texte des messages préservé après échec ; résultats de QCM avec reprise durable (#11). Les autres types de jeux ne disposent pas tous d’une file durable. |
| 19 | Partiel, serveur requis | Nouveaux codes aléatoires sécurisés, aucun code de secours commun. Renouvellement et limite d’essais nécessitent de adapter le verrou du code prévu dans la migration de sécurité et protéger le point d’entrée : contrat détaillé, pas de faux bouton actif. |
| 20 | Corrigé | Bouton de l’essai « Commencer mes révisions sans compte ». |
| 21 | Corrigé | « Entraînement personnalisé » dans les cinq langues ; explication de l’algorithme fondé sur les résultats et des limites des conseils. |
| 22 | Corrigé | Maîtrise expliquée sur l’accueil ; objectifs alternent les matières à urgence/score/échéance égaux, sans retarder une priorité supérieure. |
| 23 | Corrigé | Indice, lien de cours, bilan par formule, premier essai identifié, reprise exacte locale par compte/filière, répétition des erreurs et nouvel essai avec mêmes valeurs. Aucun gain artificiel de maîtrise. |
| 24 | Corrigé | « Mes progrès » distinct de « Réglages », URL directe `#/moi?section=reglages` ; sommaire dans les deux pages légales. |
| 25 | Amélioré | Flèche retour distincte de fermer ; recherche vide expliquée avec accès aux cours ; outils de projet précisent le niveau et proposent l’outil adapté sans effacer de dossier. Harmonisation exhaustive des fenêtres à recetter avec Claude (#9). |
| 26 | Partiel | Nouveaux libellés ajoutés aux quatre dictionnaires hors ligne ; grille de relecture livrée. Aucune relecture des cours par des locuteurs humains effectuée par ce lot. |
| 27 | Amélioré, mesure documentée après recette | Ancienne banque du formulaire retirée du chargement initial ; référence conservée pour les contrôles de contenu. Mesure comparative en émulation, pas une mesure sur téléphone physique. |
| 28 | Corrigé côté client, tests à consigner | Changement d’identité/fermeture dans un autre onglet actualise l’interface ; renouvellement du même compte ne réinitialise pas les données ; contrôles d’appartenance conservés sur les requêtes tardives et la file de résultats. Aucun changement de configuration Auth serveur. |

Les trois dépendances principales restant ouvertes : sécurité/rotation côté base,
vrais sujets rédigés et relecture pédagogique des traductions. Les partiels ne
sont pas présentés comme terminés.
