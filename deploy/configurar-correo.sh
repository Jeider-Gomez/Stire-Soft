#!/usr/bin/env bash
# Uso en el servidor: ./deploy/configurar-correo.sh (docs/DESPLIEGUE.md §8). Configura el correo de recuperación de contraseña (Gmail) en .env.prod sin mostrar la clave, y reinicia el backend.
set -euo pipefail
cd "$(dirname "$0")/.."
read -r -p "Correo Gmail que enviará los mensajes (ej. stire.unicor@gmail.com): " CORREO
read -r -s -p "Contraseña de aplicación de 16 letras (no se verá al escribir; los espacios no importan): " CLAVE; echo
CLAVE="${CLAVE// /}"
if [[ ! "$CORREO" =~ ^[^@[:space:]]+@[^@[:space:]]+$ ]]; then echo "El correo no parece válido. No se cambió nada."; exit 1; fi
if [[ ${#CLAVE} -ne 16 ]]; then echo "La clave debe tener 16 letras (tiene ${#CLAVE}). No se cambió nada."; exit 1; fi
cp .env.prod .env.prod.bak
set_var() { if grep -q "^$1=" .env.prod; then sed -i "s|^$1=.*|$1=$2|" .env.prod; else echo "$1=$2" >> .env.prod; fi; }
set_var SMTP_HOST smtp.gmail.com
set_var SMTP_PORT 587
set_var SMTP_USER "$CORREO"
set_var SMTP_PASS "$CLAVE"
set_var MAIL_FROM "\"STIRE <$CORREO>\""
chmod 600 .env.prod .env.prod.bak
echo "Guardado. Reiniciando el backend…"
sudo docker compose -f docker-compose.prod.yml --env-file .env.prod up -d backend >/dev/null 2>&1
for i in $(seq 1 30); do sudo docker compose -f docker-compose.prod.yml --env-file .env.prod ps backend --format "{{.Status}}" | grep -q healthy && break; sleep 3; done
echo "Listo: backend $(sudo docker compose -f docker-compose.prod.yml --env-file .env.prod ps backend --format "{{.Status}}"). Avísale a Claude para probar el envío."
