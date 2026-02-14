import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TreasureHuntService, Position3D } from '../../services/treasure-hunt.service';
import { ThreeSceneComponent, Marker } from '../three-scene/three-scene.component';
import { encrypt } from '../../../../shared/utils/encryption.utils';
import { LucideAngularModule } from 'lucide-angular';
import * as THREE from 'three';

@Component({
  selector: 'app-treasure-hunt-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ThreeSceneComponent, LucideAngularModule],
  template: `
    <div class="hunt-create-container">
      <div class="glass-card">
        <header class="create-header">
          <div class="icon-badge">
            <lucide-icon [name]="'sparkles'" class="neon-pink"></lucide-icon>
          </div>
          <h1>Midnight Hunt Creator</h1>
          <p class="subtitle">Craft an enchanted 3D journey for your love</p>
        </header>

        <div class="wizard-steps">
          <div class="wizard-step" [class.active]="currentStep === 1">
            <span class="step-num">1</span>
            <span class="step-label">The Vault</span>
          </div>
          <div class="line"></div>
          <div class="wizard-step" [class.active]="currentStep === 2">
            <span class="step-num">2</span>
            <span class="step-label">3D World</span>
          </div>
          <div class="line"></div>
          <div class="wizard-step" [class.active]="currentStep === 3">
            <span class="step-num">3</span>
            <span class="step-label">The Path</span>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <!-- Step 1: Final Message & Map -->
          <div *ngIf="currentStep === 1" class="step-content fade-in">
            <section class="form-section">
              <h3><lucide-icon [name]="'lock'" class="inline-icon"></lucide-icon> The Secret Vault</h3>
              <p class="section-desc">The message hidden at the end of the journey.</p>
              
              <div class="form-group">
                <label>Final Message (Encrypted)</label>
                <textarea
                  formControlName="finalMessage"
                  placeholder="The message revealed at the end..."
                  rows="4"
                  class="midnight-input"
                ></textarea>
                <div class="input-glow"></div>
              </div>
            </section>

            <section class="form-section">
              <h3><lucide-icon [name]="'map'" class="inline-icon"></lucide-icon> Select Your World</h3>
              <div class="map-grid">
                <div 
                  class="map-card" 
                  [class.selected]="form.get('mapId')?.value === 'midnight-city'"
                  (click)="form.patchValue({mapId: 'midnight-city'})"
                >
                  <div class="map-preview neon-pink-border"></div>
                  <span>Midnight City</span>
                </div>
                <div 
                  class="map-card" 
                  [class.selected]="form.get('mapId')?.value === 'crystal-garden'"
                  (click)="form.patchValue({mapId: 'crystal-garden'})"
                >
                  <div class="map-preview neon-blue-border"></div>
                  <span>Crystal Garden</span>
                </div>
              </div>
            </section>
          </div>

          <!-- Step 2: 3D Placement -->
          <div *ngIf="currentStep === 2" class="step-content fade-in">
            <section class="form-section">
              <h3><lucide-icon [name]="'compass'" class="inline-icon"></lucide-icon> 3D Placement</h3>
              <p class="section-desc">Click on the map to set the Treasure and Clue positions.</p>
              
              <div class="three-wrapper">
                <app-three-scene 
                  [mapId]="form.get('mapId')?.value"
                  (markerAdded)="onPointAdded($event)"
                ></app-three-scene>
                <div class="three-legend">
                  <span class="legend-item"><span class="dot treasure"></span> Treasure</span>
                  <span class="legend-item"><span class="dot clue"></span> Clue</span>
                </div>
              </div>

              <div class="placement-status">
                <p *ngIf="!hasTreasure" class="warning">⚠️ Place the Treasure first (Golden Dot)</p>
                <p *ngIf="hasTreasure">✅ Treasure placed. Now place {{3 - steps.length}} more clues.</p>
              </div>
            </section>
          </div>

          <!-- Step 3: Riddles -->
          <div *ngIf="currentStep === 3" class="step-content fade-in">
             <div formArrayName="steps">
              <div *ngFor="let step of steps.controls; let i = index" class="clue-card glass-card">
                <div class="clue-header">
                  <h4>Clue #{{ i + 1 }}</h4>
                  <button type="button" (click)="removeStep(i)" class="btn-icon delete">
                    <lucide-icon [name]="'trash2'"></lucide-icon>
                  </button>
                </div>

                <div [formGroupName]="i">
                  <div class="form-group">
                    <label>Riddle Title</label>
                    <input type="text" formControlName="title" placeholder="e.g., Where we first met" class="midnight-input">
                  </div>
                  <div class="form-group">
                    <label>The Riddle</label>
                    <textarea formControlName="description" rows="2" class="midnight-input" placeholder="Enter your riddle here..."></textarea>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label>Correct Answer</label>
                      <input type="text" formControlName="correctAnswer" class="midnight-input">
                    </div>
                    <div class="form-group">
                      <label>Type</label>
                      <select formControlName="answerType" class="midnight-input">
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="mcq">Choice</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="wizard-actions">
            <button 
              type="button" 
              class="btn-outline" 
              (click)="prevStep()" 
              *ngIf="currentStep > 1"
            >
              <lucide-icon [name]="'chevron-left'"></lucide-icon> Back
            </button>
            
            <button 
              type="button" 
              class="btn-primary" 
              (click)="nextStep()" 
              *ngIf="currentStep < 3"
              [disabled]="currentStep === 2 && (!hasTreasure || steps.length < 3)"
            >
              Next <lucide-icon [name]="'chevron-right'"></lucide-icon>
            </button>

            <button 
              type="submit" 
              class="btn-primary glow-btn" 
              *ngIf="currentStep === 3"
              [disabled]="!form.valid || isLoading"
            >
              <span *ngIf="!isLoading">Summon the Hunt ✨</span>
              <span *ngIf="isLoading">Casting Spell...</span>
            </button>
          </div>
        </form>

        <div *ngIf="error" class="error-msg">
          {{ error }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hunt-create-container {
      min-height: 100vh;
      padding: 4rem 1rem;
      background: radial-gradient(circle at top right, #1a0a1e, #0a050a);
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }

    .glass-card {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 2.5rem;
      width: 100%;
      max-width: 700px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    }

    .create-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .icon-badge {
      width: 60px;
      height: 60px;
      background: rgba(255, 0, 85, 0.1);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      border: 1px solid rgba(255, 0, 85, 0.3);
    }

    h1 {
      font-size: 2.5rem;
      background: linear-gradient(to right, #fff, #FF0055);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: rgba(255, 255, 255, 0.5);
      font-size: 1.1rem;
    }

    .wizard-steps {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 3rem;
      padding: 0 1rem;
    }

    .wizard-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      color: rgba(255, 255, 255, 0.3);
      transition: all 0.3s;
    }

    .wizard-step.active {
      color: #FF0055;
    }

    .step-num {
      width: 32px;
      height: 32px;
      border: 2px solid currentColor;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }

    .line {
      flex: 1;
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
      margin: 0 1rem;
      margin-top: -1.5rem;
    }

    .form-section {
      margin-bottom: 2.5rem;
    }

    .form-section h3 {
      font-size: 1.3rem;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .inline-icon {
      width: 20px;
      height: 20px;
      color: #FF0055;
    }

    .section-desc {
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 1.5rem;
    }

    .midnight-input {
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1rem;
      color: #fff;
      font-family: inherit;
      transition: all 0.3s;
    }

    .midnight-input:focus {
      outline: none;
      border-color: #FF0055;
      background: rgba(255, 0, 85, 0.05);
      box-shadow: 0 0 15px rgba(255, 0, 85, 0.2);
    }

    .map-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .map-card {
      cursor: pointer;
      text-align: center;
      transition: all 0.3s;
    }

    .map-preview {
      aspect-ratio: 16/9;
      background: #111;
      border-radius: 12px;
      margin-bottom: 0.75rem;
      border: 2px solid transparent;
    }

    .map-card.selected .map-preview {
      border-color: #FF0055;
      box-shadow: 0 0 20px rgba(255, 0, 85, 0.3);
    }

    .three-wrapper {
      margin-bottom: 1.5rem;
    }

    .three-legend {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
      margin-top: 1rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: rgba(255, 255, 255, 0.7);
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .dot.treasure { background: #ffd700; box-shadow: 0 0 10px #ffd700; }
    .dot.clue { background: #00ffcc; box-shadow: 0 0 10px #00ffcc; }

    .wizard-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 3rem;
    }

    .btn-primary {
      background: #FF0055;
      color: white;
      border: none;
      padding: 0.8rem 2rem;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(255, 0, 85, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-outline {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      padding: 0.8rem 2rem;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s;
    }

    .btn-outline:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: #fff;
    }

    .glow-btn {
      background: linear-gradient(135deg, #FF0055, #764ba2);
      box-shadow: 0 0 20px rgba(255, 0, 85, 0.3);
    }

    .fade-in {
      animation: fadeIn 0.5s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class TreasureHuntCreateComponent implements OnInit {
  form!: FormGroup;
  currentStep = 1;
  isLoading = false;
  error = '';
  hasTreasure = false;

  @ViewChild(ThreeSceneComponent) threeScene!: ThreeSceneComponent;

  constructor(
    private fb: FormBuilder,
    private treasureHuntService: TreasureHuntService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      mapId: ['midnight-city', Validators.required],
      finalMessage: ['', [Validators.required, Validators.minLength(5)]],
      treasurePosition: [null, Validators.required],
      steps: this.fb.array([])
    });
  }

  get steps(): FormArray {
    return this.form.get('steps') as FormArray;
  }

  onPointAdded(point: THREE.Vector3): void {
    const pos: Position3D = { x: point.x, y: point.y, z: point.z };

    if (!this.hasTreasure) {
      this.form.patchValue({ treasurePosition: pos });
      this.hasTreasure = true;
      // After treasure, add the first level of steps
    } else if (this.steps.length < 5) {
      this.addStep(pos);
    }
  }

  addStep(position: Position3D): void {
    const stepGroup = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      correctAnswer: ['', Validators.required],
      answerType: ['text', Validators.required],
      position: [position, Validators.required]
    });
    this.steps.push(stepGroup);
  }

  removeStep(index: number): void {
    this.steps.removeAt(index);
    this.updateThreeMarkers();
  }

  private updateThreeMarkers(): void {
    const markers: Marker[] = [];
    const tPos = this.form.get('treasurePosition')?.value;
    if (tPos) {
      markers.push({ id: 'treasure', type: 'treasure', position: new THREE.Vector3(tPos.x, tPos.y, tPos.z) });
    }

    this.steps.controls.forEach((s, i) => {
      const p = s.get('position')?.value;
      markers.push({ id: `clue-${i}`, type: 'clue', position: new THREE.Vector3(p.x, p.y, p.z), number: i + 1 });
    });

    this.threeScene.setMarkers(markers);
  }

  nextStep(): void {
    this.currentStep++;
    if (this.currentStep === 2) {
      setTimeout(() => this.updateThreeMarkers(), 0);
    }
  }

  prevStep(): void {
    this.currentStep--;
  }

  async onSubmit(): Promise<void> {
    if (!this.form.valid) return;

    this.isLoading = true;
    this.error = '';

    try {
      const formValue = this.form.value;

      // Encrypt the final message and correct answers
      const encryptedFinalMsg = await encrypt(formValue.finalMessage);

      const request = {
        mapId: formValue.mapId,
        finalMessage: encryptedFinalMsg,
        treasurePosition: formValue.treasurePosition,
        steps: await Promise.all(formValue.steps.map(async (step: any, index: number) => ({
          ...step,
          stepNumber: index + 1,
          correctAnswer: await encrypt(step.correctAnswer)
        })))
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
    } catch (e) {
      this.error = 'Encryption failed. Please try again.';
      this.isLoading = false;
    }
  }
}
