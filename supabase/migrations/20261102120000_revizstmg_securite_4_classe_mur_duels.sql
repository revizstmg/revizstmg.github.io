-- RévizSTMG : durcissement des règles d'accès (audit indépendant du 02/11/2026).
-- Migration additive et idempotente : aucune donnée n'est supprimée, sauf
--   * les lignes de classement des élèves déjà exclus de la classe (point 4) ;
--   * les lignes des classes d'un professeur qui supprime son compte (point 5).
--
--  1. Mur : seul le professeur change le genre (kind), le nom et l'anonymat d'un message.
--  2. Mur : l'identifiant de l'auteur d'un message anonyme n'est plus lisible
--     (fonction revizstmg_mur ; lecture directe de device_id fermée).
--  3. class_member : class_code et device_id sont figés.
--  4. Exclusion / départ : la ligne de classement est retirée ; lire le
--     classement d'une classe exige d'en être membre.
--  5. Suppression du compte d'un professeur : ses classes sont vidées.
--  6. Duels et demandes d'ami : état de départ imposé, nom de l'émetteur fixé par le serveur.

-- ---------------------------------------------------------------------------
-- 1. Mur : champs réservés au professeur
-- ---------------------------------------------------------------------------
create or replace function revizstmg_prive.garde_mur() returns trigger
language plpgsql security definer set search_path = '' as $$
declare moi text := auth.uid()::text;
begin
  if new.class_code is distinct from old.class_code or new.device_id is distinct from old.device_id
     or new.created_at is distinct from old.created_at then
    raise exception 'Message : champ non modifiable.' using errcode = '42501';
  end if;
  if moi is null or revizstmg_prive.est_prof(old.class_code) then return new; end if;
  -- Genre, nom affiché et anonymat sont figés pour tout non-professeur, auteur compris
  -- (sinon un élève fabriquerait une « annonce » signée du professeur).
  if new.kind is distinct from old.kind or new.name is distinct from old.name
     or new.is_anon is distinct from old.is_anon then
    raise exception 'Message : genre, nom et anonymat sont réservés au professeur.' using errcode = '42501';
  end if;
  if new.answer is distinct from old.answer or new.answered_by is distinct from old.answered_by then
    raise exception 'Seul le professeur répond aux questions du mur.' using errcode = '42501';
  end if;
  if old.device_id <> moi and (new.text is distinct from old.text
     or new.chapter_label is distinct from old.chapter_label or new.resolved is distinct from old.resolved) then
    raise exception 'Seul l''auteur modifie son message.' using errcode = '42501';
  end if;
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Mur : anonymat réel
-- ---------------------------------------------------------------------------
-- Lecture du mur par les membres : device_id est masqué (NULL) pour les messages
-- anonymes, sauf à leur auteur et au professeur de la classe.
create or replace function public.revizstmg_mur(p_code text)
returns table (id uuid, class_code text, device_id text, name text, kind text, text text,
  chapter_label text, answer text, answered_by text, reactions jsonb, is_anon boolean,
  resolved boolean, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select w.id, w.class_code,
         case when w.is_anon and w.device_id <> coalesce(auth.uid()::text, '')
                   and not revizstmg_prive.est_prof(w.class_code) then null else w.device_id end,
         w.name, w.kind, w.text, w.chapter_label, w.answer, w.answered_by, w.reactions,
         w.is_anon, w.resolved, w.created_at
  from public.class_wall w
  where w.class_code = p_code and revizstmg_prive.est_membre(p_code)
  order by w.created_at desc limit 100
$$;
revoke all on function public.revizstmg_mur(text) from public, anon;
grant execute on function public.revizstmg_mur(text) to authenticated;

-- La lecture directe de device_id est fermée (les autres colonnes restent lisibles).
-- Les règles de ligne (suppression de son propre message…) continuent de s'appliquer.
revoke select on public.class_wall from authenticated;
grant select (id, class_code, name, kind, text, chapter_label, answer, answered_by, reactions,
  is_anon, resolved, created_at) on public.class_wall to authenticated;

-- ---------------------------------------------------------------------------
-- 3. class_member : classe et compte figés
-- ---------------------------------------------------------------------------
create or replace function revizstmg_prive.garde_membre() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.class_code is distinct from old.class_code or new.device_id is distinct from old.device_id then
    raise exception 'Membre : classe et compte non modifiables.' using errcode = '42501';
  end if;
  return new;
end $$;
drop trigger if exists revizstmg_garde_membre on public.class_member;
create trigger revizstmg_garde_membre before update on public.class_member
  for each row execute function revizstmg_prive.garde_membre();

-- ---------------------------------------------------------------------------
-- 4. Exclusion, départ et classement
-- ---------------------------------------------------------------------------
create or replace function revizstmg_prive.retirer_classement() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_table_name = 'class_ban' then
    delete from public.leaderboard where class_code = new.class_code and device_id = new.device_id;
    return new;
  end if;
  delete from public.leaderboard where class_code = old.class_code and device_id = old.device_id;
  return old;
end $$;
drop trigger if exists revizstmg_retirer_classement on public.class_ban;
create trigger revizstmg_retirer_classement after insert on public.class_ban
  for each row execute function revizstmg_prive.retirer_classement();
drop trigger if exists revizstmg_retirer_classement on public.class_member;
create trigger revizstmg_retirer_classement after delete on public.class_member
  for each row execute function revizstmg_prive.retirer_classement();

-- Élèves déjà exclus : leur ligne de classement dans la classe disparaît aussi.
delete from public.leaderboard l using public.class_ban b
  where l.class_code = b.class_code and l.device_id = b.device_id;

-- Voir un classement (et un code de classe en clair) exige d'être membre.
create or replace function revizstmg_prive.voit_classement(p_code text) returns boolean
language sql stable security definer set search_path = '' as $$
  select revizstmg_prive.est_membre(p_code)
$$;
drop policy if exists lb_lire on public.leaderboard;
create policy lb_lire on public.leaderboard for select to authenticated
  using (device_id = (select auth.uid())::text or revizstmg_prive.est_membre(class_code));

-- ---------------------------------------------------------------------------
-- 5. Suppression du compte (professeur : ses classes sont vidées)
-- ---------------------------------------------------------------------------
create or replace function public.revizstmg_supprimer_compte() returns void
language plpgsql security definer set search_path = '' as $$
declare
  moi uuid := auth.uid();
  moi_txt text := auth.uid()::text;
  mes_classes text[];
begin
  if moi is null then
    raise exception 'Connexion requise.' using errcode = '42501';
  end if;
  select coalesce(array_agg(t.code), '{}') into mes_classes from public.teacher_class t where t.owner_id = moi;
  -- Classes dont il est propriétaire : tout ce qu'elles contiennent (les résultats
  -- de QCM et les joueurs du direct suivent en cascade).
  delete from public.class_quiz where class_code = any (mes_classes);
  delete from public.live_session where class_code = any (mes_classes);
  delete from public.class_wall where class_code = any (mes_classes);
  delete from public.class_duel where class_code = any (mes_classes);
  delete from public.leaderboard where class_code = any (mes_classes);
  delete from public.class_member where class_code = any (mes_classes);
  -- Espaces partagés : classe, direct, classement, amis, parent.
  delete from public.class_member where device_id = moi_txt;
  delete from public.class_quiz_result where device_id = moi_txt;
  delete from public.class_wall where device_id = moi_txt;
  delete from public.class_duel where challenger_device = moi_txt or opponent_device = moi_txt;
  delete from public.class_ban where device_id = moi_txt;
  delete from public.live_player where device_id = moi_txt;
  delete from public.leaderboard where device_id = moi_txt;
  delete from public.friend_user where device_id = moi_txt;
  delete from public.friend_request where from_device = moi_txt or to_device = moi_txt;
  delete from public.friend_duel where a_device = moi_txt or b_device = moi_txt;
  delete from public.child_stats where device_id = moi_txt;
  -- Professeur : ses QCM, ses sessions en direct, les réglages et groupes de ses
  -- classes, puis ses classes.
  delete from public.class_quiz where author_id = moi;
  delete from public.live_session where host_device = moi_txt;
  delete from public.class_group where class_code = any (mes_classes);
  delete from public.class_meta where class_code = any (mes_classes);
  delete from public.class_ban where class_code = any (mes_classes);
  delete from public.teacher_class where owner_id = moi;
  -- Ce que l'élève a envoyé : signalements d'erreur, abonnements aux rappels.
  delete from public.revizstmg_signalements where auteur = moi;
  delete from revizstmg_prive.abonnements_push where compte = moi;
  -- Traces de connexion gardées à part par Supabase.
  begin
    delete from auth.refresh_tokens where user_id = moi_txt;
  exception when others then null;
  end;
  begin
    delete from auth.audit_log_entries where payload ->> 'actor_id' = moi_txt;
  exception when others then null;
  end;
  delete from public.profiles where profiles.id = moi;
  delete from auth.users where users.id = moi;
end $$;
revoke all on function public.revizstmg_supprimer_compte() from public, anon;
grant execute on function public.revizstmg_supprimer_compte() to authenticated;

-- ---------------------------------------------------------------------------
-- 6. Duels et demandes d'ami : état de départ imposé
-- ---------------------------------------------------------------------------
drop policy if exists fd_ajouter on public.friend_duel;
create policy fd_ajouter on public.friend_duel for insert to authenticated
  with check (a_device = (select auth.uid())::text and b_device <> a_device
    and revizstmg_prive.est_ami(b_device)
    and status = 'pending' and a_done = false and b_done = false
    and a_score = 0 and a_total = 0 and b_score is null and b_total is null);

drop policy if exists duel_ajouter on public.class_duel;
create policy duel_ajouter on public.class_duel for insert to authenticated
  with check (challenger_device = (select auth.uid())::text and revizstmg_prive.est_membre(class_code)
    and status = 'open' and coalesce(opponent_device, '') = '' and opponent_score is null and opponent_total is null);

-- Le nom (et le code) de l'émetteur sont ceux du serveur : celui de sa fiche ami,
-- à défaut celui de son profil ; sans aucune de ces données, la valeur envoyée est gardée.
create or replace function revizstmg_prive.identite_emetteur() returns trigger
language plpgsql security definer set search_path = '' as $$
declare nom text; code text;
begin
  if tg_table_name = 'friend_request' then
    select f.name, f.code into nom, code from public.friend_user f where f.device_id = new.from_device;
    if nom is null then select p.name into nom from public.profiles p where p.id::text = new.from_device; end if;
    if nom is not null and nom <> '' then new.from_name := left(nom, 40); end if;
    if code is not null then new.from_code := code; end if;
  else
    select f.name, f.code into nom, code from public.friend_user f where f.device_id = new.a_device;
    if nom is null then select p.name into nom from public.profiles p where p.id::text = new.a_device; end if;
    if nom is not null and nom <> '' then new.a_name := left(nom, 40); end if;
    if code is not null then new.a_code := code; end if;
  end if;
  return new;
end $$;
drop trigger if exists revizstmg_identite_emetteur on public.friend_request;
create trigger revizstmg_identite_emetteur before insert on public.friend_request
  for each row execute function revizstmg_prive.identite_emetteur();
drop trigger if exists revizstmg_identite_emetteur on public.friend_duel;
create trigger revizstmg_identite_emetteur before insert on public.friend_duel
  for each row execute function revizstmg_prive.identite_emetteur();

revoke all on all functions in schema revizstmg_prive from public;
grant execute on all functions in schema revizstmg_prive to authenticated;
