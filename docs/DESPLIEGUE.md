# Cómo desplegar STIRE (gratis y con todas sus funciones)

Decisiones y motivos: `docs/ADR_DECISIONES_ARQUITECTURA.md` (ADR 09 y ADR 12). Esta guía es solo el paso a paso.

**Arquitectura:** frontend en **Vercel** (gratis) · backend + base de datos + HTTPS en **una máquina virtual** con Docker
(`docker-compose.prod.yml`) · correo de recuperación por **SMTP** (Gmail) · Tutor con la clave de Gemini de cada estudiante
(no cuesta nada al servidor).

> Lo que se verificó con Docker real (23/09): la imagen compila, arranca en `NODE_ENV=production` contra MariaDB 11.4 con las
> 9 migraciones, `/health` responde, Swagger queda apagado, el sandbox de código funciona dentro del contenedor, los comandos
> de migración y del primer admin funcionan desde la imagen, y la recuperación de contraseña completa (correo real por SMTP →
> enlace → cambio → sesión anterior cerrada). **No** se ha probado en Oracle ni en Vercel: esos pasos los haces tú con tus cuentas.

> **Decisión cerrada (ADR 13):** frontend en Vercel, backend + MariaDB en la VM de Oracle, Gmail para el correo y DuckDNS para el dominio. Costo $0. La base **no** se migra.
> **Sin probar:** la imagen se verificó en x86; la VM de Oracle es **arm64**, así que el primer `docker compose … up --build` la construye en arm64 (tarda ~10 min). Si algo falla ahí, avísame con el error.

## 0. Qué necesitas (una sola vez)

| Cuenta | Para qué | Costo |
|---|---|---|
| GitHub (ya tienes el repo) | Vercel despliega desde ahí | $0 |
| Vercel (Hobby) | Frontend | $0 (solo uso no comercial: un proyecto universitario califica) |
| Oracle Cloud (Always Free) | La máquina del backend y la base | $0 (pide tarjeta solo para verificar la identidad) |
| Gmail dedicada (ej. `stire.notificaciones@gmail.com`) | Enviar correos de recuperación | $0 |
| Un nombre de dominio para la API | HTTPS | $0: DuckDNS (`stire-api.duckdns.org`) o `nip.io` |

**Alternativas al servidor si Oracle no te da cupo o no quieres tarjeta:** Railway Hobby (~$5/mes, sin administrar servidor:
usa el mismo `Dockerfile`), o Azure for Students ($100 de crédito sin tarjeta, con correo institucional verificado; una VM
pequeña con el mismo `docker-compose.prod.yml`). El crédito de DigitalOcean del paquete de estudiantes **terminó el 1/ago/2026**.
No uses Render gratis (se duerme a los 15 min y bloquea el correo por SMTP) ni Vercel para el backend (no corre el sandbox
ni las tareas programadas).

## 1. La máquina del backend (Oracle Always Free)

1. Crea la cuenta en oracle.com/cloud/free y una instancia **Ampere A1** (Always Free; desde el 15/jun/2026 son 2 núcleos y
   12 GB) con **Ubuntu 24.04**. Descarga la llave SSH. Si dice «Out of capacity», reintenta en otro momento o en otro dominio de disponibilidad.
2. Abre los puertos **80 y 443** en dos sitios (si no, Caddy no puede sacar el certificado):
   - Consola de Oracle → Redes → tu VCN → Lista de seguridad → *Ingress rule* TCP 80 y 443 desde `0.0.0.0/0`.
   - Dentro de la máquina: `sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT`,
     lo mismo con `--dport 443`, y `sudo netfilter-persistent save`.
3. Instala Docker: `curl -fsSL https://get.docker.com | sudo sh && sudo usermod -aG docker $USER` (cierra y abre la sesión SSH).
4. Reserva una IP pública fija (Oracle la da) y crea el nombre: en duckdns.org registra `stire-api` apuntando a esa IP
   (o usa `IP-con-guiones.nip.io`, p. ej. `129-153-10-20.nip.io`).
5. **Que Oracle no la considere inactiva:** Oracle puede reclamar máquinas gratuitas con uso muy bajo durante 7 días. Pasa la cuenta
   a *Pay As You Go* (sigue sin cobrar mientras no excedas lo gratuito) y monitorea la API con UptimeRobot (paso 6).

## 2. Backend

```bash
git clone https://github.com/Jeider-Gomez/Stire-Soft.git stire && cd stire
cp deploy/prod.env.example .env.prod && nano .env.prod
```

Completa `.env.prod` (cada secreto: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`, o
`openssl rand -hex 32`): `API_DOMAIN`, `DB_ROOT_PASSWORD`, `DB_PASSWORD`, `JWT_SECRET`, `TUTOR_KEY_ENCRYPTION_SECRET`,
`FRONTEND_URL` y `CORS_ORIGIN` (la URL de Vercel del paso 3; puedes dejarlas y corregirlas después) y el correo (paso 4).

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build      # la primera vez tarda ~10 min (ARM)
docker compose -f docker-compose.prod.yml --env-file .env.prod exec backend node node_modules/typeorm/cli.js migration:run -d dist/data-source.js
docker compose -f docker-compose.prod.yml --env-file .env.prod exec -e ADMIN_EMAIL=tu@correo.com -e ADMIN_PASSWORD='UnaClaveLarga1!' backend node dist/scripts/create-first-admin.js
curl https://TU-DOMINIO/health        # {"status":"ok"}
```

- **No** ejecutes los seeds de demo (`db:seed:demo`) en producción: crean cuentas con contraseña pública.
- Actualizar más adelante: `git pull && docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build`, y si hay
  migraciones nuevas, el comando `migration:run` de arriba.

## 3. Frontend en Vercel

1. vercel.com → *Add New → Project* → importa el repositorio de GitHub.
2. **Root Directory:** `frontend-nuxt` (Vercel detecta Nuxt solo).
3. *Environment Variables:* `NUXT_PUBLIC_API_BASE` = `https://TU-DOMINIO` (el del paso 1, con https y sin barra final).
   No pongas `NUXT_PUBLIC_DEMO_MODE`.
4. Deploy. Copia la URL (`https://algo.vercel.app`) a `FRONTEND_URL` y `CORS_ORIGIN` en `.env.prod` y reinicia el backend:
   `docker compose -f docker-compose.prod.yml --env-file .env.prod up -d`.

**Con Claude por MCP:** en Claude Code escribe `/mcp`, elige *claude.ai Vercel* y autoriza en el navegador. Con eso Claude puede
ver tus proyectos, despliegues y registros en Vercel para diagnosticar. Crear el proyecto conviene hacerlo una vez en el panel
(pasos 1-4): es lo más simple y deja el despliegue automático en cada `git push`.

## 4. Correo de recuperación de contraseña (Gmail)

1. En la cuenta Gmail dedicada activa la **verificación en dos pasos** (myaccount.google.com/security).
2. Ve a myaccount.google.com/apppasswords, crea una contraseña de aplicación llamada «STIRE» y copia las 16 letras.
3. En `.env.prod`: `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER=<la cuenta>`, `SMTP_PASS=<las 16 letras>`,
   `MAIL_FROM="STIRE <la cuenta>"`. Límite de Gmail ≈ 500 correos/día: sobra para un curso.
4. Prueba: en la pantalla de login pulsa «¿Olvidaste tu clave?» con tu correo y revisa que llegue (mira también spam).

Cambiar de proveedor (Brevo, Resend…) es cambiar estas 5 variables, sin tocar código.

## 5. Copias de seguridad

`deploy/backup-db.sh` guarda un `.sql.gz` diario y conserva 14 días. Actívalo: `crontab -e` →
`0 3 * * * /home/ubuntu/stire/deploy/backup-db.sh`. Descarga una copia a tu computador de vez en cuando
(`scp ubuntu@TU-IP:stire/backups/stire-AAAA-MM-DD.sql.gz .`); si la máquina se pierde, las copias locales no sirven de nada.

## 6. Comprobación final (10 minutos)

- [ ] `https://TU-DOMINIO/health` → `{"status":"ok"}` y `https://TU-DOMINIO/docs` → 404 (Swagger apagado).
- [ ] La página de Vercel abre y `Iniciar sesión` funciona con el admin que creaste.
- [ ] Sin errores de CORS en la consola del navegador (si los hay: `CORS_ORIGIN` no coincide con la URL exacta de Vercel).
- [ ] Regístrate como estudiante con otro correo, únete a una clase y resuelve un ejercicio de código (prueba el sandbox).
- [ ] Recuperación de contraseña: llega el correo, el enlace funciona y el enlace no se puede usar dos veces.
- [ ] Un estudiante guarda su clave de Google AI Studio en el Tutor y recibe respuesta.
- [ ] UptimeRobot (uptimerobot.com, gratis): monitor HTTPS a `/health` cada 5 min con aviso a tu correo.

## Riesgos que conviene conocer

- **Una sola máquina:** si cae, cae todo. Para una sustentación o un curso de un semestre es aceptable; las copias diarias son tu red de seguridad.
- **Oracle:** la capa gratuita se recortó a la mitad en junio de 2026 sin aviso; si cambia de nuevo, el plan B (Railway Hobby o Azure) usa los mismos archivos.
- **Tutor:** cada estudiante usa su propia cuota gratuita de Gemini; la interfaz ya explica el límite y la privacidad.
