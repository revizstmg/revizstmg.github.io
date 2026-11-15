# Correction des cinq défauts de fiabilité

Demande : corriger les défauts techniques encore ouverts des [trois audits](../2026-11-14/trois-agents/README.md). Aucun contenu pédagogique ni offre, droit ou donnée de base modifié.

## Correctifs

1. **A1-01, profil bloqué après connexion** : lecture du profil entièrement bornée à15s, en-têtes et corps compris. Après expiration, le formulaire est à nouveau disponible avec sa saisie conservée ; une nouvelle tentative peut réussir.
2. **A1-02, sauvegarde au corps silencieux** : échéance de15s couvrant l’envoi et la lecture complète ; annulation, état d’échec et libération de la file d’envoi. Reprise manuelle ou automatique sur les dernières modifications conservées localement. Les réponses tardives ne lancent pas une lecture de conflit après expiration et ne modifient pas l’état d’un autre compte.
3. **A1-03, ancien score partagé** : la clé globale sans propriétaire n’est plus fusionnée avec le compte actuel. Elle reste intacte sur l’appareil, sans attribution automatique. Les scores de la clé propre au compte restent rejouables et renvoyables ; une fin d’envoi tardive ne range plus un score dans le compte connecté entre-temps.
4. **A2-01, atelier** : programme et niveau sont sauvegardés avec la sélection. Une ancienne sélection hors classe est reprise dans le programme complet ; une sélection volontairement masquée est annoncée avec un bouton pour la retrouver. Ni les formules ni les réponses de séance ne sont supprimées.
5. **A2-02, audio** : erreurs synchrones et asynchrones arrêtent la lecture et affichent un message avec reprise possible. Les annulations volontaires sont distinguées par génération de callback et ne déclenchent pas de fausse erreur ; pause, changement de carte/langue et fermeture restent opérationnels.

Le renouvellement de session reçoit également une échéance complète : sans cela, une promesse mutualisée bloquée pouvait empêcher toute reprise des lectures et sauvegardes. Un échec réseau conserve la session ; un retour tardif ne remplace pas son nouveau jeton ni le compte actif. La file de sauvegarde traite les modifications d’un nouveau compte après la fin d’un ancien envoi, avec vérification de l’identité avant fusion.

## Vérifications locales

- 34 tests ciblés réussis, dont8nouveaux pour les échéances de profil/sauvegarde/renouvellement, l’isolement des scores et les filtres/migrations de l’atelier.
- Compilation réussie, sans modification des fichiers compilés à la main.
- Lot navigateur :32réussites initiales et2échecs de sélecteurs dans les nouveaux tests de l’atelier. Les captures montraient la sélection restaurée ; les sélecteurs des contrôles ont été corrigés, aucun contrôle supprimé. Reprise des8nouveaux scénarios réussie ; les26scénarios existants avaient déjà réussi. Couverture : compte élève/prof sur un même PC, sauvegarde et conflits entre appareils simulés, duel hors ligne/reprise, audio et clavier, atelier et paiement sans redirection après changement de compte.
- Les nouveaux messages sont présents dans les cinq catalogues hors ligne. Les trois attentes de tests existants de session attendent la microtâche du nouveau délai, avec les mêmes assertions d’isolement et de réponse tardive.
- Suite unitaire générale et CI UTC/Paris/navigateur avant publication ; références et contrôle public à consigner à la livraison.

## Limites

Profils, réseau, duels et moteur vocal sont simulés. Aucun vrai OAuth Google/Apple, compte Supabase, paiement Stripe, appel IA, caméra/micro ou voix physique n’a été utilisé. Aucune mutation de schéma, RLS, secrets ou données Supabase/NAH. Les cours/exercices ne sont pas certifiés par ces tests ; leur relecture disciplinaire reste distincte.

Documentation Supabase consultée : changelog du15novembre2026 (aucune évolution REST/Auth pertinente identifiée dans les entrées récentes), guide des sessions. Le correctif conserve l’identité de session comme garde des réponses tardives et ne change aucun mécanisme d’autorisation.
