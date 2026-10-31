# Prueba como estudiante: «Saludo personalizado» (31/10/2026)

Jeider, sin conocer JavaScript y sin ayuda externa, con la cuenta de prueba de Santiago, siguiendo la escalera de lo más
sencillo a lo complejo. Este es el registro de lo que pasó y de lo que se decidió anotar. Los pendientes salen numerados
en [`../PENDIENTES.md`](../PENDIENTES.md) (P48 a P53).

## La escalera que se recorrió

| Peldaño | Ejercicio | Resultado |
|---|---|---|
| 1 | Completa la presentación (completar huecos) | Resuelto. Mostró cinco fallos del Tutor, todos corregidos (ver `docs/prompts/README.md`, v3 a v8). |
| 2 | **Saludo personalizado** (el primer programa) | Se completó, pero **con mucha dificultad** y con diez mensajes al Tutor. Lo de abajo. |

## Lo que dijo Jeider (sus palabras, resumidas)

1. **No sabía que había que escribir `console.log`** para mostrar algo en pantalla.
2. **Pulsaba «Probar código» y no sabía dónde se veía el resultado.** Lo descubrió al final.
3. **No tenía idea de qué había que hacer:** el enunciado parece un ejemplo más que una instrucción (leer lo que entra, armar un texto).
4. **Las primeras líneas del código enredan:** una lista (`lineas`) que no sabe qué es todavía, para un ejercicio básico. «Siento que estás tratando de explicar algo sencillo con cosas complicadas.»
5. **A la lección le faltan espacios para practicar** y entender, tanto el lenguaje como lo que dice la lección.
6. **Quiere poder ejecutar el código, interactuar con la consola y mandar datos**, y armar el código para pedir las cosas.
7. Para ser un ejercicio básico, **se demoró mucho**.

## Lo que se vio en su conversación con el Tutor (diez mensajes)

- Tres veces usó el botón de sugerencia «Por qué no sale lo esperado», y cada vez el Tutor le señaló **el siguiente error suelto**: unos `< >` alrededor de `nombre` (los copió del enunciado, que escribe `<nombre>` como marcador), un punto sobrante, la falta de un espacio después de la coma.
- Al final de la conversación escribió «no veo la consola», «no veo ningún resultado»: el Tutor contestó «aparece abajo en la pantalla», sin decirle **dónde** (pestaña «Casos de prueba», panel izquierdo).
- **Nunca se le explicó qué es `console.log` ni para qué sirve**: el Tutor corrigió línea por línea a un estudiante que no sabía qué estaba escribiendo.
- Cuando se le preguntó «explícame», el Tutor sí explicó bien por qué faltaba el espacio. El problema no fue la calidad de cada respuesta, sino **no darse cuenta de que el estudiante estaba perdido** y orientarlo antes de seguir corrigiendo.
- Algunas respuestas dieron el arreglo carácter por carácter («cambia `"Hola,"` por `"Hola, "`»).

## Qué se hizo ese mismo día

- **Prompt v10:** el Tutor sabe dónde se ve el resultado de «Probar código» y, si el estudiante no sabe cómo mostrar algo en pantalla, le explica `console.log` antes de seguir corrigiendo (`docs/prompts/README.md`).

## Qué queda anotado (ver P48 a P53 en `PENDIENTES.md`)

| # | Qué | De dónde sale |
|---|---|---|
| P48 | La salida de «Probar código» a la vista, con un mensaje claro antes de la primera prueba | punto 2 |
| P49 | Consola interactiva: ejecutar, ver lo que escribe el programa y mandarle datos | punto 6 |
| P50 | Lecciones con bloques de código que se ejecutan en la misma lección | punto 5 |
| P51 | Una escalera más fina antes de «Saludo personalizado» (primero solo mostrar en pantalla) y enunciados en pasos, sin `<nombre>` | puntos 1 y 3 |
| P52 | El Tutor detecta al estudiante perdido y lo orienta antes de seguir corrigiendo | conversación |
| P53 | Que ningún ejercicio básico obligue a leer una lista: refuerza P35 | punto 4 |
