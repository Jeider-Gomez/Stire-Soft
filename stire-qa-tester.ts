import 'reflect-metadata';
/**
 * stire-qa-tester.ts
 * Script de Integración y QA Destructivo para verificar Seguridad, Permisos e Integridad.
 */
import * as mysql from 'mysql2/promise';
import * as path from 'path';
import * as fs from 'fs';

const API_URL = 'http://localhost:3000';

// Lector de .env
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

async function connectDb() {
    return mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_DATABASE || 'basestire'
    });
}

async function post(url: string, body: object, token?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_URL}${url}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });
    const status = res.status;
    let data;
    try {
        data = await res.json();
    } catch (e) {
        data = null;
    }
    return { status, data };
}

async function get(url: string, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_URL}${url}`, {
        method: 'GET',
        headers,
    });
    const status = res.status;
    let data;
    try {
        data = await res.json();
    } catch (e) {
        data = null;
    }
    return { status, data };
}

async function runQATests() {
    console.log('🕵️‍♂️ Iniciando Suite de Pruebas de QA Destructivo y Validación...');

    // 1. Obtener tokens JWT mediante Login
    console.log('\n🔑 Autenticando roles...');
    
    const adminLogin = await post('/auth/login', { email: 'admin@stire.edu.co', password: 'STIRE2024!' });
    if (adminLogin.status !== 201) throw new Error('Fallo al autenticar Admin');
    const adminToken = adminLogin.data.token;
    console.log('   ✔ Admin autenticado.');

    const teacherLogin = await post('/auth/login', { email: 'docente1@stire.edu.co', password: 'STIRE2024!' });
    if (teacherLogin.status !== 201) throw new Error('Fallo al autenticar Docente');
    const teacherToken = teacherLogin.data.token;
    console.log('   ✔ Docente autenticado.');

    const studentAdvancedLogin = await post('/auth/login', { email: 'estudiante_avanzado@stire.edu.co', password: 'STIRE2024!' });
    if (studentAdvancedLogin.status !== 201) throw new Error('Fallo al autenticar Estudiante Avanzado');
    const studentAdvancedToken = studentAdvancedLogin.data.token;
    const studentAdvancedId = studentAdvancedLogin.data.user.id;
    console.log(`   ✔ Estudiante Avanzado autenticado (ID: ${studentAdvancedId}).`);

    const studentRiskLogin = await post('/auth/login', { email: 'estudiante_riesgo@stire.edu.co', password: 'STIRE2024!' });
    if (studentRiskLogin.status !== 201) throw new Error('Fallo al autenticar Estudiante en Riesgo');
    const studentRiskToken = studentRiskLogin.data.token;
    console.log('   ✔ Estudiante en Riesgo autenticado.');

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 1: ESCALAMIENTO DE PRIVILEGIOS
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n🔒 [TEST 1/4] Verificando Escalamiento de Privilegios...');
    const escalateRes = await post('/institutions', { name: 'Universidad Pirata' }, studentRiskToken);
    
    if (escalateRes.status === 403) {
        console.log('   ✅ PASÓ: Estudiante bloqueado con 403 Forbidden al intentar crear una institución.');
    } else {
        console.error(`   ❌ FALLÓ: Se esperaba 403 pero se obtuvo ${escalateRes.status}`);
        process.exit(1);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 2: ACCESO A DATOS (Docente intenta ver Analytics de clase ajena)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n🔒 [TEST 2/4] Verificando Aislamiento de Datos entre clases...');
    
    const db = await connectDb();
    const [classRows] = await db.query(
        'SELECT id FROM classes WHERE name = "Clase Secreta de Luisa" LIMIT 1'
    ) as any;
    if (classRows.length === 0) throw new Error('No se encontró la Clase Secreta de Luisa en la BD');
    const secretClassId = classRows[0].id;
    await db.end();

    const analyticsRes = await get(`/analytics/class/${secretClassId}`, teacherToken);

    if (analyticsRes.status === 403) {
        console.log('   ✅ PASÓ: Docente bloqueado con 403 Forbidden al consultar analíticas de una clase que no le pertenece.');
    } else {
        console.error(`   ❌ FALLÓ: Se esperaba 403 pero se obtuvo ${analyticsRes.status}`);
        process.exit(1);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 3: INTEGRIDAD (Limpieza de respuestas en limbo)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n🧹 [TEST 3/4] Verificando Mantenimiento de Limbo (Limpieza de Deadlocks)...');
    
    const dbConn = await connectDb();
    // 1. Obtener una entrega de prueba
    const [subRows] = await dbConn.query('SELECT id, activityId FROM submissions LIMIT 1') as any;
    if (subRows.length === 0) throw new Error('No hay entregas para el Test 3');
    const testSubId = subRows[0].id;

    // 2. Obtener una pregunta
    const [questRows] = await dbConn.query('SELECT id FROM activity_questions LIMIT 1') as any;
    if (questRows.length === 0) throw new Error('No hay preguntas para el Test 3');
    const testQuestId = questRows[0].id;

    // 3. Forzar inserción de una respuesta huérfana (limbo: isCorrect = null en entrega graded)
    await dbConn.execute(
        'INSERT INTO submission_answers (submissionId, questionId, answer, isCorrect, score, feedback) VALUES (?, ?, ?, NULL, 0, "Prueba Limbo")',
        [testSubId, testQuestId, JSON.stringify({ code: 'print("limbo")' })]
    );
    
    // Verificar que existe en limbo
    const [limboBefore] = await dbConn.query(
        'SELECT id FROM submission_answers WHERE submissionId = ? AND isCorrect IS NULL',
        [testSubId]
    ) as any;
    console.log(`   ✔ Respuesta en limbo creada antes de la limpieza (Count: ${limboBefore.length}).`);

    await dbConn.end();

    // 4. Ejecutar el servicio de mantenimiento a través del endpoint seguro
    console.log('   Ejecutando limpieza de limbo vía endpoint de administración...');
    
    // Probar que un estudiante no puede llamarlo
    const cleanFail = await post('/maintenance/cleanup', {}, studentRiskToken);
    if (cleanFail.status !== 403) {
        console.error(`   ❌ FALLÓ: Se esperaba 403 para estudiante en el endpoint de mantenimiento pero se obtuvo ${cleanFail.status}`);
        process.exit(1);
    }
    console.log('   ✔ Acceso denegado correctamente a estudiante (403 Forbidden).');

    // Admin lo ejecuta
    const cleanRes = await post('/maintenance/cleanup', {}, adminToken);
    if (cleanRes.status !== 201 && cleanRes.status !== 200) {
        console.error(`   ❌ FALLÓ: El endpoint de mantenimiento retornó ${cleanRes.status}`);
        process.exit(1);
    }
    console.log('   ✔ Limpieza ejecutada por el Admin con éxito.');

    // 5. Verificar que la respuesta ya no está en limbo
    const dbCheck = await connectDb();
    const [limboAfter] = await dbCheck.query(
        'SELECT id, isCorrect, feedback FROM submission_answers WHERE submissionId = ? AND feedback LIKE "Limpieza automática%"',
        [testSubId]
    ) as any;

    if (limboAfter.length > 0 && limboAfter[0].isCorrect === 0) {
        console.log('   ✅ PASÓ: El limbo fue corregido. La respuesta se actualizó a isCorrect = false.');
    } else {
        console.error('   ❌ FALLÓ: La respuesta sigue en limbo.');
        await dbCheck.end();
        process.exit(1);
    }
    await dbCheck.end();

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 4: DIMENSIONALIDAD (Verificación del cálculo de Mastery)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n📊 [TEST 4/4] Verificando Dimensionalidad del Tablero (Mastery)...');
    
    const dashboardRes = await get(`/analytics/student/${studentAdvancedId}`, studentAdvancedToken);
    
    if (dashboardRes.status === 200) {
        const avgMastery = dashboardRes.data.summary.avgMastery;
        // La unidad 1 tiene 95 de mastery, la unidad 2 tiene 90. Promedio: 92.5
        if (avgMastery === 92.5) {
            console.log(`   ✅ PASÓ: El dashboard reporta la maestría promedio correcta (${avgMastery}%).`);
        } else {
            console.error(`   ❌ FALLÓ: Se esperaba maestría promedio 92.5 pero se obtuvo ${avgMastery}`);
            process.exit(1);
        }
    } else {
        console.error(`   ❌ FALLÓ: Error al obtener dashboard: HTTP ${dashboardRes.status}`);
        process.exit(1);
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log('🏁 ¡TODAS LAS PRUEBAS DE QA DESTRUCTIVO PASARON EXITOSAMENTE!');
    console.log('═══════════════════════════════════════════════════\n');
    process.exit(0);
}

runQATests().catch(err => {
    console.error('\n🛑 Error fatal en ejecución de QA Tests:', err);
    process.exit(1);
});
