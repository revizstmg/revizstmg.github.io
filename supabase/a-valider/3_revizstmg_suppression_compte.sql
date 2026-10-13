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

