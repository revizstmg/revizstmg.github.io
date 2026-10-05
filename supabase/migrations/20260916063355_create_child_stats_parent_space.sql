-- Espace parent : instantané des stats de l'élève, lisible par le parent via un
-- code court partagé (même modèle « appareil + code » que friend_user).
create table if not exists public.child_stats (
  device_id   text primary key,
  code        text not null,
  name        text,
  xp          integer default 0,
  level       integer default 0,
  streak      integer default 0,
  courses_week integer default 0,
  weekly_goal integer default 0,
  total_time  integer default 0,
  bac_date    text,
  badges      integer default 0,
  track       text,
  subjects    jsonb default '[]'::jsonb,
  last_active timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists child_stats_code_idx on public.child_stats(code);

alter table public.child_stats enable row level security;

-- Accès anonyme, comme les autres tables sociales (protégé par le code partagé).
drop policy if exists child_stats_insert on public.child_stats;
create policy child_stats_insert on public.child_stats for insert to anon, authenticated with check (true);
drop policy if exists child_stats_select on public.child_stats;
create policy child_stats_select on public.child_stats for select to anon, authenticated using (true);
drop policy if exists child_stats_update on public.child_stats;
create policy child_stats_update on public.child_stats for update to anon, authenticated using (true) with check (true);
drop policy if exists child_stats_delete on public.child_stats;
create policy child_stats_delete on public.child_stats for delete to anon, authenticated using (true);