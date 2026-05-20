/**
 * src/seeds/qa-destructivo.seeder.ts
 * Seeder Maestro para Escenarios de QA Destructivo e Integridad en STIRE.
 */
import * as mysql from 'mysql2/promise';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Lector de .env para obtener credenciales
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

// Generar tokens JWT para el entorno de pruebas
function generateJwt(userId: number, email: string, role: string): string {
    const secret = process.env.JWT_SECRET || 'supersecret123';
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
        sub: userId,
        email,
        role,
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
    console.log('✅ Base de datos limpia.\n');
}

async function seedData() {
    console.log('🚀 Iniciando inyección de datos de QA Destructivo...');
    const db = await connect();

    try {
        await wipe(db);

        // 1. Instituciones
        console.log('🏛️ Creando Instituciones...');
        const institutions = ['UPB', 'Universidad de Córdoba', 'SENA', 'Cooperativa'];
        const instIds: number[] = [];
        for (const inst of institutions) {
            const [r] = await db.execute('INSERT INTO institutions (name) VALUES (?)', [inst]) as any;
            instIds.push(r.insertId);
        }

        // Programas asociados
        const [p1] = await db.execute('INSERT INTO programs (name, maxSemesters, institutionId) VALUES ("Ingeniería de Sistemas", 10, ?)', [instIds[1]]) as any;
        const programId = p1.insertId;

        // 2. Usuarios
        console.log('👤 Creando Usuarios...');
        const hash = await bcrypt.hash('STIRE2024!', 10);
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const tokens: Record<string, string> = {};

        // Admin
        const [uAdmin] = await db.execute(
            'INSERT INTO users (email, password, fullName, role, isActive, createdAt, updatedAt) VALUES ("admin@stire.edu.co", ?, "Administrador STIRE", "admin", 1, ?, ?)',
            [hash, now, now]
        ) as any;
        tokens['admin@stire.edu.co'] = generateJwt(uAdmin.insertId, 'admin@stire.edu.co', 'admin');

        // Docente
        const [uDocente] = await db.execute(
            'INSERT INTO users (email, password, fullName, role, isActive, createdAt, updatedAt) VALUES ("docente1@stire.edu.co", ?, "Prof. Jaime Gómez", "docente", 1, ?, ?)',
            [hash, now, now]
        ) as any;
        const docenteId = uDocente.insertId;
        tokens['docente1@stire.edu.co'] = generateJwt(docenteId, 'docente1@stire.edu.co', 'docente');

        // Docente 2 (Para pruebas de aislamiento de datos)
        const [uDocente2] = await db.execute(
            'INSERT INTO users (email, password, fullName, role, isActive, createdAt, updatedAt) VALUES ("docente2@stire.edu.co", ?, "Prof. Luisa Herrera", "docente", 1, ?, ?)',
            [hash, now, now]
        ) as any;
        const docente2Id = uDocente2.insertId;
        tokens['docente2@stire.edu.co'] = generateJwt(docente2Id, 'docente2@stire.edu.co', 'docente');

        // Estudiante Avanzado
        const [uEstAvanzado] = await db.execute(
            'INSERT INTO users (email, password, fullName, role, isActive, createdAt, updatedAt) VALUES ("estudiante_avanzado@stire.edu.co", ?, "Estudiante Sobresaliente", "estudiante", 1, ?, ?)',
            [hash, now, now]
        ) as any;
        const estAvanzadoId = uEstAvanzado.insertId;
        tokens['estudiante_avanzado@stire.edu.co'] = generateJwt(estAvanzadoId, 'estudiante_avanzado@stire.edu.co', 'estudiante');

        // Estudiante en Riesgo
        const [uEstRiesgo] = await db.execute(
            'INSERT INTO users (email, password, fullName, role, isActive, createdAt, updatedAt) VALUES ("estudiante_riesgo@stire.edu.co", ?, "Estudiante en Riesgo", "estudiante", 1, ?, ?)',
            [hash, now, now]
        ) as any;
        const estRiesgoId = uEstRiesgo.insertId;
        tokens['estudiante_riesgo@stire.edu.co'] = generateJwt(estRiesgoId, 'estudiante_riesgo@stire.edu.co', 'estudiante');

        // Afiliaciones
        await db.execute('INSERT INTO user_affiliations (userId, programId, roleType, currentSemester, isActive) VALUES (?, ?, "docente", 1, 1)', [docenteId, programId]);
        await db.execute('INSERT INTO user_affiliations (userId, programId, roleType, currentSemester, isActive) VALUES (?, ?, "docente", 1, 1)', [docente2Id, programId]);
        await db.execute('INSERT INTO user_affiliations (userId, programId, roleType, currentSemester, isActive) VALUES (?, ?, "estudiante", 1, 1)', [estAvanzadoId, programId]);
        await db.execute('INSERT INTO user_affiliations (userId, programId, roleType, currentSemester, isActive) VALUES (?, ?, "estudiante", 1, 1)', [estRiesgoId, programId]);

        // 3. Jerarquía Académica
        console.log('📚 Creando Clases, Temas y Actividades...');
        const [c1] = await db.execute(
            'INSERT INTO classes (name, code, teacherId, isActive, createdAt, updatedAt) VALUES ("Algoritmos y Estructuras", "ALGO-EST-02", ?, 1, ?, ?)',
            [docenteId, now, now]
        ) as any;
        const classId = c1.insertId;

        // Clase secreta de docente2 para pruebas de aislamiento
        await db.execute(
            'INSERT INTO classes (name, code, teacherId, isActive, createdAt, updatedAt) VALUES ("Clase Secreta de Luisa", "SEC-001", ?, 1, ?, ?)',
            [docente2Id, now, now]
        );

        // Matricular a los estudiantes
        await db.execute('INSERT INTO enrollments (id, classId, studentId, status, joined_at) VALUES (UUID(), ?, ?, "active", NOW())', [classId, estAvanzadoId]);
        await db.execute('INSERT INTO enrollments (id, classId, studentId, status, joined_at) VALUES (UUID(), ?, ?, "active", NOW())', [classId, estRiesgoId]);

        const [s1] = await db.execute('INSERT INTO sections (title, classId, `order`, isPublished, createdAt, updatedAt) VALUES ("Corte 2: Bucles", ?, 1, 1, ?, ?)', [classId, now, now]) as any;
        const sectionId = s1.insertId;

        const [t1] = await db.execute('INSERT INTO topics (title, sectionId, `order`, createdAt, updatedAt) VALUES ("Ciclos y Bucles", ?, 1, ?, ?)', [sectionId, now, now]) as any;
        const topicId = t1.insertId;

        // Unidades
        const [lu1] = await db.execute('INSERT INTO learning_units (title, difficulty, topicId, `order`, createdAt, updatedAt) VALUES ("Ciclo While", "basico", ?, 1, ?, ?)', [topicId, now, now]) as any;
        const unitWhileId = lu1.insertId;

        const [lu2] = await db.execute('INSERT INTO learning_units (title, difficulty, topicId, `order`, createdAt, updatedAt) VALUES ("Ciclo For", "intermedio", ?, 2, ?, ?)', [topicId, now, now]) as any;
        const unitForId = lu2.insertId;

        // Contenidos
        await db.execute('INSERT INTO contents (learningUnitId, title, type, body, `order`, isVisible, createdAt, updatedAt) VALUES (?, "Explicación While", "markdown", "Instrucciones de ciclo while.", 1, 1, ?, ?)', [unitWhileId, now, now]);
        await db.execute('INSERT INTO contents (learningUnitId, title, type, body, `order`, isVisible, createdAt, updatedAt) VALUES (?, "Explicación For", "markdown", "Instrucciones de ciclo for.", 1, 1, ?, ?)', [unitForId, now, now]);

        // Tipo de Actividad
        const [actType] = await db.execute('INSERT INTO activity_types (name, code, autoGradable, baseWeight, createdAt, updatedAt) VALUES ("Coding Challenge", "CONSOLE_IO", 1, 10.0, ?, ?)', [now, now]) as any;
        const activityTypeId = actType.insertId;

        // Actividades
        const [act1] = await db.execute(
            'INSERT INTO activities (title, learningUnitId, activityTypeId, createdBy, difficulty, totalPoints, passingScore, attemptsAllowed, `order`, status, isRequired, adaptiveWeight, createdAt, updatedAt) VALUES ("Contar hasta N", ?, ?, ?, "basico", 100, 60, 3, 1, "published", 1, 1.0, ?, ?)',
            [unitWhileId, activityTypeId, docenteId, now, now]
        ) as any;
        const activityWhileId = act1.insertId;

        const [act2] = await db.execute(
            'INSERT INTO activities (title, learningUnitId, activityTypeId, createdBy, difficulty, totalPoints, passingScore, attemptsAllowed, `order`, status, isRequired, adaptiveWeight, createdAt, updatedAt) VALUES ("Suma de Pares", ?, ?, ?, "intermedio", 100, 60, 3, 1, "published", 1, 1.0, ?, ?)',
            [unitForId, activityTypeId, docenteId, now, now]
        ) as any;
        const activityForId = act2.insertId;

        // Preguntas coding
        const [q1] = await db.execute(
            'INSERT INTO activity_questions (activityId, type, question, points, `order`, config, createdAt, updatedAt) VALUES (?, "coding", "Imprimir números de 1 a N.", 100, 1, ?, ?, ?)',
            [activityWhileId, JSON.stringify({ language: 'python', starterCode: 'n = int(input())\n# código', testCases: [{ label: 'Prueba 1', input: '3', expected: '1\n2\n3\n', weight: 100 }] }), now, now]
        ) as any;
        const questionWhileId = q1.insertId;

        const [q2] = await db.execute(
            'INSERT INTO activity_questions (activityId, type, question, points, `order`, config, createdAt, updatedAt) VALUES (?, "coding", "Suma pares de 1 a N.", 100, 1, ?, ?, ?)',
            [activityForId, JSON.stringify({ language: 'python', starterCode: 'n = int(input())\n# código', testCases: [{ label: 'Prueba 1', input: '4', expected: '6\n', weight: 100 }] }), now, now]
        ) as any;
        const questionForId = q2.insertId;

        // 4. Inyección de Evaluaciones e Integridad
        console.log('🧪 Creando Historial de Entregas y Progreso...');

        // 4.1. Estudiante Avanzado (Completado y con Maestría Alta)
        const subIdAvanzado1 = crypto.randomUUID();
        await db.execute(
            'INSERT INTO submissions (id, activityId, studentId, score, attemptNumber, status, startedAt, submittedAt, timeSpentSeconds, isAbandoned, createdAt, updatedAt) VALUES (?, ?, ?, 100, 1, "graded", NOW(), NOW(), 45, 0, ?, ?)',
            [subIdAvanzado1, activityWhileId, estAvanzadoId, now, now]
        );
        const [ansAvanzado1] = await db.execute('INSERT INTO submission_answers (submissionId, questionId, answer, isCorrect, score, feedback) VALUES (?, ?, ?, 1, 100, "Perfecto")', [subIdAvanzado1, questionWhileId, JSON.stringify({ code: 'print("1\\n2\\n3\\n")' })]) as any;
        await db.execute('INSERT INTO execution_results (id, submissionAnswerId, status, stdout, stderr, executionTimeMs, memoryUsedKB, testCaseLabel, createdAt, updatedAt) VALUES (UUID(), ?, "accepted", "1\\n2\\n3\\n", "", 50, 1000, "Prueba 1", ?, ?)', [ansAvanzado1.insertId, now, now]);

        const subIdAvanzado2 = crypto.randomUUID();
        await db.execute(
            'INSERT INTO submissions (id, activityId, studentId, score, attemptNumber, status, startedAt, submittedAt, timeSpentSeconds, isAbandoned, createdAt, updatedAt) VALUES (?, ?, ?, 90, 1, "graded", NOW(), NOW(), 60, 0, ?, ?)',
            [subIdAvanzado2, activityForId, estAvanzadoId, now, now]
        );
        const [ansAvanzado2] = await db.execute('INSERT INTO submission_answers (submissionId, questionId, answer, isCorrect, score, feedback) VALUES (?, ?, ?, 1, 90, "Casi perfecto")', [subIdAvanzado2, questionForId, JSON.stringify({ code: 'print("6")' })]) as any;
        await db.execute('INSERT INTO execution_results (id, submissionAnswerId, status, stdout, stderr, executionTimeMs, memoryUsedKB, testCaseLabel, createdAt, updatedAt) VALUES (UUID(), ?, "accepted", "6\\n", "", 55, 1010, "Prueba 1", ?, ?)', [ansAvanzado2.insertId, now, now]);

        // Guardar progreso del estudiante avanzado
        await db.execute('INSERT INTO learning_progress (studentId, learningUnitId, mastery, successRate, attemptsCount, completedActivities, createdAt, updatedAt) VALUES (?, ?, 95, 1.0, 1, 1, ?, ?)', [estAvanzadoId, unitWhileId, now, now]);
        await db.execute('INSERT INTO learning_progress (studentId, learningUnitId, mastery, successRate, attemptsCount, completedActivities, createdAt, updatedAt) VALUES (?, ?, 90, 1.0, 1, 1, ?, ?)', [estAvanzadoId, unitForId, now, now]);


        // 4.2. Estudiante en Riesgo (Wrong Answer, Timeout, Progreso Bajo)
        const subIdRiesgo1 = crypto.randomUUID();
        await db.execute(
            'INSERT INTO submissions (id, activityId, studentId, score, attemptNumber, status, startedAt, submittedAt, timeSpentSeconds, isAbandoned, createdAt, updatedAt) VALUES (?, ?, ?, 20, 1, "graded", NOW(), NOW(), 120, 0, ?, ?)',
            [subIdRiesgo1, activityWhileId, estRiesgoId, now, now]
        );
        const [ansRiesgo1] = await db.execute('INSERT INTO submission_answers (submissionId, questionId, answer, isCorrect, score, feedback) VALUES (?, ?, ?, 0, 20, "Resultado Incorrecto")', [subIdRiesgo1, questionWhileId, JSON.stringify({ code: 'print("1\\n")' })]) as any;
        await db.execute('INSERT INTO execution_results (id, submissionAnswerId, status, stdout, stderr, executionTimeMs, memoryUsedKB, testCaseLabel, createdAt, updatedAt) VALUES (UUID(), ?, "wrong_answer", "1\\n", "", 60, 1000, "Prueba 1", ?, ?)', [ansRiesgo1.insertId, now, now]);

        // Intento 2: Timeout (time_limit)
        const subIdRiesgo2 = crypto.randomUUID();
        await db.execute(
            'INSERT INTO submissions (id, activityId, studentId, score, attemptNumber, status, startedAt, submittedAt, timeSpentSeconds, isAbandoned, createdAt, updatedAt) VALUES (?, ?, ?, 0, 2, "graded", NOW(), NOW(), 120, 0, ?, ?)',
            [subIdRiesgo2, activityWhileId, estRiesgoId, now, now]
        );
        const [ansRiesgo2] = await db.execute('INSERT INTO submission_answers (submissionId, questionId, answer, isCorrect, score, feedback) VALUES (?, ?, ?, 0, 0, "Time Limit Exceeded")', [subIdRiesgo2, questionWhileId, JSON.stringify({ code: 'while True: pass' })]) as any;
        await db.execute('INSERT INTO execution_results (id, submissionAnswerId, status, stdout, stderr, executionTimeMs, memoryUsedKB, testCaseLabel, createdAt, updatedAt) VALUES (UUID(), ?, "time_limit", "", "", 2000, 1200, "Prueba 1", ?, ?)', [ansRiesgo2.insertId, now, now]);

        // Progreso del estudiante en riesgo
        await db.execute('INSERT INTO learning_progress (studentId, learningUnitId, mastery, successRate, attemptsCount, completedActivities, createdAt, updatedAt) VALUES (?, ?, 30, 0.0, 2, 0, ?, ?)', [estRiesgoId, unitWhileId, now, now]);

        console.log('\n========================================================');
        console.log('       🔑 TOKENS JWT PARA ESCENARIOS DE QA             ');
        console.log('========================================================');
        for (const [email, token] of Object.entries(tokens)) {
            console.log(`\n📧 ${email}:`);
            console.log(`🔑 Authorization: Bearer ${token}`);
        }
        console.log('========================================================\n');
        
        console.log('🎉 Seeder de QA Destructivo completado con éxito.');
        await db.end();
        process.exit(0);
    } catch (e: any) {
        console.error('❌ Error ejecutando seeder:', e.message);
        await db.end();
        process.exit(1);
    }
}

seedData();
