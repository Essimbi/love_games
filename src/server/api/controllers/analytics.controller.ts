import { Request, Response } from 'express';
import { getDatabase } from '../../database/db.js';
import { generateGameId } from '../utils/id-generator.js';

export class AnalyticsController {
  /**
   * Track an analytics event
   */
  static trackEvent(req: Request, res: Response): void {
    try {
      const { eventType, gameId, gameType, metadata } = req.body;
      const db = getDatabase();

      // Get IP address
      const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
        req.socket.remoteAddress ||
        'unknown';

      // Get user agent
      const userAgent = req.headers['user-agent'] || 'unknown';

      const now = new Date().toISOString();

      // Insert event
      const result = db.prepare(`
        INSERT INTO analytics_events (
          event_type, game_id, game_type, metadata,
          ip_address, user_agent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        eventType,
        gameId || null,
        gameType || null,
        metadata ? JSON.stringify(metadata) : null,
        ipAddress,
        userAgent,
        now
      );

      res.status(201).json({
        id: result.lastInsertRowid,
        eventType,
        gameId,
        gameType,
        createdAt: now
      });
    } catch (error: any) {
      console.error('❌ Analytics Tracker Error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: `Failed to track event: ${error.message}`,
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get analytics summary
   */
  static getSummary(req: Request, res: Response): void {
    try {
      const db = getDatabase();
      const days = parseInt(req.query['days'] as string) || 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const cutoffIso = cutoffDate.toISOString();

      // Get event counts by type
      const eventCounts = db.prepare(`
        SELECT event_type, COUNT(*) as count
        FROM analytics_events
        WHERE created_at >= ?
        GROUP BY event_type
      `).all(cutoffIso) as any[];

      // Get event counts by game type
      const gameCounts = db.prepare(`
        SELECT game_type, COUNT(*) as count
        FROM analytics_events
        WHERE created_at >= ? AND game_type IS NOT NULL
        GROUP BY game_type
      `).all(cutoffIso) as any[];

      // Get total events
      const totalEvents = db.prepare(`
        SELECT COUNT(*) as count FROM analytics_events
        WHERE created_at >= ?
      `).get(cutoffIso) as any;

      // Get unique games
      const uniqueGames = db.prepare(`
        SELECT COUNT(DISTINCT game_id) as count FROM analytics_events
        WHERE created_at >= ? AND game_id IS NOT NULL
      `).get(cutoffIso) as any;

      res.json({
        period: {
          days,
          from: cutoffIso,
          to: new Date().toISOString()
        },
        summary: {
          totalEvents: totalEvents.count,
          uniqueGames: uniqueGames.count
        },
        eventsByType: eventCounts.reduce((acc: any, row: any) => {
          acc[row.event_type] = row.count;
          return acc;
        }, {}),
        eventsByGameType: gameCounts.reduce((acc: any, row: any) => {
          acc[row.game_type] = row.count;
          return acc;
        }, {})
      });
    } catch (error) {
      console.error('Error getting analytics summary:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get analytics summary',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get events for a specific game
   */
  static getGameEvents(req: Request, res: Response): void {
    try {
      const { gameId } = req.params;
      const db = getDatabase();

      const events = db.prepare(`
        SELECT * FROM analytics_events
        WHERE game_id = ?
        ORDER BY created_at DESC
        LIMIT 100
      `).all(gameId) as any[];

      res.json({
        gameId,
        events: events.map(event => ({
          id: event.id,
          eventType: event.event_type,
          gameId: event.game_id,
          gameType: event.game_type,
          metadata: event.metadata ? JSON.parse(event.metadata) : null,
          createdAt: event.created_at
        }))
      });
    } catch (error) {
      console.error('Error getting game events:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get game events',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }
}
