---
name: migration-supabase
description: Préparer une modification de la base Supabase de RévizSTMG (nouvelle table, colonne, règle RLS, fonction SQL, donnée) ou analyser la base. À utiliser dès qu'une demande touche aux comptes, aux classes, aux amis, aux duels, au suivi parent, aux statistiques ou à toute donnée stockée.
---

# Modifier la base Supabase

Référence : `supabase/README.md` (migrations, tables, audit de sécurité).

## Règles absolues

- **Lecture libre, mais aucune modification de la base** (migration, donnée,
  réglage) sans l'accord **explicite** du propriétaire du projet, pour cette
  modification-là. Un accord passé ne vaut pas pour la suivante.
- Le projet `wyydagcjkbivtbuhbzon` est partagé avec le site NAH. Ne touchez jamais
  aux tables de NAH (`candidatures`, `signalements`, `questions_anonymes`,
  `sondages`, `config`, `admin_invites`, `messages_equipe`, `idees_equipe`…) ni aux
  fonctions du schéma `public` qui leur appartiennent.
- La clé « anon » est publique : **chaque table a la RLS activée et des règles**.
- Sauf `profiles`, les tables sociales sont ouvertes à tous (`using (true)`) :
  aucune donnée sensible dedans tant que les corrections de l'audit
  (`supabase/README.md`, « Corrections recommandées ») ne sont pas appliquées.

## Étapes

1. **Lire l'existant** : `supabase/migrations/`, puis l'état réel (outils Supabase
   en lecture : `list_tables`, `list_migrations`, `get_advisors`).
2. **Écrire** la migration dans `supabase/a-valider/<AAAAMMJJHHMMSS>_<nom>.sql`
   (horodatage UTC) : `enable row level security`, règles les plus strictes
   possible (`auth.uid()`), pas de `using (true)` pour des données personnelles,
   fonctions `security definer` avec `set search_path = ''`.
3. **Adapter l'app** et ses tests ; les parcours ne doivent jamais toucher la
   vraie base (`tests/parcours/eleve.js` bloque tout accès extérieur).
4. **Lancer `/security-review`** sur le diff.
5. **Demander l'accord** en expliquant en clair : ce qui change, quelles données,
   qui peut lire ou écrire quoi, et le risque.
6. **Après accord seulement** : déplacer le fichier dans `supabase/migrations/`,
   l'appliquer **sous le même nom** (`apply_migration`), vérifier
   (`list_migrations`, `get_advisors`), puis mettre à jour `supabase/README.md`
   (liste des tables, date d'application).
