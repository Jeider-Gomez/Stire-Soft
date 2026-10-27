# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Estudiantes** de la Licenciatura en Informática (Facultad de Educación, Universidad de Córdoba, Colombia), de 18 años
  o más, que aprenden algoritmia y programación. Practican en el computador o en el celular, a su ritmo, dentro o
  fuera de clase.
- **Docentes** del programa: saben más de pedagogía que la herramienta y la usan como apoyo, nunca como sustituto.
  Preparan la clase en el computador (contenidos, ejercicios, refuerzos, notas) y la dictan proyectando o caminando
  con el celular (asistencia, ver quién se trabó). Los dos momentos pesan lo mismo (confirmado el 23/10/2026).
- **Administrador**: aprueba docentes, atiende sugerencias y revisa el estado del sistema.

## Product Purpose

STIRE es un sistema tutor inteligente: lleva a cada estudiante a dominar las lecciones (85 % de dominio) con práctica
adaptativa, repetición espaciada (SM-2 ajustado a un semestre) y un Tutor con IA que guía con preguntas y pistas, sin
dar la respuesta. Al docente le dice a quién ayudar y en qué. El éxito se mide en el dominio de las lecciones, en las
listas de chequeo de Sistemas Tutores (Caro, 2015) y en la usabilidad (SUS y evaluación heurística).

## Positioning

Es un tutor que se puede auditar: el dominio, la calidad de cada repaso y la calibración («¿sabes cuándo sabes?») salen
de reglas explicables y probadas contra el motor real. Además está hecho para el programa y el idioma de sus usuarios.

## Operating Context

- Dos cursos reales cargados como datos: Fundamentos de Algoritmia (ALGO-203413) y Pensamiento algorítmico desde cero
  (PENSAR-ALGO). Jerarquía: módulo → tema → lección; cada lección tiene explicaciones y ejercicios.
- Clases con código o QR, asistencia con QR, refuerzos, entregas, notas que se pasan a Moodle.
- El Tutor usa Gemini con la clave gratuita de cada estudiante. La IA para el docente usará su propia clave (plan del
  23/10).
- Lo usan en salones y en casa, con conexiones variables.

## Capabilities and Constraints

- Nuxt 3 + Pinia en Vercel; NestJS + TypeORM + MariaDB en una VM de 4 GB. El juez ejecuta solo JavaScript.
- **Cero cobros**: nada puede generar gastos.
- **Solo en español.**
- Las funciones del docente son **opcionales y configurables**: las sugerencias se editan, nunca se imponen.
- Público de 18 años o más (términos de la API de Gemini). Ley 1581 de datos personales.
- La IA nunca recibe datos personales de estudiantes, y lo que genera llega como borrador para que el docente decida.
- Sin estilos de aprendizaje (no tienen respaldo): STIRE ofrece formatos que el estudiante elige.

## Brand Commitments

- Nombre: STIRE (antes STIRE-Soft; renombrado el 26/10), Universidad de Córdoba.
- La identidad visual vigente es de José (`docs/identidad-visual/`). El 23/10/2026 Jeider decidió que el rediseño del
  panel del docente puede cambiar también los tokens y el CSS global, y que él se lo comunica a José.
- Voz: cercana, en segunda persona, frases cortas y sin jerga técnica. Los botones dicen lo que hacen.
- Dirección pedida por el dueño para el panel del docente: sobria, «tipo Apple», con animaciones elegantes.

## Evidence on Hand

- Cursos y simulaciones: `src/seeds/cursos/`, `scripts/cursos/`.
- Listas de chequeo: 62,5 % / 58,3 % antes, y 87,5 % / 100 % después (`docs/calidad/listas-chequeo/`).
- Evaluación heurística: 3,85 → 4,21 sobre 5 (`docs/investigacion/EVALUACION_HEURISTICA_STIRE_2026-10-22.md`).
- Capturas del panel del docente del 23/10, en el scratchpad de la sesión.
- Todavía no hay prueba con usuarios finales reales (planeada con unas 10 personas). No se inventan testimonios ni
  cifras.

## Product Principles

1. El docente decide: STIRE sugiere, la IA propone borradores, nada se impone ni se publica solo.
2. Una acción clara por pantalla: lo que conviene hacer ahora, antes que todo lo posible.
3. Explicable antes que mágico: cada número tiene una regla que se puede leer.
4. Funciona con poco: celular, conexión regular y cuentas gratuitas.
5. Accesible por defecto.

## Accessibility & Inclusion

WCAG 2.2 AA como piso:
- objetivos táctiles de 44 px;
- tema claro, oscuro y temas de contraste como los de Windows;
- texto grande y más espaciado;
- reducir el movimiento (también el del sistema);
- lector de pantalla;
- teclado completo.

Toda animación nueva respeta «reducir el movimiento».
