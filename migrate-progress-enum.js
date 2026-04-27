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

  // 1. Ampliar el ENUM para incluir los nuevos valores
  await conn.execute(`
    ALTER TABLE progress 
    MODIFY COLUMN state ENUM('no_visto','visto','en_practica','dominado','explorando','consolidando') 
    NOT NULL DEFAULT 'no_visto'
  `);
  console.log('ENUM ampliado con nuevos estados');

  // 2. Migrar datos: visto → explorando
  const [result1] = await conn.execute(`
    UPDATE progress SET state = 'explorando' WHERE state = 'visto'
  `);
  console.log(`Migrados ${result1.affectedRows} registros: visto → explorando`);

  // 3. Ahora quitar 'visto' del enum (ya no se usa)
  await conn.execute(`
    ALTER TABLE progress 
    MODIFY COLUMN state ENUM('no_visto','explorando','en_practica','consolidando','dominado') 
    NOT NULL DEFAULT 'no_visto'
  `);
  console.log('ENUM final actualizado (sin "visto")');

  await conn.end();
  console.log('✅ Migración completada');
}

migrate().catch(err => {
  console.error('Error en migración:', err.message);
  process.exit(1);
});
