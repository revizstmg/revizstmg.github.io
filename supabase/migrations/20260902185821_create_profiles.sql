create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'eleve' check (role in ('eleve','prof')),
  name text not null default '',
  email text,
  class_code text,
  level text,
  specialty text,
  photo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_name_len check (char_length(name) <= 60),
  constraint profiles_class_len check (class_code is null or char_length(class_code) <= 24),
  constraint profiles_photo_len check (photo is null or char_length(photo) <= 40000)
);

alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert to authenticated with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);