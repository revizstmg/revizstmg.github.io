-- RévizSTMG : règles d'accès des tables sociales, partie 0 (voir partie 1).

-- ---------------------------------------------------------------------------
-- 0. Lignes de test d'avant les comptes : leurs identifiants d'appareil ne
--    correspondent à aucun compte, plus personne ne pourrait les lire ni les
--    effacer. On les retire (9 lignes au 13/10/2026).
-- ---------------------------------------------------------------------------
delete from public.class_member where device_id not in (select id::text from auth.users);
delete from public.class_quiz_result where device_id not in (select id::text from auth.users);
delete from public.class_wall where device_id not in (select id::text from auth.users);
delete from public.class_duel where challenger_device not in (select id::text from auth.users);
delete from public.class_ban where device_id not in (select id::text from auth.users);
delete from public.live_player where device_id not in (select id::text from auth.users);
delete from public.leaderboard where device_id not in (select id::text from auth.users);
delete from public.friend_user where device_id not in (select id::text from auth.users);
delete from public.friend_request where from_device not in (select id::text from auth.users) or to_device not in (select id::text from auth.users);
delete from public.friend_duel where a_device not in (select id::text from auth.users) or b_device not in (select id::text from auth.users);
delete from public.child_stats where device_id not in (select id::text from auth.users);

