# 🎓 Insumo Maestro UX + Pedagógico: Rol Estudiante (STIRE-Soft)

> **Guía de Diseño de Experiencia de Usuario, Intención Pedagógica y Flujos de Interacción para Mockups en Figma e Implementación en Vue 3 / Nuxt.**  
> **Actor:** Estudiante (`role: 'estudiante'`) | **Vistas:** `COMP-V00`, `EST-V01` a `EST-V06`  
> **Fecha:** 2 de septiembre de 2026 | **Versión:** 2.0 (MODESEC Multi-Rol)

---

## 1. Filosofía de la Experiencia y Marco Pedagógico

El estudiante de Algoritmia y Programación enfrenta frecuentemente **ansiedad ante la pantalla en blanco**, **frustración por errores crípticos de sintaxis** y **pérdida de retención a largo plazo (curva del olvido)**.

Toda la especificación de esta carpeta deriva y está formalmente trazada con el [**Marco UX + Pedagógico Oficial (v1.0)**](../../MARCO_UX_PEDAGOGICO_STIRE.md), el cual articula los 10 Principios Rectores (`P01` a `P10`) bajo la cadena:
$$\text{Evidencia Científica} \longrightarrow \text{Principio STIRE} \longrightarrow \text{Decisión UX} \longrightarrow \text{Decisión Visual (Figma)}$$

### Principios Directores de la Experiencia:
1. **Andamiaje Continuo (P03 - Modelo de Andamiaje Progresivo STIRE):** Pista conceptual $\to$ Pregunta guía $\to$ Localización de la falla, sin entregar código resuelto.
2. **Pedagogía del Error Formativo (P02 / P08):** El error en el Sandbox es una oportunidad diagnóstica (*diffs* visuales), separando la prueba libre de la entrega formal.
3. **Consolidación No Punitiva (P04):** Repetición espaciada SM-2 presentada en lenguaje natural y micro-sesiones cortas de mantenimiento.
4. **Claridad y Acción Inmediata (P01 / P05):** Interfaces que reducen la carga cognitiva y transforman cada diagnóstico de progreso en un botón de acción directa.
5. **Doble Codificación y Accesibilidad (P06 / P07):** Toda información visual combina iconos, formas, colores semánticos y texto explícito (WCAG 2.1).

---

## 2. Especificación UX y Pedagógica por Pantalla

```
Vistas del Estudiante
├── COMP-V00 · Iniciar Sesión (Acceso & Registro)
├── EST-V01 · Inicio (Dashboard & Orientación)
├── EST-V02 · Unidad de Aprendizaje (Teoría & Trazados)
├── EST-V03 · Resolución de Ejercicio (Editor Monaco & Sandbox Aislado)
├── EST-V04 · Tutor IA (Tutor IA Socrático Adaptativo)
├── EST-V05 · Repasos (Repaso Espaciado SM-2)
└── EST-V06 · Mi Progreso (Progreso, Maestría & Analítica Personal)
```

---

### 🔑 `COMP-V00` · Iniciar Sesión (Autenticación y Registro)

#### A. Propósito y Objetivo
* **Propósito:** Brindar un punto de entrada seguro, ágil y sin fricción al entorno de aprendizaje.
* **Objetivo del Usuario:** Acceder a sus clases y progreso guardado o crear una cuenta nueva en menos de 30 segundos.

#### B. Experiencia del Usuario
* **Pregunta Principal:** *“¿Cómo entro a mis clases de algoritmia?”*
* **Acción Principal:** `[Iniciar Sesión]`
* **Acciones Secundarias:** `[Crear Cuenta]` (Pestaña Registro), `[Olvidé mi Contraseña]`.
* **Sensación Buscada:** **Simplicidad, confianza y bienvenida.**

#### C. Jerarquía de Información
* **Prioridad 1 (Imprescindible):** Formulario directo de credenciales (Correo institucional y Contraseña) con botón destacado de acción.
* **Prioridad 2 (Importante):** Selector de modo (Iniciar Sesión / Registrarse) y mensaje de error en línea claro si falla la autenticación.
* **Prioridad 3 (Secundaria):** Isotipo minimalista de STIRE y enlace a soporte institucional.

#### D. Estructura de la Pantalla
* **Contenedor Central (`AuthCard`):**
  * Cabecera: Isotipo STIRE + Título *"STIRE — Tutor Inteligente de Algoritmia"*.
  * Selector: Tabs *"Iniciar Sesión"* | *"Crear Cuenta"*.
  * Cuerpo: Inputs con labels flotantes y validación en tiempo real.
  * Botón de Acción: *"Iniciar sesión"* con estado de carga integrado.
  * Pie: Enlace de recuperación de acceso.

#### E. Flujo de Interacción
1. Estudiante ingresa credenciales $\to$ Clic en *"Iniciar sesión"*.
2. Botón entra en estado `loading` (spinner) $\to$ Petición a `POST /auth/login`.
3. Sistema valida JWT, extrae `role: 'estudiante'` $\to$ Redirige inmediatamente a `EST-V01`.
4. *Si falla:* Alerta visual roja en línea: *"Correo o contraseña incorrectos"*.

#### F. Estados Relevantes
* **Inicial:** Formulario limpio con foco en el campo de correo.
* **Cargando:** Inputs deshabilitados, botón con micro-animación de carga.
* **Error:** Borde rojo en inputs y mensaje explicativo conciso (< 12 palabras).

#### G. Debe Quedar Resuelto en Figma
* Alternancia limpia entre Login y Registro dentro de la misma tarjeta.
* Visualización clara de validación de contraseña (mínimo 6 caracteres).
* Mensajes de error contextuales sin romper el layout.

---

### 🏠 `EST-V01` · Inicio (Dashboard & Orientación)

#### A. Propósito y Objetivo
* **Propósito:** Actuar como brújula de orientación diaria del estudiante, eliminando la sobrecarga cognitiva al iniciar sesión.
* **Objetivo del Usuario:** Saber de inmediato qué debe estudiar hoy, qué repasos tiene pendientes y en qué estado se encuentra su avance.

#### B. Intención Pedagógica
* **¿Qué aprende/decide?:** Decide si debe avanzar en contenido nuevo o proteger la memoria a largo plazo completando repasos vencidos.
* **Acompañamiento:** La interfaz destaca con prioridad la unidad recomendada según su nivel de dominio actual.

#### C. Experiencia del Usuario
* **Pregunta Principal:** *“¿Qué debería estudiar o practicar hoy?”*
* **Acción Principal:** `[Continuar Unidad Recomendada]` (Tarjeta de Acción Rápida).
* **Acciones Secundarias:** `[Iniciar Repasos de Hoy]`, `[Unirse a Clase con Código]`, `[Ver Mi Progreso]`.
* **Sensación Buscada:** **Orientación, claridad y sensación de progreso continuo.**

#### D. Jerarquía de Información
* **Prioridad 1 (Imprescindible):** 
  1. Saludo personalizado con estado de racha.
  2. Tarjeta principal *"Continuar donde ibas"* (Unidad activa + % avance + botón directo).
  3. Badge / Alerta de Repasos SM-2 pendientes para hoy.
* **Prioridad 2 (Importante):** Grid de asignaturas/clases matriculadas (Nombre, docente, código, botón de acceso).
* **Prioridad 3 (Secundaria):** Resumen global de maestría promedio (% Mastery) y accesos a Mi Progreso.

#### E. Estructura de la Pantalla
* **Zona Superior (Header Persistente):** Saludo, racha de días activos, barra compacta de maestría global, botón de perfil.
* **Zona Central Superior (Hero de Acción):**
  * Columna Izquierda: Tarjeta *"Tu Próximo Reto"* con botón de acción primario.
  * Columna Derecha: Tarjeta *"Mantenimiento / SM-2"* con contador de conceptos por vencer.
* **Zona Central Inferior (Contenido):**
  * Título de sección: *"Mis Clases"* + Botón `[+ Unirse a Clase]`.
  * Grid de tarjetas de aula (`ClassCard`).
* **Modal Contextual:** `JoinClassModal` para ingresar código alfanumérico.

#### F. Flujo de Interacción
1. Al cargar la pantalla, el sistema consulta `GET /enrollment/my` y `GET /analytics/student/:id`.
2. El estudiante ve su reto del día $\to$ Clic en *"Continuar"*.
3. La interfaz navega directamente a la teoría (`EST-V02`) o al ejercicio pendiente (`EST-V03`).
4. Si tiene repasos críticos $\to$ Clic en el badge de alerta $\to$ Navega a `EST-V05`.

#### G. Estados Relevantes
* **Inicial / Normal:** Reto del día activo y clases listadas.
* **Vacío (Sin Clases):** Ilustración de aula vacía + Mensaje *"Aún no te has unido a ninguna clase"* + Botón destacado `[Ingresar Código de Clase]`.
* **Sin Deuda de Repaso:** Badge verde *"¡Estás al día! No tienes repasos pendientes"*.
* **Con Repasos Críticos:** Badge ámbar/rojo con animación sutil de pulso *"3 conceptos requieren tu atención hoy"*.

#### H. Relación con Backend & Componentes
* **Fuentes API:** `GET /enrollment/my`, `GET /analytics/student/:id`, `POST /enrollment/join`.
* **Componentes:** `StudentHeader.vue`, `MasterySummaryCard.vue`, `SpacedRepetitionBadge.vue`, `EnrolledClassList.vue`, `JoinClassModal.vue`.

#### I. Debe Quedar Resuelto en Figma
* Jerarquía visual que priorice la acción inmediata sobre las métricas pasivas.
* Estado con clases activas vs. estado de estudiante recién registrado sin clases.
* Modal de ingreso de código de clase.

---

### 📖 `EST-V02` · Unidad de Aprendizaje (Teoría & Trazados)

#### A. Propósito y Objetivo
* **Propósito:** Facilitar la comprensión conceptual profunda de algoritmos y estructuras de datos antes de escribir código.
* **Objetivo del Usuario:** Comprender la lógica, la sintaxis y el comportamiento en memoria de un algoritmo mediante ejemplos y trazados interactivos.

#### B. Intención Pedagógica
* **¿Qué aprende?:** Interioriza el funcionamiento paso a paso (ej. cómo cambian las variables en un ciclo `while` o cómo se indexa un arreglo).
* **Decisión Pedagógica:** Marcar la teoría como comprendida y avanzar con confianza al reto de programación.
* **Acompañamiento:** Explicaciones visuales y posibilidad de invocar al Tutor IA si un fragmento teórico no queda claro.

#### C. Experiencia del Usuario
* **Pregunta Principal:** *“¿Cómo funciona este concepto y cómo se aplica en código?”*
* **Acción Principal:** `[Comenzar Reto Práctico]` (Botón fijo/destacado al final de la lectura).
* **Acciones Secundarias:** `[Pedir Explicación al Tutor sobre este Tema]`, `[Marcar como Leído]` *(Requisito pendiente backend)*, `[Avanzar Trazado de Memoria]`.
* **Sensación Buscada:** **Concentración, descubrimiento y comprensión estructurada.**

#### D. Jerarquía de Información
* **Prioridad 1 (Imprescindible):** Título de la unidad, bloque de concepto esencial y código fuente de ejemplo con resaltado sintáctico.
* **Prioridad 2 (Importante):** Diagrama conceptual vectorial (SVG) y trazado de escritorio paso a paso (tabla de variables).
* **Prioridad 3 (Secundaria):** Breadcrumb de navegación, indicador de dificultad (Fácil/Medio/Difícil) y tiempo estimado de lectura.

#### E. Estructura de la Pantalla
* **Cabecera de Unidad:** Breadcrumb (Clase > Módulo > Tema) + Título de Unidad + Badge de Dificultad.
* **Columna de Lectura (Ancho óptimo de lectura ~750px):**
  * Bloque 1: Definición y analogía del mundo real.
  * Bloque 2: Sintaxis formal y estructura en pseudocódigo/JavaScript.
  * Bloque 3: Diagrama visual interactivo (SVG).
  * Bloque 4: Trazado de escritorio paso a paso (Línea activa vs. Valores de variables).
* **Barra de Cierre / Footer Flotante:** Botón secundario *"¿Dudas conceptuales? Pregunta al Tutor"* + Botón primario *"Comenzar Reto Práctico $\to$"*.

#### F. Flujo de Interacción
1. Estudiante lee la teoría y visualiza el diagrama.
2. Si tiene dudas conceptuales $\to$ Clic en *"Preguntar al Tutor"* $\to$ Abre `EST-V04` con el contexto temático precargado.
3. Al terminar la lectura $\to$ Clic en *"Comenzar Reto Práctico"*.
4. Sistema inicia intento (`POST /submissions/start`) y navega automáticamente a `EST-V03`.

#### G. Estados Relevantes
* **Carga:** Skeletons de texto estructurado y bloques de código grises.
* **Contenido Disponible:** Renderizado fluido de Markdown y código con syntax highlighting.
* **Sin Contenido:** Mensaje *"Esta unidad aún está en edición por el docente"*.

#### H. Relación con Backend & Componentes
* **Fuentes API:** `GET /learning-unit/:id`, `GET /content/unit/:id`.
* **Componentes:** `MarkdownViewer.vue`, `CodeHighlighter.vue`, `ConceptualDiagramViewer.vue`, `StartExerciseButton.vue`.

#### I. Debe Quedar Resuelto en Figma
* Tipografía y espaciado de lectura limpio y descansado.
* Diferenciación visual entre bloques de texto conceptual, bloques de código y diagramas.
* Ubicación destacada del botón de paso al ejercicio práctico.

---

### 💻 `EST-V03` · Resolución de Ejercicio en Sandbox (Editor & Juez)

#### A. Propósito y Objetivo
* **Propósito:** Espacio de práctica deliberada y evaluación automatizada en tiempo real bajo un entorno seguro.
* **Objetivo del Usuario:** Escribir, probar y entregar una solución algorítmica que supere todos los casos de prueba.

#### B. Intención Pedagógica
* **¿Qué aprende/practica?:** Traduce la lógica abstracta a código ejecutable, aprende a depurar casos borde y optimiza la solución.
* **Feedback Educativo:** El sistema no solo dice *"Aprobado"* o *"Reprobado"*; desglosa exactamente qué caso público falló (entrada vs. salida esperada vs. salida obtenida) para guiar la depuración.
* **Andamiaje:** Si el estudiante se atasca tras varios intentos fallidos, el botón del Tutor IA se activa como salvavidas cognitivo.

#### C. Experiencia del Usuario
* **Pregunta Principal:** *“¿Mi código resuelve correctamente el problema y pasa todos los casos de prueba?”*
* **Acción Principal:** `[Entregar Solución Definitiva]` (Consume intento y califica).
* **Acción Secundaria de Soporte:** `[Ejecutar Casos Públicos]` (Prueba libre ilimitada sin consumir intentos).
* **Acciones Complementarias:** `[Pedir Pista al Tutor]`, `[Reiniciar Código a Plantilla Inicial]`.
* **Sensación Buscada:** **Inmersión, desafío, seguridad en la experimentación y control.**

#### D. Jerarquía de Información
* **Prioridad 1 (Imprescindible):**
  1. Editor de código activo (Monaco Editor) con código inicial editable.
  2. Enunciado del problema con restricciones y ejemplos claros.
  3. Consola de resultados con veredicto del juez.
* **Prioridad 2 (Importante):** Tabla de casos de prueba públicos con visualización de diferencias (`diff`).
* **Prioridad 3 (Secundaria):** Contador de intentos consumidos/disponibles, indicador de autoguardado en tiempo real e indicador de casos privados.

#### E. Estructura de la Pantalla (Layout de 3 Paneles Divididos)
* **Panel Izquierdo (35% ancho — Enunciado):**
  * Título del reto, dificultad y puntos.
  * Descripción detallada del problema.
  * Formato de entrada y salida esperada.
  * Casos de ejemplo con explicación.
  * Botón inferior *"¿Bloqueado? Consulta al Tutor IA"*.
* **Panel Derecho Superior (45% alto — Editor Monaco):**
  * Barra de herramientas: Lenguaje (JavaScript), Selector de tema oscuro/claro, Botón *"Reiniciar"*.
  * Área de código con números de línea y autocompletado.
  * Barra de estado: Indicador *"Autoguardado hace 5s ✔"*.
* **Panel Derecho Inferior (55% alto — Consola & Casos de Prueba):**
  * Pestañas: `[Casos Públicos]` | `[Casos Ocultos / Privados]` | `[Salida Estándar / Errores]`.
  * Área de Casos: Tarjetas por cada caso con badge (✔ Pasó / ✖ Falló) y comparación de salidas.
  * Barra de Acciones Finales: Botón secundario `[▶ Probar Código]` + Botón primario destacado `[🚀 Entregar Solución]`.

#### F. Flujo de Interacción
1. Estudiante lee el enunciado y escribe su algoritmo en el editor.
2. Cada 15 segundos, el sistema ejecuta un autoguardado silencioso (`PUT /submissions/:id/autosave`).
3. Estudiante hace clic en `[▶ Probar Código]` $\to$ Sandbox ejecuta en proceso aislado $\to$ Muestra veredicto preliminar en consola.
4. Si hay errores $\to$ Estudiante ajusta su código o abre el Tutor `EST-V04`.
5. Estudiante hace clic en `[🚀 Entregar Solución]` $\to$ `POST /submissions/:id/submit`.
6. Sandbox ejecuta todos los casos (públicos y privados) $\to$ Retorna veredicto final.
7. Si es **Accepted (100%)**: Modal de celebración + Actualización inmediata de Maestría (+X%) + Botón *"Siguiente Unidad"*.

#### G. Estados Relevantes
* **Inicial:** Editor precargado con la plantilla base (`starterCode`) y casos de ejemplo listos.
* **Ejecutando Sandbox:** Spinner en consola con mensaje *"Ejecutando código en entorno aislado seguro..."*.
* **Éxito (Accepted):** Tarjeta de felicitación verde, 100% casos pasados, sonido sutil de éxito opcional.
* **Fallo de Lógica (Wrong Answer):** Resaltado en rojo de las diferencias en casos públicos.
* **Error de Tiempo (Time Limit Exceeded):** Mensaje amigable *"Tu código entró en un bucle infinito o tardó más de 2 segundos"*.
* **Error de Sintaxis (Runtime Error):** Mensaje de error formateado sin exponer rutas internas del servidor.
* **Límite de Intentos:** Botón de entrega deshabilitado con mensaje *"Has utilizado todos los intentos para esta actividad"*.

#### H. Relación con Backend & Componentes
* **Fuentes API:** `POST /submissions/start`, `PUT /submissions/:id/autosave`, `POST /submissions/:id/submit`.
* **Componentes:** `CodeEditorMonaco.vue`, `ProblemStatement.vue`, `TestCasesPanel.vue`, `ConsoleOutput.vue`, `AutosaveIndicator.vue`.

#### I. Debe Quedar Resuelto en Figma
* Disposición de los 3 paneles (Enunciado, Editor y Consola) sin que se sientan apretados.
* Visualización del panel de Casos de Prueba en estado Pasado vs. Fallido.
* Estados de la consola: Ejecutando, Accepted, Wrong Answer y Runtime Error.

---

### 🤖 `EST-V04` · Tutor IA (Tutor IA Socrático Adaptativo)

#### A. Propósito y Objetivo
* **Propósito:** Proveer andamiaje cognitivo personalizado en el momento exacto del bloqueo, guiando al alumno sin darle el código resuelto.
* **Objetivo del Usuario:** Obtener una pista, entender un mensaje de error o aclarar una duda de lógica sin abandonar su ejercicio.

#### B. Intención Pedagógica
* **Método Socrático:** El tutor responde con contrapreguntas, analogías o verificación de casos límite. **Regla de oro: NUNCA genera la solución en código**.
* **Adaptación Cognitiva:** Si el alumno tiene Maestría < 50%, usa metáforas simples; si tiene > 80%, habla de eficiencia temporal y Big-O.

#### C. Experiencia del Usuario
* **Pregunta Principal:** *“¿Por qué mi algoritmo no funciona en este caso o cómo debería enfocar este problema?”*
* **Acción Principal:** `[Enviar Consulta al Tutor]`
* **Acción Secundaria:** `[Adjuntar mi código actual al mensaje]`
* **Sensación Buscada:** **Acompañamiento paciente, seguridad psicológica y empoderamiento reflexivo.**

#### D. Jerarquía de Información
* **Prioridad 1 (Imprescindible):** Historial del diálogo socrático con burbujas diferenciadas (Estudiante vs. Tutor IA) y campo de texto para consultar.
* **Prioridad 2 (Importante):** Badge de nivel pedagógico (Principiante / Intermedio / Avanzado) y botón rápido *"Adjuntar código"*.
* **Prioridad 3 (Secundaria):** Aviso legal visible: *"El Tutor es una IA pedagógica; verifica sus sugerencias ejecutando tu código."*

#### E. Estructura de la Pantalla (Drawer Lateral Deslizable)
* **Formato:** Panel lateral superpuesto (Drawer) de 400px de ancho que no oculta el editor de código.
* **Cabecera del Drawer:** Avatar del Tutor IA + Badge de Nivel Cognitivo + Botón de cerrar `[✕]`.
* **Cuerpo (Timeline de Mensajes):**
  * Mensaje de bienvenida contextual: *"Veo que estás trabajando en Ciclos While. ¿En qué parte de tu lógica sientes que hay dudas?"*.
  * Burbujas de chat con soporte para fragmentos cortos de código o pseudocódigo orientador.
* **Pie (Área de Entrada):**
  * Checkbox/Botón activo: `[📎 Incluir mi código actual]`.
  * Input de texto multilínea con botón de envío `[Enviar ➔]`.

#### F. Flujo de Interacción
1. Estudiante hace clic en *"Consultar al Tutor"* en `EST-V02` o `EST-V03`.
2. El Drawer se desliza suavemente desde la derecha sin recargar la página.
3. Estudiante formula su duda (opcionalmente adjunta su código) $\to$ Clic en Enviar.
4. La interfaz muestra animación de digitación *"El Tutor IA está analizando tu lógica..."*.
5. `POST /tutor/chat` retorna la respuesta socrática $\to$ El estudiante reflexiona y prueba en su editor.

#### G. Estados Relevantes
* **Inicial:** Chat con mensaje de bienvenida y sugerencias de preguntas frecuentes.
* **Pensando:** Burbuja con animación de 3 puntos titilantes.
* **Límite de Consultas:** Advertencia *"Has alcanzado el límite de 20 preguntas por minuto. Tómate un momento para probar en el editor"*.
* **Sin Conexión:** Mensaje con reintento automático.

#### H. Relación con Backend & Componentes
* **Fuentes API:** `POST /tutor/chat`.
* **Componentes:** `TutorChatDrawer.vue`, `ChatMessageItem.vue`, `PromptInput.vue`, `ThinkingIndicator.vue`.

#### I. Debe Quedar Resuelto en Figma
* Comportamiento del Drawer abierto sobre la pantalla del editor `EST-V03` (overlay no intrusivo).
* Diferenciación de burbujas del estudiante vs. respuestas orientadoras del tutor.

---

### ⏰ `EST-V05` · Repasos (Repaso Espaciado SM-2)

#### A. Propósito y Objetivo
* **Propósito:** Combatir activamente la curva del olvido de Ebbinghaus mediante la recuperación programada matemáticamente de conceptos previos.
* **Objetivo del Usuario:** Ver qué algoritmos aprendidos están en riesgo de olvido y realizar sesiones rápidas de consolidación.

#### B. Intención Pedagógica
* **Recuperación Activa:** Recordar activamente un concepto días después de aprenderlo fortalece las rutas neuronales.
* **Toma de Decisiones:** El alumno ve con claridad qué unidades son "críticas" (hace mucho no las practica) y las atiende antes de avanzar a temas complejos.

#### C. Experiencia del Usuario
* **Pregunta Principal:** *“¿Qué conceptos aprendidos anteriormente necesito reforzar hoy para no olvidarlos?”*
* **Acción Principal:** `[Iniciar Sesión de Repaso]` (En la unidad más urgente).
* **Acción Secundaria:** `[Posponer 24 Horas]` (Con advertencia de incremento de dificultad).
* **Sensación Buscada:** **Tranquilidad, control de la memoria y prevención del olvido.**

#### D. Jerarquía de Información
* **Prioridad 1 (Imprescindible):** Lista de conceptos vencidos con etiqueta de urgencia (Crítico: Rojo, Para Hoy: Ámbar, Próximo: Azul).
* **Prioridad 2 (Importante):** Justificación pedagógica en lenguaje natural (ej. *"Dominado hace 14 días. Repasar hoy garantiza retención a largo plazo"*).
* **Prioridad 3 (Secundaria):** Gráfico de retención estimada y contador de repasos completados en la semana.

#### E. Estructura de la Pantalla
* **Cabecera:** Título *"Repasos"* + Indicador general *"X temas requieren repaso hoy"*.
* **Panel de Lista de Repasos:**
  * Tarjetas de Unidad con:
    * Nombre del concepto (ej. *"Recursión en Árboles"*).
    * Badge de Urgencia (Crítico / Hoy / Esta Semana).
    * Fecha del último repaso y cálculo del próximo intervalo SM-2.
    * Botón de acción primario `[Repasar Ahora ➔]`.
* **Panel Lateral / Inferior:** Gráfico de Salud de la Memoria (curva de retención estimada).

#### F. Flujo de Interacción
1. Estudiante entra a `/estudiante/repasos`.
2. El sistema consulta `GET /analytics/student/:id` (sección `reviewSchedules`).
3. Estudiante selecciona la unidad más urgente $\to$ Clic en `[Repasar Ahora]`.
4. El sistema abre un ejercicio corto de recalibración en `EST-V03`.
5. Al aprobar el ejercicio $\to$ El algoritmo SM-2 recalcula el nuevo intervalo (ej. de 6 días pasa a 15 días) $\to$ La tarjeta desaparece de la lista de urgencias.

#### G. Estados Relevantes
* **Al Día (Sin Repasos):** Ilustración de felicitación + Mensaje *"¡Excelente memoria! No tienes conceptos vencidos para hoy"*.
* **Con Repasos:** Tarjetas ordenadas de mayor a menor urgencia.
* **Repaso Completado:** Animación de tarjeta deslizándose fuera de la lista con feedback del nuevo intervalo ganado.

#### H. Relación con Backend & Componentes
* **Fuentes API:** `GET /analytics/student/:id`.
* **Componentes:** `SpacedRepetitionCard.vue`, `UrgencyTag.vue`, `EmptyState.vue`, `MemoryHealthChart.vue`.

#### I. Debe Quedar Resuelto en Figma
* Codificación visual de urgencia de las tarjetas (colores y badges semánticos).
* Estado de "Todo al día" con refuerzo positivo.

---

### 📊 `EST-V06` · Mi Progreso (Progreso, Maestría & Analítica)

#### A. Propósito y Objetivo
* **Propósito:** Ofrecer un espejo analítico de autorregulación del aprendizaje, mostrando la evolución objetiva del dominio conceptual.
* **Objetivo del Usuario:** Inspeccionar su progreso histórico, revisar envíos pasados y entender en qué temas tiene fortalezas o debilidades.

#### B. Intención Pedagógica
* **Autorregulación:** El estudiante reflexiona sobre su propio proceso de aprendizaje (*metacognición*), identificando qué temas requieren más práctica.

#### C. Experiencia del Usuario
* **Pregunta Principal:** *“¿Cuánto he avanzado realmente y cuáles son mis temas más fuertes y más débiles?”*
* **Acción Principal:** `[Practicar mi tema más débil]`
* **Acciones Secundarias:** `[Inspeccionar código de entregas pasadas]`, `[Filtrar historial por asignatura]`.
* **Sensación Buscada:** **Logro, transparencia, motivación y superación personal.**

#### D. Jerarquía de Información
* **Prioridad 1 (Imprescindible):** Gráfico de dominio / Maestría por tema (% de 0 a 100 con indicador de estado cognitivo: Dominado / Comprensión Parcial / En Práctica).
* **Prioridad 2 (Importante):** Métricas clave (Total de ejercicios resueltos, Tasa de éxito al primer intento, Días de racha).
* **Prioridad 3 (Secundaria):** Tabla histórica de envíos (Fecha, actividad, puntaje, visor de código en modal).

#### E. Estructura de la Pantalla
* **Cabecera de Resumen:** Nivel del aprendiz + Tarjetas métricas (Ejercicios aprobados, Racha de días, Maestría global).
* **Sección de Dominio Conceptual:** Gráfico de barras de progreso por cada módulo temático con colores según estado cognitivo.
* **Sección Historial de Actividad:** Tabla interactiva de entregas con buscador y botón para ver el código entregado.

#### F. Flujo de Interacción
1. Estudiante entra a `/estudiante/progreso`.
2. El sistema consulta `GET /learning-progress/student/:id` y `GET /analytics/student/:id`.
3. Estudiante observa que en *"Grafos"* tiene 40% de maestría $\to$ Clic en *"Reforzar este tema"*.
4. Sistema lo redirige a los ejercicios específicos de esa unidad.

#### G. Estados Relevantes
* **Inicial:** Gráficos cargados con datos reales.
* **Historial Vacío:** Estado amigable *"Aún no has completado retos. ¡Empieza tu primer ejercicio hoy!"*.

#### H. Relación con Backend & Componentes
* **Fuentes API:** `GET /learning-progress/student/:id`, `GET /analytics/student/:id`.
* **Componentes:** `MasteryBarChart.vue`, `StreakCounter.vue`, `SubmissionsHistoryTable.vue`, `CognitiveStateBadge.vue`.

#### I. Debe Quedar Resuelto en Figma
* Visualización clara del gráfico de barras de maestría con etiquetas semánticas.
* Tabla de historial con paginación y modal de inspección de código.

---

## 3. Matriz Resumen de Interacciones y Componentes (Rol Estudiante)

| Pantalla | Pregunta Clave | Acción Primaria | Componente Clave | Endpoint Principal |
| :--- | :--- | :--- | :--- | :--- |
| **`COMP-V00`** | ¿Cómo ingreso a mis clases? | `[Iniciar Sesión]` | `AuthCard.vue` | `POST /auth/login` |
| **`EST-V01`** | ¿Qué debería estudiar hoy? | `[Continuar Unidad]` | `MasterySummaryCard.vue` | `GET /enrollment/my` |
| **`EST-V02`** | ¿Cómo funciona este algoritmo? | `[Comenzar Reto Práctico]` | `MarkdownViewer.vue` | `GET /content/unit/:id` |
| **`EST-V03`** | ¿Mi código resuelve el reto? | `[🚀 Entregar Solución]` | `CodeEditorMonaco.vue` | `POST /submissions/:id/submit` |
| **`EST-V04`** | ¿Por qué falla mi lógica? | `[Enviar Pregunta]` | `TutorChatDrawer.vue` | `POST /tutor/chat` |
| **`EST-V05`** | ¿Qué debo repasar hoy? | `[Repasar Ahora]` | `SpacedRepetitionCard.vue` | `GET /analytics/student/:id` |
| **`EST-V06`** | ¿Cuánto he dominado? | `[Reforzar Tema Débil]` | `MasteryBarChart.vue` | `GET /learning-progress/student/:id` |
