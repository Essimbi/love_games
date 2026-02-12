import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoveWheelService } from '../../services/love-wheel.service';
import { LoveWheelCanvasComponent } from '../canvas/canvas.component';

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A8E6CF'
];

const ICONS = ['❤️', '💕', '💖', '💗', '💝', '🎁', '🌹', '✨', '🎀', '💐'];

@Component({
  selector: 'app-love-wheel-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoveWheelCanvasComponent],
  template: `
    <div class="love-wheel-create">
      <div class="container">
        <h1>💕 Create Your Love Wheel</h1>
        
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <!-- Max Spins Per Day -->
          <div class="form-group">
            <label for="maxSpins">Max Spins Per Day</label>
            <input
              id="maxSpins"
              type="number"
              formControlName="maxSpinsPerDay"
              min="1"
              max="100"
              placeholder="e.g., 10"
            />
            <small>How many times can the wheel be spun per day?</small>
          </div>

          <!-- Sections -->
          <div class="sections-section">
            <h2>Wheel Sections (6-12)</h2>
            <div formArrayName="sections">
              <div *ngFor="let section of sections.controls; let i = index" class="section-card">
                <div class="section-header">
                  <h3>Section {{ i + 1 }}</h3>
                  <button
                    type="button"
                    (click)="removeSection(i)"
                    class="btn-remove"
                    *ngIf="sections.length > 6"
                  >
                    ✕
                  </button>
                </div>

                <div [formGroupName]="i">
                  <div class="form-row">
                    <div class="form-group">
                      <label>Text</label>
                      <input
                        type="text"
                        formControlName="text"
                        placeholder="e.g., Kiss"
                        maxlength="20"
                      />
                    </div>
                    <div class="form-group">
                      <label>Icon</label>
                      <select formControlName="icon">
                        <option value="">None</option>
                        <option *ngFor="let icon of ICONS" [value]="icon">
                          {{ icon }}
                        </option>
                      </select>
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Description</label>
                    <textarea
                      formControlName="description"
                      placeholder="What happens when this section is selected?"
                      rows="2"
                    ></textarea>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label>Color</label>
                      <div class="color-picker">
                        <input
                          type="color"
                          formControlName="color"
                          class="color-input"
                        />
                        <span class="color-value">{{ section.get('color')?.value }}</span>
                      </div>
                    </div>
                    <div class="form-group">
                      <label>Probability Weight</label>
                      <input
                        type="number"
                        formControlName="probabilityWeight"
                        min="1"
                        max="100"
                        placeholder="1-100"
                      />
                      <small>Higher = more likely to be selected</small>
                    </div>
                  </div>

                  <!-- Color Preview -->
                  <div class="color-preview" [style.backgroundColor]="section.get('color')?.value">
                    <span class="preview-text">{{ section.get('icon')?.value }} {{ section.get('text')?.value }}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              (click)="addSection()"
              class="btn btn-secondary"
              *ngIf="sections.length < 12"
            >
              + Add Section
            </button>
          </div>

          <!-- Wheel Preview -->
          <div class="preview-section">
            <h2>Preview</h2>
            <app-love-wheel-canvas
              [sections]="sections.value"
              [size]="250"
            ></app-love-wheel-canvas>
          </div>

          <!-- Submit -->
          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="!form.valid || isLoading"
            >
              {{ isLoading ? 'Creating...' : '🎉 Create Love Wheel' }}
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
    .love-wheel-create {
      min-height: 100vh;
      background: linear-gradient(135deg, #FF6B9D 0%, #C44569 100%);
      padding: 2rem 1rem;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    }

    h1 {
      color: #C44569;
      margin-bottom: 2rem;
      text-align: center;
    }

    h2 {
      color: #FF6B9D;
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
      border-color: #FF6B9D;
    }

    small {
      display: block;
      margin-top: 0.25rem;
      color: #999;
      font-size: 0.85rem;
    }

    .section-card {
      background: #f9f9f9;
      border: 2px solid #e0e0e0;
      border-radius: 0.75rem;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .section-header h3 {
      margin: 0;
      color: #FF6B9D;
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

    .color-picker {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .color-input {
      width: 60px;
      height: 40px;
      padding: 2px;
      cursor: pointer;
    }

    .color-value {
      font-family: monospace;
      color: #666;
      font-size: 0.9rem;
    }

    .color-preview {
      width: 100%;
      height: 60px;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 1.1rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      margin-top: 1rem;
    }

    .preview-text {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .preview-section {
      background: #f9f9f9;
      border: 2px solid #e0e0e0;
      border-radius: 0.75rem;
      padding: 2rem;
      text-align: center;
      margin: 2rem 0;
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
      background: linear-gradient(135deg, #FF6B9D 0%, #C44569 100%);
      color: white;
      width: 100%;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(255, 107, 157, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #FF6B9D;
      color: white;
      margin-top: 1rem;
    }

    .btn-secondary:hover {
      background: #E85A8C;
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
export class LoveWheelCreateComponent implements OnInit {
  form!: FormGroup;
  isLoading = false;
  error = '';
  ICONS = ICONS;

  constructor(
    private fb: FormBuilder,
    private loveWheelService: LoveWheelService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      maxSpinsPerDay: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
      sections: this.fb.array([
        this.createSection(0),
        this.createSection(1),
        this.createSection(2),
        this.createSection(3),
        this.createSection(4),
        this.createSection(5)
      ])
    });
  }

  private createSection(index: number): FormGroup {
    return this.fb.group({
      sectionNumber: [index + 1],
      text: ['', Validators.required],
      description: [''],
      color: [COLORS[index % COLORS.length], Validators.required],
      icon: [ICONS[index % ICONS.length]],
      probabilityWeight: [1, [Validators.required, Validators.min(1), Validators.max(100)]]
    });
  }

  get sections(): FormArray {
    return this.form.get('sections') as FormArray;
  }

  addSection(): void {
    this.sections.push(this.createSection(this.sections.length));
  }

  removeSection(index: number): void {
    this.sections.removeAt(index);
  }

  onSubmit(): void {
    if (!this.form.valid) return;

    this.isLoading = true;
    this.error = '';

    const formValue = this.form.value;
    const request = {
      maxSpinsPerDay: formValue.maxSpinsPerDay,
      sections: formValue.sections.map((section: any, index: number) => ({
        ...section,
        sectionNumber: index + 1
      }))
    };

    this.loveWheelService.createWheel(request).subscribe({
      next: (response) => {
        this.router.navigate(['/love-wheel', response.id]);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create love wheel';
        this.isLoading = false;
      }
    });
  }
}
