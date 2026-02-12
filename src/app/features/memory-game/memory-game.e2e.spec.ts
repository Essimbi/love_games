import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MemoryGameService } from './services/memory-game.service';

describe('Memory Game E2E Workflow', () => {
  let memoryGameService: MemoryGameService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MemoryGameService]
    });

    memoryGameService = TestBed.inject(MemoryGameService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should complete full workflow: create -> play -> complete', async () => {
    // Step 1: Create a memory game
    const formData = new FormData();
    formData.append('finalMessage', 'You won!');
    formData.append('difficulty', 'medium');

    const createRequest = memoryGameService.createGame(formData);

    createRequest.subscribe(response => {
      expect(response.id).toBeDefined();
      expect(response.difficulty).toBe('medium');
    });

    const createReq = httpMock.expectOne('/memory-games');
    expect(createReq.request.method).toBe('POST');
    const createdGame = {
      id: 'game-123',
      difficulty: 'medium',
      finalMessage: 'You won!',
      imageCount: 6
    };
    createReq.flush(createdGame);

    // Step 2: Get game configuration
    const getRequest = memoryGameService.getGame('game-123');

    getRequest.subscribe(response => {
      expect(response.id).toBe('game-123');
      expect(response.cards).toBeDefined();
      expect(response.cards.length).toBeGreaterThan(0);
    });

    const getReq = httpMock.expectOne('/memory-games/game-123');
    expect(getReq.request.method).toBe('GET');
    const gameConfig = {
      id: 'game-123',
      difficulty: 'medium',
      cards: [
        { id: 1, imageUrl: 'image1.jpg', matched: false },
        { id: 2, imageUrl: 'image1.jpg', matched: false },
        { id: 3, imageUrl: 'image2.jpg', matched: false },
        { id: 4, imageUrl: 'image2.jpg', matched: false }
      ]
    };
    getReq.flush(gameConfig);

    // Step 3: Complete the game
    const completeRequest = memoryGameService.completeGame('game-123', {
      time: 120,
      moves: 8,
      score: 85
    });

    completeRequest.subscribe(response => {
      expect(response.score).toBe(85);
      expect(response.completed).toBe(true);
    });

    const completeReq = httpMock.expectOne('/memory-games/game-123/complete');
    expect(completeReq.request.method).toBe('POST');
    const completedGame = {
      id: 'game-123',
      score: 85,
      time: 120,
      moves: 8,
      completed: true
    };
    completeReq.flush(completedGame);
  });

  it('should shuffle cards correctly', () => {
    const cards = [
      { id: 1, value: 'A' },
      { id: 2, value: 'A' },
      { id: 3, value: 'B' },
      { id: 4, value: 'B' }
    ];

    const shuffled = memoryGameService.shuffleCards(cards);

    // Check that all cards are still present
    expect(shuffled.length).toBe(cards.length);
    expect(shuffled).toContainEqual({ id: 1, value: 'A' });
    expect(shuffled).toContainEqual({ id: 2, value: 'A' });
    expect(shuffled).toContainEqual({ id: 3, value: 'B' });
    expect(shuffled).toContainEqual({ id: 4, value: 'B' });
  });

  it('should calculate score correctly', () => {
    const time = 120; // 2 minutes
    const moves = 8;
    const maxScore = 100;

    const score = memoryGameService.calculateScore(time, moves, maxScore);

    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(maxScore);
  });

  it('should handle game difficulty levels', () => {
    const difficulties = ['easy', 'medium', 'hard'];

    difficulties.forEach(difficulty => {
      const cardCount = memoryGameService.getCardCountByDifficulty(difficulty);
      expect(cardCount).toBeGreaterThan(0);
      expect(cardCount % 2).toBe(0); // Must be even
    });
  });
});
