import { Request, Response } from 'express';
import { getDatabase } from '../../database/db.js';
import { generateGameId } from '../utils/id-generator.js';
import { CreateMemoryGameDto, CompleteMemoryGameDto } from '../validators/memory-game.validator.js';

export class MemoryGameController {
  /**
   * Create a new memory game
   */
  static createGame(req: Request, res: Response): void {
    try {
      const data: CreateMemoryGameDto = req.body;
      const db = getDatabase();
      
      const gameId = generateGameId();
      const now = new Date().toISOString();
      
      // Insert game
      const gameStmt = db.prepare(`
        INSERT INTO memory_games (id, final_message, difficulty_level, created_at)
        VALUES (?, ?, ?, ?)
      `);
      
      gameStmt.run(gameId, data.finalMessage, data.difficultyLevel, now);
      
      // Insert images
      const imageStmt = db.prepare(`
        INSERT INTO memory_images (game_id, image_data, position)
        VALUES (?, ?, ?)
      `);
      
      data.images.forEach((imageData, index) => {
        imageStmt.run(gameId, imageData, index);
      });
      
      res.status(201).json({
        id: gameId,
        finalMessage: data.finalMessage,
        difficultyLevel: data.difficultyLevel,
        createdAt: now
      });
    } catch (error) {
      console.error('Error creating memory game:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create memory game',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * Get a memory game
   */
  static getGame(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const db = getDatabase();
      
      // Get game
      const game = db.prepare(`
        SELECT * FROM memory_games WHERE id = ?
      `).get(id) as any;
      
      if (!game) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Memory game not found',
          statusCode: 404,
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      // Get images
      const images = db.prepare(`
        SELECT image_data FROM memory_images WHERE game_id = ? ORDER BY position
      `).all() as any[];
      
      res.json({
        id: game.id,
        finalMessage: game.final_message,
        difficultyLevel: game.difficulty_level,
        images: images.map(img => img.image_data),
        createdAt: game.created_at
      });
    } catch (error) {
      console.error('Error retrieving memory game:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve memory game',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * Complete a memory game and save score
   */
  static completeGame(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const data: CompleteMemoryGameDto = req.body;
      const db = getDatabase();
      
      // Check if game exists
      const game = db.prepare(`
        SELECT id FROM memory_games WHERE id = ?
      `).get(id);
      
      if (!game) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Memory game not found',
          statusCode: 404,
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      // Save score
      const scoreStmt = db.prepare(`
        INSERT INTO memory_scores (game_id, time_seconds, moves_count, completed_at)
        VALUES (?, ?, ?, ?)
      `);
      
      const now = new Date().toISOString();
      scoreStmt.run(id, data.timeSeconds, data.movesCount, now);
      
      res.status(201).json({
        message: 'Score saved successfully',
        timeSeconds: data.timeSeconds,
        movesCount: data.movesCount,
        completedAt: now
      });
    } catch (error) {
      console.error('Error completing memory game:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to complete memory game',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }
}
