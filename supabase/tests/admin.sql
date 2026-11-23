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
