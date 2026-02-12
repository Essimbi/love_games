import { Request, Response } from 'express';
import { getDatabase } from '../../database/db.js';
import { generateGameId } from '../utils/id-generator.js';
import { CreateLoveWheelDto, SpinWheelDto } from '../validators/love-wheel.validator.js';

export class LoveWheelController {
  /**
   * Create a new love wheel
   */
  static createWheel(req: Request, res: Response): void {
    try {
      const data: CreateLoveWheelDto = req.body;
      const db = getDatabase();

      const wheelId = generateGameId();
      const now = new Date().toISOString();

      // Insert wheel
      const wheelStmt = db.prepare(`
        INSERT INTO love_wheels (id, max_spins_per_day, created_at)
        VALUES (?, ?, ?)
      `);

      wheelStmt.run(wheelId, data.maxSpinsPerDay, now);

      // Insert sections
      const sectionStmt = db.prepare(`
        INSERT INTO wheel_sections (wheel_id, section_number, text, description, color, icon, probability_weight)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      data.sections.forEach(section => {
        sectionStmt.run(
          wheelId,
          section.sectionNumber,
          section.text,
          section.description || null,
          section.color,
          section.icon || null,
          section.probabilityWeight
        );
      });

      res.status(201).json({
        id: wheelId,
        maxSpinsPerDay: data.maxSpinsPerDay,
        sections: data.sections,
        createdAt: now
      });
    } catch (error) {
      console.error('Error creating love wheel:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create love wheel',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get a love wheel
   */
  static getWheel(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const db = getDatabase();

      // Get wheel
      const wheel = db.prepare(`
        SELECT * FROM love_wheels WHERE id = ?
      `).get(id) as any;

      if (!wheel) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Love wheel not found',
          statusCode: 404,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Get sections
      const sections = db.prepare(`
        SELECT * FROM wheel_sections WHERE wheel_id = ? ORDER BY section_number
      `).all(id) as any[];

      res.json({
        id: wheel.id,
        maxSpinsPerDay: wheel.max_spins_per_day,
        sections: sections.map(section => ({
          sectionNumber: section.section_number,
          text: section.text,
          description: section.description,
          color: section.color,
          icon: section.icon,
          probabilityWeight: section.probability_weight
        })),
        createdAt: wheel.created_at
      });
    } catch (error) {
      console.error('Error retrieving love wheel:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve love wheel',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Spin the wheel
   */
  static spinWheel(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const data: SpinWheelDto = req.body;
      const db = getDatabase();

      // Get wheel and sections
      const wheel = db.prepare(`
        SELECT * FROM love_wheels WHERE id = ?
      `).get(id) as any;

      if (!wheel) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Love wheel not found',
          statusCode: 404,
          timestamp: new Date().toISOString()
        });
        return;
      }

      const sections = db.prepare(`
        SELECT * FROM wheel_sections WHERE wheel_id = ? ORDER BY section_number
      `).all(id) as any[];

      // Select a section based on probability weights
      const totalWeight = sections.reduce((sum, s) => sum + s.probability_weight, 0);
      let random = Math.random() * totalWeight;
      let selectedSection = sections[0];

      for (const section of sections) {
        random -= section.probability_weight;
        if (random <= 0) {
          selectedSection = section;
          break;
        }
      }

      // Record the spin
      const now = new Date().toISOString();
      const spinStmt = db.prepare(`
        INSERT INTO wheel_spins (wheel_id, section_id, session_id, is_completed, spun_at)
        VALUES (?, ?, ?, ?, ?)
      `);

      spinStmt.run(id, selectedSection.id, data.sessionId || null, 0, now);

      res.json({
        sectionNumber: selectedSection.section_number,
        text: selectedSection.text,
        description: selectedSection.description,
        color: selectedSection.color,
        icon: selectedSection.icon,
        spunAt: now
      });
    } catch (error) {
      console.error('Error spinning wheel:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to spin wheel',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get spin history
   */
  static getHistory(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const db = getDatabase();

      // Get spins
      const spins = db.prepare(`
        SELECT ws.*, wse.text, wse.description, wse.color, wse.icon
        FROM wheel_spins ws
        JOIN wheel_sections wse ON ws.section_id = wse.id
        WHERE ws.wheel_id = ?
        ORDER BY ws.spun_at DESC
        LIMIT 50
      `).all(id) as any[];

      res.json({
        spins: spins.map(spin => ({
          sectionNumber: spin.section_number,
          text: spin.text,
          description: spin.description,
          color: spin.color,
          icon: spin.icon,
          spunAt: spin.spun_at
        }))
      });
    } catch (error) {
      console.error('Error getting history:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get history',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }
}
