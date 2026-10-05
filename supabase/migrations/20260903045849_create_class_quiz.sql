-- QCM de classe créés par les professeurs, joués par les élèves d'une classe.
create table if not exists public.class_quiz (
  id uuid primary key default gen_random_uuid(),
  class_code text not null check (char_length(class_code) between 2 and 24),
  author_id uuid,
  author_name text not null default '' check (char_length(author_name) <= 60),
  title text not null default '' check (char_length(title) <= 120),
  questions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists class_quiz_code_idx on public.class_quiz (class_code, created_at desc);
alter table public.class_quiz enable row level security;
drop policy if exists class_quiz_select on public.class_quiz;
drop policy if exists class_quiz_insert on public.class_quiz;
drop policy if exists class_quiz_delete on public.class_quiz;
create policy class_quiz_select on public.class_quiz for select using (true);
create policy class_quiz_insert on public.class_quiz for insert with check (true);
create policy class_quiz_delete on public.class_quiz for delete using (true);

-- Résultats des élèves à un QCM de classe (un score par appareil et par QCM).
create table if not exists public.class_quiz_result (
  quiz_id uuid not null references public.class_quiz(id) on delete cascade,
  device_id text not null,
  name text not null default '' check (char_length(name) <= 40),
  score int not null default 0 check (score >= 0 and score <= 1000),
  total int not null default 0 check (total >= 0 and total <= 1000),
  updated_at timestamptz not null default now(),
  primary key (quiz_id, device_id)
);
create index if not exists class_quiz_result_quiz_idx on public.class_quiz_result (quiz_id, score desc);
alter table public.class_quiz_result enable row level security;
drop policy if exists cqr_select on public.class_quiz_result;
drop policy if exists cqr_insert on public.class_quiz_result;
drop policy if exists cqr_update on public.class_quiz_result;
create policy cqr_select on public.class_quiz_result for select using (true);
create policy cqr_insert on public.class_quiz_result for insert with check (true);
create policy cqr_update on public.class_quiz_result for update using (true) with check (true);