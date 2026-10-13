-- RévizSTMG : à coller dans Supabase → SQL Editor → New query, puis « Run ».
-- Projet NAH-Lycee-Marceau (wyydagcjkbivtbuhbzon). Tout passe ou rien ne passe (transaction).
-- Contenu : 1) retrait de 9 lignes de test orphelines, 2) nouvelles règles d'accès des
-- tables sociales de RévizSTMG, 3) suppression complète du compte. Les tables de NAH ne sont pas touchées.

begin;

-- RévizSTMG : règles d'accès des tables sociales, partie 0 (voir partie 1).

-- ---------------------------------------------------------------------------
-- 0. Lignes de test d'avant les comptes : leurs identifiants d'appareil ne
--    correspondent à aucun compte, plus personne ne pourrait les lire ni les
--    effacer. On les retire (9 lignes au 13/10/2026).
-- ---------------------------------------------------------------------------
delete from public.class_member where device_id not in (select id::text from auth.users);
delete from public.class_quiz_result where device_id not in (select id::text from auth.users);
delete from public.class_wall where device_id not in (select id::text from auth.users);
delete from public.class_duel where challenger_device not in (select id::text from auth.users);
delete from public.class_ban where device_id not in (select id::text from auth.users);
delete from public.live_player where device_id not in (select id::text from auth.users);
delete from public.leaderboard where device_id not in (select id::text from auth.users);
delete from public.friend_user where device_id not in (select id::text from auth.users);
delete from public.friend_request where from_device not in (select id::text from auth.users) or to_device not in (select id::text from auth.users);
delete from public.friend_duel where a_device not in (select id::text from auth.users) or b_device not in (select id::text from auth.users);
delete from public.child_stats where device_id not in (select id::text from auth.users);


-- RévizSTMG : règles d'accès des tables sociales, partie 2 (voir partie 1).

-- ---------------------------------------------------------------------------
-- 2. Les anciennes règles (toutes « using (true) ») sont retirées.
-- ---------------------------------------------------------------------------
do $$
declare r record;
begin
  for r in
    select policyname, tablename from pg_policies
    where schemaname = 'public' and tablename in (
      'class_member', 'class_ban', 'class_group', 'class_meta', 'class_wall', 'class_quiz',
      'class_quiz_result', 'class_duel', 'live_session', 'live_player', 'teacher_class',
      'leaderboard', 'friend_user', 'friend_request', 'friend_duel', 'child_stats')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- La clé publique seule (anon) ne donne plus accès à ces tables.
revoke all on public.class_member, public.class_ban, public.class_group, public.class_meta,
  public.class_wall, public.class_quiz, public.class_quiz_result, public.class_duel,
  public.live_session, public.live_player, public.teacher_class, public.leaderboard,
  public.friend_user, public.friend_request, public.friend_duel, public.child_stats from anon;

-- ---------------------------------------------------------------------------
-- 3. Classe
-- ---------------------------------------------------------------------------
create policy cm_lire on public.class_member for select to authenticated
  using (device_id = (select auth.uid())::text or revizstmg_prive.est_membre(class_code));
create policy cm_ajouter on public.class_member for insert to authenticated
  with check (device_id = (select auth.uid())::text and not revizstmg_prive.est_exclu(class_code)
    and (role <> 'prof' or revizstmg_prive.est_prof(class_code)));
create policy cm_modifier on public.class_member for update to authenticated
  using (device_id = (select auth.uid())::text or revizstmg_prive.est_prof(class_code))
  with check ((device_id = (select auth.uid())::text or revizstmg_prive.est_prof(class_code))
    and (role <> 'prof' or revizstmg_prive.est_prof(class_code)));
create policy cm_supprimer on public.class_member for delete to authenticated
  using (device_id = (select auth.uid())::text or revizstmg_prive.est_prof(class_code));

create policy ban_lire on public.class_ban for select to authenticated
  using (device_id = (select auth.uid())::text or revizstmg_prive.est_prof(class_code));
create policy ban_ajouter on public.class_ban for insert to authenticated
  with check (revizstmg_prive.est_prof(class_code));
create policy ban_modifier on public.class_ban for update to authenticated
  using (revizstmg_prive.est_prof(class_code)) with check (revizstmg_prive.est_prof(class_code));
create policy ban_supprimer on public.class_ban for delete to authenticated
  using (revizstmg_prive.est_prof(class_code));

create policy cg_lire on public.class_group for select to authenticated using (revizstmg_prive.est_membre(class_code));
create policy cg_ajouter on public.class_group for insert to authenticated with check (revizstmg_prive.est_prof(class_code));
create policy cg_modifier on public.class_group for update to authenticated
  using (revizstmg_prive.est_prof(class_code)) with check (revizstmg_prive.est_prof(class_code));
create policy cg_supprimer on public.class_group for delete to authenticated using (revizstmg_prive.est_prof(class_code));

create policy meta_lire on public.class_meta for select to authenticated using (revizstmg_prive.est_membre(class_code));
create policy meta_ajouter on public.class_meta for insert to authenticated with check (revizstmg_prive.est_prof(class_code));
create policy meta_modifier on public.class_meta for update to authenticated
  using (revizstmg_prive.est_prof(class_code)) with check (revizstmg_prive.est_prof(class_code));
create policy meta_supprimer on public.class_meta for delete to authenticated using (revizstmg_prive.est_prof(class_code));

create policy mur_lire on public.class_wall for select to authenticated using (revizstmg_prive.est_membre(class_code));
create policy mur_ajouter on public.class_wall for insert to authenticated
  with check (device_id = (select auth.uid())::text and revizstmg_prive.est_membre(class_code)
    and (kind <> 'announce' or revizstmg_prive.est_prof(class_code)));
-- Réactions, réponse du prof, « résolu » : voir le déclencheur garde_mur.
create policy mur_modifier on public.class_wall for update to authenticated
  using (revizstmg_prive.est_membre(class_code)) with check (revizstmg_prive.est_membre(class_code));
create policy mur_supprimer on public.class_wall for delete to authenticated
  using (device_id = (select auth.uid())::text or revizstmg_prive.est_prof(class_code));

create policy quiz_lire on public.class_quiz for select to authenticated using (revizstmg_prive.est_membre(class_code));
create policy quiz_ajouter on public.class_quiz for insert to authenticated
  with check (revizstmg_prive.est_membre(class_code)
    and (author_id is null or author_id = (select auth.uid()))
    and (status = 'proposed' or revizstmg_prive.est_prof(class_code)));
create policy quiz_modifier on public.class_quiz for update to authenticated
  using (revizstmg_prive.est_prof(class_code)) with check (revizstmg_prive.est_prof(class_code));
create policy quiz_supprimer on public.class_quiz for delete to authenticated using (revizstmg_prive.est_prof(class_code));

create policy cqr_lire on public.class_quiz_result for select to authenticated
  using (revizstmg_prive.est_membre(revizstmg_prive.classe_du_quiz(quiz_id)));
create policy cqr_ajouter on public.class_quiz_result for insert to authenticated
  with check (device_id = (select auth.uid())::text and revizstmg_prive.est_membre(revizstmg_prive.classe_du_quiz(quiz_id)));
create policy cqr_modifier on public.class_quiz_result for update to authenticated
  using (device_id = (select auth.uid())::text)
  with check (device_id = (select auth.uid())::text and revizstmg_prive.est_membre(revizstmg_prive.classe_du_quiz(quiz_id)));
create policy cqr_supprimer on public.class_quiz_result for delete to authenticated
  using (device_id = (select auth.uid())::text or revizstmg_prive.est_prof(revizstmg_prive.classe_du_quiz(quiz_id)));

create policy duel_lire on public.class_duel for select to authenticated using (revizstmg_prive.est_membre(class_code));
create policy duel_ajouter on public.class_duel for insert to authenticated
  with check (challenger_device = (select auth.uid())::text and revizstmg_prive.est_membre(class_code));
-- Accepter un duel : voir le déclencheur garde_duel_classe.
create policy duel_modifier on public.class_duel for update to authenticated
  using (revizstmg_prive.est_membre(class_code)) with check (revizstmg_prive.est_membre(class_code));
create policy duel_supprimer on public.class_duel for delete to authenticated
  using (challenger_device = (select auth.uid())::text or revizstmg_prive.est_prof(class_code));

create policy tc_lire on public.teacher_class for select to authenticated using (owner_id = (select auth.uid()));
create policy tc_ajouter on public.teacher_class for insert to authenticated with check (owner_id = (select auth.uid()));
create policy tc_modifier on public.teacher_class for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy tc_supprimer on public.teacher_class for delete to authenticated using (owner_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- 4. Mode direct (animé par le professeur)
-- ---------------------------------------------------------------------------
create policy ls_lire on public.live_session for select to authenticated using (revizstmg_prive.est_membre(class_code));
create policy ls_ajouter on public.live_session for insert to authenticated
  with check (host_device = (select auth.uid())::text and revizstmg_prive.est_prof(class_code));
create policy ls_modifier on public.live_session for update to authenticated
  using (revizstmg_prive.est_prof(class_code)) with check (revizstmg_prive.est_prof(class_code));
create policy ls_supprimer on public.live_session for delete to authenticated using (revizstmg_prive.est_prof(class_code));

create policy lp_lire on public.live_player for select to authenticated
  using (revizstmg_prive.est_membre(revizstmg_prive.classe_du_direct(session_id)));
create policy lp_ajouter on public.live_player for insert to authenticated
  with check (device_id = (select auth.uid())::text and revizstmg_prive.est_membre(revizstmg_prive.classe_du_direct(session_id)));
create policy lp_modifier on public.live_player for update to authenticated
  using (device_id = (select auth.uid())::text)
  with check (device_id = (select auth.uid())::text and revizstmg_prive.est_membre(revizstmg_prive.classe_du_direct(session_id)));
create policy lp_supprimer on public.live_player for delete to authenticated
  using (device_id = (select auth.uid())::text or revizstmg_prive.est_prof(revizstmg_prive.classe_du_direct(session_id)));

-- ---------------------------------------------------------------------------
-- 5. Classement de la semaine (par code de classe)
-- ---------------------------------------------------------------------------
create policy lb_lire on public.leaderboard for select to authenticated
  using (device_id = (select auth.uid())::text or revizstmg_prive.voit_classement(class_code));
create policy lb_ajouter on public.leaderboard for insert to authenticated
  with check (device_id = (select auth.uid())::text and not revizstmg_prive.est_exclu(class_code));
create policy lb_modifier on public.leaderboard for update to authenticated
  using (device_id = (select auth.uid())::text) with check (device_id = (select auth.uid())::text);
create policy lb_supprimer on public.leaderboard for delete to authenticated using (device_id = (select auth.uid())::text);

-- ---------------------------------------------------------------------------
-- 6. Amis, demandes et duels entre amis
-- ---------------------------------------------------------------------------
create policy fu_lire on public.friend_user for select to authenticated
  using (device_id = (select auth.uid())::text or revizstmg_prive.est_ami(device_id));
create policy fu_ajouter on public.friend_user for insert to authenticated with check (device_id = (select auth.uid())::text);
create policy fu_modifier on public.friend_user for update to authenticated
  using (device_id = (select auth.uid())::text) with check (device_id = (select auth.uid())::text);
create policy fu_supprimer on public.friend_user for delete to authenticated using (device_id = (select auth.uid())::text);

create policy fr_lire on public.friend_request for select to authenticated
  using (from_device = (select auth.uid())::text or to_device = (select auth.uid())::text);
create policy fr_ajouter on public.friend_request for insert to authenticated
  with check (from_device = (select auth.uid())::text and to_device <> from_device and status = 'pending');
-- Accepter ou refuser : voir le déclencheur garde_demande_ami.
create policy fr_modifier on public.friend_request for update to authenticated
  using (from_device = (select auth.uid())::text or to_device = (select auth.uid())::text)
  with check (from_device = (select auth.uid())::text or to_device = (select auth.uid())::text);
create policy fr_supprimer on public.friend_request for delete to authenticated
  using (from_device = (select auth.uid())::text or to_device = (select auth.uid())::text);

create policy fd_lire on public.friend_duel for select to authenticated
  using (a_device = (select auth.uid())::text or b_device = (select auth.uid())::text);
create policy fd_ajouter on public.friend_duel for insert to authenticated
  with check (a_device = (select auth.uid())::text and b_device <> a_device);
-- Jouer, accepter, terminer : voir le déclencheur garde_duel_ami.
create policy fd_modifier on public.friend_duel for update to authenticated
  using (a_device = (select auth.uid())::text or b_device = (select auth.uid())::text)
  with check (a_device = (select auth.uid())::text or b_device = (select auth.uid())::text);
create policy fd_supprimer on public.friend_duel for delete to authenticated
  using (a_device = (select auth.uid())::text or b_device = (select auth.uid())::text);

-- ---------------------------------------------------------------------------
-- 7. Suivi parent : l'élève gère sa ligne ; le parent la lit par le code
--    (fonction revizstmg_stats_enfant, plus bas).
-- ---------------------------------------------------------------------------
create policy cs_lire on public.child_stats for select to authenticated using (device_id = (select auth.uid())::text);
create policy cs_ajouter on public.child_stats for insert to authenticated with check (device_id = (select auth.uid())::text);
create policy cs_modifier on public.child_stats for update to authenticated
  using (device_id = (select auth.uid())::text) with check (device_id = (select auth.uid())::text);
create policy cs_supprimer on public.child_stats for delete to authenticated using (device_id = (select auth.uid())::text);


-- RévizSTMG : suppression complète du compte.
-- Appliqué avec l'accord du propriétaire du projet (13/10/2026).

-- ---------------------------------------------------------------------------
-- 2. Suppression complète du compte, par l'élève lui-même : tout ce qu'il a
--    publié, puis le compte de connexion (e-mail compris). Le profil et la
--    progression partent avec le compte (clé étrangère « on delete cascade »).
-- ---------------------------------------------------------------------------
create or replace function public.revizstmg_supprimer_compte() returns void
language plpgsql security definer set search_path = '' as $$
declare
  moi uuid := auth.uid();
  moi_txt text := auth.uid()::text;
begin
  if moi is null then
    raise exception 'Connexion requise.' using errcode = '42501';
  end if;
  -- Espaces partagés : classe, direct, classement, amis, parent.
  delete from public.class_member where device_id = moi_txt;
  delete from public.class_quiz_result where device_id = moi_txt;
  delete from public.class_wall where device_id = moi_txt;
  delete from public.class_duel where challenger_device = moi_txt;
  delete from public.live_player where device_id = moi_txt;
  delete from public.leaderboard where device_id = moi_txt;
  delete from public.friend_user where device_id = moi_txt;
  delete from public.friend_request where from_device = moi_txt or to_device = moi_txt;
  delete from public.friend_duel where a_device = moi_txt or b_device = moi_txt;
  delete from public.child_stats where device_id = moi_txt;
  -- Professeur : ses QCM, ses sessions en direct, les réglages et groupes de ses
  -- classes, puis ses classes. Les élèves gardent leurs propres données.
  delete from public.class_quiz where author_id = moi;
  delete from public.live_session where host_device = moi_txt;
  update public.class_member set group_id = null
    where class_code in (select t.code from public.teacher_class t where t.owner_id = moi);
  delete from public.class_group where class_code in (select t.code from public.teacher_class t where t.owner_id = moi);
  delete from public.class_meta where class_code in (select t.code from public.teacher_class t where t.owner_id = moi);
  delete from public.class_ban where class_code in (select t.code from public.teacher_class t where t.owner_id = moi);
  delete from public.teacher_class where owner_id = moi;
  -- Le compte lui-même (profil, sessions et identités suivent en cascade ;
  -- les signalements restent, sans auteur).
  delete from public.profiles where profiles.id = moi;
  delete from auth.users where users.id = moi;
end $$;
revoke all on function public.revizstmg_supprimer_compte() from public, anon;
grant execute on function public.revizstmg_supprimer_compte() to authenticated;


commit;
