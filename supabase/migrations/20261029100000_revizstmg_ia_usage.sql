-- RévizSTMG : compteurs d'utilisation des fonctions d'IA (quota Premium par mois,
-- garde-fou journalier). Écrits uniquement par les fonctions serveur (clé de service).
-- À APPLIQUER seulement avec l'accord explicite du propriétaire du projet.

-- Une ligne par compte, par fonction d'IA et par période : « 2026-10 » (mois) ou
-- « 2026-10-29 » (jour, avec la fonction « _jour »).
create table public.revizstmg_ia_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  fonction text not null check (length(fonction) between 1 and 40),
  periode text not null check (length(periode) between 7 and 10),
  n integer not null default 0 check (n >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, fonction, periode)
);
comment on table public.revizstmg_ia_usage is
  'RévizSTMG : utilisations d''IA par compte, fonction et période (écrit par les fonctions serveur seulement).';

alter table public.revizstmg_ia_usage enable row level security;
revoke all on public.revizstmg_ia_usage from anon, authenticated;
grant select on public.revizstmg_ia_usage to authenticated;
create policy lire_son_usage_ia on public.revizstmg_ia_usage for select to authenticated
  using (user_id = (select auth.uid()));

-- Réserve une utilisation de façon atomique : faux si le plafond est atteint.
-- Deux requêtes simultanées ne peuvent donc pas dépasser le quota.
create or replace function public.revizstmg_ia_reserver(p_user uuid, p_fonction text, p_periode text, p_max integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare v integer;
begin
  if p_max is null or p_max < 1 then return false; end if;
  insert into public.revizstmg_ia_usage (user_id, fonction, periode, n)
    values (p_user, p_fonction, p_periode, 0)
    on conflict (user_id, fonction, periode) do nothing;
  update public.revizstmg_ia_usage
     set n = n + 1, updated_at = now()
   where user_id = p_user and fonction = p_fonction and periode = p_periode and n < p_max
  returning n into v;
  return v is not null;
end;
$$;

-- Rend une utilisation réservée quand l'appel a échoué.
create or replace function public.revizstmg_ia_rendre(p_user uuid, p_fonction text, p_periode text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.revizstmg_ia_usage
     set n = greatest(n - 1, 0), updated_at = now()
   where user_id = p_user and fonction = p_fonction and periode = p_periode;
$$;

-- Seules les fonctions serveur (clé de service) les appellent, jamais un navigateur.
revoke all on function public.revizstmg_ia_reserver(uuid, text, text, integer) from public, anon, authenticated;
revoke all on function public.revizstmg_ia_rendre(uuid, text, text) from public, anon, authenticated;
grant execute on function public.revizstmg_ia_reserver(uuid, text, text, integer) to service_role;
grant execute on function public.revizstmg_ia_rendre(uuid, text, text) to service_role;
