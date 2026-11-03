-- Scénarios d'accès de RévizSTMG (lancés par lancer.sh, sur une base locale jetable).
\set ON_ERROR_STOP 1
\set A '''{"sub":"aaaaaaaa-0000-4000-8000-000000000001","role":"authenticated"}'''
\set B '''{"sub":"bbbbbbbb-0000-4000-8000-000000000002","role":"authenticated"}'''
\set P '''{"sub":"cccccccc-0000-4000-8000-000000000003","role":"authenticated"}'''
-- Refus attendu : RLS (42501) ou garde-fou (42501) ; tout autre résultat arrête le script.
create or replace function public.refus(q text, quoi text) returns text language plpgsql as $$
begin
  begin execute q; exception when insufficient_privilege then return 'ok refus : ' || quoi;
    when raise_exception then return 'ok refus (limite) : ' || quoi; end;
  raise exception 'ACCEPTÉ À TORT : %', quoi using errcode = 'ZZ999';
end $$;
grant execute on function public.refus(text, text) to anon, authenticated;
create or replace function public.compte(q text) returns bigint language plpgsql as $$
declare n bigint; begin execute 'select count(*) from (' || q || ') x' into n; return n; end $$;
grant execute on function public.compte(text) to anon, authenticated;
create or replace function public.lignes(q text) returns bigint language plpgsql as $$
declare n bigint; begin execute q; get diagnostics n = row_count; return n; end $$;
grant execute on function public.lignes(text) to anon, authenticated;

-- Le prof crée sa classe
set role authenticated; set request.jwt.claims to :P;
insert into teacher_class (code, owner_id, owner_name, label) values ('stmg-abcde', auth.uid(), 'M. Prof', 'Classe 1'), ('stmg-fghij', auth.uid(), 'M. Prof', 'Classe 2');
insert into class_member (class_code, device_id, name, role) values ('stmg-abcde', auth.uid()::text, 'M. Prof', 'prof');
insert into class_wall (class_code, device_id, name, kind, text) values ('stmg-abcde', auth.uid()::text, 'M. Prof', 'announce', 'Bienvenue');
insert into class_meta (class_code, announcement) values ('stmg-abcde', 'Contrôle vendredi');
insert into class_quiz (class_code, author_id, title, status) values ('stmg-abcde', auth.uid(), 'QCM 1', 'approved');
select 'prof : classe créée' as etape;

-- Élève A rejoint et participe
reset role; set role authenticated; set request.jwt.claims to :A;
select (select count(*) from revizstmg_classe('stmg-abcde')) = 1 as "A trouve la classe par son code";
select compte('select * from teacher_class') = 0 as "A ne liste pas les classes";
select refus($$insert into class_member (class_code, device_id, name, role) values ('stmg-abcde', 'bbbbbbbb-0000-4000-8000-000000000002', 'Usurpé', 'eleve')$$, 'A inscrit B à sa place');
select refus($$insert into class_member (class_code, device_id, name, role) values ('stmg-abcde', auth.uid()::text, 'A', 'prof')$$, 'A se déclare prof');
insert into class_member (class_code, device_id, name, role) values ('stmg-abcde', auth.uid()::text, 'A', 'eleve')
  on conflict (class_code, device_id) do update set name = excluded.name;
insert into class_member (class_code, device_id, name, role, xp) values ('stmg-abcde', auth.uid()::text, 'A', 'eleve', 50)
  on conflict (class_code, device_id) do update set xp = excluded.xp;
select compte($$select * from class_member where class_code = 'stmg-abcde'$$) = 2 as "A voit les 2 membres";
select compte($$select id from class_wall where class_code = 'stmg-abcde'$$) = 1 as "A voit le mur";
select refus($$insert into class_wall (class_code, device_id, name, kind, text) values ('stmg-abcde', auth.uid()::text, 'A', 'announce', 'Fausse annonce')$$, 'A publie une annonce');
insert into class_wall (class_code, device_id, name, kind, text) values ('stmg-abcde', auth.uid()::text, 'A', 'question', 'Comment calcule-t-on la TVA ?');
select refus($$insert into class_wall (class_code, device_id, name, kind, text) values ('stmg-abcde', auth.uid()::text, 'A', 'question', 'Encore')$$, 'A poste deux fois en 15 s');
update class_wall set reactions = '{"👏":1}' where kind = 'announce';
select refus($$update class_wall set text = 'piraté' where kind = 'announce'$$, 'A modifie l''annonce du prof');
select refus($$update class_wall set answer = 'réponse' where kind = 'question'$$, 'A répond à la place du prof');
select refus($$update class_wall set kind = 'announce', name = 'M. Prof' where kind = 'question'$$, 'A (auteur) transforme sa question en fausse annonce du prof');
select refus($$update class_wall set name = 'M. Prof' where kind = 'question'$$, 'A (auteur) change le nom affiché');
select refus($$update class_wall set is_anon = true where kind = 'question'$$, 'A (auteur) change l''anonymat');
select lignes($$update class_wall set text = 'Comment calcule-t-on la TVA collectée ?' where kind = 'question'$$) = 1 as "A modifie encore son propre texte";
select refus($$update class_member set class_code = 'stmg-fghij' where device_id = auth.uid()::text$$, 'A change de classe par PATCH class_code');
select refus($$update class_member set device_id = 'cccccccc-0000-4000-8000-000000000003' where device_id = auth.uid()::text$$, 'A change son device_id de membre');
select lignes($$update class_meta set announcement = 'piraté'$$) = 0 as "A ne modifie pas les réglages";
select refus($$insert into class_quiz (class_code, author_id, title, status) values ('stmg-abcde', auth.uid(), 'QCM A', 'approved')$$, 'A publie un QCM approuvé');
insert into class_quiz (class_code, author_id, title, status) values ('stmg-abcde', auth.uid(), 'Proposition A', 'proposed');
insert into class_quiz_result (quiz_id, device_id, name, score, total) select id, auth.uid()::text, 'A', 4, 5 from class_quiz where title = 'QCM 1';
insert into class_duel (class_code, challenger_device, challenger_name, challenger_score, status) values ('stmg-abcde', auth.uid()::text, 'A', 3, 'open');
insert into leaderboard (class_code, device_id, week, name, courses) values ('stmg-abcde', auth.uid()::text, '2026-W42', 'A', 5);
insert into leaderboard (class_code, device_id, week, name, courses) values ('autre-classe', auth.uid()::text, '2026-W42', 'A', 2);

-- Élève B, hors de la classe
reset role; set role authenticated; set request.jwt.claims to :B;
select compte($$select * from class_member where class_code = 'stmg-abcde'$$) = 0 as "B ne voit pas les membres";
select compte($$select id from class_wall$$) = 0 as "B ne voit pas le mur";
select compte($$select * from class_quiz_result$$) = 0 as "B ne voit pas les résultats";
select compte($$select * from leaderboard$$) = 0 as "B ne voit pas le classement des autres";
select string_agg(code, ',') as "ligue vue par B (codes masqués)" from revizstmg_ligue('2026-W42');
select lignes($$update class_member set name = 'piraté' where class_code = 'stmg-abcde'$$) = 0 as "B ne modifie pas un membre";
select compte($$select * from class_member where name = 'piraté'$$) = 0 as "rien de modifié";
select refus($$insert into class_ban (class_code, device_id) values ('stmg-abcde', 'aaaaaaaa-0000-4000-8000-000000000001')$$, 'B exclut A');
-- B rejoint, relève le duel de A
insert into class_member (class_code, device_id, name) values ('stmg-abcde', auth.uid()::text, 'B');
update class_duel set opponent_device = auth.uid()::text, opponent_name = 'B', opponent_score = 4, opponent_total = 5, status = 'done' where status = 'open';
select compte($$select * from class_duel where status = 'done'$$) = 1 as "B a relevé le duel";
select refus($$update class_duel set challenger_score = 0$$, 'B change le score de A');
select lignes($$delete from class_wall where kind = 'question'$$) = 0 as "B n'efface pas le message de A";
select compte($$select id from class_wall where kind = 'question'$$) = 1 as "le message de A est toujours là";

-- Amis
reset role; set role authenticated; set request.jwt.claims to :A;
insert into friend_user (device_id, code, name) values (auth.uid()::text, 'AAAAAA', 'A') on conflict (device_id) do update set name = excluded.name;
insert into friend_user (device_id, code, name) values (auth.uid()::text, 'ZZZZZZ', 'A bis') on conflict (device_id) do update set code = excluded.code, name = excluded.name;
select code = 'AAAAAA' as "le code ami reste le même" from friend_user where device_id = auth.uid()::text;
reset role; set role authenticated; set request.jwt.claims to :B;
insert into friend_user (device_id, code, name) values (auth.uid()::text, 'BBBBBB', 'B');
select compte($$select * from friend_user where code = 'AAAAAA'$$) = 0 as "B ne lit pas la fiche de A";
select (select name from revizstmg_trouver_ami('AAAAAA')) = 'A bis' as "B trouve A par son code";
insert into friend_request (from_device, from_name, from_code, to_device, to_name, status) values (auth.uid()::text, 'B', 'BBBBBB', 'aaaaaaaa-0000-4000-8000-000000000001', 'A', 'pending');
select refus($$update friend_request set status = 'accepted'$$, 'B accepte sa propre demande');
reset role; set role authenticated; set request.jwt.claims to :A;
update friend_request set status = 'accepted';
reset role; set role authenticated; set request.jwt.claims to :B;
select compte($$select * from friend_user where code = 'AAAAAA'$$) = 1 as "amis : B voit A";
insert into friend_duel (a_device, a_name, b_device, b_name, status) values (auth.uid()::text, 'B', 'aaaaaaaa-0000-4000-8000-000000000001', 'A', 'pending');
select refus($$update friend_duel set status = 'live'$$, 'B accepte son propre défi');
reset role; set role authenticated; set request.jwt.claims to :A;
update friend_duel set status = 'live';
select refus($$update friend_duel set a_score = 99$$, 'A change le score de B');
update friend_duel set b_score = 7, b_done = true;
select refus($$update friend_duel set status = 'done'$$, 'A termine avant B');
reset role; set role authenticated; set request.jwt.claims to :B;
update friend_duel set a_score = 5, a_done = true;
update friend_duel set status = 'done';
select status = 'done' as "défi terminé" from friend_duel;

-- Suivi parent
reset role; set role authenticated; set request.jwt.claims to :A;
insert into child_stats (device_id, code, name, xp) values (auth.uid()::text, 'PAAAAA', 'A', 120);
reset role; set role authenticated; set request.jwt.claims to :B;
select compte($$select * from child_stats$$) = 0 as "B ne lit pas le suivi de A";
reset role; set role anon; reset request.jwt.claims;
select (select xp from revizstmg_stats_enfant('PAAAAA')) = 120 as "le parent (sans compte) lit par le code";
select refus($$select * from class_member$$, 'anon lit les membres');
select refus($$select * from revizstmg_trouver_ami('AAAAAA')$$, 'anon cherche un ami');
insert into revizstmg_signalements (page, message) values ('/test', 'Une erreur dans la correction');
select refus($$select * from revizstmg_signalements$$, 'anon relit les signalements');

-- Anonymat du mur, classement et durcissements (B est encore membre)
reset role;
set session_replication_role = replica;
insert into class_wall (class_code, device_id, name, kind, text, is_anon) values ('stmg-abcde', 'aaaaaaaa-0000-4000-8000-000000000001', 'A', 'question', 'Question anonyme de A', true);
set session_replication_role = default;
set role authenticated; set request.jwt.claims to :B;
select (select count(*) from revizstmg_mur('stmg-abcde')) = 3 as "B lit le mur par la fonction";
select (select device_id from revizstmg_mur('stmg-abcde') where text = 'Question anonyme de A') is null as "B ne voit pas l'auteur du message anonyme";
select (select device_id from revizstmg_mur('stmg-abcde') where kind = 'announce') is not null as "B voit l'auteur d'un message non anonyme";
select refus($$select device_id from class_wall$$, 'B lit device_id directement sur le mur');
select compte($$select id, text, is_anon from class_wall$$) = 3 as "les autres colonnes du mur restent lisibles";
reset role; set role authenticated; set request.jwt.claims to :A;
select (select device_id from revizstmg_mur('stmg-abcde') where text = 'Question anonyme de A') = 'aaaaaaaa-0000-4000-8000-000000000001' as "A retrouve son message anonyme";
select lignes($$delete from class_wall where text = 'Question anonyme de A'$$) = 1 as "A supprime son message anonyme";
reset role; set role authenticated; set request.jwt.claims to :P;
select (select count(*) from revizstmg_mur('stmg-abcde')) = 2 as "le prof lit le mur";
reset role; set role authenticated; set request.jwt.claims to :A;
select compte($$select * from revizstmg_mur('stmg-fghij')$$) = 0 as "A ne lit pas le mur d'une autre classe";
reset role; set role anon; reset request.jwt.claims;
select refus($$select * from revizstmg_mur('stmg-abcde')$$, 'anon lit le mur');
reset role; set role authenticated; set request.jwt.claims to :B;
-- Duels et demandes forgés
select refus($$insert into friend_duel (a_device, a_name, b_device, b_name, status) values (auth.uid()::text, 'B', 'aaaaaaaa-0000-4000-8000-000000000001', 'A', 'done')$$, 'B crée un duel ami déjà terminé');
select refus($$insert into friend_duel (a_device, a_name, b_device, b_name, status, b_score, b_done) values (auth.uid()::text, 'B', 'aaaaaaaa-0000-4000-8000-000000000001', 'A', 'pending', 5, true)$$, 'B crée un duel ami avec le score de A');
select refus($$insert into friend_duel (a_device, a_name, b_device, b_name, status) values (auth.uid()::text, 'B', 'cccccccc-0000-4000-8000-000000000003', 'P', 'pending')$$, 'B défie quelqu''un qui n''est pas son ami');
select refus($$insert into class_duel (class_code, challenger_device, challenger_name, status) values ('stmg-abcde', auth.uid()::text, 'B', 'done')$$, 'B crée un duel de classe déjà terminé');
select refus($$insert into class_duel (class_code, challenger_device, challenger_name, status, opponent_device) values ('stmg-abcde', auth.uid()::text, 'B', 'open', 'aaaaaaaa-0000-4000-8000-000000000001')$$, 'B impose un adversaire à un duel de classe');
insert into class_duel (class_code, challenger_device, challenger_name, status) values ('stmg-abcde', auth.uid()::text, 'B', 'open');
insert into friend_request (from_device, from_name, from_code, to_device, to_name, status) values (auth.uid()::text, 'M. Inspecteur', 'XXXXXX', 'cccccccc-0000-4000-8000-000000000003', 'P', 'pending');
select from_name = 'B' and from_code = 'BBBBBB' as "le nom de l'émetteur d'une demande vient du serveur" from friend_request where to_device = 'cccccccc-0000-4000-8000-000000000003';
delete from friend_request where to_device = 'cccccccc-0000-4000-8000-000000000003';
-- Classement
insert into leaderboard (class_code, device_id, week, name, courses) values ('stmg-abcde', auth.uid()::text, '2026-W42', 'B', 3);
select compte($$select * from leaderboard where class_code = 'stmg-abcde'$$) = 2 as "B (membre) lit le classement de la classe";

-- Le prof exclut B
reset role; set role authenticated; set request.jwt.claims to :P;
insert into class_ban (class_code, device_id) values ('stmg-abcde', 'bbbbbbbb-0000-4000-8000-000000000002') on conflict do nothing;
delete from class_member where class_code = 'stmg-abcde' and device_id = 'bbbbbbbb-0000-4000-8000-000000000002';
select string_agg(label || '=' || total, ', ') as "ligue des classes du prof" from revizstmg_ligue_classe('stmg-abcde', '2026-W42');
reset role; set role authenticated; set request.jwt.claims to :B;
select refus($$insert into class_member (class_code, device_id, name) values ('stmg-abcde', auth.uid()::text, 'B')$$, 'B exclu revient');
select compte($$select * from leaderboard where class_code = 'stmg-abcde'$$) = 0 as "B exclu ne lit plus le classement de la classe";
select compte($$select * from leaderboard where device_id = auth.uid()::text$$) = 0 as "B exclu : sa ligne de classement a disparu";
reset role;
select (select count(*) from leaderboard where class_code = 'stmg-abcde' and device_id like 'bbbbbbbb%') = 0 as "exclusion : ligne de classement retirée";

-- Ce que A a envoyé ou reçu, à effacer avec son compte (insertion directe, sans
-- les déclencheurs de contrôle : seul compte ici le résultat de la suppression).
reset role;
set session_replication_role = replica;
insert into revizstmg_signalements (page, message, auteur) values ('/test', 'Signalement de A', 'aaaaaaaa-0000-4000-8000-000000000001');
insert into revizstmg_prive.abonnements_push (endpoint, p256dh, auth, compte) values ('https://push.test/a', 'p', 'a', 'aaaaaaaa-0000-4000-8000-000000000001');
insert into class_duel (class_code, challenger_device, challenger_name, opponent_device, opponent_name) values ('stmg-abcde', 'cccccccc-0000-4000-8000-000000000003', 'P', 'aaaaaaaa-0000-4000-8000-000000000001', 'A');
insert into class_ban (class_code, device_id) values ('stmg-autre', 'aaaaaaaa-0000-4000-8000-000000000001');
set session_replication_role = default;

-- A supprime son compte
reset role; set role authenticated; set request.jwt.claims to :A;
select revizstmg_supprimer_compte();
reset role;
-- Une ligne par vérification, pour que lancer.sh compte chaque « t » ou « f ».
select ok from (values
  (((select count(*) from auth.users where email = 'a@t.fr') = 0), 'compte A supprimé'),
  (((select count(*) from profiles where name = 'A') = 0), 'profil A supprimé'),
  (((select count(*) from class_member where device_id like 'aaaaaaaa%') + (select count(*) from friend_user where device_id like 'aaaaaaaa%')
  + (select count(*) from friend_request) + (select count(*) from friend_duel) + (select count(*) from child_stats)
  + (select count(*) from leaderboard where device_id like 'aaaaaaaa%') + (select count(*) from class_wall where device_id like 'aaaaaaaa%') = 0), 'données de A effacées'),
  (((select count(*) from revizstmg_signalements where message = 'Signalement de A') = 0), 'signalement de A effacé'),
  (((select count(*) from revizstmg_signalements where auteur is null) = 1), 'signalement anonyme conservé'),
  (((select count(*) from revizstmg_prive.abonnements_push) = 0), 'rappels de A effacés'),
  (((select count(*) from class_duel where opponent_device like 'aaaaaaaa%' or challenger_device like 'aaaaaaaa%') = 0), 'duels de classe de A effacés'),
  (((select count(*) from class_ban where device_id like 'aaaaaaaa%') = 0), 'exclusions de A effacées'),
  (((select count(*) from class_ban where device_id like 'bbbbbbbb%') = 1), 'exclusion de B conservée')
) as v(ok, verification);

-- Compteurs d'IA (revizstmg_ia_usage) : réservation atomique, remboursement, aucun accès direct
reset role; set role service_role;
select public.revizstmg_ia_reserver('bbbbbbbb-0000-4000-8000-000000000002', 'tuteur', '2026-10', 1) as ia_premiere_utilisation_acceptee;
select not public.revizstmg_ia_reserver('bbbbbbbb-0000-4000-8000-000000000002', 'tuteur', '2026-10', 1) as ia_seconde_refusee_au_plafond;
select public.revizstmg_ia_reserver('bbbbbbbb-0000-4000-8000-000000000002', 'tuteur', '2026-11', 1) as ia_nouveau_mois_accepte;
select not public.revizstmg_ia_reserver('bbbbbbbb-0000-4000-8000-000000000002', 'serie', '2026-10', 0) as ia_plafond_zero_refuse;
select public.revizstmg_ia_rendre('bbbbbbbb-0000-4000-8000-000000000002', 'tuteur', '2026-10');
select public.revizstmg_ia_reserver('bbbbbbbb-0000-4000-8000-000000000002', 'tuteur', '2026-10', 1) as ia_utilisation_rendue_reutilisable;
select public.revizstmg_ia_rendre('bbbbbbbb-0000-4000-8000-000000000002', 'tuteur', '2026-10');
select public.revizstmg_ia_rendre('bbbbbbbb-0000-4000-8000-000000000002', 'tuteur', '2026-10');
select ((select n from public.revizstmg_ia_usage where user_id = 'bbbbbbbb-0000-4000-8000-000000000002' and fonction = 'tuteur' and periode = '2026-10') = 0) as ia_compteur_jamais_negatif;
select public.revizstmg_ia_reserver('cccccccc-0000-4000-8000-000000000003', 'tuteur', '2026-10', 1) as ia_compteur_propre_a_chaque_compte;
reset role;
-- Un élève ne lit que son compteur, ne peut ni l'écrire ni appeler les fonctions de réservation
set role authenticated; set request.jwt.claims to :B;
select (public.compte('select 1 from public.revizstmg_ia_usage') = 2) as ia_eleve_ne_lit_que_ses_compteurs;
select public.refus('update public.revizstmg_ia_usage set n = 0', 'élève : remise à zéro de son compteur');
select public.refus('insert into public.revizstmg_ia_usage (user_id, fonction, periode, n) values (auth.uid(), ''serie'', ''2026-10'', 0)', 'élève : création d''un compteur');
select public.refus('delete from public.revizstmg_ia_usage', 'élève : suppression de son compteur');
select public.refus('select public.revizstmg_ia_reserver(auth.uid(), ''serie'', ''2026-12'', 5)', 'élève : appel direct de la réservation');
select public.refus('select public.revizstmg_ia_rendre(auth.uid(), ''tuteur'', ''2026-10'')', 'élève : appel direct du remboursement');
reset role; set role anon;
select public.refus('select count(*) from public.revizstmg_ia_usage', 'visiteur : lecture des compteurs');
reset role;

-- Suppression du compte du professeur : ses classes sont vidées
set role authenticated; set request.jwt.claims to :P;
select revizstmg_supprimer_compte();
reset role;
select ok from (values
  (((select count(*) from teacher_class) = 0), 'classes du prof supprimées'),
  (((select count(*) from class_member where class_code in ('stmg-abcde','stmg-fghij')) = 0), 'membres de ses classes effacés'),
  (((select count(*) from class_wall where class_code in ('stmg-abcde','stmg-fghij')) = 0), 'mur de ses classes effacé'),
  (((select count(*) from class_quiz) = 0), 'QCM de ses classes effacés'),
  (((select count(*) from class_quiz_result) = 0), 'résultats de QCM effacés'),
  (((select count(*) from class_duel where class_code in ('stmg-abcde','stmg-fghij')) = 0), 'duels de ses classes effacés'),
  (((select count(*) from leaderboard where class_code in ('stmg-abcde','stmg-fghij')) = 0), 'classement de ses classes effacé'),
  (((select count(*) from leaderboard where class_code = 'autre-classe') = 0), 'ligne de A dans une autre classe : déjà effacée avec son compte')
) as v(ok, verification);
