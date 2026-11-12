# Diseño v3 — generador del prototipo

Aquí queda guardado el diseño v3 de STIRE para poder mejorarlo después. El lienzo publicado está en
<https://claude.ai/artifact/WA3ChLaQQXfCMorKgYkfsB>; esta carpeta es su fuente.

| Carpeta | Qué hay |
|---|---|
| `generador/proto_est2.mjs` | Genera las pantallas del prototipo por rol (estudiante, docente, administrador y la entrada) |
| `generador/oscuro.mjs` | Saca la versión oscura de una pantalla |
| `generador/logo_final.mjs` | Dibuja el logo |
| `lienzo/` | Los cuadros del lienzo (`*.dc.html`), su orden y páginas (`canvas.json`) y sus imágenes |
| `herramientas/` | `cap.sh` (captura de una pantalla), `osc.sh` (versión oscura y su contraste), `wcag.sh` (contraste y estructura de todas) |

## Cómo se usa

Desde esta carpeta, con Node y Chrome instalados:

```
node generador/proto_est2.mjs lienzo      # regenera las pantallas del prototipo
bash herramientas/osc.sh E-Inicio         # saca E-Inicio-Oscuro y revisa su contraste
bash herramientas/cap.sh E-Inicio 1000    # captura c_E-Inicio.png
bash herramientas/wcag.sh                 # revisa contraste y estructura de todas las pantallas
```

Algunos cuadros del lienzo (decisiones, historial, fundamento) se escribieron a mano y no los genera el script.

## Reglas para cambiar el diseño

- Diseñar contra el código real: revisar `src/` y `frontend/` antes de dibujar una pantalla.
- Cada pantalla en claro, oscuro y celular de 390 px.
- Lo que se aprendió está en `docs/v3/LECCIONES_QUE_NO_SE_PIERDEN.md`; el plan para construir, en
  `docs/v3/PLAN_CONSTRUCCION_V3.md`.
