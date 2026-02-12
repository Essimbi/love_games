import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Confetti {
  id: string;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
}

@Component({
  selector: 'app-confetti',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="confetti-container">
      <div
        *ngFor="let confetti of confettis"
        class="confetti"
        [style.left.%]="confetti.left"
        [style.animation-delay.ms]="confetti.delay"
        [style.animation-duration.ms]="confetti.duration"
        [style.background-color]="confetti.color"
        [style.width.px]="confetti.size"
        [style.height.px]="confetti.size"
      ></div>
    </div>
  `,
  styles: [`
    .confetti-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999;
      overflow: hidden;
    }

    .confetti {
      position: absolute;
      top: -10px;
      border-radius: 50%;
      animation: confetti-fall 3s ease-in forwards;
    }

    @keyframes confetti-fall {
      0% {
        transform: translateY(-100vh) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotate(720deg);
        opacity: 0;
      }
    }
  `]
})
export class ConfettiComponent implements OnInit, OnDestroy {
  confettis: Confetti[] = [];
  private timeout: any;

  ngOnInit(): void {
    this.generateConfetti();
    // Auto-cleanup after animation
    this.timeout = setTimeout(() => {
      this.cleanup();
    }, 3500);
  }

  ngOnDestroy(): void {
    clearTimeout(this.timeout);
  }

  private generateConfetti(): void {
    const colors = ['#FF6B9D', '#C44569', '#667eea', '#764ba2', '#FFD700', '#FF69B4'];
    const count = 50;

    for (let i = 0; i < count; i++) {
      this.confettis.push({
        id: `confetti-${i}`,
        left: Math.random() * 100,
        delay: Math.random() * 200,
        duration: 2000 + Math.random() * 1000,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 10
      });
    }
  }

  private cleanup(): void {
    this.confettis = [];
  }
}
