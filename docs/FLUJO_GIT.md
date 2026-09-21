# Flujo de trabajo con Git

Guía corta para que el equipo suba cambios sin pisarse. Complementa las reglas de commits y push
de [`../CLAUDE.md`](../CLAUDE.md). Está pensada para 4 o 5 personas y varias IA trabajando sobre
el mismo repositorio, sin agregar ceremonia que nadie vaya a cumplir.

## La idea en una línea

**`main` siempre funciona. Todo trabajo que dure más de un rato va en una rama corta con nombre
de tarea, y vuelve a `main` cuando está terminado.** No hay rama `dev`.

## Por qué no usar una rama `dev`

- Con un integrador y pocas personas, `dev` obliga a hacer cada cambio dos veces (a `dev` y luego
  a `main`) y las dos ramas terminan divergiendo. Es justo el problema que se quiere evitar.
- Una rama de larga vida acumula conflictos. Una rama por tarea los mantiene pequeños.
- Lo que `dev` intenta dar (un lugar donde probar sin romper `main`) lo da una rama por tarea.

Si alguien ya creó `dev` en su máquina y no la ha subido, basta renombrarla:
`git branch -m dev feat/identidad-visual`.

## Nombres de rama

`tipo/descripcion-corta`, en minúsculas y con guiones.

| Tipo | Para qué | Ejemplo |
|---|---|---|
| `feat/` | Algo nuevo que se ve o se usa | `feat/identidad-visual` |
| `fix/` | Corregir un error | `fix/login-redireccion` |
| `qa/` | Reportes y evidencia de pruebas | `qa/reporte-semana-6` |
| `docs/` | Solo documentación | `docs/bitacora-06` |

Se borra la rama en cuanto entra a `main` (ver "Limpieza").

## El ciclo de cada cambio

```bash
git checkout main
git pull                              # 1. partir siempre de lo último
git checkout -b feat/mi-tarea         # 2. rama nueva
# ...trabajar, y guardar seguido...
git add <archivos>
git commit -m "feat: mensaje claro"
git push -u origin feat/mi-tarea      # 3. subir la rama (no main)
```

Al terminar, se abre un **Pull Request** hacia `main` en GitHub (botón verde que aparece solo
tras el push) y se elige **Squash and merge**: toda la rama entra como un solo commit limpio.
Alguien que no sea quien lo escribió lo mira antes de unirlo.

### Si la tarea dura varios días

Cada uno o dos días, traer lo nuevo de `main` a la rama, para que la diferencia nunca crezca:

```bash
git fetch origin
git merge origin/main                 # si hay conflicto, se resuelve aquí, con calma
```

Se usa `merge` y no `rebase`: `rebase` reescribe el historial y obliga a forzar el push, que es
donde más se pierde trabajo.

## Cómo evitar conflictos

Un conflicto aparece cuando dos personas cambian **las mismas líneas** de un archivo. Se evita
repartiendo el territorio, no con más procesos.

| Territorio | Quién lo toca | Regla |
|---|---|---|
| `src/` (backend) y `test/` | Backend / Claude Code / Codex | Rama propia o directo a `main` si es pequeño |
| `frontend-nuxt/` funcionalidad (componentes, stores, composables) | Frontend funcional / Antigravity | No reestilar componentes mientras haya una rama de identidad visual abierta |
| `frontend-nuxt/tailwind.config.ts` y `assets/css/main.css` | Identidad visual | Es el único punto de entrada del estilo: cambiar **tokens** (colores, tipografías, espaciados) primero, componentes después |
| `docs/ReportesQA/` | QA | Los archivos nuevos casi nunca chocan; ir directo a `main` sirve |
| `MONITOREO_SEMANAL.md` | Todos | Es donde ya hubo que resolver conflictos a mano al integrar ediciones hechas desde la web de GitHub. Cada quien edita solo su bloque, hace `git pull` antes de abrirlo y sube apenas termine |

Otras costumbres que ayudan:

- `git pull` antes de empezar a trabajar y antes de subir.
- Commits pequeños y frecuentes: un conflicto en 20 líneas se resuelve en un minuto; en 800, no.
- No mezclar en un mismo commit formato masivo y cambios reales.
- Editar en la web de GitHub solo cambios de una línea; para lo demás, la rama en local.

## Cambiar la identidad visual sin romper lo que ya funciona

Es el caso donde más se puede chocar: reestilar toca muchos archivos `.vue`, y la parte
funcional del frontend también los toca.

1. La versión actual queda marcada con el tag `v1.0.0-beta.1` (ver abajo). Pase lo que pase con la
   rama, la identidad original siempre se puede volver a ver y comparar.
2. La identidad visual trabaja en `feat/identidad-visual`, partiendo de ese punto.
3. Orden dentro de la rama: primero `tailwind.config.ts` y `assets/css/main.css` (tokens), luego
   componentes compartidos (`components/`), y al final cada página.
4. Mientras esa rama esté abierta, el trabajo funcional del frontend se acuerda antes de empezar
   para no editar los mismos componentes a la vez. Las Fases 18 a 20 del Tutor ya están en `main`,
   así que hoy el terreno está despejado.
5. Se une a `main` con Pull Request. Si algo sale mal, `git revert` del merge devuelve todo.

## Versiones: registrar la primera

Un **tag** es una etiqueta permanente sobre un commit. Sirve para decir "así estaba el sistema
en este momento" sin crear una rama que haya que mantener.

| Tag | Qué marca |
|---|---|
| `v0.1.0-READY` | Primera marca, del 23 de mayo |
| `v1.0.0-beta.1` | Primera versión completa: backend, frontend y Tutor con clave de Google AI Studio, con la identidad visual original |

Se usa `beta` a propósito: las funciones están completas, pero el camino feliz del Tutor con una
clave real de Google todavía no se ha verificado. Cuando eso se cierre, la versión pasa a `v1.0.0`.

```bash
git tag -a v1.0.0-beta.1 -m "Primera version completa (identidad visual original)"
git push origin v1.0.0-beta.1
```

Para ver el sistema tal como estaba, sin tocar tu carpeta de trabajo:

```bash
git worktree add ../stire-v1 v1.0.0-beta.1
```

Las capturas de esa versión van en [`material-visual/`](./material-visual/) y conviene adjuntarlas
también a un **Release** de GitHub (pestaña Releases → *Draft a new release* → elegir el tag).

## Limpieza

Una rama ya unida a `main` no tiene motivo para seguir viva; todo su contenido ya está en `main`.

1. En GitHub: *Settings → General → Pull Requests → Automatically delete head branches*. Así se
   borra sola al unir el Pull Request.
2. Para revisar qué ramas ya están unidas: `git branch -r --merged origin/main`.
3. Borrar una remota: `git push origin --delete nombre-de-rama`.
4. Borrar una local: `git branch -d nombre-de-rama` (con `-d`, git se niega si quedara algo sin
   unir; nunca usar `-D` sin mirar antes).
5. Las carpetas de trabajo extra (`git worktree list`) se retiran con `git worktree remove <ruta>`.

## Proteger `main` en GitHub

*Settings → Branches → Add rule* sobre `main`, marcando solo lo mínimo:

- **Restrict deletions** y **Block force pushes**: nadie puede borrar `main` ni reescribir su
  historial por accidente.
- No exigir revisiones obligatorias por ahora: con un integrador que sube directo, bloquearía su
  propio flujo. Se puede activar más adelante si el equipo crece.
