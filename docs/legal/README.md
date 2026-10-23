# Documentos legales y de consentimiento de STIRE (borradores)

**Decisión del 22/10/2026:** STIRE es para personas de 18 años o más. Ya están en la app:
- los **términos** y la **política de datos** para adultos (`frontend-nuxt/utils/legal.ts`, páginas `/terminos` y
  `/privacidad`);
- la **confirmación de edad** al registrarse;
- la decisión sobre la **investigación**, en el registro y en el perfil.

La autorización del acudiente y el asentimiento quedan como borradores para un uso futuro en colegios.

**Estado:** borradores del 22/10/2026 para revisar con el comité de ética de la Universidad de Córdoba y, si es
posible, con alguien de derecho. **Ninguno está publicado en la app todavía.** Los campos entre `[corchetes]` se llenan
antes de usarlos.

**Por qué existen:** la evaluación heurística del 22/10 y el plan `docs/PLAN_MENORES_Y_TRANSVERSALIDAD.md`. STIRE recoge
datos personales y hoy no tiene política de tratamiento, ni para adultos ni para menores, y el Tutor envía preguntas a
Google. Normas base:
- Ley 1581 de 2012;
- Decreto 1377 de 2013, arts. 5 a 9 y 12 a 16;
- Resolución 8430 de 1993, arts. 11, 16, 25 y 26, como referencia para la investigación.

## 1. Los cinco documentos y quién firma cada uno

| Documento | Para qué | Quién acepta | Cuándo |
|---|---|---|---|
| [`POLITICA_TRATAMIENTO_DATOS.md`](POLITICA_TRATAMIENTO_DATOS.md) | Qué datos recoge STIRE, para qué, con quién los comparte y cómo reclamar (Decreto 1377, art. 13) | Nadie la firma: se publica en `/privacidad` y se enlaza en todo lo demás | Siempre visible |
| [`TERMINOS_Y_CONDICIONES.md`](TERMINOS_Y_CONDICIONES.md) | Reglas de uso de la plataforma y del Tutor con IA | El adulto (18 o más) o el acudiente del menor. Un menor no puede obligarse solo en un contrato | Al crear la cuenta |
| [`AUTORIZACION_ACUDIENTE.md`](AUTORIZACION_ACUDIENTE.md) | Autorización del representante legal para tratar los datos del menor, con casillas separadas | Madre, padre o acudiente | Antes de activar las funciones con datos del menor |
| [`ASENTIMIENTO_ESTUDIANTE.md`](ASENTIMIENTO_ESTUDIANTE.md) | El menor dice si quiere participar, en lenguaje de noveno grado: su «derecho a ser escuchado» (art. 12) | El estudiante menor | En su primera entrada |
| [`CONSENTIMIENTO_INVESTIGACION.md`](CONSENTIMIENTO_INVESTIGACION.md) | Participar en la investigación: qué se mide, riesgos, beneficios, retiro (Res. 8430, art. 15) | El adulto, o el acudiente más el asentimiento del menor | Antes del piloto |

Usar STIRE para estudiar y participar en la investigación **son dos cosas distintas**: se puede usar STIRE sin entrar al
estudio, y sin ninguna desventaja en la clase.

## 2. Cómo funciona dentro de STIRE (flujo propuesto)

```
Registro
  ├─ ¿Tienes 18 años o más?  ── Sí ─▶ acepta Términos + Política (casilla, con versión) ─▶ cuenta activa
  │                                    └─ Consentimiento de investigación (opcional, aparte)
  └─ No ─▶ escribe el correo de su acudiente ─▶ cuenta «en espera»: puede estudiar lecciones y ejercicios,
                                                 sin Tutor con IA, sin voz ni foto, sin datos para investigación
           │
           ▼
   Correo al acudiente con enlace único ─▶ página /autorizacion/:token
           │   lee la Política y los Términos en lenguaje claro
           │   marca cada casilla por separado (ninguna viene marcada)
           ▼
   Primera entrada del estudiante ─▶ Asentimiento (lo lee y decide él)
           │
           ▼
   Se activa solo lo que acudiente Y estudiante aceptaron
```

**Respaldo en papel:** si el colegio exige el acta firmada, el docente la sube en el panel de la clase y marca qué
casillas autorizó el acudiente. STIRE guarda el archivo como prueba (Decreto 1377, art. 8).

## 3. Qué se guarda como prueba (modelo de datos propuesto)

Tabla `autorizaciones`, una fila por persona, documento y versión:

| Campo | Ejemplo |
|---|---|
| `usuarioId` | el estudiante |
| `documento` | `terminos`, `politica`, `autorizacion_acudiente`, `asentimiento`, `investigacion` |
| `versionTexto` | `2026-11-01` (el texto exacto se conserva: art. 16) |
| `otorgadaPor` | `titular`, `acudiente`, `docente_acta_papel` |
| `nombreAcudiente`, `correoAcudiente`, `parentesco` | solo si aplica |
| `casillas` | JSON: `{ plataforma: true, investigacion: false, tutorIA: true, voz: false, foto: false }` |
| `medio` | `enlace_correo`, `casilla_registro`, `acta_papel` |
| `archivoActaId` | si se subió el papel |
| `fecha`, `ip` | cuándo y desde dónde (art. 8) |
| `revocadaEn` | si la retiró (art. 9) |

Reglas que se prueban con tests automáticos:
1. Ninguna casilla viene marcada por defecto. El silencio no autoriza (art. 7).
2. Si `casillas.tutorIA` es falso, o el usuario es menor, el servidor no llama a la API de Gemini (plan, fase B).
3. Si `casillas.investigacion` es falso, sus datos no salen en la exportación para investigación.
4. Al cambiar la versión de un texto, se pide aceptar de nuevo antes de seguir (art. 13, último inciso).
5. Revocar desactiva lo que dependía de esa casilla de inmediato.

## 4. Antes de usarlos

- [ ] Definir el **Responsable del tratamiento** (¿la Universidad de Córdoba, el grupo de investigación, el proyecto?),
      su dirección, correo y teléfono.
- [ ] Revisión del comité de ética: ¿aplica la Res. 8430 y su art. 25 (certificado de psicólogo) a una investigación
      educativa?
- [ ] Decidir el proveedor del Tutor para menores (plan, B3).
- [ ] Convertir los textos en páginas de STIRE (`/privacidad`, `/terminos`, `/autorizacion/:token`) con su prueba.
- [ ] Guardar el texto de cada versión publicada.
