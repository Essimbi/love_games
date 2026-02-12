import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LoveWheelService, LoveWheelResponse, SpinResult } from '../../services/love-wheel.service';
import { LoveWheelCanvasComponent } from '../canvas/canvas.component';

@Component({
  selector: 'app-love-wheel-play',
  standalone: true,
  imports: [CommonModule, LoveWheelCanvasComponent],
  template: `
    <div class="love-wheel-play">
      <div class="container">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading">
          <div class="spinner"></div>
          <p>Loading love wheel...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error && !isLoading" class="error-message">
          {{ error }}
        </div>

        <!-- Game State -->
        <div *ngIf="wheel && !isLoading && !error" class="game-content">
          <h1>💕 Love Wheel</h1>

          <!-- Wheel Display -->
          <div class="wheel-section">
            <app-love-wheel-canvas
              [sections]="wheel.sections"
              [size]="300"
              [rotation]="wheelRotation"
            ></app-love-wheel-canvas>
          </div>

          <!-- Spin Button -->
          <button
            type="button"
            (click)="spinWheel()"
            class="btn btn-spin"
            [disabled]="isSpinning"
          >
            {{ isSpinning ? 'Spinning...' : '🎡 SPIN THE WHEEL' }}
          </button>

          <!-- Result Display -->
          <div *ngIf="lastResult" class="result-display" [class.show]="showResult">
            <div class="result-content">
              <div class="result-icon">{{ lastResult.icon || '💕' }}</div>
              <h2>{{ lastResult.text }}</h2>
              <p *ngIf="lastResult.description" class="result-description">
                {{ lastResult.description }}
              </p>
              <p class="result-time">{{ formatTime(lastResult.spunAt) }}</p>
            </div>
          </div>

          <!-- History -->
          <div class="history-section">
            <h3>Recent Spins</h3>
            <div class="history-list">
              <div *ngFor="let spin of spinHistory" class="history-item">
                <span class="history-icon">{{ spin.icon || '💕' }}</span>
                <span class="history-text">{{ spin.text }}</span>
                <span class="history-time">{{ formatTime(spin.spunAt) }}</span>
              </div>
              <div *ngIf="spinHistory.length === 0" class="empty-history">
                No spins yet. Give it a try!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .love-wheel-play {
      min-height: 100vh;
      background: linear-gradient(135deg, #FF6B9D 0%, #C44569 100%);
      padding: 2rem 1rem;
    }

    .container {
      max-width: 600px;
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
      border-top-color: #FF6B9D;
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

    .game-content {
      text-align: center;
    }

    h1 {
      color: #C44569;
      margin-bottom: 2rem;
      font-size: 2rem;
    }

    .wheel-section {
      margin: 2rem 0;
      display: flex;
      justify-content: center;
    }

    .btn-spin {
      background: linear-gradient(135deg, #FF6B9D 0%, #C44569 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      font-size: 1.2rem;
      font-weight: 700;
      border-radius: 0.75rem;
      cursor: pointer;
      transition: all 0.3s;
      width: 100%;
      margin: 2rem 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .btn-spin:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(255, 107, 157, 0.4);
    }

    .btn-spin:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .result-display {
      background: linear-gradient(135deg, #FFE5EC 0%, #FCE4EC 100%);
      border: 2px solid #FF6B9D;
      border-radius: 1rem;
      padding: 2rem;
      margin: 2rem 0;
      opacity: 0;
      transform: scale(0.8);
      transition: all 0.5s ease;
    }

    .result-display.show {
      opacity: 1;
      transform: scale(1);
    }

    .result-content {
      animation: bounce 0.6s ease-in-out;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .result-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .result-display h2 {
      color: #C44569;
      margin: 1rem 0;
      font-size: 1.8rem;
    }

    .result-description {
      color: #666;
      font-size: 1rem;
      margin: 1rem 0;
      line-height: 1.5;
    }

    .result-time {
      color: #999;
      font-size: 0.85rem;
      margin-top: 1rem;
    }

    .history-section {
      margin-top: 3rem;
      text-align: left;
    }

    .history-section h3 {
      color: #C44569;
      margin-bottom: 1rem;
      text-align: center;
    }

    .history-list {
      background: #f9f9f9;
      border-radius: 0.75rem;
      max-height: 300px;
      overflow-y: auto;
    }

    .history-item {
      display: flex;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #e0e0e0;
      gap: 1rem;
    }

    .history-item:last-child {
      border-bottom: none;
    }

    .history-icon {
      font-size: 1.5rem;
      min-width: 30px;
    }

    .history-text {
      flex: 1;
      color: #333;
      font-weight: 500;
    }

    .history-time {
      color: #999;
      font-size: 0.85rem;
      white-space: nowrap;
    }

    .empty-history {
      padding: 2rem 1rem;
      text-align: center;
      color: #999;
    }

    @media (max-width: 600px) {
      .container {
        padding: 1rem;
      }

      h1 {
        font-size: 1.5rem;
      }

      .result-display h2 {
        font-size: 1.3rem;
      }
    }
  `]
})
export class LoveWheelPlayComponent implements OnInit {
  wheel: LoveWheelResponse | null = null;
  isLoading = true;
  isSpinning = false;
  error = '';
  wheelRotation = 0;
  lastResult: SpinResult | null = null;
  showResult = false;
  spinHistory: SpinResult[] = [];
  sessionId = '';

  constructor(
    private route: ActivatedRoute,
    private loveWheelService: LoveWheelService
  ) {}

  ngOnInit(): void {
    this.sessionId = this.generateSessionId();
    this.loadWheel();
  }

  private loadWheel(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Invalid love wheel ID';
      this.isLoading = false;
      return;
    }

    this.loveWheelService.getWheel(id).subscribe({
      next: (wheel) => {
        this.wheel = wheel;
        this.loadHistory();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load love wheel';
        this.isLoading = false;
      }
    });
  }

  private loadHistory(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.loveWheelService.getHistory(id).subscribe({
      next: (response) => {
        this.spinHistory = response.spins;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  spinWheel(): void {
    if (!this.wheel || this.isSpinning) return;

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.isSpinning = true;
    this.showResult = false;

    // Animate wheel rotation
    const spins = 5 + Math.random() * 5;
    const randomAngle = Math.random() * 360;
    const totalRotation = spins * 360 + randomAngle;

    this.animateWheel(totalRotation, () => {
      // Call API to spin
      this.loveWheelService.spinWheel(id, this.sessionId).subscribe({
        next: (result) => {
          this.lastResult = result;
          this.showResult = true;
          this.spinHistory.unshift(result);
          this.isSpinning = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to spin wheel';
          this.isSpinning = false;
        }
      });
    });
  }

  private animateWheel(targetRotation: number, onComplete: () => void): void {
    const duration = 3000; // 3 seconds
    const startTime = Date.now();
    const startRotation = this.wheelRotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      this.wheelRotation = startRotation + targetRotation * easeProgress;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.wheelRotation = startRotation + targetRotation;
        onComplete();
      }
    };

    requestAnimationFrame(animate);
  }

  private generateSessionId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }
}
