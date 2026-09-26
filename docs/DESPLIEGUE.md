# Cómo desplegar STIRE (gratis y con todas sus funciones)

Decisiones y motivos: `docs/ADR_DECISIONES_ARQUITECTURA.md` (ADR 09 y ADR 12). Esta guía es solo el paso a paso.

**Arquitectura:** frontend estático en **Cloudflare Pages** (gratis; Vercel como alternativa) · backend + base de datos + HTTPS en **una máquina virtual** con Docker
(`docker-compose.prod.yml`) · correo de recuperación por **SMTP** (Gmail) · Tutor con la clave de Gemini de cada estudiante
(no cuesta nada al servidor).

> Lo que se verificó con Docker real (23/09): la imagen compila, arranca en `NODE_ENV=production` contra MariaDB 11.4 con las
> 9 migraciones, `/health` responde, Swagger queda apagado, el sandbox de código funciona dentro del contenedor, los comandos
> de migración y del primer admin funcionan desde la imagen, y la recuperación de contraseña completa (correo real por SMTP →
> enlace → cambio → sesión anterior cerrada). **No** se ha probado en Oracle ni en Vercel: esos pasos los haces tú con tus cuentas.

> **Desplegado el 26/09/2026 — dónde está hoy:** página en **https://stire-soft.vercel.app** (Vercel) y backend en
> **https://stire-unicor.duckdns.org**, en una VM de **Azure for Students** (Oracle no tuvo capacidad). Cómo se hizo, qué
> cambia respecto a Oracle y cómo operarlo: **§8**. Las secciones 1 a 7 siguen valiendo para Oracle o cualquier VM.

> **Decisión cerrada (ADR 13):** frontend en Vercel, backend + MariaDB en la VM de Oracle, Gmail para el correo y DuckDNS para el dominio. Costo $0. La base **no** se migra.
> **Sin probar:** la imagen se verificó en x86; la VM de Oracle es **arm64**, así que el primer `docker compose … up --build` la construye en arm64 (tarda ~10 min). Si algo falla ahí, avísame con el error.

## 0. Qué necesitas (una sola vez)

| Cuenta | Para qué | Costo |
|---|---|---|
| GitHub (ya tienes el repo) | Vercel despliega desde ahí | $0 |
| Cloudflare Pages (o Vercel Hobby) | Frontend estático | $0 |
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
5. **Deja la cuenta en Always Free y NO la pases a *Pay As You Go* (decisión del dueño, 25/09/2026: el proyecto no puede generar ningún
   cobro).** Con PAYG hay tarjeta y un presupuesto de Oracle que solo *avisa*, no frena el gasto; en Always Free puro no existe
   ese riesgo. **Riesgo que se acepta a cambio:** Oracle puede reclamar una máquina gratuita cuyo uso (percentil 95 de CPU, red y
   memoria) sea inferior al 20 % durante 7 días, y una aplicación de un curso pequeño puede quedar por debajo. No hay forma gratuita y
   garantizada de evitarlo (el monitor del paso 6 avisa, pero sus peticiones son casi con seguridad demasiado pequeñas para cambiar la medición). Por eso:
   - **La copia de seguridad fuera de la máquina es obligatoria** (sección 5), no opcional.
   - Si la máquina se detiene, arráncala desde la consola de Oracle; si se pierde, crea otra y sigue la sección 7.
   - Antes de cada corte de evaluación importante, comprueba que `/health` responde.

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

## 3. Frontend (sitio estático, gratis)

El frontend se publica como **archivos estáticos** (`nuxt generate`, ~1 MB): no hay servidor de Nuxt que mantener. Se verificó con una
compilación real y un servidor con la regla de reescritura: recargas en rutas profundas (`/estudiante/unidad/5`), protección por rol, 404,
`/auth/reset-password?token=…`, ejercicio de código y entrega.

**Recomendado: Cloudflare Pages** (ancho de banda ilimitado y sin cláusula de «solo uso no comercial» como la de Vercel Hobby):
1. dash.cloudflare.com → *Workers & Pages* → *Create* → *Pages* → conecta el repositorio de GitHub.
2. *Root directory:* `frontend-nuxt` · *Build command:* `npm run generate` · *Build output directory:* `.output/public`.
3. *Environment variables (de **compilación**):* `NUXT_PUBLIC_API_BASE` = `https://TU-DOMINIO` (con https y sin barra final). **Importante:** en un sitio
   estático esta variable se «hornea» al compilar; si cambias la URL del backend, vuelve a desplegar. No pongas `NUXT_PUBLIC_DEMO_MODE`.
4. El archivo `frontend-nuxt/public/_redirects` ya hace que las rutas profundas funcionen. Copia la URL (`https://algo.pages.dev`) a `FRONTEND_URL` y
   `CORS_ORIGIN` en `.env.prod` y reinicia el backend.

**Alternativa: Vercel Hobby** (mismos pasos: proyecto nuevo, *Root Directory* `frontend-nuxt`; `frontend-nuxt/vercel.json` ya trae el comando, la carpeta de
salida y la reescritura). Límites: uso no comercial, ~100 GB/mes de transferencia como guía de uso justo.

**Alternativa sin cuenta extra: servirlo desde la propia VM.** Compila con `npm run generate` y añade a `deploy/Caddyfile` un sitio que sirva
`.output/public` con `try_files {path} /200.html`. Ventajas: un solo dominio y cero problemas de CORS. Desventajas: sin CDN y ocupa la VM.

No conviene: Netlify gratis (desde sep-2025 son 300 créditos/mes, ≈15 GB, y se pausa al agotarlos), Firebase Hosting Spark (360 MB/día de transferencia),
ni GitHub Pages (límite blando de 100 GB y sin reescritura de rutas para una SPA).

**Con Claude por MCP (Vercel):** en Claude Code escribe `/mcp`, elige *claude.ai Vercel* y autoriza; solo sirve si eliges Vercel. Cloudflare Pages se
configura una vez en su panel y luego despliega solo con cada `git push`.

## 4. Correo de recuperación de contraseña (Gmail)

1. En la cuenta Gmail dedicada activa la **verificación en dos pasos** (myaccount.google.com/security).
2. Ve a myaccount.google.com/apppasswords, crea una contraseña de aplicación llamada «STIRE» y copia las 16 letras.
3. En `.env.prod`: `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER=<la cuenta>`, `SMTP_PASS=<las 16 letras>`,
   `MAIL_FROM="STIRE <la cuenta>"`. Límite de Gmail ≈ 500 correos/día: sobra para un curso.
4. Prueba: en la pantalla de login pulsa «¿Olvidaste tu clave?» con tu correo y revisa que llegue (mira también spam).

Cambiar de proveedor (Brevo, Resend…) es cambiar estas 5 variables, sin tocar código.

## 5. Copias de seguridad

`deploy/backup-db.sh` guarda un `.sql.gz` diario y conserva 14 días. Actívalo: `crontab -e` →
`0 3 * * * /home/ubuntu/stire/deploy/backup-db.sh`. **Descarga una copia a tu computador cada semana**
(`scp ubuntu@TU-IP:stire/backups/stire-AAAA-MM-DD.sql.gz .`); si la máquina se pierde, las copias que están en ella se pierden con
ella y solo sirve la que tengas fuera (deja una recurrente en tu calendario).

## 6. Comprobación final (10 minutos)

- [ ] `https://TU-DOMINIO/health` → `{"status":"ok"}` y `https://TU-DOMINIO/docs` → 404 (Swagger apagado).
- [ ] La página de Vercel abre y `Iniciar sesión` funciona con el admin que creaste.
- [ ] Sin errores de CORS en la consola del navegador (si los hay: `CORS_ORIGIN` no coincide con la URL exacta de Vercel).
- [ ] Regístrate como estudiante con otro correo, únete a una clase y resuelve un ejercicio de código (prueba el sandbox).
- [ ] Recuperación de contraseña: llega el correo, el enlace funciona y el enlace no se puede usar dos veces.
- [ ] Un estudiante guarda su clave de Google AI Studio en el Tutor y recibe respuesta.
- [ ] UptimeRobot (uptimerobot.com, gratis): monitor HTTPS a `/health` cada 5 min con aviso a tu correo.

## 7. Si la máquina se detiene o se pierde

1. **Se detuvo (reclamada por inactividad):** en la consola de Oracle → Instancias → *Iniciar*. Según la documentación de Oracle la instancia se detiene, no se borra (compruébalo en tu consola); espera un par de
   minutos y comprueba `https://TU-DOMINIO/health`. Si la IP pública no es fija, cambió: actualiza el nombre en DuckDNS.
2. **Se perdió o no arranca:** crea otra instancia con los pasos 1 a 3, clona el repositorio, vuelve a crear `.env.prod` (guárdalo también fuera
   de la máquina, en un gestor de contraseñas: sin `TUTOR_KEY_ENCRYPTION_SECRET` las claves de los estudiantes no se pueden descifrar), levanta
   el `docker compose` y las migraciones (sección 2) y restaura la copia que descargaste:
   `gunzip -c stire-AAAA-MM-DD.sql.gz | docker compose -f docker-compose.prod.yml --env-file .env.prod exec -T db mariadb -uroot -p"$DB_ROOT_PASSWORD" basestire`.
3. Los datos posteriores a la última copia se pierden: por eso la copia semanal (sección 5).

## 8. El despliegue real: Azure for Students + Vercel (26/09/2026)

Oracle no tuvo capacidad Ampere en Bogotá (la única región de la cuenta), así que se usó el plan B del ADR 13. Estos son los
valores reales y las trampas que aparecieron; si hay que repetirlo (otra cuenta, otro semestre), sigue esto.

**Máquina (portal.azure.com → Virtual machines → Create):**
- **Región: solo las que tu cuenta permite.** Azure for Students deja crear recursos en ~5 regiones, distintas para cada
  estudiante; fuera de ellas todo falla con «tamaño no disponible» o `RequestDisallowedByAzure`, y soporte no las amplía. Para
  saber cuáles son y qué tamaños admite cada una: Cloud Shell (Bash, «No storage account required», no crea nada que cobre) →
  `az policy assignment list` (asignación «Allowed resource deployment regions») y `az vm list-skus -l <región>` (los que no
  tienen `restrictions`). En esta cuenta: belgiumcentral, brazilsouth, canadacentral, chilecentral y **northcentralus**.
- **Tamaño: `Standard_B2als_v2`** (x64, 2 vCPU, 4 GB; ~27,45 USD/mes encendida 24/7, precio oficial de la API
  `prices.azure.com`). B1s/B1ms no estaban disponibles; los de 1 GB (B2ats/B2pts v2) no alcanzan para compilar y ejecutar código.
  Se prefirió x64 frente a la B2pls_v2 (ARM, ~3 USD menos) porque es la arquitectura ya probada y Azure no permite cambiar de
  ARM a x64 sin crear otra máquina.
- Imagen **Ubuntu Server 24.04 LTS x64**; usuario `stire`; **llave SSH existente** (la pública; la privada se queda en el PC);
  puertos 22, 80 y 443; **sin Spot**.
- **Disco: Premium SSD de 64 GiB (P6)**, el que entra gratis los 12 primeros meses. Otro tipo o tamaño se cobra.
- **IP pública: ~3,65 USD/mes** (la Basic gratuita se retiró); se cobra aunque la máquina esté apagada, igual que el disco.
- **Apagado automático 23:00 (Bogotá)** y **presupuesto de 100 USD** con alertas al 50 %, 80 % y 100 % pronosticado. Sin
  tarjeta no hay cobros: si el crédito se acaba, la máquina se apaga (antes, descarga la copia de la base).

**Servidor (por SSH: `ssh -i ~/.ssh/<llave> stire@<IP>`):**
1. Docker con `curl -fsSL https://get.docker.com | sudo sh`, `sudo usermod -aG docker stire` y 2 GB de swap
   (`fallocate -l 2G /swapfile`, `mkswap`, `swapon` y línea en `/etc/fstab`).
2. `git clone` en `~/stire` y `.env.prod` con los secretos **generados en el servidor** (`openssl rand -hex 32`), permisos
   600 y `SANDBOX_MAX_CONCURRENT=2`. **Guarda una copia en un gestor de contraseñas** (no en OneDrive ni en un chat): sin
   `TUTOR_KEY_ENCRYPTION_SECRET` las claves de Gemini de los estudiantes quedan ilegibles.
3. `docker compose -f docker-compose.prod.yml --env-file .env.prod build backend` (unos 5 minutos con 2 vCPU), luego
   `up -d`, las migraciones (§2) y el primer admin con una clave temporal que se cambia al entrar.
4. **Zona horaria:** `sudo timedatectl set-timezone America/Bogota`. La copia diaria va a las **22:30**
   (`30 22 * * * /home/stire/stire/deploy/backup-db.sh`), **antes** del apagado de las 23:00: a las 3 a. m. de la §5 la
   máquina está apagada.
5. Docker arranca solo con la máquina (`restart: unless-stopped`): al pulsar «Iniciar» en Azure, STIRE vuelve en 1–2 minutos.

**Dominio:** DuckDNS (`stire-unicor`) apuntando a la IP; Caddy sacó el certificado de Let's Encrypt en segundos.

**Frontend en Vercel (Add New → Project → importar el repositorio):** Vercel detecta Nuxt y además **copia como variables
de entorno todos los nombres del `.env.example` del backend** (`DB_PASSWORD`, `JWT_SECRET`…): **bórralos todos**, el
frontend se publica para que cualquiera lo descargue. Deja solo `NUXT_PUBLIC_API_BASE=https://<dominio-del-backend>`.
Application Preset **Other**, Root Directory `frontend-nuxt`, Build `npm run generate`, Output `.output/public`. Después pon
la URL de Vercel en `FRONTEND_URL` y `CORS_ORIGIN` de `.env.prod` y `docker compose … up -d backend`.

**Correo:** la contraseña de aplicación de Gmail ya no aparece en el menú de «Verificación en 2 pasos»; se entra directo en
https://myaccount.google.com/apppasswords (con la verificación en 2 pasos activada y una cuenta `@gmail.com`). En el servidor,
`deploy/configurar-correo.sh` la pide sin mostrarla y reinicia el backend. Los primeros correos de una cuenta nueva llegan a Spam:
márcalos «No es spam».

**Operación diaria:** para las pruebas, Azure → `stire-servidor` → **Iniciar**; al terminar, **Detener** (o el apagado de
las 23:00). **Actualizar:** `cd ~/stire && git pull && docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build`
y las migraciones si hay nuevas. **Si un secreto se filtra** (se pegó en un chat, un documento…): se cambia en el servidor
(`ALTER USER` para las dos de MariaDB, `JWT_SECRET` cierra todas las sesiones y `TUTOR_KEY_ENCRYPTION_SECRET` solo mientras
no haya claves de Gemini guardadas) y la de Gmail se revoca en su página y se crea otra.

## Riesgos que conviene conocer

- **Una sola máquina:** si cae, cae todo. Para una sustentación o un curso de un semestre es aceptable; las copias diarias son tu red de seguridad.
- **Oracle:** la capa gratuita se recortó a la mitad en junio de 2026 sin aviso y puede reclamar la máquina por inactividad (paso 5 de la sección 1). Si cambia de nuevo, el plan B (Railway Hobby o Azure) usa los mismos archivos, pero **cuesta dinero**: solo se toma si el dueño lo decide.
- **Tutor:** cada estudiante usa su propia cuota gratuita de Gemini; la interfaz ya explica el límite y la privacidad.
