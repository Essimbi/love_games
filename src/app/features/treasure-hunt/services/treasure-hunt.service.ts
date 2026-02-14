import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Observable } from 'rxjs';

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface TreasureStep {
  stepNumber: number;
  title: string;
  description: string;
  hint1?: string;
  hint2?: string;
  answerType: 'text' | 'mcq' | 'number';
  successMessage?: string;
  errorMessage?: string;
  imageUrl?: string;
  position: Position3D;
  correctAnswer: string; // Encrypted
}

export interface CreateTreasureHuntRequest {
  mapId: string;
  finalMessage: string;
  treasurePosition: Position3D;
  steps: TreasureStep[];
}

export interface TreasureHuntResponse {
  id: string;
  mapId: string;
  finalMessage: string;
  treasurePosition: Position3D;
  steps: TreasureStep[];
  createdAt: string;
}

export interface ValidateStepResponse {
  isCorrect: boolean;
  message: string;
  nextStep: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class TreasureHuntService {

  constructor(private api: ApiService) { }

  /**
   * Create a new treasure hunt
   */
  createHunt(request: CreateTreasureHuntRequest): Observable<{ id: string; finalMessage: string; createdAt: string }> {
    return this.api.post('/treasure-hunts', request);
  }

  /**
   * Get a treasure hunt
   */
  getHunt(id: string): Observable<TreasureHuntResponse> {
    return this.api.get(`/treasure-hunts/${id}`);
  }

  /**
   * Validate a step answer
   */
  validateStep(id: string, stepNumber: number, answer: string): Observable<ValidateStepResponse> {
    return this.api.post(`/treasure-hunts/${id}/validate-step/${stepNumber}`, { answer });
  }

  /**
   * Get hunt progress
   */
  getProgress(id: string, sessionId: string): Observable<{ currentStep: number; hintsUsed: number[]; startedAt: string; completedAt: string | null }> {
    return this.api.get(`/treasure-hunts/${id}/progress?sessionId=${sessionId}`);
  }

  /**
   * Generate a session ID
   */
  generateSessionId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
