# Simulación en el navegador de una estudiante novata · 20 de noviembre de 2026

**Qué es:** se recorrió STIRE en un navegador real, en tamaño de celular (375 × 740), haciendo de «Camila», una
estudiante que nunca ha programado y que comete los errores de un novato. No es una persona real: los errores se
eligieron a propósito, a partir de lo que se observó en la prueba con 9 usuarios finales (la sección E del artículo y
su Tabla 3) y de lo que la literatura llama estudiantes simulados (ver §4). Complementa la simulación por la API
(`SIMULACION_DOCENTE_ESTUDIANTES_2026-11-20.md`), que no pasa por la interfaz.

- **Herramienta:** `agent-browser` (Chrome por CDP), contra STIRE local (`nuxi dev` en el puerto 3000 y el servidor
  compilado en el 3001, con la base de pruebas).
- **Clase:** `SIM-1121-A`, creada por el docente simulado.
- **Capturas:** `novato/`.

## 1. Perfiles de estudiante usados en las simulaciones

Toscano pidió los perfiles en una tabla, con cuál y por qué (`docs/curso-ddse3/README.md` §4c).

| Perfil | Cómo se simula | Por qué | Dónde |
|---|---|---|---|
| **Novata que se confunde** | En el navegador, con errores a propósito: datos mal escritos, la clave en el campo equivocado, doble toque, mayúsculas, salir con «Atrás» | Lo que pasó en la prueba con 9 usuarios: 8 de 9 sin experiencia y 7 de 9 necesitaron una pista | Este informe |
| **15 estudiantes con habilidad oculta** | Por la API; aciertan según su habilidad por competencia y aprenden al practicar | Medir si la ecuación de Toscano estima bien lo que sabe cada uno | `SIMULACION_DOCENTE_ESTUDIANTES_2026-11-20.md` |
| **Un estudiante al azar** | Por la API, con un perfil al azar (acierto por dificultad, mejora por intento, confianza) | Ver un recorrido completo, con sus repasos y la proyección de SM-2 | `scripts/cursos/simular-al-azar.ts` |
| **Personas de los cursos** (Laura, Valentina, Andrés… 12 en total) | Por la API, con perfiles escritos a mano | Probar los dos cursos como un docente y sus estudiantes | `scripts/cursos/personas.ts` |
| *Por hacer:* **el que adivina** y **el que da vueltas sin avanzar** | Responde al azar o pide pistas sin parar; reintenta lo mismo sin aprender | Son dos de los estados de desconexión que se simulan para probar tutores (Meng et al., 2026, preprint en arXiv; verificar antes de citar) | — |

## 2. El recorrido de Camila

| # | Qué hizo Camila | Qué pasó | Veredicto |
|---|---|---|---|
| 1 | Se registra con un correo sin @ | «Revisa el correo: debe verse como nombre@dominio.com.» | ✅ Claro |
| 2 | Pone una clave de 4 números | Medidor «Débil · 4 caracteres» y las reglas que faltan, cada una en una etiqueta | ✅ Claro (`03-clave-corta.png`) |
| 3 | Sigue sin marcar la casilla de 18 años | Pasa al paso 2; la casilla sigue visible y se exige antes de crear la cuenta | ✅ Correcto |
| 4 | **Pega su clave de Google en el campo «Código de la clase»** (lo mismo que hizo una persona en la prueba real) | El campo la pasó a mayúsculas, la cortó en 30 caracteres y no dijo nada | ❌ **Arreglado** (hallazgo 1) |
| 5 | Sigue sin el Tutor | Le pide confirmar y explica qué pierde | ✅ Claro |
| 6 | Escribe el código como lo oyó: «sim 1121 a» | Se convierte solo en `SIM-1121-A` y se une | ✅ Muy bien |
| 7 | Toca «Unirse» con el recorrido de ayuda abierto | El globo del recorrido tapa el campo y el botón que explica; el toque no hace nada | ⚠️ Pendiente (hallazgo 2) |
| 8 | Toca un módulo «Cerrado» | «Se abre con 50 % de dominio en Unidad 1. Vas en 0 %.» | ✅ Claro (`12-cerrado.png`) |
| 9 | Pide ayuda al Tutor sin haber puesto la clave | El Tutor explica cómo activarse; formulario fijo abajo con «Pegar» | ✅ Claro |
| 10 | Elige mal y toca dos veces «Entregar» | Una sola entrega: el segundo toque abre la pregunta de confianza | ✅ Robusto (`14-doble-entrega.png`) |
| 11 | Dice «Estoy seguro» con la respuesta mala | «Estabas seguro y no acertaste: este es el error que más enseña…» y le ofrece un ejercicio parecido | ✅ Muy bien |
| 12 | Escribe `Console.log("Vivo en" + ciudad)` y prueba | «ReferenceError: Console is not defined»; la explicación preguntaba en general si estaba bien escrito y quedaba detrás del editor | ⚠️ **Mejorado** (hallazgo 3) |
| 13 | Sale con «Atrás» del navegador y vuelve | Su código seguía ahí (guardado automático) | ✅ Robusto |
| 14 | Corrige la mayúscula, deja «Vivo en» sin espacio ni punto y **entrega sin probar** | «No coincide… pruébalo con «Probar con mis datos»», en un ejercicio que no lee datos | ⚠️ **Mejorado** (hallazgo 4) |

**Resultado:** 10 de los 14 momentos salieron bien a la primera, y en varios STIRE fue más robusto de lo esperado (doble
toque, «Atrás», código mal escrito). Hubo 4 hallazgos: 3 se arreglaron el mismo día y 1 queda pendiente.

## 3. Hallazgos

### Hallazgo 1 · La clave de Google en el campo del código (arreglado, `489fe89`)

Ya había pasado con una persona real en la prueba con usuarios finales y seguía sin resolverse.
- **Ahora**, en los 4 campos donde se escribe un código de clase (registro, Entrar, inicio y Mis clases), STIRE reconoce
  una clave de Google y lo dice.
- **En el registro**, además, la pasa sola al campo de la clave (`06-clave-movida.png`).
- **Prueba:** `clave-en-codigo-de-clase.frontend.spec.ts`.

### Hallazgo 2 · En el celular, el recorrido tapa lo que explica (pendiente)

- **Qué pasa:** el globo del recorrido mide unos 330 px. Tiene el texto, «Ver en el manual», «No volver a mostrar
  recorridos», «Saltar recorrido» y los botones, todo con toques de 44 px. En una pantalla de 740 px, alrededor de una
  tarjeta alta («¿Tienes un código de clase?») no cabe ni arriba ni abajo, y se pone encima.
- **Propuesta:**
  - en pantallas estrechas, señalar el campo y no la tarjeta entera;
  - poner «No volver a mostrar» y «Saltar» en una sola línea.

  Se deja para hacerlo con calma; no se improvisó.

### Hallazgo 3 · El error de las mayúsculas (mejorado, `f152003`)

- **Antes:** con `Console.log`, la explicación preguntaba «¿Está escrita igual, con las mismas mayúsculas?».
- **Ahora:** si el nombre es uno conocido escrito con otras mayúsculas (`console`, `console.log`, `Math`, `Number`,
  `leerNumero`…), dice exactamente cómo se escribe: «Escribiste «Console» en la línea 5, pero se escribe «console».».
  No da la solución del ejercicio.
- **Sigue pendiente:** en el celular la explicación queda debajo del editor; hay que desplazar para verla.

### Hallazgo 4 · Varias diferencias pequeñas a la vez (mejorado, `f152003` y `746a82e`)

- **Antes:** «Vivo enMontería» contra «Vivo en Montería.» (faltan un espacio y el punto) no entraba en ninguna regla de
  «casi», porque cada regla reconocía una sola diferencia. Al entregar sugería «Probar con mis datos» en un ejercicio
  sin datos.
- **Ahora:** dice «Casi: las palabras están bien, pero cambian los espacios o los signos», tanto en «Probar código»
  como al entregar. «Probar con mis datos» solo se sugiere si el ejercicio lee datos.
- **Despliegue:** el cambio al entregar es del servidor y queda pendiente de desplegar en Azure.

## 4. Para el artículo

- Es una **inspección con un usuario simulado**, no una prueba con personas. Su valor es otro: se puede repetir, cubre
  errores que en la prueba real pasaron una sola vez y permite comprobar el arreglo.
- **Fuente** (encontrada en Consensus el 20/11; los datos vienen de su resumen y faltan los coautores completos antes
  de citarla): una revisión sistemática de estudiantes simulados en tecnología educativa (Käser et al., 2023,
  *International Journal of Artificial Intelligence in Education*). Halló que casi la mitad de los estudios no
  demuestran que su modelo de estudiante sea válido. Por eso este informe dice de dónde sale cada error simulado: de
  la prueba con personas.
- **Mensajes de error:** la prueba con 9 personas dejó como dificultad que más se repitió «los mensajes de error de
  programación todavía técnicos». Los hallazgos 3 y 4 avanzan justo sobre eso.

## 5. Cómo repetirla

1. Levantar el servidor (`DB_DATABASE=stire_pruebas_local TRUST_PROXY=1 node dist/main.js`) y el frontend
   (`cd frontend-nuxt && npx nuxi dev --port 3000`).
2. `agent-browser set viewport 375 740` y recorrer la tabla del §2, paso por paso, con una cuenta nueva.
3. Verificar cada fila con su captura.
