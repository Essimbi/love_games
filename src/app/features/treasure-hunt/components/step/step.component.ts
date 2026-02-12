import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TreasureStep {
  stepNumber: number;
  title: string;
  description: string;
  hint1?: string;
  hint2?: string;
  answerType: 'text' | 'mcq' | 'number' | 'gps';
  correctAnswer: string;
  successMessage?: string;
  errorMessage?: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-treasure-step',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="step-container">
      <!-- Step Header -->
      <div class="step-header">
        <h2>{{ step.title }}</h2>
        <p class="step-number">Step {{ step.stepNumber }}</p>
      </div>

      <!-- Step Image -->
      <img
        *ngIf="step.imageUrl"
        [src]="step.imageUrl"
        alt="Step image"
        class="step-image"
      />

      <!-- Step Description -->
      <p class="step-description">{{ step.description }}</p>

      <!-- Answer Input Based on Type -->
      <div class="answer-input">
        <!-- Text Input -->
        <div *ngIf="step.answerType === 'text'" class="input-group">
          <input
            type="text"
            [(ngModel)]="userAnswer"
            (keyup.enter)="submitAnswer()"
            placeholder="Enter your answer..."
            class="text-input"
          />
        </div>

        <!-- Number Input -->
        <div *ngIf="step.answerType === 'number'" class="input-group">
          <input
            type="number"
            [(ngModel)]="userAnswer"
            (keyup.enter)="submitAnswer()"
            placeholder="Enter a number..."
            class="number-input"
          />
        </div>

        <!-- Multiple Choice -->
        <div *ngIf="step.answerType === 'mcq'" class="mcq-group">
          <div
            *ngFor="let option of mcqOptions"
            class="mcq-option"
            [class.selected]="userAnswer === option"
            (click)="selectOption(option)"
          >
            {{ option }}
          </div>
        </div>

        <!-- GPS Coordinates -->
        <div *ngIf="step.answerType === 'gps'" class="gps-group">
          <div class="gps-input">
            <input
              type="number"
              [(ngModel)]="gpsLat"
              placeholder="Latitude"
              step="0.0001"
              class="gps-field"
            />
            <input
              type="number"
              [(ngModel)]="gpsLng"
              placeholder="Longitude"
              step="0.0001"
              class="gps-field"
            />
          </div>
          <button
            type="button"
            (click)="useCurrentLocation()"
            class="btn-location"
          >
            📍 Use Current Location
          </button>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        type="button"
        (click)="submitAnswer()"
        class="btn btn-submit"
        [disabled]="!isAnswerValid()"
      >
        ✓ Submit Answer
      </button>

      <!-- Feedback -->
      <div *ngIf="feedback" [class]="'feedback ' + feedbackType">
        {{ feedback }}
      </div>
    </div>
  `,
  styles: [`
    .step-container {
      padding: 2rem;
      background: white;
      border-radius: 1rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .step-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .step-header h2 {
      color: #764ba2;
      margin: 0 0 0.5rem;
      font-size: 1.8rem;
    }

    .step-number {
      color: #999;
      font-size: 0.9rem;
      margin: 0;
    }

    .step-image {
      width: 100%;
      max-height: 300px;
      object-fit: cover;
      border-radius: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .step-description {
      color: #333;
      font-size: 1.05rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .answer-input {
      margin-bottom: 2rem;
    }

    .input-group {
      display: flex;
      gap: 1rem;
    }

    .text-input,
    .number-input {
      flex: 1;
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 0.5rem;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    .text-input:focus,
    .number-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .mcq-group {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .mcq-option {
      padding: 1rem;
      background: #f0f0f0;
      border: 2px solid #e0e0e0;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.3s;
      text-align: center;
      font-weight: 500;
    }

    .mcq-option:hover {
      background: #e8e8e8;
      border-color: #667eea;
    }

    .mcq-option.selected {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .gps-group {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .gps-input {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .gps-field {
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 0.5rem;
      font-size: 1rem;
    }

    .gps-field:focus {
      outline: none;
      border-color: #667eea;
    }

    .btn-location {
      padding: 0.75rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s;
    }

    .btn-location:hover {
      background: #5568d3;
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

    .btn-submit {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      width: 100%;
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
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

    @media (max-width: 600px) {
      .step-container {
        padding: 1rem;
      }

      .step-header h2 {
        font-size: 1.3rem;
      }

      .mcq-group {
        grid-template-columns: 1fr;
      }

      .gps-input {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TreasureStepComponent {
  @Input() step!: TreasureStep;
  @Output() answerSubmitted = new EventEmitter<string>();

  userAnswer = '';
  gpsLat = '';
  gpsLng = '';
  feedback = '';
  feedbackType = '';
  mcqOptions: string[] = [];

  ngOnInit(): void {
    // Parse MCQ options if needed
    if (this.step.answerType === 'mcq') {
      // Assume options are comma-separated in correctAnswer
      this.mcqOptions = (this.step.correctAnswer || '').split(',').map((o: string) => o.trim());
    }
  }

  isAnswerValid(): boolean {
    if (this.step.answerType === 'gps') {
      return this.gpsLat !== '' && this.gpsLng !== '';
    }
    return this.userAnswer.trim() !== '';
  }

  selectOption(option: string): void {
    this.userAnswer = option;
  }

  useCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.gpsLat = position.coords.latitude.toString();
          this.gpsLng = position.coords.longitude.toString();
        },
        (error) => {
          this.feedback = 'Unable to get your location. Please enter manually.';
          this.feedbackType = 'error';
        }
      );
    } else {
      this.feedback = 'Geolocation is not supported by your browser.';
      this.feedbackType = 'error';
    }
  }

  submitAnswer(): void {
    if (!this.isAnswerValid()) return;

    let answer = this.userAnswer;
    if (this.step.answerType === 'gps') {
      answer = `${this.gpsLat},${this.gpsLng}`;
    }

    this.answerSubmitted.emit(answer);
  }
}
