---
estado:     análisis (pedido por el dueño del proyecto el 2026-09-30)
verificado: 2026-09-30 contra el código de main (552179f) y el servidor de producción
---

# ¿Tomamos las mejores decisiones? — Revisión de las decisiones de STIRE

Cada decisión se juzga contra **las restricciones reales del proyecto**: cero cobros, un equipo universitario de cinco personas, un
semestre, y que otro grupo pueda continuarlo. «Buena» no significa «la mejor en abstracto»: significa la mejor para esas condiciones.

**Resumen:** la mayoría de las decisiones técnicas son buenas y están justificadas. Los riesgos están en **la operación**
(cuentas personales, servidor que se apaga, memoria justa) y en **la validación** (el aprendizaje solo se ha probado con estudiantes
simulados), no en el código.

## 1. Decisiones que volvería a tomar

| Decisión | Por qué fue buena | Qué hay que vigilar |
|---|---|---|
| **NestJS + TypeORM + MariaDB** | Módulos claros, guardias de roles globales, 934 pruebas. Es un stack que otro grupo aprende rápido | Los `enum` de MariaDB exigen una migración a mano cada vez que se agrega un valor (se hizo 3 veces) |
| **Nuxt 3 como SPA en Vercel** | Gratis, despliegue automático con cada `push` a `main` | Página y API en sitios distintos: obliga a cuidar CORS y `Cross-Origin-Resource-Policy` (ya pasó con las imágenes) |
| **Juez propio en procesos aislados** (ADR 06) | Sin costo, sin contenedores privilegiados; barreras de red, permisos y tiempo probadas | Solo JavaScript; 2 s por ejecución y pocas ejecuciones a la vez (ver §2.4) |
| **HTML/CSS calificados por reglas** con jsdom (ADR 13) | El curso lo exige y un juez de salida no sirve para marcado | Lo visual (posiciones, responsive) queda a criterio del docente |
| **CodeMirror 6** (Fase 26) | Funciona en el celular (Monaco no: su README lo dice), accesible, MIT, carga bajo demanda | Ninguno relevante |
| **Tutor con la clave gratuita de cada estudiante** (ADR 10) | Cero costo para el proyecto; la clave se guarda cifrada | Cada estudiante debe crear su clave (fricción) y la capa gratuita da errores 429 |
| **Práctica adaptativa con reglas explicables** (casillas, recomendador, SM-2) | Cada recomendación dice su motivo; todo tiene pruebas | Calibrada solo con estudiantes simulados |
| **Recursos multimedia por enlace, con lista cerrada de sitios** | Cero almacenamiento para Word/PowerPoint/PDF; el servidor arma la dirección y el HTML pegado nunca se guarda | Un sitio nuevo exige tocar el código |
| **Imágenes en la base de datos** (1 MB c/u, 50 MB por docente) | Entran solas en la copia diaria; con estos límites el tamaño es manejable | Si el uso crece mucho, pasarlas a un almacenamiento de objetos |
| **Repositorio público y `.env` nunca versionado** | Historial limpio verificado | Falta una licencia (§3.3) |

## 2. Decisiones que hay que corregir o reforzar

### 2.1 El servidor depende de encenderlo a mano — **prioridad alta**
La VM de Azure se apaga a las 23:00 y **no puede encenderse sola**: la suscripción de estudiante rechazó Azure Automation en todas las
regiones (30/09). Si nadie la enciende, la aplicación no funciona. **Opciones:** encenderla a mano (app de Azure) o quitar el apagado
durante las semanas de uso real (~7 USD por semana del crédito de 100 USD). Es una decisión del dueño.

### 2.2 Todo depende de cuentas personales — **prioridad alta para la continuidad**
Repositorio, Azure (vence con la suscripción de estudiante), DuckDNS, Vercel y el Gmail del correo están a nombre de una persona.
**Recomendación:** repositorio en una organización de GitHub con el docente; un dominio o subdominio de la universidad en lugar de
DuckDNS; y en la guía de traspaso, cómo el siguiente grupo monta su propio servidor con sus propias claves.

### 2.3 La memoria del servidor está calculada para otra máquina — **prioridad media, cambio pequeño**
`docker-compose.prod.yml` da al backend `mem_limit: 3g`, pensado para la máquina de Oracle de 12 GB (ADR 13). La VM real de Azure tiene
**4 GB** y en ella también corre MariaDB. Si el backend usara sus 3 GB, a la base y al sistema les quedaría menos de 1 GB.
**Recomendación:** bajar el límite a ~1,5 GB y dejarlo documentado. Hoy el backend usa bastante menos, así que no ha fallado.

### 2.4 El juez aguanta pocos estudiantes a la vez — **conocido, aceptable por ahora**
Cada ejecución ocupa ~170 MB y hay un tope de ejecuciones simultáneas (en producción, 2). Con un curso de 30 a 40 estudiantes
entregando al mismo tiempo habrá esperas de algunos segundos. **Mejora ya prevista en ADR 13:** que «Probar» corra en el navegador (Web
Worker) y el servidor solo califique la entrega.

### 2.5 El aprendizaje no se ha validado con personas — **prioridad alta para la tesis**
La simulación prueba que el sistema **funciona como se diseñó** (así se encontraron dos defectos reales), pero no que **ayude a aprender**
ni que la pantalla se entienda. **Recomendación:** rondas cortas con los cinco del equipo (evaluación heurística, recorrido cognitivo y
pruebas pensando en voz alta), y calibrar la simulación con datos públicos como ASSISTments.

### 2.6 Varias IA trabajando en el mismo código — **mitigado, mantener la disciplina**
Antigravity, AI Studio y Claude Code trabajaron en paralelo. Hubo entregas que no compilaban (Fase 27) e informes que describían algo
que no existía («editor Monaco», cuando había un `textarea`). Lo que lo contuvo: auditorías en Chrome real, `npm test` y los planes
escritos con contratos verificados. **Mantener:** ninguna entrega de una IA entra a `main` sin esa verificación.

## 3. Pendientes pequeños con buen retorno

1. **Pruebas del frontend.** Hoy se prueban leyendo los archivos (`*.frontend.spec.ts`) y con recorridos en Chrome desde scripts
   sueltos. Guardar esos recorridos en el repositorio (por ejemplo con Playwright) daría una red de seguridad repetible.
2. **Registro de decisiones al día.** Las decisiones de CodeMirror, multimedia e imágenes no estaban en `ADR_DECISIONES_ARQUITECTURA.md`.
   Este documento las recoge; conviene pasarlas como ADR 14 a 16.
3. **Licencia.** Sin un archivo `LICENSE`, legalmente nadie puede reutilizar el código aunque el repositorio sea público. Se decide con el
   docente (MIT o GPL son habituales en proyectos universitarios).
4. **Datos de estudiantes reales.** Antes de guardar trabajo de estudiantes reales (los futuros Proyectos): aviso de privacidad y
   consentimiento (Ley 1581 de 2012), y cómo se borran los datos.
