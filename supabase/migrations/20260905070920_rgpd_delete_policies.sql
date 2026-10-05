-- RGPD : chacun peut supprimer sa propre fiche profil (id = auth.uid())…
drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own on public.profiles for delete using (auth.uid() = id);

-- …et effacer ses données de classe rattachées à son appareil.
drop policy if exists lb_delete on public.leaderboard;
create policy lb_delete on public.leaderboard for delete using (true);

drop policy if exists cqr_delete on public.class_quiz_result;
create policy cqr_delete on public.class_quiz_result for delete using (true);