"""Borrador del artículo de implementación y evaluación de STIRE para RIED, sobre su plantilla oficial.

Estructura: la plantilla IMRyD del profesor Toscano, con el formato de RIED (docs/curso-ddse3/articulo-ried/).
Lo que pidió Toscano va completo: resumen y resultados de las tres pruebas (heurística, 10 usuarios finales y estrés).
Las secciones que faltan quedan marcadas «[Por escribir: …]».

    python scripts/articulo/generar_ried.py
"""
import copy
from pathlib import Path

import docx
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Pt, Cm

RAIZ = Path(__file__).resolve().parents[2] / 'docs' / 'curso-ddse3' / 'articulo-ried'
PLANTILLA = RAIZ / 'plantilla_articulos_ried.docx'
SALIDA = RAIZ / 'STIRE_RIED_borrador.docx'

TITULO = 'Un tutor inteligente para aprender a programar: implementación y evaluación de STIRE con usuarios principiantes'
TITULO_EN = 'An intelligent tutor for learning to program: implementation and evaluation of STIRE with novice users'

RESUMEN = (
    'Aprender a programar exige retener conceptos que se acumulan de una semana a '
    'otra y recibir ayuda cuando el estudiante se equivoca. Este trabajo presenta la implementación y la '
    'evaluación de STIRE, un sistema tutor inteligente web para el curso Fundamentos de Algoritmia de una universidad '
    'pública colombiana. STIRE combina ejercicios calificados automáticamente, un tutor conversacional basado en un '
    'modelo de lenguaje que orienta con preguntas en lugar de dar la solución, repasos programados con una adaptación '
    'del algoritmo SM-2 y un nivel por competencia que sugiere el siguiente ejercicio. La evaluación, de enfoque mixto, '
    'tuvo tres pruebas: una evaluación heurística con un instrumento de 34 ítems, una prueba de observación con 10 '
    'personas de 18 a 24 años, familiares y conocidos del equipo, y una prueba de estrés con ocho casos, de 10 a 100 estudiantes '
    'simultáneos. La heurística dio un promedio de 4,21 sobre 5. Las 10 personas, 9 de ellas sin experiencia en '
    'programación, completaron el recorrido, y la usabilidad percibida (SUS) fue de 63,1, por debajo de la que dio el '
    'equipo (81,5). Las principales barreras fueron activar el tutor con una clave personal y entender para qué sirven los '
    'repasos (6 de 10 personas cada una). El servidor no tuvo fallas con 100 estudiantes, aunque la ejecución de código '
    'fue el cuello de botella. Se concluye que el sistema funciona para un curso, que sus barreras son de '
    'entrada y que su efecto en el aprendizaje debe medirse en un grupo real.'
)
CLAVES = 'sistema tutor inteligente; enseñanza de la programación; inteligencia artificial; educación superior; evaluación de software'
ABSTRACT = (
    '[Por traducir al inglés cuando el resumen en español quede aprobado. RIED pide una traducción profesional.]'
)
KEYWORDS = 'intelligent tutoring system; programming education; artificial intelligence; higher education; software evaluation'

# (tipo, contenido). Tipos: h (apartado), s (subapartado), p (párrafo), falta (por escribir), tabla, cap (título de tabla), fuente.
CUERPO = [
    ('h', 'INTRODUCCIÓN'),
    ('falta', 'Del general al problema (plantilla del profesor, §1): la dificultad de aprender a programar en primer '
              'semestre; los sistemas tutores inteligentes, la práctica espaciada y los tutores con modelos de lenguaje '
              '(estado del arte crítico, con referencias de 2023 a 2026); la brecha: pocos sistemas reúnen las tres ideas y '
              'casi ninguno se ha evaluado en un curso de América Latina; el objetivo del trabajo. Unas 900 palabras.'),

    ('h', 'MÉTODO'),
    ('s', 'Diseño'),
    ('p', 'Se trata de una investigación aplicada de desarrollo tecnológico con evaluación de enfoque mixto: cuantitativa '
          '(puntajes, tiempos de respuesta y la escala SUS) y cualitativa (lo que las personas hicieron y dijeron durante '
          'la observación). El sistema se construyó en iteraciones semanales con la metodología MODESEC, de diseño de '
          'software educativo basado en competencias.'),
    ('s', 'Participantes y escenarios de evaluación'),
    ('p', 'La Tabla 1 resume las tres pruebas que pidió el docente del curso, cada una con su propósito, participantes e '
          'instrumento.'),
    ('cap', 'Pruebas de evaluación de STIRE'),
    ('tabla', 'pruebas'),
    ('fuente', 'Nota: la evaluación heurística la hicieron los cinco integrantes del equipo, que también desarrollaron el sistema.'),
    ('s', 'Instrumentos'),
    ('p', 'Para la evaluación heurística se usó el instrumento del curso, de 34 ítems con escala Likert de 1 a 5, y, cuando '
          'un ítem tenía un problema, su frecuencia (0 a 2) e impacto (0 a 3), cuyo producto es la severidad. Cada '
          'evaluador hizo antes las tareas de un estudiante y de un docente, poniéndose en el lugar de alguien que no sabe '
          'programar. En la prueba con usuarios finales, un observador por persona registró en una hoja estructurada lo que '
          'hizo en cada momento (crear la cuenta, unirse a la clase, la lección, un ejercicio, el tutor y los repasos), si '
          'necesitó ayuda y sus respuestas a tres preguntas finales; al terminar, la persona podía responder la escala SUS '
          '(Brooke, 1996), interpretada con los rangos de Bangor et al. (2008). La prueba de estrés usó estudiantes '
          'virtuales que repetían una batería de ocho casos de uso reales con pausas de persona de 1 a 3 segundos.'),

    ('h', 'EL SISTEMA STIRE'),
    ('falta', 'Arquitectura (cliente web y servidor), el tutor y su política pedagógica (pistas y preguntas, nunca la '
              'solución), la adaptación de SM-2 y la ecuación del nivel por competencia, con sus fórmulas, y dos figuras '
              '(el tutor y el ejercicio en el celular). Escribirlo de nuevo, sin copiar el artículo de Acta. Unas 900 palabras.'),

    ('h', 'RESULTADOS'),
    ('s', 'Evaluación heurística'),
    ('p', 'De los 34 ítems se calificaron 33, con un promedio de 4,21 sobre 5: 13 ítems obtuvieron 5, 15 obtuvieron 4, 4 '
          'obtuvieron 3 y uno obtuvo 2. La usabilidad general y el potencial educativo llegaron a 4,25 cada uno. Dos '
          'ítems tuvieron severidad de 4 o más. El primero, con severidad 4, fue que los números del avance no coincidían '
          'entre pantallas. El segundo, con severidad 6, fue que el registro solo admite mayores de 18 años, una decisión '
          'que se tomó porque el proveedor del modelo de lenguaje no permite menores. Los problemas que más se repitieron '
          'fueron los mensajes de error de programación todavía técnicos y ayudas que se abrían fuera de la pantalla.'),
    ('s', 'Prueba con usuarios finales'),
    ('p', 'Participaron 10 personas de 18 a 24 años (media de 20,0 años), familiares, amigos y conocidos del equipo de distintos lugares, elegidas por conveniencia; 9 no sabían programar y una sabía un poco. Siete '
          'usaron un computador y tres un celular. Las diez completaron el recorrido y ocho necesitaron al menos una pista '
          'del observador. Lo más valorado fueron las lecciones con ejemplos de la vida diaria, poder escuchar la lección, '
          'los ejercicios de arrastrar y soltar y el tutor cuando estaba activo; todas las personas a quienes se les '
          'preguntó dijeron que usarían STIRE o su tutor para aprender. La Tabla 2 reúne las dificultades que se '
          'repitieron.'),
    ('cap', 'Dificultades que se repitieron en la prueba con usuarios finales'),
    ('tabla', 'usuarios'),
    ('fuente', 'Nota: n = 10. Una persona puede tener varias dificultades.'),
    ('p', 'La barrera del tutor fue concreta: una persona escribió la clave del modelo en el campo del código de la clase, '
          'y otra dijo que sin la ayuda del observador no habría podido activarlo. Con el tutor activo, la décima persona '
          'lo encontró útil, pero sus respuestas le parecieron demasiado técnicas y extensas para quien empieza. En '
          'programación, la revisión exacta de la salida frustró a dos personas, que fallaron por un espacio o una '
          'mayúscula. Cuatro personas respondieron la escala SUS, con puntajes de 47,5, 62,5, 70 y 72,5 (media de 63,1), '
          'por debajo de los 81,5 que habían dado los integrantes del equipo.'),
    ('s', 'Prueba de estrés'),
    ('p', 'El servidor no tuvo ninguna falla en las cuatro etapas (Tabla 3). Navegar, consultar las competencias y entregar '
          'un ejercicio respondieron en menos de medio segundo en el 95 % de los casos, incluso con 100 estudiantes. El '
          'cuello de botella fue probar el código: por seguridad y memoria, el ejecutor corre como máximo tres programas a '
          'la vez, y con 100 estudiantes la espera llegó a 9,9 segundos en el percentil 95.'),
    ('cap', 'Tiempo de respuesta según los estudiantes simultáneos'),
    ('tabla', 'estres'),
    ('fuente', 'Nota: p95 es el tiempo por debajo del cual respondió el 95 % de los pedidos. Etapas de 45 segundos.'),
    ('p', 'Una prueba complementaria con 30 estudiantes simulados que entregaban sin pausas durante seis minutos encontró '
          'un caso que la batería anterior no cubría: con diez entregas simultáneas, el servidor se quedaba sin conexiones '
          'libres a la base de datos y dejaba de responder. Se corrigió liberando la conexión antes de procesar las '
          'consecuencias de cada entrega, y la misma simulación terminó sin fallas.'),

    ('h', 'DISCUSIÓN'),
    ('falta', 'Comparar con la literatura (plantilla del profesor, §6): por qué la usabilidad de los usuarios (63,1) es '
              'menor que la del equipo (81,5); la barrera de la clave personal frente a cursos que proveen el asistente; '
              'el valor de probar la carga antes de llevar el sistema al aula; las simulaciones del nivel por competencia '
              '(r cercano a 0,4 frente a la habilidad real). Limitaciones: 10 personas, solo 4 respuestas SUS, evaluadores '
              'del equipo en la heurística y sin medir el aprendizaje. Unas 900 palabras.'),

    ('h', 'CONCLUSIONES'),
    ('falta', 'Respuesta al objetivo, el aporte y el trabajo futuro: evaluación con un grupo real del curso (SUS y un '
              'cuestionario de aceptación para todos), diagnóstico de competencias y análisis de los exámenes del docente. '
              'Unas 400 palabras.'),

    ('h', 'REFERENCIAS / REFERENCES'),
    ('ref', 'Bangor, A., Kortum, P. T., y Miller, J. T. (2008). An empirical evaluation of the System Usability Scale. '
            'International Journal of Human-Computer Interaction, 24(6), 574-594. https://doi.org/10.1080/10447310802205776'),
    ('ref', 'Brooke, J. (1996). SUS: A «quick and dirty» usability scale. En P. W. Jordan, B. Thomas, B. A. Weerdmeester y '
            'I. L. McClelland (Eds.), Usability evaluation in industry (pp. 189-194). Taylor & Francis.'),
    ('falta', 'Faltan al menos 23 referencias más; el 40 % deben ser de 2023 a 2026 (norma de RIED).'),
]

TABLAS = {
    'pruebas': [
        ['Prueba', 'Propósito', 'Participantes', 'Instrumento'],
        ['Evaluación heurística', 'Encontrar problemas de usabilidad y de potencial educativo', '5 evaluadores del equipo', '34 ítems Likert 1-5, frecuencia e impacto'],
        ['Usuarios finales', 'Ver qué hace una persona nueva con el sistema', '10 personas de 18 a 24 años (familiares y conocidos)', 'Hoja de observación y escala SUS'],
        ['Estrés', 'Saber si el servidor aguanta un curso completo', '10, 30, 60 y 100 estudiantes virtuales', 'Batería de 8 casos de uso por estudiante'],
    ],
    'usuarios': [
        ['Dificultad', 'Personas'],
        ['Activar el tutor con la clave de acceso al modelo', '6 de 10'],
        ['Entender o encontrar los repasos', '6 de 10'],
        ['Registrarse (no lo encuentran o error de conexión)', '5 de 10'],
        ['Completar pseudocódigo o programar sin saber', '5 de 10'],
        ['Ordenar los pasos de un algoritmo', '4 de 10'],
    ],
    'estres': [
        ['Estudiantes a la vez', 'Pedidos por segundo', 'p95 general', 'p95 al probar código'],
        ['10', '7,7', '0,2 s', '0,3 s'],
        ['30', '22,0', '0,4 s', '0,7 s'],
        ['60', '31,9', '3,7 s', '4,2 s'],
        ['100', '34,8', '9,1 s', '9,9 s'],
    ],
}


def parrafo(doc, texto, tam=12, negrita=False, cursiva=False, centro=False, sangria=False, color=None):
    p = doc.add_paragraph()
    r = p.add_run(texto)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(tam)
    r.bold = negrita
    r.italic = cursiva
    if color:
        from docx.shared import RGBColor
        r.font.color.rgb = RGBColor(*color)
    if centro:
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    else:
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    if sangria:
        p.paragraph_format.first_line_indent = Cm(1)
    return p


def tabla(doc, filas):
    t = doc.add_table(rows=len(filas), cols=len(filas[0]))
    # La plantilla de RIED no trae el estilo «Table Grid»: los bordes se ponen a mano.
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn
    bordes = OxmlElement('w:tblBorders')
    for lado in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        b = OxmlElement(f'w:{lado}')
        b.set(qn('w:val'), 'single'); b.set(qn('w:sz'), '4'); b.set(qn('w:color'), '000000')
        bordes.append(b)
    t._tbl.tblPr.append(bordes)
    for i, fila in enumerate(filas):
        for j, valor in enumerate(fila):
            celda = t.cell(i, j)
            celda.text = ''
            r = celda.paragraphs[0].add_run(valor)
            r.font.name = 'Times New Roman'
            r.font.size = Pt(10)
            r.bold = i == 0


def main():
    doc = docx.Document(PLANTILLA)
    cuerpo = doc.element.body
    for el in list(cuerpo):
        if not el.tag.endswith('sectPr'):
            cuerpo.remove(el)

    parrafo(doc, TITULO, 17, negrita=True, centro=True)
    parrafo(doc, TITULO_EN, 14, negrita=True, centro=True)
    parrafo(doc, '[Autores, ORCID e institución: se suprimen en el primer envío (revisión ciega).]', 12, cursiva=True, centro=True)

    parrafo(doc, 'Resumen', 10, negrita=True)
    parrafo(doc, RESUMEN, 10, sangria=True)
    p = parrafo(doc, 'Palabras clave: ', 10, cursiva=True)
    r = p.add_run(CLAVES); r.font.size = Pt(10); r.font.name = 'Times New Roman'
    parrafo(doc, 'Abstract', 10, negrita=True)
    parrafo(doc, ABSTRACT, 10, sangria=True, cursiva=True)
    p = parrafo(doc, 'Keywords: ', 10, cursiva=True)
    r = p.add_run(KEYWORDS); r.font.size = Pt(10); r.font.name = 'Times New Roman'

    n_tabla = 0
    for tipo, contenido in CUERPO:
        if tipo == 'h':
            parrafo(doc, contenido, 12, negrita=True)
        elif tipo == 's':
            parrafo(doc, contenido, 12, negrita=True)
        elif tipo == 'p':
            parrafo(doc, contenido, 12, sangria=True)
        elif tipo == 'falta':
            parrafo(doc, f'[Por escribir: {contenido}]', 12, cursiva=True, color=(0xB0, 0x30, 0x30))
        elif tipo == 'cap':
            n_tabla += 1
            parrafo(doc, f'Tabla {n_tabla}', 12, negrita=True)
            parrafo(doc, contenido, 12, cursiva=True)
        elif tipo == 'tabla':
            tabla(doc, TABLAS[contenido])
        elif tipo == 'fuente':
            parrafo(doc, contenido, 9)
        elif tipo == 'ref':
            p = parrafo(doc, contenido, 12)
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.left_indent = Cm(1.27)
            p.paragraph_format.first_line_indent = Cm(-1.27)

    doc.save(SALIDA)
    palabras_resumen = len(RESUMEN.split())
    palabras_titulo = len(TITULO.split())
    print(f'Listo: {SALIDA}\nTítulo: {palabras_titulo} palabras (máx. 16) · Resumen: {palabras_resumen} palabras (200 a 250)')


if __name__ == '__main__':
    main()
