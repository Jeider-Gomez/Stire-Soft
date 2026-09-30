# Simulación del segundo salón — 30/09/2026 (paso 5)

**Qué se probó:** si la práctica adaptativa funciona con estudiantes que dicen cosas distintas en la pregunta de confianza y
siguen «Continuar» (el recomendador), no el orden de la lista. Todo en **producción**, por la API real, con
`scripts/cursos/segundo-salon.ts`.

## El salón

Laura creó «Fundamentos de Algoritmia — grupo 2» (`ALGO-203413-G2`) con «Traer de otra clase» desde ALGO-203413:
**3 secciones, 10 temas, 17 unidades, 17 lecciones y 122 ejercicios**, en una sola petición. Llegó en borrador; publicó las
3 secciones. Ningún ejercicio se escribió a mano.

## Los cuatro estudiantes (5 unidades cada uno)

| Estudiante | Responde | Qué pasó |
|---|---|---|
| Julián Ortega Ríos | «Me siento seguro» | En «Operadores y expresiones» el recomendador abrió con un **reto** intermedio; lo acertó al primer intento y la unidad se dio por completa sin los básicos (el «saltar adelante» del diseño). Acertó los 16 ejercicios al primer intento: su perfil es flojo, pero le tocaron números bajos (se comprobó que el azar de la simulación está bien repartido). |
| Daniela Castro Mejía | «Es nuevo para mí» | Empezó en lo básico. Tras dos aciertos seguidos al primer intento, el recomendador **subió de nivel** («sube_nivel») y después volvió a las casillas básicas que faltaban. Falló algunos al primer intento y reintentó. |
| Sebastián Vargas Peña | «Tengo dudas» | Igual que Daniela en el recorrido (el diseño dice que «dudas» y «nuevo» empiezan en lo básico). Subió de nivel en «Operadores y expresiones». |
| Luisa Fernanda Rojas | No responde | Igual camino que «nuevo»: el recomendador cuenta solo con lo que hace. |

Dominio final de las 5 unidades: Daniela 91–100 %, Sebastián 91–100 %, Luisa 100 %.

## Lo que encontró la simulación

**Un defecto, corregido:** a Julián el recomendador le dijo «Completaste la unidad» en «Operadores y expresiones» con un
**dominio del 30 %**. El recomendador ya no exigía las casillas básicas saltadas por el reto, pero el dominio las seguía
contando como pendientes. Ahora el dominio no cuenta las casillas saltadas que nunca intentó (las que sí intentó cuentan con
su nota). Commit `7121dc4`, con 9 pruebas.

**Lo que se comportó según el diseño:** reto con «Me siento seguro», subida de nivel tras dos aciertos al primer intento,
vuelta a las casillas pendientes, y ningún bucle: cada unidad terminó con «completa según el recomendador».

## Lo que no mostró (y por qué)

- **Un sobreconfiado que falla.** Julián no falló ninguno. Es la suerte de su semilla, no un error; no se cambiaron los
  perfiles para forzar el resultado. La regla «dice seguro y falla → el tutor explica y el docente lo ve» sigue sin verse en
  datos: es justo lo que mostraría el mapa de calor del paso 6.
- **Bajar de nivel.** Nadie falló dos seguidos en un mismo nivel. Las primeras 5 unidades son casi todas básicas.
- **Repasos.** Todavía no vence ninguno: se verán en unos días en las mismas cuentas.

## Cómo repetirla

```bash
STIRE_API=https://stire-unicor.duckdns.org npx ts-node -r tsconfig-paths/register scripts/cursos/segundo-salon.ts
```
Retoma donde quedó: no repite el salón ni los ejercicios ya trabajados. Tarda unos 30 minutos por el límite de peticiones del
servidor.
