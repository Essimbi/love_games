import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
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
    <div class="confetti-container" *ngIf="confettis.length > 0">
      <div
        *ngFor="let confetti of confettis; trackBy: trackByConfettiId"
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
  styleUrls: ['./confetti.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ConfettiComponent implements OnInit, OnDestroy {
  confettis: Confetti[] = [];
  private timeout: any;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.generateConfetti();
    this.cdr.markForCheck();
    // Auto-cleanup after animation
    this.timeout = setTimeout(() => {
      this.cleanup();
    }, 3500);
  }

  ngOnDestroy(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.confettis = [];
  }

  trackByConfettiId(index: number, item: Confetti): string {
    return item.id;
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
    this.cdr.markForCheck();
  }
}
