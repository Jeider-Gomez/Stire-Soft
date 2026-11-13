# Video de presentación de STIRE

Video de 1 min 42 s que presenta STIRE con la voz de la mascota. Se usa en la página de entrada
(«Entrar y presentar STIRE» del diseño v3). Está hecho con HyperFrames: cada escena es HTML animado con GSAP
y se convierte a MP4.

## Qué hay en `proyecto/`

| Ruta | Qué es |
|---|---|
| `index.html` | La línea de tiempo: las 10 escenas, la voz, la música y los efectos |
| `compositions/` | Una escena por archivo: hola, nombre, miedo, leccion, ayuda, repasos, logro, docente, celular, cierre |
| `GUION.md` | Lo que dice la mascota en cada escena |
| `assets/voz/` | Voz de Will (ElevenLabs), acelerada al 1,1×, y los tiempos de cada palabra |
| `assets/musica.mp3` | Música original compuesta por código (sin licencias de terceros); baja sola cuando habla la mascota |
| `assets/sfx/` | Efectos de sonido generados con ElevenLabs (cuenta gratuita) |
| `assets/pantallas/` | Capturas del diseño v3 que aparecen en el video |
| `subtitulos/` | Subtítulos aparte en `.srt` y `.vtt`; para traducir el video se traduce solo este archivo |
| `ritmo.json` | Dónde empieza y cuánto dura cada escena |
| `herramientas/` | `musica.py` (rehace la música) y `subtitulos.py` (rehace los subtítulos) |

## Cómo verlo y sacar el MP4

Desde `proyecto/`:

```
npx hyperframes preview      # vista previa con sonido en el navegador
npx hyperframes check        # comprueba que no haya errores
npx hyperframes render       # saca el MP4
```

## Dónde está en la app

El MP4 comprimido para la web (7,5 MB, 1080p, `-crf 26 -movflags +faststart`), el póster y los subtítulos están en
`frontend-nuxt/public/video/`. Se abre desde «¿Qué es STIRE?» en Entrar (`components/presentacion/VideoSTIRE.vue`),
con la transcripción en `utils/videoPresentacion.ts`. Si se rehace el video, se vuelve a comprimir con:

```
ffmpeg -i renders/stire-presentacion.mp4 -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart ../../../../frontend-nuxt/public/video/stire-presentacion.mp4
```

y se copian `subtitulos/stire-presentacion.es.vtt` y, si cambió el guion, la transcripción.

## Cómo rehacer la música o los subtítulos

Desde `proyecto/` (requiere Python con numpy y ffmpeg):

```
python herramientas/musica.py musica.wav herramientas/voz_tramos.json ritmo.json
ffmpeg -i musica.wav -b:a 192k assets/musica.mp3
python herramientas/subtitulos.py
```

## Decisiones

- **Voz:** Will, de las voces de fábrica de ElevenLabs. Las voces latinas de su biblioteca no se pueden usar
  por API en la cuenta gratuita; con el modelo v3 se le pidió acento latino neutro y tono de personaje.
- **Ritmo:** voz al 1,1× y 1,6 s de pausa al final de cada escena, para que los gráficos terminen antes de pasar
  a la siguiente.
- **Sin cobros:** voz, efectos y música salieron de cuentas gratuitas o se compusieron por código.
- `STORYLINES.md` quedó como antecedente: se descartó el enfoque de «pitch» por una presentación normal con guion humano.
