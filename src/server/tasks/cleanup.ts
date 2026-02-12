import { getDatabase } from '../database/db.js';
import * as fs from 'fs';
import * as path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'src', 'uploads');
const ANALYTICS_RETENTION_DAYS = 90;

/**
 * Clean up expired secret messages
 */
export function cleanupExpiredMessages(): void {
  try {
    const db = getDatabase();
    const now = new Date().toISOString();

    // Delete expired messages
    const result = db.prepare(`
      DELETE FROM secret_messages
      WHERE expires_at IS NOT NULL AND expires_at < ?
    `).run(now);

    if (result.changes > 0) {
      console.log(`✅ Cleaned up ${result.changes} expired secret messages`);
    }
  } catch (error) {
    console.error('❌ Error cleaning up expired messages:', error);
  }
}

/**
 * Clean up messages that have reached max views
 */
export function cleanupMaxViewMessages(): void {
  try {
    const db = getDatabase();

    // Get messages that have reached max views
    const messages = db.prepare(`
      SELECT id FROM secret_messages
      WHERE max_views IS NOT NULL AND views_count >= max_views
    `).all() as any[];

    if (messages.length > 0) {
      const deleteStmt = db.prepare('DELETE FROM secret_messages WHERE id = ?');
      messages.forEach(msg => deleteStmt.run(msg.id));
      console.log(`✅ Cleaned up ${messages.length} messages that reached max views`);
    }
  } catch (error) {
    console.error('❌ Error cleaning up max view messages:', error);
  }
}

/**
 * Clean up old analytics events
 */
export function cleanupOldAnalytics(): void {
  try {
    const db = getDatabase();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - ANALYTICS_RETENTION_DAYS);
    const cutoffIso = cutoffDate.toISOString();

    // Delete old analytics events
    const result = db.prepare(`
      DELETE FROM analytics_events
      WHERE created_at < ?
    `).run(cutoffIso);

    if (result.changes > 0) {
      console.log(`✅ Cleaned up ${result.changes} old analytics events (> ${ANALYTICS_RETENTION_DAYS} days)`);
    }
  } catch (error) {
    console.error('❌ Error cleaning up analytics:', error);
  }
}

/**
 * Clean up orphaned uploaded files
 */
export function cleanupOrphanedFiles(): void {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      return;
    }

    const db = getDatabase();
    const files = fs.readdirSync(UPLOAD_DIR);
    let deletedCount = 0;

    files.forEach(filename => {
      // Check if file is referenced in database
      const count = db.prepare(`
        SELECT COUNT(*) as count FROM memory_games
        WHERE image_urls LIKE ?
      `).get(`%${filename}%`) as any;

      if (count.count === 0) {
        const filepath = path.join(UPLOAD_DIR, filename);
        try {
          fs.unlinkSync(filepath);
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete orphaned file ${filename}:`, error);
        }
      }
    });

    if (deletedCount > 0) {
      console.log(`✅ Cleaned up ${deletedCount} orphaned uploaded files`);
    }
  } catch (error) {
    console.error('❌ Error cleaning up orphaned files:', error);
  }
}

/**
 * Run all cleanup tasks
 */
export function runCleanupTasks(): void {
  console.log('🧹 Starting cleanup tasks...');
  const startTime = Date.now();

  cleanupExpiredMessages();
  cleanupMaxViewMessages();
  cleanupOldAnalytics();
  cleanupOrphanedFiles();

  const duration = Date.now() - startTime;
  console.log(`✅ Cleanup tasks completed in ${duration}ms`);
}

/**
 * Schedule cleanup tasks to run daily at 2 AM
 */
export function scheduleCleanupTasks(): void {
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(2, 0, 0, 0);

  // If it's already past 2 AM, schedule for tomorrow
  if (now > scheduledTime) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  const timeUntilCleanup = scheduledTime.getTime() - now.getTime();

  console.log(`📅 Cleanup tasks scheduled for ${scheduledTime.toLocaleString()}`);

  setTimeout(() => {
    runCleanupTasks();
    // Run cleanup every 24 hours
    setInterval(runCleanupTasks, 24 * 60 * 60 * 1000);
  }, timeUntilCleanup);
}


/**
 * Setup cleanup tasks (exported for server initialization)
 */
export function setupCleanupTask(): void {
  scheduleCleanupTasks();
}
