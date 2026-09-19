# Material visual del proyecto

Capturas reales del sistema funcionando, tomadas probando STIRE como lo haría un usuario, y las
notas de hallazgos de UX que salen de esa prueba. Sirve como material de referencia para todo el
equipo (tutoriales, presentaciones, bitácoras) sin tener que volver a levantar el sistema.

## Estructura

Una carpeta por módulo, en el orden en que se van probando:

| Carpeta | Módulo | Semana |
|---|---|---|
| [`01-tutor-ia/`](./01-tutor-ia/) | Tutor IA | 6 |
| [`02-estudiante/`](./02-estudiante/) | Flujo del estudiante | 7 |
| [`03-docente/`](./03-docente/) | Flujo del docente | 8 |
| [`04-admin/`](./04-admin/) | Panel de administrador | 9 |

## Convención

- **Capturas:** `NN_descripcion-corta.png` (ej. `01_saludo-proactivo.png`, `02_tarjeta-practica.png`),
  numeradas en el orden en que ocurre el flujo.
- **Una nota por módulo:** `HALLAZGOS.md` dentro de su carpeta, con qué se probó, qué confundió o se
  sintió incómodo, y qué se vio funcionando bien. Cada hallazgo referencia la captura que lo muestra.
- **Solo lo que se vio de verdad:** nada de maquetas ni de lo que "debería" verse. Si algo no
  funciona, la captura del error es evidencia igual de valiosa.
- **No subir datos sensibles:** ni contraseñas, ni tokens, ni correos que no sean de las cuentas demo
  del `README.md` raíz.
