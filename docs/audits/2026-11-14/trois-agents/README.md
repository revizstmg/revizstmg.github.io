# Trois audits indépendants du site

Mise à jour du15novembre2026 : les cinq défauts ci-dessous ont été corrigés, publiés et revérifiés. Voir le [rapport de correction et les preuves](../../2026-11-15/cinq-defauts-fiabilite.md). Les constats d’origine sont conservés comme historique.

Référence produit audité : `9eea90627` (compilation publiée `30019d7b8`). Les seuls changements de main intervenus pendant la reprise étaient des statistiques. Trois agents ont travaillé dans des copies distinctes, sans modifier le produit, les données réelles ou les contrôles.

## Défauts reproduits encore présents

| Importance | Défaut | Rapport |
|---|---|---|
| 8/10 | Une sauvegarde dont le corps de réponse reste silencieux bloque les suivantes | [Agent1, A1-02](agent1/rapport.md) |
| 7/10 | Une connexion réussie reste bloquée si le chargement du profil ne répond pas | [Agent1, A1-01](agent1/rapport.md) |
| 6/10 | Un score de duel hérité du cache global peut être attribué au mauvais compte | [Agent1, A1-03](agent1/rapport.md) |
| 4/10 | Les filtres de programme/niveau de l’atelier ne suivent pas la sélection sauvegardée | [Agent2, A2-01](agent2/rapport.md) |
| 4/10 | Une erreur du moteur vocal peut laisser un faux état de lecture | [Agent2, A2-02](agent2/rapport.md) |

Ces cinq défauts sont des résultats d’audit, pas des corrections livrées. Les pannes réseau et vocales sont simulées ; le mélange de scores est reproduit avec un ancien cache et deux comptes fictifs. Les étapes et les preuves sont dans chaque rapport. Les sources Auth/social/atelier/audio concernées ne sont pas modifiées par la refonte Avenir.

## Couverture et limites

- Agent1 : comptes, sauvegarde, navigation, réglages et social ; 46 parcours ciblés réussis et 14 ouvertures desktop/mobile sans exception ni débordement. Ces réussites ne couvrent pas les nouvelles sondes de panne citées ci-dessus.
- Agent2 : apprentissage et ressources ; 49 tests ciblés, inventaire de 750 sections actives sur 17 matières, cinq guides PDF interactifs contrôlés. Une relecture pédagogique complète de chaque phrase et chaque tirage n’est pas prétendue.
- Agent3 : examens, productions, offres, EPS et orientation ; 91 tests ciblés, 28 parcours validés, 24 ouvertures de pages. 79 fichiers PDF physiques lisibles, représentant 69 contenus uniques : contrôle technique, sans certification pédagogique exhaustive. [Rapport](agent3/RAPPORT.md).

Les nombres de tests de chaque volet ne sont pas additionnés comme des contrôles tous distincts. Gemini réel, paiements/webhooks Stripe réels, politiques RLS et comptes réels Supabase, caméra/micro réels et tous les lecteurs PDF ne sont pas certifiés. Aucune donnée de NAH touchée ni action commerciale ou message externe exécuté.

## Nouvelle version de Parcours Avenir

La demande comprenait aussi un questionnaire plus complet. Cette version, développée séparément, contient 80 questions en 12 étapes, migration des56réponses, synthèse globale, projet personnel et démarches. L’agent3 a contre-relu les règles et identifié un défaut d’impression des rubriques repliées. Ce défaut est corrigé avant livraison : une copie statique dédiée à l’impression restitue les24questions et24réponses complémentaires ; PDF réel vérifié sur la compilation. Les pièces de preuve finale sont dans `agent3/avenir-final-print*`. Il n’est donc pas ajouté aux cinq défauts encore présents ci-dessus.

## Améliorations distinctes des bugs

- Ajouter des exercices locaux originaux dans les sections moins fournies, sans récupérer des questions d’un autre chapitre (6/10).
- Distinguer le temps de page visible du travail réellement effectué (5/10).
- Permettre l’annulation explicite de génération d’examen et de réponse du tuteur (5/10).
- Clarifier la reprise des copies et la non-persistance des pièces jointes (4/10).
- Rendre plus lisible l’étape en cours de l’examen personnalisé et l’écoute audio (3/10).

Les rapports individuels détaillent également les faux positifs écartés et les propositions d’accessibilité et d’ergonomie.
