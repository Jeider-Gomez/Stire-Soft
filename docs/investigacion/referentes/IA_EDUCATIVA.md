# Fichas: IA educativa y chatbots tutores

Qué hacen los tutores de IA que más se usan en educación, qué dice la evidencia y qué tomó STIRE. Marcas de
evidencia como en [`README.md`](README.md). La parte de fondo (qué es un STI, la IA generativa en la enseñanza de la
programación) está en `../REFERENTES_PLATAFORMAS_Y_STI.md` §7 y §8.

## Lo que dice la evidencia, en tres frases

1. **Una IA sin barreras perjudica el aprendizaje.** Mejora la práctica y empeora el examen sin IA. Un tutor
   diseñado para dar pistas mitiga el daño (Bastani et al., 2025, PNAS) **[inv]**.
2. **Un tutor de IA bien diseñado sí enseña.** En un ensayo aleatorio, uno construido con principios pedagógicos
   superó a una clase de aprendizaje activo (Kestin et al., 2025, *Scientific Reports*) **[inv]**.
3. **El diseño socrático puro tiene un costo.** Con Khanmigo, muchos abandonaban cuando no recibían la respuesta
   y los de bajo desempeño se confundían más **[prensa]**. Concuerda con el efecto de reversión de la experticia
   (Kalyuga et al., 2003) **[inv]**: la ayuda debe ajustarse a quien la recibe.

STIRE se ubica así:
- **Barreras:** sí. La solución nunca se entrega (frase 1).
- **Diseño pedagógico explícito:** niveles de ayuda, contexto de la lección y el docente al mando (frase 2).
- **Ajuste al estudiante:** desde el 03/10, nivel por tema, lenguaje sencillo y la ayuda que se ofrece al fallar
  (frase 3).

---

## Khanmigo (Khan Academy)

- **Pedagogía:** método socrático: pregunta qué intentó el estudiante, dónde se atascó y qué conceptos cree que
  aplican; pistas cada vez más concretas **[doc/prensa]**.
- **UX:** al principio se abría con un ícono en la esquina y se usaba poco. Khan Academy rediseñó la interfaz
  para «tejerlo» en el contenido y probar que aparezca tras una respuesta incorrecta **[prensa]**.
- **UI:** ventana en la esquina; ahora integrada en la práctica **[prensa]**.
- **Para STIRE:** P-PED-01, P-PED-02 y P-UI-08. Es la advertencia más útil que tenemos: un tutor escondido no se
  usa, y uno rígido espanta al que más lo necesita.

## CS50 Duck (Harvard)

- **Pedagogía:** «barreras pedagógicas» para que se comporte como un buen asistente de cátedra que guía hacia la
  respuesta en lugar de darla **[inv: Liu et al., 2024, SIGCSE]**. Personaje del «pato de goma»: explicarle el
  problema ayuda a pensarlo **[doc]**.
- **UX:** está donde se programa y explica el código resaltado **[doc]**.
- **Para STIRE:** P-PED-01. Es la referencia más cercana: curso introductorio de programación universitario.

## Coursera Coach

- **Pedagogía:** usa los materiales del curso. Los instructores definen diálogos socráticos con rúbricas
  **[doc]**.
- **UX:** se abre solo con tres preguntas sugeridas y un aviso de privacidad. Responde «¿esto es para mí?» antes
  de inscribirse **[obs]**.
- **UI:** panel derecho fijo de 416 px y lanzador con ícono de destello en el encabezado **[obs]**.
- **Para STIRE:** P-UI-04, P-UI-06, P-UI-07, P-PED-04 y P-PED-06.

## Asistente de IA de Codecademy

- **Pedagogía:** conoce el *checkpoint*, la lección y el código. Primero da una pista y, si el estudiante insiste,
  la respuesta **[doc]**.
- **UX:** «Explain code» sobre el código resaltado y explicación de errores sin salir de la lección **[doc]**.
- **Para STIRE:** P-PED-04 y P-UI-14 (propuesto). STIRE **no** da la respuesta aunque se insista (ver frase 1).

## Duolingo Max: «Explain My Answer»

- **Pedagogía:** tras responder, el estudiante puede abrir un chat que explica por qué la respuesta estuvo bien o
  mal, con ejemplos. Duolingo mide la calidad por cuánto debe profundizar el estudiante antes de volver a la
  lección **[doc]**.
- **Para STIRE:** P-UI-08 y P-PED-03, ya hechos (`47cce51`). **Idea para medir en la prueba:** cuántos mensajes
  se necesitan antes de volver al ejercicio.

## Modo de estudio de ChatGPT y Guided Learning de Gemini (LearnLM)

- **Pedagogía:** ambos ponen el proceso antes de la respuesta.
  - Dividen el tema en pasos y hacen preguntas guía.
  - Piden al estudiante explicar su razonamiento.
  - Comprueban que entendió antes de seguir.
  - Gemini lo construye sobre LearnLM, una familia de modelos ajustada para educación **[doc/prensa]**.
- **Para STIRE:** confirman P-PED-01. **Propuesto:** que el Tutor, al cerrar un tema, pida al estudiante explicarlo
  con sus palabras. La regla 10 del prompt ya sugiere practicar o repasar.

## Koji (Brilliant)

- **Pedagogía:** preguntas guía y pistas visuales; acelera cuando el estudiante va seguro y frena cuando necesita
  práctica **[doc]**.
- **Para STIRE:** P-PED-02 (ajustar el ritmo).

---

## Enlaces

- Khanmigo, estudio de uso: https://www.chalkbeat.org/2026/08/25/ai-tutoring-students-khanmigo-khan-academy-engagement-study/
- Khanmigo, caso de estudio: https://www.buildmvpfast.com/blog/ai-tutoring-khanmigo-case-study-2026
- CS50, *Teaching CS50 with AI* (PDF): https://cs.harvard.edu/malan/publications/V1fp0567-liu.pdf
- CS50, documentación del pato: https://cs50.readthedocs.io/_sources/cs50.ai.md.txt
- Coursera Coach: https://blog.coursera.org/coursera-coach-providing-essential-learner-support
- Codecademy: https://www.codecademy.com/resources/blog/behind-the-build-ai-learning-assistant
- Duolingo, *Explain My Answer*: https://blog.duolingo.com/explain-my-answer-now-free
- Modo de estudio y Guided Learning (Pearson): https://www.pearson.com/international-schools/international-schools-blog/2026/02/what-is-gemini_s-guided-learning-and-chatgpts-study-mode-.html
- Guided Learning (TechCrunch): https://techcrunch.com/2025/08/06/google-takes-on-chatgpts-study-mode-with-new-guided-learning-tool-in-gemini/
