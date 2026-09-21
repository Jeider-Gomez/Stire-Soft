import { DataSource, getMetadataArgsStorage } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config();

export function normalizeSqliteMetadata() {
  const loadEntities = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        loadEntities(fullPath);
      } else if (entry.name.endsWith('.entity.js') || entry.name.endsWith('.entity.ts')) {
        try {
          require(path.resolve(fullPath));
        } catch {
          // ignore duplicate or non-resolvable loads
        }
      }
    }
  };

  loadEntities(__dirname);

  const storage = getMetadataArgsStorage();
  for (const col of storage.columns) {
    if (col.options.type === 'enum') col.options.type = 'simple-enum';
    if (col.options.type === 'json') col.options.type = 'simple-json';
    if (col.options.type === 'longtext' || col.options.type === 'mediumtext') col.options.type = 'text';
    if (col.options.type === 'timestamp') col.options.type = 'datetime';
  }
}

const useMysql = process.env.DB_TYPE === 'mysql';

if (!useMysql) {
  normalizeSqliteMetadata();
}

export const AppDataSource = new DataSource(
  useMysql
    ? {
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_DATABASE || 'basestire',
        entities: [path.join(__dirname, '/**/*.entity{.ts,.js}')],
        migrations: [path.join(__dirname, '/migrations/**/*{.ts,.js}')],
        synchronize: false,
        logging: process.env.NODE_ENV !== 'production',
      }
    : {
        type: 'sqlite',
        database: process.env.DB_DATABASE || path.join(process.cwd(), 'stire.sqlite'),
        entities: [path.join(__dirname, '/**/*.entity{.ts,.js}')],
        synchronize: true,
        logging: false,
      },
);

