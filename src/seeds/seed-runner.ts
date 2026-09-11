/**
 * src/seeds/seed-runner.ts
 *
 * Seeder maestro IDEMPOTENTE de STIRE para el curso:
 * "Diseña e implementa algoritmos básicos (O) utilizando HTML5, CSS y JavaScript (C),
 * con el propósito de resolver problemas sencillos en el contexto del desarrollo web (F)."
 */
import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { Institution } from '../institution/entities/institution.entity';
import { Program } from '../institution/entities/program.entity';
import { User, UserRole } from '../user/entities/user.entity';
import { Class } from '../class/entities/class.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { EnrollmentStatus } from '../enrollment/enums/enrollment-status.enum';
import { Section } from '../section/entities/section.entity';
import { Topic } from '../topic/entities/topic.entity';
import { LearningUnit } from '../learning-unit/entities/learning-unit.entity';
import { Difficulty } from '../common/enums/difficulty.enum';
import { Prerequisite } from '../prerequisites/entities/prerequisite.entity';
import { Content } from '../content/entities/content.entity';
import { ContentType } from '../common/enums/content-type.enum';
import { ActivityType } from '../activity-types/entities/activity-type.entity';
import { Activity } from '../activities/entities/activity.entity';
import { PublicationStatus } from '../common/enums/status.enum';
import { ActivityQuestion } from '../activity-questions/entities/activity-question.entity';
import { QuestionType } from '../common/enums/question-type.enum';
import { LearningProgress } from '../learning-progress/entities/learning-progress.entity';
import { LearningStatus } from '../common/enums/learning-status.enum';
import { ReviewSchedule } from '../review-schedules/entities/review-schedule.entity';

const COMMON_PASSWORD = 'Test1234!';
const ADMIN_PASSWORD = 'Admin1234!';

async function findOrCreate<T extends { id?: number | string }>(
  repo: import('typeorm').Repository<T>,
  where: Partial<T>,
  build: () => Partial<T>,
  label: string,
): Promise<T> {
  const existing = await repo.findOne({ where: where as any });
  if (existing) {
    return existing;
  }
  const created = repo.create(build() as any);
  const saved = await repo.save(created as any);
  console.log(`  + [Creado] ${label}`);
  return saved as T;
}

export async function runMasterSeed() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  console.log('🚀 Conectado a la base de datos. Iniciando sembrado maestro de STIRE...\n');

  // 1. Institución y Programa
  console.log('1. Creando / verificando Institución y Programa...');
  const institutionRepo = AppDataSource.getRepository(Institution);
  const programRepo = AppDataSource.getRepository(Program);

  const institution = await findOrCreate(
    institutionRepo,
    { name: 'Universidad de Córdoba' },
    () => ({ name: 'Universidad de Córdoba' }),
    'Universidad de Córdoba',
  );

  const program = await findOrCreate(
    programRepo,
    { name: 'Ingeniería de Sistemas', institutionId: institution.id },
    () => ({ name: 'Ingeniería de Sistemas', maxSemesters: 10, institutionId: institution.id }),
    'Programa Ingeniería de Sistemas',
  );

  // 2. Usuarios del sistema
  console.log('\n2. Creando / verificando Usuarios (Admin, Docentes, Estudiante)...');
  const userRepo = AppDataSource.getRepository(User);
  const passwordHash = await bcrypt.hash(COMMON_PASSWORD, 10);
  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await findOrCreate(
    userRepo,
    { email: 'admin.sistema@unicor.edu.co' },
    () => ({
      email: 'admin.sistema@unicor.edu.co',
      password: adminHash,
      fullName: 'Administrador del Sistema',
      role: UserRole.ADMIN,
      isActive: true,
    }),
    'Admin: admin.sistema@unicor.edu.co',
  );

  const teacherToscano = await findOrCreate(
    userRepo,
    { email: 'roberto.toscano@unicor.edu.co' },
    () => ({
      email: 'roberto.toscano@unicor.edu.co',
      password: passwordHash,
      fullName: 'Prof. Roberto Toscano Miranda',
      role: UserRole.DOCENTE,
      isActive: true,
    }),
    'Docente: Roberto Toscano',
  );

  const teacherCastro = await findOrCreate(
    userRepo,
    { email: 'victor.castro@unicor.edu.co' },
    () => ({
      email: 'victor.castro@unicor.edu.co',
      password: passwordHash,
      fullName: 'Prof. Victor Castro',
      role: UserRole.DOCENTE,
      isActive: true,
    }),
    'Docente: Victor Castro',
  );

  const teacherAli = await findOrCreate(
    userRepo,
    { email: 'ali.docente@unicor.edu.co' },
    () => ({
      email: 'ali.docente@unicor.edu.co',
      password: passwordHash,
      fullName: 'Prof. Ali Pérez',
      role: UserRole.DOCENTE,
      isActive: true,
    }),
    'Docente: Ali Pérez',
  );

  const studentPedro = await findOrCreate(
    userRepo,
    { email: 'pedro.estudiante@unicor.edu.co' },
    () => ({
      email: 'pedro.estudiante@unicor.edu.co',
      password: passwordHash,
      fullName: 'Pedro Romero Mendoza',
      role: UserRole.ESTUDIANTE,
      isActive: true,
    }),
    'Estudiante: Pedro Romero',
  );

  // 3. Clases de los Docentes
  console.log('\n3. Creando / verificando Clases con códigos únicos...');
  const classRepo = AppDataSource.getRepository(Class);

  const classToscano = await findOrCreate(
    classRepo,
    { code: 'ALGO-WEB-T01' },
    () => ({
      name: 'Algoritmos Básicos con HTML5, CSS y JavaScript',
      description: 'Diseña e implementa algoritmos básicos (O) utilizando HTML5, CSS y JavaScript (C), con el propósito de resolver problemas sencillos en el contexto del desarrollo web (F).',
      code: 'ALGO-WEB-T01',
      teacherId: teacherToscano.id,
      isActive: true,
    }),
    'Clase Toscano: ALGO-WEB-T01',
  );

  const classCastro = await findOrCreate(
    classRepo,
    { code: 'ALGO-WEB-V02' },
    () => ({
      name: 'Algoritmia y Lógica Computacional para la Web',
      description: 'Fundamentos de lógica algorítmica y control de flujo aplicados a interfaces web.',
      code: 'ALGO-WEB-V02',
      teacherId: teacherCastro.id,
      isActive: true,
    }),
    'Clase Castro: ALGO-WEB-V02',
  );

  const classAli = await findOrCreate(
    classRepo,
    { code: 'ALGO-WEB-A03' },
    () => ({
      name: 'Desarrollo Frontend Interactivo y Algoritmos Web',
      description: 'Estructuración y dinamismo web con HTML5, CSS3 y JavaScript esencial.',
      code: 'ALGO-WEB-A03',
      teacherId: teacherAli.id,
      isActive: true,
    }),
    'Clase Ali: ALGO-WEB-A03',
  );

  // 4. Inscripción de Pedro en las clases (múltiples clases)
  console.log('\n4. Matriculando a Pedro en clases...');
  const enrollmentRepo = AppDataSource.getRepository(Enrollment);

  await findOrCreate(
    enrollmentRepo,
    { studentId: studentPedro.id, classId: classToscano.id },
    () => ({
      studentId: studentPedro.id,
      classId: classToscano.id,
      status: EnrollmentStatus.ACTIVE,
      lastActivityAt: new Date(),
    }),
    'Pedro en ALGO-WEB-T01',
  );

  await findOrCreate(
    enrollmentRepo,
    { studentId: studentPedro.id, classId: classCastro.id },
    () => ({
      studentId: studentPedro.id,
      classId: classCastro.id,
      status: EnrollmentStatus.ACTIVE,
      lastActivityAt: new Date(),
    }),
    'Pedro en ALGO-WEB-V02',
  );

  // 5. Tipo de Actividad autocalificable
  console.log('\n5. Verificando Tipos de Actividad...');
  const actTypeRepo = AppDataSource.getRepository(ActivityType);
  const autoType = await findOrCreate(
    actTypeRepo,
    { code: 'AUTO-EVAL' },
    () => ({
      name: 'Evaluación Interactiva Autocalificable',
      code: 'AUTO-EVAL',
      autoGradable: true,
      baseWeight: 1.0,
    }),
    'Tipo de Actividad: AUTO-EVAL',
  );

  // 6. Estructura Curricular de la Clase Principal (Toscano)
  console.log('\n6. Sembrando Secciones, Topics y Unidades de Aprendizaje...');
  const sectionRepo = AppDataSource.getRepository(Section);
  const topicRepo = AppDataSource.getRepository(Topic);
  const unitRepo = AppDataSource.getRepository(LearningUnit);
  const contentRepo = AppDataSource.getRepository(Content);
  const activityRepo = AppDataSource.getRepository(Activity);
  const questionRepo = AppDataSource.getRepository(ActivityQuestion);
  const prereqRepo = AppDataSource.getRepository(Prerequisite);

  // SECCIÓN 1: MÓDULO 1
  const sec1 = await findOrCreate(
    sectionRepo,
    { classId: classToscano.id, title: 'Módulo 1: Fundamentos y Estructuras de Control' },
    () => ({
      classId: classToscano.id,
      title: 'Módulo 1: Fundamentos y Estructuras de Control',
      description: 'Sintaxis básica, manipulación de variables, operadores y lógica computacional aplicada a páginas web.',
      order: 1,
      isPublished: true,
    }),
    'Sección 1: Fundamentos',
  );

  const topic1 = await findOrCreate(
    topicRepo,
    { sectionId: sec1.id, title: 'Tema 1: Sintaxis, Variables y Operadores en la Web' },
    () => ({
      sectionId: sec1.id,
      title: 'Tema 1: Sintaxis, Variables y Operadores en la Web',
      description: 'Declaración de identificadores, tipos primitivos y operaciones aritméticas en JavaScript.',
      order: 1,
      isActive: true,
    }),
    'Tema 1: Variables y Operadores',
  );

  // UNIDAD 1: Variables y Tipos
  const unit1 = await findOrCreate(
    unitRepo,
    { topicId: topic1.id, title: 'Variables, Tipos de Datos y Expresiones Aritméticas' },
    () => ({
      topicId: topic1.id,
      title: 'Variables, Tipos de Datos y Expresiones Aritméticas',
      description: 'Declaración con let/const, tipos primitivos (string, number, boolean) y operaciones matemáticas para interfaces.',
      difficulty: Difficulty.BASICO,
      order: 1,
      isActive: true,
    }),
    'Unidad 1: Variables y Tipos',
  );

  // Contenido teórico Unidad 1
  await findOrCreate(
    contentRepo,
    { learningUnitId: unit1.id, title: 'Conceptos Clave de Variables y Operadores en JavaScript' },
    () => ({
      learningUnitId: unit1.id,
      title: 'Conceptos Clave de Variables y Operadores en JavaScript',
      type: ContentType.MARKDOWN,
      body: `# Variables y Operadores en JavaScript

En el desarrollo web, las variables permiten almacenar estados y valores dinámicos.

\`\`\`javascript
// Declaración con const para valores inmutables
const nombreSitio = "Mi Tienda Web";

// Declaración con let para valores recalculables
let subtotal = 15000;
let tasaDescuento = 0.10;
let total = subtotal - (subtotal * tasaDescuento);

console.log("Total a pagar:", total);
\`\`\`

### Tipos Primitivos en JavaScript
- **Number**: Números enteros y de coma flotante (ej: \`42\`, \`3.14\`).
- **String**: Cadenas de texto delimitadas por comillas simples o dobles.
- **Boolean**: Valores de verdad (\`true\` o \`false\`).
`,
      order: 1,
      isVisible: true,
    }),
    'Contenido Teórico Unidad 1',
  );

  // Actividades Unidad 1 (MÚLTIPLES ACTIVIDADES CON PESOS ADAPTATIVOS)
  // Actividad 1: MCQ (peso 0.20)
  const act1 = await findOrCreate(
    activityRepo,
    { learningUnitId: unit1.id, title: 'Quiz: Variables let/const y Tipos Primitivos' },
    () => ({
      learningUnitId: unit1.id,
      activityTypeId: autoType.id,
      createdBy: teacherToscano.id,
      title: 'Quiz: Variables let/const y Tipos Primitivos',
      description: 'Evaluación conceptual sobre mutabilidad y tipos de datos en JavaScript.',
      difficulty: Difficulty.BASICO,
      totalPoints: 10,
      passingScore: 60,
      attemptsAllowed: 3,
      order: 1,
      status: PublicationStatus.PUBLISHED,
      isRequired: true,
      adaptiveWeight: 0.20,
      publishedAt: new Date(),
    }),
    'Actividad 1 (MCQ - peso 0.20)',
  );
  await findOrCreate(
    questionRepo,
    { activityId: act1.id },
    () => ({
      activityId: act1.id,
      type: QuestionType.MCQ,
      question: '¿Cuál es la diferencia fundamental entre declarar una variable con "const" frente a "let" en JavaScript?',
      points: 10,
      order: 0,
      config: {
        options: [
          { id: 'a', text: 'const impide la reasignación de la variable, mientras que let permite reasignarle un nuevo valor.' },
          { id: 'b', text: 'let solo funciona para números y const solo para cadenas de texto.' },
          { id: 'c', text: 'const solo se puede usar dentro de funciones y let de forma global.' },
          { id: 'd', text: 'No existe ninguna diferencia en tiempo de ejecución.' },
        ],
        correctAnswerId: 'a',
        explanation: 'Las variables declaradas con "const" crean una referencia de solo lectura y no pueden ser reasignadas.',
      },
    }),
    'Pregunta MCQ Actividad 1',
  );

  // Actividad 2: FILL_CODE (peso 0.30)
  const act2 = await findOrCreate(
    activityRepo,
    { learningUnitId: unit1.id, title: 'Completar Código: Operadores de Comparación y Asignación' },
    () => ({
      learningUnitId: unit1.id,
      activityTypeId: autoType.id,
      createdBy: teacherToscano.id,
      title: 'Completar Código: Operadores de Comparación y Asignación',
      description: 'Completa las palabras clave para calcular el subtotal con impuestos en una tienda online.',
      difficulty: Difficulty.BASICO,
      totalPoints: 15,
      passingScore: 60,
      attemptsAllowed: 3,
      order: 2,
      status: PublicationStatus.PUBLISHED,
      isRequired: true,
      adaptiveWeight: 0.30,
      publishedAt: new Date(),
    }),
    'Actividad 2 (FILL_CODE - peso 0.30)',
  );
  await findOrCreate(
    questionRepo,
    { activityId: act2.id },
    () => ({
      activityId: act2.id,
      type: QuestionType.FILL_CODE,
      question: 'Completa las declaraciones de variables y el cálculo del valor total en JavaScript:',
      points: 15,
      order: 0,
      config: {
        codeTemplate: '___b1___ precioBase = 100;\nlet iva = 0.19;\n___b2___ total = precioBase + (precioBase * iva);',
        blanks: [
          { id: 'b1', answer: 'const' },
          { id: 'b2', answer: 'let' },
        ],
      },
    }),
    'Pregunta FILL_CODE Actividad 2',
  );

  // Actividad 3: CODING (peso 0.50) — Calculadora de Descuento
  const act3 = await findOrCreate(
    activityRepo,
    { learningUnitId: unit1.id, title: 'Desafío de Código: Calculadora de Descuento en Carrito Web' },
    () => ({
      learningUnitId: unit1.id,
      activityTypeId: autoType.id,
      createdBy: teacherToscano.id,
      title: 'Desafío de Código: Calculadora de Descuento en Carrito Web',
      description: 'Lee desde stdin el precio de un producto y el porcentaje de descuento (uno por línea), e imprime el precio final a pagar.',
      difficulty: Difficulty.BASICO,
      totalPoints: 25,
      passingScore: 60,
      attemptsAllowed: 5,
      order: 3,
      status: PublicationStatus.PUBLISHED,
      isRequired: true,
      adaptiveWeight: 0.50,
      publishedAt: new Date(),
    }),
    'Actividad 3 (CODING - peso 0.50)',
  );
  await findOrCreate(
    questionRepo,
    { activityId: act3.id },
    () => ({
      activityId: act3.id,
      type: QuestionType.CODING,
      question: 'Escribe un programa en JavaScript que lea dos números desde la entrada estándar: el precio original y el porcentaje de descuento (0 a 100). Imprime el valor final resultante tras aplicar el descuento.',
      points: 25,
      order: 0,
      config: {
        language: 'javascript',
        starterCode: `const fs = require('fs');

// Leer datos desde la entrada estándar
const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
const precio = parseFloat(input[0]);
const descuento = parseFloat(input[1]);

// TODO: Calcula el precio final restando el porcentaje de descuento
const total = precio - (precio * (descuento / 100));

console.log(total);
`,
        testCases: [
          { label: 'Público 1: 10% de 100', input: '100\n10', expected: '90', isPublic: true },
          { label: 'Público 2: 25% de 200', input: '200\n25', expected: '150', isPublic: true },
          { label: 'Oculto 1: Sin descuento', input: '50\n0', expected: '50', isPublic: false },
          { label: 'Oculto 2: 50% de 80', input: '80\n50', expected: '40', isPublic: false },
        ],
      },
    }),
    'Pregunta CODING Actividad 3',
  );

  // UNIDAD 2: Condicionales y Validación Lógica
  const unit2 = await findOrCreate(
    unitRepo,
    { topicId: topic1.id, title: 'Condicionales y Bifurcaciones Lógicas en la Web' },
    () => ({
      topicId: topic1.id,
      title: 'Condicionales y Bifurcaciones Lógicas en la Web',
      description: 'Toma de decisiones con if, else if, else y operadores lógicos para validación de formularios.',
      difficulty: Difficulty.BASICO,
      order: 2,
      isActive: true,
    }),
    'Unidad 2: Condicionales',
  );

  // Prerrequisito: Unidad 2 requiere Unidad 1 con maestría >= 60%
  await findOrCreate(
    prereqRepo,
    { targetUnitId: unit2.id, requiredUnitId: unit1.id },
    () => ({
      targetUnitId: unit2.id,
      requiredUnitId: unit1.id,
      minMasteryRequired: 60,
    }),
    'Prerrequisito: Unidad 2 requiere Unidad 1 (≥ 60%)',
  );

  // Actividades Unidad 2
  // Actividad 4: MCQ (peso 0.25)
  const act4 = await findOrCreate(
    activityRepo,
    { learningUnitId: unit2.id, title: 'Quiz: Lógica Booleana y Tablas de Verdad' },
    () => ({
      learningUnitId: unit2.id,
      activityTypeId: autoType.id,
      createdBy: teacherToscano.id,
      title: 'Quiz: Lógica Booleana y Tablas de Verdad',
      description: 'Evaluación sobre operadores lógicos &&, || y ! en validaciones web.',
      difficulty: Difficulty.BASICO,
      totalPoints: 10,
      passingScore: 60,
      attemptsAllowed: 3,
      order: 1,
      status: PublicationStatus.PUBLISHED,
      isRequired: true,
      adaptiveWeight: 0.25,
      publishedAt: new Date(),
    }),
    'Actividad 4 (MCQ - peso 0.25)',
  );
  await findOrCreate(
    questionRepo,
    { activityId: act4.id },
    () => ({
      activityId: act4.id,
      type: QuestionType.MCQ,
      question: 'En la expresión `(edad >= 18 && tienePermiso)`, ¿cuándo se evalúa a verdadero (true)?',
      points: 10,
      order: 0,
      config: {
        options: [
          { id: 'a', text: 'Solo cuando AMBAS condiciones sean verdaderas simultáneamente.' },
          { id: 'b', text: 'Cuando al menos una de las dos condiciones sea verdadera.' },
          { id: 'c', text: 'Cuando edad sea exactamente 18, sin importar el permiso.' },
          { id: 'd', text: 'Siempre es verdadera si tienePermiso es falso.' },
        ],
        correctAnswerId: 'a',
        explanation: 'El operador lógico && (AND) requiere que ambos operandos sean verdaderos.',
      },
    }),
    'Pregunta MCQ Actividad 4',
  );

  // Actividad 5: FILL_CODE (peso 0.35)
  const act5 = await findOrCreate(
    activityRepo,
    { learningUnitId: unit2.id, title: 'Completar Código: Validador de Formulario de Registro' },
    () => ({
      learningUnitId: unit2.id,
      activityTypeId: autoType.id,
      createdBy: teacherToscano.id,
      title: 'Completar Código: Validador de Formulario de Registro',
      description: 'Completa la condición de validación para aceptar mayores de edad en el registro.',
      difficulty: Difficulty.BASICO,
      totalPoints: 15,
      passingScore: 60,
      attemptsAllowed: 3,
      order: 2,
      status: PublicationStatus.PUBLISHED,
      isRequired: true,
      adaptiveWeight: 0.35,
      publishedAt: new Date(),
    }),
    'Actividad 5 (FILL_CODE - peso 0.35)',
  );
  await findOrCreate(
    questionRepo,
    { activityId: act5.id },
    () => ({
      activityId: act5.id,
      type: QuestionType.FILL_CODE,
      question: 'Completa el condicional para verificar si el usuario tiene al menos 18 años:',
      points: 15,
      order: 0,
      config: {
        codeTemplate: 'if (edad ___b1___ 18) {\n  console.log("Valido");\n} ___b2___ {\n  console.log("Invalido");\n}',
        blanks: [
          { id: 'b1', answer: '>=' },
          { id: 'b2', answer: 'else' },
        ],
      },
    }),
    'Pregunta FILL_CODE Actividad 5',
  );

  // Actividad 6: CODING (peso 0.40) — Validador de Acceso
  const act6 = await findOrCreate(
    activityRepo,
    { learningUnitId: unit2.id, title: 'Desafío de Código: Validador de Acceso por Edad' },
    () => ({
      learningUnitId: unit2.id,
      activityTypeId: autoType.id,
      createdBy: teacherToscano.id,
      title: 'Desafío de Código: Validador de Acceso por Edad',
      description: 'Lee la edad del usuario desde stdin e imprime "Acceso concedido" si tiene 18 o más, o "Acceso denegado" en caso contrario.',
      difficulty: Difficulty.BASICO,
      totalPoints: 25,
      passingScore: 60,
      attemptsAllowed: 5,
      order: 3,
      status: PublicationStatus.PUBLISHED,
      isRequired: true,
      adaptiveWeight: 0.40,
      publishedAt: new Date(),
    }),
    'Actividad 6 (CODING - peso 0.40)',
  );
  await findOrCreate(
    questionRepo,
    { activityId: act6.id },
    () => ({
      activityId: act6.id,
      type: QuestionType.CODING,
      question: 'Lee la edad (número entero) desde la entrada estándar. Si edad >= 18 imprime "Acceso concedido", de lo contrario imprime "Acceso denegado".',
      points: 25,
      order: 0,
      config: {
        language: 'javascript',
        starterCode: `const fs = require('fs');

const input = fs.readFileSync(0, 'utf-8').trim();
const edad = parseInt(input, 10);

if (edad >= 18) {
  console.log('Acceso concedido');
} else {
  console.log('Acceso denegado');
}
`,
        testCases: [
          { label: 'Público 1: Mayor de edad', input: '20', expected: 'Acceso concedido', isPublic: true },
          { label: 'Público 2: Menor de edad', input: '15', expected: 'Acceso denegado', isPublic: true },
          { label: 'Oculto 1: Edad límite exacta', input: '18', expected: 'Acceso concedido', isPublic: false },
          { label: 'Oculto 2: Edad 17 años', input: '17', expected: 'Acceso denegado', isPublic: false },
        ],
      },
    }),
    'Pregunta CODING Actividad 6',
  );

  // SECCIÓN 2: MÓDULO 2
  const sec2 = await findOrCreate(
    sectionRepo,
    { classId: classToscano.id, title: 'Módulo 2: Bucles, Iteraciones y Manipulación de Colecciones' },
    () => ({
      classId: classToscano.id,
      title: 'Módulo 2: Bucles, Iteraciones y Manipulación de Colecciones',
      description: 'Estructuras iterativas for/while, recorrido de arreglos y algoritmos de agregación y filtrado.',
      order: 2,
      isPublished: true,
    }),
    'Sección 2: Bucles y Arreglos',
  );

  const topic2 = await findOrCreate(
    topicRepo,
    { sectionId: sec2.id, title: 'Tema 2: Ciclos Repetitivos e Iteración sobre Listas' },
    () => ({
      sectionId: sec2.id,
      title: 'Tema 2: Ciclos Repetitivos e Iteración sobre Listas',
      description: 'Automatización de tareas repetitivas y cálculo de acumuladores.',
      order: 1,
      isActive: true,
    }),
    'Tema 2: Ciclos',
  );

  // UNIDAD 3: Bucles for y while
  const unit3 = await findOrCreate(
    unitRepo,
    { topicId: topic2.id, title: 'Bucles for y while para Procesamiento de Datos' },
    () => ({
      topicId: topic2.id,
      title: 'Bucles for y while para Procesamiento de Datos',
      description: 'Condiciones de inicio, avance y parada en bucles e invariantes de ciclo.',
      difficulty: Difficulty.INTERMEDIO,
      order: 1,
      isActive: true,
    }),
    'Unidad 3: Bucles for/while',
  );

  await findOrCreate(
    prereqRepo,
    { targetUnitId: unit3.id, requiredUnitId: unit2.id },
    () => ({
      targetUnitId: unit3.id,
      requiredUnitId: unit2.id,
      minMasteryRequired: 60,
    }),
    'Prerrequisito: Unidad 3 requiere Unidad 2 (≥ 60%)',
  );

  // Actividad 7: MCQ (peso 0.30)
  const act7 = await findOrCreate(
    activityRepo,
    { learningUnitId: unit3.id, title: 'Quiz: Invariantes y Condiciones de Parada' },
    () => ({
      learningUnitId: unit3.id,
      activityTypeId: autoType.id,
      createdBy: teacherToscano.id,
      title: 'Quiz: Invariantes y Condiciones de Parada',
      description: 'Conceptos fundamentales de ciclos determinados e indeterminados.',
      difficulty: Difficulty.INTERMEDIO,
      totalPoints: 10,
      passingScore: 60,
      attemptsAllowed: 3,
      order: 1,
      status: PublicationStatus.PUBLISHED,
      isRequired: true,
      adaptiveWeight: 0.30,
      publishedAt: new Date(),
    }),
    'Actividad 7 (MCQ - peso 0.30)',
  );
  await findOrCreate(
    questionRepo,
    { activityId: act7.id },
    () => ({
      activityId: act7.id,
      type: QuestionType.MCQ,
      question: '¿Qué sucede si dentro de un bucle `while` nunca se modifica la variable de control de la condición?',
      points: 10,
      order: 0,
      config: {
        options: [
          { id: 'a', text: 'Se produce un bucle infinito y el programa se bloquea.' },
          { id: 'b', text: 'JavaScript lanza un error de sintaxis al compilar.' },
          { id: 'c', text: 'El bucle se ejecuta exactamente una sola vez.' },
          { id: 'd', text: 'La condición se invierte automáticamente.' },
        ],
        correctAnswerId: 'a',
        explanation: 'Si la condición de parada nunca se hace falsa, el bucle se ejecuta indefinidamente consumiendo CPU.',
      },
    }),
    'Pregunta MCQ Actividad 7',
  );

  // Actividad 8: CODING (peso 0.70) — Sumatoria de Lista
  const act8 = await findOrCreate(
    activityRepo,
    { learningUnitId: unit3.id, title: 'Desafío de Código: Sumatoria de Elementos de una Lista' },
    () => ({
      learningUnitId: unit3.id,
      activityTypeId: autoType.id,
      createdBy: teacherToscano.id,
      title: 'Desafío de Código: Sumatoria de Elementos de una Lista',
      description: 'Lee un número N que indica la cantidad de elementos, y a continuación N números enteros. Imprime la sumatoria total.',
      difficulty: Difficulty.INTERMEDIO,
      totalPoints: 30,
      passingScore: 60,
      attemptsAllowed: 5,
      order: 2,
      status: PublicationStatus.PUBLISHED,
      isRequired: true,
      adaptiveWeight: 0.70,
      publishedAt: new Date(),
    }),
    'Actividad 8 (CODING - peso 0.70)',
  );
  await findOrCreate(
    questionRepo,
    { activityId: act8.id },
    () => ({
      activityId: act8.id,
      type: QuestionType.CODING,
      question: 'La primera línea de entrada contiene N (cantidad de números). Las siguientes N líneas contienen los números. Imprime la suma de todos ellos.',
      points: 30,
      order: 0,
      config: {
        language: 'javascript',
        starterCode: `const fs = require('fs');

const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n').filter(Boolean);
const n = parseInt(lines[0], 10);
let suma = 0;

for (let i = 1; i <= n; i++) {
  suma += parseInt(lines[i], 10);
}

console.log(suma);
`,
        testCases: [
          { label: 'Público 1: 3 elementos', input: '3\n10\n20\n30', expected: '60', isPublic: true },
          { label: 'Público 2: 2 elementos', input: '2\n5\n15', expected: '20', isPublic: true },
          { label: 'Oculto 1: 1 elemento', input: '1\n42', expected: '42', isPublic: false },
          { label: 'Oculto 2: 4 elementos con ceros', input: '4\n0\n100\n0\n50', expected: '150', isPublic: false },
        ],
      },
    }),
    'Pregunta CODING Actividad 8',
  );

  // UNIDAD 4: Arreglos y Filtros
  const unit4 = await findOrCreate(
    unitRepo,
    { topicId: topic2.id, title: 'Arreglos y Búsqueda de Información en el Frontend' },
    () => ({
      topicId: topic2.id,
      title: 'Arreglos y Búsqueda de Información en el Frontend',
      description: 'Indexación base cero, métodos de búsqueda y algoritmos de filtrado de elementos.',
      difficulty: Difficulty.INTERMEDIO,
      order: 2,
      isActive: true,
    }),
    'Unidad 4: Arreglos',
  );

  // Actividad 9: MCQ (peso 0.30)
  const act9 = await findOrCreate(
    activityRepo,
    { learningUnitId: unit4.id, title: 'Quiz: Métodos y Propiedades de Arrays' },
    () => ({
      learningUnitId: unit4.id,
      activityTypeId: autoType.id,
      createdBy: teacherToscano.id,
      title: 'Quiz: Métodos y Propiedades de Arrays',
      description: 'Evaluación sobre manipulación de arreglos en JavaScript.',
      difficulty: Difficulty.INTERMEDIO,
      totalPoints: 10,
      passingScore: 60,
      attemptsAllowed: 3,
      order: 1,
      status: PublicationStatus.PUBLISHED,
      isRequired: true,
      adaptiveWeight: 0.30,
      publishedAt: new Date(),
    }),
    'Actividad 9 (MCQ - peso 0.30)',
  );
  await findOrCreate(
    questionRepo,
    { activityId: act9.id },
    () => ({
      activityId: act9.id,
      type: QuestionType.MCQ,
      question: 'Dado un arreglo `const arr = [10, 20, 30]`, ¿cuál es el índice del primer elemento y el valor de `arr.length`?',
      points: 10,
      order: 0,
      config: {
        options: [
          { id: 'a', text: 'El índice inicial es 0 y length es 3.' },
          { id: 'b', text: 'El índice inicial es 1 y length es 3.' },
          { id: 'c', text: 'El índice inicial es 0 y length es 2.' },
          { id: 'd', text: 'El índice inicial es 1 y length es 2.' },
        ],
        correctAnswerId: 'a',
        explanation: 'En JavaScript los arreglos están indexados en base cero (primer elemento en 0) y su longitud refleja la cantidad de elementos.',
      },
    }),
    'Pregunta MCQ Actividad 9',
  );

  // Actividad 10: CODING (peso 0.70) — Contador de Aprobados
  const act10 = await findOrCreate(
    activityRepo,
    { learningUnitId: unit4.id, title: 'Desafío de Código: Contador de Notas Aprobatorias' },
    () => ({
      learningUnitId: unit4.id,
      activityTypeId: autoType.id,
      createdBy: teacherToscano.id,
      title: 'Desafío de Código: Contador de Notas Aprobatorias',
      description: 'Lee N notas de estudiantes e imprime cuántos obtuvieron calificación aprobatoria (nota >= 60).',
      difficulty: Difficulty.INTERMEDIO,
      totalPoints: 30,
      passingScore: 60,
      attemptsAllowed: 5,
      order: 2,
      status: PublicationStatus.PUBLISHED,
      isRequired: true,
      adaptiveWeight: 0.70,
      publishedAt: new Date(),
    }),
    'Actividad 10 (CODING - peso 0.70)',
  );
  await findOrCreate(
    questionRepo,
    { activityId: act10.id },
    () => ({
      activityId: act10.id,
      type: QuestionType.CODING,
      question: 'La primera línea contiene N (cantidad de notas). Las siguientes N líneas contienen notas enteras de 0 a 100. Imprime la cantidad de notas que son mayores o iguales a 60.',
      points: 30,
      order: 0,
      config: {
        language: 'javascript',
        starterCode: `const fs = require('fs');

const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n').filter(Boolean);
const n = parseInt(lines[0], 10);
let aprobados = 0;

for (let i = 1; i <= n; i++) {
  const nota = parseInt(lines[i], 10);
  if (nota >= 60) {
    aprobados++;
  }
}

console.log(aprobados);
`,
        testCases: [
          { label: 'Público 1: 4 notas variadas', input: '4\n70\n45\n85\n60', expected: '3', isPublic: true },
          { label: 'Público 2: Ningún aprobado', input: '3\n50\n40\n30', expected: '0', isPublic: true },
          { label: 'Oculto 1: Todos aprobados', input: '2\n90\n100', expected: '2', isPublic: false },
          { label: 'Oculto 2: Nota límite 59 vs 60', input: '2\n59\n60', expected: '1', isPublic: false },
        ],
      },
    }),
    'Pregunta CODING Actividad 10',
  );

  // SECCIÓN 3: MÓDULO 3
  const sec3 = await findOrCreate(
    sectionRepo,
    { classId: classToscano.id, title: 'Módulo 3: Funciones y Modularidad en Desarrollo Web' },
    () => ({
      classId: classToscano.id,
      title: 'Módulo 3: Funciones y Modularidad en Desarrollo Web',
      description: 'Funciones puras, parámetros, valores de retorno y algoritmos utilitarios para el frontend.',
      order: 3,
      isPublished: true,
    }),
    'Sección 3: Funciones',
  );

  const topic3 = await findOrCreate(
    topicRepo,
    { sectionId: sec3.id, title: 'Tema 3: Funciones y Reutilización de Código' },
    () => ({
      sectionId: sec3.id,
      title: 'Tema 3: Funciones y Reutilización de Código',
      description: 'Modularización de lógica algorítmica y funciones puras.',
      order: 1,
      isActive: true,
    }),
    'Tema 3: Funciones',
  );

  // UNIDAD 5: Funciones Puras
  const unit5 = await findOrCreate(
    unitRepo,
    { topicId: topic3.id, title: 'Funciones Puras, Parámetros y Retorno de Valores' },
    () => ({
      topicId: topic3.id,
      title: 'Funciones Puras, Parámetros y Retorno de Valores',
      description: 'Declaración de funciones, parámetros, retorno y buenas prácticas.',
      difficulty: Difficulty.INTERMEDIO,
      order: 1,
      isActive: true,
    }),
    'Unidad 5: Funciones Puras',
  );

  // Actividad 11: FILL_CODE (peso 0.40)
  const act11 = await findOrCreate(
    activityRepo,
    { learningUnitId: unit5.id, title: 'Completar Código: Función para Formatear Precios' },
    () => ({
      learningUnitId: unit5.id,
      activityTypeId: autoType.id,
      createdBy: teacherToscano.id,
      title: 'Completar Código: Función para Formatear Precios',
      description: 'Completa la sintaxis de una función flecha reutilizable.',
      difficulty: Difficulty.INTERMEDIO,
      totalPoints: 20,
      passingScore: 60,
      attemptsAllowed: 3,
      order: 1,
      status: PublicationStatus.PUBLISHED,
      isRequired: true,
      adaptiveWeight: 0.40,
      publishedAt: new Date(),
    }),
    'Actividad 11 (FILL_CODE - peso 0.40)',
  );
  await findOrCreate(
    questionRepo,
    { activityId: act11.id },
    () => ({
      activityId: act11.id,
      type: QuestionType.FILL_CODE,
      question: 'Completa la declaración de la función para formatear precios con símbolo de moneda:',
      points: 20,
      order: 0,
      config: {
        codeTemplate: 'const formatearPrecio = (valor) ___b1___ {\n  ___b2___ `$${valor.toFixed(2)}`;\n};',
        blanks: [
          { id: 'b1', answer: '=>' },
          { id: 'b2', answer: 'return' },
        ],
      },
    }),
    'Pregunta FILL_CODE Actividad 11',
  );

  // Actividad 12: CODING (peso 0.60) — Generador de Slugs
  const act12 = await findOrCreate(
    activityRepo,
    { learningUnitId: unit5.id, title: 'Desafío de Código: Generador de Slugs para URLs' },
    () => ({
      learningUnitId: unit5.id,
      activityTypeId: autoType.id,
      createdBy: teacherToscano.id,
      title: 'Desafío de Código: Generador de Slugs para URLs',
      description: 'Lee un título con palabras separadas por espacios e imprime su slug en minúsculas separado por guiones.',
      difficulty: Difficulty.INTERMEDIO,
      totalPoints: 30,
      passingScore: 60,
      attemptsAllowed: 5,
      order: 2,
      status: PublicationStatus.PUBLISHED,
      isRequired: true,
      adaptiveWeight: 0.60,
      publishedAt: new Date(),
    }),
    'Actividad 12 (CODING - peso 0.60)',
  );
  await findOrCreate(
    questionRepo,
    { activityId: act12.id },
    () => ({
      activityId: act12.id,
      type: QuestionType.CODING,
      question: 'Escribe un programa que lea un texto de entrada estándar y lo transforme en slug para URL web: en minúsculas y reemplazando los espacios por guiones medios (-).',
      points: 30,
      order: 0,
      config: {
        language: 'javascript',
        starterCode: `const fs = require('fs');

const input = fs.readFileSync(0, 'utf-8').trim();

// Transformar a minúsculas y reemplazar espacios por guiones
const slug = input.toLowerCase().replace(/\\s+/g, '-');

console.log(slug);
`,
        testCases: [
          { label: 'Público 1: Tres palabras', input: 'Curso de Programacion', expected: 'curso-de-programacion', isPublic: true },
          { label: 'Público 2: Dos palabras', input: 'Hola Mundo', expected: 'hola-mundo', isPublic: true },
          { label: 'Oculto 1: Una sola palabra', input: 'JavaScript', expected: 'javascript', isPublic: false },
          { label: 'Oculto 2: Espacios múltiples', input: 'Algoritmos   Web  Faciles', expected: 'algoritmos-web-faciles', isPublic: false },
        ],
      },
    }),
    'Pregunta CODING Actividad 12',
  );

  // ─── Nivel 2: Actividades DRAG_DROP, ORDERING y MATCHING ───────────────────

  // Actividad 13: DRAG_DROP en unit4 (Clasificación de Métodos de Arrays)
  const act13 = await findOrCreate(
    activityRepo,
    { learningUnitId: unit4.id, title: 'Clasificación: Métodos Mutables vs Inmutables de Arrays' },
    () => ({
      learningUnitId: unit4.id,
      activityTypeId: autoType.id,
      createdBy: teacherToscano.id,
      title: 'Clasificación: Métodos Mutables vs Inmutables de Arrays',
      description: 'Clasifica los métodos de arreglos según modifiquen el arreglo original o retornen una copia nueva.',
      difficulty: Difficulty.INTERMEDIO,
      totalPoints: 20,
      passingScore: 60,
      attemptsAllowed: 3,
      order: 3,
      status: PublicationStatus.PUBLISHED,
      isRequired: true,
      adaptiveWeight: 0.35,
      publishedAt: new Date(),
    }),
    'Actividad 13 (DRAG_DROP - peso 0.35)',
  );
  await findOrCreate(
    questionRepo,
    { activityId: act13.id },
    () => ({
      activityId: act13.id,
      type: QuestionType.DRAG_DROP,
      question: 'Arrastra o asigna cada método de Array a su categoría correspondiente (Mutadores vs Inmutables):',
      points: 20,
      order: 0,
      config: {
        items: [
          { id: 'item_push', content: 'arr.push()' },
          { id: 'item_pop', content: 'arr.pop()' },
          { id: 'item_map', content: 'arr.map()' },
          { id: 'item_filter', content: 'arr.filter()' },
        ],
        targets: [
          { id: 'zone_mut', label: 'Mutan el arreglo original' },
          { id: 'zone_inmut', label: 'Retornan un nuevo arreglo' },
        ],
        mappings: {
          item_push: 'zone_mut',
          item_pop: 'zone_mut',
          item_map: 'zone_inmut',
          item_filter: 'zone_inmut',
        },
      },
    }),
    'Pregunta DRAG_DROP Actividad 13',
  );

  // Actividad 14: ORDERING en unit3 (Flujo de Ejecución de un Bucle For)
  const act14 = await findOrCreate(
    activityRepo,
    { learningUnitId: unit3.id, title: 'Secuencia: Fases de Ejecución del Bucle For' },
    () => ({
      learningUnitId: unit3.id,
      activityTypeId: autoType.id,
      createdBy: teacherToscano.id,
      title: 'Secuencia: Fases de Ejecución del Bucle For',
      description: 'Ordena cronológicamente los pasos que ejecuta el motor de JavaScript en un ciclo for.',
      difficulty: Difficulty.INTERMEDIO,
      totalPoints: 20,
      passingScore: 60,
      attemptsAllowed: 3,
      order: 3,
      status: PublicationStatus.PUBLISHED,
      isRequired: true,
      adaptiveWeight: 0.35,
      publishedAt: new Date(),
    }),
    'Actividad 14 (ORDERING - peso 0.35)',
  );
  await findOrCreate(
    questionRepo,
    { activityId: act14.id },
    () => ({
      activityId: act14.id,
      type: QuestionType.ORDERING,
      question: 'Ordena de primero a último los pasos de ejecución de un ciclo `for (let i = 0; i < N; i++)`:',
      points: 20,
      order: 0,
      config: {
        blocks: [
          { id: 'b_init', content: '1. Inicialización: se define la variable de control (let i = 0)' },
          { id: 'b_eval', content: '2. Condición: se evalúa la expresión lógica (i < N)' },
          { id: 'b_body', content: '3. Cuerpo: se ejecuta el bloque de código entre llaves' },
          { id: 'b_step', content: '4. Actualización: se incrementa la variable de control (i++)' },
        ],
        correctOrder: ['b_init', 'b_eval', 'b_body', 'b_step'],
      },
    }),
    'Pregunta ORDERING Actividad 14',
  );

  // Actividad 15: MATCHING en unit5 (Emparejamiento: Conceptos y Sintaxis de Funciones)
  const act15 = await findOrCreate(
    activityRepo,
    { learningUnitId: unit5.id, title: 'Emparejamiento: Sintaxis y Tipos de Funciones' },
    () => ({
      learningUnitId: unit5.id,
      activityTypeId: autoType.id,
      createdBy: teacherToscano.id,
      title: 'Emparejamiento: Sintaxis y Tipos de Funciones',
      description: 'Empareja cada declaración o término de funciones con su característica o sintaxis correcta.',
      difficulty: Difficulty.INTERMEDIO,
      totalPoints: 20,
      passingScore: 60,
      attemptsAllowed: 3,
      order: 3,
      status: PublicationStatus.PUBLISHED,
      isRequired: true,
      adaptiveWeight: 0.35,
      publishedAt: new Date(),
    }),
    'Actividad 15 (MATCHING - peso 0.35)',
  );
  await findOrCreate(
    questionRepo,
    { activityId: act15.id },
    () => ({
      activityId: act15.id,
      type: QuestionType.MATCHING,
      question: 'Empareja cada concepto de función en JavaScript con su definición correspondiente:',
      points: 20,
      order: 0,
      config: {
        leftColumn: [
          { id: 'l_arrow', content: 'Función Flecha (Arrow Function)' },
          { id: 'l_pure', content: 'Función Pura' },
          { id: 'l_return', content: 'Palabra clave `return`' },
          { id: 'l_param', content: 'Parámetro por Defecto' },
        ],
        rightColumn: [
          { id: 'r_arrow', content: 'Sintaxis concisa que usa la flecha `=>`' },
          { id: 'r_pure', content: 'No produce efectos secundarios y siempre retorna el mismo resultado para las mismas entradas' },
          { id: 'r_return', content: 'Detiene la ejecución de la función y devuelve un valor al llamador' },
          { id: 'r_param', content: 'Valor que se asigna automáticamente si el argumento es omitido o `undefined`' },
        ],
        pairs: {
          l_arrow: 'r_arrow',
          l_pure: 'r_pure',
          l_return: 'r_return',
          l_param: 'r_param',
        },
      },
    }),
    'Pregunta MATCHING Actividad 15',
  );

  // 6b. Contenido curricular mínimo para Castro y Ali.
  // Se mantiene la progresión MCQ -> FILL_CODE -> CODING y cada clave usa
  // findOrCreate para que las corridas repetidas sean idempotentes.
  async function seedClassCurriculum(classEntity: Class, teacherId: number, subject: string): Promise<void> {
    const section = await findOrCreate(
      sectionRepo,
      { classId: classEntity.id, title: `Módulo 1: ${subject}` },
      () => ({ classId: classEntity.id, title: `Módulo 1: ${subject}`, description: `Fundamentos de ${subject.toLowerCase()}.`, order: 1, isPublished: true }),
      `Módulo ${classEntity.name}`,
    );
    const topic = await findOrCreate(
      topicRepo,
      { sectionId: section.id, title: `Tema 1: ${subject}` },
      () => ({ sectionId: section.id, title: `Tema 1: ${subject}`, description: `Conceptos esenciales de ${subject.toLowerCase()}.`, order: 1, isActive: true }),
      `Tema ${classEntity.name}`,
    );
    const unitTitles = [`Fundamentos de ${subject}`, `Aplicaciones de ${subject}`];
    for (let unitIndex = 0; unitIndex < unitTitles.length; unitIndex += 1) {
      const unit = await findOrCreate(
        unitRepo,
        { topicId: topic.id, title: unitTitles[unitIndex] },
        () => ({ topicId: topic.id, title: unitTitles[unitIndex], description: `Unidad práctica de ${subject.toLowerCase()}.`, difficulty: Difficulty.BASICO, order: unitIndex + 1, isActive: true }),
        `${classEntity.name} ${unitTitles[unitIndex]}`,
      );
      await findOrCreate(contentRepo, { learningUnitId: unit.id, title: `Guía de ${unitTitles[unitIndex]}` }, () => ({
        learningUnitId: unit.id, title: `Guía de ${unitTitles[unitIndex]}`, type: ContentType.MARKDOWN,
        body: `# ${unitTitles[unitIndex]}\n\nPractica ${subject.toLowerCase()} con ejemplos guiados.`, order: 1, isVisible: true,
      }), `Contenido ${classEntity.name} ${unitTitles[unitIndex]}`);

      const activities = [
        { type: QuestionType.MCQ, title: `Quiz: conceptos de ${subject}`, points: 10, config: { options: [{ id: 'a', text: 'La opción correcta' }, { id: 'b', text: 'Una opción alternativa' }], correctAnswerId: 'a', explanation: 'La primera opción aplica el concepto.' }, question: `¿Cuál afirmación describe mejor ${subject.toLowerCase()}?` },
        { type: QuestionType.FILL_CODE, title: `Completar código: ${subject}`, points: 15, config: { codeTemplate: '___b1___ resultado = 2 + 2;', blanks: [{ id: 'b1', answer: 'const' }] }, question: 'Completa la declaración válida.' },
        { type: QuestionType.CODING, title: `Desafío de código: ${subject}`, points: 20, config: { language: 'javascript', starterCode: 'const fs = require(\'fs\');\nconst input = fs.readFileSync(0, \'utf-8\').trim();\nconsole.log(input);', testCases: [{ label: 'Caso público', input: '4', expected: '4', isPublic: true }] }, question: `Resuelve un problema básico de ${subject.toLowerCase()}.` },
      ];
      for (let activityIndex = 0; activityIndex < activities.length; activityIndex += 1) {
        const definition = activities[activityIndex];
        const activity = await findOrCreate(activityRepo, { learningUnitId: unit.id, title: definition.title }, () => ({
          learningUnitId: unit.id, activityTypeId: autoType.id, createdBy: teacherId, title: definition.title,
          description: `Actividad de ${subject.toLowerCase()}.`, difficulty: Difficulty.BASICO, totalPoints: definition.points,
          passingScore: 60, attemptsAllowed: 3, order: activityIndex + 1, status: PublicationStatus.PUBLISHED,
          isRequired: true, adaptiveWeight: activityIndex === 0 ? 0.2 : activityIndex === 1 ? 0.3 : 0.5, publishedAt: new Date(),
        }), `${classEntity.name} ${definition.title}`);
        await findOrCreate(questionRepo, { activityId: activity.id }, () => ({
          activityId: activity.id, type: definition.type, question: definition.question, points: definition.points, order: 0, config: definition.config,
        }), `Pregunta ${definition.title}`);
      }
    }
  }

  await seedClassCurriculum(classCastro, teacherCastro.id, 'Algoritmia y lógica computacional');
  await seedClassCurriculum(classAli, teacherAli.id, 'Desarrollo frontend interactivo');

  // 7. Datos de Progreso y Repetición Espaciada para Pedro
  console.log('\n7. Sembrando Progreso y Repetición Espaciada (SM-2) para Pedro...');
  const progressRepo = AppDataSource.getRepository(LearningProgress);
  const reviewRepo = AppDataSource.getRepository(ReviewSchedule);

  // Progreso en Unidad 1 (Dominada: 85%)
  await findOrCreate(
    progressRepo,
    { studentId: studentPedro.id, learningUnitId: unit1.id },
    () => ({
      studentId: studentPedro.id,
      learningUnitId: unit1.id,
      mastery: 85.0,
      status: LearningStatus.DOMINADO,
      attemptsCount: 3,
      completedActivities: 2,
      successRate: 100.0,
      lastActivityId: act3.id,
    }),
    'Progreso Pedro Unidad 1 (85%)',
  );

  // Progreso en Unidad 2 (En Práctica: 40%)
  await findOrCreate(
    progressRepo,
    { studentId: studentPedro.id, learningUnitId: unit2.id },
    () => ({
      studentId: studentPedro.id,
      learningUnitId: unit2.id,
      mastery: 40.0,
      status: LearningStatus.EN_PRACTICA,
      attemptsCount: 1,
      completedActivities: 1,
      successRate: 50.0,
      lastActivityId: act4.id,
    }),
    'Progreso Pedro Unidad 2 (40%)',
  );

  // Repaso Espaciado Unidad 1: Programado a 3 días (al-dia)
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 3);
  await findOrCreate(
    reviewRepo,
    { studentId: studentPedro.id, learningUnitId: unit1.id },
    () => ({
      studentId: studentPedro.id,
      learningUnitId: unit1.id,
      nextReviewDate: futureDate,
      intervalDays: 3,
      easeFactor: 2.5,
      repetitions: 2,
      urgencyLevel: 0,
      lastReviewedAt: new Date(),
    }),
    'Repaso Espaciado Unidad 1 (Al día)',
  );

  // Repaso Espaciado Unidad 2: Vencido hoy (vencido/crítico para demostrar el algoritmo SM-2 en la UI)
  const todayDate = new Date();
  await findOrCreate(
    reviewRepo,
    { studentId: studentPedro.id, learningUnitId: unit2.id },
    () => ({
      studentId: studentPedro.id,
      learningUnitId: unit2.id,
      nextReviewDate: todayDate,
      intervalDays: 1,
      easeFactor: 2.3,
      repetitions: 1,
      urgencyLevel: 2,
      lastReviewedAt: new Date(Date.now() - 86400000),
    }),
    'Repaso Espaciado Unidad 2 (Vencido hoy)',
  );

  console.log('\n======================================================');
  console.log('✅ SEMBRADO MAESTRO DE STIRE COMPLETADO CON ÉXITO');
  console.log('======================================================');
  console.log('Credenciales de Acceso:');
  console.log('  👑 Admin:        admin.sistema@unicor.edu.co    / Admin1234!');
  console.log('  👨‍🏫 Docente 1:   roberto.toscano@unicor.edu.co  / Test1234!');
  console.log('  👨‍🏫 Docente 2:   victor.castro@unicor.edu.co    / Test1234!');
  console.log('  👨‍🏫 Docente 3:   ali.docente@unicor.edu.co      / Test1234!');
  console.log('  👨‍🎓 Estudiante:  pedro.estudiante@unicor.edu.co / Test1234!');
  console.log('\nClases Creadas:');
  console.log(`  - ${classToscano.name} | Código: [ ${classToscano.code} ]`);
  console.log(`  - ${classCastro.name}  | Código: [ ${classCastro.code} ]`);
  console.log(`  - ${classAli.name}     | Código: [ ${classAli.code} ]`);
  console.log('======================================================\n');
}

// Ejecución directa si se llama con npx tsx src/seeds/seed-runner.ts
if (require.main === module) {
  runMasterSeed()
    .then(async () => {
      await AppDataSource.destroy();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('❌ Error en sembrado maestro:', err);
      try {
        await AppDataSource.destroy();
      } catch {
        /* noop */
      }
      process.exit(1);
    });
}
