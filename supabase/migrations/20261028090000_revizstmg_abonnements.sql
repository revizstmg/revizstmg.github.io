-- RévizSTMG : abonnements Premium et Ultimate (Stripe). Mode test d'abord.
-- À APPLIQUER seulement avec l'accord explicite du propriétaire du projet.

-- Une ligne par compte. Les élèves lisent la leur ; seule la fonction
-- « revizstmg-paiement » (clé de service) écrit, après vérification de Stripe.
create table public.revizstmg_abonnements (
  user_id uuid primary key references auth.users (id) on delete cascade,
  offre text check (offre in ('premium', 'ultimate')),
  periode text check (periode in ('mensuel', 'annuel')),
  statut text not null default 'aucun',
  periode_fin timestamptz,
  annulation_prevue boolean not null default false,
  stripe_customer_id text,
  stripe_subscription_id text,
  mode_test boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.revizstmg_abonnements is
  'RévizSTMG : abonnement payant d''un compte (miroir de Stripe, écrit par la fonction revizstmg-paiement).';

alter table public.revizstmg_abonnements enable row level security;
revoke all on public.revizstmg_abonnements from anon, authenticated;
grant select on public.revizstmg_abonnements to authenticated;
create policy lire_son_abonnement on public.revizstmg_abonnements for select to authenticated
  using (user_id = (select auth.uid()));

create index revizstmg_abonnements_client on public.revizstmg_abonnements (stripe_customer_id);
