-- Menu administrateur : seuls deux e-mails confirmés lisent ; les autres reçoivent « acces_refuse ».
insert into auth.users (id, email, email_confirmed_at) values
 ('dddddddd-0000-4000-8000-000000000004','gabriel.merlin2872@icloud.com', now()),
 ('eeeeeeee-0000-4000-8000-000000000005','donatmatys972@gmail.com', null),
 ('ffffffff-0000-4000-8000-000000000006','Donatmatys972@gmail.com', now());
insert into public.profiles (id, role, name, email) values
 ('dddddddd-0000-4000-8000-000000000004','eleve','Admin','gabriel.merlin2872@icloud.com');
create or replace function pg_temp.essai(nom text, role_sql text, sub text, appel text) returns text language plpgsql as $f$
declare res text;
begin
  execute format('set local role %s', role_sql);
  perform set_config('request.jwt.claim.sub', sub, true);
  begin
    execute appel;
    res := 'ACCEPTÉ';
  exception when others then res := 'refus ' || sqlstate;
  end;
  reset role;
  return nom || ' : ' || res;
end $f$;
select pg_temp.essai('admin icloud', 'authenticated', 'dddddddd-0000-4000-8000-000000000004', 'select public.revizstmg_admin_apercu()');
select pg_temp.essai('admin icloud (comptes)', 'authenticated', 'dddddddd-0000-4000-8000-000000000004', 'select public.revizstmg_admin_comptes()');
select pg_temp.essai('admin icloud (compte)', 'authenticated', 'dddddddd-0000-4000-8000-000000000004', $$select public.revizstmg_admin_compte('dddddddd-0000-4000-8000-000000000004')$$);
select pg_temp.essai('admin icloud (divers)', 'authenticated', 'dddddddd-0000-4000-8000-000000000004', 'select public.revizstmg_admin_divers()');
select pg_temp.essai('Matys, e-mail non confirmé', 'authenticated', 'eeeeeeee-0000-4000-8000-000000000005', 'select public.revizstmg_admin_apercu()');
select pg_temp.essai('Matys, majuscule, confirmé', 'authenticated', 'ffffffff-0000-4000-8000-000000000006', 'select public.revizstmg_admin_apercu()');
select pg_temp.essai('élève ordinaire', 'authenticated', 'aaaaaaaa-0000-4000-8000-000000000001', 'select public.revizstmg_admin_apercu()');
select pg_temp.essai('élève ordinaire (comptes)', 'authenticated', 'aaaaaaaa-0000-4000-8000-000000000001', 'select public.revizstmg_admin_comptes()');
select pg_temp.essai('anonyme', 'anon', '', 'select public.revizstmg_admin_apercu()');
select pg_temp.essai('anonyme (est_admin)', 'anon', '', 'select public.revizstmg_est_admin()');
select pg_temp.essai('élève : garde directe', 'authenticated', 'aaaaaaaa-0000-4000-8000-000000000001', 'select public.revizstmg_admin_garde()');

-- Changement d'abonnement : réservé aux administrateurs, offre validée, jamais de rétrogradation d'un vrai abonnement Stripe.
select pg_temp.essai('élève : changer d''offre', 'authenticated', 'aaaaaaaa-0000-4000-8000-000000000001', $$select public.revizstmg_admin_abonnement('dddddddd-0000-4000-8000-000000000004','ultimate',30)$$);
select pg_temp.essai('anonyme : changer d''offre', 'anon', '', $$select public.revizstmg_admin_abonnement('dddddddd-0000-4000-8000-000000000004','ultimate',30)$$);
select pg_temp.essai('admin : offre inconnue', 'authenticated', 'dddddddd-0000-4000-8000-000000000004', $$select public.revizstmg_admin_abonnement('dddddddd-0000-4000-8000-000000000004','diamant',30)$$);
select pg_temp.essai('admin : compte inconnu', 'authenticated', 'dddddddd-0000-4000-8000-000000000004', $$select public.revizstmg_admin_abonnement('99999999-0000-4000-8000-000000000009','premium',30)$$);
select pg_temp.essai('admin : ultimate 30 jours', 'authenticated', 'dddddddd-0000-4000-8000-000000000004', $$select public.revizstmg_admin_abonnement('dddddddd-0000-4000-8000-000000000004','ultimate',30)$$);
select 'ligne offerte : ' || offre || '/' || statut || '/' || mode_test from public.revizstmg_abonnements where user_id = 'dddddddd-0000-4000-8000-000000000004';
select pg_temp.essai('admin : retour au gratuit', 'authenticated', 'dddddddd-0000-4000-8000-000000000004', $$select public.revizstmg_admin_abonnement('dddddddd-0000-4000-8000-000000000004','gratuit')$$);
update public.revizstmg_abonnements set stripe_subscription_id='sub_x', statut='active', offre='premium' where user_id = 'dddddddd-0000-4000-8000-000000000004';
select pg_temp.essai('admin : rétrograder un vrai abonnement Stripe', 'authenticated', 'dddddddd-0000-4000-8000-000000000004', $$select public.revizstmg_admin_abonnement('dddddddd-0000-4000-8000-000000000004','gratuit')$$);
select pg_temp.essai('admin : aperçu enrichi', 'authenticated', 'dddddddd-0000-4000-8000-000000000004', 'select public.revizstmg_admin_apercu()');
select pg_temp.essai('admin : comptes enrichis', 'authenticated', 'dddddddd-0000-4000-8000-000000000004', 'select public.revizstmg_admin_comptes()');
