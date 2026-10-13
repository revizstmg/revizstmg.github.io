-- RévizSTMG : « Signaler une erreur » (et son nombre dans les statistiques).
-- Appliqué avec l'accord du propriétaire du projet (13/10/2026).

-- ---------------------------------------------------------------------------
-- 1. Signalements d'erreurs dans le contenu. Tout le monde peut en envoyer
--    (même sans compte), personne ne peut les lire par l'API : ils se lisent
--    dans le tableau de bord de Supabase (ou en SQL).
-- ---------------------------------------------------------------------------
create table public.revizstmg_signalements (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  auteur uuid default auth.uid() references auth.users (id) on delete set null,
  page text not null default '' check (char_length(page) <= 300),
  theme_id text not null default '' check (char_length(theme_id) <= 80),
  exercice text not null default '' check (char_length(exercice) <= 200),
  categorie text not null default 'autre' check (categorie in ('reponse', 'enonce', 'cours', 'affichage', 'autre')),
  message text not null check (char_length(btrim(message)) between 3 and 1000),
  traite boolean not null default false
);
comment on table public.revizstmg_signalements is
  'RévizSTMG : erreurs signalées par les élèves (bouton « Signaler une erreur »). Lecture dans le tableau de bord uniquement.';

alter table public.revizstmg_signalements enable row level security;
revoke all on public.revizstmg_signalements from anon, authenticated;
grant insert on public.revizstmg_signalements to anon, authenticated;
create policy signaler on public.revizstmg_signalements for insert to anon, authenticated
  with check (traite = false and (auteur is null or auteur = (select auth.uid())));

-- Anti-rafale : 10 signalements par heure et par compte, 200 par heure au total.
create or replace function revizstmg_prive.limite_signalements() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.auteur is not null then
    perform revizstmg_prive.trop_d_envois((select count(*) from public.revizstmg_signalements s
      where s.auteur = new.auteur and s.created_at > now() - interval '1 hour'), 10, 'signalements');
  end if;
  perform revizstmg_prive.trop_d_envois((select count(*) from public.revizstmg_signalements s
    where s.created_at > now() - interval '1 hour'), 200, 'signalements');
  return new;
end $$;
revoke all on function revizstmg_prive.limite_signalements() from public;
create trigger revizstmg_limite_signalements before insert on public.revizstmg_signalements
  for each row execute function revizstmg_prive.limite_signalements();

-- ---------------------------------------------------------------------------
-- 3. Statistiques du matin : nombre de signalements (aucun texte).
-- ---------------------------------------------------------------------------
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
