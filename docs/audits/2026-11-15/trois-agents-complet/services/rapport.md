# Audit indépendant Supabase et services
15 novembre 2026. Dépôt 08f6a79c6401b3dcb7369252aa809eb9c437fce7. Lecture seule ; aucune correction appliquée.

## Conclusion
Le projet est ACTIVE_HEALTHY (eu-west-3, PostgreSQL17.6). Les anciennes règles sociales ouvertes décrites dans le README ne correspondent plus à la base réelle. Les21 tables ciblées ont RLS active ; les tables sociales ne sont plus lisibles ou inscriptibles directement par anon. Les abonnements et quotas sont seulement consultables par leur propriétaire et non modifiables par authenticated. Une faille de rôle sur le mur de classe demeure ; les scores de classement restent déclaratifs.

## Défauts confirmés et améliorations
| Importance | État | Constat | Correction proposée |
| --- | --- | --- | --- |
| 6/10 | Confirmé par politiques et trigger actifs | Un élève ne peut INSERT une annonce, mais peut UPDATE son propre message vers kind=announce. mur_modifier autorise les membres, et garde_mur protège les autres auteurs sans interdire la conversion de son propre kind. L’interface distingue les annonces et réserve leur création aux professeurs. | Dans garde_mur, refuser new.kind='announce' pour un non-prof, quelle que soit la valeur ancienne. Ajouter un test SQL isolé/mock de cette transition. |
| 4/10 | Limite d’intégrité confirmée | leaderboard.courses est modifiable par le propriétaire. Aucun déclencheur métier sur leaderboard ; les compteurs servant au classement sont fournis par le client. Cela protège les autres comptes, pas la sincérité de son propre score. Aucun lot externe ni préjudice financier n’est établi ; ce risque concerne la crédibilité du classement, pas une exposition de données. | Enregistrer les résultats validés et calculer les points côté serveur. À défaut, présenter le classement comme indicatif et borner les variations. |
| 4/10 | Risque conditionnel | fiche-vision ACTIVEv1 utilise GEMINI_MODEL ou gemini-2.0-flash par défaut. Le catalogue Gemini disponible vérifié par le coordinateur n’inclut pas2.0. L’override secret n’a pas été consulté : aucune panne réelle de génération n’est affirmée. | Passer le défaut sur un modèle effectivement disponible, ajouter readiness sans génération et surveiller les erreurs modèle. |
| 4/10 | Préparation lancement | GET public paiement?check=tarifs répond200, mode=test. Premium9,99€/mois, Ultimate19,99€/mois, Go20€/élève/an+500€/établissement/an. | Avant vente, vérifier la cohérence des tarifs annoncés, les textes légaux, puis basculer Stripe et webhook avec test de bout en bout autorisé. Ce n’est pas une panne. |
| 3/10 | Advisor sécurité | Protection contre les mots de passe compromis désactivée. | Activer si disponible dans le plan, puis vérifier les règles d’inscription. |
| 3/10 | Advisor performance | Les4 policies profiles utilisent auth.uid() directement, au lieu de (select auth.uid()). | Remplacer pour éviter une réévaluation par ligne, sans changement fonctionnel. |
| 2/10 | Advisor performance | Index FK manquants sur class_duel.quiz_id et revizstmg_signalements.auteur. | Évaluer les plans et ajouter les index adaptés ; pas de suppression automatique des index « inutilisés ». |
| 2/10 | Documentation | fiche-vision est déployée ; affirmations « non déployée », politiques sociales ouvertes et inventaires datés sont obsolètes. | Synchroniser README et inventaire avec les preuves de cet audit. |

## Contrôles positifs
- 21 tables ciblées : RLS active ; pas de vue SECURITYDEFINER masquant ces règles dans ce périmètre.
- Quotas : revizstmg_ia_reserver/rendre interdits à anon et authenticated ; réservation atomique UPDATE n<n_max.
- Fonctions push privées et suppression compte : privilèges restreints ; search_path explicite.
- Demandes d’amis : trigger empêche de changer les participants et seul le destinataire peut changer le statut.
- Duels amis : trigger protège le score de l’autre et les transitions d’état.
- Classes : est_prof vérifie teacher_class.owner_id=auth.uid(), pas le rôle déclaratif du navigateur.
- Parents : table non accessible à anon ; RPC lit seulement le code exact. Nouveaux codes10caractères aléatoires et possibilité de révoquer. Les anciens codes courts restent admis ; migration à prévoir si abandonnés.
- Abonnements et usage : aucune écriture client directe. Signalements anonymes acceptés uniquement non traités.
- Storage : aucune policy trouvée ; aucun stockage de contenu utilisateur inspecté.
- Sept fonctions Edge actives, dont quatre RévizSTMG : examen-blancv36, paiementv9, rappelsv5, fiche-visionv1. verify_jwt=false seul n’est pas une vulnérabilité : signatures/auth explicite doivent être prises en compte.
- Advisor health : aucun avertissement. Les nombreux SECURITYDEFINER exécutables signalés dans le projet partagé concernent aussi NAH et ne constituent pas automatiquement une faille RévizSTMG.
- Logs des24dernières heures : seules les répartitions agrégées par source ont été lues, aucune donnée privée ni message brut.

## Limites de vérification
Aucun compte réel utilisé, aucune écriture, aucun paiement, email ou appel génératif. Les parcours connectés complets, facturation réelle, quotas concurrents et qualité de génération ne sont pas validés de bout en bout. Le coordinateur possède les preuves complémentaires Google/Gemini dans /workspace/output/google-verification/services.json. Les secrets et leur contenu n’ont pas été lus. Les migrations manquantes de l’historique sont documentées comme appliquées manuellement : les policies réelles ont été consultées plutôt que d’inférer une absence de protection.

Preuves nettoyées : preuves.json. Aucun nom, email, jeton ou contenu de ligne privée n’a été extrait.


## Repères de correction
La policy mur_modifier provient de supabase/migrations/20261020151401_revizstmg_securite_2_regles.sql, section class_wall. Le garde_mur réel est enregistré intégralement dans preuves.json, avec ses colonnes : class_code, device_id, created_at, answer, answered_by, text, name, kind, is_anon, chapter_label, resolved. Ajouter après la protection des identifiants : si auth.uid() non nul, non-prof de old.class_code et new.kind=announce, lever42501. Conserver les réactions autorisées. Aucune transition en production n’a été exécutée.
