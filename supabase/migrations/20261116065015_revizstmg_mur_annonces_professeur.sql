-- Corrige uniquement la garde du mur ; aucune donnée ni table NAH modifiée.
-- Rétablit la garde prévue le02/11, absente du déclencheur réel vérifié le16/11.
create or replace function revizstmg_prive.garde_mur() returns trigger
language plpgsql security definer set search_path = '' as $$
declare moi text := auth.uid()::text;
begin
  if new.class_code is distinct from old.class_code or new.device_id is distinct from old.device_id
     or new.created_at is distinct from old.created_at then
    raise exception 'Message : champ non modifiable.' using errcode = '42501';
  end if;
  if moi is null or revizstmg_prive.est_prof(old.class_code) then return new; end if;
  -- Genre, nom affiché et anonymat sont figés pour tout non-professeur, auteur compris
  -- (sinon un élève fabriquerait une « annonce » signée du professeur).
  if new.kind is distinct from old.kind or new.name is distinct from old.name
     or new.is_anon is distinct from old.is_anon then
    raise exception 'Message : genre, nom et anonymat sont réservés au professeur.' using errcode = '42501';
  end if;
  if new.answer is distinct from old.answer or new.answered_by is distinct from old.answered_by then
    raise exception 'Seul le professeur répond aux questions du mur.' using errcode = '42501';
  end if;
  if old.device_id <> moi and (new.text is distinct from old.text
     or new.chapter_label is distinct from old.chapter_label or new.resolved is distinct from old.resolved) then
    raise exception 'Seul l''auteur modifie son message.' using errcode = '42501';
  end if;
  return new;
end $$;
