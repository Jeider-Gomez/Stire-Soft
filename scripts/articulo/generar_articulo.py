"""Artículo de STIRE sobre la plantilla de Acta Scientiæ Informaticæ (U3 del plan de curso DDSE3).

Llena el Word de la revista conservando su diseño (Times New Roman, dos columnas, pie de página) y quita lo del ejemplo:
textos, figuras, correos y ORCID de otros autores, y los comentarios de la revisora.

Uso:
    python scripts/articulo/generar_articulo.py RUTA/Formato-Revista_Acta_S_Informaticae.docx

La plantilla no se sube al repositorio (trae correos de otras personas). El resultado queda en
docs/curso-ddse3/articulo/STIRE_Articulo_E1_esquema.docx. Lo que va entre [[ ]] sale resaltado en amarillo: falta.
"""
import copy
import re
import sys
from pathlib import Path

import docx
from docx.enum.text import WD_COLOR_INDEX
from docx.oxml.ns import qn
from docx.shared import Cm

RAIZ = Path(__file__).resolve().parents[2]
CARPETA = RAIZ / 'docs' / 'curso-ddse3' / 'articulo'
SALIDA = CARPETA / 'STIRE_Articulo_E1_esquema.docx'

TITULO = 'STIRE: sistema tutor inteligente con repetición espaciada para el aprendizaje de Fundamentos de Algoritmia'
TITULO_CORTO = 'STIRE: tutor inteligente con repetición espaciada'
AUTORES = 'Jeider Jair Gómez Oviedo¹, Pedro Gabriel Romero Mendivil¹, José López¹, Julio Galvis¹, Jorge Cervantes¹'
AFILIACION = ('¹ Licenciatura en Informática, Facultad de Educación y Ciencias Humanas, Universidad de Córdoba, Montería, '
              'Colombia. [[Correo institucional y ORCID de cada autor; nombres completos de José, Julio y Jorge]]')

# Cada sección: (tipo, contenido). Tipos: h = título de sección, s = subtítulo, p = párrafo, fig = figura,
# cap = leyenda, tabla = tabla, ref = referencia. *cursiva*, **negrita**, [[pendiente]].
CUERPO = [
    ('h', 'RESUMEN'),
    ('p', 'Los estudiantes que inician la Licenciatura en Informática de la Universidad de Córdoba olvidan con rapidez lo '
          'aprendido en Fundamentos de Algoritmia antes de usarlo en temas más complejos, y el docente tiene poco tiempo para '
          'acompañar a cada uno. Este trabajo presenta el diseño, el desarrollo y la evaluación preliminar de STIRE, un '
          'sistema tutor inteligente web que combina lecciones con ejercicios calificados automáticamente, un tutor '
          'conversacional con inteligencia artificial que guía sin entregar la respuesta y un calendario de repasos basado '
          'en el algoritmo de repetición espaciada SM-2. El desarrollo siguió la metodología MODESEC en iteraciones '
          'semanales durante el periodo 2026-2. La evaluación aplicó dos listas de chequeo, una de interfaz gráfica y otra '
          'de sistemas tutores inteligentes, antes y después de las mejoras, y la escala de usabilidad SUS. El cumplimiento '
          'de la lista de interfaz pasó de 62,5 % a 100 % y el de la lista de tutores inteligentes, de 58,3 % a 95,8 %; el '
          'equipo calificó la usabilidad con 81,5 puntos sobre 100. Los resultados son parciales: falta la prueba piloto '
          'con estudiantes, prevista para noviembre de 2026.'),
    ('p', '**PALABRAS CLAVES:** aprendizaje de la programación; repetición espaciada; sistemas tutores inteligentes; '
          'software educativo; usabilidad.'),
    ('h', 'ABSTRACT'),
    ('p', '*First-year students in the Computer Science Education program at the University of Córdoba quickly forget what '
          'they learn in Fundamentals of Algorithms before applying it to more complex topics, and instructors have little '
          'time to support each student. This paper presents the design, development, and preliminary evaluation of STIRE, '
          'a web-based intelligent tutoring system that combines lessons with automatically graded exercises, an AI '
          'conversational tutor that guides without giving away the answer, and a review schedule based on the SM-2 spaced '
          'repetition algorithm. Development followed the MODESEC methodology in weekly iterations during the 2026-2 term. '
          'The evaluation applied two checklists, one for the graphical interface and one for intelligent tutoring systems, '
          'before and after the improvements, together with the System Usability Scale. Compliance with the interface '
          'checklist rose from 62.5% to 100%, and with the intelligent tutoring checklist from 58.3% to 95.8%; the team '
          'rated usability at 81.5 out of 100. These results are partial: a pilot test with students is scheduled for '
          'November 2026.*'),
    ('p', '**KEY WORDS:** educational software; intelligent tutoring systems; programming learning; spaced repetition; '
          'usability.'),

    ('h', 'I. INTRODUCCIÓN'),
    ('p', 'Aprender a programar exige recordar y aplicar conceptos que se acumulan semana a semana: una variable mal '
          'entendida dificulta los condicionales, y estos, los ciclos. [[Dato de pérdida o repitencia de Fundamentos de '
          'Algoritmia en la Universidad de Córdoba, con su fuente.]] En grupos numerosos, el docente no alcanza a '
          'acompañar a cada estudiante en el momento en que se equivoca.'),
    ('p', 'La investigación ofrece tres respuestas a este problema. Los sistemas tutores inteligentes que guían paso a '
          'paso logran efectos cercanos a los de la tutoría humana (VanLehn, 2011). Repartir la práctica en el tiempo '
          'retiene mejor que concentrarla en una sola sesión (Cepeda et al., 2006), y resolver una prueba fortalece la '
          'memoria más que volver a estudiar el material (Roediger y Karpicke, 2006). Además, la retroalimentación es más '
          'útil cuando es inmediata y dice qué mejorar (Hattie y Timperley, 2007).'),
    ('p', 'Estas ideas rara vez llegan juntas a un curso local de algoritmia. Por eso, el objetivo de este trabajo fue '
          '**desarrollar y evaluar STIRE, un sistema tutor inteligente web con repetición espaciada, para apoyar el '
          'aprendizaje de Fundamentos de Algoritmia en la Licenciatura en Informática de la Universidad de Córdoba.**'),

    ('h', 'II. METODOLOGÍA Y DESARROLLO'),
    ('s', 'A. Diseño metodológico'),
    ('p', 'Se trata de una investigación aplicada de desarrollo tecnológico. El software se construyó con la metodología '
          'MODESEC, que organiza el diseño de software educativo a partir de las competencias que se quieren desarrollar '
          '(Caro Piñeres et al., 2009), en iteraciones semanales con un equipo de cinco estudiantes. El trabajo se '
          'realizó en la Universidad de Córdoba, en Montería, entre agosto y noviembre de 2026, dentro del curso Diseño '
          'y Desarrollo de Software Educativo III. El curso objetivo es Fundamentos de Algoritmia (plan de curso 203413).'),
    ('s', 'B. Arquitectura y documentación del software'),
    ('p', 'STIRE separa el cliente web del servidor (Figura 1). El cliente usa Nuxt 3, Vue 3 y Pinia, cumple las pautas '
          'de accesibilidad WCAG 2.2 (World Wide Web Consortium [W3C], 2023) y se publica en Vercel. El servidor usa NestJS '
          'y TypeORM sobre una base de datos MariaDB, corre en contenedores Docker en una máquina virtual y ofrece una API '
          'REST documentada con OpenAPI. Hay tres roles: estudiante, docente y administrador.'),
    ('fig', 'figuras/figura1_arquitectura.png'),
    ('cap', 'Figura 1. Arquitectura de STIRE y sus módulos.'),
    ('p', 'El servidor sigue los módulos clásicos de un sistema tutor inteligente. El **módulo del dominio** guarda los '
          'cursos en módulos, temas y lecciones, con siete tipos de ejercicio que se califican automáticamente. El '
          '**módulo del estudiante** estima el dominio de cada lección de 0 a 100 %; desde 85 % la lección queda dominada. '
          'El **módulo pedagógico** programa los repasos y recomienda el siguiente paso. El **tutor con IA** conversa con '
          'el estudiante por texto o por voz y le da preguntas y pistas, no la solución; usa el modelo Gemini con la clave '
          'propia de cada estudiante.'),
    ('s', 'C. Repetición espaciada'),
    ('p', 'Los repasos siguen el algoritmo SM-2 (Woźniak y Gorzelańczyk, 1994) con una adaptación al semestre: el primer '
          'repaso llega al día siguiente y el segundo a los tres días, en lugar de seis, para que ambos caigan en la misma '
          'semana de clase. Desde el tercero, el intervalo se multiplica por un factor de facilidad que empieza en 2,5, '
          'cambia con cada resultado y nunca baja de 1,3. La calidad del repaso sale del resultado del ejercicio: si falla, '
          'el intervalo vuelve a un día; si acierta tras varios intentos, el factor baja; si acierta al primer intento, se '
          'mantiene, y si además se declaró seguro, sube. Ningún intervalo supera 60 días (Tabla 2).'),
    ('s', 'D. Evaluación'),
    ('p', 'Se aplicaron dos listas de chequeo entregadas por el docente del curso: una de interfaz gráfica, basada en '
          'Pressman y Maxim (2019), con 32 criterios, y otra de sistemas tutores inteligentes con 24 criterios [[referencia '
          'de la lista de tutores inteligentes]]. Se aplicaron el 4 de octubre de 2026 y, tras las mejoras, el 17 de '
          'octubre; en la segunda, cada integrante revisó sus criterios como usuario. La usabilidad se midió con la escala '
          'SUS (Brooke, 1996), interpretada con los rangos de Bangor et al. (2008). [[Prueba piloto con estudiantes de '
          'Fundamentos de Algoritmia: participantes, tareas e instrumentos (Reto 5, 3 a 5 de noviembre).]] El uso de '
          'asistentes de inteligencia artificial en el desarrollo y en la redacción se declara conforme a las pautas de '
          'ética en la comunicación científica (Giraldo Cardozo y Muñoz Vargas, 2025).'),

    ('h', 'III. RESULTADOS Y DISCUSIÓN'),
    ('s', 'A. El software'),
    ('p', 'STIRE está desplegado en https://stire-soft.vercel.app con dos cursos cargados. La Figura 2 muestra la '
          'interfaz del estudiante: el inicio indica el siguiente paso y el avance del curso (a); el ejercicio presenta el '
          'enunciado y se califica al entregarlo (b), y «Mi progreso» muestra el dominio de cada lección y los repasos '
          'pendientes (c).'),
    ('fig', 'figuras/figura2_interfaz_estudiante.png'),
    ('cap', 'Figura 2. Interfaz del estudiante en STIRE: (a) inicio con el siguiente paso, (b) ejercicio, (c) progreso y '
            'repasos.'),
    ('s', 'B. Listas de chequeo'),
    ('p', 'La Tabla 1 compara las dos aplicaciones. Una primera evaluación hecha con inteligencia artificial fue más '
          'generosa que la del equipo en 9 de 28 criterios, por lo que se tomó como oficial la revisión hecha por '
          'personas como usuarios. [[Qué criterios cambiaron y por qué, con ejemplos de la interfaz.]]'),
    ('cap', 'Tabla 1. Cumplimiento de las listas de chequeo antes y después de las mejoras'),
    ('tabla1', None),
    ('s', 'C. Usabilidad'),
    ('p', 'Cinco integrantes del equipo respondieron la escala SUS dentro de la aplicación, con un promedio de 81,5, '
          'dentro del rango aceptable según Bangor et al. (2008). Al ser los propios desarrolladores, el dato sirve como '
          'referencia y no reemplaza la prueba con estudiantes. [[Resultados de la prueba piloto.]]'),
    ('s', 'D. Repetición espaciada'),
    ('cap', 'Tabla 2. Días hasta cada repaso según el resultado del estudiante'),
    ('tabla2', None),
    ('p', 'Con resultados siempre buenos, los intervalos coinciden con la progresión de SM-2 (Woźniak y Gorzelańczyk, '
          '1994); con resultados difíciles crecen más despacio, y un fallo reinicia el ciclo. Esto aplica la práctica '
          'distribuida (Cepeda et al., 2006) mediante ejercicios, que además actúan como práctica de recuperación '
          '(Roediger y Karpicke, 2006). SM-2 usa reglas fijas; los modelos que aprenden de los datos de cada estudiante '
          'pueden programar mejor los repasos (Tabibian et al., 2019).'),

    ('h', 'IV. CONCLUSIONES'),
    ('p', 'STIRE reúne en un mismo software tres apoyos que la literatura respalda por separado: el acompañamiento paso a '
          'paso de un tutor, la retroalimentación inmediata y la práctica espaciada. Las listas de chequeo muestran una '
          'mejora clara de la interfaz y de las funciones de tutoría entre las dos evaluaciones. Las principales '
          'limitaciones son que la usabilidad la midió el propio equipo y que aún falta comprobar el efecto en el '
          'aprendizaje con estudiantes. Como trabajo futuro se proponen el repaso intercalado de varias lecciones y un '
          'programador de repasos que aprenda de los datos. [[Ajustar con los resultados de la prueba piloto.]]'),

    ('h', 'V. REFERENCIAS'),
    ('ref', 'Bangor, A., Kortum, P. T., y Miller, J. T. (2008). An empirical evaluation of the System Usability Scale. '
            '*International Journal of Human–Computer Interaction, 24*(6), 574–594. https://doi.org/10.1080/10447310802205776'),
    ('ref', 'Brooke, J. (1996). SUS: A «quick and dirty» usability scale. En P. W. Jordan, B. Thomas, B. A. Weerdmeester y '
            'I. L. McClelland (Eds.), *Usability evaluation in industry* (pp. 189–194). Taylor & Francis.'),
    ('ref', 'Caro Piñeres, M. F., Toscano Miranda, R. E., Hernández Rozo, F. M., y David Lobo, M. E. (2009). Diseño de '
            'software educativo basado en competencias. *Ciencia e Ingeniería Neogranadina, 19*(1), 71–98. '
            'https://doi.org/10.18359/rcin.311'),
    ('ref', 'Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., y Rohrer, D. (2006). Distributed practice in verbal recall '
            'tasks: A review and quantitative synthesis. *Psychological Bulletin, 132*(3), 354–380. '
            'https://doi.org/10.1037/0033-2909.132.3.354'),
    ('ref', 'Giraldo Cardozo, J. C., y Muñoz Vargas, I. C. (2025). Comunicación científica y ética en la era de la '
            'inteligencia artificial. *Acta Scientiæ Informaticæ, 9*(2). https://doi.org/10.21897/26192659.4189'),
    ('ref', 'Hattie, J., y Timperley, H. (2007). The power of feedback. *Review of Educational Research, 77*(1), 81–112. '
            'https://doi.org/10.3102/003465430298487'),
    ('ref', 'Pressman, R. S., y Maxim, B. R. (2019). *Software engineering: A practitioner\'s approach* (9.ª ed.). '
            'McGraw-Hill Education.'),
    ('ref', 'Roediger, H. L., y Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term '
            'retention. *Psychological Science, 17*(3), 249–255. https://doi.org/10.1111/j.1467-9280.2006.01693.x'),
    ('ref', 'Tabibian, B., Upadhyay, U., De, A., Zarezade, A., Schölkopf, B., y Gomez-Rodriguez, M. (2019). Enhancing '
            'human learning via spaced repetition optimization. *Proceedings of the National Academy of Sciences, 116*(10), '
            '3988–3993. https://doi.org/10.1073/pnas.1815156116'),
    ('ref', 'VanLehn, K. (2011). The relative effectiveness of human tutoring, intelligent tutoring systems, and other '
            'tutoring systems. *Educational Psychologist, 46*(4), 197–221. https://doi.org/10.1080/00461520.2011.611369'),
    ('ref', 'World Wide Web Consortium. (2023). *Web Content Accessibility Guidelines (WCAG) 2.2*. '
            'https://www.w3.org/TR/WCAG22/'),
    ('ref', 'Woźniak, P. A., y Gorzelańczyk, E. J. (1994). Optimization of repetition spacing in the practice of learning. '
            '*Acta Neurobiologiae Experimentalis, 54*(1), 59–62. https://doi.org/10.55782/ane-1994-1003'),
]

TABLA1 = [
    ['Lista de chequeo', 'Antes (4 oct. 2026)', 'Después (17 oct. 2026)'],
    ['Interfaz gráfica (32 criterios)', '20 (62,5 %)', '32 (100 %)'],
    ['Sistemas tutores inteligentes (24 criterios)', '14 (58,3 %)', '23 (95,8 %)'],
]
TABLA2 = [
    ['Resultado en cada repaso', 'Repasos 1 a 6 (días)'],
    ['Bien (al primer intento)', '1 · 3 · 8 · 20 · 50 · 60'],
    ['Difícil (varios intentos)', '1 · 3 · 6 · 12 · 22 · 37'],
    ['Falla', 'vuelve a 1 día'],
]


def escribir(parrafo, texto, base_rpr):
    """Agrega el texto con *cursiva*, **negrita** y [[pendiente]] (resaltado), con la letra del párrafo modelo."""
    for trozo in re.split(r'(\*\*[^*]+\*\*|\*[^*]+\*|\[\[[^\]]+\]\])', texto):
        if not trozo:
            continue
        run = parrafo.add_run()
        if base_rpr is not None:
            run._r.insert(0, copy.deepcopy(base_rpr))
        if trozo.startswith('**'):
            run.text, run.bold = trozo[2:-2], True
        elif trozo.startswith('[['):
            run.text = f'[PENDIENTE: {trozo[2:-2]}]'
            run.font.highlight_color = WD_COLOR_INDEX.YELLOW
        elif trozo.startswith('*'):
            run.text, run.italic = trozo[1:-1], True
        else:
            run.text = trozo


def vaciar(el):
    """Quita los textos, enlaces y dibujos de un párrafo, y devuelve el formato de letra de su primer texto."""
    rpr = el.find('.//' + qn('w:rPr'))
    rpr = copy.deepcopy(rpr) if rpr is not None else None
    for hijo in list(el):
        if hijo.tag != qn('w:pPr'):
            el.remove(hijo)
    if rpr is not None:
        for quitar in ('w:b', 'w:i', 'w:bCs', 'w:iCs', 'w:highlight', 'w:vertAlign'):
            for x in rpr.findall(qn(quitar)):
                rpr.remove(x)
    return rpr


def llenar_tabla(tabla_el, filas, documento):
    tabla = docx.table.Table(copy.deepcopy(tabla_el), documento.part)
    # Igualar columnas: copiar la última celda de cada fila hasta tener las necesarias.
    columnas = len(filas[0])
    for fila in tabla.rows:
        while len(fila.cells) < columnas:
            fila._tr.append(copy.deepcopy(fila.cells[-1]._tc))
    grid = tabla._tbl.find(qn('w:tblGrid'))
    if grid is not None:
        while len(grid) < columnas:
            grid.append(copy.deepcopy(grid[-1]))
    while len(tabla.rows) < len(filas):
        tabla._tbl.append(copy.deepcopy(tabla.rows[-1]._tr))
    for fila, datos in zip(tabla.rows, filas):
        for celda, texto in zip(fila.cells, datos):
            p = celda.paragraphs[0]
            rpr = vaciar(p._p)
            for extra in celda.paragraphs[1:]:
                extra._p.getparent().remove(extra._p)
            escribir(p, texto, rpr)
    return tabla._tbl


def main(plantilla: str):
    documento = docx.Document(plantilla)
    cuerpo = documento.element.body
    elementos = list(cuerpo.iterchildren())

    # Modelos de la plantilla (posiciones del Formato-Revista_Acta_S_Informaticae.docx).
    modelo = {
        'h': elementos[8], 'p': elementos[22], 's': elementos[28], 'cap': elementos[31],
        'ref': elementos[50], 'blanco': elementos[9], 'fig': elementos[30],
    }
    tabla_modelo = elementos[41]

    # Título y autores.
    titulo = documento.paragraphs[2]
    rpr = vaciar(titulo._p)
    escribir(titulo, TITULO, rpr)
    for r in titulo.runs:
        r.bold = True
    autores_el = elementos[4]
    rpr = vaciar(autores_el)
    escribir(docx.text.paragraph.Paragraph(autores_el, documento), AUTORES, rpr)
    afiliacion = copy.deepcopy(autores_el)
    vaciar(afiliacion)
    escribir(docx.text.paragraph.Paragraph(afiliacion, documento), AFILIACION, rpr)
    autores_el.addnext(afiliacion)

    # Todo lo que va después del encabezado se reemplaza.
    inicio = elementos.index(elementos[8])
    final = elementos[-1]  # sectPr del cuerpo
    for el in elementos[inicio:-1]:
        cuerpo.remove(el)

    def nuevo(tipo, texto=None):
        el = copy.deepcopy(modelo[tipo])
        rpr = vaciar(el)
        p = docx.text.paragraph.Paragraph(el, documento)
        if texto:
            escribir(p, texto, rpr)
            if tipo in ('h', 's'):
                for r in p.runs:
                    r.bold = True
        final.addprevious(el)
        return p

    for tipo, contenido in CUERPO:
        if tipo == 'fig':
            p = nuevo('fig')
            p.add_run().add_picture(str(CARPETA / contenido), width=Cm(8.2))
        elif tipo == 'tabla1':
            final.addprevious(llenar_tabla(tabla_modelo, TABLA1, documento))
        elif tipo == 'tabla2':
            final.addprevious(llenar_tabla(tabla_modelo, TABLA2, documento))
        else:
            nuevo(tipo, contenido)
        if tipo in ('h', 'p', 'cap', 'ref', 'tabla1', 'tabla2'):
            nuevo('blanco')

    # Sin comentarios de la revisora ni enlaces del ejemplo.
    for etiqueta in ('w:commentRangeStart', 'w:commentRangeEnd'):
        for x in list(cuerpo.iter(qn(etiqueta))):
            x.getparent().remove(x)
    for ref in list(cuerpo.iter(qn('w:commentReference'))):
        run = ref.getparent()
        run.getparent().remove(run)
    usados = set(re.findall(r'r:(?:id|embed)="([^"]+)"', documento.element.xml))
    for rid, rel in list(documento.part.rels.items()):
        tipo = rel.reltype.rsplit('/', 1)[-1]
        if (tipo == 'hyperlink' and rid not in usados) or tipo in ('comments', 'commentsExtended', 'commentsIds', 'commentsExtensible', 'people'):
            del documento.part.rels[rid]

    # Pie de página: el título corto en lugar de «Nombre de la ponencia».
    for seccion in documento.sections:
        for p in seccion.footer.paragraphs:
            for r in p.runs:
                if 'Nombre de la ponencia' in r.text or r.text.strip() in ('Nombre de la', 'ponencia'):
                    r.text = r.text.replace('Nombre de la ponencia', TITULO_CORTO)
            if p.text.strip() in ('Nombre de la ponencia',):
                p.runs[0].text = TITULO_CORTO
                for r in p.runs[1:]:
                    r.text = ''

    CARPETA.mkdir(parents=True, exist_ok=True)
    documento.save(SALIDA)
    print(f'Listo: {SALIDA}')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit('Uso: python scripts/articulo/generar_articulo.py RUTA/Formato-Revista_Acta_S_Informaticae.docx')
    main(sys.argv[1])
