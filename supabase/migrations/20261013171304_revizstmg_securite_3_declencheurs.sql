-- RévizSTMG : règles d'accès des tables sociales, partie 3 (voir partie 1).

-- ---------------------------------------------------------------------------
-- 8. Déclencheurs : champs figés et limites d'envoi
-- ---------------------------------------------------------------------------

-- Mur : un membre ne change que les réactions d'un message qui n'est pas le
-- sien ; l'auteur peut aussi le marquer « résolu » ; seul le prof répond.
create or replace function revizstmg_prive.garde_mur() returns trigger
language plpgsql security definer set search_path = '' as $$
declare moi text := auth.uid()::text;
begin
  if new.class_code is distinct from old.class_code or new.device_id is distinct from old.device_id
     or new.created_at is distinct from old.created_at then
    raise exception 'Message : champ non modifiable.' using errcode = '42501';
  end if;
  if moi is null or revizstmg_prive.est_prof(old.class_code) then return new; end if;
  if new.answer is distinct from old.answer or new.answered_by is distinct from old.answered_by then
    raise exception 'Seul le professeur répond aux questions du mur.' using errcode = '42501';
  end if;
  if old.device_id <> moi and (new.text is distinct from old.text or new.name is distinct from old.name
     or new.kind is distinct from old.kind or new.is_anon is distinct from old.is_anon
     or new.chapter_label is distinct from old.chapter_label or new.resolved is distinct from old.resolved) then
    raise exception 'Seul l''auteur modifie son message.' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger revizstmg_garde_mur before update on public.class_wall
  for each row execute function revizstmg_prive.garde_mur();

-- Duel de classe : l'adversaire ne renseigne que sa partie d'un duel ouvert.
create or replace function revizstmg_prive.garde_duel_classe() returns trigger
language plpgsql security definer set search_path = '' as $$
declare moi text := auth.uid()::text;
begin
  if moi is null or revizstmg_prive.est_prof(old.class_code) then return new; end if;
  if new.class_code is distinct from old.class_code or new.quiz_id is distinct from old.quiz_id
     or new.quiz_title is distinct from old.quiz_title or new.created_at is distinct from old.created_at
     or new.challenger_device is distinct from old.challenger_device or new.challenger_name is distinct from old.challenger_name
     or new.challenger_score is distinct from old.challenger_score or new.challenger_total is distinct from old.challenger_total then
    raise exception 'Duel : champ non modifiable.' using errcode = '42501';
  end if;
  if old.challenger_device = moi or old.status <> 'open' or new.opponent_device <> moi then
    raise exception 'Duel : seul un adversaire peut relever un duel ouvert.' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger revizstmg_garde_duel_classe before update on public.class_duel
  for each row execute function revizstmg_prive.garde_duel_classe();

-- Demande d'ami : seul le destinataire l'accepte ou la refuse.
create or replace function revizstmg_prive.garde_demande_ami() returns trigger
language plpgsql security definer set search_path = '' as $$
declare moi text := auth.uid()::text;
begin
  if new.from_device is distinct from old.from_device or new.to_device is distinct from old.to_device
     or new.created_at is distinct from old.created_at then
    raise exception 'Demande : champ non modifiable.' using errcode = '42501';
  end if;
  if moi is not null and new.status is distinct from old.status and old.to_device <> moi then
    raise exception 'Seul le destinataire répond à une demande.' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger revizstmg_garde_demande_ami before update on public.friend_request
  for each row execute function revizstmg_prive.garde_demande_ami();

-- Duel entre amis : chacun ne renseigne que son score ; seul l'invité accepte ;
-- le duel n'est « terminé » que quand les deux ont joué.
create or replace function revizstmg_prive.garde_duel_ami() returns trigger
language plpgsql security definer set search_path = '' as $$
declare moi text := auth.uid()::text;
begin
  if new.a_device is distinct from old.a_device or new.b_device is distinct from old.b_device
     or new.a_code is distinct from old.a_code or new.a_name is distinct from old.a_name or new.b_name is distinct from old.b_name
     or new.questions is distinct from old.questions or new.theme_id is distinct from old.theme_id
     or new.chapter_label is distinct from old.chapter_label or new.created_at is distinct from old.created_at then
    raise exception 'Duel : champ non modifiable.' using errcode = '42501';
  end if;
  if moi is null then return new; end if;
  if moi = old.a_device and (new.b_score is distinct from old.b_score or new.b_total is distinct from old.b_total
     or new.b_done is distinct from old.b_done) then
    raise exception 'Duel : tu ne peux pas modifier le score de ton ami.' using errcode = '42501';
  end if;
  if moi = old.b_device and (new.a_score is distinct from old.a_score or new.a_total is distinct from old.a_total
     or new.a_done is distinct from old.a_done) then
    raise exception 'Duel : tu ne peux pas modifier le score de ton ami.' using errcode = '42501';
  end if;
  if new.status is distinct from old.status then
    if not ((old.status = 'pending' and new.status = 'live' and moi = old.b_device)
         or (old.status = 'live' and new.status = 'done' and new.a_done and new.b_done)) then
      raise exception 'Duel : changement d''état non autorisé.' using errcode = '42501';
    end if;
  end if;
  return new;
end $$;
create trigger revizstmg_garde_duel_ami before update on public.friend_duel
  for each row execute function revizstmg_prive.garde_duel_ami();

-- Codes ami et parent : un code donné reste le même (même depuis un autre appareil).
create or replace function revizstmg_prive.garde_code() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.code := old.code;
  return new;
end $$;
create trigger revizstmg_garde_code before update on public.friend_user
  for each row execute function revizstmg_prive.garde_code();
create trigger revizstmg_garde_code before update on public.child_stats
  for each row execute function revizstmg_prive.garde_code();

-- Limites d'envoi (anti-spam côté serveur).
create or replace function revizstmg_prive.limite_mur() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform revizstmg_prive.trop_d_envois((select count(*) from public.class_wall w
    where w.device_id = new.device_id and w.created_at > now() - interval '15 seconds'), 1, 'mur de la classe');
  perform revizstmg_prive.trop_d_envois((select count(*) from public.class_wall w
    where w.device_id = new.device_id and w.created_at > now() - interval '10 minutes'), 20, 'mur de la classe');
  return new;
end $$;
create trigger revizstmg_limite_mur before insert on public.class_wall
  for each row execute function revizstmg_prive.limite_mur();

create or replace function revizstmg_prive.limite_demandes_ami() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform revizstmg_prive.trop_d_envois((select count(*) from public.friend_request r
    where r.from_device = new.from_device and r.created_at > now() - interval '1 hour'), 20, 'demandes d''ami');
  return new;
end $$;
create trigger revizstmg_limite_demandes_ami before insert on public.friend_request
  for each row execute function revizstmg_prive.limite_demandes_ami();

create or replace function revizstmg_prive.limite_duels_ami() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform revizstmg_prive.trop_d_envois((select count(*) from public.friend_duel d
    where d.a_device = new.a_device and d.created_at > now() - interval '1 hour'), 30, 'duels');
  return new;
end $$;
create trigger revizstmg_limite_duels_ami before insert on public.friend_duel
  for each row execute function revizstmg_prive.limite_duels_ami();

create or replace function revizstmg_prive.limite_duels_classe() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform revizstmg_prive.trop_d_envois((select count(*) from public.class_duel d
    where d.challenger_device = new.challenger_device and d.created_at > now() - interval '1 hour'), 30, 'duels');
  return new;
end $$;
create trigger revizstmg_limite_duels_classe before insert on public.class_duel
  for each row execute function revizstmg_prive.limite_duels_classe();

create or replace function revizstmg_prive.limite_quiz() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform revizstmg_prive.trop_d_envois((select count(*) from public.class_quiz q
    where q.class_code = new.class_code and q.created_at > now() - interval '1 hour'), 30, 'QCM de la classe');
  return new;
end $$;
create trigger revizstmg_limite_quiz before insert on public.class_quiz
  for each row execute function revizstmg_prive.limite_quiz();

create or replace function revizstmg_prive.limite_classes_prof() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform revizstmg_prive.trop_d_envois((select count(*) from public.teacher_class t
    where t.owner_id = new.owner_id), 30, 'classes');
  return new;
end $$;
create trigger revizstmg_limite_classes_prof before insert on public.teacher_class
  for each row execute function revizstmg_prive.limite_classes_prof();

revoke all on all functions in schema revizstmg_prive from public;
grant execute on all functions in schema revizstmg_prive to authenticated;

-- Tailles maximales (les lignes déjà présentes ne sont pas revérifiées).
alter table public.class_wall add constraint revizstmg_mur_tailles check (
  char_length(text) <= 1000 and char_length(name) <= 60 and char_length(answer) <= 1000
  and char_length(chapter_label) <= 160 and pg_column_size(reactions) <= 4000) not valid;
alter table public.class_member add constraint revizstmg_membre_tailles check (
  char_length(name) <= 60 and (photo is null or char_length(photo) <= 40000) and pg_column_size(subjects) <= 20000) not valid;
alter table public.class_meta add constraint revizstmg_meta_tailles check (
  char_length(announcement) <= 1000 and char_length(blason_name) <= 60) not valid;
alter table public.class_quiz add constraint revizstmg_quiz_tailles check (
  char_length(title) <= 160 and pg_column_size(questions) <= 200000) not valid;
alter table public.live_session add constraint revizstmg_direct_tailles check (
  char_length(title) <= 160 and pg_column_size(questions) <= 200000) not valid;
alter table public.live_player add constraint revizstmg_joueur_tailles check (
  char_length(name) <= 60 and (photo is null or char_length(photo) <= 40000) and pg_column_size(answers) <= 20000) not valid;
alter table public.leaderboard add constraint revizstmg_classement_tailles check (
  char_length(name) <= 60 and (photo is null or char_length(photo) <= 40000)) not valid;
alter table public.friend_user add constraint revizstmg_ami_tailles check (
  char_length(name) <= 60 and (photo is null or char_length(photo) <= 40000) and char_length(code) between 4 and 12) not valid;
alter table public.friend_duel add constraint revizstmg_duel_ami_tailles check (pg_column_size(questions) <= 200000) not valid;
alter table public.child_stats add constraint revizstmg_parent_tailles check (
  char_length(code) between 4 and 12 and pg_column_size(subjects) <= 20000) not valid;

