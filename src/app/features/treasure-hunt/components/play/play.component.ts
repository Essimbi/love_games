import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TreasureHuntService, TreasureHuntResponse, TreasureStep } from '../../services/treasure-hunt.service';

@Component({
  selector: 'app-treasure-hunt-play',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="treasure-hunt-play">
      <div class="container">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading">
          <div class="spinner"></div>
          <p>Loading treasure hunt...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error && !isLoading" class="error-message">
          {{ error }}
        </div>

        <!-- Game State -->
        <div *ngIf="hunt && !isLoading && !error" class="game-content">
          <!-- Progress Bar -->
          <div class="progress-section">
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="progressPercent"></div>
            </div>
            <p class="progress-text">Step {{ currentStep }} of {{ hunt.steps.length }}</p>
          </div>

          <!-- Current Step -->
          <div class="step-display">
            <h1>{{ currentStepData?.title }}</h1>
            
            <!-- Step Image -->
            <img
              *ngIf="currentStepData?.imageUrl"
              [src]="currentStepData?.imageUrl"
              alt="Step image"
              class="step-image"
            />

            <!-- Step Description -->
            <p class="description">{{ currentStepData?.description }}</p>

            <!-- Hints -->
            <div class="hints-section">
              <button
                type="button"
                (click)="toggleHint(1)"
                class="btn-hint"
                [class.used]="hintsUsed.includes(1)"
              >
                💡 Hint 1
              </button>
              <button
                type="button"
                (click)="toggleHint(2)"
                class="btn-hint"
                [class.used]="hintsUsed.includes(2)"
              >
                💡 Hint 2
              </button>
            </div>

            <!-- Hint Display -->
            <div *ngIf="showHint1" class="hint-box">
              <strong>Hint 1:</strong> {{ currentStepData?.hint1 || 'No hint available' }}
            </div>
            <div *ngIf="showHint2" class="hint-box">
              <strong>Hint 2:</strong> {{ currentStepData?.hint2 || 'No hint available' }}
            </div>

            <!-- Answer Input -->
            <div class="answer-section">
              <label for="answer">Your Answer:</label>
              <input
                id="answer"
                type="text"
                [(ngModel)]="userAnswer"
                (keyup.enter)="submitAnswer()"
                placeholder="Enter your answer..."
                [disabled]="isSubmitting"
              />
              <button
                type="button"
                (click)="submitAnswer()"
                class="btn btn-primary"
                [disabled]="!userAnswer || isSubmitting"
              >
                {{ isSubmitting ? 'Checking...' : '✓ Submit Answer' }}
              </button>
            </div>

            <!-- Feedback -->
            <div *ngIf="feedback" [class]="'feedback ' + feedbackType">
              {{ feedback }}
            </div>
          </div>

          <!-- Completion Screen -->
          <div *ngIf="isCompleted" class="completion-screen">
            <div class="celebration">🎉</div>
            <h2>You Found the Treasure!</h2>
            <p class="final-message">{{ hunt.finalMessage }}</p>
            
            <div *ngIf="hunt.finalGpsLat && hunt.finalGpsLng" class="gps-info">
              <p><strong>Final Location:</strong></p>
              <p>{{ hunt.finalGpsLat }}, {{ hunt.finalGpsLng }}</p>
              <a
                [href]="'https://maps.google.com/?q=' + hunt.finalGpsLat + ',' + hunt.finalGpsLng"
                target="_blank"
                class="btn btn-secondary"
              >
                📍 Open in Maps
              </a>
            </div>

            <button
              type="button"
              (click)="resetGame()"
              class="btn btn-primary"
            >
              🔄 Play Again
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .treasure-hunt-play {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem 1rem;
    }

    .container {
      max-width: 700px;
      margin: 0 auto;
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    }

    .loading {
      text-align: center;
      padding: 3rem 1rem;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #e0e0e0;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-message {
      background: #ffebee;
      color: #c62828;
      padding: 1.5rem;
      border-radius: 0.5rem;
      text-align: center;
    }

    .progress-section {
      margin-bottom: 2rem;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s ease;
    }

    .progress-text {
      text-align: center;
      margin-top: 0.5rem;
      color: #666;
      font-size: 0.9rem;
    }

    .step-display h1 {
      color: #764ba2;
      margin-bottom: 1rem;
      text-align: center;
    }

    .step-image {
      width: 100%;
      max-height: 300px;
      object-fit: cover;
      border-radius: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .description {
      color: #333;
      line-height: 1.6;
      margin-bottom: 1.5rem;
      font-size: 1.05rem;
    }

    .hints-section {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .btn-hint {
      flex: 1;
      padding: 0.75rem;
      background: #f0f0f0;
      border: 2px solid #e0e0e0;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 600;
    }

    .btn-hint:hover {
      background: #e8e8e8;
      border-color: #667eea;
    }

    .btn-hint.used {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .hint-box {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      color: #856404;
    }

    .answer-section {
      margin: 2rem 0;
    }

    .answer-section label {
      display: block;
      margin-bottom: 0.5rem;
      color: #333;
      font-weight: 600;
    }

    .answer-section input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 0.5rem;
      font-size: 1rem;
      margin-bottom: 1rem;
      transition: border-color 0.3s;
    }

    .answer-section input:focus {
      outline: none;
      border-color: #667eea;
    }

    .answer-section input:disabled {
      background: #f5f5f5;
      cursor: not-allowed;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.5rem;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 600;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      width: 100%;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #667eea;
      color: white;
      display: inline-block;
      text-decoration: none;
      text-align: center;
    }

    .btn-secondary:hover {
      background: #5568d3;
    }

    .feedback {
      padding: 1rem;
      border-radius: 0.5rem;
      margin-top: 1rem;
      text-align: center;
      font-weight: 600;
    }

    .feedback.success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .feedback.error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .completion-screen {
      text-align: center;
      padding: 2rem 0;
    }

    .celebration {
      font-size: 4rem;
      margin-bottom: 1rem;
      animation: bounce 0.6s ease-in-out infinite;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }

    .completion-screen h2 {
      color: #764ba2;
      margin-bottom: 1rem;
      font-size: 2rem;
    }

    .final-message {
      color: #333;
      font-size: 1.1rem;
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .gps-info {
      background: #f0f0f0;
      padding: 1.5rem;
      border-radius: 0.75rem;
      margin-bottom: 2rem;
    }

    .gps-info p {
      margin: 0.5rem 0;
      color: #333;
    }

    @media (max-width: 600px) {
      .container {
        padding: 1rem;
      }

      .hints-section {
        flex-direction: column;
      }
    }
  `]
})
export class TreasureHuntPlayComponent implements OnInit {
  hunt: TreasureHuntResponse | null = null;
  currentStep = 1;
  userAnswer = '';
  isLoading = true;
  isSubmitting = false;
  error = '';
  feedback = '';
  feedbackType = '';
  showHint1 = false;
  showHint2 = false;
  hintsUsed: number[] = [];
  isCompleted = false;
  sessionId = '';

  constructor(
    private route: ActivatedRoute,
    private treasureHuntService: TreasureHuntService
  ) {}

  ngOnInit(): void {
    this.sessionId = this.treasureHuntService.generateSessionId();
    this.loadHunt();
  }

  private loadHunt(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Invalid treasure hunt ID';
      this.isLoading = false;
      return;
    }

    this.treasureHuntService.getHunt(id).subscribe({
      next: (hunt) => {
        this.hunt = hunt;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load treasure hunt';
        this.isLoading = false;
      }
    });
  }

  get currentStepData(): TreasureStep | undefined {
    return this.hunt?.steps[this.currentStep - 1];
  }

  get progressPercent(): number {
    return this.hunt ? (this.currentStep / this.hunt.steps.length) * 100 : 0;
  }

  toggleHint(hintNumber: number): void {
    if (hintNumber === 1) {
      this.showHint1 = !this.showHint1;
      if (this.showHint1 && !this.hintsUsed.includes(1)) {
        this.hintsUsed.push(1);
      }
    } else {
      this.showHint2 = !this.showHint2;
      if (this.showHint2 && !this.hintsUsed.includes(2)) {
        this.hintsUsed.push(2);
      }
    }
  }

  submitAnswer(): void {
    if (!this.hunt || !this.userAnswer.trim()) return;

    this.isSubmitting = true;
    this.feedback = '';

    const huntId = this.route.snapshot.paramMap.get('id');
    if (!huntId) return;

    this.treasureHuntService.validateStep(huntId, this.currentStep, this.userAnswer).subscribe({
      next: (response) => {
        this.isSubmitting = false;

        if (response.isCorrect) {
          this.feedback = response.message;
          this.feedbackType = 'success';
          this.userAnswer = '';
          this.showHint1 = false;
          this.showHint2 = false;

          if (this.currentStep === this.hunt!.steps.length) {
            this.isCompleted = true;
          } else {
            setTimeout(() => {
              this.currentStep++;
              this.feedback = '';
            }, 1500);
          }
        } else {
          this.feedback = response.message;
          this.feedbackType = 'error';
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.feedback = err.error?.message || 'Error validating answer';
        this.feedbackType = 'error';
      }
    });
  }

  resetGame(): void {
    this.currentStep = 1;
    this.userAnswer = '';
    this.isCompleted = false;
    this.feedback = '';
    this.hintsUsed = [];
    this.showHint1 = false;
    this.showHint2 = false;
  }
}
