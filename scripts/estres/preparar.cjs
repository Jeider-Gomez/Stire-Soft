// Prueba de estrés de STIRE (pedido del profesor Toscano, 20/10: «prueba de estrés con una batería con varios casos»).
// Paso 1: prepara N estudiantes de prueba matriculados en una clase de la BASE LOCAL y escribe la configuración que usa
// la batería (scripts/estres/bateria.mjs). Se niega a tocar cualquier base que no sea la de pruebas.
//
//   node scripts/estres/preparar.cjs --clase 2 --estudiantes 100
//   node scripts/estres/preparar.cjs --borrar          (quita los estudiantes de estrés y sus entregas)
//
// Los estudiantes se llaman «Estudiante de estrés NNN» y su correo es estres-NNN@stire.local; la contraseña es la misma
// para todos y solo existe en la base local.

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const raiz = path.join(__dirname, '..', '..');
require(path.join(raiz, 'node_modules', 'dotenv')).config({ path: path.join(raiz, '.env'), quiet: true });
const mysql = require(path.join(raiz, 'node_modules', 'mysql2', 'promise'));
const bcrypt = require(path.join(raiz, 'node_modules', 'bcrypt'));

const BASE_PERMITIDA = 'stire_pruebas_local';
const CLAVE = 'Estres123.';
const arg = (n, def) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 ? process.argv[i + 1] : def;
};
const base = process.env.ESTRES_DB || BASE_PERMITIDA;

(async () => {
  if (base !== BASE_PERMITIDA) throw new Error(`Solo se prepara la base ${BASE_PERMITIDA}, no «${base}».`);
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USERNAME, password: process.env.DB_PASSWORD, database: base,
  });

  if (process.argv.includes('--borrar')) {
    const [u] = await db.query("SELECT id FROM users WHERE email LIKE 'estres-%@stire.local'");
    const ids = u.map((x) => x.id);
    if (ids.length) {
      await db.query('DELETE er FROM execution_results er JOIN submission_answers sa ON sa.id = er.submissionAnswerId JOIN submissions s ON s.id = sa.submissionId WHERE s.studentId IN (?)', [ids]);
      await db.query('DELETE sa FROM submission_answers sa JOIN submissions s ON s.id = sa.submissionId WHERE s.studentId IN (?)', [ids]);
      for (const t of ['submissions', 'learning_progress', 'review_schedules', 'enrollments']) {
        await db.query(`DELETE FROM ${t} WHERE ${t === 'enrollments' || t === 'submissions' ? 'studentId' : 'studentId'} IN (?)`, [ids]).catch(() => {});
      }
      await db.query('DELETE FROM users WHERE id IN (?)', [ids]);
    }
    console.log(`Borrados ${ids.length} estudiantes de estrés.`);
    await db.end();
    return;
  }

  const clase = Number(arg('clase', '2'));
  const n = Number(arg('estudiantes', '100'));
  const hash = await bcrypt.hash(CLAVE, 10);
  for (let i = 1; i <= n; i++) {
    const email = `estres-${String(i).padStart(3, '0')}@stire.local`;
    const [ya] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    let id = ya[0]?.id;
    if (!id) {
      const [r] = await db.query("INSERT INTO users (email, password, fullName, role, isActive) VALUES (?, ?, ?, 'estudiante', 1)", [email, hash, `Estudiante de estrés ${i}`]);
      id = r.insertId;
    }
    await db.query(
      "INSERT INTO enrollments (id, classId, studentId, status) SELECT ?, ?, ?, 'active' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM enrollments WHERE classId = ? AND studentId = ?)",
      [crypto.randomUUID(), clase, id, clase, id],
    );
  }

  // Los ejercicios que usa la batería: opción múltiple (con su respuesta) y de programar (con un código que pasa).
  const [acts] = await db.query(
    `SELECT a.id, a.learningUnitId, q.id AS qid, q.type, q.config FROM activities a
       JOIN activity_questions q ON q.activityId = a.id
       JOIN learning_units lu ON lu.id = a.learningUnitId JOIN topics t ON t.id = lu.topicId JOIN sections s ON s.id = t.sectionId
      WHERE s.classId = ? AND a.status = 'published' AND a.deletedAt IS NULL AND a.asignadaA IS NULL AND q.type IN ('mcq', 'coding')
      ORDER BY s.order, t.order, lu.order, a.order, a.id`,
    [clase],
  );
  const cfg = (c) => (typeof c === 'string' ? JSON.parse(c) : c);
  const mcq = acts.filter((a) => a.type === 'mcq').map((a) => ({ id: a.id, qid: a.qid, unidad: a.learningUnitId, respuesta: { selectedId: cfg(a.config).correctAnswerId } }));
  // Programar: el primero es «Tu primer console.log»; su salida esperada sale del caso.
  const programar = acts.filter((a) => a.type === 'coding').slice(0, 3).map((a) => {
    const caso = cfg(a.config).testCases?.[0];
    return { id: a.id, qid: a.qid, unidad: a.learningUnitId, codigo: caso && !caso.input ? `console.log(${JSON.stringify(caso.expected)});` : 'console.log(1);' };
  });
  const salida = { clase, clave: CLAVE, estudiantes: Array.from({ length: n }, (_, i) => `estres-${String(i + 1).padStart(3, '0')}@stire.local`), mcq, programar };
  fs.writeFileSync(path.join(__dirname, 'config.local.json'), JSON.stringify(salida, null, 1));
  console.log(`Listos ${n} estudiantes en la clase ${clase}; ${mcq.length} de opción múltiple y ${programar.length} de programar.`);
  await db.end();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
