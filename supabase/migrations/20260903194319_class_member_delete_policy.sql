-- Permet au prof d'exclure un élève (suppression de sa ligne class_member).
drop policy if exists cm_delete on public.class_member;
create policy cm_delete on public.class_member for delete using (true);