import { Express } from 'express';
import { setupSecretMessageRoutes } from './secret-message.routes.js';
import { setupMemoryGameRoutes } from './memory-game.routes.js';
import { setupTreasureHuntRoutes } from './treasure-hunt.routes.js';
import { setupLoveWheelRoutes } from './love-wheel.routes.js';
import { setupAnalyticsRoutes } from './analytics.routes.js';

export function setupApiRoutes(app: Express): void {
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // Setup feature routes
  setupSecretMessageRoutes(app);
  setupMemoryGameRoutes(app);
  setupTreasureHuntRoutes(app);
  setupLoveWheelRoutes(app);
  setupAnalyticsRoutes(app);
  
  console.log('✅ API routes configured');
}
