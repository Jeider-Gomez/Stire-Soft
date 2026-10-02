# Vistas de la versión actual

Una captura por pantalla de STIRE **tal como está desplegado**, con nombres de archivo que no cambian
de una versión a otra. Al actualizar las capturas en una versión nueva, Git guarda la anterior y
GitHub muestra el cambio de cada pantalla lado a lado (en el commit o en el Pull Request:
*2-up*, *Swipe* u *Onion skin*). Así se ve cómo va cambiando la app sin carpetas por versión.

- **Versión de estas capturas:** `v1.1.0` (2 de octubre de 2026), con la que empieza la prueba del equipo.
- **Cuándo se actualizan:** en el mismo commit que la entrada del `CHANGELOG.md` de cada versión
  (ver `docs/FLUJO_GIT.md`, «Versiones»).
- **Cómo se toman:** las toma Claude Code con un recorrido automático en Chrome (1440 px; las `3x`
  a 375 px, celular) con las cuentas de prueba `@example.com`. El mismo recorrido revisa que
  ninguna pantalla tenga errores de consola, respuestas fallidas del servidor ni desborde a lo ancho.
  El script no está en el repositorio porque usa las contraseñas de esas cuentas.
- Para ver una pantalla en una versión anterior: en GitHub, abrir el archivo → *History*.

| Prefijo | Quién |
|---|---|
| `0x` | Pantallas públicas (inicio, login, registro, recuperar contraseña) |
| `1x`, `2x` | Estudiante |
| `3x` | Estudiante en el celular |
| `4x`, `5x` | Docente |
| `6x` | Administración |

Las carpetas `00-primera-version/` y `05-primera-version-desplegada/` se conservan como estaban:
son el punto de partida.
