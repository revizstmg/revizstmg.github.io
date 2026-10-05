-- Duel synchrone : invitation (pending) → acceptation (live) → chacun joue et
-- soumet son score (a_done/b_done) → terminé (done).
alter table public.friend_duel add column if not exists a_done boolean not null default false;
alter table public.friend_duel add column if not exists b_done boolean not null default false;
alter table public.friend_duel drop constraint if exists friend_duel_status_check;
alter table public.friend_duel add constraint friend_duel_status_check
  check (status in ('pending','live','done','open'));
