/**
 * stire-seeder-v3.ts — Seeder de Dominio Completo (SQL Directo)
 */
import * as mysql from 'mysql2/promise';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker/locale/es';

type Conn = mysql.Connection;
const rnd = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const rndInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

async function connect(): Promise<Conn> {
    return mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'basestire' });
}

async function wipe(db: Conn) {
    console.log('🧹 Limpiando BD...');
    await db.query('SET FOREIGN_KEY_CHECKS=0');
    const [tables] = await db.query('SHOW TABLES') as any;
    for (const r of tables) await db.query(`TRUNCATE TABLE \`${Object.values(r)[0]}\``);
    await db.query('SET FOREIGN_KEY_CHECKS=1');
    // Espera a que NestJS (synchronize:true) re-sincronice el esquema si es necesario
    await new Promise(res => setTimeout(res, 2000));
    console.log('✅ BD limpia\n');
}

async function seedInstitutions(db: Conn) {
    console.log('🏛 Instituciones y Programas...');
    const [r1] = await db.execute(
        'INSERT INTO institutions (name) VALUES (?)', ['Universidad de Córdoba']
    ) as any;
    const [r2] = await db.execute(
        'INSERT INTO institutions (name) VALUES (?)', ['Liceo Guillermo Valencia (LIGUIVA)']
    ) as any;
    const uCordId = r1.insertId;
    const liguivaId = r2.insertId;

    const [p1] = await db.execute(
        'INSERT INTO programs (name, maxSemesters, institutionId) VALUES (?,?,?)',
        ['Ingeniería de Sistemas', 10, uCordId]
    ) as any;
    const [p2] = await db.execute(
        'INSERT INTO programs (name, maxSemesters, institutionId) VALUES (?,?,?)',
        ['Licenciatura en Informática', 8, uCordId]
    ) as any;
    const [p3] = await db.execute(
        'INSERT INTO programs (name, maxSemesters, institutionId) VALUES (?,?,?)',
        ['Técnico en Sistemas', 4, liguivaId]
    ) as any;

    console.log(`✅ 2 instituciones, 3 programas\n`);
    return { programIds: [p1.insertId, p2.insertId, p3.insertId] };
}

async function seedUsers(db: Conn, programIds: number[]) {
    console.log('👤 Usuarios (Admin, 3 Docentes, 30 Estudiantes)...');
    const hash = await bcrypt.hash('STIRE2024!', 10);
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Admin
    await db.execute(
        'INSERT INTO users (email,password,fullName,role,isActive,createdAt,updatedAt) VALUES (?,?,?,?,1,?,?)',
        ['admin@stire.edu.co', hash, 'Administrador STIRE', 'admin', now, now]
    );

    // Docentes
    const teacherIds: number[] = [];
    const teacherData = [
        ['docente1@stire.edu.co', 'Prof. Carlos Mendoza'],
        ['docente2@stire.edu.co', 'Prof. Luisa Herrera'],
        ['docente3@stire.edu.co', 'Prof. Andrés Romero'],
    ];
    for (const [email, fullName] of teacherData) {
        const [r] = await db.execute(
            'INSERT INTO users (email,password,fullName,role,isActive,createdAt,updatedAt) VALUES (?,?,?,?,1,?,?)',
            [email, hash, fullName, 'docente', now, now]
        ) as any;
        teacherIds.push(r.insertId);
        await db.execute(
            'INSERT INTO user_affiliations (userId,programId,roleType,currentSemester,isActive) VALUES (?,?,?,?,1)',
            [r.insertId, programIds[0], 'docente', null]
        );
    }

    // Estudiantes
    const studentIds: number[] = [];
    for (let i = 1; i <= 30; i++) {
        const [r] = await db.execute(
            'INSERT INTO users (email,password,fullName,role,isActive,createdAt,updatedAt) VALUES (?,?,?,?,1,?,?)',
            [`estudiante${i}@stire.edu.co`, hash, `${faker.person.firstName()} ${faker.person.lastName()}`, 'estudiante', now, now]
        ) as any;
        studentIds.push(r.insertId);
        await db.execute(
            'INSERT INTO user_affiliations (userId,programId,roleType,currentSemester,isActive) VALUES (?,?,?,?,1)',
            [r.insertId, rnd(programIds), 'estudiante', rndInt(1, 8)]
        );
    }

    console.log(`✅ 1 admin, ${teacherIds.length} docentes, ${studentIds.length} estudiantes\n`);
    return { teacherIds, studentIds };
}

async function seedActivityTypes(db: Conn, teacherId: number) {
    console.log('📋 Activity Types...');
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const types = [
        ['Console I/O', 'CONSOLE_IO', 1, 10.0],
        ['Unit Testing', 'UNIT_TEST', 1, 10.0],
        ['Quiz Múltiple', 'MCQ_QUIZ', 1, 2.0],
        ['Drag & Drop', 'DRAG_DROP', 0, 3.0],
        ['Completar Código', 'FILL_CODE', 1, 5.0],
        ['Depuración', 'DEBUG_CODE', 1, 8.0],
    ];
    const ids: number[] = [];
    for (const [name, code, auto, weight] of types) {
        const [r] = await db.execute(
            'INSERT INTO activity_types (name,code,autoGradable,baseWeight,createdAt,updatedAt) VALUES (?,?,?,?,?,?)',
            [name, code, auto, weight, now, now]
        ) as any;
        ids.push(r.insertId);
    }
    console.log(`✅ ${ids.length} tipos de actividad\n`);
    return ids;
}

const CURRICULUM = [
    {
        name: 'Fundamentos de Programación', code: 'FUND-PROG-01',
        sections: [
            { title: 'Módulo 1: Pensamiento Computacional', topics: [
                { title: 'Variables y Tipos de Datos', units: ['¿Qué es una variable?', 'Enteros y Flotantes en Python', 'Cadenas de texto y booleanos'] },
                { title: 'Estructuras de Control', units: ['Condicionales if/elif/else', 'Bucle for en Python', 'Bucle while y break'] },
            ]},
            { title: 'Módulo 2: Funciones', topics: [
                { title: 'Definición de Funciones', units: ['Parámetros y retorno', 'Alcance de variables (scope)', 'Recursividad básica'] },
            ]},
        ]
    },
    {
        name: 'Estructuras de Datos', code: 'ESTR-DATOS-01',
        sections: [
            { title: 'Módulo 1: Arrays y Listas', topics: [
                { title: 'Arrays Unidimensionales', units: ['Declaración e indexación', 'Búsqueda lineal', 'Ordenamiento burbuja'] },
            ]},
        ]
    },
];

interface UnitRecord { id: number; topicId: number; order: number; }
interface ActivityRecord { id: number; questionId: number; unitId: number; }

async function seedHierarchy(db: Conn, teacherIds: number[], actTypeIds: number[]) {
    console.log('📚 Jerarquía académica...');
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const allUnits: UnitRecord[] = [];
    const allActivities: ActivityRecord[] = [];
    const allClassIds: number[] = [];

    for (let ti = 0; ti < teacherIds.length; ti++) {
        const curr = CURRICULUM[ti % CURRICULUM.length];
        const tid = teacherIds[ti];

        // Class
        const [cr] = await db.execute(
            'INSERT INTO classes (name,code,teacherId,isActive,createdAt,updatedAt) VALUES (?,?,?,1,?,?)',
            [`${curr.name} — Grupo ${ti + 1}`, `${curr.code}-G${ti + 1}`, tid, now, now]
        ) as any;
        const classId = cr.insertId;
        allClassIds.push(classId);

        let secOrder = 0;
        for (const sec of curr.sections) {
            secOrder++;
            const [sr] = await db.execute(
                'INSERT INTO sections (title,classId,`order`,isPublished,createdAt,updatedAt) VALUES (?,?,?,1,?,?)',
                [sec.title, classId, secOrder, now, now]
            ) as any;

            let topOrder = 0;
            for (const top of sec.topics) {
                topOrder++;
                const [tr] = await db.execute(
                    'INSERT INTO topics (title,sectionId,`order`,createdAt,updatedAt) VALUES (?,?,?,?,?)',
                    [top.title, sr.insertId, topOrder, now, now]
                ) as any;

                let unitOrder = 0;
                let prevUnitId: number | null = null;
                for (const unitTitle of top.units) {
                    unitOrder++;
                    const diff = ['basico', 'intermedio', 'avanzado'][unitOrder - 1] || 'basico';
                    const [ur] = await db.execute(
                        'INSERT INTO learning_units (title,difficulty,topicId,`order`,createdAt,updatedAt) VALUES (?,?,?,?,?,?)',
                        [unitTitle, diff, tr.insertId, unitOrder, now, now]
                    ) as any;
                    const unitId = ur.insertId;
                    allUnits.push({ id: unitId, topicId: tr.insertId, order: unitOrder });

                    // Prerequisito: unidad N requiere unidad N-1
                    if (prevUnitId !== null) {
                        await db.execute(
                            'INSERT INTO prerequisites (targetUnitId,requiredUnitId,minMasteryRequired,createdAt,updatedAt) VALUES (?,?,?,?,?)',
                            [unitId, prevUnitId, 60, now, now]
                        );
                    }
                    prevUnitId = unitId;

                    // Contenido (markdown)
                    for (let ci = 0; ci < 2; ci++) {
                        await db.execute(
                            'INSERT INTO contents (learningUnitId,title,type,body,`order`,isVisible,createdAt,updatedAt) VALUES (?,?,?,?,?,1,?,?)',
                            [unitId, `${ci === 0 ? 'Teoría' : 'Ejemplo'}: ${unitTitle}`, 'markdown',
                             `# ${unitTitle}\n\n${faker.lorem.paragraphs(3)}\n\n\`\`\`python\n# Ejemplo\nprint("Hola STIRE")\n\`\`\``,
                             ci + 1, now, now]
                        );
                    }

                    // Actividad Console I/O
                    const [ar] = await db.execute(
                        'INSERT INTO activities (title,learningUnitId,activityTypeId,createdBy,difficulty,totalPoints,passingScore,attemptsAllowed,`order`,status,isRequired,adaptiveWeight,createdAt,updatedAt) VALUES (?,?,?,?,?,100,60,3,?,?,1,1.0,?,?)',
                        [`Reto: ${unitTitle}`, unitId, actTypeIds[0], tid, diff, unitOrder, 'draft', now, now]
                    ) as any;
                    const actId = ar.insertId;

                    // Pregunta coding
                    const [qr] = await db.execute(
                        'INSERT INTO activity_questions (activityId,type,question,points,`order`,config,createdAt,updatedAt) VALUES (?,?,?,100,1,?,?,?)',
                        [actId, 'coding',
                         `Lee dos enteros de la entrada estándar e imprime su suma.\nEjemplo: entrada "3 7" → salida "10"`,
                         JSON.stringify({ language: 'python', starterCode: 'a, b = map(int, input().split())\n# tu código aquí', testCases: [{ input: '3 7', expected: '10', weight: 50 }, { input: '-1 1', expected: '0', weight: 50 }] }),
                         now, now]
                    ) as any;

                    // Pregunta MCQ
                    const rawOptions = ['Nada', 'Error', 'Un número', 'True'];
                    const correctIndex = 2;
                    const formattedOptions = rawOptions.map((text, index) => ({
                        id: (index + 1).toString(),
                        text: text
                    }));
                    const mcqConfig = {
                        options: formattedOptions,
                        correctAnswerId: (correctIndex + 1).toString()
                    };

                    await db.execute(
                        'INSERT INTO activity_questions (activityId,type,question,points,`order`,config,createdAt,updatedAt) VALUES (?,?,?,20,2,?,?,?)',
                        [actId, 'mcq',
                         `¿Cuál es la salida de print(${rndInt(1, 9)} + ${rndInt(1, 9)})?`,
                         JSON.stringify(mcqConfig),
                         now, now]
                    );

                    allActivities.push({ id: actId, questionId: qr.insertId, unitId });
                }
            }
        }
        console.log(`  ✔ Docente ${ti + 1} — clase ID ${classId}`);
    }

    console.log(`✅ ${allUnits.length} unidades, ${allActivities.length} actividades\n`);
    return { allUnits, allActivities, allClassIds };
}

async function seedQuestionBanks(db: Conn, teacherIds: number[]) {
    console.log('🗃 Question Banks...');
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    for (const tid of teacherIds) {
        const [br] = await db.execute(
            'INSERT INTO question_banks (name,description,authorId,isPublic,createdAt,updatedAt) VALUES (?,?,?,1,?,?)',
            [`Banco de ${faker.word.noun()}`, 'Banco de preguntas de programación', tid, now, now]
        ) as any;
        const bankId = br.insertId;

        const questions = [
            ['coding', '¿Qué imprime print(2**10)?', { answer: '1024' }],
            ['mcq', '¿Cuál es el resultado de bool(0)?', {
                options: ['True', 'False', 'None', 'Error'].map((text, idx) => ({ id: (idx + 1).toString(), text })),
                correctAnswerId: '2'
            }],
            ['mcq', '¿Cuál estructura usa LIFO?', {
                options: ['Cola', 'Árbol', 'Pila', 'Lista'].map((text, idx) => ({ id: (idx + 1).toString(), text })),
                correctAnswerId: '3'
            }],
            ['coding', 'Invierte una cadena en Python', { starter: 's = input()' }],
        ];
        for (const [type, question, config] of questions) {
            await db.execute(
                'INSERT INTO bank_questions (bankId,type,question,config,tags,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?)',
                [bankId, type, question, JSON.stringify(config), 'python,basico', now, now]
            );
        }
    }
    console.log(`✅ ${teacherIds.length} bancos con 4 preguntas cada uno\n`);
}

async function seedEnrollmentsAndProgress(db: Conn, studentIds: number[], allClassIds: number[], allActivities: ActivityRecord[], allUnits: UnitRecord[]) {
    console.log('📝 Matrículas, Submissions y Learning Progress...');
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const submissionIds: string[] = [];

    for (const sid of studentIds) {
        // Matricular en 1-2 clases
        const classes = allClassIds.slice(0, rndInt(1, Math.min(2, allClassIds.length)));
        for (const cid of classes) {
            try {
                await db.execute(
                    'INSERT INTO enrollments (id,classId,studentId,status,joined_at) VALUES (UUID(),?,?,?,NOW())',
                    [cid, sid, 'active']
                );
            } catch {}
        }

        // Submissions (3 por estudiante)
        const acts = [rnd(allActivities), rnd(allActivities), rnd(allActivities)];
        for (const act of acts) {
            const subId = faker.string.uuid();
            const isCorrect = Math.random() > 0.4;
            const score = isCorrect ? rndInt(60, 100) : rndInt(0, 55);
            const status = 'graded';
            await db.execute(
                'INSERT INTO submissions (id,activityId,studentId,score,attemptNumber,status,startedAt,submittedAt,timeSpentSeconds,isAbandoned,createdAt,updatedAt) VALUES (?,?,?,?,1,?,NOW(),NOW(),?,0,?,?)',
                [subId, act.id, sid, score, status, rndInt(30, 600), now, now]
            );

            // SubmissionAnswer con is_correct real
            await db.execute(
                'INSERT INTO submission_answers (submissionId,questionId,answer,isCorrect,score,feedback) VALUES (?,?,?,?,?,?)',
                [subId, act.questionId,
                 JSON.stringify({ code: isCorrect ? 'a,b=map(int,input().split())\nprint(a+b)' : 'print("error")' }),
                 isCorrect, score,
                 isCorrect ? '¡Excelente! Todos los casos pasaron.' : 'Falló 1 o más casos de prueba.']
            );
            submissionIds.push(subId);

            // Activity log
            await db.execute(
                'INSERT INTO activity_logs (id,studentId,action,referenceId,referenceType,metadata,createdAt) VALUES (UUID(),?,?,?,?,?,NOW())',
                [sid, 'submission_graded', subId, 'submission', JSON.stringify({ score, activityId: act.id })]
            );
        }

        // Learning Progress con mastery real
        const units = [rnd(allUnits), rnd(allUnits)];
        for (const unit of units) {
            const mastery = rndInt(10, 95);
            const successRate = mastery / 100;
            try {
                await db.execute(
                    'INSERT INTO learning_progress (studentId,learningUnitId,mastery,successRate,attemptsCount,completedActivities,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?)',
                    [sid, unit.id, mastery, successRate, rndInt(1, 5), rndInt(1, 3), now, now]
                );
            } catch {}

            // Review Schedule (SM-2)
            const nextReview = new Date(Date.now() + rndInt(1, 14) * 86400000);
            try {
                await db.execute(
                    'INSERT INTO review_schedules (studentId,learningUnitId,nextReviewDate,urgencyLevel,intervalDays,repetitions,lastReviewedAt,createdAt,updatedAt) VALUES (?,?,?,?,?,?,NOW(),?,?)',
                    [sid, unit.id, nextReview, rndInt(0, 3), rndInt(1, 21), rndInt(1, 10), now, now]
                );
            } catch {}
        }
    }

    console.log(`✅ Matrículas, ${studentIds.length * 3} submissions, learning_progress y review_schedules poblados\n`);
}

async function seedAchievements(db: Conn, studentIds: number[]) {
    console.log('🏆 Achievements...');
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const badges = [
        ['Primer Hola Mundo', 'Completaste tu primera actividad de código', '🎉', 10],
        ['Racha de 3', 'Respondiste 3 actividades seguidas correctamente', '🔥', 25],
        ['Maestro del Debug', 'Corregiste un error de sintaxis a la primera', '🐛', 20],
        ['Velocista', 'Completaste una actividad en menos de 2 minutos', '⚡', 15],
        ['Estudioso', 'Leíste 5 unidades de contenido', '📖', 10],
    ];
    for (const [name, desc, icon, pts] of badges) {
        const winner = rnd(studentIds);
        await db.execute(
            'INSERT INTO achievements (name,description,iconUrl,points,unlockedById,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?)',
            [name, desc, icon, pts, winner, now, now]
        );
    }
    console.log(`✅ ${badges.length} achievements\n`);
}

async function seedCommunication(db: Conn, teacherIds: number[], studentIds: number[]) {
    console.log('💬 Mensajes y Conversaciones con Tutor...');
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Mensajes docente → estudiante
    for (let i = 0; i < 15; i++) {
        const sender = rnd(teacherIds);
        const receiver = rnd(studentIds);
        await db.execute(
            'INSERT INTO messages (senderId,receiverId,content,isRead,createdAt) VALUES (?,?,?,?,NOW())',
            [sender, receiver,
             rnd(['¡Buen trabajo en el último reto!', 'Recuerda revisar el módulo 2.', 'Tienes hasta el viernes para entregar.', '¿Tienes alguna duda con los bucles?', 'Excelente progreso esta semana.']),
             Math.random() > 0.4]
        );
    }

    // Tutor conversations
    const pairs = [
        ['user', '¿Cómo funciona un bucle for en Python?'],
        ['assistant', 'Un bucle `for` en Python itera sobre una secuencia. Ejemplo:\n```python\nfor i in range(5):\n    print(i)\n```\nEsto imprime del 0 al 4.'],
        ['user', 'Y si quiero solo los números pares?'],
        ['assistant', 'Usa `range(0, 10, 2)` para saltar de 2 en 2, o filtra con `if i % 2 == 0`.'],
    ];
    const sample = studentIds.slice(0, 5);
    for (const sid of sample) {
        for (const [role, content] of pairs) {
            await db.execute(
                'INSERT INTO tutor_conversations (studentId,role,content,createdAt,updatedAt) VALUES (?,?,?,?,?)',
                [sid, role, content, now, now]
            );
        }
    }
    console.log(`✅ 15 mensajes, ${sample.length * pairs.length} entradas en tutor_conversations\n`);
}

async function verifyReport(db: Conn) {
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('  📊 REPORTE DE VERIFICACIÓN');
    console.log('════════════════════════════════════════════════════════════');
    const tables = [
        'users', 'institutions', 'programs', 'user_affiliations',
        'classes', 'sections', 'topics', 'learning_units', 'prerequisites',
        'contents', 'activity_types', 'activities', 'activity_questions',
        'question_banks', 'bank_questions', 'enrollments',
        'submissions', 'submission_answers', 'learning_progress',
        'review_schedules', 'activity_logs', 'achievements',
        'messages', 'tutor_conversations',
    ];
    let allOk = true;
    for (const t of tables) {
        const [rows] = await db.query(`SELECT COUNT(*) as c FROM \`${t}\``) as any;
        const count = rows[0].c;
        const ok = count > 0;
        if (!ok) allOk = false;
        console.log(`  ${ok ? '✅' : '❌'} ${t.padEnd(25)} → ${count} filas`);
    }
    console.log('════════════════════════════════════════════════════════════');
    console.log(allOk ? '\n  🎉 TODAS LAS TABLAS TIENEN DATOS\n' : '\n  ⚠️  Algunas tablas siguen vacías\n');
}

async function main() {
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('  🚀 STIRE SEEDER V3 — Dominio Completo');
    console.log('════════════════════════════════════════════════════════════\n');

    const db = await connect();
    try {
        await wipe(db);
        const { programIds } = await seedInstitutions(db);
        const { teacherIds, studentIds } = await seedUsers(db, programIds);
        const actTypeIds = await seedActivityTypes(db, teacherIds[0]);
        const { allUnits, allActivities, allClassIds } = await seedHierarchy(db, teacherIds, actTypeIds);
        await seedQuestionBanks(db, teacherIds);
        await seedEnrollmentsAndProgress(db, studentIds, allClassIds, allActivities, allUnits);
        await seedAchievements(db, studentIds);
        await seedCommunication(db, teacherIds, studentIds);
        await verifyReport(db);

        console.log('  Contraseña de todos los usuarios: STIRE2024!');
        console.log('  Admin: admin@stire.edu.co');
        console.log('  Docentes: docente1..3@stire.edu.co');
        console.log('  Estudiantes: estudiante1..30@stire.edu.co\n');
        await db.end();
        process.exit(0);
    } catch (e: any) {
        console.error('\n❌ Error:', e.message);
        await db.end();
        process.exit(1);
    }
}

main();
