# Qué falta para cerrar la v2.0.0

**Estado al 17/10/2026.** La v2.0.0 quedó cerrada y etiquetada el 17/10, con la revisión humana completa
(`VERIFICACION_v2.0.0.md` §7). Con las correcciones confirmadas por el equipo: interfaz **30 / 32** y Tutores
Inteligentes **23 / 24**. Lo que sigue abierto pasa a la Semana 10.

## 1. Lo que falta, por persona

| Quién | Qué falta | Por qué importa |
|---|---|---|
| José | ~~Confirmar UX-01, MOB-01 y MOB-02~~ (confirmado el 17/10). Proponer cómo unificar UX-04 (nombres, mayúsculas y botón principal) con su identidad visual. | UX-04 es el único criterio de la interfaz que sigue en CP. |
| Jorge | Confirmar UX-02 («Volver a editar» en «Antes de entregar»). Es la única corrección sin confirmar. | Pasa de CP a C con su confirmación. |
| Pedro | ~~Confirmar UI-04~~ (confirmado el 17/10). Responder la propuesta de MOD-02 (tarjeta «Errores que más se repiten esta semana» en «Hoy» del docente, [`S09-J08`](https://trello.com/c/uZe4F9nK)). | MOD-02 es el único criterio de Tutores Inteligentes que sigue abierto. |
| Jeider | Consolidar: tabla «nota automática contra nota del equipo» en [`VERIFICACION_v2.0.0.md`](../VERIFICACION_v2.0.0.md) con el porqué de cada diferencia, el SUS del equipo, `npm run verify:clean`, la etiqueta `v2.0.0` y su entrada en `CHANGELOG.md`. | Es el cierre (`S09-J03`). |
| Todos | El pitch grupal con las notas consolidadas ([`PITCH_LISTAS_CHEQUEO.md`](../../../pitch/PITCH_LISTAS_CHEQUEO.md)). | Las notas del guion salen de la consolidación. |

## 2. Cómo van las notas

| Lista | Antes (04/10) | Equipo hoy | Lo que falta para el máximo | Abierto |
|---|---|---|---|---|
| Interfaz | 20 / 32 | 30 / 32 · 93,8 % (confirmado el 17/10) | 31 / 32 · 96,9 % con UX-02 de Jorge | UX-04 (identidad visual) |
| Tutores Inteligentes | 14 / 24 | 23 / 24 · 95,8 % (confirmado el 17/10) | 24 / 24 con MOD-02 | MOD-02 (espera ideas de Pedro) |

## 3. SUS: lo que hay hasta hoy

Datos de Administración → Usabilidad (17/10). La encuesta es anónima: no se sabe quién falta, se ve en las tarjetas
`S09-SUS-*`.

| | Respuestas | Puntaje |
|---|---|---|
| Total | 5 | **81,5** · bueno (más de 80) |
| Como estudiante | 4 | 84,4 |
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
