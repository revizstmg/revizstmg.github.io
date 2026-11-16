begin;
create temporary table audit_mur (like public.class_wall including defaults) on commit drop;
create trigger audit_garde before update on audit_mur for each row execute function revizstmg_prive.garde_mur();
insert into audit_mur (id,class_code,device_id,name,kind,text,reactions,is_anon,resolved) values
('00000000-0000-4000-8000-000000000011','audit-sans-classe','00000000-0000-4000-8000-000000000001','Test','question','Question','{}',false,false),
('00000000-0000-4000-8000-000000000012','audit-sans-classe','00000000-0000-4000-8000-000000000002','Autre','message','Message','{}',false,false);
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
do $test$
begin
 begin
  update audit_mur set kind='announce' where id='00000000-0000-4000-8000-000000000011';
  raise exception 'ECHEC : annonce autorisée';
 exception when insufficient_privilege then null; end;
 begin
  update audit_mur set name='Professeur' where id='00000000-0000-4000-8000-000000000011';
  raise exception 'ECHEC : usurpation autorisée';
 exception when insufficient_privilege then null; end;
 begin
  update audit_mur set answer='Réponse usurpée' where id='00000000-0000-4000-8000-000000000011';
  raise exception 'ECHEC : réponse professeur autorisée';
 exception when insufficient_privilege then null; end;
 begin
  update audit_mur set text='Modification interdite' where id='00000000-0000-4000-8000-000000000012';
  raise exception 'ECHEC : autre auteur modifiable';
 exception when insufficient_privilege then null; end;
 update audit_mur set text='Ma question corrigée' where id='00000000-0000-4000-8000-000000000011';
 update audit_mur set reactions='{"test":1}'::jsonb where id='00000000-0000-4000-8000-000000000012';
 if not exists(select 1 from audit_mur where text='Ma question corrigée') then raise exception 'ECHEC : édition légitime'; end if;
 if not exists(select 1 from audit_mur where reactions='{"test":1}'::jsonb) then raise exception 'ECHEC : réaction légitime'; end if;
end $test$;
rollback;
