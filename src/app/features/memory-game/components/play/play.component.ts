import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MemoryGameService } from '../../services/memory-game.service';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { MemoryCardComponent } from '../card/card.component';

interface Card {
  id: number;
  imageIndex: number;
  image: string;
  flipped: boolean;
  matched: boolean;
}

@Component({
  selector: 'app-memory-game-play',
  standalone: true,
  imports: [CommonModule, MemoryCardComponent],
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.scss']
})
export class MemoryGamePlayComponent implements OnInit {
  gameId: string | null = null;
  cards: Card[] = [];
  finalMessage: string = '';
  loading = true;
  error: string | null = null;
  gameCompleted = false;
  
  // Game stats
  moves = 0;
  matches = 0;
  startTime: number = 0;
  elapsedTime = 0;
  timerInterval: any;
  
  // Game state
  flippedCards: number[] = [];
  canFlip = true;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private memoryGameService: MemoryGameService,
    private analyticsService: AnalyticsService
  ) {}
  
  ngOnInit(): void {
    this.gameId = this.route.snapshot.paramMap.get('id');
    
    if (!this.gameId) {
      this.error = 'ID du jeu manquant';
      this.loading = false;
      return;
    }
    
    this.loadGame();
  }
  
  /**
   * Load the game
   */
  private loadGame(): void {
    this.memoryGameService.getGame(this.gameId!).subscribe({
      next: (game) => {
        this.finalMessage = game.finalMessage;
        this.cards = this.memoryGameService.createCardPairs(game.images);
        this.loading = false;
        this.startTimer();
        this.analyticsService.trackGameViewed('memory_game', this.gameId!);
      },
      error: (err) => {
        this.error = 'Impossible de charger le jeu';
        this.loading = false;
        console.error('Error loading game:', err);
      }
    });
  }
  
  /**
   * Start the timer
   */
  private startTimer(): void {
    this.startTime = Date.now();
    this.timerInterval = setInterval(() => {
      this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
    }, 100);
  }
  
  /**
   * Stop the timer
   */
  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
  
  /**
   * Handle card flip
   */
  onCardFlipped(cardId: number): void {
    if (!this.canFlip || this.gameCompleted) return;
    
    const card = this.cards.find(c => c.id === cardId);
    if (!card || card.flipped || card.matched) return;
    
    card.flipped = true;
    this.flippedCards.push(cardId);
    
    if (this.flippedCards.length === 2) {
      this.canFlip = false;
      this.moves++;
      this.checkMatch();
    }
  }
  
  /**
   * Check if flipped cards match
   */
  private checkMatch(): void {
    const [card1Id, card2Id] = this.flippedCards;
    const card1 = this.cards.find(c => c.id === card1Id)!;
    const card2 = this.cards.find(c => c.id === card2Id)!;
    
    if (card1.imageIndex === card2.imageIndex) {
      // Match found
      card1.matched = true;
      card2.matched = true;
      this.matches++;
      this.flippedCards = [];
      this.canFlip = true;
      
      // Check if game is completed
      if (this.matches === this.cards.length / 2) {
        this.completeGame();
      }
    } else {
      // No match
      setTimeout(() => {
        card1.flipped = false;
        card2.flipped = false;
        this.flippedCards = [];
        this.canFlip = true;
      }, 1000);
    }
  }
  
  /**
   * Complete the game
   */
  private completeGame(): void {
    this.stopTimer();
    this.gameCompleted = true;
    
    // Save score
    this.memoryGameService.completeGame(
      this.gameId!,
      this.elapsedTime,
      this.moves
    ).subscribe({
      next: () => {
        this.analyticsService.trackGameCompleted('memory_game', this.gameId!, {
          timeSeconds: this.elapsedTime,
          movesCount: this.moves
        });
      },
      error: (err) => {
        console.error('Error saving score:', err);
      }
    });
  }
  
  /**
   * Format time for display
   */
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  /**
   * Restart the game
   */
  restartGame(): void {
    this.stopTimer();
    this.cards = this.memoryGameService.createCardPairs(
      this.cards.map(c => c.image).slice(0, this.cards.length / 2)
    );
    this.moves = 0;
    this.matches = 0;
    this.elapsedTime = 0;
    this.gameCompleted = false;
    this.flippedCards = [];
    this.canFlip = true;
    this.startTimer();
  }
  
  /**
   * Go back to home
   */
  goHome(): void {
    this.stopTimer();
    this.router.navigate(['/']);
  }
}
