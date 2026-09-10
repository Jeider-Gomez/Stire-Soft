---
fecha:      2026-08-28
herramienta: Claude Code
estado:     sin confirmar
resultado:  No se encontró un HTML distinto que corresponda a este prompt específico (el único
            resultado en docs/presentacion/, RECORRIDO_Y_SEMANA_01.html, coincide por título con
            CLAUDE-CODE_2026-08-28_AVANCES-SEMANA-01.md, no con este). Puede que este prompt haya
            sido un borrador anterior reemplazado por ese, o que se haya ejecutado y el resultado
            no se haya conservado. Se archiva de todos modos por la misma razón que el resto de
            esta carpeta: registrar qué se le pidió a la herramienta, no solo lo que sobrevivió.
---

# Instrucción para Claude Code — Documento de presentación del Reto 1

**Archivo de trabajo, no entregable.** Se puede borrar cuando la presentación esté hecha.
Copiar el bloque completo y pegarlo en Claude Code, en la raíz del repositorio.

---

```
DOCUMENTO DE PRESENTACION DEL RETO 1 — STIRE-Soft

OBJETIVO
Construir una pagina HTML que presente, con evidencia y graficas, todo lo que el equipo ha
hecho hasta hoy 28 de agosto. Es el documento que se le muestra al docente y al jurado.
No inventes nada: todo sale de tres fuentes que ya existen en este repositorio.

LAS TRES FUENTES (leelas completas antes de escribir una sola linea de HTML)
  A. MONITOREO_SEMANAL.md (raiz)  -> el relato del trabajo: semanas, avances POR AUTOR,
     evidencia de prompts ROCAS, cuellos de botella, compromisos.
  B. docs/modesec/FASE_II_DISENO_MULTIMEDIAL.md -> el documento maestro del diseno
     multimedial: 3.1 contenidos, 3.3 ventana estandar, 3.3.1 las 6 fichas con las 7
     categorias, 3.3.2 metafora rectora, y en la seccion 5.1 la verificacion de endpoints.
     Complementado por docs/modesec/contenidos/ y docs/modesec/ventanas/.
  C. README.md -> que es el sistema, para que sirve, como esta construido, como se levanta.
     Tambien CHANGELOG.md, docs/ESTADO_STIRE_HANDOFF.md y las auditorias de docs/ para las
     cifras de ingenieria.


BLOQUE 0 — ANTES DE ESCRIBIR NADA: SINCRONIZAR Y DESMENTIR DOCKER
  1. git pull --rebase origin main
     origin/main tiene el commit 78f47dc de Pedro Romero sobre MONITOREO_SEMANAL.md.
     Ningun commit local toca ese archivo. Verifica que 78f47dc sigue en el historial y que
     MONITOREO_SEMANAL.md conserva la version del arbol de trabajo. Luego push.
     REGLA: MONITOREO_SEMANAL.md tiene un unico autor humano, Pedro Romero, que lo edita desde
     la web de GitHub. NUNCA lo reescribas entero. Documenta esta regla en CLAUDE.md.

  2. El README y los documentos nucleo afirman en 12 sitios que el sistema ejecuta el codigo
     del estudiante en Docker. ES FALSO: el unico adaptador real es HardenedProcessSandboxAdapter,
     con aislamiento de proceso del sistema operativo (--permission, entorno minimo, cortafuegos
     de red, watchdog), y judge-engine.module.ts ABORTA el arranque si SANDBOX_TYPE=docker.
     Como la presentacion va a explicar el README, hay que corregirlo primero o la presentacion
     propaga la mentira. Corrige, verificando cada linea antes de tocarla:
        README.md:26,53,140,184 (en :184 tambien cita LocalProcessSandboxAdapter, eliminado en
        la Ola 1 por RCE) · docs/README.md:17 · docs/00_VISION_FUNCIONAL.md:96 ·
        docs/01_ARQUITECTURA_Y_DISENO.md:84,107 (nodos Mermaid) ·
        docs/02_FLUJOS_Y_OPERACIONES.md:27,162 · docs/04_ESTANDARES_Y_SEGURIDAD.md:80,123,127

  3. ELIMINA el log fabricado de docs/02_FLUJOS_Y_OPERACIONES.md:245-246 y el bloque 235-250
     del que forma parte. Presenta como salida real una ejecucion que nunca ocurrio: nombra un
     servicio inexistente y un contenedor de Python, cuando el sistema evalua JavaScript.
     No se corrige, se elimina — o se sustituye por una salida REAL capturada hoy, diciendo
     explicitamente que es real y con que comando se obtuvo.
     En el mismo archivo, :161 dice localhost:3000 y el puerto real es 3001.

  4. README.md:120-124 pega un resultado de pruebas ("3 suites / 8 tests") que contradice a
     README.md:13 ("36/36 suites, 215/215 tests"). Ejecuta la suite, pega la salida real y
     anota la fecha de la corrida.

  5. Barrido: grep -rin "docker" en README.md y docs/*.md (excluye docs/_archivo/). Lo que
     quede debe ser solo la base de datos MySQL via docker-compose.yml, que si existe, o una
     mencion explicita de que el sistema NO usa Docker. Reporta la lista final.

  Commit: "docs: corrige afirmaciones sobre Docker y elimina el log fabricado"


BLOQUE 1 — EXTRAER LOS DATOS, ANTES DE MAQUETAR
  Construye primero una tabla de datos verificados, con la fuente de cada cifra
  (archivo:linea o el comando que la produce). No pases al Bloque 2 sin ella.
  Como minimo necesitas:
    - Pruebas automatizadas y suites en cada corte (auditoria inicial, Ola 1, Ola 2, hoy).
    - Cobertura de sentencias antes y despues.
    - Calificacion global de cada auditoria sucesiva, incluida la BAJADA.
    - Estado de las 6 piezas de MODESEC Fase II y el autor de cada una.
    - Resultado de la verificacion de endpoints (cuantos existen, parciales, no existen).
    - Numero de modulos, temas y ventanas del diseno.
    - Palabras y bloques del pitch.
  Si dos fuentes se contradicen, NO promedies ni elijas la mas favorable: usa la mas reciente
  verificable y anota la discrepancia. Si una cifra no se puede verificar, escribe "no medido"
  y no la grafiques.


BLOQUE 2 — CONSTRUIR docs/presentacion/PRESENTACION_RETO_01.html

  RESTRICCIONES TECNICAS (no negociables)
    - UN SOLO archivo .html autocontenido. CSS y JavaScript en linea.
    - CERO dependencias externas: sin CDN, sin librerias de graficas, sin fuentes remotas, sin
      imagenes externas. Debe abrirse con doble clic, sin internet, y verse igual.
    - Las graficas son SVG escrito a mano, cada una con <title> y <desc> dentro del <svg> y su
      tabla de datos equivalente al lado (puede ir en un <details>). Una grafica sin sus
      numeros no es evidencia.
    - Navegacion fija arriba con anclas a cada seccion y un enlace "volver arriba" al final de
      cada una.
    - Enlaces relativos a los documentos del repositorio que funcionen abriendo el HTML desde
      docs/presentacion/ (../modesec/..., ../../MONITOREO_SEMANAL.md, ../../README.md).
      Verificalos uno por uno con test -f.
    - Boton "Imprimir / Guardar como PDF" que llame a window.print(), con @media print que
      quite la navegacion, no corte graficas a la mitad y sirva en A4.
    - Responsive. Tablas anchas con overflow-x propio; la pagina nunca scrollea en horizontal.
    - Tema claro y oscuro con prefers-color-scheme: paleta como variables CSS en :root, y en
      el bloque oscuro se redefinen SOLO las variables. El body pinta su fondo explicitamente.
    - Sin emojis. Registro sobrio: lo lee un docente.

  SECCIONES, EN ESTE ORDEN
    1. Portada. Proyecto, curso DDSE3 2026-2, docente Dr. Raul Emiro Toscano Miranda,
       Universidad de Cordoba, los cinco integrantes con su rol, fecha.
    2. El problema y la propuesta. Que problema educativo resuelve STIRE, en lenguaje llano,
       sin jerga tecnica. Sale de README.md y de docs/00_VISION_FUNCIONAL.md.
    3. QUE TENEMOS CONSTRUIDO — explicacion del README. Esta seccion es explicitamente pedida:
       traduce el README a lenguaje entendible. Que es el sistema, que hace hoy de verdad, con
       que esta construido (NestJS, TypeORM, MariaDB, arquitectura DDD, modelo event-driven),
       como se levanta, y como se aisla la ejecucion del codigo del estudiante — con la
       arquitectura REAL, sandbox de proceso endurecido, nunca Docker. Incluye el flujo
       completo: el estudiante entrega codigo, se ejecuta aislado, recibe nota real.
    4. Como trabaja el equipo. Sprint semanal de viernes a viernes, reunion unica del viernes
       8:00 p.m. con los cinco, reportes escritos martes y jueves, tablero Kanban en Trello.
       Sale de docs/05_METODOLOGIA_Y_EQUIPO.md.
    5. Linea de tiempo y avances por autor. Semanas 17-21 y 24-28 de agosto, y lo comprometido
       para el 31 de agosto al 4 de septiembre. Los avances van AGRUPADOS POR AUTOR, igual que
       en la bitacora: Jeider, Jorge, Jose, Julio, Pedro. Sale de MONITOREO_SEMANAL.md.
    6. MODESEC Fase II — el documento maestro. Las 6 piezas con su estado y su autor. Incluye
       la maqueta de la ventana estandar (en <pre>, tal cual), la metafora rectora, el arbol de
       contenidos con sus 3 modulos, y una de las fichas de ventana COMPLETA con sus 7
       categorias como muestra del formato.
    7. Evidencia de ingenieria. Que se construyo y como se verifico. Aqui van las metricas de
       pruebas, cobertura y el endurecimiento del sandbox.
    8. El proceso de auditoria. La parte mas fuerte del trabajo: auditoria adversarial,
       remediacion por olas, reauditoria independiente, y una regresion real que se publico en
       vez de esconderse. Explica por que un proceso que se audita a si mismo vale mas que un
       sistema que aparenta estar perfecto.
    9. Verificacion de endpoints. La tabla de las rutas citadas en las fichas con su estado
       real, y por que NO se cambio el diseno para que encajara con el codigo: el diseno manda,
       y lo que falta queda como contrato de la Fase III.
   10. Lo que falta y lo que se decidio no hacer. Honestidad explicita: piezas pendientes,
       hallazgos abiertos, decisiones de alcance.
   11. Ingenieria de prompts. La tecnica ROCAS, el prompt real del equipo y sus iteraciones,
       tal como estan en la bitacora.
   12. Equipo y autoria. Tabla de quien entrego que.
   13. APENDICE DE VERIFICACION — OBLIGATORIO. Cada cifra que aparece en el documento, con el
       archivo:linea o el comando exacto que la respalda.

  GRAFICAS (SVG a mano, todas con su tabla de datos)
    G1. Barras: evolucion de las pruebas automatizadas en cada corte. Verifica los numeros
        contra las auditorias y la corrida de hoy antes de dibujar.
    G2. Barras: cobertura de sentencias, antes y despues.
    G3. Escalera o linea con puntos: calificacion global de las auditorias sucesivas.
        MARCA VISUALMENTE LA BAJADA y explicala en el pie. Es el dato mas valioso del
        documento: no lo suavices ni lo escondas.
    G4. Barra segmentada o donut: estado de las 6 piezas de MODESEC Fase II.
    G5. Barras horizontales: los endpoints citados, agrupados en existe / parcial / no existe.
    G6. Linea de tiempo horizontal de las semanas, con los hitos de cada una, la congelacion
        del 4 de septiembre y la sustentacion del 8 de septiembre.
    PROHIBIDO: grafica de "porcentaje de contribucion por integrante". No hay forma honesta de
    medir eso, y una grafica falsa contamina las cinco que si son ciertas. El aporte por autor
    va en tabla, con lo que cada uno entrego.


BLOQUE 3 — VERIFICACION DE COHERENCIA (es parte del entregable)
  Antes de dar por terminado, revisa y corrige:
    - Ninguna cifra del documento contradice a otra parte del mismo documento ni al repositorio.
    - Ningun nombre de rol distinto a los de MONITOREO_SEMANAL.md seccion 1.
    - La palabra para quien produce una pieza es "autor". Nunca "dueno" ni "responsable".
    - Ninguna mencion de Docker como tecnologia que el sistema use.
    - Todos los enlaces internos y relativos resuelven (compruebalo con test -f).
    - El apendice de verificacion cubre TODAS las cifras del documento, sin excepcion.
    - La pagina abre sin internet e imprime bien a PDF.

  Commit: "docs: agrega documento de presentacion del Reto 1"


CRITERIO DE PARADA
  - Repositorio sincronizado y el commit de Pedro intacto.
  - grep -rin "docker" en README.md y docs/*.md (sin _archivo/) devuelve solo menciones
    correctas, y lo demuestras con la lista.
  - El log fabricado ya no existe.
  - PRESENTACION_RETO_01.html abre sin internet, imprime a PDF y tiene su apendice completo.
  - npm run build y npm test en verde.

AL TERMINAR, REPORTA
  1. La lista final del grep de Docker.
  2. Que cifras NO pudiste verificar y que pusiste en su lugar.
  3. Que contradicciones encontraste entre las tres fuentes mientras armabas el documento.
  4. La ruta del archivo y como abrirlo.
```
