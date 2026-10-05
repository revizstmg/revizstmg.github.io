-- Progression complète de l'élève, synchronisée sur le compte (multi-appareil).
-- Protégée par les policies RLS existantes de profiles (chacun ne voit/écrit
-- que sa propre ligne : id = auth.uid()).
alter table public.profiles add column if not exists progress jsonb not null default '{}'::jsonb;