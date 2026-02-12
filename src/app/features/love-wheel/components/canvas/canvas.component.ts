import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

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
    }

    .wheel-canvas {
      max-width: 100%;
      height: auto;
      filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
    }
  `]
})
export class LoveWheelCanvasComponent implements AfterViewInit, OnChanges {
  @Input() sections: WheelSection[] = [];
  @Input() size = 300;
  @Input() rotation = 0;

  @ViewChild('wheelCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    this.drawWheel();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sections'] || changes['rotation']) {
      setTimeout(() => this.drawWheel(), 0);
    }
  }

  private drawWheel(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = this.size / 2;
    const centerY = this.size / 2;
    const radius = this.size / 2 - 10;

    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, this.size, this.size);

    // Draw sections
    const sectionCount = this.sections.length;
    const anglePerSection = (2 * Math.PI) / sectionCount;

    this.sections.forEach((section, index) => {
      const startAngle = index * anglePerSection + (this.rotation * Math.PI / 180);
      const endAngle = startAngle + anglePerSection;

      // Draw section
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = section.color;
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw text
      const textAngle = startAngle + anglePerSection / 2;
      const textX = centerX + Math.cos(textAngle) * (radius * 0.65);
      const textY = centerY + Math.sin(textAngle) * (radius * 0.65);

      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(textAngle + Math.PI / 2);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 3;
      ctx.fillText(section.text, 0, 0);
      ctx.restore();

      // Draw icon if present
      if (section.icon) {
        const iconX = centerX + Math.cos(textAngle) * (radius * 0.35);
        const iconY = centerY + Math.sin(textAngle) * (radius * 0.35);
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(section.icon, iconX, iconY);
      }
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
    ctx.fillStyle = '#FF6B9D';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw pointer
    ctx.beginPath();
    ctx.moveTo(centerX, 10);
    ctx.lineTo(centerX - 8, 25);
    ctx.lineTo(centerX + 8, 25);
    ctx.closePath();
    ctx.fillStyle = '#FF6B9D';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
