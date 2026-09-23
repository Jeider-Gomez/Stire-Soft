#!/usr/bin/env bash
# Copia de seguridad diaria de la base de datos (MariaDB en Docker). Conserva 14 días.
# Cron (como el usuario que corre Docker):  0 3 * * *  /home/ubuntu/stire/deploy/backup-db.sh
# Restaurar:  gunzip -c backups/stire-AAAA-MM-DD.sql.gz | docker compose -f docker-compose.prod.yml exec -T db mariadb -uroot -p"$DB_ROOT_PASSWORD" basestire
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; source .env.prod; set +a
mkdir -p backups
docker compose -f docker-compose.prod.yml exec -T db \
  mariadb-dump -uroot -p"$DB_ROOT_PASSWORD" --single-transaction --routines "${DB_DATABASE:-basestire}" \
  | gzip > "backups/stire-$(date +%F).sql.gz"
find backups -name 'stire-*.sql.gz' -mtime +14 -delete
echo "Copia lista: backups/stire-$(date +%F).sql.gz"
