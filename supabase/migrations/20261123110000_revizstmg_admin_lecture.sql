-- Menu administrateur de RévizSTMG : lecture seule, réservée à deux comptes.
-- Seuls ces deux e-mails (adresse confirmée) peuvent appeler ces fonctions ; tout autre compte reçoit
-- une erreur d'accès refusé (42501), même s'il connaît l'adresse de la fonction. Aucune table n'est modifiée.
-- Les e-mails sont masqués (ga***@icloud.com) et les textes personnels (notes de classe, Grand Oral,
-- étude de gestion, fiches) ne sont jamais renvoyés.

create or replace function public.revizstmg_est_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from auth.users u
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
      and lower(u.email) in ('donatmatys972@gmail.com', 'gabriel.merlin2872@icloud.com')
  )
$$;

create or replace function public.revizstmg_admin_garde()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.revizstmg_est_admin() then
    raise exception 'acces_refuse' using errcode = '42501';
  end if;
end
$$;

-- Vue d'ensemble : comptes, inscriptions, visites des 30 derniers jours.
create or replace function public.revizstmg_admin_apercu()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare r jsonb;
begin
  perform public.revizstmg_admin_garde();
  select jsonb_build_object(
    'genere', now(),
    'comptes', (select jsonb_build_object(
        'total', count(*),
        'eleves', count(*) filter (where role = 'eleve'),
        'profs', count(*) filter (where role = 'prof'),
        'terminale', count(*) filter (where level = 'terminale-stmg'),
        'premiere', count(*) filter (where level = 'premiere-stmg'),
        'nouveaux_7j', count(*) filter (where created_at >= now() - interval '7 days'),
        'actifs_7j', count(*) filter (where updated_at >= now() - interval '7 days'))
      from public.profiles),
    'specialites', (select coalesce(jsonb_agg(jsonb_build_object('specialite', s, 'n', n) order by n desc), '[]'::jsonb)
      from (select coalesce(specialty, level, 'inconnu') s, count(*) n from public.profiles group by 1) q),
    'inscriptions_par_jour', (select coalesce(jsonb_agg(jsonb_build_object('jour', j, 'n', n) order by j), '[]'::jsonb)
      from (select (created_at at time zone 'Europe/Paris')::date j, count(*) n from public.profiles
            where created_at >= now() - interval '30 days' group by 1) q),
    'visites_par_jour', (select coalesce(jsonb_agg(jsonb_build_object('jour', jour, 'vues', v, 'visites', vi) order by jour), '[]'::jsonb)
      from (select jour, sum(vues) v, sum(visites) vi from public.revizstmg_visites
            where jour >= (now() at time zone 'Europe/Paris')::date - 29 group by jour) q),
    'pages_30j', (select coalesce(jsonb_agg(jsonb_build_object('page', page, 'vues', v, 'visites', vi) order by v desc), '[]'::jsonb)
      from (select page, sum(vues) v, sum(visites) vi from public.revizstmg_visites
            where jour >= (now() at time zone 'Europe/Paris')::date - 29 group by page) q)
  ) into r;
  return r;
end
$$;

-- Liste des comptes avec leur activité (tirée de la dernière synchronisation de la progression).
create or replace function public.revizstmg_admin_comptes()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.revizstmg_admin_garde();
  return coalesce((
    select jsonb_agg(l.c order by l.cree desc)
    from (
      select p.created_at cree, jsonb_build_object(
        'id', p.id, 'role', p.role, 'nom', p.name,
        'email', case when p.email is null then null else left(p.email, 2) || '***@' || split_part(p.email, '@', 2) end,
        'niveau', p.level, 'specialite', p.specialty, 'classe', p.class_code,
        'cree', p.created_at, 'maj', p.updated_at, 'connexion', u.last_sign_in_at,
        'xp', pj.j->'xp',
        'serie', pj.j->'streak'->'count',
        'reponses', pj.j->'totalAnswers',
        'justes', pj.j->'correctAnswers',
        'dernier_chapitre', pj.j->'lastChapter'->>'chapterId',
        'favoris', case when jsonb_typeof(pj.j->'favorites') = 'array' then jsonb_array_length(pj.j->'favorites') else 0 end,
        'badges', case when jsonb_typeof(pj.j->'badges') = 'array' then jsonb_array_length(pj.j->'badges') else 0 end,
        'jours_actifs', case when jsonb_typeof(pj.j->'history') = 'object' then (select count(*) from jsonb_object_keys(pj.j->'history')) else 0 end,
        'chapitres', case when jsonb_typeof(pj.j->'chapters') = 'object' then (select count(*) from jsonb_object_keys(pj.j->'chapters')) else 0 end,
        'exercices', case when jsonb_typeof(pj.j->'chapters') = 'object' then
          (select coalesce(sum(case when jsonb_typeof(ch.value->'games') = 'object' then (select count(*) from jsonb_object_keys(ch.value->'games')) else 0 end), 0)
           from jsonb_each(pj.j->'chapters') ch) else 0 end,
        'temps_s', case when jsonb_typeof(pj.j->'themeTime') = 'object' then
          (select coalesce(sum((tt.value)::text::numeric), 0) from jsonb_each(pj.j->'themeTime') tt where jsonb_typeof(tt.value) = 'number') else 0 end
      ) c
      from public.profiles p
      left join auth.users u on u.id = p.id
      cross join lateral (select case when jsonb_typeof(p.progress) = 'object' then p.progress else '{}'::jsonb end j) pj
    ) l
  ), '[]'::jsonb);
end
$$;

-- Détail d'un compte : profil et progression, sans les textes personnels.
create or replace function public.revizstmg_admin_compte(p_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare r jsonb;
begin
  perform public.revizstmg_admin_garde();
  select jsonb_build_object(
    'id', p.id, 'role', p.role, 'nom', p.name,
    'email', case when p.email is null then null else left(p.email, 2) || '***@' || split_part(p.email, '@', 2) end,
    'niveau', p.level, 'specialite', p.specialty, 'classe', p.class_code, 'matieres', p.subjects,
    'cree', p.created_at, 'maj', p.updated_at, 'connexion', u.last_sign_in_at,
    'progression', (case when jsonb_typeof(p.progress) = 'object' then p.progress else '{}'::jsonb end)
      - array['_sync', 'notes', 'notesClasse', 'grandOral', 'etudeGestion', 'fiches', 'savedDecks', 'shopRewards'],
    'abonnement', (select to_jsonb(a) - 'user_id' - 'stripe_customer_id' - 'stripe_subscription_id'
                   from public.revizstmg_abonnements a where a.user_id = p.id),
    'ia', (select coalesce(jsonb_agg(jsonb_build_object('fonction', i.fonction, 'periode', i.periode, 'n', i.n) order by i.periode desc), '[]'::jsonb)
           from public.revizstmg_ia_usage i where i.user_id = p.id)
  ) into r
  from public.profiles p left join auth.users u on u.id = p.id
  where p.id = p_id;
  return r;
end
$$;

-- Abonnements, usage de l'IA, signalements d'erreurs, classes et vie sociale.
create or replace function public.revizstmg_admin_divers()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.revizstmg_admin_garde();
  return jsonb_build_object(
    'abonnements', (select coalesce(jsonb_agg(jsonb_build_object(
        'nom', pr.name, 'offre', a.offre, 'periode', a.periode, 'statut', a.statut, 'periode_fin', a.periode_fin,
        'annulation_prevue', a.annulation_prevue, 'test', a.mode_test, 'cree', a.created_at) order by a.created_at desc), '[]'::jsonb)
      from public.revizstmg_abonnements a left join public.profiles pr on pr.id = a.user_id),
    'ia', (select coalesce(jsonb_agg(jsonb_build_object('nom', pr.name, 'fonction', i.fonction, 'periode', i.periode, 'n', i.n) order by i.updated_at desc), '[]'::jsonb)
      from public.revizstmg_ia_usage i left join public.profiles pr on pr.id = i.user_id),
    'signalements', (select coalesce(jsonb_agg(s.o order by s.cree desc), '[]'::jsonb) from (
        select g.created_at cree, jsonb_build_object('id', g.id, 'cree', g.created_at, 'auteur', pr.name, 'page', g.page,
          'theme', g.theme_id, 'exercice', g.exercice, 'categorie', g.categorie, 'message', g.message, 'traite', g.traite) o
        from public.revizstmg_signalements g left join public.profiles pr on pr.id = g.auteur
        order by g.created_at desc limit 100) s),
    'classes', (select coalesce(jsonb_agg(jsonb_build_object(
        'code', t.code, 'nom', t.label, 'matiere', t.subject, 'prof', t.owner_name, 'cree', t.created_at,
        'membres', (select count(*) from public.class_member m where m.class_code = t.code)) order by t.created_at desc), '[]'::jsonb)
      from public.teacher_class t),
    'social', jsonb_build_object(
      'amis', (select count(*) from public.friend_user),
      'demandes', (select count(*) from public.friend_request),
      'classement', (select count(*) from public.leaderboard),
      'membres_classe', (select count(*) from public.class_member))
  );
end
$$;

revoke all on function public.revizstmg_est_admin() from public, anon, authenticated;
revoke all on function public.revizstmg_admin_garde() from public, anon, authenticated;
revoke all on function public.revizstmg_admin_apercu() from public, anon, authenticated;
revoke all on function public.revizstmg_admin_comptes() from public, anon, authenticated;
revoke all on function public.revizstmg_admin_compte(uuid) from public, anon, authenticated;
revoke all on function public.revizstmg_admin_divers() from public, anon, authenticated;
grant execute on function public.revizstmg_est_admin() to authenticated;
grant execute on function public.revizstmg_admin_apercu() to authenticated;
grant execute on function public.revizstmg_admin_comptes() to authenticated;
grant execute on function public.revizstmg_admin_compte(uuid) to authenticated;
grant execute on function public.revizstmg_admin_divers() to authenticated;
