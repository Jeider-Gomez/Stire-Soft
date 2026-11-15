# Fase G · Lista de revisión de cierre de la v3

Para que el equipo recorra la app nueva sin perderse. Cada fila se marca **Cumple / No cumple / No aplica** y,
si no cumple, se anota una línea de qué pasó. Ver el plan en `PLAN_CONSTRUCCION_V3.md` (Fase G).

## 1. P02 · Recorrido por los 4 roles

Se hace en **computador** y en **celular**, en tema **claro** y **oscuro**.

| Rol | Recorrido mínimo | Computador | Celular |
|---|---|---|---|
| Visitante | Entrar y presentar STIRE → registrarse en dos pasos → errores por campo | | |
| Estudiante | Inicio → unirse a una clase → hacer un ejercicio con el Tutor → entregar → ver notas → Mi cuenta | | |
| Docente | Inicio → crear clase → publicar contenido → ver entregas y calificar → Avisos y mensajes → Ajustes → Mi cuenta | | |
| Administrador | Usuarios (solicitudes) → Catálogo → Sugerencias → Encuesta de usabilidad → Estado del sistema → Mi cuenta | | |

En cada pantalla comprobar:

- El título y el subtítulo se entienden sin explicación.
- No hay palabras como «bloqueado», «rezago» o «trabado»; se dice «necesita ayuda» o «va más lento».
- No hay textos cortados, botones fuera de la pantalla ni scroll horizontal en el celular.
- Todo se lee bien en claro y en oscuro (en especial el Tutor, nunca sobre morado).
- Las funciones del docente son opcionales: nada obliga a usarlas.

## 2. P03 · Accesibilidad (WCAG) con teclado y lector de pantalla

Con NVDA y solo el teclado (Tab, Shift+Tab, Enter, Espacio, Esc).

| Qué se prueba | Cumple |
|---|---|
| Se llega a todo con Tab y el foco siempre se ve | |
| El orden del foco sigue el orden visual | |
| Las ventanas se abren con foco dentro, se cierran con Esc y devuelven el foco | |
| Cada botón e icono tiene nombre (el lector no dice «botón» a secas) | |
| Los errores se anuncian y dicen en qué campo están | |
| Las pestañas se anuncian como pestañas y dicen cuál está activa | |
| Los avisos de éxito o de error se anuncian sin mover el foco | |
| Contraste mínimo 4,5:1 en texto normal, en claro y en oscuro | |
| Todo se puede ampliar al 200 % sin perder contenido | |
| Los botones táctiles miden al menos 44 px | |

## 3. Prueba con personas

Con el protocolo de `docs/calidad/PROTOCOLO_OBSERVACION.md`: pocas personas, tareas reales, sin ayudar, y se anota
dónde dudan. Con 5 personas se encuentra la mayoría de los problemas.

## 4. Cierre

- [ ] Los 5 del equipo dicen «cumple» en la evaluación heurística humana.
- [ ] Los pendientes que dependen del servidor están hechos, o anotados como v3.1 en `BITACORA.md`.
- [ ] `npm run verify:clean` (una sola vez, al final, con `VERIFY_START_TIMEOUT_MS=180000`) y su salida pegada en `CHANGELOG.md`.
- [ ] Se marca la etiqueta **v3.0.0**.
