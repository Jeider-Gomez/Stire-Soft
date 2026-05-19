import * as mysql from 'mysql2/promise';

const API_URL = 'http://localhost:3000';

async function post(url: string, body: object, token?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_URL}${url}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`POST ${url} → HTTP ${res.status}: ${JSON.stringify(data)}`);
    return data;
}

async function runSTIRETest() {
    console.log('🚀 STIRE Happy Path E2E — Iniciando...\n');
    const ts = Date.now();
    const teacherEmail = `docente_${ts}@stire.app`;

    // ── 1. REGISTRAR DOCENTE ──────────────────────────────────────────────────
    console.log('[1/9] Registrando docente...');
    await post('/auth/register', {
        email: teacherEmail,
        password: 'Password123!',
        fullName: 'Docente de Prueba',
    });

    // ── 1.5. FORZAR ROL EN BASE DE DATOS ──────────────────────────────────────
    console.log('      Elevando privilegios a DOCENTE en la BD...');
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'basestire'
    });
    await db.execute('UPDATE users SET role = ? WHERE email = ?', ['docente', teacherEmail]);
    await db.end();

    const { token: teacherToken } = await post('/auth/login', {
        email: teacherEmail,
        password: 'Password123!',
    });
    console.log('✅ Docente autenticado y con rol concedido.\n');

    // ── 2. CREAR TIPO DE ACTIVIDAD ────────────────────────────────────────────
    console.log('[2/9] Creando ActivityType...');
    const activityType = await post('/activity-types', {
        name: 'Práctica de Código',
        code: `CODING_${ts}`,
        baseWeight: 1.0,
    }, teacherToken);
    console.log(`✅ ActivityType creado (ID: ${activityType.id}).\n`);

    // ── 3. CREAR JERARQUÍA ACADÉMICA (Class → Section → Topic → LU) ──────────
    console.log('[3/9] Creando jerarquía académica...');
    const cls = await post('/class', {
        name: `Lógica de Programación ${ts}`,
        code: `LOGICA_${ts}`
    }, teacherToken);
    console.log(`   ✔ Clase creada (ID: ${cls.id})`);

    const section = await post('/sections', {
        title: 'Corte 1 — Fundamentos',
        classId: cls.id,
        order: 1,
    }, teacherToken);
    console.log(`   ✔ Sección creada (ID: ${section.id})`);

    const topic = await post('/topic', {
        title: 'Variables y Tipos de Datos',
        sectionId: section.id,
        order: 1,
    }, teacherToken);
    console.log(`   ✔ Topic creado (ID: ${topic.id})`);

    const lu = await post('/learning-unit', {
        title: 'Variables en JavaScript',
        difficulty: 'basico',
        topicId: topic.id,
        order: 1,
    }, teacherToken);
    console.log(`   ✔ LearningUnit creada (ID: ${lu.id})\n`);

    // ── 4. CREAR ACTIVIDAD + PREGUNTA ─────────────────────────────────────────
    console.log('[4/9] Creando Actividad de Programación...');
    const activity = await post('/activities', {
        title: 'Reto: Suma de dos números',
        learningUnitId: lu.id,
        activityTypeId: activityType.id,
        difficulty: 'basico',
        totalPoints: 100,
        passingScore: 60,
    }, teacherToken);
    console.log(`✅ Actividad creada (ID: ${activity.id}).\n`);

    console.log('[5/9] Creando Pregunta de Código...');
    const question = await post('/activity-questions', {
        activityId: activity.id,
        type: 'coding',
        question: 'Escribe una función que sume dos números.',
        points: 100,
        order: 1,
        config: {
            language: 'javascript',
            starterCode: 'function sum(a, b) { }',
            testCases: [
                { input: '2 3', expected: '5', isPublic: true, weight: 50 },
                { input: '10 20', expected: '30', isPublic: false, weight: 50 },
            ],
        },
    }, teacherToken);
    console.log(`✅ Pregunta creada (ID: ${question.id}).\n`);

    // ── 5. REGISTRAR ESTUDIANTE ───────────────────────────────────────────────
    console.log('[6/9] Registrando estudiante...');
    await post('/auth/register', {
        email: `student_${ts}@stire.app`,
        password: 'Password123!',
        fullName: 'Estudiante de Prueba',
    });
    const { token: studentToken } = await post('/auth/login', {
        email: `student_${ts}@stire.app`,
        password: 'Password123!',
    });
    console.log('✅ Estudiante autenticado.\n');

    // ── 6. INICIAR SUBMISSION ─────────────────────────────────────────────────
    console.log('[7/9] Iniciando intento de resolución...');
    const submission = await post('/submissions/start', {
        activityId: activity.id,
    }, studentToken);
    console.log(`✅ Submission iniciada (ID: ${submission.id}).\n`);

    // ── 7. ENVIAR CÓDIGO ──────────────────────────────────────────────────────
    console.log('[8/9] Enviando código al Motor de Evaluación...');
    const result = await post(`/submissions/${submission.id}/submit`, {
        timeSpentSeconds: 90,
        answers: [{
            questionId: question.id,
            answer: {
                code: 'function sum(a, b) { return a + b; } console.log(sum(2,3));',
            },
        }],
    }, studentToken);
    console.log(`✅ ¡Código evaluado! Score: ${result.score ?? 'N/A'} | Status: ${result.status ?? 'N/A'}\n`);

    // ── 8. RESUMEN FINAL ──────────────────────────────────────────────────────
    console.log('═══════════════════════════════════════════════════');
    console.log('🏁 Happy Path completado exitosamente.');
    console.log('👉 Revisa la consola de NestJS para confirmar:');
    console.log('   • BullMQ encoló el trabajo de evaluación de código');
    console.log('   • submission.graded event fue emitido');
    console.log('   • LearningProgress fue recalculado (Mastery)');
    console.log('   • ReviewSchedule SM-2 fue actualizado');
    console.log('═══════════════════════════════════════════════════\n');
    process.exit(0);
}

runSTIRETest().catch((err) => {
    console.error('\n❌ El test falló:', err.message);
    process.exit(1);
});