# Medición de partida de la v3 (Fase A, 12/11/2026)

Punto de partida para comparar al final de la v3 (Fase G): tiempos de carga (P59) y accesibilidad (axe) en 4 rutas por
rol. Datos completos en [`partida.json`](partida.json); se rehace con [`scripts/v3/medir-partida.mjs`](../../../scripts/v3/medir-partida.mjs).

## Cómo se midió

- Frontend de **producción** (`npx nuxi generate`), servido con gzip por el propio script; backend local contra la base
  de pruebas `stire_pruebas_local`. No es el sitio real: el servidor y la red son los del computador.
- Cada ruta: **primera visita** (caché vacía), **con caché** (la misma ruta otra vez) y **celular lento** (390×844,
  red «3G rápida» de Chrome: 563 ms de latencia y 1,4 Mbit/s; CPU 4× más lenta), primera visita.
- El tiempo va hasta que la red queda quieta (incluye los 0,5 s de espera de Playwright).
- axe con WCAG 2.1 A y AA, después de que aparece el recorrido guiado (también se revisa).
- En el computador los tiempos varían hasta ±40 % entre corridas; se anotan rangos de varias corridas.

## Resultado

| Rol | Ruta | Computador, 1.ª visita | Con caché | Celular lento | Pedidos | JS (KB) | axe |
|---|---|---|---|---|---|---|---|
| Estudiante | `/estudiante` | 1,5–2,2 s | 1,0–1,3 s | 16–22 s | 223 | 298 | 0 |
| Estudiante | `/estudiante/unidad/1` | 1,5–2,0 s | 1,0–1,4 s | 18–25 s | 238 | 334 | 0 |
| Estudiante | `/estudiante/repasos` | 1,5–2,4 s | 1,0–1,4 s | 16–24 s | 234 | 344 | 0 |
| Estudiante | `/estudiante/progreso` | 1,4–1,8 s | 1,0–2,4 s | 15–22 s | 215 | 293 | 0 |
| Docente | `/docente` | 1,4–3,0 s | 1,0–1,8 s | 15–23 s | 227 | 304 | 0 |
| Docente | `/docente/clase/1` | 1,4–2,2 s | 1,0–1,6 s | 21–27 s | 215 | 287 | 0 |
| Docente | `/docente/entregas` | 1,4–2,1 s | 1,0–1,2 s | 15–24 s | 206 | 282 | 0 |
| Docente | `/docente/contenidos` | 1,5–3,1 s | 1,0–1,7 s | 16–26 s | 234 | 389 | 0 |
| Admin | `/admin` (Usuarios) | 1,5–2,2 s | 1,2–1,3 s | 13–20 s | 185 | 274 | 0 |
| Admin | `/admin/dashboard` | 1,5–2,5 s | 1,0–1,4 s | 15–20 s | 181 | 265 | 0 |
| Admin | `/admin/catalogo` | 1,3–2,6 s | 0,9–1,3 s | 14–20 s | 193 | 294 | 0 |
| Admin | `/admin/sistema` | 1,4–2,6 s | 1,0–1,2 s | 13–19 s | 178 | 264 | 0 |

## Qué dice

1. **En computador está bien** (1,5 a 3 s la primera vez, cerca de 1 s con caché).
2. **En un celular con conexión lenta, la primera visita tarda de 13 a 27 s.** No es por el peso (unos 300 KB de
   JavaScript comprimido) sino por la **cantidad de pedidos: 180 a 250 por página**. Con 0,56 s de latencia cada ronda,
   los archivos pequeños en cadena suman. Es lo primero a mejorar en P59: agrupar los trozos de JavaScript (y los
   íconos) para bajar a pocas decenas de pedidos, y medir otra vez.
3. **axe: 0 problemas en las 12 rutas**, después de arreglar lo que encontró en esta misma medición:
   - el azul de información `#1D6FD1` como texto sobre su propio tono suave daba 4,0–4,3 a 1 → `#1658AA`;
   - el verde de «pasa» y el de «repaso vencido» tampoco llegaban sobre su tono suave → `#046C4E` y `#8A5000`;
   - inicio del docente: «Mostrando N de M» en gris suelto y la sigla blanca sobre `bg-white/20` (hasta 3,5 a 1);
   - el recorrido guiado (Driver.js) ponía `aria-expanded` a tarjetas y contenedores (crítico).

   Cada arreglo tiene su prueba (`apariencia.frontend.spec.ts`, `recorrido-guiado.frontend.spec.ts`).

axe revisa solo lo que se puede comprobar solo (más o menos un tercio de WCAG): 0 problemas no reemplaza la revisión
con teclado y lector de pantalla ni la prueba con personas.
