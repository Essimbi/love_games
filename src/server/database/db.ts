import { join } from 'node:path';
import { readFileSync } from 'node:fs';

let db: any;
let dbPath: string;

export async function setupDatabase(): Promise<void> {
  console.log('🔄 Initializing database...');

  try {
    // Dynamically import better-sqlite3 to avoid issues in dev server
    const Database = (await import('better-sqlite3')).default;

    dbPath = process.env['DATABASE_PATH'] || 'database.sqlite';

    db = new Database(dbPath);

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Initialize migrations table
    db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Run migrations - read from relative path
    try {
      const migrationDir = join(process.cwd(), 'src/server/database/migrations');
      const migrations = [
        '001_initial_schema.sql',
        '002_add_3d_navigation.sql'
      ];

      const appliedMigrations = db.prepare('SELECT name FROM migrations').all().map((m: any) => m.name);

      for (const migration of migrations) {
        if (!appliedMigrations.includes(migration)) {
          const migrationPath = join(migrationDir, migration);
          const migrationSQL = readFileSync(migrationPath, 'utf-8');

          try {
            db.transaction(() => {
              db.exec(migrationSQL);
              db.prepare('INSERT INTO migrations (name) VALUES (?)').run(migration);
            })();
            console.log(`✅ Applied migration: ${migration}`);
          } catch (mError: any) {
            if (mError.message?.includes('duplicate column name')) {
              console.warn(`⏳ Migration ${migration} partially applied previously. Resolving...`);
              db.prepare('INSERT INTO migrations (name) VALUES (?)').run(migration);
            } else {
              throw mError;
            }
          }
        } else {
          console.log(`⏩ Skipping migration: ${migration}`);
        }
      }
    } catch (error) {
      console.error('Failed to run migrations:', error);
      throw error;
    }

    console.log('✅ Database initialized successfully at', dbPath);
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

export function getDatabase(): any {
  if (!db) {
    throw new Error('Database not initialized. Call setupDatabase() first or ensure you are not in dev server mode.');
  }
  return db;
}

export function isDatabaseAvailable(): boolean {
  return db !== undefined && db !== null;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    console.log('✅ Database connection closed');
  }
}
