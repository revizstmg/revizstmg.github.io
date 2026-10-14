#!/bin/bash
# Vérifie les règles d'accès de RévizSTMG sur une base PostgreSQL locale et
# jetable (jamais sur Supabase) : imitation minimale de Supabase (rôles anon et
# authenticated, auth.uid()), toutes les migrations du dossier, les fichiers
# passés en argument (par exemple ceux de a-valider/), puis les scénarios de
# regles-acces.sql (élève, prof, intrus, parent sans compte, suppression).
# Usage : supabase/tests/lancer.sh [fichier.sql…]   (PostgreSQL 16 installé)
set -e
ICI=$(cd "$(dirname "$0")" && pwd)
RACINE=$(dirname "$ICI")
DOSSIER=${PGESSAI:-/var/tmp/revizstmg-pgtest}
PORT=54329
BIN=$(ls -d /usr/lib/postgresql/*/bin | tail -1)
if [ ! -d "$DOSSIER/data" ]; then
  mkdir -p "$DOSSIER" && chown postgres:postgres "$DOSSIER"
  runuser -u postgres -- "$BIN/initdb" -D "$DOSSIER/data" -U postgres -A trust >/dev/null
fi
runuser -u postgres -- "$BIN/pg_ctl" -D "$DOSSIER/data" -o "-p $PORT -k $DOSSIER -c listen_addresses=''" -l "$DOSSIER/log.txt" start >/dev/null 2>&1 || true
sleep 1
P="psql -h $DOSSIER -p $PORT -U postgres -q -v ON_ERROR_STOP=1"
$P -c "drop database if exists essai" -c "create database essai" >/dev/null 2>&1
$P -d essai -f "$ICI/imitation-supabase.sql" >/dev/null
for f in "$RACINE"/migrations/*.sql "$@"; do
  grep -v "create extension if not exists pg_cron" "$f" | $P -d essai >/dev/null 2>&1 || { echo "ÉCHEC : $f"; grep -v "create extension if not exists pg_cron" "$f" | $P -d essai; exit 1; }
done
$P -d essai >/dev/null <<'SQL'
insert into auth.users values ('aaaaaaaa-0000-4000-8000-000000000001','a@t.fr'),('bbbbbbbb-0000-4000-8000-000000000002','b@t.fr'),('cccccccc-0000-4000-8000-000000000003','prof@t.fr');
insert into public.profiles (id, role, name) values ('aaaaaaaa-0000-4000-8000-000000000001','eleve','A'),('bbbbbbbb-0000-4000-8000-000000000002','eleve','B'),('cccccccc-0000-4000-8000-000000000003','prof','P');
SQL
$P -d essai -f "$ICI/regles-acces.sql" 2>&1 | grep -E "^ ?(ok refus|t$|f$)|ERROR|ACCEPTÉ" | sort | uniq -c
echo "Scénarios terminés (une erreur arrête le script ; « f » signale une vérification ratée)."
