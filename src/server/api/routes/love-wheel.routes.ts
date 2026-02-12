import { Express } from 'express';
import { LoveWheelController } from '../controllers/love-wheel.controller.js';
import { validateRequest } from '../middleware/validation.js';
import { createGameLimiter } from '../middleware/rate-limiter.js';
import { createLoveWheelSchema, spinWheelSchema } from '../validators/love-wheel.validator.js';
import { isDatabaseAvailable } from '../../../server/database/db.js';

export function setupLoveWheelRoutes(app: Express): void {
  // Create a new love wheel
  app.post(
    '/api/love-wheels',
    createGameLimiter,
    validateRequest(createLoveWheelSchema),
    (req, res): any => {
      if (!isDatabaseAvailable()) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'Database not available in development mode',
          statusCode: 503,
          timestamp: new Date().toISOString()
        });
      }
      LoveWheelController.createWheel(req, res);
    }
  );
  
  // Get a love wheel
  app.get(
    '/api/love-wheels/:id',
    (req, res): any => {
      if (!isDatabaseAvailable()) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'Database not available in development mode',
          statusCode: 503,
          timestamp: new Date().toISOString()
        });
      }
      LoveWheelController.getWheel(req, res);
    }
  );
  
  // Spin the wheel
  app.post(
    '/api/love-wheels/:id/spin',
    validateRequest(spinWheelSchema),
    (req, res): any => {
      if (!isDatabaseAvailable()) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'Database not available in development mode',
          statusCode: 503,
          timestamp: new Date().toISOString()
        });
      }
      LoveWheelController.spinWheel(req, res);
    }
  );
  
  // Get spin history
  app.get(
    '/api/love-wheels/:id/history',
    (req, res): any => {
      if (!isDatabaseAvailable()) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'Database not available in development mode',
          statusCode: 503,
          timestamp: new Date().toISOString()
        });
      }
      LoveWheelController.getHistory(req, res);
    }
  );
}
