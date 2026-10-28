# Retroalimentación del profesor Alexander Toscano (28/10/2026)

Dos grabaciones de la revisión de STIRE con el profesor Toscano (DDSE3), con Jeider resolviendo un ejercicio de
programar como estudiante. Se transcribieron con Whisper en local; el audio tiene ruido y algunas frases salieron
incompletas, así que aquí va **lo que dijo, resumido**, no palabra por palabra. Entra como insumo de la remodelación
(`docs/PLAN_REMODELACION.md`, «Con qué se diseña la Fase 2») y de los pendientes P35 a P38 (`docs/PENDIENTES.md`).

## Grabación 1 (8 min): el ejercicio de programar, el editor y el repaso

**Lo que pasó.** Jeider no pudo resolver un ejercicio de dos operaciones. El profesor preguntó por qué y llegó a la
causa: no es falta de estudio sino de **práctica**. Contó que él perdió Fundamentos de Algoritmia y que es más visual
que lector: el perfil del estudiante cambia lo que necesita.

**Recomendaciones:**

1. **Una línea con demasiados conceptos.** `const a = Number(lineas[0])` junta cuatro ideas: constante, asignación,
   conversión de tipo (todo lo que se escribe llega como texto) y arreglo con su posición. Para quien no entiende hay
   que **desagregarla e ir de lo más simple a lo más complejo**: asignación simple (`a = 2`, `b = 3`, sumar) → tipos de
   datos y conversores (`Number`) → arreglos y posiciones (`lineas[0]`) → leer la entrada.
2. **Si se bloquea, no darle la respuesta: remitirlo.** Por cada operación del ejercicio, un enlace a una explicación
   clara del concepto que le falta, para que adquiera la competencia y vuelva.
3. **El código se explica en el mismo editor.** Palabras resaltadas (`const`, `=`, `Number`, `lineas[0]`) que, al
   tocarlas o al seleccionarlas, abren ahí mismo una explicación corta del Tutor («una constante es un valor que no
   cambia»; los tipos de asignación; qué es un arreglo y sus posiciones), sin salir de la pantalla.
4. **El repaso no va en rojo.** El rojo dice peligro y genera rechazo inmediato («como si la vida estuviera perdida»);
   inconscientemente el estudiante no lo mira. Rojo solo para alertas reales; el repaso pendiente en un color amable
   (verde o azul).

## Grabación 2 (2,5 min): personalizar por competencias

5. **Confianza por competencia (skill).** Definir las competencias de cada tema (asignación simple, cambio de tipo,
   arreglos…), aplicar un **test inicial** de esas competencias y llevar una **confianza por competencia** que sube a
   medida que resuelve bien (una ecuación del tipo ejercicios bien resueltos sobre ejercicios intentados, por tema).
   Con esa confianza se decide qué tipo de ejercicio ponerle a cada uno.
6. **Mismo ejercicio para todos no es personalizar.** El banco de ejercicios lo puede crear el docente (o el
   Asistente), pero **etiquetado por competencia y por perfil** (por ejemplo, visual frente a lector), para que STIRE
   elija el adecuado para cada estudiante.

## Qué hace STIRE hoy y qué cambia

| Recomendación | Hoy | Dónde entra |
|---|---|---|
| 1. Desagregar | La escalera por lección está pendiente (P14) | P14 + P35 |
| 2. Remitir al concepto | El Tutor da pistas, no remite a una explicación por concepto | P36 |
| 3. Explicar en el editor | El glosario explica palabras en las lecciones, no en el código | P37 |
| 4. Repaso sin rojo | Revisar el color del repaso pendiente | P38 (corrección rápida) |
| 5 y 6. Competencias | Hay dominio por lección, no confianza por competencia ni test inicial | P15 (se amplía) |
