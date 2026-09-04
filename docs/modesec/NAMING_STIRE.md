---
estado:     vigente
verificado: 2026-09-03 contra commit HEAD (FASE CC-04)
fuente:     normativo (fuente canónica de nombres)
codigos:    EST-V01..V06 · DOC-V01..V06 · ADM-V01..V03 · COMP-V00
---

# 🏷️ Guía Oficial de Naming y Lenguaje de Producto — STIRE-Soft (v1.0)

> **Manual de Nomenclatura, Jerarquía Lingüística, Copywriting UX y Vocabulario Pedagógico.**  
> **Objetivo:** Establecer una voz clara, profesional, moderna y natural para estudiantes universitarios y docentes, erradicando metáforas forzadas y jerga técnica opaca.  
> **Fecha de Publicación:** 2 de septiembre de 2026 | **Versión:** 1.0 Oficial

---

## 1. Principios Rectores del Naming en STIRE

Toda etiqueta, botón, título o mensaje en la plataforma debe regirse por cuatro principios:

1. **Claridad Cognitiva Inmediata:** El usuario debe entender qué hace la pantalla o el botón sin necesidad de un manual ni explicaciones metafóricas (*"Inicio"* se comprende en 10 ms; *"Mi Banco de Trabajo"* exige interpretación).
2. **Tono Educativo y Profesional:** STIRE es un Sistema Tutor Inteligente para educación superior universitaria. Su voz es rigurosa, cercana, respetuosa y orientada al logro, evitando tanto el tono frío-administrativo como el exceso de infantilización o jerga industrial.
3. **Separación de Tres Capas Lingüísticas:**
   * **Capa 1 — Código Técnico:** Identificador persistente para código y carpetas (`EST-V01`, `DOC-V03`).
   * **Capa 2 — Nombre Documental / Funcional:** Término formal para MODESEC, arquitectura y papers (`Dashboard del Estudiante`, `Diseñador de Ejercicios`).
   * **Capa 3 — Nombre Visible en UI / Navbar:** Etiqueta concisa, limpia y natural que lee el usuario en la interfaz (`Inicio`, `Crear Ejercicio`).
4. **Verbos Orientados a la Acción del Aprendiz:** Los botones no declaran estados del sistema; comunican lo que el usuario va a lograr (*"Entregar solución"*, no *"Enviar submission"*).

---

## 2. Diagnóstico Crítico de la Nomenclatura Anterior

### 🔍 El Problema de la Metáfora del "Taller del Artesano"
En versiones preliminares de MODESEC (§3.3.2) se adoptó la metáfora del *"Taller"* para nombrar pantallas: *"Mi Banco de Trabajo"*, *"Maestro de Taller"*, *"Mantenimiento del Taller"*, *"Bitácora"*.

**¿Por qué debe cambiarse en la interfaz visible?**
* **"Mi Banco de Trabajo":** Suena a taller de carpintería, mecánica o software industrial de fábrica. Para un estudiante de ingeniería de sistemas que aprende Algoritmos I, no comunica estudio, clases ni progreso.
* **"Mantenimiento del Taller":** Parece una pantalla de servicio técnico o limpieza de servidores, no una sesión de recuperación activa de la memoria (SM-2).
* **"Maestro de Taller":** Es un concepto arcaico gremial. El estudiante universitario moderno interactúa con un **Tutor Inteligente** o **Asistente IA**.
* **"Bitácora":** Aunque tiene raíz pedagógica, los estudiantes universitarios reconocen de forma mucho más natural **"Mi Progreso"** o **"Rendimiento"**.

---

## 3. Matriz de Evaluación de Nombres Actuales

| Código | Nombre Anterior (Visible) | Problema Identificado | Claridad (1-5) | Naturalidad (1-5) | Profesionalismo (1-5) | Nombre Visible Recomendado |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| `COMP-V00` | *Ingreso al Taller* | Metafórico; confuso en contexto universitario. | 3/5 | 2/5 | 3/5 | **Iniciar Sesión / Registro** |
| `EST-V01` | *Mi Banco de Trabajo* | Suena industrial/fabril; no comunica aula ni cursos. | 2/5 | 2/5 | 2/5 | **Inicio** (o **Mis Clases**) |
| `EST-V02` | *Unidad Teórica* | Frío y pasivo; sugiere lectura monótona sin práctica. | 4/5 | 3/5 | 4/5 | **Lección: [Título de Unidad]** |
| `EST-V03` | *Sandbox / Editor* | Jerga técnica de infraestructura; no habla de resolver problemas. | 3/5 | 2/5 | 4/5 | **Práctica / Ejercicio: [Nombre]** |
| `EST-V04` | *Maestro de Taller* | Término gremial arcaico; oculta la tecnología IA adaptativa. | 2/5 | 2/5 | 3/5 | **Tutor IA** |
| `EST-V05` | *Mantenimiento del Taller* | Parece soporte técnico; oculta el valor de la memoria. | 1/5 | 1/5 | 2/5 | **Repasos Diarios** |
| `EST-V06` | *Mi Bitácora* | Poco directo; sugiere un diario de texto libre. | 3/5 | 3/5 | 4/5 | **Mi Progreso** |
| `DOC-V01` | *Panel General del Docente* | Burocrático y redundante. | 4/5 | 3/5 | 4/5 | **Mis Clases** (o **Panel Principal**) |
| `DOC-V02` | *Gestor Curricular* | Demasiado abstracto para la navegación diaria. | 3/5 | 3/5 | 4/5 | **Contenidos y Temas** |
| `DOC-V03` | *Diseñador de Ejercicios* | Aceptable, pero puede ser más directo. | 4/5 | 4/5 | 4/5 | **Crear Ejercicio** |
| `DOC-V04` | *Analítica de Cohorte* | Lenguaje estadístico formal; útil en reportes, pesado en navbar. | 3/5 | 3/5 | 4/5 | **Rendimiento del Grupo** |
| `DOC-V05` | *Seguimiento Pedagógico* | Formal; suena a auditoría punitiva. | 3/5 | 3/5 | 4/5 | **Detalle de Estudiante** |
| `ADM-V01` | *Panel de Control de Plataforma* | Extenso. | 4/5 | 4/5 | 4/5 | **Estado del Sistema** |
| `ADM-V02` | *Gestión Global de Usuarios* | Estándar pero largo. | 4/5 | 4/5 | 4/5 | **Usuarios y Roles** |
| `ADM-V03` | *Supervisión y Parámetros* | Poco claro sobre qué hace la pantalla. | 3/5 | 3/5 | 4/5 | **Logs y Mantenimiento** |

---

## 4. Naming Definitivo por Actor del Sistema

### 🎓 4.1 ROL ESTUDIANTE

```
Estructura de Navegación del Estudiante
├── [Navbar Principal]
│   ├── Inicio (EST-V01)
│   ├── Repasos (EST-V05)
│   └── Mi Progreso (EST-V06)
│
└── [Espacios de Aprendizaje]
    ├── Lección (EST-V02)
    ├── Ejercicio / Práctica (EST-V03)
    └── Tutor IA (EST-V04 — Drawer Flotante)
```

| Código | Nombre Documental (MODESEC) | Nombre Visible en UI / Navbar | Alternativas Evaluadas | Justificación de la Elección |
| :---: | :--- | :--- | :--- | :--- |
| **`COMP-V00`** | **Acceso y Registro** | **Iniciar Sesión** / **Crear Cuenta** | A) *Ingreso al Taller*<br>B) *Portal de Entrada*<br>C) *Autenticación* | Universal, sin ambigüedad y estándar en la web universitaria. |
| **`EST-V01`** | **Dashboard del Estudiante** | **Inicio** | A) *Mi Aprendizaje*<br>B) *Mi Banco de Trabajo*<br>C) *Mis Cursos*<br>D) *Panel Principal* | *"Inicio"* es el estándar de navegación universal (Duolingo, Khan Academy, Coursera). Reduce la carga de lectura a 0. |
| **`EST-V02`** | **Unidad de Aprendizaje (Teoría)** | **Lección: [Título de Unidad]** *(o simplemente Contenido)* | A) *Unidad Teórica*<br>B) *Conceptos*<br>C) *Aprender* | *"Lección"* comunica una sesión de aprendizaje estructurada que combina explicación, código y trazado. |
| **`EST-V03`** | **Entorno de Programación y Evaluación** | **Ejercicio: [Nombre]** *(Navbar: Práctica)* | A) *Sandbox de Código*<br>B) *Resolución de Reto*<br>C) *Laboratorio* | *"Ejercicio"* es el término académico natural en cursos de algoritmia; *"Práctica"* es el verbo rector en el menú. |
| **`EST-V04`** | **Tutor Socrático Adaptativo** | **Tutor IA** | A) *Maestro de Taller*<br>B) *Asistente Pedagógico*<br>C) *Guía Virtual* | Conciso, moderno y honesto con la tecnología (evita el antropomorfismo y clarifica su función de apoyo). |
| **`EST-V05`** | **Módulo de Repetición Espaciada (SM-2)** | **Repasos** *(o Repasos Diarios)* | A) *Mantenimiento*<br>B) *Entrenamiento SM-2*<br>C) *Gimnasio de Algoritmos* | *"Repasos"* comunica de inmediato recuperación activa y prevención del olvido en una sola palabra. |
| **`EST-V06`** | **Analítica y Bitácora de Aprendizaje** | **Mi Progreso** | A) *Mi Bitácora*<br>B) *Métricas*<br>C) *Historial y Dominio* | *"Mi Progreso"* es personal, fomenta la autorregulación y se alinea con las plataformas educativas líderes. |

---

### 👨‍🏫 4.2 ROL DOCENTE

```
Estructura de Navegación del Docente
├── Mis Clases (DOC-V01)
├── Contenidos y Temas (DOC-V02)
├── Crear Ejercicio (DOC-V03)
├── Rendimiento del Grupo (DOC-V04)
├── Detalle de Estudiante (DOC-V05)
└── Mensajes (DOC-V06)
```

| Código | Nombre Documental (MODESEC) | Nombre Visible en UI / Navbar | Justificación de la Elección |
| :---: | :--- | :--- | :--- |
| **`DOC-V01`** | **Panel de Gestión de Clases** | **Mis Clases** | Foco directo en las asignaturas y cohortes que el docente tiene a su cargo. |
| **`DOC-V02`** | **Gestor Curricular de Unidades** | **Contenidos y Temas** | Término docente intuitivo para organizar el árbol de módulos y materias. |
| **`DOC-V03`** | **Diseñador de Ejercicios y Casos de Prueba** | **Crear Ejercicio** *(o Banco de Ejercicios)* | Verbo de acción directo para la autoría pedagógica de problemas de código. |
| **`DOC-V04`** | **Analítica de Cohorte y Alertas** | **Rendimiento del Grupo** | Comunica supervisión académica y detección de estudiantes rezagados. |
| **`DOC-V05`** | **Seguimiento Individual de Estudiante** | **Detalle de Estudiante** | Vista profunda para inspeccionar el historial y código de un alumno específico. |
| **`DOC-V06`** | **Bandeja de Mensajería Docente-Estudiante** | **Mensajes** | Comunicación directa fuera del Tutor IA (exclusivo del estudiante). Recuperada en FASE CC-04 (D-02): el backend ya existía (6 endpoints) sin ventana asignada en esta guía. |

---

### 🛡️ 4.3 ROL ADMINISTRADOR

| Código | Nombre Documental (MODESEC) | Nombre Visible en UI / Navbar | Justificación de la Elección |
| :---: | :--- | :--- | :--- |
| **`ADM-V01`** | **Panel de Control y Métricas del Sistema** | **Estado del Sistema** | Visión panorámica de salud de la plataforma, base de datos y sandbox. |
| **`ADM-V02`** | **Directorio y Gestión de Usuarios** | **Usuarios y Roles** | Nombre estándar y preciso para la administración de cuentas y permisos. |
| **`ADM-V03`** | **Auditoría Técnica y Logs de Infraestructura** | **Logs y Mantenimiento** | Inspección de eventos de seguridad y configuración del entorno seguro. |

---

## 5. Naming de Acciones Principales (Microcopy UX)

Se depura el lenguaje técnico de desarrollador por un microcopy claro y centrado en la tarea del usuario:

| Acción en la Plataforma | Copy Anterior (Evitar) | Copy Recomendado (UI) | Justificación Lingüística |
| :--- | :--- | :--- | :--- |
| **Retomar estudio en Dashboard** | *Continuar Unidad Activa* | `[Continuar lección]` | Menos frío; indica la acción directa. |
| **Entrar al ejercicio desde teoría** | *Comenzar Reto Práctico* | `[Ir al ejercicio ➔]` | Más dinámico y natural que "comenzar reto". |
| **Ejecutar prueba libre en editor** | *Probar Casos Públicos* / *Run* | `[▶ Probar código]` | Claridad absoluta; no consume intentos. |
| **Calificar ejercicio formalmente** | *Enviar Submission* / *Submit* | `[🚀 Entregar solución]` | Verbo académico estándar en evaluaciones. |
| **Pedir ayuda en editor** | *Consultar Maestro de Taller* | `[💡 Pedir pista al Tutor]` | Enfoca la expectativa: el tutor da pistas, no soluciones. |
| **Iniciar sesión de SM-2** | *Ejecutar Mantenimiento* | `[Iniciar repaso (5 min)]` | Indica beneficio y tiempo estimado sin jerga técnica. |
| **Reforzar tema débil en bitácora** | *Nivelar Unidad Reprobada* | `[Reforzar este tema]` | Enfoque motivacional y constructivo (*growth mindset*). |
| **Unirse a clase docente** | *Ejecutar Enrollment con Código* | `[+ Unirse a una clase]` | Lenguaje accesible para cualquier estudiante. |
| **Publicar unidad (Docente)** | *Alternar PublicationStatus* | `[Publicar]` / `[Guardar borrador]` | Términos editoriales estándar. |

---

## 6. Naming de Conceptos Pedagógicos: Motor vs. Interfaz

Los conceptos técnicos del motor de evaluación y del algoritmo SM-2 deben traducirse a un lenguaje humano comprensible:

| Concepto Técnico (Backend / Docs) | Término Interno | Cómo Debe Mostrarse al Estudiante en UI | Razón Pedagógica |
| :--- | :--- | :--- | :--- |
| **`mastery` (0 a 100%)** | *Puntaje de Maestría* | **Dominio del tema** (ej. *"Dominio: 75%"*) | "Dominio" es más natural en español universitario que "maestría" (que se confunde con posgrado). |
| **`cognitiveState: 'dominado'`** | *Estado Cognitivo Dominado* | **Badge verde: Dominado ✔** | Claridad y refuerzo positivo. |
| **`cognitiveState: 'en_practica'`** | *Estado En Práctica* | **Badge ámbar: En progreso ⏳** | Comunica que el tema está en desarrollo sin connotación de fracaso. |
| **`cognitiveState: 'no_visto'`** | *Estado No Visto* | **Badge gris: Por iniciar ⚪** | Indica estado inicial neutro. |
| **`easeFactor` (SM-2)** | *Factor de Facilidad* | **OCULTO.** No se muestra al alumno. | Parámetro matemático irrelevante para el usuario. |
| **`reviewUrgency: 'critical'`** | *Urgencia Crítica* | **■ Repaso urgente (vencido)** | Doble codificación (forma + color + texto). |
| **`reviewUrgency: 'today'`** | *Urgencia Hoy* | **▲ Toca repasar hoy** | Mensaje motivador y oportuno. |
| **`reviewUrgency: 'al_dia'`** | *Sin Repasos* | **⬤ Al día** | Refuerzo positivo de constancia. |
| **`scaffoldingTier: 1`** | *Tier 1 Hint* | **Pista conceptual** | Explica el alcance de la ayuda del tutor. |
| **`scaffoldingTier: 2`** | *Tier 2 Guiding Question* | **Pregunta orientadora** | Fomenta la autorreflexión socrática. |
| **`scaffoldingTier: 3`** | *Tier 3 Error Locating* | **Ubicación de la falla** | Ayuda a focalizar la depuración en el editor. |

---

## 7. Diccionario de Términos: Qué Usar vs. Qué Evitar

```
✅ VOCABULARIO OFICIAL STIRE (USAR)
├── Inicio · Lección · Ejercicio · Tutor IA · Repasos · Mi Progreso
├── Dominio · En progreso · Por iniciar · Reforzar · Pista
├── Probar código · Entregar solución · Unirse a clase
└── Casos públicos · Casos ocultos · Diferencia de salida (Diff)

❌ VOCABULARIO DESCARTADO (EVITAR EN UI)
├── Banco de trabajo · Maestro de taller · Mantenimiento del taller
├── Submission · Payload · Grader · Sandbox (en textos visibles)
├── Factor de facilidad · Algoritmo SM-2 · Deuda cognitiva
└── Nivel reprobatorio · Castigo · Intento fallido definitivo
```

---

## 8. Trazabilidad Completa: Código $\to$ Documental $\to$ Visible

| Código Técnico | Nombre Documental (MODESEC / Backend) | Nombre Visible en la Interfaz (UI / Figma / Vue) |
| :--- | :--- | :--- |
| `COMP-V00` | Acceso y Autenticación Multi-Rol | **Iniciar Sesión** / **Crear Cuenta** |
| `EST-V01` | Dashboard del Estudiante | **Inicio** |
| `EST-V02` | Unidad de Aprendizaje (Teoría y Trazado) | **Lección: [Título de Unidad]** |
| `EST-V03` | Entorno de Programación y Evaluación en Sandbox | **Ejercicio: [Nombre]** *(Sección: Práctica)* |
| `EST-V04` | Tutor Socrático Adaptativo con IA | **Tutor IA** |
| `EST-V05` | Módulo de Repetición Espaciada SM-2 | **Repasos** |
| `EST-V06` | Analítica y Bitácora de Aprendizaje | **Mi Progreso** |
| `DOC-V01` | Panel de Gestión de Clases Docente | **Mis Clases** |
| `DOC-V02` | Gestor Curricular de Módulos y Unidades | **Contenidos y Temas** |
| `DOC-V03` | Diseñador de Ejercicios y Casos de Prueba | **Crear Ejercicio** |
| `DOC-V04` | Analítica de Cohorte y Alertas de Rendimiento | **Rendimiento del Grupo** |
| `DOC-V05` | Seguimiento Individual de Estudiante | **Detalle de Estudiante** |
| `DOC-V06` | Bandeja de Mensajería Docente-Estudiante | **Mensajes** |
| `ADM-V01` | Panel de Control y Salud del Sistema | **Estado del Sistema** |
| `ADM-V02` | Directorio y Gestión de Usuarios y Roles | **Usuarios y Roles** |
| `ADM-V03` | Auditoría Técnica y Parámetros del Entorno | **Logs y Mantenimiento** |

---

## 9. Personalidad Lingüística y Tono de STIRE

Se define un **Tono Híbrido Educativo-Profesional**:
* **Cercano pero respetuoso:** Habla en segunda persona (*"Continúa tu lección"*, *"Tu código superó 3 de 3 casos"*), sin caer en tuteos excesivamente informales ni en frialdad burocrática.
* **Formativo ante el error:** Los mensajes nunca dicen *"Código incorrecto, fallaste"*; dicen *"Tu salida difiere de la esperada en la línea 2. Revisa el caso de prueba o pide una pista al Tutor IA"*.
* **Orientado a la maestría:** Celebra el dominio conceptual y el esfuerzo continuo, reforzando la mentalidad de crecimiento.
