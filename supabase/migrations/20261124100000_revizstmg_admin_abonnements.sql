-- Menu administrateur, suite : changer l'abonnement d'un compte (élève ou prof) et mieux voir les offres.
-- Réservé aux deux administrateurs (même garde que les fonctions de lecture : e-mail confirmé, sinon 42501).
-- À APPLIQUER seulement avec l'accord explicite du propriétaire du projet.
--
-- Un abonnement « offert » est une ligne de revizstmg_abonnements : statut actif, offre premium ou ultimate,
-- période de fin facultative, mode_test = false. Les fonctions d'accès existantes (niveauDe / estActif) la
-- reconnaissent sans changement. Aucun identifiant Stripe n'est touché : un vrai abonnement Stripe n'est pas
-- annulé d'ici (la fonction refuse de le rétrograder pour ne pas laisser un client payer sans accès).

create or replace function public.revizstmg_admin_abonnement(p_id uuid, p_offre text, p_jours integer default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare ancienne public.revizstmg_abonnements%rowtype; fin timestamptz; res jsonb;
begin
  perform public.revizstmg_admin_garde();
  if p_offre not in ('gratuit', 'premium', 'ultimate') then
    raise exception 'offre_inconnue' using errcode = '22023';
  end if;
  if p_jours is not null and (p_jours < 1 or p_jours > 3650) then
    raise exception 'duree_invalide' using errcode = '22023';
  end if;
  if not exists (select 1 from public.profiles where id = p_id) then
    raise exception 'compte_introuvable' using errcode = 'P0002';
  end if;
  select * into ancienne from public.revizstmg_abonnements where user_id = p_id;
  if p_offre = 'gratuit' and ancienne.stripe_subscription_id is not null
     and ancienne.statut in ('active', 'trialing', 'past_due') then
    raise exception 'abonnement_stripe_actif' using errcode = '55000';
  end if;
  fin := case when p_offre = 'gratuit' or p_jours is null then null else now() + make_interval(days => p_jours) end;
  insert into public.revizstmg_abonnements as a (user_id, offre, periode, statut, periode_fin, annulation_prevue, mode_test, updated_at)
  values (p_id,
          case when p_offre = 'gratuit' then null else p_offre end,
          case when p_offre = 'gratuit' then null else 'mensuel' end,
          case when p_offre = 'gratuit' then 'aucun' else 'active' end,
          fin, false, false, now())
  on conflict (user_id) do update set
    offre = excluded.offre, periode = excluded.periode, statut = excluded.statut, periode_fin = excluded.periode_fin,
    annulation_prevue = false, mode_test = false, updated_at = now();
  select to_jsonb(a) - 'user_id' - 'stripe_customer_id' - 'stripe_subscription_id' into res
    from public.revizstmg_abonnements a where a.user_id = p_id;
  return res;
end
$$;

-- Aperçu : ajoute la répartition des offres et le nombre d'abonnements actifs.
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
        'actifs_7j', count(*) filter (where updated_at >= now() - interval '7 days'),
        'actifs_24h', count(*) filter (where updated_at >= now() - interval '1 day'),
        'nouveaux_24h', count(*) filter (where created_at >= now() - interval '1 day'))
      from public.profiles),
    'offres', (select jsonb_build_object(
        'premium', count(*) filter (where a.offre = 'premium'),
        'ultimate', count(*) filter (where a.offre = 'ultimate'),
        'reels', count(*) filter (where a.mode_test = false and a.stripe_subscription_id is not null),
        'offerts', count(*) filter (where a.mode_test = false and a.stripe_subscription_id is null))
      from public.revizstmg_abonnements a
      where a.statut in ('active', 'trialing', 'past_due') and a.offre is not null
        and (a.periode_fin is null or a.periode_fin > now() - interval '1 day')),
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
            where jour >= (now() at time zone 'Europe/Paris')::date - 29 group by page) q),
    'signalements_ouverts', (select count(*) from public.revizstmg_signalements where not traite)
  ) into r;
  return r;
end
$$;

-- Liste des comptes : ajoute l'offre en cours (gratuit, premium, ultimate) et sa fin.
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
        'offre', case when a.offre is not null and a.statut in ('active', 'trialing', 'past_due')
                       and (a.periode_fin is null or a.periode_fin > now() - interval '1 day') then a.offre else 'gratuit' end,
        'offre_fin', a.periode_fin,
        'offre_offerte', coalesce(a.mode_test = false and a.stripe_subscription_id is null, false),
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
      left join public.revizstmg_abonnements a on a.user_id = p.id
      cross join lateral (select case when jsonb_typeof(p.progress) = 'object' then p.progress else '{}'::jsonb end j) pj
    ) l
  ), '[]'::jsonb);
end
$$;

revoke all on function public.revizstmg_admin_abonnement(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.revizstmg_admin_abonnement(uuid, text, integer) to authenticated;
