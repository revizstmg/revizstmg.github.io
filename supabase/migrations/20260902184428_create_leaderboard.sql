create table if not exists public.leaderboard (
  class_code text not null,
  device_id  text not null,
  week       text not null,
  name       text not null default '',
  photo      text,
  courses    integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (class_code, device_id, week),
  constraint leaderboard_class_len check (char_length(class_code) between 2 and 24),
  constraint leaderboard_name_len check (char_length(name) <= 40),
  constraint leaderboard_photo_len check (photo is null or char_length(photo) <= 40000),
  constraint leaderboard_courses_range check (courses between 0 and 1000)
);

create index if not exists leaderboard_class_week_idx on public.leaderboard (class_code, week, courses desc);

alter table public.leaderboard enable row level security;

drop policy if exists leaderboard_select on public.leaderboard;
create policy leaderboard_select on public.leaderboard for select to anon, authenticated using (true);

drop policy if exists leaderboard_insert on public.leaderboard;
create policy leaderboard_insert on public.leaderboard for insert to anon, authenticated with check (true);

drop policy if exists leaderboard_update on public.leaderboard;
create policy leaderboard_update on public.leaderboard for update to anon, authenticated using (true) with check (true);