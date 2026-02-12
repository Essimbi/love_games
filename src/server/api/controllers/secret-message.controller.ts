import { Request, Response } from 'express';
import { getDatabase } from '../../database/db.js';
import { generateGameId } from '../utils/id-generator.js';
import { CreateSecretMessageDto } from '../validators/secret-message.validator.js';

export class SecretMessageController {
  /**
   * Create a new secret message
   */
  static createMessage(req: Request, res: Response): void {
    try {
      const data: CreateSecretMessageDto = req.body;
      const db = getDatabase();

      const id = generateGameId();
      const now = new Date().toISOString();

      const stmt = db.prepare(`
        INSERT INTO secret_messages (
          id, encrypted_content, max_views, current_views, 
          expires_at, background_image, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        data.encryptedContent,
        data.maxViews,
        0,
        data.expiresAt || null,
        data.backgroundImage || null,
        now
      );

      res.status(201).json({
        id,
        maxViews: data.maxViews,
        currentViews: 0,
        expiresAt: data.expiresAt || null,
        backgroundImage: data.backgroundImage || null,
        createdAt: now
      });
    } catch (error) {
      console.error('Error creating secret message:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create secret message',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Retrieve a secret message and increment view counter
   */
  static getMessage(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const db = getDatabase();

      // Get the message
      const message = db.prepare(`
        SELECT * FROM secret_messages WHERE id = ?
      `).get(id) as any;

      if (!message) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Secret message not found or has expired',
          statusCode: 404,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Check if expired
      if (message.expires_at && new Date(message.expires_at) < new Date()) {
        db.prepare('DELETE FROM secret_messages WHERE id = ?').run(id);
        res.status(404).json({
          error: 'Not Found',
          message: 'Secret message has expired',
          statusCode: 404,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Check if max views reached
      if (message.current_views >= message.max_views) {
        db.prepare('DELETE FROM secret_messages WHERE id = ?').run(id);
        res.status(404).json({
          error: 'Not Found',
          message: 'Ce message secret a atteint son nombre maximum de lectures et a été supprimé.',
          statusCode: 404,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Increment view counter
      const newViews = message.current_views + 1;
      const now = new Date().toISOString();

      db.prepare(`
        UPDATE secret_messages 
        SET current_views = ?, last_accessed_at = ?
        WHERE id = ?
      `).run(newViews, now, id);

      // Return the encrypted content
      res.json({
        id: message.id,
        encryptedContent: message.encrypted_content,
        currentViews: newViews,
        maxViews: message.max_views,
        backgroundImage: message.background_image
      });
    } catch (error) {
      console.error('Error retrieving secret message:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Une erreur est survenue lors de la récupération du message.',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Delete a secret message
   */
  static deleteMessage(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const db = getDatabase();

      const result = db.prepare('DELETE FROM secret_messages WHERE id = ?').run(id);

      if ((result as any).changes === 0) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Secret message not found',
          statusCode: 404,
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting secret message:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete secret message',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }
}
