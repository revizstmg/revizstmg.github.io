-- Mode Direct (type Kahoot) : le prof anime une session, les élèves suivent
-- en temps réel (synchronisation par sondage court, sur l'API REST publique).
create table if not exists public.live_session (
  id uuid primary key default gen_random_uuid(),
  class_code text not null check (char_length(class_code) between 2 and 24),
  title text not null default '' check (char_length(title) <= 120),
  questions jsonb not null default '[]'::jsonb,
  phase text not null default 'lobby' check (phase in ('lobby','question','reveal','ended')),
  current_index int not null default 0 check (current_index >= 0 and current_index <= 100),
  host_device text not null default '',
  host_name text not null default '' check (char_length(host_name) <= 60),
  q_started_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists live_session_code_idx on public.live_session (class_code, created_at desc);
alter table public.live_session enable row level security;
drop policy if exists ls_select on public.live_session;
drop policy if exists ls_insert on public.live_session;
drop policy if exists ls_update on public.live_session;
drop policy if exists ls_delete on public.live_session;
create policy ls_select on public.live_session for select using (true);
create policy ls_insert on public.live_session for insert with check (true);
create policy ls_update on public.live_session for update using (true) with check (true);
create policy ls_delete on public.live_session for delete using (true);

create table if not exists public.live_player (
  session_id uuid not null references public.live_session(id) on delete cascade,
  device_id text not null,
  name text not null default '' check (char_length(name) <= 40),
  photo text check (photo is null or char_length(photo) <= 40000),
  score int not null default 0 check (score >= 0 and score <= 1000000),
  answers jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (session_id, device_id)
);
create index if not exists live_player_session_idx on public.live_player (session_id, score desc);
alter table public.live_player enable row level security;
drop policy if exists lp_select on public.live_player;
drop policy if exists lp_insert on public.live_player;
drop policy if exists lp_update on public.live_player;
create policy lp_select on public.live_player for select using (true);
create policy lp_insert on public.live_player for insert with check (true);
create policy lp_update on public.live_player for update using (true) with check (true);