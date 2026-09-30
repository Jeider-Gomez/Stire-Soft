#!/usr/bin/env bash
# Copia de seguridad de la base de datos (MariaDB en Docker). Conserva 14 días.
# Cron (como el usuario que corre Docker):  30 22 * * *  /home/stire/stire/deploy/backup-db.sh
# El nombre lleva fecha y hora (stire-AAAA-MM-DD-HHMM.sql.gz): una copia manual antes de desplegar ya no pisa la
# copia diaria del mismo día.
# Restaurar:  gunzip -c backups/stire-AAAA-MM-DD-HHMM.sql.gz | docker compose -f docker-compose.prod.yml exec -T db mariadb -uroot -p"$DB_ROOT_PASSWORD" basestire
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; source .env.prod; set +a
mkdir -p backups
destino="backups/stire-$(date +%F-%H%M).sql.gz"
# Se escribe en un temporal y se renombra al final: si el volcado falla no queda un .sql.gz a medias que parezca bueno.
temporal="$destino.parcial"
trap 'rm -f "$temporal"' EXIT
docker compose -f docker-compose.prod.yml exec -T db \
  mariadb-dump -uroot -p"$DB_ROOT_PASSWORD" --single-transaction --routines "${DB_DATABASE:-basestire}" \
  | gzip > "$temporal"
mv "$temporal" "$destino"
find backups -name 'stire-*.sql.gz' -mtime +14 -delete
echo "Copia lista: $destino"
