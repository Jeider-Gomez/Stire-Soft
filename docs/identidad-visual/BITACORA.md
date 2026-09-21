# Bitácora de cambios visuales

Aquí anota José **cada cambio que hace**, en una línea por cambio. Sirve para tres cosas: que el resto del
equipo sepa qué se tocó y por qué, que se pueda **volver atrás con precisión** (cada fila apunta a su commit)
y que no haya conflictos con quien trabaja en lo funcional.

Es un archivo **solo de José**. Así no choca con `MONITOREO_SEMANAL.md`, que edita todo el equipo. Al cerrar la
semana, quien lleva la bitácora general copia de aquí un resumen de tres líneas.

## Cómo se usa

1. Al **empezar** una rama o una pantalla: agrega la fila en «Cambios» con estado `en curso` y anota los
   archivos en «Archivos en obra».
2. Al **terminar** (commit hecho): completa el commit y cambia el estado a `listo para revisar`.
3. Cuando el dueño del proyecto lo apruebe (o lo pida revertir): estado `aprobado` o `revertido`, con la fecha.
4. Al unir la rama a `main`, quita sus archivos de «Archivos en obra».

Estados: `en curso` · `listo para revisar` · `aprobado` · `revertido`.

## Archivos en obra

Lo que José está reestilando ahora mismo. **Quien vaya a hacer un cambio funcional en uno de estos archivos
avisa primero** (o lo hace en una rama corta y lo une antes de que José avance); así los dos trabajos no
editan las mismas líneas. Ver «Trabajar en paralelo» en el [`README`](./README.md) §6.

| Archivo | Quién | Desde | Rama |
|---|---|---|---|
| _(ninguno por ahora)_ | | | |

## Cambios

| Fecha | Rama | Commit | Qué cambió | Pantallas | Por qué | Estado |
|---|---|---|---|---|---|---|
| 21/09 | `main` (directo) | `7e9f314` | Paleta `stire-*` en `tailwind.config.ts`; encabezado (`HeaderNav.vue`, con botón «Tutor IA» y menú de usuario) y panel docente `DOC-V01` | Encabezado de todos los roles; `/docente` | Primer avance de la identidad institucional | `listo para revisar` (observaciones en el README §5; el dueño indicó que algunos cambios en la parte del Tutor no le gustaron, probablemente el botón «Tutor IA» del encabezado: por confirmar) |
| | | | | | | |

### Modelo para una fila nueva

```
| 22/09 | feat/identidad-tokens | a1b2c3d | Fondo y texto de la página con la paleta nueva | todas | Base de la etapa 1 | en curso |
```

Un commit por pantalla o componente, con el nombre de la pieza en el mensaje (`feat(identidad): panel del Tutor`),
para que cada fila de esta tabla tenga **su propio commit** y se pueda deshacer sola:

```bash
git checkout <commit-anterior> -- ruta/del/archivo.vue    # recupera solo ese archivo
git revert <commit>                                       # o cancela el commit entero
```
