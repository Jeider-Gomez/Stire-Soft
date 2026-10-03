# Fichas: repetición espaciada

Cómo deciden las plataformas cuándo repasar y qué tomó STIRE. Marcas de evidencia como en [`README.md`](README.md).
El diseño de los repasos de STIRE está en `docs/DISENO_PRACTICA_ADAPTATIVA.md`; la teoría (Ebbinghaus, Cepeda et al.,
SM-2) en `../BASE_TEORICA.md` y en la matriz bibliográfica.

## Dónde está STIRE

**SM-2** (Woźniak y Gorzelańczyk, 1994, matriz #2), con la calidad del repaso sacada del **resultado real**:
- falló: 1, «otra vez»;
- acertó tras varios intentos: 3, «difícil»;
- al primer intento: 4, «bien»;
- al primer intento y dijo «me siento seguro»: 5, «fácil».

No se le pide al estudiante calificarse a sí mismo. Intervalo máximo de 60 días y el segundo intervalo en 3 días
en vez de 6, para que un semestre alcance (`src/common/utils/spaced-repetition.ts`).

---

## Anki

- **Pedagogía:** tarjetas con cuatro botones de autoevaluación. Desde 2023 permite elegir entre SM-2 y **FSRS**
  **[doc]**.
- **FSRS:**
  - **Cómo funciona:** estima para cada tarjeta la probabilidad de recordarla y programa el repaso cuando cae a la
    **retención deseada** (por ejemplo, 90 %).
  - **El costo de pedir más:** subir del 90 % al 95 % duplica los repasos diarios y el 97 % los cuadruplica.
  - **Ahorro:** según sus autores, la misma retención con 20 a 30 % menos repasos que SM-2 **[doc]**.
  - **Base científica:** Ye, Su y Cao (2022), KDD **[inv]**.
- **UX:** la cifra de «repasos para hoy» manda. Si se acumulan, desaniman **[doc]**.
- **Para STIRE:**
  - **P-PED-13: ya hecho.** La calidad sale del resultado, como los botones de Anki pero sin pedírselos al
    estudiante.
  - **P-PED-14: propuesto, prioridad 4.** Retención deseada que elige el docente y FSRS cuando haya datos reales
    de uso para ajustarlo. Sin datos, FSRS usa parámetros genéricos y su ventaja sobre SM-2 se reduce.

## Duolingo

- **Pedagogía:** modelo de **vida media del recuerdo** (*half-life regression*). Estima cuánto tarda en olvidarse
  cada palabra y elige qué practicar (Settles y Meeder, 2016, ACL) **[inv]**. Práctica personalizada dentro de la
  ruta, con los errores propios **[doc]**.
- **UX:** el repaso no es otra pantalla, es parte del camino. La racha anima a volver cada día **[doc]**.
- **Para STIRE:** P-PED-15. Los repasos se ven en el inicio y el Tutor los recuerda; falta el repaso mixto dentro
  de la ruta (hoja de ruta #6). La racha está desde BT-21.

## Quizlet

- **Pedagogía:** el modo *Learn* ordena las tarjetas **dentro de la sesión** por la probabilidad predicha de
  recordarlas, con un modelo entrenado con millones de respuestas. **No** programa repasos entre días como Anki
  **[doc/análisis citado]**. Muestra un *Memory Score* **[doc]**.
- **Para STIRE:** una idea útil dentro del repaso: **empezar por lo que más probablemente falle**. **Propuesto,**
  junto con el repaso mixto.

## RemNote y SuperMemo

- **RemNote:** las tarjetas salen de los propios apuntes. Escribir y repasar están en el mismo lugar **[doc]**.
- **SuperMemo:** el origen de SM-2. Sus versiones nuevas usan modelos de memoria más finos **[doc]**.
- **Para STIRE:** confirman que el repaso debe nacer de lo que se practicó, como ya pasa: el primer envío calificado
  de una lección le programa su repaso (`submission-graded.listener.ts`).

---

## Enlaces

- FSRS, tutorial oficial: https://github.com/open-spaced-repetition/fsrs4anki/blob/main/docs/tutorial.md
- FSRS, «ABC of FSRS»: https://github.com/open-spaced-repetition/fsrs4anki/wiki/ABC-of-FSRS/9fb4c9a982a2d0c1b941c510a1f5d0c36ccf1836
- Quizlet, la ciencia de la repetición espaciada: https://quizlet.com/content/science-behind-spaced-repetition
- Quizlet, análisis de *Learn*: https://www.notelyn.com/blog/quizlet-spaced-repetition
