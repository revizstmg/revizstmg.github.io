# Répartition et livraison des points 10 à 28

Responsable du lot : Codex, [PR #30](https://github.com/revizstmg/revizstmg.github.io/pull/30),
fusionnée dans `main` (`5f1e386`). Le lot 1–10 de Claude ([PR #31](https://github.com/revizstmg/revizstmg.github.io/pull/31))
est intégré : un seul lancement d’atelier pour le point 10 partagé.

Les états décrivent le code livré ; « partiel » ne signifie pas terminé.
Aucune modification de production Supabase dans ce lot.
Validation de l’ensemble : **286 tests unitaires, compilation et 143 parcours
navigateur réussis**, [CI de la PR](https://github.com/revizstmg/revizstmg.github.io/actions/runs/39444696450).
La [publication sur main](https://github.com/revizstmg/revizstmg.github.io/actions/runs/39445531708)
a également réussi. [Site public](https://revizstmg.github.io/) vérifié le
20 octobre à 15:14 UTC : version `ccd9d4b219`, fichiers publiés dans `38278fe` ;
accueil, réglages et atelier sans exception JavaScript ([contrôle](publication.json)).

| N° | État du code | Livraison et limites |
|---|---|---|
| 10 | Corrigé | Lancement de l’atelier fixé en bas de l’écran, au-dessus de la navigation. |
| 11 | Corrigé | Résultat de QCM conservé avant envoi, file séparée par compte ; renvoi après retour réseau, réouverture ou action manuelle ; retrait seulement après confirmation. Stockage refusé : avertissement et résultat gardé tant que la page reste ouverte. |
| 12 | Corrigé | Date passée = « Épreuve passée », date du jour seule = « C’est aujourd’hui ». |
| 13 | Partiel | BO 2027 lu ; retrait du dossier d’enseignement spécifique de l’écrit de management, dossiers partiels correctement nommés. Vrais sujets rédigés et barèmes restent à produire/revoir : [dossier éditorial](RELECTURE-ET-SUJETS.md). |
| 14 | Partiel | Plancher global de 12 px pour les anciens petits libellés, métadonnées agrandies sur accueil/boutique/profil/programme ; sélection des réglages et état ouvert de méthodologie explicites. Une recette AA complète des autres pages reste nécessaire ; aucune certification WCAG annoncée. |
| 15 | Décision et développement serveur requis | Contrats de correction, gains atomiques et droits commerciaux proposés dans [DEPENDANCES-SERVEUR.md](DEPENDANCES-SERVEUR.md). Aucun mois réellement activé sur la seule foi des scores clients. |
| 16 | Corrigé | Sélection de trois premiers objets aux prix les plus bas accessibles au niveau courant, lien vers une séance pour gagner les pièces ; achats existants conservés. |
| 17 | Corrigé | Statut hors connexion vérifie tous les fichiers et la version de l’application affichée ; une représentation statique avec `Vary: Origin` n’est pas oubliée, un ancien cache ne suffit pas. |
| 18 | Amélioré | Délai de réponse réseau borné à 15 s ; erreurs d’acceptation/suppression d’ami et actions de classe signalées ; texte des messages préservé après échec ; résultats de QCM avec reprise durable (#11). Les autres types de jeux ne disposent pas tous d’une file durable. |
| 19 | Partiel, serveur requis | Nouveaux codes aléatoires sécurisés, aucun code de secours commun. Renouvellement et limite d’essais nécessitent de adapter le verrou du code prévu dans la migration de sécurité et protéger le point d’entrée : contrat détaillé, pas de faux bouton actif. |
| 20 | Corrigé | Bouton de l’essai « Commencer mes révisions sans compte ». |
| 21 | Corrigé | « Entraînement personnalisé » dans les cinq langues ; explication de l’algorithme fondé sur les résultats et des limites des conseils. |
| 22 | Corrigé | Maîtrise expliquée sur l’accueil ; objectifs alternent les matières à urgence/score/échéance égaux, sans retarder une priorité supérieure. |
| 23 | Corrigé | Indice, lien de cours, bilan par formule, premier essai identifié, reprise exacte locale par compte/filière, répétition des erreurs et nouvel essai avec mêmes valeurs. Aucun gain artificiel de maîtrise. |
| 24 | Corrigé | « Mes progrès » distinct de « Réglages », URL directe `#/moi?section=reglages` ; sommaire dans les deux pages légales. |
| 25 | Amélioré | Flèche retour distincte de fermer ; recherche vide expliquée avec accès aux cours ; outils de projet précisent le niveau et proposent l’outil adapté sans effacer de dossier. Clavier des fenêtres intégré et testé depuis #31 ; harmonisation visuelle exhaustive des autres retours encore à terminer. |
| 26 | Partiel | Nouveaux libellés ajoutés aux quatre dictionnaires hors ligne ; grille de relecture livrée. Aucune relecture des cours par des locuteurs humains effectuée par ce lot. |
| 27 | Amélioré, mesures livrées | Ancienne banque du formulaire retirée du chargement initial ; référence conservée pour les contrôles de contenu. JavaScript principal : 595 157 → 578 453 octets (−2,8 %), après intégration du lot de Claude. [Méthode et résultats](PERFORMANCE.md). Profilage sur téléphone physique et coût de la première préparation hors ligne encore à examiner. |
| 28 | Corrigé côté client, testé | Changement d’identité/fermeture dans un autre onglet actualise l’interface ; renouvellement du même compte ne réinitialise pas les données ; contrôles d’appartenance conservés sur les requêtes tardives et la file de résultats. Aucun changement de configuration Auth serveur. |

Les trois dépendances principales restant ouvertes : sécurité/rotation côté base,
vrais sujets rédigés et relecture pédagogique des traductions. Les partiels ne
sont pas présentés comme terminés.

## Repères de recette

- `npm test` : 286/286, y compris les empreintes du contenu, les liens de cours
  de l’atelier, l’aléatoire des formules, la conservation et l’isolation des envois.
- Compilation réussie. Aucun fichier compilé modifié manuellement.
- 143/143 parcours sur GitHub pour la version intégrée. Contrôles supplémentaires
  locaux : préparation réelle du cache, ouverture hors ligne d’une matière jamais
  consultée et essai sans compte (3/3 avant l’intégration du lot clavier).
- Une erreur de transmission ne déclenche pas automatiquement de nouvelles
  publications de messages ou demandes sociales ; la reprise durable ajoutée ici
  vise les résultats de QCM, dont l’envoi utilise la clé d’upsert existante.
- Les essais ont bloqué les requêtes extérieures ou utilisé des réponses fictives.
  Aucun vrai compte de test ni aucune donnée réelle créés pour la recette.
