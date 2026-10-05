-- Classes d'un professeur : chaque classe a un CODE UNIQUE généré (non modifiable).
create table if not exists public.teacher_class (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (char_length(code) between 2 and 24),
  owner_id uuid,
  owner_name text not null default '' check (char_length(owner_name) <= 60),
  label text not null default '' check (char_length(label) <= 60),
  subject text not null default '' check (char_length(subject) <= 200),
  created_at timestamptz not null default now()
);
create index if not exists teacher_class_owner_idx on public.teacher_class (owner_id, created_at);
alter table public.teacher_class enable row level security;
drop policy if exists tc_select on public.teacher_class;
drop policy if exists tc_insert on public.teacher_class;
drop policy if exists tc_update on public.teacher_class;
drop policy if exists tc_delete on public.teacher_class;
create policy tc_select on public.teacher_class for select using (true);
create policy tc_insert on public.teacher_class for insert with check (true);
create policy tc_update on public.teacher_class for update using (true) with check (true);
create policy tc_delete on public.teacher_class for delete using (true);

-- Élèves exclus d'une classe par le prof (empêche la ré-inscription).
create table if not exists public.class_ban (
  class_code text not null check (char_length(class_code) between 2 and 24),
  device_id text not null,
  created_at timestamptz not null default now(),
  primary key (class_code, device_id)
);
alter table public.class_ban enable row level security;
drop policy if exists ban_select on public.class_ban;
drop policy if exists ban_insert on public.class_ban;
drop policy if exists ban_delete on public.class_ban;
create policy ban_select on public.class_ban for select using (true);
create policy ban_insert on public.class_ban for insert with check (true);
create policy ban_delete on public.class_ban for delete using (true);

-- Profil enseignant : ce qu'il enseigne + nombre de classes déclaré.
alter table public.profiles add column if not exists subjects text not null default '';
alter table public.profiles add column if not exists n_classes int not null default 0;