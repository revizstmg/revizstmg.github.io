# Audit des services et du dépôt

18 novembre 2026. Référence : `6d906c2aa39e83f8e97f1e91a06213358dbe317c`.
Lecture seule de GitHub et Supabase (`wyydagcjkbivtbuhbzon`). Aucun compte réel, donnée métier, paiement, appel génératif ni réglage modifié. Ce rapport ne constitue pas une certification exhaustive du site.

## Nouveaux constats

| Importance | Constat confirmé | Effet et action proposée |
| --- | --- | --- |
| 6/10 | GitHub : `branches/main` retourne `protected:false`, et `rulesets` retourne `[]`. | Aucun contrôle obligatoire de branche ne bloque une fusion ou un envoi direct avant validation. Les workflows existants continuent de tester, mais ne constituent pas une barrière de fusion. Définir une protection compatible avec le robot de publication, sans bloquer celui-ci par inadvertance. Aucun incident de publication n'est établi. |
| 4/10 | `.github/workflows/relancer-pages.yml` impose par défaut l'empreinte `c924cef174de0f546e68bd3d6d483732b7d3e00058655f324836eef8997be5a9`, différente de celle de l'index actuel : `08e280a8199e9c13601b996e8d41743ffd90df41c094b2635f5814d4f105f864`. | Le lancement manuel avec les valeurs par défaut échoue à l'égalité des empreintes. Le déclenchement automatique sur modification du workflow utilise également cette ancienne valeur. La chaîne habituelle Pages n'est pas en panne. Demander explicitement une empreinte actuelle ou identifier un artefact testé, en conservant le contrôle de concordance. Aucun déploiement déclenché pour ce constat. |
| 3/10 | `README.md:105` présente encore `fiche-vision` comme version 1 non redéployée. Le serveur retourne ACTIVE, version 2 ; ses deux fichiers sont identiques aux sources actuelles. | La consigne de maintenance est périmée et peut faire diagnostiquer un écart inexistant. Actualiser la note datée. SHA-256 distant/local : `index.ts` = `4f45e9fee3c91513f89befc0a45682bd2c3a63ffdee3efe572122f7fd0d7736d`, `acces.js` = `f95309d5d740d6036c9c2c0fdacf5cda52595a76a52dfe2eccfb87a8ce7dffd0`. Cela ne valide pas une génération réelle. |

## Constats déjà connus, toujours présents

- La migration `20261102120000` est absente de l'historique ; `to_regprocedure('public.revizstmg_mur(text)')` retourne NULL. Écart déjà documenté, pas une nouvelle découverte. Ne pas assimiler l'absence d'une migration historique à l'absence de toutes ses protections.
- Deux clés étrangères sans index couvrant : `class_duel.quiz_id` et `revizstmg_signalements.auteur`. Confirmé par l'advisor et `pg_indexes`. Risque de ralentissement à volume important, sans lenteur mesurée ici. [Référence Supabase](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys).
- Quatre policies `profiles` réévaluent les fonctions Auth par ligne selon l'advisor. Optimisation déjà recommandée. [Référence Supabase](https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan).
- Protection contre les mots de passe compromis désactivée selon l'advisor, déjà signalée le 15 novembre. [Référence Supabase](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Interprétation et limites

L'advisor santé ne retourne aucune alerte. Les alertes SECURITY DEFINER ne prouvent pas à elles seules un contournement : les RPC publiques prévues et les contrôles internes doivent être examinés individuellement. De même, RLS activée sans policy peut être volontaire pour des tables privées utilisées uniquement côté serveur. Aucune faille nouvelle d'accès aux données n'est démontrée par cet audit.

Contrôles effectués : liste des migrations, inventaire des sept Edge Functions, contenu déployé de fiche-vision, advisors sécurité/performance/santé, catalogues des index et présence de la RPC mur, réglages GitHub de protection/rulesets, workflows et script de publication. Les derniers runs consultés incluent des publications Pages réussies. Aucune suppression automatique d'index « inutilisé » recommandée.

Les fichiers compilés à la racine et les sources dans `app/` sont une organisation prévue, pas un doublon à supprimer. Le backend partagé NAH est une contrainte connue ; aucune table NAH n'a été modifiée. Pas de test utilisateur connecté ni de nouvelle suite navigateur dans ce contrôle de configuration. Les résultats ne certifient pas chaque fonctionnalité du site.
