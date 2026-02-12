import { Express } from 'express';
import { MemoryGameController } from '../controllers/memory-game.controller.js';
import { validateRequest } from '../middleware/validation.js';
import { createGameLimiter } from '../middleware/rate-limiter.js';
import { createMemoryGameSchema, completeMemoryGameSchema } from '../validators/memory-game.validator.js';
import { isDatabaseAvailable } from '../../../server/database/db.js';
import { sendFile } from '../utils/file-handler.js';

export function setupMemoryGameRoutes(app: Express): void {
  // Create a new memory game
  app.post(
    '/api/memory-games',
    createGameLimiter,
    validateRequest(createMemoryGameSchema),
    (req, res): any => {
      if (!isDatabaseAvailable()) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'Database not available in development mode',
          statusCode: 503,
          timestamp: new Date().toISOString()
        });
      }
      MemoryGameController.createGame(req, res);
    }
  );
  
  // Get a memory game
  app.get(
    '/api/memory-games/:id',
    (req, res): any => {
      if (!isDatabaseAvailable()) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'Database not available in development mode',
          statusCode: 503,
          timestamp: new Date().toISOString()
        });
      }
      MemoryGameController.getGame(req, res);
    }
  );
  
  // Complete a memory game
  app.post(
    '/api/memory-games/:id/complete',
    validateRequest(completeMemoryGameSchema),
    (req, res): any => {
      if (!isDatabaseAvailable()) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'Database not available in development mode',
          statusCode: 503,
          timestamp: new Date().toISOString()
        });
      }
      MemoryGameController.completeGame(req, res);
    }
  );
  
  // Serve uploaded images
  app.get('/api/images/:filename', (req, res) => {
    sendFile(req, res);
  });
}


