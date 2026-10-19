"""Artículo científico de STIRE sobre la plantilla de la revista Acta Scientiæ Informaticæ.

Llena el Word de la revista conservando su diseño (Times New Roman, dos columnas, pie de página) y quita lo del ejemplo:
textos, figuras, correos y ORCID de otros autores, y los comentarios de la revisora. Las figuras anchas ocupan las dos
columnas para que se lean sin zoom.

Uso:
    python scripts/articulo/generar_articulo.py RUTA/Formato-Revista_Acta_S_Informaticae.docx

La plantilla no se sube al repositorio (trae correos de otras personas). El resultado queda en
docs/curso-ddse3/articulo/STIRE_Articulo.docx. Lo que falta se lleva en docs/curso-ddse3/articulo/PENDIENTES.md, no en
el documento.
"""
import copy
import re
import sys
from pathlib import Path

import docx
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm

RAIZ = Path(__file__).resolve().parents[2]
CARPETA = RAIZ / 'docs' / 'curso-ddse3' / 'articulo'
SALIDA = CARPETA / 'STIRE_Articulo.docx'

TITULO = 'STIRE: sistema tutor inteligente con repetición espaciada para el aprendizaje de Fundamentos de Algoritmia'
TITULO_CORTO = 'STIRE: tutor inteligente con repetición espaciada'
AUTORES = 'Jeider Jair Gómez Oviedo¹, Pedro Gabriel Romero Mendivil¹, José López¹, Julio Galvis¹, Jorge Cervantes¹'
AFILIACION = '¹ Licenciatura en Informática, Facultad de Educación y Ciencias Humanas, Universidad de Córdoba, Montería, Colombia.'

# Tipos: h = título de sección, s = subtítulo, p = párrafo, fig = figura de una columna, figw = figura a lo ancho
# (ruta, leyenda), cap = leyenda, tabla = nombre de la tabla, ref = referencia. *cursiva*, **negrita**.
CUERPO = [
    ('h', 'RESUMEN'),
    ('p', 'El aprendizaje de la programación exige retener y aplicar conceptos que se acumulan de una semana a otra, y en '
          'grupos numerosos el docente no alcanza a acompañar a cada estudiante. Este artículo presenta el diseño, el '
          'desarrollo y una evaluación preliminar de STIRE, un sistema tutor inteligente web para el curso Fundamentos de '
          'Algoritmia de la Universidad de Córdoba (Colombia). STIRE combina ejercicios calificados automáticamente, un '
          'tutor conversacional basado en un modelo de lenguaje que orienta con preguntas y pistas, y un calendario de '
          'repasos que adapta el algoritmo SM-2 al ritmo de un semestre. El desarrollo siguió la metodología MODESEC en '
          'iteraciones semanales. La evaluación preliminar la realizó el equipo de desarrollo con dos listas de chequeo, de '
          'interfaz gráfica y de sistemas tutores inteligentes, y con la escala de usabilidad SUS. Tras las mejoras, el '
          'cumplimiento llegó a 100 % y 95,8 %, respectivamente, y la usabilidad obtuvo 81,5 puntos. Una evaluación previa '
          'hecha con inteligencia artificial resultó más generosa que la revisión humana en 9 de 28 criterios. El uso del '
          'tutor fue bajo, en parte porque cada estudiante debía configurar su propia clave de acceso al modelo.'),
    ('p', '**PALABRAS CLAVES:** aprendizaje de la programación; inteligencia artificial; repetición espaciada; sistemas '
          'tutores inteligentes; usabilidad.'),
    ('h', 'ABSTRACT'),
    ('p', '*Learning to program requires retaining and applying concepts that build on each other week after week, and in '
          'large groups instructors cannot support every student. This paper presents the design, development, and a '
          'preliminary evaluation of STIRE, a web-based intelligent tutoring system for the Fundamentals of Algorithms '
          'course at the University of Córdoba (Colombia). STIRE combines automatically graded exercises, a conversational '
          'tutor based on a language model that guides students with questions and hints, and a review schedule that '
          'adapts the SM-2 algorithm to the pace of an academic term. Development followed the MODESEC methodology in weekly '
          'iterations. The development team carried out the preliminary evaluation with two checklists, one for the '
          'graphical interface and one for intelligent tutoring systems, and with the System Usability Scale. After the '
          'improvements, compliance reached 100% and 95.8%, respectively, and usability scored 81.5. An earlier '
          'AI-based evaluation was more lenient than the human review in 9 of 28 criteria. Tutor use was low, partly '
          'because each student had to set up their own access key to the model.*'),
    ('p', '**KEY WORDS:** artificial intelligence; intelligent tutoring systems; programming learning; spaced repetition; '
          'usability.'),

    ('h', 'I. INTRODUCCIÓN'),
    ('p', 'Aprender a programar exige retener y aplicar conceptos que se apoyan unos en otros: una variable mal entendida '
          'dificulta los condicionales, y estos, los ciclos. En los cursos introductorios, además, el docente rara vez '
          'puede acompañar a cada estudiante en el momento en que se equivoca.'),
    ('p', 'La investigación ofrece varias respuestas. Los sistemas tutores inteligentes que guían la solución paso a paso '
          'alcanzan efectos cercanos a los de la tutoría humana (VanLehn, 2011). Repartir la práctica en el tiempo retiene '
          'mejor que concentrarla, al menos en tareas de memoria verbal (Cepeda et al., 2006), y resolver una prueba '
          'fortalece el recuerdo más que volver a estudiar el material (Roediger y Karpicke, 2006). La retroalimentación, '
          'por su parte, ayuda cuando le dice al estudiante hacia dónde va, cómo va y qué sigue (Hattie y Timperley, 2007).'),
    ('p', 'La inteligencia artificial generativa agregó otra posibilidad: un asistente conversacional que acompaña al '
          'estudiante en cualquier momento. En el curso CS50 de la Universidad de Harvard, por ejemplo, se incorporó un '
          'asistente diseñado para guiar a los estudiantes sin entregarles las soluciones (Liu et al., 2024).'),
    ('p', 'Este trabajo reúne esas ideas en un solo sistema para un curso concreto. Su objetivo fue **desarrollar y evaluar '
          'de forma preliminar STIRE, un sistema tutor inteligente web con repetición espaciada para el curso Fundamentos '
          'de Algoritmia de la Licenciatura en Informática de la Universidad de Córdoba.**'),

    ('h', 'II. METODOLOGÍA Y DESARROLLO'),
    ('s', 'A. Enfoque y contexto'),
    ('p', 'Se trata de una investigación aplicada de desarrollo tecnológico. El software se construyó con MODESEC, una '
          'metodología que organiza el diseño de software educativo a partir de las competencias que se quieren '
          'desarrollar (Caro Piñeres et al., 2009), en iteraciones semanales, por un equipo de cinco estudiantes de la '
          'Licenciatura en Informática de la Universidad de Córdoba (Montería, Colombia), entre agosto y octubre de 2026. '
          'En el sistema se cargaron dos cursos: Fundamentos de Algoritmia y Pensamiento algorítmico.'),
    ('s', 'B. Principios de diseño'),
    ('p', '**Practicar resolviendo.** Cada lección se trabaja con ejercicios de siete tipos, entre ellos programas en '
          'JavaScript que se ejecutan contra casos de prueba, y cada repaso es un ejercicio y no una relectura (Roediger y '
          'Karpicke, 2006). **Retroalimentación al entregar.** El estudiante ve el resultado de cada caso de prueba al '
          'momento (Hattie y Timperley, 2007). **Ayuda graduada.** El tutor empieza con una pista y sube a preguntas guía '
          'si el estudiante sigue fallando; no escribe la solución. **Un perfil descriptivo.** El perfil de aprendizaje le '
          'muestra al estudiante sus errores frecuentes y sus hábitos de estudio, pero no cambia el contenido que ve. '
          '**Funciones del docente opcionales.** El docente puede publicar contenido, revisar entregas o llevar notas, '
          'pero el sistema funciona sin que lo haga.'),
    ('s', 'C. Arquitectura'),
    ('p', 'STIRE separa el cliente web del servidor (Figura 1). El cliente usa Nuxt 3, Vue 3 y Pinia, y se auditó con '
          'axe-core frente a las pautas WCAG 2.2 (World Wide Web Consortium [W3C], 2023): los 196 elementos señalados en 78 '
          'vistas de computador y celular se corrigieron. El servidor usa NestJS y TypeORM sobre MariaDB y corre en '
          'contenedores Docker. El tutor consulta el modelo Gemini de Google con la clave propia de cada estudiante.'),
    ('fig', 'figuras/figura1_arquitectura.png'),
    ('cap', 'Figura 1. Arquitectura de STIRE y módulos del servidor.'),
    ('s', 'D. Repetición espaciada'),
    ('p', 'Los repasos adaptan el algoritmo SM-2 (Woźniak, 1990). En el original, el primer repaso llega al día siguiente, '
          'el segundo a los seis días y, desde el tercero, el intervalo anterior se multiplica por un factor de facilidad '
          'que empieza en 2,5, cambia según la calidad de la respuesta y nunca baja de 1,3; un fallo reinicia el ciclo. '
          'STIRE hace tres cambios. El segundo repaso llega a los tres días, para que los dos primeros caigan en la misma '
          'semana de clase. La calidad sale del resultado del ejercicio, sin preguntarle nada al estudiante: falla (1), '
          'acierta tras varios intentos (3), acierta al primer intento (4) o acierta al primer intento después de '
          'declararse seguro (5). Y ningún intervalo supera 60 días. La Tabla 1 muestra los intervalos que resultan.'),
    ('cap', 'Tabla 1. Días hasta cada repaso según el resultado del estudiante'),
    ('tabla', 'intervalos'),
    ('s', 'E. Evaluación preliminar'),
    ('p', 'Se usaron dos listas de chequeo: una de interfaz gráfica, basada en Pressman y Maxim (2019), con 16 criterios, '
          'y otra de sistemas tutores inteligentes, basada en Caro Piñeres (2015), con 12. Cada criterio vale 2 puntos si '
          'se cumple, 1 si se cumple parcialmente y 0 si no se cumple, de modo que las listas suman 32 y 24 puntos. Se '
          'aplicaron en cuatro momentos: el 4 de octubre, por el equipo con apoyo de un asistente de inteligencia '
          'artificial; el 6 de octubre, sobre la versión 2.0, solo por la inteligencia artificial; entre el 9 y el 17 de '
          'octubre, sobre la misma versión, por cada integrante como usuario, y el 17 de octubre, después de las '
          'correcciones.'),
    ('p', 'La usabilidad se midió con la escala SUS (Brooke, 1996), interpretada con los rangos de Bangor et al. (2008). '
          'Entre el 5 y el 16 de octubre, el equipo usó el sistema durante dos semanas con los dos cursos, en un diseño '
          'cruzado: cada integrante fue docente o estudiante de un curso y cambió de curso en la segunda semana. El uso del '
          'tutor se tomó de los registros del servidor.'),
    ('s', 'F. Uso de inteligencia artificial'),
    ('p', 'En el desarrollo se usaron asistentes de programación con inteligencia artificial (Claude Code, Codex y Google '
          'Antigravity) para escribir y revisar código y documentación; cada cambio pasó por pruebas automáticas y por la '
          'revisión del equipo. En la preparación de este artículo se usó un asistente para estructurar el texto y '
          'verificar las referencias. Los autores revisaron el contenido y responden por él (Giraldo Cardozo y Muñoz Vargas, '
          '2025).'),

    ('h', 'III. RESULTADOS Y DISCUSIÓN'),
    ('s', 'A. El sistema'),
    ('p', 'La Figura 2 muestra una respuesta real del tutor. Ante la pregunta «No sé cómo sacar el perímetro», el tutor '
          'recuerda la fórmula del enunciado y le pide al estudiante escribir la operación con sus propias variables, en '
          'lugar de escribirla por él. La Figura 3 muestra la experiencia del estudiante en el celular: el inicio le dice '
          'cuál es su siguiente paso y cuánto domina la lección (a), y el ejercicio presenta el enunciado, un ejemplo y el '
          'editor, con botones para probar el código sin gastar intentos y para entregarlo (b).'),
    ('fig', 'figuras/figura2_tutor.png'),
    ('cap', 'Figura 2. Respuesta del tutor: una pista y una pregunta, no la solución.'),
    ('s', 'B. Listas de chequeo: inteligencia artificial frente a revisión humana'),
    ('p', 'La Tabla 2 resume los cuatro momentos. La evaluación hecha solo por la inteligencia artificial fue más generosa '
          'que la revisión humana en 9 de los 28 criterios y más estricta en uno. Acertó en lo que se puede comprobar en el '
          'código y falló en lo que solo nota quien usa la aplicación: por ejemplo, dio por cumplido que el estudiante '
          'supiera cuánto dominio le faltaba para abrir el siguiente módulo, y un integrante, al usarla, no lo encontró. '
          'Por eso se tomó como oficial la revisión humana.'),
    ('cap', 'Tabla 2. Puntos de las listas de chequeo en cada momento'),
    ('tabla', 'listas'),
    ('p', 'La subida a 100 % y 95,8 % debe leerse con cautela: quienes evaluaron son los mismos que desarrollaron, y los '
          'criterios orientaron las mejoras, así que un aumento era esperable.'),
    ('figw', ('figuras/figura3_estudiante.png',
              'Figura 3. STIRE en el celular: (a) inicio con el siguiente paso; (b) ejercicio de programación.')),
    ('s', 'C. Usabilidad y uso del tutor'),
    ('p', 'Cinco integrantes respondieron la escala SUS dentro del sistema, con un promedio de 81,5, dentro del rango '
          'aceptable según Bangor et al. (2008). Es una medida de referencia, porque la dieron los propios desarrolladores.'),
    ('p', 'El tutor, en cambio, casi no se usó. El 12 de octubre, solo 4 de las 17 cuentas de estudiante tenían guardada '
          'su clave de acceso al modelo, no hubo mensajes al tutor en las 24 horas anteriores y las respuestas medidas '
          'tardaban entre 3 y 29 segundos. La clave personal parece ser la principal barrera: en despliegues como el de '
          'CS50, el asistente lo provee el curso (Liu et al., 2024).'),
    ('s', 'D. Discusión'),
    ('p', 'STIRE aplica en un mismo sistema la práctica distribuida, la práctica de recuperación y la ayuda graduada. Sin '
          'embargo, la evidencia que respalda cada idea proviene de otros contextos: los tutores que revisó VanLehn (2011) '
          'no usaban modelos de lenguaje, y los estudios de Cepeda et al. (2006) son de memoria verbal, no de '
          'programación. Además, SM-2 programa los repasos con reglas fijas, mientras que los modelos que aprenden de los '
          'datos de cada estudiante pueden programarlos mejor (Tabibian et al., 2019). Lo que muestra esta evaluación es '
          'que el sistema funciona y que su interfaz mejoró; su efecto en el aprendizaje está por medir.'),

    ('h', 'IV. CONCLUSIONES'),
    ('p', 'STIRE reúne en un sistema web el acompañamiento de un tutor, la retroalimentación inmediata y los repasos '
          'espaciados, adaptados al ritmo de un semestre. La evaluación preliminar mostró una mejora clara de la interfaz '
          'y de las funciones de tutoría, y dejó una lección metodológica: la evaluación con inteligencia artificial sirve '
          'para revisar lo verificable, pero no reemplaza la prueba con usuarios. Las principales limitaciones son que '
          'evaluaron los propios desarrolladores y que no se ha medido el aprendizaje. Como trabajo futuro se proponen una '
          'prueba con estudiantes del curso, una clave de acceso al modelo provista por la institución, el repaso '
          'intercalado de varias lecciones y un programador de repasos que aprenda de los datos.'),

    ('h', 'V. REFERENCIAS'),
    ('ref', 'Bangor, A., Kortum, P. T., y Miller, J. T. (2008). An empirical evaluation of the System Usability Scale. '
            '*International Journal of Human–Computer Interaction, 24*(6), 574–594. https://doi.org/10.1080/10447310802205776'),
    ('ref', 'Brooke, J. (1996). SUS: A «quick and dirty» usability scale. En P. W. Jordan, B. Thomas, B. A. Weerdmeester y '
            'I. L. McClelland (Eds.), *Usability evaluation in industry* (pp. 189–194). Taylor & Francis.'),
    ('ref', 'Caro Piñeres, M. F. (2015). *Metamodel for personalized adaptation of pedagogical strategies using '
            'metacognition in intelligent tutoring systems* [Tesis doctoral, Universidad Nacional de Colombia]. '
            'https://repositorio.unal.edu.co/handle/unal/55505'),
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
    ('ref', 'Liu, R., Zenke, C., Liu, C., Holmes, A., Thornton, P., y Malan, D. J. (2024). Teaching CS50 with AI: '
            'Leveraging generative artificial intelligence in computer science education. En *Proceedings of the 55th ACM '
            'Technical Symposium on Computer Science Education V. 1* (pp. 750–756). ACM. '
            'https://doi.org/10.1145/3626252.3630938'),
    ('ref', "Pressman, R. S., y Maxim, B. R. (2019). *Software engineering: A practitioner's approach* (9.ª ed.). "
            'McGraw-Hill Education.'),
    ('ref', 'Roediger, H. L., y Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term '
            'retention. *Psychological Science, 17*(3), 249–255. https://doi.org/10.1111/j.1467-9280.2006.01693.x'),
    ('ref', 'Tabibian, B., Upadhyay, U., De, A., Zarezade, A., Schölkopf, B., y Gomez-Rodriguez, M. (2019). Enhancing '
            'human learning via spaced repetition optimization. *Proceedings of the National Academy of Sciences, 116*(10), '
            '3988–3993. https://doi.org/10.1073/pnas.1815156116'),
    ('ref', 'VanLehn, K. (2011). The relative effectiveness of human tutoring, intelligent tutoring systems, and other '
            'tutoring systems. *Educational Psychologist, 46*(4), 197–221. https://doi.org/10.1080/00461520.2011.611369'),
    ('ref', 'Woźniak, P. A. (1990). *Optimization of learning* [Tesis de maestría, Universidad Tecnológica de Poznań]. '
            'https://www-v1.supermemo.com/archives1990-2015/english/ol/sm2'),
    ('ref', 'World Wide Web Consortium. (2023). *Web Content Accessibility Guidelines (WCAG) 2.2*. '
            'https://www.w3.org/TR/WCAG22/'),
]

# Ancho en el papel (cm): lo justo para que el texto de la figura se lea sin zoom y el artículo no pase de 6 páginas.
ANCHO_FIGURA = {'figuras/figura1_arquitectura.png': 7.0, 'figuras/figura2_tutor.png': 7.4}

# Ancho de cada columna de las tablas (cm), para que la primera no se parta en muchas líneas.
ANCHOS_TABLA = {'intervalos': [3.9, 4.3], 'listas': [3.8, 2.2, 2.2]}

TABLAS = {
    'intervalos': [
        ['Resultado en cada repaso', 'Días hasta los repasos 1 a 6'],
        ['Acierta al primer intento', '1 · 3 · 8 · 20 · 50 · 60'],
        ['Acierta tras varios intentos', '1 · 3 · 6 · 12 · 22 · 37'],
        ['Falla', 'vuelve a 1 día'],
    ],
    'listas': [
        ['Momento', 'Interfaz (32 pts.)', 'Tutores (24 pts.)'],
        ['4 oct.: equipo con apoyo de IA', '20 (62,5 %)', '14 (58,3 %)'],
        ['6 oct.: solo IA, versión 2.0', '31 (96,9 %)', '24 (100 %)'],
        ['9–17 oct.: equipo como usuario, versión 2.0', '27 (84,4 %)', '20 (83,3 %)'],
        ['17 oct.: tras las correcciones', '32 (100 %)', '23 (95,8 %)'],
    ],
}


def escribir(parrafo, texto, base_rpr):
    """Agrega el texto con *cursiva* y **negrita**, con la letra del párrafo modelo."""
    for trozo in re.split(r'(\*\*[^*]+\*\*|\*[^*]+\*)', texto):
        if not trozo:
            continue
        run = parrafo.add_run()
        if base_rpr is not None:
            run._r.insert(0, copy.deepcopy(base_rpr))
        if trozo.startswith('**'):
            run.text, run.bold = trozo[2:-2], True
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


def llenar_tabla(tabla_el, filas, documento, anchos):
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
    tabla.autofit = False
    if grid is not None:
        for col, ancho in zip(grid, anchos):
            col.set(qn('w:w'), str(int(Cm(ancho).twips)))
    for n, (fila, datos) in enumerate(zip(tabla.rows, filas)):
        # La tabla no se parte entre páginas: cada fila sigue con la siguiente.
        tr_pr = fila._tr.get_or_add_trPr()
        if tr_pr.find(qn('w:cantSplit')) is None:
            tr_pr.append(OxmlElement('w:cantSplit'))
        for celda, ancho in zip(fila.cells, anchos):
            celda.width = Cm(ancho)
            if n < len(filas) - 1:
                for par in celda.paragraphs:
                    par.paragraph_format.keep_with_next = True
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
    final = elementos[-1]  # sectPr del cuerpo
    for el in elementos[8:-1]:
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
                # Un título nunca queda solo al final de una columna.
                p.paragraph_format.keep_with_next = True
            if tipo == 'cap':
                p.paragraph_format.keep_with_next = True
                p.paragraph_format.keep_together = True
        final.addprevious(el)
        return p

    def centrar(p):
        for ind in p._p.findall('.//' + qn('w:ind')):
            ind.getparent().remove(ind)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    def corte(columnas):
        """Párrafo vacío que cierra una sección continua de 1 o 2 columnas (para las figuras a lo ancho)."""
        p = nuevo('blanco')
        sect = copy.deepcopy(final)
        for x in sect.findall(qn('w:type')):
            sect.remove(x)
        tipo_el = OxmlElement('w:type')
        tipo_el.set(qn('w:val'), 'continuous')
        sect.insert(0, tipo_el)
        cols = sect.find(qn('w:cols'))
        if cols is None:
            cols = OxmlElement('w:cols')
            sect.append(cols)
        cols.set(qn('w:num'), str(columnas))
        if columnas == 1:
            # La plantilla fija el ancho de cada columna (equalWidth=0); con una sola columna eso se quita.
            for col in cols.findall(qn('w:col')):
                cols.remove(col)
            cols.attrib.pop(qn('w:equalWidth'), None)
        p._p.get_or_add_pPr().append(sect)

    for tipo, contenido in CUERPO:
        if tipo == 'fig':
            p = nuevo('fig')
            centrar(p)
            p.add_run().add_picture(str(CARPETA / contenido), width=Cm(ANCHO_FIGURA.get(contenido, 8.2)))
        elif tipo == 'figw':
            ruta, leyenda = contenido
            corte(2)
            p = nuevo('fig')
            centrar(p)
            p.add_run().add_picture(str(CARPETA / ruta), width=Cm(13.5))
            centrar(nuevo('cap', leyenda))
            corte(1)
        elif tipo == 'tabla':
            final.addprevious(llenar_tabla(tabla_modelo, TABLAS[contenido], documento, ANCHOS_TABLA[contenido]))
        else:
            nuevo(tipo, contenido)
        siguiente = CUERPO[CUERPO.index((tipo, contenido)) + 1][0] if (tipo, contenido) != CUERPO[-1] else None
        # La leyenda de una tabla va pegada a la tabla (sin línea en blanco que las separe de página).
        if tipo in ('h', 'p', 'ref', 'tabla') or (tipo == 'cap' and siguiente != 'tabla'):
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
                if 'Nombre de la ponencia' in r.text:
                    r.text = r.text.replace('Nombre de la ponencia', TITULO_CORTO)
            if p.text.strip() == 'Nombre de la ponencia':
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
