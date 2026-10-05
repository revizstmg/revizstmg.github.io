-- Instantané de chaque élève dans une classe (classements, podium, heatmap, groupes).
create table if not exists public.class_member (
  class_code text not null check (char_length(class_code) between 2 and 24),
  device_id text not null,
  name text not null default '' check (char_length(name) <= 40),
  photo text check (photo is null or char_length(photo) <= 40000),
  role text not null default 'eleve' check (role in ('eleve','prof')),
  group_id uuid,
  xp int not null default 0 check (xp >= 0 and xp <= 100000000),
  streak int not null default 0 check (streak >= 0 and streak <= 100000),
  courses_week int not null default 0 check (courses_week >= 0 and courses_week <= 1000),
  week text not null default '',
  active_day text not null default '',
  subjects jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (class_code, device_id)
);
create index if not exists class_member_code_idx on public.class_member (class_code);
alter table public.class_member enable row level security;
drop policy if exists cm_select on public.class_member;
drop policy if exists cm_insert on public.class_member;
drop policy if exists cm_update on public.class_member;
create policy cm_select on public.class_member for select using (true);
create policy cm_insert on public.class_member for insert with check (true);
create policy cm_update on public.class_member for update using (true) with check (true);

-- Petits groupes créés par le prof pour des compétitions internes à la classe.
create table if not exists public.class_group (
  id uuid primary key default gen_random_uuid(),
  class_code text not null check (char_length(class_code) between 2 and 24),
  name text not null default '' check (char_length(name) <= 40),
  color text not null default '',
  emoji text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists class_group_code_idx on public.class_group (class_code);
alter table public.class_group enable row level security;
drop policy if exists cg_select on public.class_group;
drop policy if exists cg_insert on public.class_group;
drop policy if exists cg_update on public.class_group;
drop policy if exists cg_delete on public.class_group;
create policy cg_select on public.class_group for select using (true);
create policy cg_insert on public.class_group for insert with check (true);
create policy cg_update on public.class_group for update using (true) with check (true);
create policy cg_delete on public.class_group for delete using (true);

-- Réglages / identité de la classe : blason, objectif collectif, annonce, défi.
create table if not exists public.class_meta (
  class_code text primary key check (char_length(class_code) between 2 and 24),
  blason_name text not null default '' check (char_length(blason_name) <= 40),
  blason_color text not null default '',
  blason_emoji text not null default '',
  goal_target int not null default 0 check (goal_target >= 0 and goal_target <= 100000),
  announcement text not null default '' check (char_length(announcement) <= 500),
  announcement_by text not null default '',
  announcement_at timestamptz,
  challenge_chapter text not null default '',
  challenge_label text not null default '' check (char_length(challenge_label) <= 120),
  updated_at timestamptz not null default now()
);
alter table public.class_meta enable row level security;
drop policy if exists meta_select on public.class_meta;
drop policy if exists meta_insert on public.class_meta;
drop policy if exists meta_update on public.class_meta;
create policy meta_select on public.class_meta for select using (true);
create policy meta_insert on public.class_meta for insert with check (true);
create policy meta_update on public.class_meta for update using (true) with check (true);

-- Mur de la classe : annonces du prof, questions, entraide (SOS chapitre), cas.
create table if not exists public.class_wall (
  id uuid primary key default gen_random_uuid(),
  class_code text not null check (char_length(class_code) between 2 and 24),
  device_id text not null default '',
  name text not null default '' check (char_length(name) <= 40),
  kind text not null default 'question' check (kind in ('announce','question','sos','case')),
  text text not null default '' check (char_length(text) <= 1000),
  chapter_label text not null default '' check (char_length(chapter_label) <= 120),
  answer text not null default '' check (char_length(answer) <= 1000),
  answered_by text not null default '',
  reactions jsonb not null default '{}'::jsonb,
  is_anon boolean not null default false,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists class_wall_code_idx on public.class_wall (class_code, created_at desc);
alter table public.class_wall enable row level security;
drop policy if exists wall_select on public.class_wall;
drop policy if exists wall_insert on public.class_wall;
drop policy if exists wall_update on public.class_wall;
drop policy if exists wall_delete on public.class_wall;
create policy wall_select on public.class_wall for select using (true);
create policy wall_insert on public.class_wall for insert with check (true);
create policy wall_update on public.class_wall for update using (true) with check (true);
create policy wall_delete on public.class_wall for delete using (true);

-- Duels 1 contre 1 entre camarades (asynchrone) sur un QCM de la classe.
create table if not exists public.class_duel (
  id uuid primary key default gen_random_uuid(),
  class_code text not null check (char_length(class_code) between 2 and 24),
  quiz_id uuid references public.class_quiz(id) on delete cascade,
  quiz_title text not null default '',
  challenger_device text not null default '',
  challenger_name text not null default '',
  challenger_score int not null default 0,
  challenger_total int not null default 0,
  opponent_device text not null default '',
  opponent_name text not null default '',
  opponent_score int,
  opponent_total int,
  status text not null default 'open' check (status in ('open','done')),
  created_at timestamptz not null default now()
);
create index if not exists class_duel_code_idx on public.class_duel (class_code, created_at desc);
alter table public.class_duel enable row level security;
drop policy if exists duel_select on public.class_duel;
drop policy if exists duel_insert on public.class_duel;
drop policy if exists duel_update on public.class_duel;
drop policy if exists duel_delete on public.class_duel;
create policy duel_select on public.class_duel for select using (true);
create policy duel_insert on public.class_duel for insert with check (true);
create policy duel_update on public.class_duel for update using (true) with check (true);
create policy duel_delete on public.class_duel for delete using (true);

-- QCM : statut (proposé par un élève / approuvé), auteur de la proposition, échéance (devoir).
alter table public.class_quiz add column if not exists status text not null default 'approved';
alter table public.class_quiz add column if not exists proposed_by text not null default '';
alter table public.class_quiz add column if not exists due_at timestamptz;