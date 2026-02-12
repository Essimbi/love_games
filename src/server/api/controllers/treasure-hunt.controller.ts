import { Request, Response } from 'express';
import { getDatabase } from '../../database/db.js';
import { generateGameId, generateSessionId } from '../utils/id-generator.js';
import { CreateTreasureHuntDto, ValidateStepDto } from '../validators/treasure-hunt.validator.js';

export class TreasureHuntController {
  /**
   * Create a new treasure hunt
   */
  static createHunt(req: Request, res: Response): void {
    try {
      const data: CreateTreasureHuntDto = req.body;
      const db = getDatabase();
      
      const huntId = generateGameId();
      const now = new Date().toISOString();
      
      // Insert hunt
      const huntStmt = db.prepare(`
        INSERT INTO treasure_hunts (id, final_message, final_gps_lat, final_gps_lng, created_at)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      huntStmt.run(
        huntId,
        data.finalMessage,
        data.finalGpsLat || null,
        data.finalGpsLng || null,
        now
      );
      
      // Insert steps
      const stepStmt = db.prepare(`
        INSERT INTO treasure_steps (
          hunt_id, step_number, title, description, hint_1, hint_2,
          answer_type, correct_answer, success_message, error_message, image_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      data.steps.forEach(step => {
        stepStmt.run(
          huntId,
          step.stepNumber,
          step.title,
          step.description,
          step.hint1 || null,
          step.hint2 || null,
          step.answerType,
          step.correctAnswer,
          step.successMessage || null,
          step.errorMessage || null,
          step.imageUrl || null
        );
      });
      
      res.status(201).json({
        id: huntId,
        finalMessage: data.finalMessage,
        finalGpsLat: data.finalGpsLat || null,
        finalGpsLng: data.finalGpsLng || null,
        createdAt: now
      });
    } catch (error) {
      console.error('Error creating treasure hunt:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create treasure hunt',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * Get a treasure hunt
   */
  static getHunt(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const db = getDatabase();
      
      // Get hunt
      const hunt = db.prepare(`
        SELECT * FROM treasure_hunts WHERE id = ?
      `).get(id) as any;
      
      if (!hunt) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Treasure hunt not found',
          statusCode: 404,
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      // Get steps
      const steps = db.prepare(`
        SELECT * FROM treasure_steps WHERE hunt_id = ? ORDER BY step_number
      `).all() as any[];
      
      res.json({
        id: hunt.id,
        finalMessage: hunt.final_message,
        finalGpsLat: hunt.final_gps_lat,
        finalGpsLng: hunt.final_gps_lng,
        steps: steps.map(step => ({
          id: step.id,
          stepNumber: step.step_number,
          title: step.title,
          description: step.description,
          hint1: step.hint_1,
          hint2: step.hint_2,
          answerType: step.answer_type,
          successMessage: step.success_message,
          errorMessage: step.error_message,
          imageUrl: step.image_url
        })),
        createdAt: hunt.created_at
      });
    } catch (error) {
      console.error('Error retrieving treasure hunt:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve treasure hunt',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * Validate a step answer
   */
  static validateStep(req: Request, res: Response): void {
    try {
      const { id, stepNumber } = req.params;
      const data: ValidateStepDto = req.body;
      const db = getDatabase();
      
      const stepNum = parseInt(stepNumber as string);
      
      // Get step
      const step = db.prepare(`
        SELECT * FROM treasure_steps WHERE hunt_id = ? AND step_number = ?
      `).get(id, stepNum) as any;
      
      if (!step) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Step not found',
          statusCode: 404,
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      // Validate answer
      const isCorrect = data.answer.toLowerCase().trim() === step.correct_answer.toLowerCase().trim();
      
      res.json({
        isCorrect,
        message: isCorrect ? step.success_message : step.error_message,
        nextStep: isCorrect ? stepNum + 1 : null
      });
    } catch (error) {
      console.error('Error validating step:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to validate step',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * Get hunt progress
   */
  static getProgress(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const sessionId = req.query['sessionId'] as string;
      const db = getDatabase();
      
      if (!sessionId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Session ID is required',
          statusCode: 400,
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      // Get or create progress
      let progress = db.prepare(`
        SELECT * FROM treasure_progress WHERE hunt_id = ? AND session_id = ?
      `).get(id, sessionId) as any;
      
      if (!progress) {
        const progressId = generateGameId();
        const now = new Date().toISOString();
        
        db.prepare(`
          INSERT INTO treasure_progress (hunt_id, session_id, current_step, started_at)
          VALUES (?, ?, ?, ?)
        `).run(id, sessionId, 1, now);
        
        progress = {
          hunt_id: id,
          session_id: sessionId,
          current_step: 1,
          hints_used: '[]',
          started_at: now,
          completed_at: null
        };
      }
      
      res.json({
        currentStep: progress.current_step,
        hintsUsed: JSON.parse(progress.hints_used || '[]'),
        startedAt: progress.started_at,
        completedAt: progress.completed_at
      });
    } catch (error) {
      console.error('Error getting progress:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get progress',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }
}
