# Prueba de estrés de STIRE (18/11/2026)

**Pedido:** profesor Toscano, 20/10: «prueba de estrés con una batería con varios casos».
**Qué se midió:** cuánto tarda STIRE en responder y si falla cuando muchos estudiantes lo usan a la vez.

## Cómo se hizo

- **Dónde:** el servidor de STIRE (backend NestJS y MariaDB) en un computador portátil con Windows 11 y 8 GB de RAM,
  con la base de pruebas `stire_pruebas_local`. No se hizo en el servidor real (Azure): una prueba de estrés lo
  saturaría mientras otros lo usan.
- **Quiénes:** 100 estudiantes de prueba (`estres-001@stire.local` a `estres-100@stire.local`), matriculados en la clase
  de Fundamentos de Algoritmia. Cada uno llega con su propia IP (como en producción, detrás del proxy), así que el límite
  de pedidos por persona se aplica a cada uno.
- **Batería de casos:** cada estudiante virtual hace una sesión real, con pausas de persona de 1 a 3 segundos entre pasos.
  La sesión se repite hasta que termina la etapa.

| # | Caso | Pedido |
|---|---|---|
| 1 | Entrar | `POST /auth/login` |
| 2 | Su perfil y sus clases | `GET /auth/profile`, `GET /enrollment/my` |
| 3 | El contenido de la clase | `GET /sections/class/:id` |
| 4 | Su tablero de avance | `GET /analytics/student/:id` |
| 5 | El siguiente ejercicio de la lección | `GET /learning-progress/student/:id/unit/:unidad/next-activity` |
| 6 | Sus competencias | `GET /analytics/student/:id/competencias` |
| 7 | Responder opción múltiple | `POST /submissions/start` y `POST /submissions/:id/submit` |
| 8 | Programar: probar el código dos veces y entregar | `POST /submissions/start`, `POST /submissions/:id/run` ×2, `POST /submissions/:id/submit` |

- **Etapas:** 10, 30, 60 y 100 estudiantes a la vez, 45 segundos cada una. Llegan escalonados en los primeros 5 segundos,
  como una clase que entra.
- **Cómo repetirla:** `node scripts/estres/preparar.cjs --clase 2 --estudiantes 100`, luego, con el servidor arrancado
  con `TRUST_PROXY=1`, `node scripts/estres/bateria.mjs --etapas 10,30,60,100 --segundos 45`. Al terminar,
  `node scripts/estres/preparar.cjs --borrar`. Los datos crudos están en `resultados-2026-11-18.json`.

## Resultados

| Estudiantes a la vez | Pedidos | Pedidos por segundo | Mitad de los pedidos en menos de (p50) | 95 % en menos de (p95) | Fallas del servidor |
|---|---|---|---|---|---|
| 10 | 402 | 7,7 | 26 ms | 199 ms | 0 |
| 30 | 1 184 | 22,0 | 35 ms | 379 ms | 0 |
| 60 | 1 834 | 31,9 | 47 ms | 3 744 ms | 0 |
| 100 | 2 392 | 34,8 | 67 ms | 9 108 ms | 0 |

**Ninguna falla del servidor (0 errores 500, 0 sin respuesta) en las cuatro etapas.** Los pedidos que la herramienta
contó como error (34, 90 y 128) son respuestas 400 de «Empezar opción múltiple» con el mensaje «Ya usaste los intentos de
este ejercicio. Se reabre uno…»: los mismos estudiantes repiten los mismos ejercicios de etapa en etapa y el límite de
intentos funciona como debe.

### Por caso, con 100 estudiantes a la vez (p95, el 95 % de los pedidos tardó menos que esto)

| Caso | p50 | p95 |
|---|---|---|
| Entrar | 99 ms | 124 ms |
| Perfil y clases | 8–10 ms | 32–46 ms |
| Contenido de la clase | 69 ms | 134 ms |
| Tablero de avance | 41 ms | 115 ms |
| Siguiente ejercicio | 131 ms | 370 ms |
| Competencias | 66 ms | 213 ms |
| Entregar opción múltiple | 136 ms | 452 ms |
| Entregar programar | 30 ms | 120 ms |
| **Probar código** | **8 505 ms** | **9 947 ms** |

## Qué dice

1. **Navegar, ver lecciones, competencias y entregar responde rápido** con 100 estudiantes a la vez: todo por debajo de
   medio segundo en el 95 % de los casos.
2. **El cuello de botella es «Probar código».** Con 10 estudiantes tarda 0,3 s; con 30, 0,7 s; con 60, 4,2 s; con 100,
   casi 10 s. Es el juez: ejecuta como máximo 3 programas a la vez (`SANDBOX_MAX_CONCURRENT`, cada uno usa unos 170 MB) y
   los demás esperan en fila. Es una decisión de seguridad y de memoria, no un error: nadie se queda sin respuesta, pero
   espera.
3. **En el servidor real el juez es más lento:** allí `SANDBOX_MAX_CONCURRENT=2` y la máquina tiene 2 vCPU y 4 GB. Una
   clase de 30 estudiantes probando código al mismo tiempo esperaría más que aquí.

## Límites de la prueba

- Corrió en un portátil, con el cliente y el servidor en la misma máquina: los tiempos sirven para comparar etapas, no
  como promesa para el servidor de Azure.
- No incluye al Tutor ni al Asistente: dependen de la API de Gemini de cada persona, y una prueba de estrés gastaría sus
  cuotas.
- 45 segundos por etapa; no mide qué pasa tras horas de uso.

## Qué se puede hacer

- Para clases grandes que programan a la vez: subir `SANDBOX_MAX_CONCURRENT` solo si el servidor tiene memoria, o correr
  «Probar código» en el navegador del estudiante (ya está anotado como futuro en P49) y dejar el juez del servidor solo
  para entregar.
- Mostrar en la pantalla «Hay N programas antes que el tuyo» cuando el juez está en fila, para que la espera no parezca
  una falla.
