-- Menu administrateur : marquer un signalement d'erreur comme traité (ou le rouvrir).
-- Même garde que les autres fonctions admin : e-mail confirmé de l'un des deux administrateurs, sinon 42501.
-- Ne modifie que la colonne « traite » d'une ligne ; rien d'autre n'est touché.

create or replace function public.revizstmg_admin_signalement_traite(p_id uuid, p_traite boolean default true)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.revizstmg_admin_garde();
  update public.revizstmg_signalements set traite = p_traite where id = p_id;
  if not found then
    raise exception 'signalement_introuvable' using errcode = 'P0002';
  end if;
  return jsonb_build_object('id', p_id, 'traite', p_traite);
end
$$;

revoke all on function public.revizstmg_admin_signalement_traite(uuid, boolean) from public, anon, authenticated;
grant execute on function public.revizstmg_admin_signalement_traite(uuid, boolean) to authenticated;
