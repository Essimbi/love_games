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

    // Run migrations - read from relative path
    try {
      const migrationPath = join(process.cwd(), 'src/server/database/migrations/001_initial_schema.sql');
      const migrationSQL = readFileSync(migrationPath, 'utf-8');
      db.exec(migrationSQL);
    } catch (error) {
      console.error('Failed to read migration file:', error);
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
