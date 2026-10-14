-- RévizSTMG : rappels de révision sur le téléphone, même application fermée
-- (notifications « push » du navigateur). Appliqué avec l'accord du propriétaire
-- du projet (13/10/2026).
--
-- L'élève connecté active « Rappel de révision » : son navigateur s'abonne et
-- l'abonnement est enregistré ici avec l'heure choisie. Toutes les 10 minutes,
-- pg_cron appelle la fonction Edge « revizstmg-rappels », qui envoie le rappel
-- aux abonnés dont l'heure est venue et qui n'ont pas encore révisé ce jour-là.
-- Le rappel ne contient aucune donnée : le téléphone affiche un texte fixe.
-- Tout est dans le schéma revizstmg_prive, que l'API n'expose pas ; le site
-- passe par les fonctions ci-dessous. Les clés VAPID sont créées par la fonction
-- Edge elle-même et ne quittent pas la base.

create table if not exists revizstmg_prive.reglages (
  nom text primary key,
  valeur text not null
);
alter table revizstmg_prive.reglages enable row level security;

create table if not exists revizstmg_prive.abonnements_push (
  endpoint text primary key check (char_length(endpoint) <= 1000 and endpoint like 'https://%'),
  p256dh text not null check (char_length(p256dh) <= 200),
  auth text not null check (char_length(auth) <= 100),
  compte uuid not null references auth.users (id) on delete cascade,
  minute smallint not null default 1080 check (minute between 0 and 1439),
  fuseau text not null default 'Europe/Paris' check (char_length(fuseau) <= 60),
  actif boolean not null default true,
  dernier_envoi date,
  echecs smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table revizstmg_prive.abonnements_push enable row level security;
create index if not exists abonnements_push_compte on revizstmg_prive.abonnements_push (compte);

-- Secret partagé entre pg_cron et la fonction Edge (jamais montré au site).
insert into revizstmg_prive.reglages (nom, valeur)
values ('secret_rappels', replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''))
on conflict (nom) do nothing;

-- ---------------------------------------------------------------------------
-- Pour le site
-- ---------------------------------------------------------------------------

-- Clé publique VAPID (null tant que la fonction Edge ne l'a pas créée).
create or replace function public.revizstmg_push_cle() returns text
language sql stable security definer set search_path = '' as $$
  select valeur from revizstmg_prive.reglages where nom = 'vapid_publique'
$$;

-- Abonne l'appareil de l'élève connecté (ou met à jour l'heure du rappel).
create or replace function public.revizstmg_push_abonner(p_endpoint text, p_p256dh text, p_auth text, p_minute integer, p_fuseau text default 'Europe/Paris')
returns void
language plpgsql security definer set search_path = '' as $$
declare
  moi uuid := auth.uid();
  fuseau text := coalesce(nullif(p_fuseau, ''), 'Europe/Paris');
begin
  if moi is null then raise exception 'Connexion requise.' using errcode = '42501'; end if;
  begin
    perform now() at time zone fuseau;
  exception when others then
    fuseau := 'Europe/Paris';
  end;
  if (select count(*) from revizstmg_prive.abonnements_push a where a.compte = moi and a.endpoint <> p_endpoint) >= 10 then
    raise exception 'Trop d''appareils abonnés aux rappels.' using errcode = 'P0001';
  end if;
  insert into revizstmg_prive.abonnements_push as a (endpoint, p256dh, auth, compte, minute, fuseau, actif, echecs, updated_at)
  values (p_endpoint, p_p256dh, p_auth, moi, greatest(0, least(1439, coalesce(p_minute, 1080))), fuseau, true, 0, now())
  on conflict (endpoint) do update set
    p256dh = excluded.p256dh, auth = excluded.auth, compte = excluded.compte, minute = excluded.minute,
    fuseau = excluded.fuseau, actif = true, echecs = 0, updated_at = now();
end $$;

-- Arrête les rappels sur cet appareil.
create or replace function public.revizstmg_push_desabonner(p_endpoint text) returns void
language sql security definer set search_path = '' as $$
  update revizstmg_prive.abonnements_push set actif = false, updated_at = now()
  where endpoint = p_endpoint and compte = auth.uid()
$$;

revoke all on function public.revizstmg_push_cle(), public.revizstmg_push_abonner(text, text, text, integer, text),
  public.revizstmg_push_desabonner(text) from public, anon;
grant execute on function public.revizstmg_push_cle() to anon, authenticated;
grant execute on function public.revizstmg_push_abonner(text, text, text, integer, text),
  public.revizstmg_push_desabonner(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Pour la fonction Edge (clé de service uniquement)
-- ---------------------------------------------------------------------------

create or replace function public.revizstmg_push_secret_ok(p_secret text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from revizstmg_prive.reglages where nom = 'secret_rappels' and valeur = p_secret)
$$;

create or replace function public.revizstmg_push_cles() returns table (publique text, privee text)
language sql stable security definer set search_path = '' as $$
  select (select valeur from revizstmg_prive.reglages where nom = 'vapid_publique'),
         (select valeur from revizstmg_prive.reglages where nom = 'vapid_privee')
$$;

-- Enregistre la paire de clés VAPID, seulement si aucune n'existe encore.
create or replace function public.revizstmg_push_enregistrer_cles(p_publique text, p_privee text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from revizstmg_prive.reglages where nom = 'vapid_publique') then return; end if;
  insert into revizstmg_prive.reglages (nom, valeur) values ('vapid_publique', p_publique), ('vapid_privee', p_privee);
end $$;

-- Abonnements à prévenir maintenant : l'heure du rappel est passée depuis moins
-- de 3 heures (heure locale de l'abonné), pas déjà prévenu aujourd'hui, et pas
-- encore révisé aujourd'hui (série de l'élève). Ils sont marqués « envoyés ».
create or replace function public.revizstmg_push_a_envoyer()
returns table (endpoint text, p256dh text, auth text)
language sql security definer set search_path = '' as $$
  with dus as (
    select a.endpoint, (now() at time zone a.fuseau) as ici
    from revizstmg_prive.abonnements_push a
    left join public.profiles p on p.id = a.compte
    where a.actif
      and (extract(hour from now() at time zone a.fuseau) * 60 + extract(minute from now() at time zone a.fuseau))
          between a.minute and a.minute + 180
      and (a.dernier_envoi is null or a.dernier_envoi < (now() at time zone a.fuseau)::date)
      and coalesce(p.progress -> 'streak' ->> 'last', '') not in (
        to_char(now() at time zone 'UTC', 'YYYY-MM-DD'), to_char(now() at time zone a.fuseau, 'YYYY-MM-DD'))
    limit 500
  )
  update revizstmg_prive.abonnements_push a set dernier_envoi = dus.ici::date
  from dus where a.endpoint = dus.endpoint
  returning a.endpoint, a.p256dh, a.auth
$$;

-- Résultat d'un envoi : abonnement expiré (404/410) → désactivé ; autre échec →
-- compté (désactivé au 5e échec d'affilée) ; réussite → compteur remis à zéro.
create or replace function public.revizstmg_push_resultat(p_endpoint text, p_statut integer) returns void
language sql security definer set search_path = '' as $$
  update revizstmg_prive.abonnements_push set
    echecs = case when p_statut between 200 and 299 then 0 else echecs + 1 end,
    actif = case when p_statut in (404, 410) then false when p_statut between 200 and 299 then actif else echecs + 1 < 5 end,
    updated_at = now()
  where endpoint = p_endpoint
$$;

revoke all on function public.revizstmg_push_secret_ok(text), public.revizstmg_push_cles(),
  public.revizstmg_push_enregistrer_cles(text, text), public.revizstmg_push_a_envoyer(),
  public.revizstmg_push_resultat(text, integer) from public, anon, authenticated;
grant execute on function public.revizstmg_push_secret_ok(text), public.revizstmg_push_cles(),
  public.revizstmg_push_enregistrer_cles(text, text), public.revizstmg_push_a_envoyer(),
  public.revizstmg_push_resultat(text, integer) to service_role;

-- ---------------------------------------------------------------------------
-- Toutes les 10 minutes, pg_cron appelle la fonction Edge (avec le secret).
-- ---------------------------------------------------------------------------
create extension if not exists pg_cron with schema pg_catalog;

select cron.schedule(
  'revizstmg-rappels',
  '*/10 * * * *',
  $cron$
  select net.http_post(
    url := 'https://wyydagcjkbivtbuhbzon.supabase.co/functions/v1/revizstmg-rappels',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'x-revizstmg-secret', (select valeur from revizstmg_prive.reglages where nom = 'secret_rappels')),
    body := '{}'::jsonb,
    timeout_milliseconds := 20000
  )
  $cron$
);

-- Statistiques du matin : nombre d'appareils abonnés (aucun identifiant).
create or replace function public.revizstmg_statistiques()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with j as (select (now() at time zone 'Europe/Paris')::date as aujourdhui)
  select jsonb_build_object(
    'comptes', (select count(*) from public.profiles),
    'eleves', (select count(*) from public.profiles where role = 'eleve'),
    'profs', (select count(*) from public.profiles where role = 'prof'),
    'nouveaux_7j', (select count(*) from public.profiles where created_at > now() - interval '7 days'),
    'nouveaux_30j', (select count(*) from public.profiles where created_at > now() - interval '30 days'),
    'actifs_1j', (select count(*) from public.profiles where updated_at > now() - interval '1 day'),
    'actifs_7j', (select count(*) from public.profiles where updated_at > now() - interval '7 days'),
    'actifs_30j', (select count(*) from public.profiles where updated_at > now() - interval '30 days'),
    'niveaux', (select coalesce(jsonb_object_agg(k, n), '{}'::jsonb) from (select coalesce(nullif(level, ''), 'non renseigné') k, count(*) n from public.profiles where role = 'eleve' group by 1) x),
    'specialites', (select coalesce(jsonb_object_agg(k, n), '{}'::jsonb) from (select coalesce(nullif(specialty, ''), 'non renseignée') k, count(*) n from public.profiles where role = 'eleve' and level = 'terminale-stmg' group by 1) x),
    'classes', (select count(*) from public.teacher_class),
    'eleves_en_classe', (select count(distinct device_id) from public.class_member where role = 'eleve'),
    'quiz_de_classe', (select count(*) from public.class_quiz),
    'sessions_live', (select count(*) from public.live_session),
    'joueurs_amis', (select count(*) from public.friend_user),
    'defis_amis', (select count(*) from public.friend_duel),
    'defis_amis_7j', (select count(*) from public.friend_duel where created_at > now() - interval '7 days'),
    'suivis_parents', (select count(*) from public.child_stats),
    'suivis_parents_actifs_7j', (select count(*) from public.child_stats where last_active > now() - interval '7 days'),
    'signalements_a_traiter', (select count(*) from public.revizstmg_signalements where not traite),
    'signalements_7j', (select count(*) from public.revizstmg_signalements where created_at > now() - interval '7 days'),
    'rappels_push', (select count(*) from revizstmg_prive.abonnements_push where actif),
    -- Mesure d'audience : la veille, et les 7 derniers jours complets.
    'visites_hier', (select coalesce(sum(visites), 0) from public.revizstmg_visites, j where jour = j.aujourdhui - 1),
    'vues_hier', (select coalesce(sum(vues), 0) from public.revizstmg_visites, j where jour = j.aujourdhui - 1),
    'visites_7j', (select coalesce(sum(visites), 0) from public.revizstmg_visites, j where jour between j.aujourdhui - 7 and j.aujourdhui - 1),
    'vues_7j', (select coalesce(sum(vues), 0) from public.revizstmg_visites, j where jour between j.aujourdhui - 7 and j.aujourdhui - 1),
    'ecrans_7j', (select coalesce(jsonb_object_agg(page, n), '{}'::jsonb) from (select page, sum(vues) n from public.revizstmg_visites, j where jour between j.aujourdhui - 7 and j.aujourdhui - 1 group by page) x)
  )
$$;
revoke all on function public.revizstmg_statistiques() from public;
grant execute on function public.revizstmg_statistiques() to anon, authenticated;
