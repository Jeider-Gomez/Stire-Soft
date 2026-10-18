---
estado:     vigente
verificado: 2026-10-18
fuente:     revisión del «Dossier Epistemológico y Científico en 6 Pilares» (docx recibido el 18/10/2026) contra el código de STIRE y Crossref
codigos:    no aplica (investigación, no ventanas)
---

# Revisión del dossier de repetición espaciada: qué dice, qué hace STIRE y qué hay que corregir

El dossier explica con mucha claridad **por qué** STIRE programa los repasos como lo hace. Esta revisión lo compara
con el código real (`src/common/utils/spaced-repetition.ts`) y comprueba sus referencias en Crossref, para que lo que
se diga en la tesis, en el artículo y ante el jurado coincida con lo que hace el software.

**Conclusión en corto:**
1. **STIRE aplica bien la repetición espaciada.** El código usa el SM-2 de Woźniak de verdad, con el factor que
   cambia en cada repaso. La tabla del dossier sale tal cual cuando el estudiante responde «Bien» siempre.
2. **La fórmula del dossier y la del código no son la misma.** Hay que escoger una para la tesis. Se recomienda
   describir la del código, que es SM-2 completo y está probada.
3. **Seis referencias tienen errores** y **cinco citas textuales no están comprobadas**. No se usan hasta
   verificarlas contra el texto original.

---

## 1. La idea, explicada fácil

Cuando aprendes algo, lo empiezas a olvidar casi de inmediato: la curva del olvido de Ebbinghaus cae rápido al
principio y después más despacio. Si lo repasas **justo cuando empieza a costarte recordarlo**, el recuerdo se
vuelve más firme y la siguiente vez tardas más en olvidarlo. Por eso los repasos se van separando: 1 día, 3 días,
8, 20…

Repasar no es releer. En STIRE **cada repaso es un ejercicio**: tienes que sacar la respuesta de tu memoria (el
efecto de la práctica de recuperación, Roediger y Karpicke, 2006). Cuesta un poco más que releer, y por eso funciona:
es una «dificultad deseable» (Bjork y Bjork, 2011).

### Una semana con STIRE

| Día | Qué pasa |
|---|---|
| **Lunes** | Practicas la lección de ciclos y la apruebas. STIRE agenda el primer repaso para mañana. |
| **Martes** (+1 día) | Te avisa una sola vez al día: «Tienes 1 repaso pendiente hoy». Resuelves un ejercicio corto. |
| **Viernes** (+3 días) | Segundo repaso, antes del fin de semana. |
| **Siguiente semana** | Desde el tercer repaso, la espera depende de cómo te fue: si lo resolviste bien al primer intento, 8 días; si te costó, menos. |
| **Si fallas un repaso** | Vuelve a empezar: repaso al día siguiente. Tu dominio de la lección baja un poco. Dejar pasar un repaso, en cambio, no lo baja. |

## 2. Lo que hace el código (verificado el 18/10/2026)

`calculateNextReview` en `src/common/utils/spaced-repetition.ts`:

- **La nota del repaso sale del resultado**, como los botones de Anki, sin preguntarle nada extra al estudiante:

  | Resultado | Calidad SM-2 |
  |---|---|
  | Falló | 1 · «otra vez»: reinicia a 1 día |
  | Acertó, pero no al primer intento | 3 · «difícil» |
  | Acertó al primer intento | 4 · «bien» |
  | Acertó al primer intento y había dicho «Estoy seguro» | 5 · «fácil» |

- **Intervalos:** 1 día, después 3 días, y desde el tercero `intervalo anterior × EF`, redondeado. Tope de 60 días.
- **EF (factor de facilidad):** empieza en 2,5 y **cambia en cada repaso** con la fórmula de SM-2:
  `EF' = EF + (0,1 − (5 − q)(0,08 + (5 − q)·0,02))`, nunca por debajo de 1,3. Un fallo reinicia el intervalo sin
  tocar el EF, como en el SM-2 original.
- **Avisos:** uno solo al día con todos los repasos pendientes (`src/notifications/notificacion-reglas.ts`).

### Intervalos reales de STIRE (simulados con el código)

| Si el estudiante responde siempre… | Repaso 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| **Fácil** (q = 5) | 1 | 3 | 8 | 23 | 60 | 60 |
| **Bien** (q = 4) | 1 | 3 | 8 | 20 | 50 | 60 |
| **Difícil** (q = 3) | 1 | 3 | 6 | 12 | 22 | 37 |
| Bien, difícil, bien, **falla**, bien, bien | 1 | 3 | 7 | **1** | 1 | 3 |

(días hasta el siguiente repaso)

## 3. Dossier contra código

| Tema | Dossier | Código | ¿Coinciden? |
|---|---|---|---|
| Primeros intervalos | 1 y 3 días (no 1 y 6 como SM-2) | 1 y 3 días | ✅ |
| Tope | 60 días | 60 días | ✅ |
| Reinicio al fallar | q < 3 → 1 día | q < 3 → 1 día | ✅ |
| Factor | **Tres niveles fijos** (Fd = 1,3 / 1,8 / 2,5) que se asignan en cada repaso | **EF continuo de SM-2**, que se ajusta poco a poco desde 2,5 | ❌ distinto |
| Redondeo | Hacia arriba (⌈ ⌉) | Al más cercano | ❌ distinto (cambia poco: «Bien» da 1, 3, 8, 20, 50 en los dos) |
| Cómo se califica el repaso | Errores, pistas y «latencia de duda» | Aprobado, primer intento y confianza declarada | ≈ (STIRE no mide el tiempo de duda) |
| Tipo de ejercicio del repaso | Problemas de Parsons de unos 3 minutos | Un ejercicio corto de la lección, de cualquiera de los 7 tipos (Parsons incluido) | ≈ |

**Lo que hay que decidir.** La Ecuación 1 del dossier (y la Figura 14 de la tesis) describe un modelo más simple
que el que corre en STIRE. Las dos opciones:

- **A (recomendada): la tesis describe el modelo del código.** Es el SM-2 de Woźniak sin recortes, ya tiene pruebas
  automáticas, y la tabla del dossier se explica como casos particulares: «Dominio alto» es responder siempre «bien»
  (EF se queda en 2,5) y «Dominio medio» se parece a responder siempre «difícil» (1, 3, 6, 12, 22 frente a 1, 3, 6, 11, 20). «Dominio bajo» no tiene equivalente directo: en SM-2 el EF solo llega a 1,3 después de muchos repasos difíciles, y si falla, reinicia.
- **B: cambiar el código a tres niveles fijos.** Se pierde que el factor aprenda de la historia de cada estudiante con
  cada lección, que es justo lo que piden Pavlik et al. (2020) y Tabibian et al. (2019).

**Otro dato del dossier que no se sostiene:** dice que 1,8 es el «punto medio armónico» entre 1,3 y 2,5. La media
armónica es ≈ 1,71 y la aritmética 1,9. El 1,3 sí es el mínimo del EF en SM-2, y 2,5 su valor inicial.

## 4. ¿Lo estamos aplicando de la mejor forma? Lo que se puede mejorar

| Mejora | Por qué | Esfuerzo |
|---|---|---|
| **Repaso intercalado** (mezclar ejercicios de 2 o 3 lecciones vencidas en una sesión corta) | Está diseñado en `docs/DISENO_PRACTICA_ADAPTATIVA.md` §3.4 pero **no está programado**. Intercalar es otra «dificultad deseable» (Bjork y Bjork, 2011) | Medio |
| **Repaso con un ejercicio distinto** del que ya resolvió | Si repite el mismo, puede recordar la respuesta y no el concepto | Revisar cómo se elige hoy |
| **Tener en cuenta el retraso** (quien repasa 10 días tarde y acierta recuerda más de lo esperado) | SM-2 lo ignora; modelos más nuevos (Tabibian et al., 2019; Settles y Meeder, 2016) sí | Alto: trabajo futuro |
| **Medir que funciona** | Comparar en la prueba del Reto 5 cuántos repasos se aprueban al primer intento según el intervalo | Bajo: los datos ya se guardan |

## 5. Referencias del dossier: lo que se comprobó

Se comprobaron en Crossref los 25 DOI del dossier el 18/10/2026.

**Con errores (corregir antes de usar):**

| Referencia del dossier | Problema | Dato correcto |
|---|---|---|
| Settles y Meeder (2016), DOI 10.1145/2939672.2939778, «KDD '16» | Ese DOI es de otro artículo («Why should I trust you?»). Además se publicó en **ACL**, no en KDD | Proceedings of the 54th Annual Meeting of the ACL, pp. 1848–1858. https://doi.org/10.18653/v1/P16-1174 |
| Tabibian et al. (2019), DOI 10.1073/pnas.1817412116 | El DOI no existe | https://doi.org/10.1073/pnas.1815156116 |
| Pashler et al. (2007), DOI 10.1016/j.clindermatol.2007.05.014 | Ese DOI es de un artículo sobre tatuajes | Buscar el DOI correcto o quitarla |
| Denny, Luxton-Reilly y Simon (2018a), *ACM Inroads*, DOI 10.1145/3233306 | El DOI es de un artículo de gráficos por computador; no se encontró el artículo | **No usar** hasta encontrar la fuente real |
| Denny, Luxton-Reilly y Simon (2018b), SIGCSE '18, DOI 10.1145/3159450.3159570 | El DOI es de otro artículo («Connecting Colleges/Universities and Local High Schools») | **No usar** hasta encontrar la fuente real |
| Kornell (2008) | Publicado en **2009** | *Applied Cognitive Psychology, 23*(9). https://doi.org/10.1002/acp.1537 |

**Correctas en Crossref** (el DOI lleva a la obra citada): Anderson et al. (1995), Baddeley y Longman (1978),
Bahrick et al. (1993), Cepeda et al. (2006, 2008), Corbett y Anderson (1995), Dempster (1988), Dunlosky et al.
(2013), Pavlik et al. (2020, en *npj Science of Learning*, no en *Nature*), Pimsleur (1967), Pokrywka et al. (2023),
Robins et al. (2003), Roediger y Karpicke (2006), Spitzer (1939), Sweller (1988), Wixted y Ebbesen (1991) y Zhang et
al. (2020). Sin DOI y sin comprobar aquí: los libros y capítulos (Bjork y Bjork, Leitner, Vygotsky, Woźniak, Jost,
Mace, Landauer y Bjork) y las tesis (Caro Piñeres, 2015; Ericson, 2021).

**Citas textuales sin comprobar (no copiarlas hasta leerlas en el original):**
- Dempster (1988, p. 627): la frase menciona «educational technology», un término raro para 1988.
- Zhang et al. (2020, p. 1) y el dato «p = 0.031».
- Robins et al. (2003, p. 137).
- Caro Piñeres (2015, p. 45): la tesis está en inglés y la cita aparece en español, entre comillas, como textual.
- Ericson (2021, p. 12).

Que el DOI exista no quiere decir que la cita textual esté en el artículo. Antes ya pasó en este proyecto
(`INFORME_SANEAMIENTO_BIBLIOGRAFICO.md`): las referencias parecían reales y no lo eran. **La regla sigue igual:**
ninguna cita entra en la tesis ni en el artículo sin verificar la obra y, si es textual, la página.

## 6. Qué hacer

1. Decidir entre A y B (§3). Con A, reescribir la Ecuación 1 con el EF de SM-2 y poner la tabla del §2.
2. Corregir las 6 referencias del §5 y verificar las 5 citas textuales con los PDF.
3. Llevar a `BASE_TEORICA.md` solo lo verificado.
4. Si da tiempo antes del Reto 5: el repaso intercalado (§4).
