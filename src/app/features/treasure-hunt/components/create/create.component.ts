import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TreasureHuntService } from '../../services/treasure-hunt.service';

@Component({
  selector: 'app-treasure-hunt-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="treasure-hunt-create">
      <div class="container">
        <h1>🗺️ Create Your Treasure Hunt</h1>
        
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <!-- Final Message -->
          <div class="form-group">
            <label for="finalMessage">Final Message</label>
            <textarea
              id="finalMessage"
              formControlName="finalMessage"
              placeholder="What message will they see when they complete the hunt?"
              rows="3"
            ></textarea>
            <small>The message shown when all steps are completed</small>
          </div>

          <!-- GPS Coordinates (Optional) -->
          <div class="form-row">
            <div class="form-group">
              <label for="finalGpsLat">Final GPS Latitude (Optional)</label>
              <input
                id="finalGpsLat"
                type="number"
                formControlName="finalGpsLat"
                placeholder="e.g., 48.8566"
                step="0.0001"
              />
            </div>
            <div class="form-group">
              <label for="finalGpsLng">Final GPS Longitude (Optional)</label>
              <input
                id="finalGpsLng"
                type="number"
                formControlName="finalGpsLng"
                placeholder="e.g., 2.3522"
                step="0.0001"
              />
            </div>
          </div>

          <!-- Steps -->
          <div class="steps-section">
            <h2>Steps</h2>
            <div formArrayName="steps">
              <div *ngFor="let step of steps.controls; let i = index" class="step-card">
                <div class="step-header">
                  <h3>Step {{ i + 1 }}</h3>
                  <button
                    type="button"
                    (click)="removeStep(i)"
                    class="btn-remove"
                    *ngIf="steps.length > 3"
                  >
                    ✕
                  </button>
                </div>

                <div [formGroupName]="i">
                  <div class="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      formControlName="title"
                      placeholder="Step title"
                    />
                  </div>

                  <div class="form-group">
                    <label>Description</label>
                    <textarea
                      formControlName="description"
                      placeholder="Describe the riddle or clue"
                      rows="2"
                    ></textarea>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label>Hint 1</label>
                      <input
                        type="text"
                        formControlName="hint1"
                        placeholder="First hint (optional)"
                      />
                    </div>
                    <div class="form-group">
                      <label>Hint 2</label>
                      <input
                        type="text"
                        formControlName="hint2"
                        placeholder="Second hint (optional)"
                      />
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label>Answer Type</label>
                      <select formControlName="answerType">
                        <option value="text">Text</option>
                        <option value="mcq">Multiple Choice</option>
                        <option value="number">Number</option>
                        <option value="gps">GPS Coordinates</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label>Correct Answer</label>
                      <input
                        type="text"
                        formControlName="correctAnswer"
                        placeholder="The correct answer"
                      />
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Success Message</label>
                    <input
                      type="text"
                      formControlName="successMessage"
                      placeholder="Message when answer is correct"
                    />
                  </div>

                  <div class="form-group">
                    <label>Error Message</label>
                    <input
                      type="text"
                      formControlName="errorMessage"
                      placeholder="Message when answer is wrong"
                    />
                  </div>

                  <div class="form-group">
                    <label>Image URL (Optional)</label>
                    <input
                      type="url"
                      formControlName="imageUrl"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              (click)="addStep()"
              class="btn btn-secondary"
              *ngIf="steps.length < 10"
            >
              + Add Step
            </button>
          </div>

          <!-- Submit -->
          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="!form.valid || isLoading"
            >
              {{ isLoading ? 'Creating...' : '🎉 Create Treasure Hunt' }}
            </button>
          </div>
        </form>

        <div *ngIf="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .treasure-hunt-create {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem 1rem;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    }

    h1 {
      color: #764ba2;
      margin-bottom: 2rem;
      text-align: center;
    }

    h2 {
      color: #667eea;
      margin: 2rem 0 1rem;
      font-size: 1.3rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #333;
      font-weight: 500;
    }

    input, textarea, select {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 0.5rem;
      font-size: 1rem;
      font-family: inherit;
      transition: border-color 0.3s;
    }

    input:focus, textarea:focus, select:focus {
      outline: none;
      border-color: #667eea;
    }

    small {
      display: block;
      margin-top: 0.25rem;
      color: #999;
      font-size: 0.85rem;
    }

    .step-card {
      background: #f9f9f9;
      border: 2px solid #e0e0e0;
      border-radius: 0.75rem;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .step-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .step-header h3 {
      margin: 0;
      color: #667eea;
    }

    .btn-remove {
      background: #ff6b6b;
      color: white;
      border: none;
      border-radius: 50%;
      width: 2rem;
      height: 2rem;
      cursor: pointer;
      font-size: 1.2rem;
      transition: background 0.3s;
    }

    .btn-remove:hover {
      background: #ff5252;
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
      margin-top: 1rem;
    }

    .btn-secondary:hover {
      background: #5568d3;
    }

    .form-actions {
      margin-top: 2rem;
    }

    .error-message {
      background: #ffebee;
      color: #c62828;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-top: 1rem;
    }

    @media (max-width: 600px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .container {
        padding: 1rem;
      }
    }
  `]
})
export class TreasureHuntCreateComponent implements OnInit {
  form!: FormGroup;
  isLoading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private treasureHuntService: TreasureHuntService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      finalMessage: ['', [Validators.required, Validators.minLength(10)]],
      finalGpsLat: [null],
      finalGpsLng: [null],
      steps: this.fb.array([
        this.createStep(),
        this.createStep(),
        this.createStep()
      ])
    });
  }

  private createStep(): FormGroup {
    return this.fb.group({
      stepNumber: [this.steps.length + 1],
      title: ['', Validators.required],
      description: ['', Validators.required],
      hint1: [''],
      hint2: [''],
      answerType: ['text', Validators.required],
      correctAnswer: ['', Validators.required],
      successMessage: ['Great! You found the next clue!'],
      errorMessage: ['Not quite right. Try again!'],
      imageUrl: ['']
    });
  }

  get steps(): FormArray {
    return this.form.get('steps') as FormArray;
  }

  addStep(): void {
    this.steps.push(this.createStep());
  }

  removeStep(index: number): void {
    this.steps.removeAt(index);
  }

  onSubmit(): void {
    if (!this.form.valid) return;

    this.isLoading = true;
    this.error = '';

    const formValue = this.form.value;
    const request = {
      finalMessage: formValue.finalMessage,
      finalGpsLat: formValue.finalGpsLat ? parseFloat(formValue.finalGpsLat) : undefined,
      finalGpsLng: formValue.finalGpsLng ? parseFloat(formValue.finalGpsLng) : undefined,
      steps: formValue.steps.map((step: any, index: number) => ({
        ...step,
        stepNumber: index + 1
      }))
    };

    this.treasureHuntService.createHunt(request).subscribe({
      next: (response) => {
        this.router.navigate(['/treasure-hunt', response.id]);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create treasure hunt';
        this.isLoading = false;
      }
    });
  }
}
