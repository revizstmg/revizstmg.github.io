-- Annuaire des utilisateurs par « code ami » (device-based, comme les autres
-- fonctions sociales de RévizSTMG). Permet de retrouver un ami et d'afficher
-- ses stats à jour.
create table if not exists public.friend_user (
  device_id    text primary key,
  code         text not null,
  name         text not null default '' check (char_length(name) <= 40),
  photo        text check (photo is null or char_length(photo) <= 40000),
  xp           integer not null default 0 check (xp >= 0 and xp <= 100000000),
  streak       integer not null default 0 check (streak >= 0 and streak <= 100000),
  courses_week integer not null default 0 check (courses_week >= 0 and courses_week <= 1000),
  week         text not null default '',
  updated_at   timestamptz not null default now()
);
create index if not exists friend_user_code_idx on public.friend_user (code);

-- Demandes d'amitié mutuelles : from_device demande, to_device accepte/refuse.
create table if not exists public.friend_request (
  id          uuid primary key default gen_random_uuid(),
  from_device text not null,
  from_name   text not null default '' check (char_length(from_name) <= 40),
  from_code   text not null default '',
  to_device   text not null,
  to_name     text not null default '' check (char_length(to_name) <= 40),
  status      text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at  timestamptz not null default now(),
  unique (from_device, to_device)
);
create index if not exists friend_request_to_idx   on public.friend_request (to_device, status);
create index if not exists friend_request_from_idx on public.friend_request (from_device, status);

alter table public.friend_user    enable row level security;
alter table public.friend_request enable row level security;

-- Accès collaboratif (clé anon), identique aux autres tables « classe ».
create policy friend_user_select on public.friend_user for select to anon, authenticated using (true);
create policy friend_user_insert on public.friend_user for insert to anon, authenticated with check (true);
create policy friend_user_update on public.friend_user for update to anon, authenticated using (true) with check (true);

create policy friend_request_select on public.friend_request for select to anon, authenticated using (true);
create policy friend_request_insert on public.friend_request for insert to anon, authenticated with check (true);
create policy friend_request_update on public.friend_request for update to anon, authenticated using (true) with check (true);
create policy friend_request_delete on public.friend_request for delete to anon, authenticated using (true);
