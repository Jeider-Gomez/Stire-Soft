# STIRE — Plan de implementación para Jorge: Calidad y Pruebas

**Sprint:** Semana 4  
**Responsable:** Jorge Cervantes  
**Rol:** Calidad y Pruebas  
**Propósito:** verificar que los avances de STIRE funcionen realmente, detectar errores y dejar evidencia suficiente para que el equipo pueda cerrar las tareas.

> **Importante:** Jorge no administra Trello durante este sprint. Pedro mantiene Trello y la bitácora. Jorge se concentra en pruebas, revisión visual/funcional y validación de entregables.

---

## 1. Objetivo del trabajo

Jorge debe actuar como la persona que **comprueba** que lo desarrollado por el equipo puede utilizarse y demostrarse.

Su trabajo no consiste en programar nuevas funcionalidades ni en rediseñar el sistema. Consiste en:

1. arrancar el proyecto correctamente;
2. comprobar que backend y frontend estén disponibles;
3. probar los flujos principales como usuario;
4. revisar visualmente las pantallas actuales;
5. registrar errores concretos;
6. comprobar que los entregables tengan evidencia en GitHub;
7. comunicar al equipo qué está aprobado, qué necesita corrección y qué sigue pendiente.

---

# 2. Regla de trabajo

**No marcar algo como correcto solamente porque el código existe.**

Para validar una funcionalidad debe comprobarse:

```text
Código existe
      ↓
Proyecto arranca
      ↓
Funcionalidad funciona
      ↓
Interfaz se puede utilizar
      ↓
No aparece un error crítico
      ↓
Existe evidencia
      ↓
VALIDADO
```

Si alguna parte falla, registrar el problema antes de darlo por terminado.

---

# 3. PASO 1 — Preparar el entorno

Antes de probar funcionalidades, obtener la versión actual del repositorio y seguir las instrucciones oficiales del proyecto.

### Checklist

- [ ] Actualizar el repositorio local (`git pull` o equivalente).
- [ ] Leer el `README.md` raíz.
- [ ] Revisar las instrucciones de ejecución del backend.
- [ ] Revisar las instrucciones de `frontend-nuxt/`.
- [ ] Confirmar variables de entorno necesarias sin compartir secretos.
- [ ] Confirmar que Docker/servicios requeridos estén disponibles, si el flujo actual los necesita.

**Recomendación:** no modificar código durante esta fase salvo que exista una corrección mínima necesaria para poder ejecutar una prueba. Primero registrar el problema.

---

# 4. PASO 2 — Arrancar el backend

Jorge debe comprobar primero que la API pueda ejecutarse.

### Checklist

- [ ] Instalar dependencias si es necesario.
- [ ] Levantar los servicios requeridos.
- [ ] Iniciar el backend siguiendo el README.
- [ ] Confirmar que el servidor queda escuchando en el puerto esperado.
- [ ] Comprobar que no existan errores críticos al iniciar.
- [ ] Verificar que la base de datos/servicios requeridos estén disponibles.
- [ ] Registrar cualquier error de arranque.

### Si falla

No intentar arreglar cinco cosas a la vez.

Registrar:

```text
ERROR
Qué ocurrió:
Dónde ocurrió:
Cómo reproducirlo:
Mensaje del error:
Qué se esperaba:
Qué ocurrió realmente:
```

Comunicar el bloqueo a Jeider/Pedro.

---

# 5. PASO 3 — Arrancar el frontend actual

**No modificar el frontend Nuxt como parte de esta tarea.**

El frontend actual debe probarse tal como se encuentra.

### Checklist

- [ ] Entrar en `frontend-nuxt/`.
- [ ] Instalar dependencias si corresponde.
- [ ] Ejecutar el comando oficial de desarrollo.
- [ ] Confirmar que Nuxt inicia.
- [ ] Abrir la aplicación en el navegador.
- [ ] Comprobar que no existen errores críticos de consola.
- [ ] Confirmar que puede comunicarse con el backend cuando corresponda.

---

# 6. PASO 4 — Prueba funcional básica

Probar primero como usuario real, no mirando únicamente el código.

## Autenticación

- [ ] Abrir login.
- [ ] Probar credenciales válidas.
- [ ] Confirmar entrada al sistema.
- [ ] Probar credenciales inválidas.
- [ ] Confirmar mensaje de error adecuado.
- [ ] Probar logout.
- [ ] Confirmar que una ruta protegida no quede accesible después de cerrar sesión.

## Navegación

- [ ] Probar menú principal.
- [ ] Probar enlaces internos.
- [ ] Confirmar que las rutas carguen correctamente.
- [ ] Confirmar que no existan enlaces rotos.
- [ ] Confirmar que el botón volver/regresar funcione cuando corresponda.

---

# 7. PASO 5 — Probar flujo del estudiante

El estudiante es el flujo prioritario para la validación.

### Recorrido recomendado

```text
Login
 ↓
Dashboard
 ↓
Unidad de aprendizaje
 ↓
Contenido
 ↓
Actividad / ejercicio
 ↓
Evaluación
 ↓
Envío
 ↓
Resultado
 ↓
Progreso
```

### Checklist

- [ ] Dashboard carga correctamente.
- [ ] Las unidades visibles corresponden a los datos disponibles.
- [ ] Se puede abrir una unidad.
- [ ] El contenido se visualiza correctamente.
- [ ] El ejercicio puede utilizarse.
- [ ] La evaluación inicia correctamente.
- [ ] Los datos se guardan cuando corresponda.
- [ ] El envío funciona.
- [ ] El resultado se muestra correctamente.
- [ ] El progreso se actualiza cuando corresponda.

Registrar cualquier comportamiento inesperado.

---

# 8. PASO 6 — Probar Tutor IA

El objetivo es comprobar el flujo completo, no evaluar si la respuesta del modelo es perfecta desde el punto de vista científico.

### Checklist

- [ ] Abrir Tutor IA.
- [ ] Enviar una pregunta relacionada con el contenido.
- [ ] Confirmar que la petición llega al backend.
- [ ] Confirmar que se recibe una respuesta.
- [ ] Comprobar estado de carga.
- [ ] Comprobar comportamiento ante error de conexión.
- [ ] Comprobar que no se exponga una API key en el navegador.
- [ ] Registrar resultado.

Si el Tutor falla, indicar si el problema parece estar en frontend, backend, proveedor o configuración.

---

# 9. PASO 7 — Revisión visual

Después de comprobar que el flujo funciona, revisar visualmente las pantallas.

La referencia es:

```text
MODESEC + Figma
```

### Revisar

- [ ] Jerarquía visual.
- [ ] Títulos y textos.
- [ ] Espaciado.
- [ ] Botones.
- [ ] Formularios.
- [ ] Cards.
- [ ] Navegación.
- [ ] Estados de carga.
- [ ] Mensajes de error.
- [ ] Estados vacíos.
- [ ] Responsive.

### Prueba rápida responsive

Abrir las vistas en:

- [ ] Escritorio.
- [ ] Tablet.
- [ ] Móvil.

Buscar especialmente:

- contenido cortado;
- botones fuera de pantalla;
- textos superpuestos;
- scroll horizontal innecesario;
- sidebar que impida utilizar el contenido.

**Jorge no debe rediseñar.** Si encuentra una diferencia, debe registrarla como observación para José/Jeider.

---

# 10. PASO 8 — Revisar backend desde la perspectiva funcional

Jorge debe comprobar que las operaciones principales realmente respondan.

Priorizar las rutas que participan en los flujos actuales:

```text
Auth
Classes
Enrollments
Learning Units
Evaluations
Submissions
Learning State
Tutor
```

No es necesario hacer una auditoría completa del backend.

La prueba debe responder:

> “¿La funcionalidad que el usuario necesita realmente funciona?”

---

# 11. PASO 9 — Registrar errores correctamente

Cada error debe convertirse en una observación accionable.

### Formato recomendado

```text
🔴 ERROR: [título corto]

Dónde:
[ventana / flujo]

Pasos para reproducir:
1. ...
2. ...
3. ...

Esperado:
...

Actual:
...

Evidencia:
[captura / consola / endpoint]

Prioridad:
CRÍTICA / ALTA / MEDIA / BAJA
```

### Prioridades

**CRÍTICA:** impide usar el sistema o bloquea una demostración principal.

**ALTA:** una función importante no funciona correctamente.

**MEDIA:** existe un problema, pero el flujo principal puede continuar.

**BAJA:** detalle visual o mejora menor.

---

# 12. PASO 10 — Revisar evidencia en GitHub

Antes del cierre, comprobar que los resultados importantes tengan respaldo.

### Checklist

- [ ] El código está en GitHub.
- [ ] Los cambios tienen commits identificables.
- [ ] Las funcionalidades probadas corresponden al estado actual del repositorio.
- [ ] Las capturas/evidencias necesarias están disponibles.
- [ ] Los problemas encontrados están comunicados.
- [ ] Los entregables evaluables pueden mostrarse.

Recordar la regla del proyecto:

> **Lo que no está respaldado en GitHub no puede considerarse terminado.**

---

# 13. PASO 11 — Comunicación con Pedro y Jeider

Jorge debe informar resultados, no solamente decir “ya revisé”.

### Reporte de martes

```text
📊 MARTES · Jorge

1. Terminé:
- ...

2. Estoy probando:
- ...

3. Encontré:
- ...

4. Me bloquea:
- ... / nada
```

### Reporte de jueves

```text
⚠️ JUEVES · Jorge

1. ¿Llego al viernes? → SÍ / EN RIESGO / NO
2. Me falta probar: ...
3. Encontré estos problemas: ...
4. Necesito apoyo de: ... / nada
```

---

# 14. PASO 12 — Validación final

Antes de mover una tarjeta a `✅ Hecho`, Jorge debe comprobar:

```text
☑ El entregable existe en GitHub.
☑ Está completo.
☑ Se puede ejecutar o mostrar.
☑ El flujo principal funciona.
☑ No tiene errores críticos conocidos.
☑ Las observaciones importantes fueron comunicadas.
☑ Existe evidencia suficiente.
```

Si falta una condición, **no aprobar todavía**.

---

# 15. Relación con las tarjetas actuales de Jorge

Las tareas de calidad de esta semana se agrupan así:

### S04-JOR01 — Pruebas funcionales

Objetivo: probar los flujos principales.

Orden recomendado:

1. Arranque backend.
2. Arranque frontend.
3. Login.
4. Navegación.
5. Flujo estudiante.
6. Evaluación.
7. Tutor IA.
8. Registro de errores.

### S04-JOR02 — Revisar calidad frontend

Objetivo: comprobar funcionamiento y presentación del frontend actual.

Orden recomendado:

1. Abrir vistas.
2. Revisar navegación.
3. Revisar formularios.
4. Revisar mensajes.
5. Revisar responsive.
6. Comparar con Figma/MODESEC.
7. Registrar observaciones.

### S04-JOR03 — Revisión final

Objetivo: verificar que los entregables tengan evidencia suficiente para el cierre.

Orden recomendado:

1. Revisar GitHub.
2. Revisar resultados de pruebas.
3. Revisar evidencias.
4. Identificar pendientes.
5. Comunicar a Pedro.
6. Confirmar qué puede pasar a `✅ Hecho`.

---

# 16. Qué NO debe hacer Jorge

Para evitar que el trabajo se mezcle:

- ❌ No administrar Trello.
- ❌ No mantener la bitácora.
- ❌ No modificar el frontend Nuxt para “mejorarlo”.
- ❌ No rediseñar Figma.
- ❌ No implementar funcionalidades nuevas como parte de QA.
- ❌ No cambiar el backend solo porque una prueba falle.
- ❌ No marcar una tarea como terminada sin comprobarla.

Si encuentra un problema de código, **lo reporta con evidencia al responsable**.

---

# 17. Definition of Done para Jorge

La responsabilidad de Jorge se considera cumplida cuando:

- [ ] El proyecto fue ejecutado.
- [ ] Backend y frontend fueron comprobados.
- [ ] Los flujos principales fueron probados.
- [ ] Tutor IA fue probado cuando esté disponible.
- [ ] La interfaz fue revisada visualmente.
- [ ] Se realizaron pruebas responsive básicas.
- [ ] Los errores fueron registrados claramente.
- [ ] Las evidencias fueron revisadas.
- [ ] Pedro y Jeider recibieron el resultado.

---

# 18. Resultado esperado

Al finalizar, Jorge debe poder entregar una conclusión sencilla:

```text
🟢 VALIDADO
El flujo principal funciona y puede demostrarse.

🟡 VALIDADO CON OBSERVACIONES
Funciona, pero existen problemas menores pendientes.

🔴 NO VALIDADO
Existe un problema que impide considerar terminado el entregable.
```

La finalidad de este proceso no es encontrar errores por encontrar errores. Es **reducir el riesgo antes de la demostración y proporcionar evidencia objetiva del estado real del proyecto**.

---

**Documento operativo para el Sprint Semana 4.**  
**Responsable:** Jorge Cervantes · Calidad y Pruebas  
**Gestión de Trello:** Pedro Romero  
**Bitácora:** Pedro Romero  
**Desarrollo técnico:** Jeider Gómez / Pedro Romero
