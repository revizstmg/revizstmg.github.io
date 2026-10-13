-- RévizSTMG : règles d'accès des tables sociales (classe, direct, amis, parent,
-- classement). Appliqué avec l'accord du propriétaire du projet (13/10/2026).
--
-- Avant : 16 tables lisibles et modifiables par n'importe qui avec la clé
-- publique (using (true), rôle anon).
-- Après :
--   * il faut être connecté (rôle authenticated) ; anon n'a plus aucun accès ;
--   * l'identifiant public d'un élève (colonnes device_id, *_device) est
--     l'identifiant de son compte : chacun n'écrit que ses propres lignes ;
--   * une classe (membres, mur, QCM, duels, direct, groupes, réglages) n'est
--     visible que de ses membres et de son professeur ; les actions du
--     professeur sont réservées au propriétaire de la classe (teacher_class) ;
--   * codes ami, code parent et code de classe se cherchent par des fonctions
--     qui ne renvoient que la ligne du code exact ;
--   * des déclencheurs limitent les envois en rafale et figent les champs qu'un
--     élève ne doit pas modifier chez un autre.
-- Les tables de NAH ne sont pas touchées.

-- ---------------------------------------------------------------------------
-- 1. Fonctions d'aide, dans un schéma que l'API n'expose pas.
-- ---------------------------------------------------------------------------
create schema if not exists revizstmg_prive;
revoke all on schema revizstmg_prive from public;
grant usage on schema revizstmg_prive to authenticated;

create or replace function revizstmg_prive.est_prof(p_code text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.teacher_class t where t.code = p_code and t.owner_id = auth.uid())
$$;

create or replace function revizstmg_prive.est_membre(p_code text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.class_member m where m.class_code = p_code and m.device_id = auth.uid()::text)
      or exists (select 1 from public.teacher_class t where t.code = p_code and t.owner_id = auth.uid())
$$;

create or replace function revizstmg_prive.est_exclu(p_code text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.class_ban b where b.class_code = p_code and b.device_id = auth.uid()::text)
$$;

create or replace function revizstmg_prive.voit_classement(p_code text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.leaderboard l where l.class_code = p_code and l.device_id = auth.uid()::text)
      or revizstmg_prive.est_membre(p_code)
$$;

create or replace function revizstmg_prive.classe_du_quiz(p_quiz uuid) returns text
language sql stable security definer set search_path = '' as $$
  select q.class_code from public.class_quiz q where q.id = p_quiz
$$;

create or replace function revizstmg_prive.classe_du_direct(p_session uuid) returns text
language sql stable security definer set search_path = '' as $$
  select s.class_code from public.live_session s where s.id = p_session
$$;

create or replace function revizstmg_prive.est_ami(p_device text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.friend_request r
    where r.status = 'accepted'
      and ((r.from_device = auth.uid()::text and r.to_device = p_device)
        or (r.to_device = auth.uid()::text and r.from_device = p_device)))
$$;

-- Code de classe masqué pour qui n'en est pas membre (« stmg-k••• »).
create or replace function revizstmg_prive.code_visible(p_code text) returns text
language sql stable security definer set search_path = '' as $$
  select case when revizstmg_prive.voit_classement(p_code) then p_code else left(p_code, 6) || '•••' end
$$;

-- Garde-fou anti-rafale : nombre de lignes récentes d'un même auteur.
create or replace function revizstmg_prive.trop_d_envois(p_nb bigint, p_max int, p_quoi text) returns void
language plpgsql set search_path = '' as $$
begin
  if p_nb >= p_max then
    raise exception 'Trop d''envois (%) : patiente un peu avant de recommencer.', p_quoi using errcode = 'P0001';
  end if;
end $$;

revoke all on all functions in schema revizstmg_prive from public;
grant execute on all functions in schema revizstmg_prive to authenticated;

