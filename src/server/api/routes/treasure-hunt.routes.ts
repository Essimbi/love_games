import { Express } from 'express';
import { TreasureHuntController } from '../controllers/treasure-hunt.controller.js';
import { validateRequest } from '../middleware/validation.js';
import { createGameLimiter } from '../middleware/rate-limiter.js';
import { createTreasureHuntSchema, validateStepSchema } from '../validators/treasure-hunt.validator.js';
import { isDatabaseAvailable } from '../../../server/database/db.js';

export function setupTreasureHuntRoutes(app: Express): void {
  // Create a new treasure hunt
  app.post(
    '/api/treasure-hunts',
    createGameLimiter,
    validateRequest(createTreasureHuntSchema),
    (req, res): any => {
      if (!isDatabaseAvailable()) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'Database not available in development mode',
          statusCode: 503,
          timestamp: new Date().toISOString()
        });
      }
      TreasureHuntController.createHunt(req, res);
    }
  );
  
  // Get a treasure hunt
  app.get(
    '/api/treasure-hunts/:id',
    (req, res): any => {
      if (!isDatabaseAvailable()) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'Database not available in development mode',
          statusCode: 503,
          timestamp: new Date().toISOString()
        });
      }
      TreasureHuntController.getHunt(req, res);
    }
  );
  
  // Validate a step
  app.post(
    '/api/treasure-hunts/:id/validate-step/:stepNumber',
    validateRequest(validateStepSchema),
    (req, res): any => {
      if (!isDatabaseAvailable()) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'Database not available in development mode',
          statusCode: 503,
          timestamp: new Date().toISOString()
        });
      }
      TreasureHuntController.validateStep(req, res);
    }
  );
  
  // Get progress
  app.get(
    '/api/treasure-hunts/:id/progress',
    (req, res): any => {
      if (!isDatabaseAvailable()) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'Database not available in development mode',
          statusCode: 503,
          timestamp: new Date().toISOString()
        });
      }
      TreasureHuntController.getProgress(req, res);
    }
  );
}
