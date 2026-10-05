-- EN ATTENTE D'ACCORD : rien de ce fichier n'est encore appliqué sur Supabase.
-- Une fois validé, il devient migrations/<AAAAMMJJHHMMSS>_revizstmg_statistiques.sql
-- et il est appliqué sous le nom « revizstmg_statistiques ». Dans l'app, passer
-- alors MESURE_ACTIVE à true (app/src/mesure.js).
--
-- Contenu :
-- 1. revizstmg_visites : la mesure d'audience sans cookie. Un compteur par jour
--    et par écran (« accueil », « chapitre »…) : aucun identifiant, aucune
--    adresse IP, aucun appareil. Ni lisible ni modifiable directement (RLS sans
--    règle) : l'app ajoute 1 par la fonction revizstmg_compter_vue().
-- 2. revizstmg_statistiques() : des comptages déjà agrégés (aucun nom, aucune
--    adresse e-mail), lus chaque matin par le workflow « Statistiques ».
-- Les deux fonctions sont appelables avec la clé publique : quelqu'un pourrait
-- gonfler les compteurs de visites, pas lire ni modifier autre chose.

-- ---- 1. Mesure d'audience ----
create table if not exists public.revizstmg_visites (
  jour date not null,
  page text not null check (page ~ '^[a-z][a-z-]{0,29}$'),
  vues integer not null default 0 check (vues >= 0),
  visites integer not null default 0 check (visites >= 0),
  primary key (jour, page)
);
alter table public.revizstmg_visites enable row level security;
revoke all on table public.revizstmg_visites from anon, authenticated;

create or replace function public.revizstmg_compter_vue(p_page text, p_visite boolean default false)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Seuls les écrans de l'app sont comptés (liste ECRANS de app/src/mesure.js).
  if p_page is null or p_page !~ '^(entree|accueil|matiere|theme|chapitre|favoris|badges|classe|moi|coach|revision|paquet|parent|bac-blanc|programme|grand-oral|coach-ia|fiches-photo|defi|express|formules|methodo|boutique|confidentialite|cgu|faq|guide|classement|amis|introuvable)$' then
    return;
  end if;
  insert into public.revizstmg_visites as v (jour, page, vues, visites)
  values ((now() at time zone 'Europe/Paris')::date, p_page, 1, case when p_visite then 1 else 0 end)
  on conflict (jour, page) do update set vues = v.vues + 1, visites = v.visites + excluded.visites;
end
$$;

revoke all on function public.revizstmg_compter_vue(text, boolean) from public;
grant execute on function public.revizstmg_compter_vue(text, boolean) to anon, authenticated;

-- ---- 2. Statistiques du matin ----
create or replace function public.revizstmg_statistiques()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with j as (select (now() at time zone 'Europe/Paris')::date as aujourdhui)
  select jsonb_build_object(
    'comptes', (select count(*) from public.profiles),
    'eleves', (select count(*) from public.profiles where role = 'eleve'),
    'profs', (select count(*) from public.profiles where role = 'prof'),
    'nouveaux_7j', (select count(*) from public.profiles where created_at > now() - interval '7 days'),
    'nouveaux_30j', (select count(*) from public.profiles where created_at > now() - interval '30 days'),
    'actifs_1j', (select count(*) from public.profiles where updated_at > now() - interval '1 day'),
    'actifs_7j', (select count(*) from public.profiles where updated_at > now() - interval '7 days'),
    'actifs_30j', (select count(*) from public.profiles where updated_at > now() - interval '30 days'),
    'niveaux', (select coalesce(jsonb_object_agg(k, n), '{}'::jsonb) from (select coalesce(nullif(level, ''), 'non renseigné') k, count(*) n from public.profiles where role = 'eleve' group by 1) x),
    'specialites', (select coalesce(jsonb_object_agg(k, n), '{}'::jsonb) from (select coalesce(nullif(specialty, ''), 'non renseignée') k, count(*) n from public.profiles where role = 'eleve' and level = 'terminale-stmg' group by 1) x),
    'classes', (select count(*) from public.teacher_class),
    'eleves_en_classe', (select count(distinct device_id) from public.class_member where role = 'eleve'),
    'quiz_de_classe', (select count(*) from public.class_quiz),
    'sessions_live', (select count(*) from public.live_session),
    'joueurs_amis', (select count(*) from public.friend_user),
    'defis_amis', (select count(*) from public.friend_duel),
    'defis_amis_7j', (select count(*) from public.friend_duel where created_at > now() - interval '7 days'),
    'suivis_parents', (select count(*) from public.child_stats),
    'suivis_parents_actifs_7j', (select count(*) from public.child_stats where last_active > now() - interval '7 days'),
    -- Mesure d'audience : la veille, et les 7 derniers jours complets.
    'visites_hier', (select coalesce(sum(visites), 0) from public.revizstmg_visites, j where jour = j.aujourdhui - 1),
    'vues_hier', (select coalesce(sum(vues), 0) from public.revizstmg_visites, j where jour = j.aujourdhui - 1),
    'visites_7j', (select coalesce(sum(visites), 0) from public.revizstmg_visites, j where jour between j.aujourdhui - 7 and j.aujourdhui - 1),
    'vues_7j', (select coalesce(sum(vues), 0) from public.revizstmg_visites, j where jour between j.aujourdhui - 7 and j.aujourdhui - 1),
    'ecrans_7j', (select coalesce(jsonb_object_agg(page, n), '{}'::jsonb) from (select page, sum(vues) n from public.revizstmg_visites, j where jour between j.aujourdhui - 7 and j.aujourdhui - 1 group by page) x)
  )
$$;

revoke all on function public.revizstmg_statistiques() from public;
grant execute on function public.revizstmg_statistiques() to anon, authenticated;
