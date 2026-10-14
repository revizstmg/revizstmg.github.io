# Base de données (Supabase)

RévizSTMG utilise le projet Supabase `wyydagcjkbivtbuhbzon`, qu'il partage avec le
site NAH (dépôt `Gabriel-Merlin/NAH`). Ce dossier contient ce qui concerne
RévizSTMG uniquement.

```
migrations/        l'historique des migrations des 18 tables de RévizSTMG
functions/         la fonction « fiche-vision » (pas encore déployée)
a-valider/         modifications prêtes mais pas encore appliquées (accord à donner)
```

## En attente d'application (`a-valider/`)

Ces fichiers ne sont **pas encore** appliqués sur Supabase. L'accord est donné
(13 octobre 2026), mais ils retirent ou remplacent des éléments : l'outil de
Claude exige alors une confirmation qu'il ne peut pas obtenir. Le propriétaire les
applique en collant `a-valider/A_COLLER_DANS_SUPABASE.sql` (les trois fichiers
numérotés, dans une transaction) dans Supabase → SQL Editor. Ensuite, chaque
fichier passe dans `migrations/` avec l'horodatage de son application.

1. `1_revizstmg_securite_0_nettoyage.sql` : retire 9 lignes de test d'avant les
   comptes (identifiants d'appareil qui ne correspondent à aucun compte).
2. `2_revizstmg_securite_2_regles.sql` : remplace les règles « ouvertes à tous »
   des 16 tables sociales (voir « Règles d'accès » plus bas).
3. `3_revizstmg_suppression_compte.sql` : `revizstmg_supprimer_compte()`, la
   suppression complète du compte par l'élève (e-mail de connexion compris).

Tant qu'ils ne sont pas appliqués, l'application fonctionne avec les anciennes
règles, mais « Supprimer mon compte » échoue proprement (message d'erreur, compte
intact).

## Rappels sur le téléphone (appliqué le 13 octobre 2026)

`migrations/20261013175723_revizstmg_notifications.sql` et `functions/revizstmg-rappels/` :
abonnements « push » (schéma `revizstmg_prive`, accessibles seulement par les
fonctions `revizstmg_push_*`), clés VAPID créées par la fonction Edge et gardées en
base, tâche pg_cron toutes les 10 minutes qui appelle la fonction avec un secret
gardé en base. Le rappel ne contient aucune donnée et n'est envoyé que si l'élève
n'a pas encore révisé ce jour-là.

## Tester les règles d'accès

`supabase/tests/lancer.sh [a-valider/A_COLLER_DANS_SUPABASE.sql]` monte une base
PostgreSQL locale et jetable, imite Supabase (`imitation-supabase.sql`), applique
toutes les migrations et joue `regles-acces.sql` : un élève, un autre élève hors de
la classe, le professeur, un parent sans compte et la suppression du compte. Rien
ne touche la vraie base.

## Comptage et mesure d'audience (appliqué le 12 octobre 2026)

`migrations/20261012173929_revizstmg_statistiques.sql`, appliqué avec l'accord du
propriétaire du projet :

- `revizstmg_visites` : un compteur de vues et de visites par jour et par écran,
  sans aucun identifiant. RLS activée sans règle : personne ne la lit ni ne
  l'écrit directement.
- `revizstmg_compter_vue(page, visite)` : ajoute 1 au compteur du jour (l'app,
  `app/src/mesure.js`, avec `MESURE_ACTIVE = true`).
- `revizstmg_statistiques()` : des comptages déjà agrégés (aucun nom, aucune
  adresse), lus chaque matin par le workflow « Statistiques ».

Les deux fonctions sont `security definer` et appelables avec la clé publique :
c'est voulu, et l'Advisor le signale (« anon security definer function
executable »). Quelqu'un pourrait gonfler les compteurs de visites ou lire les
totaux, pas lire ni modifier autre chose.

## Les migrations

Les 14 fichiers de `migrations/` sont la copie exacte des migrations appliquées sur
Supabase (table `supabase_migrations.schema_migrations`). Chaque fichier a été
comparé au serveur par empreinte md5 le 5 octobre 2026 : ils sont identiques.

À la même date, l'état réel de la base correspond exactement à ces migrations :
mêmes colonnes, mêmes 61 règles RLS, RLS activée sur les 17 tables, et aucun
trigger, aucune fonction et aucune publication Realtime sur ces tables. Rien n'a
été modifié « à la main » en dehors des migrations.

**Tables de RévizSTMG (18) :** `profiles`, `leaderboard`, `friend_user`,
`friend_request`, `friend_duel`, `class_quiz`, `class_quiz_result`, `class_member`,
`class_group`, `class_meta`, `class_wall`, `class_duel`, `class_ban`,
`live_session`, `live_player`, `teacher_class`, `child_stats`, et depuis le
12 octobre 2026 `revizstmg_visites` (voir plus haut).

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

### Règles d'accès (13 octobre 2026)

Les corrections ci-dessous sont faites (fichiers `20261013*` et `a-valider/`) :

- **Compte obligatoire** pour les tables sociales : la clé publique seule (anon)
  n'y a plus aucun droit. L'identifiant public d'un élève (`device_id`,
  `*_device`) est l'identifiant de son compte : chacun n'écrit que ses lignes.
- **Classe** visible de ses seuls membres et de son professeur ; les actions du
  professeur (réglages, groupes, exclusions, QCM approuvés, direct, annonces)
  réservées au propriétaire de la classe (`teacher_class.owner_id`).
- **Codes** : une classe, un ami ou le suivi d'un enfant se trouvent par leur code
  exact via `revizstmg_classe`, `revizstmg_trouver_ami`, `revizstmg_stats_enfant`
  (cette dernière ouverte aux parents sans compte). Les ligues
  (`revizstmg_ligue`, `revizstmg_ligue_classe`) masquent les codes des autres
  classes.
- **Déclencheurs** : un élève ne modifie chez un autre que ce qui lui revient
  (réactions du mur, relever un duel, accepter une demande ou un défi qu'on lui
  adresse) ; codes ami et parent figés ; limites d'envoi (mur : 1 message par
  15 s et 20 par 10 min ; demandes d'ami : 20/h ; défis : 30/h ; QCM : 30/h par
  classe ; classes : 30 par professeur ; signalements : 10/h par compte).
- **Tailles maximales** (textes, photos, questions) par contraintes `check`.
- Les fonctions d'aide sont dans le schéma `revizstmg_prive`, que l'API n'expose
  pas.

### Corrections recommandées le 5 octobre (historique)

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
