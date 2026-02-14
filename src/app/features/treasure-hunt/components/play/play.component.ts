import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TreasureHuntService, TreasureHuntResponse, TreasureStep, Position3D } from '../../services/treasure-hunt.service';
import { ThreeSceneComponent, Marker } from '../three-scene/three-scene.component';
import { decrypt } from '../../../../shared/utils/encryption.utils';
import { LucideAngularModule } from 'lucide-angular';
import * as THREE from 'three';

@Component({
  selector: 'app-treasure-hunt-play',
  standalone: true,
  imports: [CommonModule, FormsModule, ThreeSceneComponent, LucideAngularModule],
  template: `
    <div class="hunt-play-container">
      <!-- 3D Environment (Full Screen) -->
      <div class="three-background">
        <app-three-scene 
          [mode]="'play'" 
          [mapId]="hunt?.mapId || 'midnight-city'"
        ></app-three-scene>
      </div>

      <!-- Hud / UI Overlay -->
      <div class="hud-overlay" *ngIf="hunt && !isLoading">
        
        <!-- Progress Header -->
        <header class="play-header glass-hud">
          <div class="step-counter">
            <lucide-icon [name]="'sparkles'" class="neon-pink"></lucide-icon>
            <span>Clue {{ currentStep }} / {{ hunt.steps.length }}</span>
          </div>
          <div class="progress-track">
            <div class="track-fill" [style.width.%]="progressPercent"></div>
          </div>
        </header>

        <!-- Current Clue Card -->
        <main class="clue-area" *ngIf="!isCompleted">
          <div class="clue-card glass-card fade-in" *ngIf="!showSuccess">
            <h2 class="title">{{ currentStepData?.title }}</h2>
            <p class="riddle">{{ currentStepData?.description }}</p>

            <div class="input-group">
              <input 
                type="text" 
                [(ngModel)]="userAnswer" 
                (keyup.enter)="submitAnswer()"
                placeholder="Reveal the path..."
                class="midnight-input"
                [disabled]="isSubmitting"
              />
              <button 
                class="btn-reveal" 
                (click)="submitAnswer()"
                [disabled]="!userAnswer || isSubmitting"
              >
                <lucide-icon [name]="'lock'" *ngIf="!isSubmitting"></lucide-icon>
                <span *ngIf="isSubmitting" class="loader-small"></span>
              </button>
            </div>

            <p class="error-msg" *ngIf="feedback && feedbackType === 'error'">
              {{ feedback }}
            </p>
          </div>

          <!-- Success Animation Area -->
          <div class="success-reveal glass-card fade-in" *ngIf="showSuccess">
             <lucide-icon [name]="'sparkles'" class="success-icon"></lucide-icon>
             <h3>Path Unlocked!</h3>
             <p>The stars are shifting...</p>
          </div>
        </main>

        <!-- Final Secret Disclosure -->
        <div class="final-card glass-card fade-in" *ngIf="isCompleted">
          <div class="vault-icon">
            <lucide-icon [name]="'lock'"></lucide-icon>
          </div>
          <h2>The Secret Vault</h2>
          <div class="decrypted-message">
            {{ decryptedFinalMessage }}
          </div>
          <button class="btn-home" (click)="goHome()">
            Close Vault
          </button>
        </div>

      </div>

      <!-- Loading / Error States -->
      <div class="overlay-full" *ngIf="isLoading || error">
        <div class="glass-card text-center">
          <div *ngIf="isLoading" class="loader"></div>
          <p *ngIf="isLoading">Opening the Portal...</p>
          <div *ngIf="error" class="error-content">
             <p>⚠️ {{ error }}</p>
             <button class="btn-home" (click)="goHome()">Return Home</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hunt-play-container {
      position: relative;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: #000;
      color: #fff;
    }

    .three-background {
      position: absolute;
      inset: 0;
      z-index: 1;
    }

    .hud-overlay {
      position: absolute;
      inset: 0;
      z-index: 2;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      padding: 2rem;
    }

    .hud-overlay > * {
      pointer-events: auto;
    }

    .glass-hud {
      background: rgba(15, 5, 15, 0.7);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 1rem 2rem;
    }

    .play-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
      max-width: 600px;
      margin: 0 auto;
      width: 100%;
    }

    .step-counter {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .progress-track {
      flex: 1;
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      overflow: hidden;
    }

    .track-fill {
      height: 100%;
      background: #FF0055;
      box-shadow: 0 0 10px #FF0055;
      transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .clue-area {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .glass-card {
      background: rgba(15, 5, 15, 0.8);
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 2.5rem;
      width: 100%;
      max-width: 450px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
      text-align: center;
    }

    .title {
      font-size: 1.5rem;
      color: #FF0055;
      margin-bottom: 1rem;
    }

    .riddle {
      font-size: 1.1rem;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .input-group {
      display: flex;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 14px;
      padding: 0.5rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .midnight-input {
      flex: 1;
      background: transparent;
      border: none;
      padding: 0.75rem;
      color: #fff;
      font-family: inherit;
      font-size: 1rem;
    }

    .midnight-input:focus { outline: none; }

    .btn-reveal {
      background: #FF0055;
      border: none;
      width: 44px;
      height: 44px;
      border-radius: 10px;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
    }

    .btn-reveal:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 0 15px rgba(255, 0, 85, 0.4);
    }

    .success-reveal {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .success-icon {
      width: 60px;
      height: 60px;
      color: #00ffcc;
      filter: drop-shadow(0 0 10px #00ffcc);
      animation: pulse 2s infinite;
    }

    .decrypted-message {
      background: rgba(255, 0, 85, 0.05);
      border: 1px dashed rgba(255, 0, 85, 0.3);
      padding: 2rem;
      border-radius: 16px;
      margin: 1.5rem 0;
      font-size: 1.2rem;
      line-height: 1.6;
      word-break: break-word;
    }

    .vault-icon {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      color: #ffd700;
      border: 2px solid #ffd700;
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
    }

    .btn-home {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      padding: 0.8rem 2rem;
      border-radius: 12px;
      cursor: pointer;
      margin-top: 1rem;
    }

    .overlay-full {
      position: absolute;
      inset: 0;
      z-index: 10;
      background: #0a050a;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loader {
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-left-color: #FF0055;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .fade-in { animation: fadeIn 0.6s ease-out; }
  `]
})
export class TreasureHuntPlayComponent implements OnInit {
  hunt: TreasureHuntResponse | null = null;
  currentStep = 1;
  userAnswer = '';
  isLoading = true;
  isSubmitting = false;
  showSuccess = false;
  error = '';
  feedback = '';
  feedbackType = '';
  isCompleted = false;
  decryptedFinalMessage = '';

  @ViewChild(ThreeSceneComponent) threeScene!: ThreeSceneComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private treasureHuntService: TreasureHuntService
  ) { }

  ngOnInit(): void {
    this.loadHunt();
  }

  private loadHunt(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Invalid treasure hunt ID';
      this.isLoading = false;
      return;
    }

    this.treasureHuntService.getHunt(id).subscribe({
      next: (hunt) => {
        this.hunt = hunt;
        this.isLoading = false;
        setTimeout(() => this.updateThreeMarkers(), 0);
      },
      error: (err) => {
        this.error = 'Failed to load hunt. It may have expired.';
        this.isLoading = false;
      }
    });
  }

  get currentStepData(): TreasureStep | undefined {
    return this.hunt?.steps[this.currentStep - 1];
  }

  get progressPercent(): number {
    return this.hunt ? (this.currentStep / (this.hunt.steps.length + 1)) * 100 : 0;
  }

  async submitAnswer(): Promise<void> {
    if (!this.hunt || !this.userAnswer.trim()) return;

    this.isSubmitting = true;
    this.feedback = '';

    const step = this.currentStepData;
    if (!step) return;

    try {
      const correctDecrypted = await decrypt(step.correctAnswer);

      if (this.userAnswer.trim().toLowerCase() === correctDecrypted.toLowerCase()) {
        this.handleSuccess();
      } else {
        this.feedback = 'Not quite right. Try again!';
        this.feedbackType = 'error';
        this.isSubmitting = false;
      }
    } catch (e) {
      this.feedback = 'Encryption error. Refresh page.';
      this.feedbackType = 'error';
      this.isSubmitting = false;
    }
  }

  private handleSuccess(): void {
    this.showSuccess = true;
    this.isSubmitting = false;
    this.userAnswer = '';

    setTimeout(() => {
      this.showSuccess = false;
      if (this.currentStep === this.hunt!.steps.length) {
        this.completeGame();
      } else {
        this.currentStep++;
        this.updateThreeMarkers();
      }
    }, 2000);
  }

  private async completeGame(): Promise<void> {
    this.isCompleted = true;
    this.currentStep++; // For the treasure
    this.decryptedFinalMessage = await decrypt(this.hunt!.finalMessage);
    this.updateThreeMarkers();
  }

  private updateThreeMarkers(): void {
    if (!this.threeScene || !this.hunt) return;

    const markers: Marker[] = [];

    // Show only unlocked markers (or current one)
    for (let i = 0; i < this.currentStep - 1; i++) {
      const p = this.hunt.steps[i].position;
      markers.push({ id: `clue-${i}`, type: 'clue', position: new THREE.Vector3(p.x, p.y, p.z) });
    }

    // Show current target
    if (this.currentStep <= this.hunt.steps.length) {
      const p = this.hunt.steps[this.currentStep - 1].position;
      const currentMarkerPosition = new THREE.Vector3(p.x, p.y, p.z);
      markers.push({ id: `current`, type: 'clue', position: currentMarkerPosition });
      this.threeScene.setMarkers(markers);
      this.threeScene.focusOn(currentMarkerPosition);
    } else {
      // Treasure revealed
      const p = this.hunt.treasurePosition;
      const treasurePos = new THREE.Vector3(p.x, p.y, p.z);
      markers.push({ id: 'treasure', type: 'treasure', position: treasurePos });
      this.threeScene.setMarkers(markers);
      this.threeScene.focusOn(treasurePos);
    }
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
