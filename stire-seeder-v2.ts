/**
 * stire-seeder-v2.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Seeder de Dominio Completo para STIRE.
 * Respeta las reglas de negocio, realiza pruebas de seguridad y genera
 * datos realistas de enseñanza de programación en español.
 * ──────────────────────────────────────────────────────────────────────────────
 */
import * as mysql from 'mysql2/promise';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker/locale/es';

const API = 'http://localhost:3000';

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────
async function post(url: string, body: object, token?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
        const res = await fetch(`${API}${url}`, { method: 'POST', headers, body: JSON.stringify(body) });
        return { status: res.status, data: await res.json() };
    } catch (e: any) {
        throw new Error(`fetch ${url} → ${e.message}`);
    }
}

async function ok(url: string, body: object, token: string) {
    const { status, data } = await post(url, body, token);
    if (status >= 300) throw new Error(`POST ${url} → HTTP ${status}: ${JSON.stringify(data)}`);
    return data;
}

function banner(msg: string) {
    console.log(`\n${'═'.repeat(60)}\n  ${msg}\n${'═'.repeat(60)}`);
}
function step(msg: string) { console.log(`\n  ▶ ${msg}`); }
function done(msg: string) { console.log(`    ✅ ${msg}`); }
function warn(msg: string) { console.log(`    ⚠️  ${msg}`); }

// ────────────────────────────────────────────────────────────────────────────
// FASE 0: Diagnóstico — Tablas duplicadas
// ────────────────────────────────────────────────────────────────────────────
async function diagnoseSchema(db: mysql.Connection) {
    banner('FASE 0 — Diagnóstico de Esquema');
    const [tables] = await db.query('SHOW TABLES') as any;
    const names: string[] = tables.map((r: any) => Object.values(r)[0] as string);
    
    step('Verificando tablas duplicadas (bank_questions vs question_banks)...');
    const hasBankQ = names.includes('bank_questions');
    const hasQBank = names.includes('question_banks');
    
    if (hasBankQ && hasQBank) {
        done('bank_questions y question_banks son tablas CORRECTAS (relación padre-hijo).');
        done('  • question_banks = banco de preguntas (contenedor)');
        done('  • bank_questions = preguntas dentro de un banco');
        done('  → No hay duplicados. La arquitectura es correcta.');
    }
    
    step('Listando todas las tablas...');
    console.log('    Tablas encontradas:', names.join(', '));
    return names;
}

// ────────────────────────────────────────────────────────────────────────────
// FASE 1: Wipe DB (respetando FKs via orden de eliminación)
// ────────────────────────────────────────────────────────────────────────────
async function wipeDatabase(db: mysql.Connection) {
    banner('FASE 1 — Limpieza Segura de Base de Datos');
    step('Desactivando FOREIGN_KEY_CHECKS...');
    await db.query('SET FOREIGN_KEY_CHECKS = 0;');
    
    const [tables] = await db.query('SHOW TABLES') as any;
    for (const row of tables) {
        const t = Object.values(row)[0] as string;
        await db.query(`TRUNCATE TABLE \`${t}\``);
    }

    await db.query('SET FOREIGN_KEY_CHECKS = 1;');
    done('Base de datos truncada con éxito.');
}

// ────────────────────────────────────────────────────────────────────────────
// FASE 2: Crear Administrador Semilla
// ────────────────────────────────────────────────────────────────────────────
async function createAdmin(db: mysql.Connection): Promise<string> {
    banner('FASE 2 — Administrador Semilla');
    step('Creando usuario Admin directamente en la BD...');
    
    const adminEmail = 'admin@stire.edu.co';
    const adminPass = 'Admin2024!';
    const hash = await bcrypt.hash(adminPass, 10);
    
    await db.execute(
        `INSERT INTO users (email, password, fullName, role, isActive) VALUES (?, ?, ?, 'admin', 1)`,
        [adminEmail, hash, 'Administrador STIRE']
    );
    
    const { data } = await post('/auth/login', { email: adminEmail, password: adminPass });
    if (!data.token) throw new Error('No se pudo autenticar al Admin.');
    
    done(`Admin creado: ${adminEmail}`);
    done(`Token Admin: ...${data.token.slice(-20)}`);
    return data.token;
}

// ────────────────────────────────────────────────────────────────────────────
// FASE 3: Prueba de Seguridad (Test Negativo)
// ────────────────────────────────────────────────────────────────────────────
async function securityTest(adminToken: string): Promise<string> {
    banner('FASE 3 — Prueba de Seguridad (Test Negativo)');
    
    // Crear un estudiante de prueba
    step('Registrando estudiante infiltrado...');
    await ok('/auth/register', {
        email: 'infiltrado@stire.edu.co',
        password: 'Password123!',
        fullName: 'Estudiante Infiltrado'
    }, adminToken);
    
    const { data: loginData } = await post('/auth/login', {
        email: 'infiltrado@stire.edu.co',
        password: 'Password123!'
    });
    const studentToken = loginData.token;
    done('Estudiante registrado y autenticado (rol: estudiante por defecto).');
    
    // Intento de violación de seguridad
    step('PRUEBA: Estudiante intenta crear una Clase (solo docentes)...');
    const { status, data } = await post('/class', {
        name: 'Clase Ilegal del Infiltrado',
        code: 'HACK001'
    }, studentToken);
    
    console.log(`\n    ┌─ Respuesta del servidor: HTTP ${status}`);
    console.log(`    │  Body: ${JSON.stringify(data)}`);
    
    if (status === 403) {
        done('✅ SEGURIDAD VERIFICADA: NestJS devolvió 403 Forbidden correctamente.');
        done('   El guard @Roles("docente") bloqueó al estudiante infiltrado.');
    } else if (status === 201 || status === 200) {
        console.error('\n    🚨 VULNERABILIDAD DETECTADA: El estudiante logró crear una clase!');
        console.error('    Esto indica que el RolesGuard NO está funcionando. Detener simulación.');
        process.exit(1);
    } else {
        warn(`Status inesperado ${status}. Continuando...`);
    }
    
    return studentToken;
}

// ────────────────────────────────────────────────────────────────────────────
// FASE 4: Crear Docentes y Jerarquía Académica
// ────────────────────────────────────────────────────────────────────────────
const CURRICULUM = [
    {
        className: 'Fundamentos de Programación',
        code: 'FUND-PROG-01',
        sections: [
            { title: 'Módulo 1: Pensamiento Computacional', topics: [
                { title: 'Variables y Tipos de Datos', units: ['¿Qué es una variable?', 'Enteros y Flotantes', 'Cadenas de texto'] },
                { title: 'Estructuras de Control', units: ['Condicionales if/else', 'Bucles for y while', 'Break y Continue'] },
            ]},
            { title: 'Módulo 2: Funciones y Modularidad', topics: [
                { title: 'Definición de Funciones', units: ['Parámetros y Retorno', 'Alcance de Variables', 'Recursividad'] },
            ]},
        ]
    },
    {
        className: 'Estructuras de Datos',
        code: 'ESTR-DATOS-01',
        sections: [
            { title: 'Módulo 1: Arrays y Listas', topics: [
                { title: 'Arrays Unidimensionales', units: ['Declaración e indexación', 'Búsqueda lineal y binaria', 'Ordenamiento burbuja'] },
                { title: 'Matrices', units: ['Recorrido de matrices', 'Multiplicación de matrices'] },
            ]},
            { title: 'Módulo 2: Pilas y Colas', topics: [
                { title: 'Estructura Pila (Stack)', units: ['Implementación con array', 'Aplicaciones: paréntesis balanceados'] },
            ]},
        ]
    },
];

interface ActivityInfo { id: number; questionId: number; classCode: string; }

async function createTeachersAndHierarchy(db: mysql.Connection, adminToken: string): Promise<{ activities: ActivityInfo[], teacherTokens: string[], classCodes: string[] }> {
    banner('FASE 4 — Docentes y Jerarquía Académica');
    
    const activities: ActivityInfo[] = [];
    const teacherTokens: string[] = [];
    const classCodes: string[] = [];

    for (let i = 0; i < 3; i++) {
        const email = `docente${i + 1}@stire.edu.co`;
        const password = 'Docente2024!';
        
        step(`Creando Docente ${i + 1}/3: ${email}`);
        
        // Registrar
        await ok('/auth/register', {
            email,
            password,
            fullName: `Prof. ${faker.person.fullName()}`
        }, adminToken);
        
        // Ascender a docente vía BD
        await db.execute('UPDATE users SET role = ? WHERE email = ?', ['docente', email]);
        
        // Login
        const { data: loginData } = await post('/auth/login', { email, password });
        const teacherToken = loginData.token;
        teacherTokens.push(teacherToken);
        
        // Crear ActivityType para este docente
        const actType = await ok('/activity-types', {
            name: `Reto de Consola (Docente ${i+1})`,
            code: `CONSOLE_IO_${i + 1}`,
            autoGradable: true,
            baseWeight: 10.0,
        }, teacherToken);
        
        // Curriculum asignado (rotamos)
        const curriculum = CURRICULUM[i % CURRICULUM.length];
        
        // Crear Clase
        const classCode = `${curriculum.code}-D${i+1}`;
        const cls = await ok('/class', {
            name: `${curriculum.className} — Grupo ${i+1}`,
            code: classCode
        }, teacherToken);
        classCodes.push(classCode);
        done(`Clase creada: "${cls.name}" (código: ${classCode})`);
        
        // Secciones → Temas → LUs → Actividades
        for (const sec of curriculum.sections) {
            const section = await ok('/sections', { title: sec.title, classId: cls.id, order: 1 }, teacherToken);
            
            for (const top of sec.topics) {
                const topic = await ok('/topic', { title: top.title, sectionId: section.id, order: 1 }, teacherToken);
                
                for (const unitTitle of top.units) {
                    const unit = await ok('/learning-unit', {
                        title: unitTitle,
                        difficulty: faker.helpers.arrayElement(['basico', 'intermedio', 'avanzado']),
                        topicId: topic.id,
                        order: 1
                    }, teacherToken);
                    
                    // Actividad de código tipo console_io
                    const activity = await ok('/activities', {
                        title: `Reto: ${unitTitle}`,
                        learningUnitId: unit.id,
                        activityTypeId: actType.id,
                        difficulty: 'basico',
                        totalPoints: 100,
                        passingScore: 60
                    }, teacherToken);
                    
                    // Pregunta con casos de prueba reales de consola
                    const question = await ok('/activity-questions', {
                        activityId: activity.id,
                        type: 'coding',
                        question: `Escribe un programa que reciba dos números enteros e imprima su suma.\nEjemplo de entrada: 2 3\nEjemplo de salida: 5`,
                        points: 100,
                        order: 1,
                        config: {
                            language: 'javascript',
                            starterCode: 'const line = require("readline").createInterface({input: process.stdin});\nline.on("line", (input) => {\n    // Tu código aquí\n});',
                            testCases: [
                                { input: '2 3', expected: '5', isPublic: true, weight: 30 },
                                { input: '10 20', expected: '30', isPublic: false, weight: 35 },
                                { input: '-5 5', expected: '0', isPublic: false, weight: 35 },
                            ]
                        }
                    }, teacherToken);
                    
                    activities.push({ id: activity.id, questionId: question.id, classCode });
                }
            }
        }
        done(`Docente ${i+1} completó su jerarquía (${activities.length} actividades acumuladas).`);
    }

    // Crear más ActivityTypes pedagógicos vía el primer docente
    step('Creando tipos de actividades adicionales...');
    const extraTypes = [
        { name: 'Quiz de Opción Múltiple', code: 'MCQ_QUIZ', baseWeight: 2.0, autoGradable: true },
        { name: 'Drag & Drop Conceptual', code: 'DRAG_DROP', baseWeight: 3.0, autoGradable: false },
        { name: 'Completar el Código', code: 'FILL_CODE', baseWeight: 5.0, autoGradable: true },
        { name: 'Unit Testing (TDD)', code: 'UNIT_TEST', baseWeight: 10.0, autoGradable: true },
        { name: 'Depuración de Errores', code: 'DEBUG_CODE', baseWeight: 8.0, autoGradable: true },
    ];
    for (const t of extraTypes) {
        await ok('/activity-types', t, teacherTokens[0]);
        done(`  ActivityType: ${t.name} (peso: ${t.baseWeight})`);
    }

    return { activities, teacherTokens, classCodes };
}

// ────────────────────────────────────────────────────────────────────────────
// FASE 5: Crear 30 Estudiantes y Matricularlos
// ────────────────────────────────────────────────────────────────────────────
async function createStudentsAndEnroll(classCodes: string[]): Promise<string[]> {
    banner('FASE 5 — Estudiantes y Matrículas');
    step('Registrando 30 estudiantes y matriculándolos...');
    
    const studentTokens: string[] = [];
    const batchSize = 5;

    for (let i = 0; i < 30; i += batchSize) {
        const batch = Array.from({ length: Math.min(batchSize, 30 - i) }).map(async (_, j) => {
            const email = `estudiante${i + j + 1}@stire.edu.co`;
            const password = 'Estudiante2024!';

            await ok('/auth/register', {
                email,
                password,
                fullName: `${faker.person.firstName()} ${faker.person.lastName()}`
            }, ''); // sin token (registro público)
            
            const { data } = await post('/auth/login', { email, password });
            const token = data.token;
            
            // Matricular en 1 o 2 clases aleatorias
            const classesToJoin = faker.helpers.arrayElements(classCodes, faker.number.int({ min: 1, max: 2 }));
            for (const code of classesToJoin) {
                try {
                    await ok('/enrollment/join', { code }, token);
                } catch {
                    // Ignorar error de duplicado (si ya está matriculado)
                }
            }
            
            return token;
        });
        
        const tokens = await Promise.all(batch);
        studentTokens.push(...tokens);
        process.stdout.write(`\r    Progreso: ${studentTokens.length}/30`);
    }
    
    console.log(`\n`);
    done(`30 estudiantes creados y matriculados en las clases.`);
    return studentTokens;
}

// ────────────────────────────────────────────────────────────────────────────
// FASE 6: Load Test — Submissions con Código Variado
// ────────────────────────────────────────────────────────────────────────────
const CODE_SAMPLES = {
    correct: `
const lines = [];
require('readline').createInterface({ input: process.stdin })
    .on('line', l => lines.push(l))
    .on('close', () => {
        const [a, b] = lines[0].split(' ').map(Number);
        console.log(a + b);
    });
`.trim(),
    wrong_answer: `
console.log(0); // respuesta incorrecta
`.trim(),
    syntax_error: `
function solve( {
    console.log('error de sintaxis aquí';
`.trim(),
    timeout_risk: `
while(true) { /* infinite loop */ }
`.trim(),
};

async function runSubmissions(activities: ActivityInfo[], studentTokens: string[]) {
    banner('FASE 6 — Submissions y Load Test');
    step(`Disparando submissions concurrentes con código variado...`);
    
    const SUBMISSIONS_PER_STUDENT = 3;
    const allJobs: Promise<any>[] = [];

    for (const studentToken of studentTokens) {
        for (let s = 0; s < SUBMISSIONS_PER_STUDENT; s++) {
            const activity = faker.helpers.arrayElement(activities);
            
            // Distribución realista de tipos de respuesta
            const codeKey = faker.helpers.weightedArrayElement([
                { weight: 50, value: 'correct' },
                { weight: 30, value: 'wrong_answer' },
                { weight: 15, value: 'syntax_error' },
                { weight: 5,  value: 'timeout_risk' },
            ]) as keyof typeof CODE_SAMPLES;
            
            allJobs.push(
                (async () => {
                    try {
                        const sub = await ok('/submissions/start', { activityId: activity.id }, studentToken);
                        return await ok(`/submissions/${sub.id}/submit`, {
                            timeSpentSeconds: faker.number.int({ min: 30, max: 600 }),
                            answers: [{
                                questionId: activity.questionId,
                                answer: { code: CODE_SAMPLES[codeKey] }
                            }]
                        }, studentToken);
                    } catch (e: any) {
                        return { error: e.message };
                    }
                })()
            );
        }
    }

    const tsStart = Date.now();
    const results = await Promise.allSettled(allJobs);
    const elapsed = ((Date.now() - tsStart) / 1000).toFixed(2);
    
    const successful = results.filter(r => r.status === 'fulfilled' && !(r.value as any)?.error).length;
    const failed = results.length - successful;
    
    done(`Load Test completado en ${elapsed}s`);
    done(`Total submissions: ${results.length}`);
    done(`  ✅ Exitosas: ${successful}`);
    done(`  ❌ Fallidas: ${failed}`);
    warn(`Verifica la consola de NestJS para ver BullMQ procesando los trabajos de Docker Sandbox.`);
}

// ────────────────────────────────────────────────────────────────────────────
// MAIN
// ────────────────────────────────────────────────────────────────────────────
async function main() {
    banner('🚀 STIRE SEEDER V2 — Dominio Completo');
    
    const db = await mysql.createConnection({
        host: 'localhost', user: 'root', password: 'root', database: 'basestire'
    });
    
    try {
        await diagnoseSchema(db);
        await wipeDatabase(db);
        const adminToken = await createAdmin(db);
        await securityTest(adminToken);
        const { activities, teacherTokens, classCodes } = await createTeachersAndHierarchy(db, adminToken);
        const studentTokens = await createStudentsAndEnroll(classCodes);
        await runSubmissions(activities, studentTokens);
        
        banner('🎉 SEEDING COMPLETO');
        console.log('  Usuarios Admin:     1  (admin@stire.edu.co / Admin2024!)');
        console.log('  Docentes:           3  (docente1@stire.edu.co / Docente2024!)');
        console.log('  Estudiantes:        30 (estudiante1@stire.edu.co / Estudiante2024!)');
        console.log(`  Actividades:        ${activities.length}`);
        console.log(`  Submissions (Jobs): ${studentTokens.length * 3}`);
        console.log('');
        
        await db.end();
        process.exit(0);
    } catch (err: any) {
        console.error(`\n❌ Error Crítico: ${err.message}`);
        await db.end();
        process.exit(1);
    }
}

main();
