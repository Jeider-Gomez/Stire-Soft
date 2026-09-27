# STIRE — Plan de implementación para Jorge: QA general Semana 5

**Sprint:** Semana 5 · 14–18 de septiembre de 2026  
**Responsable:** Jorge Cervantes  
**Rol:** Gestión + Calidad  
**Objetivo:** comprobar que el proyecto STIRE-Soft, en su estado ejecutable actual, funcione correctamente de forma general, que sus principales componentes estén integrados y que las correcciones entregadas por el equipo/agentes funcionen realmente.

> **Importante:** Jorge NO repite las auditorías de código que ya realizan Claude Code, Antigravity o Codex. Los agentes desarrollan/auditan; Jorge valida el **resultado ejecutable** del proyecto.

> **Alcance de esta semana:** QA general del proyecto. **MODESEC y Figma quedan fuera del alcance de Jorge.** Tampoco debe hacer rediseño visual, auditoría profunda de código, administrar Trello, mantener la bitácora ni corregir directamente los errores encontrados.

## 1. Qué debe hacer esta semana

Jorge debe:

1. arrancar el proyecto actual;
2. comprobar que backend y frontend puedan ejecutarse correctamente;
3. recorrer los principales flujos del sistema;
4. probar las funcionalidades disponibles como usuario real;
5. comprobar las APIs que participan en esos flujos;
6. revisar la integración frontend ↔ backend ↔ base de datos/servicios;
7. verificar en ejecución las correcciones entregadas por Antigravity/Codex;
8. comprobar manejo de errores y comportamientos anómalos importantes;
9. registrar problemas con evidencia reproducible;
10. comunicar un resultado final: **VALIDADO / VALIDADO CON OBSERVACIONES / NO VALIDADO**.

Su función no es arreglar el sistema, sino **demostrar con evidencia si el sistema funciona o qué impide considerarlo listo**.

---

# 2. Paso a paso

## PASO 1 — Actualizar el proyecto

- [ ] Actualizar el repositorio.
- [ ] Leer las instrucciones de ejecución actuales.
- [ ] Confirmar dependencias y servicios necesarios.
- [ ] Verificar que está trabajando sobre el estado más reciente disponible.
- [ ] No compartir claves ni secretos.

## PASO 2 — Arrancar backend

- [ ] Levantar los servicios requeridos.
- [ ] Iniciar el backend.
- [ ] Confirmar que inicia sin errores críticos.
- [ ] Confirmar conexión con base de datos y servicios necesarios.
- [ ] Verificar que las rutas necesarias estén disponibles.

Si falla, registrar el error antes de intentar solucionarlo.

## PASO 3 — Arrancar frontend

- [ ] Ejecutar el frontend Nuxt actual.
- [ ] Abrirlo en el navegador.
- [ ] Revisar consola del navegador.
- [ ] Confirmar comunicación con backend cuando corresponda.
- [ ] Confirmar que las páginas principales carguen correctamente.

**No modificar el frontend únicamente para que pase la prueba.**

## PASO 4 — QA funcional general

Recorrer el sistema como usuario real. Como mínimo, comprobar el flujo disponible:

```text
Inicio / Login
 ↓
Autenticación
 ↓
Navegación
 ↓
Dashboard
 ↓
Curso / contenido / unidad
 ↓
Actividad / evaluación
 ↓
Envío
 ↓
Resultado / progreso
 ↓
Tutor IA
```

Comprobar, cuando cada funcionalidad esté disponible:

- [ ] Login correcto.
- [ ] Login incorrecto y mensaje de error.
- [ ] Logout.
- [ ] Navegación entre las rutas principales.
- [ ] Carga correcta de datos.
- [ ] Datos vacíos o inexistentes.
- [ ] Formularios.
- [ ] Validaciones.
- [ ] Estados de carga.
- [ ] Estados de error.
- [ ] Actividades/evaluaciones.
- [ ] Envío de respuestas.
- [ ] Resultados.
- [ ] Actualización/consulta del progreso.
- [ ] Tutor IA.
- [ ] Persistencia después de recargar cuando corresponda.

No es necesario probar una función que todavía no esté implementada; en ese caso se registra como pendiente si afecta la demostración o el flujo principal.

## PASO 5 — QA backend/API

No hacer una auditoría completa del código. Revisar las APIs **desde el comportamiento que necesita el usuario**.

Áreas a comprobar cuando participen en los flujos probados:

- [ ] Auth.
- [ ] Classes.
- [ ] Enrollments.
- [ ] Learning Units.
- [ ] Evaluations.
- [ ] Submissions.
- [ ] Learning State.
- [ ] Tutor.

Para cada problema relevante comprobar, cuando sea posible:

- código HTTP;
- respuesta recibida;
- datos enviados;
- datos devueltos;
- error de consola o servidor;
- relación con la acción realizada en frontend.

La pregunta central es:

> **¿La operación que necesita el usuario realmente funciona de principio a fin?**

## PASO 6 — QA de integración

Comprobar que los componentes que intervienen en el flujo trabajen juntos:

```text
Frontend Nuxt
     ↓
API / Backend NestJS
     ↓
Base de datos / servicios
     ↓
Respuesta
     ↓
Frontend
```

- [ ] Los datos enviados desde frontend llegan correctamente al backend.
- [ ] El backend procesa la operación esperada.
- [ ] La base de datos persiste o consulta correctamente cuando corresponde.
- [ ] La respuesta llega al frontend.
- [ ] La interfaz refleja el resultado real.
- [ ] Un error del backend no deja al frontend en un estado engañoso.

## PASO 7 — Verificar correcciones de Antigravity/Codex

Cuando las correcciones estén disponibles, probarlas **en ejecución real**.

### Self-XSS del Tutor IA — `P2-R4`

- [ ] Abrir el Tutor IA.
- [ ] Probar entradas que antes podían producir ejecución/renderizado inseguro.
- [ ] Confirmar que no se ejecute código enviado por el usuario.
- [ ] Confirmar que la conversación siga funcionando normalmente.
- [ ] Registrar evidencia.

### "Crear Nueva Clase" — `FE-02`

- [ ] Acceder al flujo como usuario autorizado.
- [ ] Abrir "Crear Nueva Clase".
- [ ] Completar el formulario.
- [ ] Enviar la información.
- [ ] Confirmar respuesta del backend.
- [ ] Confirmar que la clase creada aparezca donde corresponda.
- [ ] Registrar evidencia.

### Otros cambios entregados

- [ ] Probar los casos relacionados con intentos duplicados cuando estén disponibles.
- [ ] Probar que un estudiante no autorizado no pueda iniciar una actividad ajena cuando ese flujo esté disponible.
- [ ] Verificar las nuevas vistas funcionales de Docente/Administrador solo desde el comportamiento que ya esté implementado.
- [ ] Registrar resultado y evidencia.

> **No basta con que el agente diga “corregido”. Debe comprobarse en ejecución.**

## PASO 8 — Manejo de errores y casos anómalos

Probar de forma razonable algunos escenarios negativos:

- [ ] Credenciales incorrectas.
- [ ] Campos obligatorios vacíos.
- [ ] Datos inválidos.
- [ ] Recurso inexistente.
- [ ] Acción sin autorización cuando aplique.
- [ ] Fallo de API visible.
- [ ] Recarga de página durante un flujo cuando sea relevante.
- [ ] Respuesta vacía o sin datos.

El objetivo es detectar fallos que afecten la experiencia o la integridad del flujo, no realizar una prueba de seguridad exhaustiva.

## PASO 9 — Evidencia y registro de hallazgos

Cada problema importante debe quedar reproducible.

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

La evidencia debe permitir que Jeider o el agente correspondiente pueda reproducir el problema sin tener que adivinar qué ocurrió.

## PASO 10 — Revisar estado de las correcciones

- [ ] El cambio probado existe en GitHub.
- [ ] Existe commit identificable cuando corresponde.
- [ ] La evidencia corresponde al estado actual del repositorio.
- [ ] Los errores importantes fueron comunicados.
- [ ] No marcar como solucionado algo que solo fue prometido por un agente.

## PASO 11 — Cierre del QA

Jorge entrega una conclusión general:

```text
🟢 VALIDADO
El proyecto funciona en los flujos principales probados y puede demostrarse.

🟡 VALIDADO CON OBSERVACIONES
Los flujos principales funcionan, pero quedan problemas que deben registrarse.

🔴 NO VALIDADO
Existe uno o más problemas importantes que impiden considerar listo el resultado evaluado.
```

El resultado debe incluir:

- qué se probó;
- qué funcionó;
- qué falló;
- qué quedó pendiente;
- evidencia de los problemas relevantes;
- conclusión final.

---

# 3. Relación con Trello

### S05-JOR01

Ya fue cerrada mediante verificación de Claude Code para evitar duplicación de trabajo. Jorge no necesita repetir esa auditoría.

### S05-JOR02

Es la tarea principal de Jorge esta semana:

> **QA general del proyecto: funcional + backend/API + integración + validación de correcciones de agentes.**

Debe terminar con evidencia y resultado comunicado al equipo.

---

# 4. Qué NO corresponde a Jorge

Para evitar duplicación y mantener responsabilidades claras, Jorge **no debe**:

- hacer auditoría profunda de código;
- repetir hallazgos ya revisados por Claude Code, Antigravity o Codex;
- trabajar en MODESEC;
- comparar las pantallas con Figma;
- rediseñar interfaces;
- administrar Trello;
- mantener la bitácora;
- modificar código para solucionar los errores que encuentre.

Si encuentra un problema, **lo documenta y lo comunica** para que la persona/agente responsable lo corrija.

---

# 5. Seguimiento

**Martes, máximo 8:00 p. m.:** informar qué probó, qué encontró y si existe bloqueo.

**Jueves, máximo 8:00 p. m.:** informar qué queda por probar, riesgos y si puede cerrar el viernes.

**Viernes:** entregar resultado final de QA y comunicar qué puede considerarse validado.

---

# 6. Regla final

Jorge no tiene que demostrar que sabe programar arreglando todos los errores.

Su valor en el equipo es demostrar, con evidencia:

```text
¿El proyecto arranca?
¿El usuario puede iniciar sesión?
¿Los flujos principales funcionan?
¿La API responde correctamente?
¿Los datos se integran y persisten?
¿El Tutor IA funciona?
¿Las correcciones realmente quedaron funcionando?
¿Los errores importantes están documentados?
¿El proyecto puede demostrarse?
```

Si la respuesta es sí, el entregable puede validarse. Si no, se reporta exactamente qué falta.

---

**Documento operativo · Semana 5 · STIRE-Soft**
