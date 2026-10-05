---
fecha: 05/10/2026
alcance: pantallas del estudiante y del docente, en computador (1366×860) y celular (390×844)
método: crítica de diseño de dos evaluaciones independientes (skill impeccable): A, revisión de diseño con heurísticas de Nielsen; B, detector automático y mediciones en el navegador
---

# Crítica de diseño y lo que se corrigió (05/10/2026)

Pedido del dueño: «vuelve a hacer una prueba exhaustiva del frontend en la UI y la UX… piensa en esas palabras que
tenemos en botones, en ciertas partes de la navegación, que a veces son muy genéricas».

## 1. Cómo se hizo

- **Evaluación A (diseño).** Un agente recorrió 13 pantallas en dos tamaños (26 combinaciones). Usó las cuentas de prueba y bloqueó toda escritura en producción. Puntuó las 10 heurísticas de Nielsen y revisó la carga cognitiva, el recorrido emocional, los textos y el celular.
- **Evaluación B (evidencia).** Otro agente, sin ver a A:
  - corrió el detector de impeccable sobre el código;
  - lo inyectó en 4 páginas;
  - midió en el celular el desbordamiento horizontal, los controles de menos de 44 px y los nombres accesibles.
- **Antes, en la misma ronda:** se revisaron los textos de todos los botones y enlaces (extraídos del código) y se cambiaron los genéricos.

## 2. Resultado

| Heurística de Nielsen | Puntaje (0–4) | Hallazgo principal |
|---|---|---|
| 1 Visibilidad del estado | 3 | Repasos decía «~13 minutos» fijo |
| 2 Lenguaje del usuario | 2 | Jerga: «factor de estabilidad de memoria», «cohorte activa», «trazabilidad individual» |
| 3 Control y libertad | 3 | — |
| 4 Consistencia | 2 | «Repaso» y «refuerzo» mezclados; el rezago daba 0 en un lado y 1 en otro; «81%» y «81 %» |
| 5 Prevención de errores | 2 | «Archivar» de 23 px pegado a «Editar» |
| 6 Reconocer antes que recordar | 2 | El mapa de calor usa columnas L1–L17 |
| 7 Flexibilidad | 3 | — |
| 8 Diseño minimalista | 2 | Repasos todo en rojo; el inicio medía 3208 px en el celular |
| 9 Recuperarse de errores | 3 | — |
| 10 Ayuda | 3 | — |
| **Total** | **25/40** | Aceptable |

Fortalezas: «Hoy en tu clase» (la mejor pantalla), el ejercicio y la accesibilidad (temas, 44 px en el estudiante,
«Escuchar»).

Detector: 5 hallazgos en el código, 3 de ellos falsos positivos. En el navegador no hubo desbordamiento ni controles sin nombre. La medición de 44 px en el celular dio:
- Contenidos del docente: 68 de 88 controles por debajo.
- Las demás páginas: de 3 a 5 controles cada una.

## 3. Lo que se corrigió (todo en `main`)

| Problema | Arreglo | Commit |
|---|---|---|
| Botones de un verbo («Abrir», «Crear», «Remover», «Reto»…) | Dicen sobre qué actúan («Abrir proyecto», «Quitar de la clase», «Asignar reto»…) | `e1e633d` |
| 37 clases de color que no existían (`semantico-error`, `semantico-exito`, `base-negro`) | Tokens reales; prueba de guardia | `e1e633d` |
| Símbolos como íconos (✕ ▲ ▼ ▶ ✓ ✖ ◀) | Íconos de Lucide con nombre accesible | `e1e633d`, `a2615df` |
| Mensajes: no se podían leer completos ni marcar con el teclado; dos páginas casi iguales | Una bandeja compartida, «Leer completo», ventana con foco atrapado | `54a2cf1` |
| Contenidos: 68 controles por debajo de 44 px | 44 px en el celular | `326cca1` |
| Repasos alarmante (P1) | «Empieza por aquí» y una lista; tiempo calculado; sin rojo de error; sin jerga | `f2eefac`, `9ee6ad6` |
| La pausa ofrecía 5 salidas y «Volver a la explicación» como principal (P1) | Primero «Pedir una pista al Tutor», luego «Releer la explicación»; sin reto en ese momento | `f2eefac` |
| Rezago 0 en el inicio y 1 de 5 en Rendimiento (P1) | El servidor cuenta solo las lecciones de cada clase; la tarjeta queda neutra con 0 | `a2615df` |
| Jerga del docente (P2) | «Cómo va tu grupo», «Necesitan apoyo», «Ejercicios aprobados»… | `a2615df`, `9ee6ad6` |
| Celular del docente (P2) | Rendimiento en tarjetas; las pestañas muestran que hay más | `4eb1364` |
| El botón «Tutor» tapaba botones (P3) | Se reduce al ícono al bajar | `82608ae` |
| «0 días de racha» contra «no tienen que ser seguidos» | Titular: «2 de 3 días esta semana», como el logro | `df35797` |
| Porcentajes «81%», «90  %», «la anterior 198» | «81 %», números sin fuente monoespaciada, «la semana pasada» | `95d5a7e`, `9ee6ad6` |
| Títulos de la lección saltaban de h2 a h4 | h2 → h3 → h4 | `f2eefac` |
| Inicio de 3208 px en el celular | El plan del curso se pliega por módulo: 2358 px | `9ee6ad6` |
| Ojo de la contraseña de 24 px; la pausa sonaba a vigilancia | 44 px con nombre; «Si lo necesitas, tu docente ya está al tanto y puede ayudarte» | `8fa9de3` |

**Verificación final:** el build local se probó contra la API de producción. axe-core (WCAG 2.1 AA) dio 0 problemas en 10 pantallas de estudiante y docente, en el celular y en el computador.

## 4. Lo que queda

- **Mapa de calor:** las columnas L1–L17 obligan a recordar. Habría que poner el nombre de la lección al pasar o al tocar.
- **Cabeceras de página:** todavía hay cuatro estilos distintos. Conviene unificarlas con José, porque es su territorio.
- **Contenidos:** pasar «Archivar» a un menú «Más».
- **Inicio del docente:** reducir los 6 controles por tarjeta de clase.
- **Clases con el mismo nombre:** en el menú lateral se truncan igual.
- **«OVA» y «REDA»:** aparecen en el contenido del curso sin explicar. Es tarea del docente, no de la interfaz.
- **Contenidos:** sigue mezclando árbol, edición y publicaciones (PAT-01/PAT-04). Dividirla con el patrón del panel del admin y de Mensajes.

Se espera que la nota de la heurística 8 suba de 2 a 3 y las de la 2 y la 4 de 2 a 3 (de 25 a 28 sobre 40), pero
eso lo dirá la próxima crítica, no esta estimación.
