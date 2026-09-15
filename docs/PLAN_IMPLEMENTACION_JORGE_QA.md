# STIRE — Plan de implementación para Jorge: QA Semana 5

**Sprint:** Semana 5 · 14–18 de septiembre de 2026  
**Responsable:** Jorge Cervantes  
**Rol:** Gestión + Calidad  
**Objetivo:** comprobar que los avances reales del equipo funcionen, se puedan demostrar y mantengan coherencia visual y funcional.

> **Importante:** Jorge NO repite las auditorías de código que ya realizan Claude Code, Antigravity o Codex. Los agentes desarrollan/auditan; Jorge valida el **resultado ejecutable**.

## 1. Qué debe hacer esta semana

Jorge debe:

1. arrancar el proyecto actual;
2. probar backend y frontend;
3. recorrer los flujos principales;
4. revisar las correcciones entregadas por los agentes;
5. comprobar visualmente las vistas actuales contra Figma/MODESEC;
6. hacer una revisión responsive básica;
7. registrar errores con evidencia;
8. comunicar un resultado final: **VALIDADO / CON OBSERVACIONES / NO VALIDADO**.

No debe administrar Trello, mantener la bitácora, rediseñar Figma ni modificar código solo para corregir lo que encuentre.

---

# 2. Paso a paso

## PASO 1 — Actualizar el proyecto

- [ ] Actualizar el repositorio.
- [ ] Leer instrucciones de ejecución actuales.
- [ ] Confirmar dependencias y servicios necesarios.
- [ ] No compartir claves ni secretos.

## PASO 2 — Arrancar backend

- [ ] Levantar los servicios requeridos.
- [ ] Iniciar el backend.
- [ ] Confirmar que inicia sin errores críticos.
- [ ] Confirmar conexión con base de datos/servicios necesarios.

Si falla, registrar el error antes de intentar solucionarlo.

## PASO 3 — Arrancar frontend

- [ ] Ejecutar el frontend Nuxt actual.
- [ ] Abrirlo en el navegador.
- [ ] Revisar consola del navegador.
- [ ] Confirmar comunicación con backend cuando corresponda.

**No modificar el frontend únicamente para que pase la prueba.**

## PASO 4 — QA funcional

Recorrer como usuario:

```text
Login
 ↓
Navegación
 ↓
Dashboard
 ↓
Contenido / unidad
 ↓
Actividad / evaluación
 ↓
Resultado / progreso
 ↓
Tutor IA
```

Comprobar:

- [ ] Login correcto e incorrecto.
- [ ] Logout.
- [ ] Rutas principales.
- [ ] Carga de datos.
- [ ] Formularios.
- [ ] Estados de carga/error/vacío.
- [ ] Evaluación y envío cuando esté disponible.
- [ ] Tutor IA.

## PASO 5 — QA del backend/API

No hacer una auditoría completa del código. Revisar las APIs que realmente utiliza el flujo:

- [ ] Auth.
- [ ] Classes.
- [ ] Enrollments.
- [ ] Learning Units.
- [ ] Evaluations.
- [ ] Submissions.
- [ ] Learning State.
- [ ] Tutor.

La pregunta es:

> **¿La operación que necesita el usuario realmente funciona?**

Cuando sea relevante, revisar respuesta HTTP, datos recibidos y errores de API.

## PASO 6 — QA de correcciones de Antigravity/Codex

Cuando estén entregadas las correcciones:

- [ ] Probar Self-XSS del Tutor con entrada HTML/script.
- [ ] Probar creación real de una clase como docente.
- [ ] Revisar las nuevas vistas de Docente/Administrador.
- [ ] Probar los casos relacionados con intentos duplicados.
- [ ] Probar que un estudiante no matriculado no pueda iniciar una actividad ajena.
- [ ] Registrar resultado y evidencia.

**No basta con que el agente diga “corregido”. Debe comprobarse en ejecución.**

## PASO 7 — QA visual

Comparar las vistas disponibles con:

```text
MODESEC + Figma
```

Revisar:

- [ ] Jerarquía visual.
- [ ] Tipografía.
- [ ] Espaciado.
- [ ] Botones.
- [ ] Formularios.
- [ ] Cards.
- [ ] Navegación.
- [ ] Estados.
- [ ] Coherencia entre pantallas.

Si encuentra una diferencia, **registrarla; no rediseñarla**.

## PASO 8 — Responsive

Probar al menos:

- [ ] Escritorio.
- [ ] Tablet.
- [ ] Móvil.

Buscar:

- contenido cortado;
- botones fuera de pantalla;
- textos superpuestos;
- scroll horizontal innecesario;
- navegación inutilizable.

## PASO 9 — Registrar hallazgos

Usar este formato:

```text
🔴 ERROR: [título]

Dónde:
[ventana / flujo]

Pasos:
1. ...
2. ...
3. ...

Esperado:
...

Actual:
...

Evidencia:
[captura / consola / respuesta API]

Prioridad:
CRÍTICA / ALTA / MEDIA / BAJA
```

## PASO 10 — Revisar evidencia

- [ ] El cambio probado existe en GitHub.
- [ ] Existe commit identificable cuando corresponde.
- [ ] La evidencia corresponde al estado actual.
- [ ] Los errores importantes fueron comunicados.

## PASO 11 — Cierre

Jorge entrega una conclusión:

```text
🟢 VALIDADO
Funciona y puede demostrarse.

🟡 VALIDADO CON OBSERVACIONES
Funciona, pero quedan problemas menores.

🔴 NO VALIDADO
Existe un problema que impide cerrar el entregable.
```

---

# 3. Relación con Trello

### S05-JOR01

Ya fue cerrada mediante verificación de Claude Code para evitar duplicación de trabajo. Jorge no necesita repetir esa auditoría.

### S05-JOR02

Es la tarea principal de Jorge esta semana:

> **QA integral del sistema: funcional + backend/API + visual + responsive + validación de correcciones de agentes.**

Debe terminar con evidencia y resultado comunicado al equipo.

---

# 4. Seguimiento

**Martes, máximo 8:00 p. m.:** informar qué probó, qué encontró y si existe bloqueo.

**Jueves, máximo 8:00 p. m.:** informar qué queda por probar, riesgos y si puede cerrar el viernes.

**Viernes:** entregar resultado final de QA y comunicar qué puede considerarse validado.

---

# 5. Regla final

Jorge no tiene que demostrar que sabe programar arreglando todos los errores.

Su valor en el equipo es demostrar, con evidencia:

```text
¿Arranca?
¿Funciona?
¿La API responde?
¿El usuario puede completar el flujo?
¿La interfaz se ve correctamente?
¿Respeta Figma/MODESEC?
¿La corrección realmente quedó funcionando?
¿Hay evidencia?
```

Si la respuesta es sí, el entregable puede validarse. Si no, se reporta exactamente qué falta.

---

**Documento operativo · Semana 5 · STIRE-Soft**