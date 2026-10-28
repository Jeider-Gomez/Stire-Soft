# Pendientes de STIRE

Lista viva y **numerada** de lo que falta. El número no cambia aunque el punto se mueva de fase; lo hecho se borra de
aquí (queda en `CHANGELOG.md` y en los commits) y su número no se reutiliza. En qué orden se hace y por qué:
`docs/PLAN_REMODELACION.md`. Qué hace cada pantalla: `docs/INVENTARIO_STIRE.md`. Última actualización: 27/10/2026.

**Cómo se despliega:** el frontend sale solo a Vercel al subir a `main`. El backend solo cuando Jeider pega los comandos
(backend antes que el frontend que lo usa; las migraciones no se corren solas). Ver `docs/DESPLIEGUE.md` §8.

## A. Verificar y depurar

| # | Qué | Quién | Fase |
|---|---|---|---|
| P01 | Cerrar la verificación humana del panel del docente (PD-01..17, PV-01..06) y corregir lo que salga | Equipo; plazo jueves 29/10, 8 p. m. | 0 |
| P02 | Auditoría completa de uso: los 4 roles en computador y celular, errores de consola y de red, pantallas rotas, textos | Claude con agent-browser | 1 |
| P03 | Volver a auditar **WCAG 2.1 AA**: la auditoría del 07/10 es anterior al rediseño del 23–27/10 | Claude (axe) y Jorge (NVDA, teclado) | 1 |
| P04 | Jeider hace sus 4 ejercicios de programar (17 a 20) **como estudiante novato**, anotando qué no entiende | Jeider | 1 |

## B. Remodelación (estudiante, docente, administrador)

| # | Qué | Fase |
|---|---|---|
| P05 | Reglas de identidad: un logo por vista; la mascota solo cuando habla (incluye la hoja de caras y gestos) | 2 |
| P06 | Inicio del estudiante: la mascota saluda una vez, animada, sin repetir la frase ni el logo | 2–3 |
| P07 | El Tutor saluda («Buenos días») y felicita al ganar un logro, sin saturar. **Todo se puede apagar** en el perfil: el saludo, las felicitaciones y cada tipo de aviso | 2–3 |
| P08 | «Mi progreso»: una frase y una acción arriba; lo demás plegado | 3 |
| P09 | Lección del estudiante: decidir qué va primero y qué se pliega | 3 |
| P10 | Asistente del docente con la cara de STIRE, el mismo lenguaje del Tutor y un lugar claro en el Inicio | 2–3 |
| P11 | Docente: quitar las ventanas viejas que quedan (`UnitLessonsModal`) y llevar «Nuevo ejercicio» al panel de contenidos | 3 |
| P12 | Administrador: desactivar y reactivar a la vista, borrado definitivo, «Eliminar mi cuenta», «Borrar usuarios de prueba» (marca `esPrueba`) | 3 |
| P13 | **Evaluación heurística humana** con el instrumento del curso (Empower-peque-chef adaptado), repartida entre los 5: `docs/calidad/EVALUACION_HEURISTICA_HUMANA_S11.md`, hasta el jueves 5/11. Antes, Claude lleva a 5 lo que se pueda y lo registra en `docs/calidad/EVALUACION_HEURISTICA_PLAN_A_5.md`. La segunda, después de la remodelación, abre la v3.0.0 | 1 y 4 |
| P34 | **Sesión con Jeider:** recorrer juntos el panel del docente y cómo se crean los ejercicios de programar (constructor y Asistente) para decidir qué se queda en el rediseño | 1 |

## C. Ejercicios y personalización (lo que pidieron los profesores)

| # | Qué | Fase |
|---|---|---|
| P14 | Escalera en cada lección: ejemplo resuelto → completar → ordenar líneas con distractores → escribir | 3 |
| P31 | **Programar con bloques** para quien llega a Fundamentos sin saber JavaScript (pedido del profesor Ali), más una **investigación del proceso formativo en programación** que lo sustente | 1 (investigar) · 2–3 |
| P15 | Ejercicios **personalizados por estudiante**: el perfil de aprendizaje elige del banco o genera con la IA, y el juez comprueba la solución antes de mostrarlo. **Toscano, 28/10:** test inicial por competencia, **confianza por competencia** (bien resueltos sobre intentados, por tema) y banco etiquetado por competencia y por perfil (visual o lector); el mismo ejercicio para todos no es personalizar | 5 |
| P35 | **Desagregar los ejercicios de programar** (Toscano, 28/10): una línea como `const a = Number(lineas[0])` junta cuatro conceptos, y los arreglos se usan desde la Unidad 1 pero se enseñan en la Unidad 3. Leer con `leerNumero()`/`leerTexto()` en las Unidades 1 y 2, y escalera de asignación → tipos → arreglos → entrada (P14). `docs/PROPUESTA_PARTE_FORMATIVA.md` §2 | 2–3 |
| P36 | **Si se bloquea, remitir al concepto** (Toscano): por cada operación del ejercicio, un enlace a una explicación clara del concepto que falta, en lugar de la respuesta | 2–3 |
| P37 | **El código se explica en el editor** (Toscano): palabras resaltadas (`const`, `=`, `Number`, `lineas[0]`) que al tocarlas o seleccionarlas abren una explicación corta del Tutor ahí mismo | 2–3 |
| P38 | **El repaso pendiente no va en rojo** (Toscano): el rojo genera rechazo; rojo solo para alertas reales, el repaso en un color amable | 1 (corrección rápida) |
| P39 | **Competencias como sistema propio** (Toscano y Jeider, 28/10): indicadores sacados de los resultados de aprendizaje del plan de curso (FDOC), ejercicios etiquetados, confianza por competencia pesada por la calidad de la evidencia (sin ayuda, en problemas distintos y sostenida en el repaso), niveles en desarrollo → lograda → afianzada, «Mis competencias», vista del docente, test inicial y elegir el siguiente ejercicio; aparte del dominio pero conectado, opcional y ajustable por el docente. Por partes: `docs/PROPUESTA_PARTE_FORMATIVA.md` §5 | 2–3 |
| P40 | **Los dos asistentes** (28/10): política pedagógica común, contexto justo por pantalla, streaming, ficha guiada con preguntas obligatorias y opcionales, crear una clase desde cero por partes, los 7 tipos de ejercicio en el Asistente y el Asistente presente en todo el panel del docente. `docs/PLAN_TUTOR_Y_ASISTENTE.md` | 2–3 |
| P41 | **Laboratorio de prompts**: prompts versionados en el código, casos de oro, `npm run prompts:evaluar` (esquema, juez, molde, conceptos futuros, no dar la solución, tiempo) y comparación de versiones con rúbrica en el panel del administrador | 1–2 |
| P42 | **Logo con el doble borde** (la tarjeta de atrás, la repetición espaciada) en el encabezado, el menú y los documentos; el isotipo solo en tamaños muy pequeños | 1 |
| P43 | **Memoria y paso a paso del Tutor**: hilo por ejercicio o lección (hoy son los últimos 6 mensajes de todo STIRE mezclados), resumen del hilo, «lo que el Tutor recuerda de ti» visible y borrable, plan de pasos que se recuerda («Paso 2 de 3») y ayuda que sube también con preguntas sin avance. `docs/PLAN_TUTOR_Y_ASISTENTE.md` §6b | 2–3 |
| P44 | **Varios proveedores de IA**: adaptador único (Gemini, compatible con OpenAI —incluye Groq, OpenRouter, Ollama—, Anthropic); el admin elige el de la institución y cada uno puede poner su clave; cada proveedor pasa por el laboratorio de prompts. `docs/PLAN_TUTOR_Y_ASISTENTE.md` §6c | 2–3 |
| P45 | **Varias representaciones en lecciones y ejercicios** (28/10): «Verla como: Texto · Diagrama · Paso a paso · Escuchar», la preferencia del estudiante se recuerda y se mide si le va mejor; el Asistente genera las que falten. `docs/PROPUESTA_PARTE_FORMATIVA.md` §5b | 2–3 |
| P46 | **Clave institucional de IA** (decisión futura): trámite con la universidad, convenio o costo aprobado, responsable y topes por estudiante. Por ahora, cada uno su clave. `docs/PLAN_TUTOR_Y_ASISTENTE.md` §6d | F |
| P16 | Batería de perfiles simulados: tabla que explica cada perfil, 100 a 300 usuarios marcados de prueba, modo API y modo «agente que hace clic» | 5 |
| P17 | **Prueba con 10 personas reales** (pedido del profesor Toscano), 2 por integrante, hasta el viernes 6/11: `docs/calidad/PRUEBA_CON_PERSONAS.md`. Se adelanta para que retroalimente el diseño de la remodelación | 1–2 |
| P18 | Comparar la repetición espaciada de STIRE con la del otro software del profesor | 5 |
| P19 | Clase del profesor Ali (Fundamentos): confirmar la fecha en que quiere probar STIRE. Enseñar frameworks (TypeScript en el juez, NestJS) queda como **futuro posible**, no pendiente | 1 (preguntar) |
| P20 | Dos artículos (revista del proyecto y uno de implementación y evaluación) | 5 |
| P33 | **Bajar la edad a grados 10 y 11** (15–17 años; decisión del 27/10). Antes de que un menor lo use: la Fase A (autorización del acudiente, asentimiento, cuenta en espera) y la Fase B (el Tutor de un menor nunca usa la API de Gemini) de `docs/PLAN_MENORES_Y_TRANSVERSALIDAD.md` | 3–5 |

## D. Servidor

| # | Qué | Por qué necesita servidor |
|---|---|---|
| P21 | Portada de la clase con imagen (el color ya está) | Guardar archivos |
| P22 | Errores de concepto por tipo de ejercicio (hoy solo por semana) | Consulta y columna nuevas |
| P32 | Asistencia flotante: la cámara (por ejemplo una cámara web girada hacia la puerta) sigue escaneando mientras el docente navega por el panel, toma notas o marca a mano, y él la apaga cuando quiera. Hoy el escáner vive dentro del panel abierto (`AsistenciaFlotante.vue:32`): **al plegarlo, la cámara se apaga** | Solo frontend, salvo que haga falta otro estado de la sesión |

## E. Documentación y orden del repositorio

| # | Qué |
|---|---|
| P23 | Manual técnico (qué lleva: `docs/PLAN_REMODELACION.md` §6) |
| P24 | Ordenar `docs/`: 44 archivos sueltos en la raíz, con planes ya ejecutados mezclados con los vigentes (`PLAN_MAESTRO`, `PLAN_MEJORAS`, `PLAN_DOCENTE_CON_IA`, `PLAN_REDISENO_DOCENTE`…); `pages/admin/usuarios.vue` que solo redirige |
| P25 | Capturas de cada versión en `docs/material-visual/vistas/` |

## F. Del equipo o de decisión de Jeider

| # | Qué | Quién |
|---|---|---|
| P26 | José revisa todas las decisiones de identidad juntas | Cuando Jeider decida |
| P27 | Prueba de asistencia en iPhone | Equipo |
| P28 | Correcciones de ejercicios B-J02 | Equipo |
| P29 | Verificar las fuentes de la investigación (tesis) | Jeider |
| P30 | Tablero de Trello de la semana 11 con el reparto de la Fase 1 | Jeider |
