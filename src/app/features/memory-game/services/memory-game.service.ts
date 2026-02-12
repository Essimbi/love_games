import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Observable } from 'rxjs';

export interface CreateMemoryGameRequest {
  finalMessage: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  images: string[];
}

export interface MemoryGameResponse {
  id: string;
  finalMessage: string;
  difficultyLevel: string;
  images: string[];
  createdAt: string;
}

export interface MemoryScore {
  timeSeconds: number;
  movesCount: number;
  completedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class MemoryGameService {
  
  constructor(private api: ApiService) {}
  
  /**
   * Create a new memory game
   */
  createGame(
    finalMessage: string,
    difficultyLevel: 'easy' | 'medium' | 'hard',
    images: string[]
  ): Observable<{ id: string; finalMessage: string; difficultyLevel: string; createdAt: string }> {
    const request: CreateMemoryGameRequest = {
      finalMessage,
      difficultyLevel,
      images
    };
    
    return this.api.post('/memory-games', request);
  }
  
  /**
   * Get a memory game
   */
  getGame(id: string): Observable<MemoryGameResponse> {
    return this.api.get(`/memory-games/${id}`);
  }
  
  /**
   * Complete a memory game and save score
   */
  completeGame(id: string, timeSeconds: number, movesCount: number): Observable<MemoryScore> {
    return this.api.post(`/memory-games/${id}/complete`, {
      timeSeconds,
      movesCount
    });
  }
  
  /**
   * Fisher-Yates shuffle algorithm
   */
  shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  /**
   * Create card pairs for memory game
   */
  createCardPairs(images: string[]): { id: number; imageIndex: number; image: string; flipped: boolean; matched: boolean }[] {
    const pairs = images.flatMap((image, index) => [
      { id: index * 2, imageIndex: index, image, flipped: false, matched: false },
      { id: index * 2 + 1, imageIndex: index, image, flipped: false, matched: false }
    ]);
    
    return this.shuffleArray(pairs);
  }
}
