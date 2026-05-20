/**
 * stire-seeder-destructivo.ts — Seeder de QA Destructivo y Validación para STIRE
 */
import * as mysql from 'mysql2/promise';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Lector minimalista de .env para evitar dependencias
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            for (const line of content.split(/\r?\n/)) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) continue;
                const index = trimmed.indexOf('=');
                if (index > 0) {
                    const key = trimmed.substring(0, index).trim();
                    let val = trimmed.substring(index + 1).trim();
                    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
                    process.env[key] = val;
                }
            }
        }
    } catch (e) {}
}

loadEnv();

type Conn = mysql.Connection;

// Utilidad para JWT firma manual (HS256) con crypto nativo
function generateJwt(userId: number, email: string, role: string): string {
    const secret = process.env.JWT_SECRET || 'supersecret123';
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
        sub: userId,
        email,
        role,
        // Expira en 30 días
        exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    };
    
    const base64UrlEncode = (obj: any) => 
        Buffer.from(JSON.stringify(obj))
            .toString('base64')
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
            
    const headerEncoded = base64UrlEncode(header);
    const payloadEncoded = base64UrlEncode(payload);
    
    const signature = crypto
        .createHmac('sha256', secret)
        .update(`${headerEncoded}.${payloadEncoded}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
        
    return `${headerEncoded}.${payloadEncoded}.${signature}`;
}

async function connect(): Promise<Conn> {
    return mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_DATABASE || 'basestire'
    });
}

async function wipe(db: Conn) {
    console.log('🧹 Limpiando BD para escenario de QA Destructivo...');
    await db.query('SET FOREIGN_KEY_CHECKS=0');
    const [tables] = await db.query('SHOW TABLES') as any;
    for (const r of tables) {
        await db.query(`TRUNCATE TABLE \`${Object.values(r)[0]}\``);
    }
    await db.query('SET FOREIGN_KEY_CHECKS=1');
    await new Promise(res => setTimeout(res, 1000));
    console.log('✅ Base de datos limpia.\n');
}

async function seedInstitutions(db: Conn) {
    console.log('🏛️ Insertando Instituciones y Programas...');
    const institutions = ['Universidad de Montería', 'UPB', 'Cooperativa', 'SENA'];
    const instIds: number[] = [];
    const progIds: number[] = [];

    for (const inst of institutions) {
        const [r] = await db.execute('INSERT INTO institutions (name) VALUES (?)', [inst]) as any;
        instIds.push(r.insertId);
    }

    // Insertar programas para cada institución
    const programsMap = [
        { name: 'Ingeniería de Sistemas', instId: instIds[0] },
        { name: 'Ingeniería de Software', instId: instIds[1] },
        { name: 'Tecnología en Redes', instId: instIds[2] },
        { name: 'Desarrollo de Software ADSO', instId: instIds[3] }
    ];

    for (const prog of programsMap) {
        const [r] = await db.execute(
            'INSERT INTO programs (name, maxSemesters, institutionId) VALUES (?, ?, ?)',
            [prog.name, 6, prog.instId]
        ) as any;
        progIds.push(r.insertId);
    }

    console.log(`✅ ${institutions.length} Instituciones y ${programsMap.length} Programas insertados.`);
    return { instIds, progIds };
}

async function seedUsers(db: Conn, progIds: number[]) {
    console.log('👤 Creando Admin, 2 Docentes y 5 Estudiantes...');
    const hash = await bcrypt.hash('STIRE2024!', 10);
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const usersList: { email: string; fullName: string; role: string; programId: number }[] = [
        { email: 'admin@stire.edu.co', fullName: 'Administrador STIRE', role: 'admin', programId: progIds[0] },
        { email: 'docente1@stire.edu.co', fullName: 'Prof. Carlos Mendoza', role: 'docente', programId: progIds[0] },
        { email: 'docente2@stire.edu.co', fullName: 'Prof. Luisa Herrera', role: 'docente', programId: progIds[1] },
        { email: 'estudiante1@stire.edu.co', fullName: 'Juan Gómez', role: 'estudiante', programId: progIds[0] },
        { email: 'estudiante2@stire.edu.co', fullName: 'María Pérez', role: 'estudiante', programId: progIds[0] },
        { email: 'estudiante3@stire.edu.co', fullName: 'Andrés López', role: 'estudiante', programId: progIds[1] },
        { email: 'estudiante4@stire.edu.co', fullName: 'Sofía Castro', role: 'estudiante', programId: progIds[2] },
        { email: 'estudiante5@stire.edu.co', fullName: 'Pedro Díaz', role: 'estudiante', programId: progIds[3] }
    ];

    const teacherIds: number[] = [];
    const studentIds: number[] = [];
    const tokens: Record<string, string> = {};

    for (const u of usersList) {
        const [r] = await db.execute(
            'INSERT INTO users (email, password, fullName, role, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, 1, ?, ?)',
            [u.email, hash, u.fullName, u.role, now, now]
        ) as any;
        
        const userId = r.insertId;
        tokens[u.email] = generateJwt(userId, u.email, u.role);

        if (u.role === 'docente') teacherIds.push(userId);
        if (u.role === 'estudiante') studentIds.push(userId);

        // Afiliación
        await db.execute(
            'INSERT INTO user_affiliations (userId, programId, roleType, currentSemester, isActive) VALUES (?, ?, ?, 1, 1)',
            [userId, u.programId, u.role]
        );
    }

    console.log('✅ Usuarios y afiliaciones creados.');
    return { teacherIds, studentIds, tokens };
}

async function seedHierarchy(db: Conn, teacherIds: number[]) {
    console.log('📚 Creando Clases -> Sections -> Topics -> LearningUnits...');
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // 1. Clases
    const [c1] = await db.execute(
        'INSERT INTO classes (name, code, teacherId, isActive, createdAt, updatedAt) VALUES (?, ?, ?, 1, ?, ?)',
        ['Programación Estructurada', 'PROG-EST-01', teacherIds[0], now, now]
    ) as any;
    const classId = c1.insertId;

    // 2. Sections
    const [s1] = await db.execute(
        'INSERT INTO sections (title, classId, `order`, isPublished, createdAt, updatedAt) VALUES (?, ?, 1, 1, ?, ?)',
        ['Introducción a la Programación', classId, now, now]
    ) as any;
    const sectionId = s1.insertId;

    // 3. Topics
    const [t1] = await db.execute(
        'INSERT INTO topics (title, sectionId, `order`, createdAt, updatedAt) VALUES (?, ?, 1, ?, ?)',
        ['Estructuras de Control Condicionales', sectionId, now, now]
    ) as any;
    const topicId = t1.insertId;

    // 4. LearningUnits (Unidad 1 y Unidad 2 con prerrequisitos)
    const [u1] = await db.execute(
        'INSERT INTO learning_units (title, difficulty, topicId, `order`, createdAt, updatedAt) VALUES (?, "basico", ?, 1, ?, ?)',
        ['Concepto de Condicional if-else', topicId, now, now]
    ) as any;
    const unit1Id = u1.insertId;

    const [u2] = await db.execute(
        'INSERT INTO learning_units (title, difficulty, topicId, `order`, createdAt, updatedAt) VALUES (?, "intermedio", ?, 2, ?, ?)',
        ['Condicionales Anidados y lógicos', topicId, now, now]
    ) as any;
    const unit2Id = u2.insertId;

    // Prerrequisito: Unidad 2 requiere maestría mínima de 70 en Unidad 1
    await db.execute(
        'INSERT INTO prerequisites (targetUnitId, requiredUnitId, minMasteryRequired, createdAt, updatedAt) VALUES (?, ?, 70, ?, ?)',
        [unit2Id, unit1Id, now, now]
    );

    // Contenidos
    await db.execute(
        'INSERT INTO contents (learningUnitId, title, type, body, `order`, isVisible, createdAt, updatedAt) VALUES (?, ?, "markdown", ?, 1, 1, ?, ?)',
        [unit1Id, 'Teoría de Condicionales', '# Condicionales\n\nEl bloque if-else permite tomar decisiones.', now, now]
    );
    await db.execute(
        'INSERT INTO contents (learningUnitId, title, type, body, `order`, isVisible, createdAt, updatedAt) VALUES (?, ?, "markdown", ?, 1, 1, ?, ?)',
        [unit2Id, 'Teoría Condicionales Anidados', '# Anidados\n\nCondicionales dentro de otros condicionales.', now, now]
    );

    // Tipo de Actividad
    const [actType] = await db.execute(
        'INSERT INTO activity_types (name, code, autoGradable, baseWeight, createdAt, updatedAt) VALUES (?, ?, 1, 10.0, ?, ?)',
        ['Coding Challenge', 'CONSOLE_IO', now, now]
    ) as any;
    const activityTypeId = actType.insertId;

    // Actividades
    const [act1] = await db.execute(
        'INSERT INTO activities (title, learningUnitId, activityTypeId, createdBy, difficulty, totalPoints, passingScore, attemptsAllowed, `order`, status, isRequired, adaptiveWeight, createdAt, updatedAt) VALUES (?, ?, ?, ?, "basico", 100, 60, 3, 1, "published", 1, 1.0, ?, ?)',
        ['Reto 1: Mayor de Edad', unit1Id, activityTypeId, teacherIds[0], now, now]
    ) as any;
    const activity1Id = act1.insertId;

    const [act2] = await db.execute(
        'INSERT INTO activities (title, learningUnitId, activityTypeId, createdBy, difficulty, totalPoints, passingScore, attemptsAllowed, `order`, status, isRequired, adaptiveWeight, createdAt, updatedAt) VALUES (?, ?, ?, ?, "intermedio", 100, 60, 3, 1, "published", 1, 1.0, ?, ?)',
        ['Reto 2: Clasificación de Triángulos', unit2Id, activityTypeId, teacherIds[0], now, now]
    ) as any;
    const activity2Id = act2.insertId;

    // Preguntas coding
    const [q1] = await db.execute(
        'INSERT INTO activity_questions (activityId, type, question, points, `order`, config, createdAt, updatedAt) VALUES (?, "coding", ?, 100, 1, ?, ?, ?)',
        [
            activity1Id,
            'Escribe un programa que lea la edad y determine si es "MAYOR" o "MENOR" de edad (umbral 18).',
            JSON.stringify({
                language: 'python',
                starterCode: 'edad = int(input())\n# Tu código aquí',
                testCases: [
                    { label: 'Caso base joven', input: '15', expected: 'MENOR', weight: 50 },
                    { label: 'Caso base adulto', input: '20', expected: 'MAYOR', weight: 50 }
                ]
            }),
            now, now
        ]
    ) as any;
    const question1Id = q1.insertId;

    const [q2] = await db.execute(
        'INSERT INTO activity_questions (activityId, type, question, points, `order`, config, createdAt, updatedAt) VALUES (?, "coding", ?, 100, 1, ?, ?, ?)',
        [
            activity2Id,
            'Escribe un programa que lea tres enteros y determine si forman un triángulo "EQUILATERO", "ISOSCELES" o "ESCALENO".',
            JSON.stringify({
                language: 'python',
                starterCode: 'a, b, c = map(int, input().split())\n# Tu código',
                testCases: [
                    { label: 'Equilatero', input: '3 3 3', expected: 'EQUILATERO', weight: 34 },
                    { label: 'Isosceles', input: '3 3 5', expected: 'ISOSCELES', weight: 33 },
                    { label: 'Escaleno', input: '3 4 5', expected: 'ESCALENO', weight: 33 }
                ]
            }),
            now, now
        ]
    ) as any;
    const question2Id = q2.insertId;

    // Matricular estudiantes en la clase
    for (const tid of teacherIds) {
        // Matricular todos en classId
    }

    console.log('✅ Jerarquía académica y retos de programación listos.');
    return { classId, unit1Id, unit2Id, activity1Id, activity2Id, question1Id, question2Id };
}

async function seedEvaluationsAndProgress(db: Conn, studentIds: number[], classId: number, data: any) {
    console.log('🧪 Inyectando escenarios variados en submissions y execution_results (QA Destructivo)...');
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Matricular los estudiantes a la clase
    for (const sid of studentIds) {
        await db.execute(
            'INSERT INTO enrollments (id, classId, studentId, status, joined_at) VALUES (UUID(), ?, ?, "active", NOW())',
            [classId, sid]
        );
    }

    // Escenarios de Estudiantes:
    // Estudiante 1: Puntuación perfecta ('accepted')
    // Estudiante 2: Respuesta errónea ('wrong_answer')
    // Estudiante 3: Error de compilación ('compile_error')
    // Estudiante 4: Tiempo excedido ('time_limit')
    // Estudiante 5: Sin progreso ( learning_progress vacío para Tarea 3.1)

    const scenarios = [
        { sid: studentIds[0], status: 'accepted', score: 100, feedback: '¡Excelente! Todos los casos pasaron.', isCorrect: true, runStatus: 'accepted' },
        { sid: studentIds[1], status: 'wrong_answer', score: 50, feedback: 'Falló el caso de prueba 2.', isCorrect: false, runStatus: 'wrong_answer' },
        { sid: studentIds[2], status: 'compile_error', score: 0, feedback: 'SyntaxError: unexpected EOF while parsing', isCorrect: false, runStatus: 'compile_error' },
        { sid: studentIds[3], status: 'time_limit', score: 0, feedback: 'Time Limit Exceeded (CPU timeout)', isCorrect: false, runStatus: 'time_limit' }
    ];

    for (const s of scenarios) {
        const subId = crypto.randomUUID();
        // Insertar submission
        await db.execute(
            'INSERT INTO submissions (id, activityId, studentId, score, attemptNumber, status, startedAt, submittedAt, timeSpentSeconds, isAbandoned, createdAt, updatedAt) VALUES (?, ?, ?, ?, 1, "graded", NOW(), NOW(), 120, 0, ?, ?)',
            [subId, data.activity1Id, s.sid, s.score, now, now]
        );

        // Insertar submission_answer
        const [ans] = await db.execute(
            'INSERT INTO submission_answers (submissionId, questionId, answer, isCorrect, score, feedback) VALUES (?, ?, ?, ?, ?, ?)',
            [
                subId,
                data.question1Id,
                JSON.stringify({ code: 'print("STIRE mock answer")' }),
                s.isCorrect,
                s.score,
                s.feedback
            ]
        ) as any;
        const answerId = ans.insertId;

        // Insertar execution_results
        await db.execute(
            'INSERT INTO execution_results (id, submissionAnswerId, status, stdout, stderr, executionTimeMs, memoryUsedKB, testCaseLabel, createdAt, updatedAt) VALUES (UUID(), ?, ?, ?, ?, ?, ?, "Caso Prueba", ?, ?)',
            [
                answerId,
                s.runStatus,
                s.isCorrect ? 'MAYOR\n' : 'INCORRECT_OUT\n',
                s.runStatus === 'compile_error' ? 'Traceback (most recent call): SyntaxError' : '',
                s.runStatus === 'time_limit' ? 2100 : 80,
                1500,
                now, now
            ]
        );

        // Inyectar progreso en learning_progress para estudiantes 1 a 4
        // (Estudiante 5 se queda sin progreso para simular incompleto)
        await db.execute(
            'INSERT INTO learning_progress (studentId, learningUnitId, mastery, successRate, attemptsCount, completedActivities, createdAt, updatedAt) VALUES (?, ?, ?, ?, 1, 1, ?, ?)',
            [s.sid, data.unit1Id, s.score, s.score / 100.0, now, now]
        );

        // Agenda de repaso
        const nextReview = new Date(Date.now() + 3 * 86400000); // en 3 días
        await db.execute(
            'INSERT INTO review_schedules (studentId, learningUnitId, nextReviewDate, urgencyLevel, intervalDays, repetitions, lastReviewedAt, createdAt, updatedAt) VALUES (?, ?, ?, 1, 3, 1, NOW(), ?, ?)',
            [s.sid, data.unit1Id, nextReview, now, now]
        );
    }

    console.log('✅ Escenarios de evaluación de código inyectados con éxito.');
}

async function main() {
    console.log('\n========================================================');
    console.log('    🛠️  INICIANDO SEEDER DE QA DESTRUCTIVO (STIRE)   ');
    console.log('========================================================\n');

    const db = await connect();
    try {
        await wipe(db);
        const { progIds } = await seedInstitutions(db);
        const { teacherIds, studentIds, tokens } = await seedUsers(db, progIds);
        const hierarchyData = await seedHierarchy(db, teacherIds);
        await seedEvaluationsAndProgress(db, studentIds, hierarchyData.classId, hierarchyData);

        console.log('\n========================================================');
        console.log('      🔑 TOKENS JWT VÁLIDOS PARA PRUEBAS (JWT_SECRET)   ');
        console.log('========================================================');
        for (const [email, token] of Object.entries(tokens)) {
            console.log(`\n📧 ${email}:`);
            console.log(`🔑 Authorization: Bearer ${token}`);
        }
        console.log('========================================================\n');
        
        console.log('🎉 Seeder de QA Destructivo completado con éxito.');
        await db.end();
        process.exit(0);
    } catch (error: any) {
        console.error('❌ Error en ejecución del Seeder:', error.message);
        await db.end();
        process.exit(1);
    }
}

main();
