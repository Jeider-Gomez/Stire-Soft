const mysql = require('mysql2/promise');

async function migrate() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'basestire',
  });

  console.log('Conectado a MySQL...');

  try {
    // 1. Rename table progress to learning_states
    await conn.execute(`RENAME TABLE progress TO learning_states`);
    console.log('Renamed table progress to learning_states');
  } catch (e) {
    console.log('Table learning_states might already exist or progress does not exist: ', e.message);
  }

  try {
    // 2. Drop lastReview column
    await conn.execute(`ALTER TABLE learning_states DROP COLUMN lastReview`);
    console.log('Dropped column lastReview');
  } catch (e) {
    console.log('Column lastReview might not exist: ', e.message);
  }

  try {
    // 3. Rename reviewCount to totalAttempts
    await conn.execute(`ALTER TABLE learning_states CHANGE reviewCount totalAttempts INT DEFAULT 0`);
    console.log('Renamed reviewCount to totalAttempts');
  } catch (e) {
    console.log('Column reviewCount might not exist: ', e.message);
  }

  try {
    // 4. Add successRate
    await conn.execute(`ALTER TABLE learning_states ADD COLUMN successRate INT DEFAULT 0`);
    console.log('Added column successRate');
  } catch (e) {
    console.log('Column successRate might already exist: ', e.message);
  }

  try {
    // 5. Add difficulty and weight to evaluations
    await conn.execute(`ALTER TABLE evaluations ADD COLUMN difficulty ENUM('basico','intermedio','avanzado') DEFAULT 'basico'`);
    await conn.execute(`ALTER TABLE evaluations ADD COLUMN weight FLOAT DEFAULT 1.0`);
    console.log('Added difficulty and weight to evaluations');
  } catch (e) {
    console.log('Columns difficulty/weight might already exist: ', e.message);
  }

  await conn.end();
  console.log('✅ Migración de BD completada');
}

migrate().catch(err => {
  console.error('Error en migración:', err.message);
  process.exit(1);
});
