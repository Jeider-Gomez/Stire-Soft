# Plan de construcción de la v3

Es la Fase 3 de `docs/PLAN_REMODELACION.md`, «Construcción por pantalla». Parte del lienzo de diseño v3
(<https://claude.ai/artifact/WA3ChLaQQXfCMorKgYkfsB>, versión 132), que tiene 209 cuadros y los tres roles navegables.
Escrito el 11/11/2026.

**La idea central:** la v3 **reacomoda** lo que STIRE ya hace. El backend se conserva. De las piezas del diseño, la
mayoría ya existe en la app: se mueve, cambia de estilo o se une con otra. Lo que costó aprenderlo
(`LECCIONES_QUE_NO_SE_PIERDEN.md`) viene incluido, no se vuelve a descubrir.

---

## 0. Antes de escribir código: lo que decide Jeider

| # | Decisión | Recomendación |
|---|---|---|
| D1 | Visto bueno del diseño, recorriéndolo como alguien nuevo (guía en el Índice del lienzo) | Sin esto no se empieza |
| D2 | ~~Unidad o módulo~~ **Decidido:** en pantalla «Módulo → Tema → Lección»; en el backend sigue sección → tema → unidad de aprendizaje | Cerrado |
| D3 | ~~Los 6 pendientes~~ **Decidido el 12/11:** P42 cerrado (el logo se deja así); P46 descartado; P39 competencias por ecuación con los ejercicios, sin la confianza; P31 bloques como otro tipo de ejercicio; P15 personalizados después; P57 se decide después | Cerrado |
| D4 | Copiar el generador del prototipo a `scripts/diseno-v3/`, para que el diseño quede en el repositorio | Sí, sin las capturas |
| D5 | Probar el prototipo con las personas del 13/11 antes de construir | Sí: lo que salga se corrige en el diseño, que es más barato |

## 1. Cómo se trabaja (reglas que ya existen)

- **Cada fase en su rama** (`docs/FLUJO_GIT.md`) y **un commit por punto**, con mensaje aprobado. **Nada se sube sin
  confirmación.**
- **Tras cada bloque**, `npm run build` y `npm test`, con el contador de errores siempre bajando. **Al final de cada
  fase**, `npm run verify:clean` una sola vez (`CLAUDE.md`).
- **Desplegar:** el backend antes que el frontend que lo usa, y solo cuando Jeider pega los comandos.
- **`docs/INVENTARIO_STIRE.md`** se actualiza en el mismo commit que agrega o quita una función.
- **Fotos de antes y después de cada pantalla** en `docs/material-visual/vistas/` (P25).
- **Cada pantalla se compara con su cuadro** del prototipo navegable (E-…, D3-…, A-…, Entrar…). Los cuadros de
  decisión viejos no mandan (`LECCIONES…` §C3).

### Cuándo una pantalla está terminada

1. **Igual al prototipo** en claro, oscuro y celular de 390 px.
2. **Cumple las 24 reglas** de `LECCIONES…` §D que le apliquen, y **conserva su componente** de §B si tiene uno.
3. **Palabras humanas:**
   - sin «Hoy» como sección;
   - sin rachas;
   - sin rojo para los repasos;
   - nunca «trabado», «rezago» ni «bloqueado».
4. **Accesible:**
   - contraste AA medido;
   - controles de 44 px;
   - se recorre con el teclado y el foco se ve;
   - ventanas con el foco atrapado y devuelto;
   - respeta «Reducir el movimiento».
5. **Probada:**
   - tests de lo que cambió;
   - `build` y `test` en verde;
   - una pasada con agent-browser sin errores de consola ni de red.

## 2. Fases

### Fase A · Preparación (no cambia lo que ve la gente)

| Qué | Dónde | Nota |
|---|---|---|
| Colores Cielo y sol en claro y oscuro | `assets/css/temas.css` | Se cambian los **valores** de las variables `--c-*`; los nombres quedan, así no se tocan cientos de clases. Base: `tinta #14213D`, `suave #4A5873`, `borde #E3EAF3`, `fondo #F7F9FC`, `menta #D5F6F0`, `sol #FFC94D` y el color por sección del generador (`SEC`) |
| `DESIGN.md` con la paleta nueva | raíz | Hoy dice `primary #0B3D91`: quedó viejo |
| Logo definitivo y mascota | `layout/Logo.vue`, `tutor/Mascota.vue` | Del cuadro Logo-final |
| Medir el punto de partida: tiempos (P59) y axe en las 4 rutas principales por rol | — | Para comparar al final |

### Fase B · El marco (cambia todas las pantallas a la vez)

El menú, la barra y el Tutor son lo que más se ve. Con el marco nuevo, cada pantalla que se construya después ya
sale coherente.

| Qué | Componentes actuales | Cuadro |
|---|---|---|
| Menú del estudiante con color por sección y «Sigue donde ibas» | `layout/SidebarNav.vue`, `ClasesDelMenu.vue`, `PlanDelCurso.vue` | Navegacion-estudiante, E-Inicio |
| Menú del docente: «‹ Mis clases», selector de clase en una línea, «Asistencia abierta · 21» | `SidebarNav.vue`, `docente/PestanasClase.vue` | Navegacion-docente, D3-Clase |
| Menú del administrador por secciones (Personas, Académico, Opiniones, Sistema), con lo pendiente | `layouts/admin.vue` | A-Usuarios |
| La barra de arriba: Buscar (Ctrl K), Apariencia, Avisos, Ayuda, Sugerencias, cuenta | `layout/HeaderNav.vue`, `BotonApariencia`, `NotificationBell`, `MenuAyuda`, `BotonSugerencias` | Todos |
| Tutor y Asistente flotantes; se abren al lado (Ctrl .) | `tutor/LanzadorTutor.vue`, `TutorChatDrawer.vue`, `docente/asistente/Panel.vue` | E-Tutor, D3-Asistente |
| Barra de abajo en el celular | `layout/SidebarNav.vue` (móvil) | E-Cel-Inicio, D3-Cel-Inicio |

### Fase C · Entrar y presentar STIRE

| Qué | Qué existe | Qué es nuevo |
|---|---|---|
| Página de inicio | `pages/index.vue` | Las capturas de la v3 y la línea «Solo mirar» |
| Entrar con la mascota viva | `layouts/auth.vue`, acceso de demostración | `useMascotaEntrar` y las reacciones de `Mascota.vue` (decorativas, `aria-hidden`) |
| Registro en dos pasos | Ya existe (BT-27) | Solo el estilo |
| QR que une a la clase | `middleware/auth.global.ts` guarda «volver» | La clase se ve arriba mientras entra o crea la cuenta |

### Fase D · Estudiante (en el orden en que se usa)

1. **Inicio** (`pages/estudiante/index.vue`):
   - «Tu siguiente paso»;
   - «Tu camino en la unidad»;
   - «Tu semana · sin rachas»;
   - Primeros pasos (B5).
2. **Lección** (`unidad/[id].vue`):
   - meta, anterior y siguiente;
   - otras formas de verla y escuchar;
   - «Pruébalo».
3. **Ejercicio:** la base es el **v5/v9** que Jeider aprobó el 10/11. Los demás tipos siguen E-Tipos. Se conservan
   «ya no sube tu dominio» (B6) y los casos con nombre.
4. **Repasos y Progreso:** «Cómo avanzas» (B9), calibración y logros privados.
5. **Mi clase** (notas, asistencia, entregas, mensajes, refuerzos) y **Mi cuenta** (Apariencia, Avisos, Privacidad).
6. **Mis proyectos y Laboratorio:** el Laboratorio es nuevo y necesita servidor (§3).
7. **El Tutor:** concepto primero, una comprobación y pistas. El acompañamiento paso a paso (B7) y el prompt v17 no
   cambian.

### Fase E · Docente

1. **Mis clases y Nueva clase:** sin ventanas sobre ventanas.
2. **Resumen de la clase:** «Necesitan algo», «Lo que le cuesta a la clase» con concepto y descuido (B1), y «Por
   revisar».
3. **Contenido:**
   - las dos columnas;
   - «Ver como estudiante»;
   - cuándo se muestra cada explicación;
   - traer de otra clase (B3) y mi banco (B4);
   - la guía de la lección (B2).

   **El editor por bloques va al final:** es lo más grande.
4. **Estudiantes, Ficha y Recuerda.**
5. **Asistencia:** sigue abierta mientras navega (P32).
6. **Notas** (nota propuesta y Moodle, B8) y **Entregas** (comentario primero, nota opcional).
7. **Refuerzos y retos; Avisos y mensajes; Ajustes;** cómo ayuda el Tutor.
8. **Asistente:**
   - borradores con «Aplicar», «Ver cambios» y deshacer;
   - estructura del curso, ejercicios y analizar mi clase;
   - crear una clase con el Asistente.
9. **Competencias:** solo si se decide P39.

### Fase F · Administrador

1. **Usuarios:**
   - la lista con su ficha al lado;
   - acciones en grupo;
   - solicitudes;
   - borrar con 30 días de gracia;
   - cuentas de prueba.
2. **Catálogo** (por revisar más tabla) y **Clases** (supervisar e intervenir: nuevo con servidor, §3).
3. **Sugerencias y encuesta SUS.**
4. **Estado del sistema; Registros y mantenimiento** (registro de acciones del administrador); **IA y proveedores**,
   sin costos; **Datos para investigación**.
5. **Mi perfil** (eliminar mi cuenta) y **resumen en el celular**.

### Fase G · Cierre de la v3

1. **P02:** auditoría de uso de los 4 roles en computador y celular.
2. **P03:** WCAG con teclado y lector de pantalla (Jorge, NVDA).
3. **Prueba con personas** en la app nueva, con el protocolo de `docs/calidad/PROTOCOLO_OBSERVACION.md`.
4. **Evaluación heurística humana final:** los 5 dicen «cumple» y se marca la **v3.0.0**.

## 3. Lo nuevo que necesita servidor

Casi todo lo demás ya tiene su ruta. Esto es lo que hay que crear en el backend. Cada punto lleva migración y tests, y
se despliega antes que su pantalla.

| Qué | Para qué pantalla | Tamaño |
|---|---|---|
| Publicar un proyecto en el Laboratorio de la clase, mensajes para el autor, «Hacer mi copia», «me gusta» y reportar | E-Laboratorio, E-Laboratorio-Proyecto | Medio |
| Intervenir una clase: co-docente, cambiar de docente, pasar estudiantes, cerrar inscripciones, archivar; aviso al docente | A-Clases | Medio |
| Registro de acciones del administrador | A-Mantenimiento | Bajo |
| Borrado con 30 días de gracia, y «Eliminar mi cuenta» para todos los roles | A-Usuario-Borrar, A-Perfil, E-Cuenta | Medio |
| Avisos del administrador a roles o clases | A-Avisos | Bajo |
| Los 18 pendientes «con servidor» de la cuadrícula «Los 59 pendientes» (memoria del Tutor P43, proveedores P44, conversación por ejercicio P58, …) | Varias | Por partes, en la fase de su pantalla |

## 4. Orden recomendado y primer paso

**A → B → C → D → E → F → G.** El marco va primero porque arregla la coherencia de todas las pantallas de una vez.
El estudiante va antes que el docente porque es lo que se prueba con personas.

**Primer paso**, cuando Jeider dé el visto bueno:

1. Crear la rama `v3/fase-a`.
2. Cambiar los colores en `temas.css` y `DESIGN.md`.
3. Correr `build` y `test`.
4. Tomar las fotos del «antes».
5. Mostrarlo para aprobarlo antes de seguir con el marco.
