# Corrections de l’audit fonctionnel du 27 octobre 2026

L’audit de trois agents a isolé neuf défauts. Cette livraison les corrige et ajoute une protection de reprise au sujet de mathématiques. Les constats ont été rapprochés de main4786b1e1 pour exclure les corrections déjà publiées par Claude (#131, #133, #134).

| Défaut | Correction |
|---|---|
| Quiz en direct : réponse oubliée à la révélation | Réponses indexées par question, conservées à la révélation et relues depuis le serveur. |
| Quiz en direct : échec réseau masqué | Accusé de sauvegarde vérifié, file des réponses dans l’onglet par compte/session, message d’envoi/en attente, reprise manuelle et au retour du réseau. Une réponse déjà enregistrée n’ajoute pas de nouveau les points. |
| Exclusion silencieusement échouée | Interdiction confirmée avant retrait du membre ; échec propagé et présenté au professeur. Aucune modification de politique serveur. |
| Invitation refusée bloquée | Les relations acceptées/en attente sont distinguées des refus. Seuls les refus sont supprimés avant une nouvelle invitation, selon les droits existants et sans modifier un statut au nom du destinataire. |
| Identité obsolète des duels | Identité relue dans le rendu et page réinitialisée lors du changement de compte. |
| Vacances écrasées entre filières | Confirmation avant création si un programme d’une autre filière existe ; un refus conserve le programme et ses réponses. |
| Flashcards au même recto sous-comptées | Identité de chaque occurrence dans la série, conservée lors de la reprise des cartes ratées. Compteurs et XP suivent les cartes, pas leur texte. |
| Langues : filtre effaçant les réponses | Brouillons, corrections et auto-évaluations remontés au niveau du manuel, indexés par langue/exercice. Un filtre ou changement de langue ne les efface plus. |
| Langues : chargement infini après panne | Données JSON chargées par requête annulable avec délai maximal, erreur visible et réessai effectif. Le réessai ne dépend plus d’un import JS rejeté mis en cache. |

## Protection complémentaire : mathématiques

Le sujet, les réponses, la correction et la date de départ sont conservés dans le même onglet, séparément pour chaque compte. Quitter puis revenir ou actualiser reprend la copie ; le chronomètre repart de la date initiale. Le retour sur une correction n’attribue pas à nouveau ses XP. Une nouvelle copie remplace volontairement la précédente via « Nouveau sujet », proposé après correction. Le stockage refusé est signalé et la sortie volontaire demande confirmation.

Les brouillons d’onglet ne sont pas une sauvegarde synchronisée entre appareils. Les réponses des manuels restent conservées tant que la page Langues reste montée ; cette correction ne promet pas de reprise après fermeture de la page.

## Validation

- Tests unitaires de transport simulé : interdiction refusée, succès HTTP sans ligne modifiée, retrait échoué, invitation refusée renouvelée, conservation des invitations en attente/acceptées, accusé de réponse perdu sans double score, joueur absent/changement de compte.
- Parcours navigateur : cartes au même recto avec reprise et XP, langues avec panne puis réessai et changement de leçon/langue, copie de maths après sortie/actualisation/correction, remplacement Vacances annulé puis confirmé entre filières, quiz en direct avec panne/révélation/reprise/rechargement, duels après changement de compte sans rechargement.
- Les contrôles utilisent uniquement des comptes fictifs et des requêtes interceptées. Aucun test n’écrit dans la vraie base ni n’appelle Gemini.

Les résultats finaux et références de publication sont consignés dans docs/COORDINATION.md et dans la PR de livraison.
