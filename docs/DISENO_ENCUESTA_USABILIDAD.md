---
estado: vigente (04/10/2026)
criterio: UX-08 de la lista de interfaz (Pressman y Maxim, cap. 12) — métricas de usabilidad (SUS) y prueba con 5 usuarios
pedido del dueño: «investiga las formas más eficientes de hacer estas encuestas a los usuarios y recolectar esos datos»
---

# Encuesta de usabilidad dentro de STIRE

## 1. Por qué dentro de la aplicación

El SUS estaba en una tabla de Markdown para que el equipo lo llenara a mano. Así se pierde: nadie lo calcula, no se
repite después de los cambios y los estudiantes reales nunca lo responden. Dentro de STIRE se responde en 2 minutos, se
guarda, se calcula solo y se puede volver a medir.

## 2. Qué instrumento y por qué

- **SUS** (Brooke, 1996): 10 afirmaciones de 1 a 5, alternando positivas y negativas; da un puntaje de 0 a 100. Es la
  métrica que nombra el criterio y la más usada, así que el resultado se puede comparar con otros productos.
- **Lectura del puntaje:** rangos de aceptabilidad de Bangor, Kortum y Miller (2008): menos de 50, no aceptable; 50 a 70,
  marginal; 70 o más, aceptable.
- **En español:** hay versiones validadas (Sevilla-Gonzalez et al., 2020, α = 0,81; Castilla et al., 2024, que además
  valida una forma corta solo con las afirmaciones positivas). STIRE usa hoy una traducción fiel de los ítems de Brooke;
  el anexo con la redacción exacta de Sevilla-Gonzalez no se pudo descargar automáticamente. **Si se adopta esa
  redacción, solo cambian los textos de `frontend-nuxt/utils/sus.ts`:** el cálculo es el mismo.
- **Se descartó UMUX-Lite** (Lewis, Utesch y Maher, 2013; 2 ítems): es más corto, pero el criterio pide el SUS y con 10
  ítems se ve qué afirmación baja el puntaje.
- **Una pregunta abierta:** «¿Qué cambiarías primero?». El SUS dice **cuánto**; los comentarios dicen **qué**.

## 3. Cuándo preguntar (lo que hacen las plataformas)

Las guías de encuestas dentro de la aplicación coinciden en lo siguiente (Qualaroo, Userpilot, Braze; son guías de
producto, no evidencia científica):
- Preguntar **después de usar**, no al llegar. Por eso no se invita a quien lleva menos de 3 días.
- **No interrumpir:** una tarjeta en el inicio, no una ventana encima.
- **Respetar el «Ahora no»:** la oculta 7 días.
- **No cansar:** se puede volver a responder a los 90 días, para medir otra vez después de cambios grandes.

## 4. Qué hace STIRE

- **Responder:** `/estudiante/encuesta` y `/docente/encuesta`, también desde Mi perfil.
  - 10 afirmaciones en una página, con opciones de 44 px.
  - Si falta alguna, el error va junto a ella y el foco también.
- **Invitar:** una tarjeta en el inicio, solo si el servidor dice que toca (`GET /usabilidad/sus/estado`).
- **Resultados** (`/admin/usabilidad`), sin nombres:
  - el promedio y su lectura;
  - el promedio por rol;
  - el promedio por afirmación, marcando las 2 que más le quitan al puntaje;
  - los comentarios.

  Cuenta la última respuesta de cada persona.
- **El puntaje lo calcula el servidor**, no la pantalla.

## 5. Cómo se cumple UX-08

UX-08 pide tres cosas:
1. **El prototipo:** ya estaba (Figma).
2. **La prueba con 5 usuarios:** es la del equipo, del 5 al 16/10.
3. **El SUS:** ya está **listo para recolectar**, pero el ítem se cumple **cuando haya respuestas**. Con las del equipo
   (5 personas) se calcula el primero; con las de los estudiantes, se mide de verdad.

## 6. Dónde está

`src/usabilidad/` (reglas con prueba, servicio y controlador), `src/migrations/1792300000000-EncuestaSus.ts`,
`frontend-nuxt/utils/sus.ts`, `components/EncuestaSus.vue`, `components/InvitacionEncuesta.vue`,
`pages/admin/usabilidad.vue`. Base teórica: BT-31.

## Referencias

- Bangor, A., Kortum, P. T. y Miller, J. T. (2008). An Empirical Evaluation of the System Usability Scale. *International Journal of Human–Computer Interaction, 24*(6), 574-594. https://doi.org/10.1080/10447310802205776
- Brooke, J. (1996). SUS: A «quick and dirty» usability scale. En P. W. Jordan et al. (Eds.), *Usability Evaluation in Industry* (pp. 189-194). Taylor & Francis.
- Castilla, D. et al. (2024). Psychometric Properties of the Spanish Full and Short Forms of the System Usability Scale (SUS): Detecting the Effect of Negatively Worded Items. *International Journal of Human–Computer Interaction, 40*(15), 4145-4151. https://doi.org/10.1080/10447318.2023.2209840
- Lewis, J. R., Utesch, B. S. y Maher, D. E. (2013). UMUX-LITE: when there's no time for the SUS. En *Proceedings of CHI '13*, 2099-2102. https://doi.org/10.1145/2470654.2481287
- Sevilla-Gonzalez, M. del R. et al. (2020). Spanish Version of the System Usability Scale for the Assessment of Electronic Tools: Development and Validation. *JMIR Human Factors, 7*(4), e21161. https://doi.org/10.2196/21161
