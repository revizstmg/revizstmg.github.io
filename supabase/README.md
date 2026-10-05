# Base de données (Supabase)

RévizSTMG utilise le projet Supabase `wyydagcjkbivtbuhbzon`, qu'il partage avec le
site NAH (dépôt `Gabriel-Merlin/NAH`). Ce dossier contient ce qui concerne
RévizSTMG uniquement.

```
migrations/        l'historique des migrations des 17 tables de RévizSTMG
functions/         la fonction « fiche-vision » (pas encore déployée)
a-valider/         modifications prêtes mais pas encore appliquées (accord à donner)
```

## En attente d'accord (`a-valider/`)

Ces fichiers ne sont **pas** appliqués sur Supabase. Une fois l'accord donné, chacun
est déplacé dans `migrations/` (avec son horodatage) et appliqué sous son nom.

- `revizstmg_statistiques.sql` : la mesure d'audience sans cookie (table
  `revizstmg_visites`, fonction `revizstmg_compter_vue`) et la fonction
  `revizstmg_statistiques()` lue par le fichier de statistiques du matin. Après
  application, passer `MESURE_ACTIVE` à `true` dans `app/src/mesure.js`.

## Les migrations

Les 13 fichiers de `migrations/` sont la copie exacte des migrations appliquées sur
Supabase (table `supabase_migrations.schema_migrations`). Chaque fichier a été
comparé au serveur par empreinte md5 le 5 octobre 2026 : ils sont identiques.

À la même date, l'état réel de la base correspond exactement à ces migrations :
mêmes colonnes, mêmes 61 règles RLS, RLS activée sur les 17 tables, et aucun
trigger, aucune fonction et aucune publication Realtime sur ces tables. Rien n'a
été modifié « à la main » en dehors des migrations.

**Tables de RévizSTMG (17) :** `profiles`, `leaderboard`, `friend_user`,
`friend_request`, `friend_duel`, `class_quiz`, `class_quiz_result`, `class_member`,
`class_group`, `class_meta`, `class_wall`, `class_duel`, `class_ban`,
`live_session`, `live_player`, `teacher_class`, `child_stats`.

**Ce qui n'est pas ici :** l'historique commun contient aussi les migrations de NAH
(avant septembre 2026), plus deux migrations de septembre qui ne concernent que
NAH : `20260905070023_secure_exposed_tables_rls` (tables `config`, `admin_invites`,
`messages_equipe`, `idees_equipe`) et `20260914081334_harden_function_search_path`
(les fonctions du schéma `public`, toutes à NAH).

### Modifier la base

1. Écrire la modification dans un nouveau fichier
   `migrations/<AAAAMMJJHHMMSS>_<nom>.sql`.
2. L'appliquer sur Supabase **sous le même nom** (outil `apply_migration`, ou
   `supabase db push` avec la CLI), pour que l'historique du serveur et ce dossier
   restent identiques.
3. Ne jamais toucher aux tables de NAH.

## Audit de sécurité (5 octobre 2026)

Les recommandations de Supabase (« Security Advisor ») ne signalent **rien** sur les
tables de RévizSTMG : leurs 123 constats concernent les fonctions et tables de NAH,
plus un réglage commun (ci-dessous). Mais l'Advisor ne vérifie pas ce que les
règles autorisent. En les relisant :

**Bien protégé.** `profiles` : chacun ne lit, ne modifie et ne supprime que sa
propre ligne (`auth.uid() = id`). C'est là qu'est la progression synchronisée.

**Ouvert à tous.** Les 16 autres tables autorisent la lecture, l'écriture et
souvent la suppression de **toutes** les lignes par n'importe qui (`using (true)`
pour le rôle `anon`). La clé « anon » est dans le code du site, donc toute personne
qui la copie peut, sans passer par l'application :

| Risque | Tables |
|---|---|
| Lister les prénoms, photos et statistiques de tous les élèves | `class_member`, `friend_user`, `leaderboard`, `live_player`, `child_stats` |
| Lire tout l'espace parent, sans connaître le code | `child_stats` |
| Effacer ou modifier le mur, les QCM, les duels d'une classe | `class_wall`, `class_quiz`, `class_duel`, `class_group`, `class_meta` |
| Changer le propriétaire d'une classe, lever une exclusion ou exclure un élève | `teacher_class`, `class_ban`, `class_member` |

Au 5 octobre 2026, ces tables ne contiennent que quelques lignes de test (10 comptes
dans `profiles`). Le risque est faible aujourd'hui, mais **il faut le corriger avant
d'ouvrir l'application à des classes** : il s'agit de données de mineurs.

### Corrections recommandées (pas encore appliquées)

1. **Espace parent et codes amis** : retirer la lecture directe de `child_stats` et
   `friend_user`. À la place, une fonction `security definer` qui ne renvoie que la
   ligne du code demandé (`get_child_stats(code)`, `find_friend(code)`).
2. **Actions du professeur** (`teacher_class`, `class_ban`, `class_meta`,
   suppression dans `class_member`, `class_quiz`, `class_wall`) : les réserver au
   professeur connecté, propriétaire de la classe (`auth.uid() = owner_id`).
3. **Données d'un appareil** (scores, duels, demandes d'amis) : ajouter un secret
   par appareil, généré au premier lancement et gardé dans le navigateur, et faire
   passer les écritures par des fonctions qui le vérifient. Aujourd'hui,
   l'identifiant d'appareil suffit, et il est visible par tous.
4. **Photos** : ne pas les copier dans les tables publiques, ou les rendre visibles
   seulement aux membres de la classe.
5. **Réglage commun aux deux sites** : activer la protection contre les mots de passe
   divulgués (Supabase → Authentication → Policies, « Leaked password protection »).

Ces corrections changent le fonctionnement de l'application (classe, amis, parent)
et doivent être testées ensemble. Elles font l'objet d'une tâche à part.
