import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique ID for games
 */
export function generateGameId(): string {
  return uuidv4();
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return uuidv4();
}

/**
 * Generate a unique filename for uploads
 */
export function generateFileName(originalName: string): string {
  const ext = originalName.split('.').pop() || 'bin';
  return `${uuidv4()}.${ext}`;
}
