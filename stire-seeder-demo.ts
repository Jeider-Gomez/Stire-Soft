/**
 * stire-seeder-demo.ts — OLA 2, PUNTO 5b
 *
 * Seeder de demo IDEMPOTENTE: deja el sistema utilizable de punta a punta
 * sin tocar nada que no le pertenezca. A diferencia de stire-seeder-v2/v3/
 * destructivo (que truncan TODA la base de datos), este seeder solo crea
 * sus propios registros, identificados por claves naturales conocidas
 * (email, código de clase, nombre de institución) — si ya existen, los
 * reutiliza en vez de duplicarlos. Ejecutarlo dos veces seguidas produce el
 * mismo resultado que ejecutarlo una vez.
 *
 * Uso: npm run db:seed:demo
 *
 * Crea:
 *   - 1 institución, 1 programa
 *   - 1 clase con su docente
 *   - 3 estudiantes matriculados en esa clase
 *   - 2 unidades de aprendizaje con un prerrequisito entre ellas
 *   - contenido teórico (Markdown) en ambas unidades
 *   - 3 actividades publicadas: 1 MCQ, 1 CODING (JavaScript, con testCase
 *     público) y 1 FILL_CODE
 *
 * Credenciales (todas con la misma contraseña, documentadas también en
 * README.md):
 *   docente.demo@stire.local       / Demo1234!
 *   estudiante1.demo@stire.local   / Demo1234!
 *   estudiante2.demo@stire.local   / Demo1234!
 *   estudiante3.demo@stire.local   / Demo1234!
 */
import * as bcrypt from 'bcrypt';
import { AppDataSource } from './src/data-source';
import { Institution } from './src/institution/entities/institution.entity';
import { Program } from './src/institution/entities/program.entity';
import { User, UserRole } from './src/user/entities/user.entity';
import { Class } from './src/class/entities/class.entity';
import { Enrollment } from './src/enrollment/entities/enrollment.entity';
import { EnrollmentStatus } from './src/enrollment/enums/enrollment-status.enum';
import { Section } from './src/section/entities/section.entity';
import { Topic } from './src/topic/entities/topic.entity';
import { LearningUnit } from './src/learning-unit/entities/learning-unit.entity';
import { Difficulty } from './src/common/enums/difficulty.enum';
import { Prerequisite } from './src/prerequisites/entities/prerequisite.entity';
import { Content } from './src/content/entities/content.entity';
import { ContentType } from './src/common/enums/content-type.enum';
import { ActivityType } from './src/activity-types/entities/activity-type.entity';
import { Activity } from './src/activities/entities/activity.entity';
import { PublicationStatus } from './src/common/enums/status.enum';
import { ActivityQuestion } from './src/activity-questions/entities/activity-question.entity';
import { QuestionType } from './src/common/enums/question-type.enum';

const DEMO_PASSWORD = 'Demo1234!';

async function findOrCreate<T extends { id: number | string }>(
  repo: import('typeorm').Repository<T>,
  where: Partial<T>,
  build: () => Partial<T>,
  label: string,
): Promise<T> {
  const existing = await repo.findOne({ where: where as any });
  if (existing) {
    console.log(`  = ya existía: ${label}`);
    return existing;
  }
  const created = repo.create(build() as any);
  const saved = await repo.save(created as any);
  console.log(`  + creado: ${label}`);
  return saved as T;
}

async function main() {
  await AppDataSource.initialize();
  console.log('Conectado a la base de datos. Sembrando datos de demo (idempotente)...\n');

  console.log('Institución y programa');
  const institution = await findOrCreate(
    AppDataSource.getRepository(Institution),
    { name: 'Universidad de Córdoba (Demo)' },
    () => ({ name: 'Universidad de Córdoba (Demo)' }),
    'Universidad de Córdoba (Demo)',
  );

  const program = await findOrCreate(
    AppDataSource.getRepository(Program),
    { name: 'Ingeniería de Sistemas (Demo)', institutionId: institution.id },
    () => ({ name: 'Ingeniería de Sistemas (Demo)', maxSemesters: 10, institutionId: institution.id }),
    'Ingeniería de Sistemas (Demo)',
  );

  console.log('\nUsuarios');
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const userRepo = AppDataSource.getRepository(User);

  const teacher = await findOrCreate(
    userRepo,
    { email: 'docente.demo@stire.local' },
    () => ({
      email: 'docente.demo@stire.local',
      password: passwordHash,
      fullName: 'Docente Demo',
      role: UserRole.DOCENTE,
      isActive: true,
    }),
    'docente.demo@stire.local',
  );

  const students: User[] = [];
  for (let i = 1; i <= 3; i++) {
    const email = `estudiante${i}.demo@stire.local`;
    const student = await findOrCreate(
      userRepo,
      { email },
      () => ({
        email,
        password: passwordHash,
        fullName: `Estudiante Demo ${i}`,
        role: UserRole.ESTUDIANTE,
        isActive: true,
      }),
      email,
    );
    students.push(student);
  }

  console.log('\nClase y matrículas');
  const demoClass = await findOrCreate(
    AppDataSource.getRepository(Class),
    { code: 'DEMO-STIRE-01' },
    () => ({
      name: 'Fundamentos de Algoritmia — Demo',
      description: 'Clase de demostración generada por db:seed:demo.',
      code: 'DEMO-STIRE-01',
      teacherId: teacher.id,
      isActive: true,
    }),
    'Fundamentos de Algoritmia — Demo (DEMO-STIRE-01)',
  );

  const enrollmentRepo = AppDataSource.getRepository(Enrollment);
  for (const student of students) {
    await findOrCreate(
      enrollmentRepo,
      { classId: demoClass.id, studentId: student.id },
      () => ({
        classId: demoClass.id,
        studentId: student.id,
        status: EnrollmentStatus.ACTIVE,
      }),
      `${student.email} matriculado en DEMO-STIRE-01`,
    );
  }

  console.log('\nSección, topic y unidades de aprendizaje (con prerrequisito)');
  const section = await findOrCreate(
    AppDataSource.getRepository(Section),
    { classId: demoClass.id, title: 'Módulo 1: Fundamentos' },
    () => ({
      classId: demoClass.id,
      title: 'Módulo 1: Fundamentos',
      description: 'Primer módulo de la clase de demo.',
      order: 0,
      isPublished: true,
    }),
    'Módulo 1: Fundamentos',
  );

  const topic = await findOrCreate(
    AppDataSource.getRepository(Topic),
    { sectionId: section.id, title: 'Tema 1: Bases de la programación' },
    () => ({
      sectionId: section.id,
      title: 'Tema 1: Bases de la programación',
      description: 'Variables, tipos de datos y estructuras de control.',
      order: 0,
      isActive: true,
    }),
    'Tema 1: Bases de la programación',
  );

  const learningUnitRepo = AppDataSource.getRepository(LearningUnit);
  const unit1 = await findOrCreate(
    learningUnitRepo,
    { topicId: topic.id, title: 'Unidad 1: Variables y tipos de datos' },
    () => ({
      topicId: topic.id,
      title: 'Unidad 1: Variables y tipos de datos',
      description: 'Declaración, asignación y tipos primitivos.',
      difficulty: Difficulty.BASICO,
      order: 0,
      isActive: true,
    }),
    'Unidad 1: Variables y tipos de datos',
  );

  const unit2 = await findOrCreate(
    learningUnitRepo,
    { topicId: topic.id, title: 'Unidad 2: Estructuras de control' },
    () => ({
      topicId: topic.id,
      title: 'Unidad 2: Estructuras de control',
      description: 'Condicionales if/else y su lógica de decisión.',
      difficulty: Difficulty.BASICO,
      order: 1,
      isActive: true,
    }),
    'Unidad 2: Estructuras de control',
  );

  await findOrCreate(
    AppDataSource.getRepository(Prerequisite),
    { targetUnitId: unit2.id, requiredUnitId: unit1.id },
    () => ({
      targetUnitId: unit2.id,
      requiredUnitId: unit1.id,
      minMasteryRequired: 60,
    }),
    'Unidad 2 requiere Unidad 1 (mastery ≥ 60%)',
  );

  console.log('\nContenido teórico');
  const contentRepo = AppDataSource.getRepository(Content);
  await findOrCreate(
    contentRepo,
    { learningUnitId: unit1.id, title: 'Introducción a las variables' },
    () => ({
      learningUnitId: unit1.id,
      title: 'Introducción a las variables',
      type: ContentType.MARKDOWN,
      body:
        '# Variables\n\nUna **variable** es un espacio de memoria con un nombre, donde se guarda un ' +
        'valor que puede cambiar durante la ejecución del programa.\n\n```javascript\nlet edad = 20;\n' +
        'const nombre = "Ana";\n```\n\n`let` declara una variable que puede reasignarse; `const` declara ' +
        'una que no.',
      order: 0,
      isVisible: true,
    }),
    'Introducción a las variables (Unidad 1)',
  );

  await findOrCreate(
    contentRepo,
    { learningUnitId: unit2.id, title: 'Condicionales if/else' },
    () => ({
      learningUnitId: unit2.id,
      title: 'Condicionales if/else',
      type: ContentType.MARKDOWN,
      body:
        '# Condicionales\n\nUn condicional ejecuta un bloque de código solo si una condición es ' +
        'verdadera.\n\n```javascript\nif (edad >= 18) {\n  console.log("mayor de edad");\n} else {\n  ' +
        'console.log("menor de edad");\n}\n```',
      order: 0,
      isVisible: true,
    }),
    'Condicionales if/else (Unidad 2)',
  );

  console.log('\nTipo de actividad y actividades (MCQ, CODING, FILL_CODE)');
  const activityType = await findOrCreate(
    AppDataSource.getRepository(ActivityType),
    { code: 'DEMO-AUTO' },
    () => ({
      name: 'Ejercicio Autocalificable (Demo)',
      code: 'DEMO-AUTO',
      autoGradable: true,
      baseWeight: 1.0,
    }),
    'Ejercicio Autocalificable (Demo)',
  );

  const activityRepo = AppDataSource.getRepository(Activity);
  const questionRepo = AppDataSource.getRepository(ActivityQuestion);

  const mcqActivity = await findOrCreate(
    activityRepo,
    { learningUnitId: unit1.id, title: 'Quiz: ¿Qué es una variable?' },
    () => ({
      learningUnitId: unit1.id,
      activityTypeId: activityType.id,
      createdBy: teacher.id,
      title: 'Quiz: ¿Qué es una variable?',
      description: 'Pregunta de opción múltiple sobre declaración de variables.',
      difficulty: Difficulty.BASICO,
      totalPoints: 10,
      passingScore: 60,
      attemptsAllowed: 3,
      order: 0,
      status: PublicationStatus.PUBLISHED,
      isRequired: false,
      adaptiveWeight: 1.0,
      publishedAt: new Date(),
    }),
    'Quiz: ¿Qué es una variable? (MCQ)',
  );
  await findOrCreate(
    questionRepo,
    { activityId: mcqActivity.id },
    () => ({
      activityId: mcqActivity.id,
      type: QuestionType.MCQ,
      question: '¿Cuál de las siguientes es una declaración válida de variable en JavaScript?',
      points: 10,
      order: 0,
      config: {
        options: [
          { id: 'a', text: 'let x = 5;' },
          { id: 'b', text: 'variable x = 5' },
          { id: 'c', text: 'int x = 5;' },
          { id: 'd', text: '5 = x;' },
        ],
        correctAnswerId: 'a',
        explanation: '"let" es la forma correcta de declarar una variable reasignable en JavaScript.',
      },
    }),
    'pregunta MCQ de la actividad',
  );

  const codingActivity = await findOrCreate(
    activityRepo,
    { learningUnitId: unit1.id, title: 'Ejercicio: Suma de dos números' },
    () => ({
      learningUnitId: unit1.id,
      activityTypeId: activityType.id,
      createdBy: teacher.id,
      title: 'Ejercicio: Suma de dos números',
      description: 'Lee dos números desde la entrada estándar (uno por línea) e imprime su suma.',
      difficulty: Difficulty.BASICO,
      totalPoints: 20,
      passingScore: 60,
      attemptsAllowed: 3,
      order: 1,
      status: PublicationStatus.PUBLISHED,
      isRequired: false,
      adaptiveWeight: 1.0,
      publishedAt: new Date(),
    }),
    'Ejercicio: Suma de dos números (CODING)',
  );
  await findOrCreate(
    questionRepo,
    { activityId: codingActivity.id },
    () => ({
      activityId: codingActivity.id,
      type: QuestionType.CODING,
      question:
        'Escribe un programa en JavaScript que lea dos números (uno por línea) desde la entrada ' +
        'estándar e imprima su suma.',
      points: 20,
      order: 0,
      config: {
        language: 'javascript',
        testCases: [
          { label: 'público', input: '5\n3', expected: '8', isPublic: true },
          { label: 'oculto', input: '10\n20', expected: '30', isPublic: false },
        ],
      },
    }),
    'pregunta CODING de la actividad (con testCase público)',
  );

  const fillCodeActivity = await findOrCreate(
    activityRepo,
    { learningUnitId: unit2.id, title: 'Completa el condicional' },
    () => ({
      learningUnitId: unit2.id,
      activityTypeId: activityType.id,
      createdBy: teacher.id,
      title: 'Completa el condicional',
      description: 'Rellena los espacios en blanco del código para que la lógica sea correcta.',
      difficulty: Difficulty.BASICO,
      totalPoints: 10,
      passingScore: 60,
      attemptsAllowed: 3,
      order: 0,
      status: PublicationStatus.PUBLISHED,
      isRequired: false,
      adaptiveWeight: 1.0,
      publishedAt: new Date(),
    }),
    'Completa el condicional (FILL_CODE)',
  );
  await findOrCreate(
    questionRepo,
    { activityId: fillCodeActivity.id },
    () => ({
      activityId: fillCodeActivity.id,
      type: QuestionType.FILL_CODE,
      question: 'Completa el condicional para que imprima "mayor de edad" cuando edad sea 18 o más.',
      points: 10,
      order: 0,
      config: {
        codeTemplate:
          'if (edad ___b1___ 18) {\n  console.log("mayor de edad");\n} ___b2___ {\n  console.log("menor de edad");\n}',
        blanks: [
          { id: 'b1', answer: '>=' },
          { id: 'b2', answer: 'else' },
        ],
      },
    }),
    'pregunta FILL_CODE de la actividad',
  );

  // Fase 25: ejercicio de HTML y CSS calificado por reglas (2 públicas, 3 ocultas). La solución modelo cumple las 5.
  const htmlCssActivity = await findOrCreate(
    activityRepo,
    { learningUnitId: unit2.id, title: 'Página de bienvenida (HTML y CSS)' },
    () => ({
      learningUnitId: unit2.id,
      activityTypeId: activityType.id,
      createdBy: teacher.id,
      title: 'Página de bienvenida (HTML y CSS)',
      description: 'Escribe el HTML y el CSS de una página de bienvenida.',
      difficulty: Difficulty.BASICO,
      totalPoints: 20,
      passingScore: 60,
      attemptsAllowed: 3,
      order: 2,
      status: PublicationStatus.PUBLISHED,
      isRequired: false,
      adaptiveWeight: 1.0,
      publishedAt: new Date(),
    }),
    'Página de bienvenida (HTML_CSS)',
  );
  await findOrCreate(
    questionRepo,
    { activityId: htmlCssActivity.id },
    () => ({
      activityId: htmlCssActivity.id,
      type: QuestionType.HTML_CSS,
      question:
        'Crea una página de bienvenida: un título principal (h1) con el texto «Hola», una lista con al menos dos elementos, ' +
        'una imagen con su texto alternativo, y el título en color rojo.',
      points: 20,
      order: 0,
      config: {
        starterHtml: '<h1></h1>\n',
        starterCss: '',
        rules: [
          { id: 'titulo', label: 'Hay un h1 con el texto «Hola»', hint: 'Escribe Hola dentro del h1', isPublic: true, weight: 20, check: { kind: 'text', selector: 'h1', mode: 'contains', value: 'Hola' } },
          { id: 'lista', label: 'Hay una lista (ul) con al menos 2 elementos', isPublic: true, weight: 20, check: { kind: 'element_count', selector: 'ul > li', min: 2 } },
          { id: 'imagen', label: 'Hay una imagen', isPublic: false, weight: 20, check: { kind: 'element_exists', selector: 'img' } },
          { id: 'alt', label: 'Todas las imágenes tienen alt', isPublic: false, weight: 20, check: { kind: 'a11y', check: 'img_alt' } },
          { id: 'color', label: 'El título es rojo', isPublic: false, weight: 20, check: { kind: 'css_property', selector: 'h1', property: 'color', oneOf: ['red', '#ff0000'] } },
        ],
        modelSolution: {
          html: '<h1>Hola</h1>\n<ul>\n  <li>Uno</li>\n  <li>Dos</li>\n</ul>\n<img src="logo.png" alt="Logo de STIRE">\n',
          css: 'h1 { color: red; }\n',
        },
      },
    }),
    'pregunta HTML_CSS de la actividad',
  );

  console.log('\n✅ Seed de demo completo. Credenciales:');
  console.log('   docente.demo@stire.local       / ' + DEMO_PASSWORD);
  console.log('   estudiante1.demo@stire.local   / ' + DEMO_PASSWORD);
  console.log('   estudiante2.demo@stire.local   / ' + DEMO_PASSWORD);
  console.log('   estudiante3.demo@stire.local   / ' + DEMO_PASSWORD);
  console.log(`   Clase: ${demoClass.name} (código ${demoClass.code})`);

  await AppDataSource.destroy();
}

main().catch(async (err) => {
  console.error('Error sembrando datos de demo:', err);
  try {
    await AppDataSource.destroy();
  } catch {
    /* noop */
  }
  process.exit(1);
});
