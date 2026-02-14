import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

export interface WheelSection {
  sectionNumber: number;
  text: string;
  description?: string;
  color: string;
  icon?: string;
  probabilityWeight?: number;
}

@Component({
  selector: 'app-love-wheel-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="canvas-container">
      <canvas
        #wheelCanvas
        [width]="size"
        [height]="size"
        class="wheel-canvas"
      ></canvas>
    </div>
  `,
  styles: [`
    .canvas-container {
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }

    .wheel-canvas {
      max-width: 100%;
      height: auto;
    }
  `]
})
export class LoveWheelCanvasComponent implements AfterViewInit, OnChanges {
  @Input() sections: WheelSection[] = [];
  @Input() size = 300;
  @Input() rotation = 0;

  @ViewChild('wheelCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.drawWheel();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sections'] || changes['rotation'] || changes['size']) {
      if (isPlatformBrowser(this.platformId)) {
        this.drawWheel();
      }
    }
  }

  private drawWheel(): void {
    if (!this.canvasRef || !this.canvasRef.nativeElement) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = this.size / 2;
    const centerY = this.size / 2;
    const radius = this.size / 2 - 15;

    // Clear canvas (Keep transparent)
    ctx.clearRect(0, 0, this.size, this.size);

    const sectionCount = this.sections.length;
    if (sectionCount === 0) return;

    const anglePerSection = (2 * Math.PI) / sectionCount;

    this.sections.forEach((section, index) => {
      const startAngle = index * anglePerSection + (this.rotation * Math.PI / 180);
      const endAngle = startAngle + anglePerSection;

      // --- Draw Section Slice ---
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      // Gradient for each slice
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, section.color);
      gradient.addColorStop(1, this.shadeColor(section.color, -20));

      ctx.fillStyle = gradient;
      ctx.fill();

      // Border between sections
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // --- Draw Content (Text + Icon) ---
      ctx.save();
      const textAngle = startAngle + anglePerSection / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate(textAngle);

      // Icon
      if (section.icon) {
        ctx.font = `${this.size / 15}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'white';
        ctx.fillText(section.icon, radius * 0.4, 0);
      }

      // Text
      ctx.font = `bold ${this.size / 25}px 'Montserrat', sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'white';
      try {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
      } catch (e) {
        // Shadow not supported in SSR
      }
      ctx.fillText(section.text, radius * 0.85, 0);

      ctx.restore();
    });

    // --- Outter Ring ---
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 10;
    ctx.stroke();

    // --- Center Hub ---
    // Glow
    try {
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(255, 0, 85, 0.5)';
    } catch (e) {
      // Shadow not supported in SSR
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e0a1e';
    ctx.fill();
    ctx.strokeStyle = '#FF0055';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Hub detail
    try {
      ctx.shadowBlur = 0;
    } catch (e) {
      // Shadow not supported
    }
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#FF0055';
    ctx.fill();

    // --- Pointer ---
    ctx.save();
    ctx.translate(centerX, 15);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-12, -20);
    ctx.lineTo(12, -20);
    ctx.closePath();
    ctx.fillStyle = '#FF0055';
    try {
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#FF0055';
    } catch (e) {
      // Shadow not supported in SSR
    }
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // Helper to darken/lighten colors
  private shadeColor(color: string, percent: number): string {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = Math.floor(R * (100 + percent) / 100);
    G = Math.floor(G * (100 + percent) / 100);
    B = Math.floor(B * (100 + percent) / 100);

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    const RR = ((R.toString(16).length === 1) ? '0' + R.toString(16) : R.toString(16));
    const GG = ((G.toString(16).length === 1) ? '0' + G.toString(16) : G.toString(16));
    const BB = ((B.toString(16).length === 1) ? '0' + B.toString(16) : B.toString(16));

    return '#' + RR + GG + BB;
  }
}
