import * as mysql from 'mysql2/promise';
import { faker } from '@faker-js/faker';

const API_URL = 'http://localhost:3000';
const NUM_TEACHERS = 5;
const NUM_STUDENTS = 100;

async function post(url: string, body: object, token?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    let res: Response;
    try {
        res = await fetch(`${API_URL}${url}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
    } catch (e: any) {
        throw new Error(`Fetch a ${url} falló: ${e.message}`);
    }
    const data = await res.json();
    if (!res.ok) throw new Error(`POST ${url} → HTTP ${res.status}: ${JSON.stringify(data)}`);
    return data;
}

async function wipeDatabase() {
    console.log('🧹 [1/5] Limpiando Base de Datos (Wipe)...');
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'basestire'
    });

    await db.query('SET FOREIGN_KEY_CHECKS = 0;');
    const [tables] = await db.query('SHOW TABLES');
    
    for (const row of tables as any[]) {
        const tableName = Object.values(row)[0] as string;
        await db.query(`TRUNCATE TABLE \`${tableName}\``);
    }
    
    await db.query('SET FOREIGN_KEY_CHECKS = 1;');
    await db.end();
    console.log('✅ Base de datos truncada y lista.\n');
}

async function seedTeachersAndHierarchy() {
    console.log('👨‍🏫 [2/5] Generando Docentes y Jerarquía Académica...');
    const activitiesData: { id: number, questionId: number }[] = [];

    const db = await mysql.createConnection({
        host: 'localhost', user: 'root', password: 'root', database: 'basestire'
    });

    for (let i = 0; i < NUM_TEACHERS; i++) {
        const email = faker.internet.email().toLowerCase();
        const password = 'Password123!';
        
        // 1. Registro
        await post('/auth/register', {
            email,
            password,
            fullName: faker.person.fullName()
        });

        // 2. Ascenso a docente
        await db.execute('UPDATE users SET role = ? WHERE email = ?', ['docente', email]);

        // 3. Login
        const { token } = await post('/auth/login', { email, password });

        // 4. Crear ActivityType base para este docente
        const actType = await post('/activity-types', {
            name: `Práctica ${faker.word.adjective()}`,
            code: faker.string.alphanumeric(8).toUpperCase(),
            baseWeight: 1.0
        }, token);

        // 5. Crear Clases (2 por docente)
        for (let c = 0; c < 2; c++) {
            const cls = await post('/class', {
                name: faker.company.catchPhrase(),
                code: faker.string.alphanumeric(6).toUpperCase()
            }, token);

            // 6. Secciones (2 por clase)
            for (let s = 0; s < 2; s++) {
                const section = await post('/sections', {
                    title: `Módulo: ${faker.commerce.department()}`,
                    classId: cls.id,
                    order: s + 1
                }, token);

                // 7. Temas (2 por sección)
                for (let t = 0; t < 2; t++) {
                    const topic = await post('/topic', {
                        title: faker.hacker.phrase(),
                        sectionId: section.id,
                        order: t + 1
                    }, token);

                    // 8. Learning Units (2 por tema)
                    for (let lu = 0; lu < 2; lu++) {
                        const unit = await post('/learning-unit', {
                            title: `Concepto: ${faker.hacker.noun()}`,
                            difficulty: faker.helpers.arrayElement(['basico', 'intermedio', 'avanzado']),
                            topicId: topic.id,
                            order: lu + 1
                        }, token);

                        // 9. Actividad y Pregunta
                        const activity = await post('/activities', {
                            title: `Reto de ${faker.hacker.verb()}`,
                            learningUnitId: unit.id,
                            activityTypeId: actType.id,
                            difficulty: faker.helpers.arrayElement(['basico', 'intermedio', 'avanzado']),
                            totalPoints: 100,
                            passingScore: 60
                        }, token);

                        const question = await post('/activity-questions', {
                            activityId: activity.id,
                            type: 'coding',
                            question: `Escribe un código que haga: ${faker.company.buzzPhrase()}`,
                            points: 100,
                            order: 1,
                            config: {
                                language: 'javascript',
                                starterCode: 'function solve() { }',
                                testCases: [{ input: '1', expected: '1', weight: 100 }]
                            }
                        }, token);

                        activitiesData.push({ id: activity.id, questionId: question.id });
                    }
                }
            }
        }
        console.log(`   ✔ Docente ${i+1}/${NUM_TEACHERS} completó su jerarquía.`);
    }

    await db.end();
    console.log(`✅ Jerarquía generada (${activitiesData.length} actividades listas).\n`);
    return activitiesData;
}

async function seedStudents() {
    console.log(`👨‍🎓 [3/5] Registrando ${NUM_STUDENTS} Estudiantes...`);
    const studentTokens: string[] = [];

    // Hacemos el registro en lotes para no saturar el servidor HTTP local
    const batchSize = 10;
    for (let i = 0; i < NUM_STUDENTS; i += batchSize) {
        const batch = Array.from({ length: Math.min(batchSize, NUM_STUDENTS - i) }).map(async () => {
            const email = faker.internet.email().toLowerCase();
            const password = 'Password123!';
            
            await post('/auth/register', {
                email,
                password,
                fullName: faker.person.fullName()
            });

            const { token } = await post('/auth/login', { email, password });
            return token;
        });

        const tokens = await Promise.all(batch);
        studentTokens.push(...tokens);
        process.stdout.write(`\r   Progreso: ${studentTokens.length}/${NUM_STUDENTS}`);
    }
    console.log('\n✅ Todos los estudiantes autenticados.\n');
    return studentTokens;
}

async function runLoadTest(activities: { id: number, questionId: number }[], studentTokens: string[]) {
    console.log('🔥 [4/5] Iniciando Load Test (Submissions concurrentes)...');
    
    const submissionsToMake = studentTokens.map(token => {
        // Cada estudiante toma una actividad al azar
        const activity = faker.helpers.arrayElement(activities);
        return { token, activity };
    });

    console.log(`   Disparando ${submissionsToMake.length} submissions al Motor de Evaluación...`);
    const tsStart = Date.now();

    // Iniciar y enviar (Load Test masivo)
    const results = await Promise.allSettled(submissionsToMake.map(async ({ token, activity }) => {
        // 1. Iniciar
        const sub = await post('/submissions/start', { activityId: activity.id }, token);
        
        // 2. Enviar (aleatoriamente correcto o incorrecto)
        const isCorrect = faker.datatype.boolean();
        const code = isCorrect 
            ? 'function solve() { return 1; } console.log(solve());' // Responde '1'
            : 'function solve() { return 0; } console.log(solve());'; // Responde '0'

        return await post(`/submissions/${sub.id}/submit`, {
            timeSpentSeconds: faker.number.int({ min: 10, max: 300 }),
            answers: [{
                questionId: activity.questionId,
                answer: { code }
            }]
        }, token);
    }));

    const tsEnd = Date.now();
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.length - successful;

    console.log(`✅ Load Test Finalizado en ${(tsEnd - tsStart) / 1000}s`);
    console.log(`   👉 Exitosos: ${successful}`);
    console.log(`   👉 Fallidos: ${failed}\n`);
}

async function main() {
    try {
        console.log('===================================================');
        console.log('🚀 STIRE MASSIVE SIMULATOR & LOAD TEST');
        console.log('===================================================\n');

        await wipeDatabase();
        const activities = await seedTeachersAndHierarchy();
        const studentTokens = await seedStudents();
        await runLoadTest(activities, studentTokens);

        console.log('===================================================');
        console.log('🎉 SIMULACIÓN COMPLETADA CON ÉXITO');
        console.log('Revisa la base de datos y los logs de BullMQ/NestJS.');
        console.log('===================================================\n');
        process.exit(0);
    } catch (error: any) {
        console.error('\n❌ Error Crítico en la Simulación:', error.message);
        process.exit(1);
    }
}

main();
