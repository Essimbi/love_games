import { Express } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { validateRequest } from '../middleware/validation.js';
import { z } from 'zod';
import { isDatabaseAvailable } from '../../../server/database/db.js';

const trackEventSchema = z.object({}).passthrough();

export function setupAnalyticsRoutes(app: Express): void {
  // Track an event
  app.post(
    '/api/analytics/track',
    validateRequest(trackEventSchema),
    (req, res): any => {
      if (!isDatabaseAvailable()) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'Database not available in development mode',
          statusCode: 503,
          timestamp: new Date().toISOString()
        });
      }
      AnalyticsController.trackEvent(req, res);
    }
  );

  // Get analytics summary
  app.get(
    '/api/analytics/summary',
    (req, res): any => {
      if (!isDatabaseAvailable()) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'Database not available in development mode',
          statusCode: 503,
          timestamp: new Date().toISOString()
        });
      }
      AnalyticsController.getSummary(req, res);
    }
  );

  // Get events for a specific game
  app.get(
    '/api/analytics/games/:gameId',
    (req, res): any => {
      if (!isDatabaseAvailable()) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'Database not available in development mode',
          statusCode: 503,
          timestamp: new Date().toISOString()
        });
      }
      AnalyticsController.getGameEvents(req, res);
    }
  );
}
