import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-container" [class.fullscreen]="fullscreen">
      <div class="spinner"></div>
      <p *ngIf="message" class="message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1rem;
    }

    .spinner-container.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.95);
      z-index: 1000;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #e0e0e0;
      border-top-color: #FF6B9D;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .message {
      margin-top: 1rem;
      color: #666;
      font-size: 1rem;
      text-align: center;
    }

    @media (max-width: 600px) {
      .spinner-container {
        padding: 2rem 1rem;
      }

      .spinner {
        width: 40px;
        height: 40px;
        border-width: 3px;
      }

      .message {
        font-size: 0.9rem;
      }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() message = '';
  @Input() fullscreen = false;
}
