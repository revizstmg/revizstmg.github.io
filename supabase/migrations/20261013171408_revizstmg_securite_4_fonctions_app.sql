-- RévizSTMG : règles d'accès des tables sociales, partie 4 (voir partie 1).

-- ---------------------------------------------------------------------------
-- 9. Fonctions appelées par l'application (API /rest/v1/rpc/…)
-- ---------------------------------------------------------------------------

-- Classe d'un professeur, à partir de son code (pour la rejoindre).
create or replace function public.revizstmg_classe(p_code text)
returns table (code text, label text, owner_name text, subject text)
language sql stable security definer set search_path = '' as $$
  select t.code, t.label, t.owner_name, t.subject from public.teacher_class t where t.code = p_code limit 1
$$;

-- Ligue entre les classes d'un même professeur (cours de la semaine).
create or replace function public.revizstmg_ligue_classe(p_code text, p_semaine text)
returns table (class_code text, label text, total bigint, members bigint)
language sql stable security definer set search_path = '' as $$
  with moi as (select revizstmg_prive.est_membre(p_code) as ok),
  soeurs as (
    select t.code, t.label from public.teacher_class t
    where t.owner_id = (select t2.owner_id from public.teacher_class t2 where t2.code = p_code)
      and (select ok from moi)
  )
  select case when s.code = p_code then s.code else left(s.code, 6) || '•••' end,
         coalesce(nullif(s.label, ''), left(s.code, 6) || '•••'),
         coalesce(sum(m.courses_week) filter (where m.role <> 'prof'), 0),
         count(m.device_id) filter (where m.role <> 'prof')
  from soeurs s
  left join public.class_member m on m.class_code = s.code and m.week = p_semaine
  group by s.code, s.label
  having (select count(*) from soeurs) > 1
  order by 3 desc, 4 desc
$$;

-- Ligue de toutes les classes : totaux seulement, codes masqués sauf les siens.
create or replace function public.revizstmg_ligue(p_semaine text)
returns table (code text, members bigint, total bigint)
language sql stable security definer set search_path = '' as $$
  select revizstmg_prive.code_visible(l.class_code), count(distinct l.device_id), coalesce(sum(greatest(l.courses, 0)), 0)
  from public.leaderboard l
  where l.week = p_semaine
  group by l.class_code
  order by 3 desc
  limit 200
$$;

-- Fiche ami correspondant exactement à un code ami.
create or replace function public.revizstmg_trouver_ami(p_code text)
returns table (device_id text, code text, name text, photo text, xp integer, streak integer, courses_week integer)
language sql stable security definer set search_path = '' as $$
  select f.device_id, f.code, f.name, f.photo, f.xp, f.streak, f.courses_week
  from public.friend_user f where char_length(p_code) >= 4 and f.code = p_code limit 1
$$;

-- Espace parent : les statistiques de l'enfant dont on a le code (sans compte).
create or replace function public.revizstmg_stats_enfant(p_code text)
returns table (code text, name text, xp integer, level integer, streak integer, courses_week integer,
  weekly_goal integer, total_time integer, bac_date text, badges integer, track text, subjects jsonb,
  last_active timestamptz, updated_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select c.code, c.name, c.xp, c.level, c.streak, c.courses_week, c.weekly_goal, c.total_time, c.bac_date,
         c.badges, c.track, c.subjects, c.last_active, c.updated_at
  from public.child_stats c where char_length(p_code) >= 4 and c.code = p_code
  order by c.updated_at desc limit 1
$$;

revoke all on function public.revizstmg_classe(text), public.revizstmg_ligue_classe(text, text),
  public.revizstmg_ligue(text), public.revizstmg_trouver_ami(text), public.revizstmg_stats_enfant(text) from public, anon;
grant execute on function public.revizstmg_classe(text), public.revizstmg_ligue_classe(text, text),
  public.revizstmg_ligue(text), public.revizstmg_trouver_ami(text), public.revizstmg_stats_enfant(text) to authenticated;
grant execute on function public.revizstmg_stats_enfant(text) to anon;
