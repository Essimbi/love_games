import { Express } from 'express';
import { SecretMessageController } from '../controllers/secret-message.controller.js';
import { validateRequest } from '../middleware/validation.js';
import { createGameLimiter } from '../middleware/rate-limiter.js';
import { createSecretMessageSchema } from '../validators/secret-message.validator.js';
import { isDatabaseAvailable } from '../../../server/database/db.js';

export function setupSecretMessageRoutes(app: Express): void {
  // Create a new secret message
  app.post(
    '/api/secret-messages',
    createGameLimiter,
    validateRequest(createSecretMessageSchema),
    (req, res): any => {
      if (!isDatabaseAvailable()) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'Database not available in development mode',
          statusCode: 503,
          timestamp: new Date().toISOString()
        });
      }
      SecretMessageController.createMessage(req, res);
    }
  );
  
  // Get a secret message
  app.get(
    '/api/secret-messages/:id',
    (req, res): any => {
      if (!isDatabaseAvailable()) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'Database not available in development mode',
          statusCode: 503,
          timestamp: new Date().toISOString()
        });
      }
      SecretMessageController.getMessage(req, res);
    }
  );
  
  // Delete a secret message
  app.delete(
    '/api/secret-messages/:id',
    (req, res): any => {
      if (!isDatabaseAvailable()) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'Database not available in development mode',
          statusCode: 503,
          timestamp: new Date().toISOString()
        });
      }
      SecretMessageController.deleteMessage(req, res);
    }
  );
}
