import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="error-page">
      <div class="error-container">
        <div class="error-icon">{{ icon }}</div>
        <h1 class="error-code">{{ code }}</h1>
        <h2 class="error-title">{{ title }}</h2>
        <p class="error-message">{{ message }}</p>
        <a routerLink="/" class="btn btn-primary">
          💕 Back to Home
        </a>
      </div>
    </div>
  `,
  styles: [`
    .error-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem 1rem;
    }

    .error-container {
      background: white;
      border-radius: 1rem;
      padding: 3rem 2rem;
      text-align: center;
      max-width: 500px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    }

    .error-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .error-code {
      font-size: 3rem;
      color: #764ba2;
      margin: 0 0 0.5rem;
      font-weight: 700;
    }

    .error-title {
      font-size: 1.5rem;
      color: #333;
      margin: 0 0 1rem;
    }

    .error-message {
      color: #666;
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
    }

    @media (max-width: 600px) {
      .error-container {
        padding: 2rem 1rem;
      }

      .error-icon {
        font-size: 3rem;
      }

      .error-code {
        font-size: 2rem;
      }

      .error-title {
        font-size: 1.2rem;
      }
    }
  `]
})
export class ErrorPageComponent {
  @Input() code = '404';
  @Input() title = 'Page Not Found';
  @Input() message = 'The page you are looking for does not exist.';
  @Input() icon = '😕';
}
