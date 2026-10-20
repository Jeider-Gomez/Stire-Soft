# Lo que Jeider puede decir en su pitch

Todo lo de esta lista está comprobado en el repositorio o en producción (18–19/10/2026). Sirve para armar o cambiar el
minuto de Jeider: elegir dos o tres cosas y contarlas con un dato.

- **Minuto en el pitch del grupo** (abre el pitch): [`PITCH_LISTAS_CHEQUEO.md`](./PITCH_LISTAS_CHEQUEO.md) §2 y §3.
- **Minuto aparte, como líder técnico:** [`PITCH_JEIDER_LIDER_TECNICO.md`](./PITCH_JEIDER_LIDER_TECNICO.md).

## 1. Su rol

Líder técnico de STIRE:
- reparte el trabajo;
- revisa lo que entra al código;
- se encarga de que lo publicado funcione: frontend, backend, Tutor con IA y despliegue.

## 2. Lo que hizo y el dato para decirlo

| Qué | Dato para decir | Dónde se comprueba |
|---|---|---|
| **Encuesta SUS dentro de la app** | El equipo le dio **81,5 sobre 100** (5 respuestas), un resultado aceptable. Se puede responder otra vez cada 7 días. | Admin → Encuesta de usabilidad · `docs/calidad/listas-chequeo/2026-10-17_revision_equipo/` |
| **Lo que más bajó el SUS** | La afirmación «necesitaría ayuda de una persona técnica». | `frontend-nuxt/utils/recorridos.ts` (comentario inicial) |
| **Recorrido guiado** | La primera vez que alguien entra a una pantalla, le señala sus partes. Está en **12 pantallas** de estudiante, docente y administrador, y se repite con el botón **«?»**. | https://stire-soft.vercel.app |
| **Voz con el Tutor** | En Chrome y en el celular se le dicta la pregunta. En Brave, que no trae dictado, STIRE graba y lo pasa a texto **sin guardar el audio**. | Botón del micrófono en el chat del Tutor |
| **Manual de usuario** | Está dentro de STIRE, se abre **sin cuenta** y se **descarga en PDF**, con la identidad visual. | https://stire-soft.vercel.app/ayuda |
| **Versión 2.0** | La cerró el **17 de octubre**. | Etiqueta `v2.0.0` en GitHub |
| **Perfil de aprendizaje** | Completa el criterio MOD-02. Fue una propuesta de Pedro. | «Mi progreso» del estudiante |
| **Accesibilidad** | Una auditoría automática encontró **196 problemas en 78 vistas** de computador y celular. Se corrigieron todos. | `docs/calidad/auditorias/ACCESIBILIDAD_E_INCLUSION_2026-10-07.md` |
| **Código ordenado** | Antes, **31 de 40 pantallas** pedían sus datos directamente; hoy ninguna, y una prueba automática lo revisa. | `docs/DISENO_ARQUITECTURA_FRONTEND.md` |
| **Calidad** | **2258 pruebas automáticas**, todas en verde. | `npm test` |
| **Despliegue** | La app está en línea, **sin costo**: el servidor en Azure y la página en Vercel. | https://stire-soft.vercel.app |
| **Artículo científico** | Un borrador de **6 páginas** en el formato de la revista de la Universidad (*Acta Scientiæ Informaticæ*), con 14 referencias verificadas. | `docs/curso-ddse3/articulo/STIRE_Articulo.pdf` |
| **Revisión del dossier de repetición espaciada** | Comprobó que STIRE aplica el algoritmo SM-2 completo y encontró **6 referencias con errores** en el dossier. | `docs/investigacion/REVISION_DOSSIER_REPETICION_ESPACIADA.md` |
| **Repositorio citable** | GitHub ya muestra el botón «Cite this repository». | `CITATION.cff` |

## 3. Datos del grupo que sirven para abrir

| Dato | Cuidado al decirlo |
|---|---|
| El 4 de octubre: **62 % en interfaz y 58 % en tutores inteligentes**. | Esa primera revisión la hizo **el equipo con apoyo de la IA**, no la IA sola. |
| Cuando **una IA revisó la versión 2.0**, fue **más generosa que el equipo en 9 de 28 criterios**. Por eso la nota oficial es la del equipo como usuario. | Es el gancho más fuerte del pitch. |
| Después de las correcciones: **interfaz 100 %** y **tutores 95,8 %**. Llega a 100 % si Pedro confirma MOD-02. | Mejor dejárselo a Pedro, que cierra con los resultados. |

## 4. Lo que no conviene decir todavía

- **Que se probó con estudiantes:** la prueba piloto aún no se ha hecho; solo lo probó el equipo.
- **Que el micrófono funciona en Brave**, sin haberlo probado antes desde la pantalla (la grabación solo se probó contra el servidor).
- **Que cumple WCAG 2.2:** lo correcto es «auditado con una herramienta automática». Falta la prueba con lector de pantalla.
- **Que el Tutor se usa mucho:** el 12 de octubre solo 4 de 17 cuentas tenían su clave de Gemini.

## 5. Cómo armar el minuto

| Parte | Tiempo | Qué va |
|---|---|---|
| **[HOOK]** | 0:00–0:10 | Qué es STIRE y de qué trata el pitch. |
| **[PROBLEM]** | 0:10–0:25 | El 62 y 58 %, y que la IA fue más generosa en 9 de 28. |
| **[SOLUTION]** | 0:25–0:50 | Dos cosas tuyas con su dato. Por ejemplo, el SUS (81,5 y «ayuda técnica») y el recorrido guiado o la voz. |
| **[CIERRE]** | 0:50–1:00 | Le das la palabra a José, Jorge, Julio y Pedro. |

Son unas 130 a 150 palabras, en primera persona y sin frases de anuncio.
