# Qué falta para cerrar la v2.0.0

**Estado al 17/10/2026.** La v2.0.0 está publicada desde el 04/10 y se ha corregido con lo que encontró el equipo en la
prueba, pero todavía **no tiene la etiqueta `v2.0.0` en Git**: la etiqueta se pone cuando la revisión humana de las dos
listas esté completa y consolidada (`S09-J03`).

## 1. Lo que falta, por persona

| Quién | Qué falta | Por qué importa |
|---|---|---|
| Quien no la haya respondido (ver las tarjetas `S09-SUS-*`) | La encuesta SUS en STIRE (Mi perfil → «Responder la encuesta de usabilidad»). Van 3 de 5. | El SUS es la evidencia de UX-08. |
| José | Confirmar como usuario UX-01, MOB-01 y MOB-02, que se corrigieron después de su revisión. Proponer cómo unificar UX-04 (nombres, mayúsculas y botón principal) con su identidad visual. | UX-04 es el único criterio de la interfaz que sigue en CP. |
| Jorge | Confirmar UX-02 («Volver a editar» en «Antes de entregar»). | Pasa de CP a C con su confirmación. |
| Pedro | Confirmar UI-04 y responder la propuesta de MOD-02 (tarjeta «Errores que más se repiten esta semana» en «Hoy» del docente, [`S09-J08`](https://trello.com/c/uZe4F9nK)). | MOD-02 es el único criterio de Tutores Inteligentes que sigue abierto. |
| Jeider | Consolidar: tabla «nota automática contra nota del equipo» en [`VERIFICACION_v2.0.0.md`](../VERIFICACION_v2.0.0.md) con el porqué de cada diferencia, el SUS del equipo, `npm run verify:clean`, la etiqueta `v2.0.0` y su entrada en `CHANGELOG.md`. | Es el cierre (`S09-J03`). |
| Todos | El pitch grupal con las notas consolidadas ([`PITCH_LISTAS_CHEQUEO.md`](../../../pitch/PITCH_LISTAS_CHEQUEO.md)). | Las notas del guion salen de la consolidación. |

## 2. Cómo van las notas

| Lista | Antes (04/10) | Equipo hoy | Si se confirma lo corregido | Lo que no depende de nadie más |
|---|---|---|---|---|
| Interfaz | 20 / 32 | 27 / 32 · 84,4 % | 31 / 32 · 96,9 % | UX-04 (identidad visual) |
| Tutores Inteligentes | 14 / 24 | 20 / 24 · 83,3 % | 23 / 24 · 95,8 % | MOD-02 (espera ideas de Pedro) |

## 3. SUS: lo que hay hasta hoy

Datos de Administración → Usabilidad (17/10). La encuesta es anónima: no se sabe quién falta, se ve en las tarjetas
`S09-SUS-*`.

| | Respuestas | Puntaje |
|---|---|---|
| Total | 3 | **83,3** · bueno (más de 80) |
| Como estudiante | 2 | 90 |
| Como docente | 1 | 70 |

**Límite que se escribe junto al resultado:** quienes responden construyeron STIRE, así que el puntaje sirve para el
curso, no como prueba con usuarios externos.

## 4. Mejoras pequeñas que propuso el equipo

No bajaron ninguna nota, pero salieron en la revisión y quedan en el backlog:

- **Jorge (PAT-03):** pintar de rojo también el borde del campo que falta en un formulario.
- **Jorge (PAT-02):** que las migas no se corten en pantallas muy angostas.
- **José (MOB-03):** en alto contraste, bajar la saturación de los colores de acento para sesiones largas, como GitHub.
- **Jeider (UX-03):** decir qué ejercicios ya hechos no suben el dominio, y ofrecer seguir con más ejercicios o pasar a
  la siguiente lección.

## 5. Sugerencias de la prueba dentro de STIRE

Las 16 que llegaron por el botón «Sugerencias» están atendidas: 13 resueltas y 3 archivadas (2 repetidas y una prueba
automática). Las últimas, del 16/10:

| N.º | De | Qué pidió | Cómo quedó |
|---|---|---|---|
| 12 | Julio | Ver todo el historial de ejercicios en la ficha del estudiante, no solo los recientes | La ficha muestra todas las entregas, de 20 en 20, con «Ver entregas anteriores». |
| 13 | Julio | Enviar imágenes en los mensajes y poder editar uno enviado | Se puede adjuntar una imagen (pegarla, arrastrarla o elegirla) y editar un mensaje enviado, que queda con «Editado». |
| 14 | Jorge | Que escanear el QR una a la clase sin pulsar «Unirse» | Corregido el 17/10. |
| 15 | Jorge | Que el formulario quede en blanco después de enviar | Corregido el 17/10. |
| 16 | Jorge | «Nueva sugerencia» y «Ver lo que he enviado» al terminar | Corregido el 17/10. |
