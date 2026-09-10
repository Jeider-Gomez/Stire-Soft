# Prompt de trabajo — Documento de presentación de avances (Reto 1)
> Ya ejecutado: el resultado es [`RECORRIDO_Y_SEMANA_01.html`](./RECORRIDO_Y_SEMANA_01.html), en
> esta misma carpeta. Se conserva este prompt como referencia de cómo se generó, no como tarea
> pendiente. Reubicado desde la raíz del repo el 2026-09-10 (reorganización documental).
> Uso original: abrir Claude Code en la raíz del repositorio y decirle: **"Lee
> docs/presentacion/PROMPT_PRESENTACION.md y ejecútalo."**

```
DOCUMENTO DE PRESENTACION DE AVANCES — RETO 1

OBJETIVO
Una sola pagina HTML que presente, ante el docente y ante el equipo, todo lo que llevamos hecho
hasta hoy. No es un informe tecnico del backend: es la presentacion del AVANCE DEL PROYECTO.
Se construye leyendo tres fuentes del repositorio, en este orden de autoridad:

  1. MONITOREO_SEMANAL.md               -> la bitacora: equipo, avances por autor, cuellos de
                                           botella, compromisos. Es la fuente de la verdad sobre
                                           QUIEN hizo QUE y CUANDO.
  2. docs/modesec/FASE_II_DISENO_MULTIMEDIAL.md  -> el documento maestro de MODESEC Fase II.
                                           Fuente de la verdad sobre el diseno multimedial.
  3. README.md y docs/README.md         -> que es el sistema y que contiene el repositorio.

Todo lo que aparezca en el documento tiene que salir de ahi o de otro archivo del repo. No
inventes nada. Si un dato no se puede verificar, escribe "no medido" y sigue.

ADVERTENCIA IMPORTANTE SOBRE UNA FUENTE
  El README.md y varios documentos de docs/ todavia afirman que el sistema ejecuta el codigo
  del estudiante en contenedores DOCKER. ES FALSO y esta pendiente de corregir.
  La arquitectura real es: sandbox propio con aislamiento de proceso del sistema operativo
  (HardenedProcessSandboxAdapter: --permission, entorno minimo, cortafuegos de red en preludio,
  watchdog). judge-engine.module.ts aborta el arranque si SANDBOX_TYPE=docker.
  EN LA PRESENTACION NO PUEDE APARECER DOCKER como tecnologia de ejecucion. Verifica contra
  src/judge-engine/ antes de escribir cualquier frase sobre como se ejecuta el codigo.
  Unica excepcion valida: docker-compose.yml se usa para levantar MySQL, y eso si es cierto.


ARCHIVO Y RESTRICCIONES TECNICAS
  Ruta: docs/presentacion/PRESENTACION_AVANCES_RETO_01.html

  - UN SOLO archivo autocontenido. CSS y JavaScript en linea.
  - CERO dependencias externas: sin CDN, sin librerias de graficas, sin fuentes remotas, sin
    imagenes externas. Tiene que abrirse con doble clic, sin internet, y verse igual.
  - Las graficas se escriben como SVG a mano. Cada <svg> lleva <title> y <desc>, y debajo su
    tabla de datos (puede ir dentro de un <details>). Una grafica sin sus numeros no es evidencia.
  - Navegacion fija arriba con anclas a cada seccion + enlace "volver arriba" al cerrar cada una.
  - Enlaces relativos a los documentos del repo que funcionen abriendo el HTML desde
    docs/presentacion/ (o sea ../../MONITOREO_SEMANAL.md, ../modesec/...). VERIFICALOS uno por uno.
  - Boton "Imprimir / Guardar como PDF" que llame a window.print(), con @media print que oculte
    la navegacion, no corte graficas a la mitad y sirva en A4.
  - Responsive. Las tablas anchas scrollean dentro de su contenedor; la pagina nunca en horizontal.
  - Tema claro y oscuro con prefers-color-scheme: define la paleta como variables CSS en :root y
    en el bloque oscuro redefine SOLO las variables. El body pinta su fondo explicitamente.
  - Sin emojis. Registro sobrio: lo lee un docente.


SECCIONES, EN ESTE ORDEN

  1. PORTADA
     STIRE-Soft · curso DDSE3 2026-2 · Universidad de Cordoba · Dr. Raul Emiro Toscano Miranda.
     Equipo con nombre y rol, exactamente como aparece en MONITOREO_SEMANAL.md seccion 1.
     Fecha de corte del documento y enlace al repositorio.

  2. QUE ES STIRE Y QUE PROBLEMA RESUELVE
     En lenguaje llano, sin jerga. Sale del README.md y de docs/00_VISION_FUNCIONAL.md.
     El estudiante entrega codigo, el sistema lo ejecuta de verdad, lo califica y adapta los
     siguientes ejercicios a su nivel de dominio. Explica aprendizaje por dominio y repeticion
     espaciada en una frase cada uno, para alguien que no es programador.

  3. COMO TRABAJA EL EQUIPO
     De MONITOREO_SEMANAL.md seccion 1 y docs/05_METODOLOGIA_Y_EQUIPO.md.
     Sprint semanal de viernes a viernes, reunion de Cierre y Arranque los viernes 8:00 p.m. con
     los cinco, reportes escritos martes y jueves, tablero Kanban en Trello.
     Incluye GRAFICA G6 (linea de tiempo).

  4. AVANCES POR AUTOR
     De MONITOREO_SEMANAL.md seccion 2.1, respetando la division por autor: Jeider Gomez,
     Jorge Cervantes, Jose Lopez, Julio Galvis, Pedro Romero. Un bloque por persona con lo que
     entrego. No resumas al punto de que se pierda quien hizo que: la autoria es lo que se califica.
     NO hagas grafica de "porcentaje de contribucion": no hay forma honesta de medirlo. Va en tabla.

  5. EL DOCUMENTO MAESTRO: MODESEC FASE II
     El corazon del entregable academico. De docs/modesec/FASE_II_DISENO_MULTIMEDIAL.md.
     - Las 6 piezas que exige la guia (3.1, 3.2, 3.3, 3.3.1, 3.3.2, 3.3.3) con su estado y su
       autor. Incluye GRAFICA G4.
     - Resumen de cada pieza cerrada:
         3.1  los 3 modulos y los 13 temas, con la idea de resultado de aprendizaje observable
              y las reglas de progresion (70 % desbloqueo, 85 % dominio, 60 % tutoria proactiva).
         3.3  la maqueta de la ventana estandar. Reprodúcela en el HTML como bloque <pre>
              monoespaciado, tal cual esta en el maestro, y al lado la tabla de las 5 secciones
              con su funcion pedagogica.
         3.3.1 las 6 fichas V-01 a V-06. Muestra una tabla de 6 filas x 7 columnas (las 7
              categorias MODESEC) indicando que categoria esta cubierta y cual va como
              "No aplica justificado". El punto a demostrar: ninguna quedo en blanco.
         3.3.2 la metafora rectora "el taller del algoritmista" y 4 o 5 equivalencias de su tabla.
     - Que falta y por que: 3.3.3 iniciada, 3.2 sin empezar.

  6. VERIFICACION DE ENDPOINTS
     De la seccion 5.1 del documento maestro. Tabla de las 7 rutas citadas en la categoria 7 de
     las fichas, con su estado real (1 existe, 2 parciales, 4 no existen) y la evidencia
     archivo:linea. Incluye GRAFICA G5.
     Explica en dos frases por que esto suma en vez de restar: se verifico contra el codigo, no
     contra la documentacion, y NO se cambio ninguna ficha de diseno para que encajara. El diseno
     manda; lo que falta queda declarado como contrato de la Fase III.

  7. QUE HAY EN EL REPOSITORIO — GUIA DEL README
     Seccion explicativa para quien abre el repo por primera vez. De README.md y docs/README.md:
     - Que es cada carpeta de primer nivel (src/, test/, frontend/, docs/, scripts/) en una linea.
     - Tabla de los documentos de docs/: nombre, a que pregunta responde, para quien es.
     - El stack real y verificado: NestJS, TypeORM, MariaDB/MySQL, arquitectura DDD y
       event-driven, sandbox propio de ejecucion (NO Docker), frontend Next.js + React.
       Verifica versiones en package.json y frontend/package.json antes de escribirlas.
     - Como se levanta el proyecto, con los comandos reales del README.
     - Los dos documentos de gestion: MONITOREO_SEMANAL.md y docs/05_METODOLOGIA_Y_EQUIPO.md,
       y por que solo hay dos.

  8. EVIDENCIA DE INGENIERIA
     Que se construyo y como se verifico. Incluye GRAFICAS G1, G2 y G3.
     - El sandbox: que aisla y que bloquea, en lenguaje entendible.
     - La prueba de punta a punta: el estudiante entrega codigo JavaScript, se ejecuta de verdad
       y recibe calificacion real.
     - El proceso de auditoria: auditoria adversarial, remediacion, reauditoria independiente.
       LA GRAFICA G3 MUESTRA UNA BAJADA (3.05 -> 5.1 -> 4.4). NO la suavices ni la escondas:
       explica en el pie que el equipo publico una regresion medida en vez de ocultarla, y por
       que eso vale mas que un sistema aparentemente perfecto. Es el argumento mas fuerte que
       tiene este proyecto.

  9. CUELLOS DE BOTELLA Y LO QUE FALTA
     De MONITOREO_SEMANAL.md seccion 3, tal cual, sin suavizar. Incluye las preguntas abiertas
     al docente.

 10. COMPROMISOS DE LA SEMANA SIGUIENTE
     De MONITOREO_SEMANAL.md seccion 4: tabla compromiso / autor / fecha, mas la fecha de
     congelacion (viernes 4 de septiembre) y de sustentacion (martes 8 de septiembre).

 11. APENDICE DE VERIFICACION   [OBLIGATORIO]
     Tabla con TODAS las cifras que aparecen en el documento y, por cada una, el archivo:linea
     o el comando exacto que la respalda. Si alguna cifra no se pudo verificar, aparece aqui
     marcada como no verificada, y ademas no se grafica.


GRAFICAS (SVG a mano, cada una con su tabla de datos)
  G1  Barras: evolucion de pruebas automatizadas. 105 -> 183 -> 215 (suites 19 -> 33 -> 36).
      Verifica estos numeros en las auditorias y contra la corrida actual antes de dibujarlos.
  G2  Barras: cobertura de sentencias, 26.88 % -> 55.66 %.
  G3  Linea con puntos o escalera: calificacion global de las auditorias sucesivas
      (3.05 -> 5.1 -> 4.4 -> estado actual). Marca la bajada de forma visible.
  G4  Barra segmentada: estado de las 6 piezas de MODESEC Fase II (cerradas / iniciada / sin empezar).
  G5  Barras horizontales: los 7 endpoints citados, agrupados en existe / parcial / no existe.
  G6  Linea de tiempo horizontal: semanas 17-21 ago, 24-28 ago, 31 ago-4 sep, con sus hitos,
      la congelacion y la sustentacion.


REGLAS DE COHERENCIA (se revisan al final; son parte del entregable)
  - Ninguna cifra puede contradecir a otra parte del mismo documento ni al repositorio.
  - Ningun nombre de rol distinto al de MONITOREO_SEMANAL.md seccion 1.
  - La palabra para quien produce una pieza es "autor". Nunca "dueno" ni "responsable".
  - Cero menciones de Docker como tecnologia de ejecucion de codigo.
  - Todos los enlaces relativos resuelven desde docs/presentacion/.
  - Las fechas coinciden: semana en curso 24-28 de agosto, congelacion 4 de septiembre,
    sustentacion 8 de septiembre.

CRITERIO DE PARADA
  - El HTML abre sin internet y se ve completo, en tema claro y en oscuro.
  - Imprime a PDF sin cortar ninguna grafica.
  - El apendice de verificacion cubre todas las cifras del documento.
  - Ninguna de las 6 reglas de coherencia se incumple. Demuestralo con el grep correspondiente
    para Docker, "dueno" y "responsable".

COMMIT
  "docs: agrega documento de presentacion de avances del Reto 1"
  Sin push hasta que yo lo revise.

AL TERMINAR, REPORTA
  1. Que cifras NO pudiste verificar y que pusiste en su lugar.
  2. Que contradicciones encontraste entre la bitacora, el documento maestro y el README.
  3. Los enlaces relativos que probaste y su resultado.
```
