import { Component, OnInit, ChangeDetectorRef, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LoveWheelService, LoveWheelResponse, SpinResult } from '../../services/love-wheel.service';
import { LoveWheelCanvasComponent } from '../canvas/canvas.component';

@Component({
  selector: 'app-love-wheel-play',
  standalone: true,
  imports: [CommonModule, LoveWheelCanvasComponent],
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.scss']
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
    private loveWheelService: LoveWheelService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

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

    // Call API to get the result first
    this.loveWheelService.spinWheel(id, this.sessionId).subscribe({
      next: (result) => {
        this.lastResult = result;

        // Calculate the target rotation to land on the specific section
        // 1. Find section index (0-based)
        const sectionIndex = result.sectionNumber - 1;
        const sectionCount = this.wheel!.sections.length;
        const anglePerSection = 360 / sectionCount;

        // 2. targetAngle puts the pointer (at top, 270 deg usually in canvas coords if 0 is right)
        // In our canvas drawing: 
        // ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        // pointer is at (centerX, 15), which is at -90 degrees (or 270).
        // To make segment X be at top (-90 deg), its center angle after rotation must be -90.
        // segmentAngle = index * anglePerSection + (anglePerSection / 2)
        // targetAngle = -90 - segmentAngle

        const segmentCenterAngle = (sectionIndex * anglePerSection) + (anglePerSection / 2);
        // We want (segmentCenterAngle + totalRotation) % 360 == 270
        // So totalRotation = 270 - segmentCenterAngle
        let landingAngle = 270 - segmentCenterAngle;
        if (landingAngle < 0) landingAngle += 360;

        // 3. Add base rotations (e.g., 5-8 full spins)
        const totalRotation = (360 * 6) + landingAngle;

        this.animateWheel(totalRotation, () => {
          this.ngZone.run(() => {
            this.showResult = true;
            this.spinHistory.unshift(result);
            this.isSpinning = false;
            this.cdr.detectChanges(); // Explicitly trigger detection

            // Force scroll to top to ensure result is visible
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
          });
        });
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to spin wheel';
        this.isSpinning = false;
      }
    });
  }

  private animateWheel(targetRotation: number, onComplete: () => void): void {
    const duration = 4000; // 4 seconds for a more dramatic effect
    const startTime = performance.now();
    const startRotation = this.wheelRotation % 360;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (custom ease-out cubic-quintic blend for "heavy" wheel feel)
      const t = progress;
      const easeProgress = 1 - Math.pow(1 - t, 4); // Quartic ease out

      this.wheelRotation = startRotation + targetRotation * easeProgress;
      this.cdr.detectChanges();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.wheelRotation = startRotation + targetRotation;
        this.cdr.detectChanges();
        onComplete();
      }
    };

    requestAnimationFrame(animate);
  }

  private generateSessionId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
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
