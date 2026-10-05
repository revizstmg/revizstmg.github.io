-- Duels de révision entre amis : le challenger choisit un thème et joue ;
-- l'adversaire joue LES MÊMES questions (figées dans `questions`), puis les
-- scores sont comparés. Anonyme par appareil, comme le reste du social.
create table if not exists public.friend_duel (
  id            uuid primary key default gen_random_uuid(),
  a_device      text not null,
  a_name        text not null default '' check (char_length(a_name) <= 40),
  a_code        text not null default '',
  b_device      text not null,
  b_name        text not null default '' check (char_length(b_name) <= 40),
  theme_id      text not null default '',
  chapter_label text not null default '' check (char_length(chapter_label) <= 120),
  questions     jsonb not null default '[]'::jsonb,
  a_score       integer not null default 0 check (a_score >= 0 and a_score <= 1000),
  a_total       integer not null default 0 check (a_total >= 0 and a_total <= 1000),
  b_score       integer check (b_score is null or (b_score >= 0 and b_score <= 1000)),
  b_total       integer check (b_total is null or (b_total >= 0 and b_total <= 1000)),
  status        text not null default 'open' check (status in ('open','done')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists friend_duel_b_idx on public.friend_duel (b_device, status);
create index if not exists friend_duel_a_idx on public.friend_duel (a_device, status);

alter table public.friend_duel enable row level security;
create policy friend_duel_select on public.friend_duel for select to anon, authenticated using (true);
create policy friend_duel_insert on public.friend_duel for insert to anon, authenticated with check (true);
create policy friend_duel_update on public.friend_duel for update to anon, authenticated using (true) with check (true);
create policy friend_duel_delete on public.friend_duel for delete to anon, authenticated using (true);
