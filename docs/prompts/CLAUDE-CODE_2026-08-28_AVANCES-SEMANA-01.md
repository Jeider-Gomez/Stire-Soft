---
fecha:      2026-08-28
herramienta: Claude Code
estado:     ejecutado
resultado:  docs/presentacion/RECORRIDO_Y_SEMANA_01.html — confirmado por título exacto
            ("STIRE-Soft — Recorrido del proyecto y Semana 1 del Reto 1") y misma fecha de
            creación (28/08) que este prompt.
---

# Prompt para Claude Code — Página web: recorrido del proyecto y semana 1

Archivo de trabajo. Pegar el bloque en Claude Code, en la raíz del repositorio.

```
PAGINA WEB — DE DONDE VIENE STIRE Y QUE SE HIZO EN LA SEMANA 1

OBJETIVO
Un solo archivo HTML que le explique al docente de DDSE3 tres cosas, en este orden:
  1. El documento maestro que se hizo con el profesor Victor Castro.
  2. El backend que se construyo con el profesor Ali, y la documentacion que quedo en docs/.
  3. El monitoreo de la primera semana del Reto 1 (17 al 21 de agosto de 2026).

REGLA CENTRAL
Cada afirmacion lleva su referencia: un enlace a GitHub, un enlace al documento maestro, o una
ruta de archivo del propio repositorio. Lo que no se pueda referenciar, no se escribe. No
inventes fechas, cifras, nombres ni logros.

ARCHIVO A CREAR
  docs/presentacion/RECORRIDO_Y_SEMANA_01.html


==================== DATOS VERIFICADOS — USALOS TAL CUAL ====================

BLOQUE 1 · EL DOCUMENTO MAESTRO  (2025-2)
  Asignatura: Diseño y Desarrollo de Software Educativo I
  Docente: Victor Fabian Castro Perez
  Grupo: PLAN B. En ese momento el equipo eran DOS personas: Jeider Jair Gomez Oviedo y
  Pedro Gabriel Romero Mendivil.
  Enlace: https://docs.google.com/document/d/1is6pF5pIh8tOdCeNybMl5ZvnVq7Y_aj6rSmjbYVRmQk/edit

  Que es: la especificacion de requisitos del sistema (SRS). Contiene reseña del proyecto,
  descripcion de la propuesta, proposito y alcance, definiciones y acronimos, y los requisitos
  funcionales y no funcionales.

  Lo que ese documento definio y sigue vigente hoy — explicalo, es el punto de la seccion:
    - STIRE = Sistema Tutor Inteligente con Repeticion Espaciada.
    - Asignatura objetivo: Fundamentos de Algoritmia.
    - Un tutor conversacional que explica conceptos, resuelve dudas, sugiere ejercicios de
      practica, recomienda que repasar y orienta el estudio. No reemplaza al docente: acompaña
      el aprendizaje autonomo fuera del aula.
    - Los cinco ESTADOS DE APRENDIZAJE por unidad:
      No visto -> Explorado -> En practica -> Comprension parcial -> Dominado.
    - La logica de repeticion espaciada para priorizar que se repasa.
    - Unidades de aprendizaje del curso: Variables, Tipos de datos, Condicionales, Ciclos,
      Arreglos.

BLOQUE 2 · EL BACKEND Y SU DOCUMENTACION  (2026-1)
  Asignatura: Diseño y Desarrollo de Software Educativo II
  Docente: Ali
  Como se trabajo: el docente probaba el proyecto apoyandose en Claude, revisaba el modelo
  entidad-relacion y le señalaba al equipo que debia mejorar. El equipo llevaba esas
  observaciones al codigo y documentaba el sistema en la carpeta docs/ del repositorio.
  Enlace a la carpeta: https://github.com/Jeider-Gomez/Stire-Soft/tree/main/docs

  Explica CADA documento en un parrafo propio, en lenguaje entendible, diciendo a que pregunta
  responde y para quien es. Enlaza cada uno a
  https://github.com/Jeider-Gomez/Stire-Soft/blob/main/docs/<NOMBRE>.md

    00_VISION_FUNCIONAL.md       -> por que existe STIRE: problema pedagogico, propuesta de
                                    valor, actores y ciclo cognitivo del estudiante.
    01_ARQUITECTURA_Y_DISENO.md  -> que es STIRE tecnicamente: arquitectura, decisiones de
                                    diseño y el esquema de base de datos (el modelo
                                    entidad-relacion que revisaba el docente).
    02_FLUJOS_Y_OPERACIONES.md   -> como funciona: recorrido del estudiante, recorrido del
                                    docente y trazabilidad de lo que ocurre en el sistema.
    03_MOTOR_Y_TUTOR.md          -> el cerebro: motor de evaluacion, ejecucion de codigo,
                                    dominio, repeticion espaciada y tutor con IA.
    04_ESTANDARES_Y_SEGURIDAD.md -> las reglas del juego: convenciones de codigo, seguridad,
                                    escalabilidad y deuda tecnica reconocida.

  ADVERTENCIA. Los documentos 01, 02 y 04 contienen afirmaciones desactualizadas que dicen que
  el sistema ejecuta el codigo del estudiante en contenedores Docker. ES FALSO: usa un sandbox
  propio con aislamiento de proceso del sistema operativo. Al explicarlos, describe la
  arquitectura REAL y NO reproduzcas la afirmacion de Docker.

BLOQUE 3 · EL MONITOREO DE LA SEMANA 1  (17 al 21 de agosto de 2026)
  Asignatura: Diseño y Desarrollo de Software Educativo III, 2026-2
  Docente: Dr. Raul Emiro Toscano Miranda
  El equipo paso de 2 a 5 integrantes: Jeider Gomez, Jorge Cervantes, Jose Lopez, Julio Galvis
  y Pedro Romero.

  FUENTE UNICA Y OBLIGATORIA: docs/seguimiento/MONITOREO_SEMANAL_01.md
  Leela completa y explica lo que dice, agrupado por persona, sin añadir nada que no este ahi.
  Incluye tambien lo que esa bitacora registra como cuellos de botella y como compromisos para
  la semana siguiente: mostrar lo que quedo pendiente es parte del monitoreo, no un defecto.
  Las cifras de la remediacion del backend estan en esa bitacora: verificalas ahi antes de
  graficarlas. Si una cifra no aparece, no la grafiques.


==================== COMO DEBE SER LA PAGINA ====================

RESTRICCIONES TECNICAS (no negociables)
  - UN SOLO archivo .html autocontenido. CSS y JavaScript en linea.
  - CERO dependencias externas: sin CDN, sin librerias de graficas, sin fuentes remotas, sin
    imagenes externas. Debe abrirse con doble clic, sin internet, y verse igual.
  - Los graficos y diagramas son SVG escrito a mano, cada uno con <title> y <desc> dentro del
    <svg>. Los que muestren numeros llevan al lado su tabla de datos.
  - Navegacion fija arriba con anclas a cada seccion, y "volver arriba" al final de cada una.
  - Enlaces externos absolutos, con target="_blank" rel="noopener". Enlaces a archivos del repo
    en forma relativa, que resuelvan abriendo el HTML desde docs/presentacion/: verificalos con
    test -f antes de darlos por buenos.
  - Boton "Imprimir / Guardar como PDF" con window.print(), y @media print que quite la
    navegacion, no corte los graficos a la mitad y sirva en A4. En impresion, los enlaces
    externos muestran su URL entre parentesis: en papel no se pueden pulsar.
  - Responsive. Tablas anchas con overflow-x propio; la pagina nunca scrollea en horizontal.
  - Tema claro y oscuro con prefers-color-scheme: paleta como variables CSS en :root, y en el
    bloque oscuro se redefinen SOLO las variables. El body pinta su fondo explicitamente.
  - Sin emojis. Registro sobrio: lo lee un docente.

SECCIONES
  0. Portada. STIRE-Soft, grupo PLAN B, curso DDSE3 2026-2, docente Dr. Raul Emiro Toscano
     Miranda, Universidad de Cordoba, los cinco integrantes, fecha, y el enlace al repositorio
     https://github.com/Jeider-Gomez/Stire-Soft
  1. Tres semestres en una linea de tiempo. Deja claro de entrada que la semana 1 del Reto 1 no
     es el inicio del proyecto, sino la continuacion de dos semestres de trabajo.
  2. El documento maestro (Bloque 1).
  3. El backend y su documentacion (Bloque 2).
  4. El monitoreo de la semana 1 (Bloque 3), persona por persona.
  5. Referencias. Tabla con TODOS los enlaces usados: que es, quien lo produjo, en que semestre
     y su URL. Seccion obligatoria.

GRAFICOS (SVG a mano)
  G1. Linea de tiempo horizontal de los tres semestres, con la asignatura, el docente y el
      entregable de cada uno. Marca visualmente el punto donde el equipo pasa de 2 a 5.
  G2. Cadena de los cinco estados de aprendizaje, con flechas:
      No visto -> Explorado -> En practica -> Comprension parcial -> Dominado.
  G3. Mapa de los cinco documentos de docs/ (00 a 04): en que orden se leen y a que pregunta
      responde cada uno.
  G4. Barras con las cifras de la remediacion de la semana 1, tomadas de la bitacora N.o 1.
  PROHIBIDO: cualquier grafico de porcentaje de contribucion por integrante. No hay forma
  honesta de medir eso.

VERIFICACION ANTES DE TERMINAR
  - Ninguna afirmacion sin su referencia.
  - Ninguna mencion de Docker como tecnologia que el sistema use.
  - Ninguna cifra que no aparezca en docs/seguimiento/MONITOREO_SEMANAL_01.md o en un documento
    del repositorio que puedas citar.
  - Todos los enlaces relativos resuelven (test -f); los absolutos apuntan a rutas que existen
    en el repositorio de GitHub.
  - Los nombres y roles coinciden con MONITOREO_SEMANAL.md seccion 1.
  - La pagina abre sin internet e imprime bien a PDF.

  Commit: "docs: agrega pagina del recorrido del proyecto y la semana 1"

AL TERMINAR, REPORTA
  1. La ruta del archivo y como abrirlo.
  2. Que afirmaciones dejaste fuera por no poder referenciarlas.
  3. Que enlaces no pudiste verificar.
```
