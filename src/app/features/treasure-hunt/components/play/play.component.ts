import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
            <span>Indice {{ currentStep }} / {{ hunt.steps.length }}</span>
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
                placeholder="Révéler le chemin..."
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
             <h3>Chemin Déverrouillé !</h3>
             <p>Les étoiles s'alignent...</p>
          </div>
        </main>

        <!-- Final Secret Disclosure -->
        <div class="final-card glass-card fade-in" *ngIf="isCompleted">
          <div class="vault-icon">
            <lucide-icon [name]="'lock'"></lucide-icon>
          </div>
          <h2>Le Coffre Secret</h2>
          <div class="decrypted-message">
            {{ decryptedFinalMessage }}
          </div>
          <button class="btn-home" (click)="goHome()">
            Fermer le Coffre
          </button>
        </div>

      </div>

      <!-- Loading / Error States -->
      <div class="overlay-full" *ngIf="isLoading || error">
        <div class="glass-card text-center">
          <div *ngIf="isLoading" class="loader"></div>
          <p *ngIf="isLoading">Ouverture du Portail...</p>
          <div *ngIf="error" class="error-content">
             <p>⚠️ {{ error }}</p>
             <button class="btn-home" (click)="goHome()">Retour à l'Accueil</button>
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
      background: rgba(10, 5, 20, 0.4);
      backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 1rem 2rem;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3), inset 0 0 10px rgba(255, 0, 85, 0.1);
    }

    .play-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
      max-width: 600px;
      margin: 0 auto;
      width: 100%;
      border-color: rgba(255, 0, 85, 0.3);
    }

    .step-counter {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
      color: #fff;
      text-shadow: 0 0 10px rgba(255, 0, 85, 0.5);
    }

    .progress-track {
      flex: 1;
      height: 8px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .track-fill {
      height: 100%;
      background: linear-gradient(90deg, #FF0055, #764ba2);
      box-shadow: 0 0 15px #FF0055;
      transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .clue-area {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding-top: 2rem;
    }

    .glass-card {
      background: rgba(15, 5, 25, 0.5);
      backdrop-filter: blur(25px) saturate(200%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 28px;
      padding: 3rem;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(255, 0, 85, 0.05);
      text-align: center;
      border: 1px solid rgba(255, 0, 85, 0.2);
    }

    .title {
      font-size: 1.75rem;
      background: linear-gradient(to right, #fff, #FF0055);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 1.25rem;
      letter-spacing: 1px;
    }

    .riddle {
      font-size: 1.15rem;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.7;
      margin-bottom: 2.5rem;
      font-weight: 300;
    }

    .input-group {
      display: flex;
      gap: 0.75rem;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 16px;
      padding: 0.6rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s;
    }

    .input-group:focus-within {
        border-color: #FF0055;
        box-shadow: 0 0 20px rgba(255, 0, 85, 0.2);
        background: rgba(255, 0, 85, 0.02);
    }

    .midnight-input {
      flex: 1;
      background: transparent;
      border: none;
      padding: 0.75rem;
      color: #fff;
      font-family: inherit;
      font-size: 1.1rem;
    }

    .midnight-input:focus { outline: none; }

    .btn-reveal {
      background: linear-gradient(135deg, #FF0055, #764ba2);
      border: none;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 4px 15px rgba(255, 0, 85, 0.3);
    }

    .btn-reveal:hover:not(:disabled) {
      transform: scale(1.1) rotate(5deg);
      box-shadow: 0 0 25px rgba(255, 0, 85, 0.5);
    }

    .success-reveal {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    .success-icon {
      width: 70px;
      height: 70px;
      color: #00ffcc;
      filter: drop-shadow(0 0 15px #00ffcc);
      animation: bounce 2s infinite ease-in-out;
    }

    .decrypted-message {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 0, 85, 0.2);
      padding: 2.5rem;
      border-radius: 20px;
      margin: 2rem 0;
      font-size: 1.3rem;
      line-height: 1.8;
      word-break: break-word;
      color: #fff;
      text-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
    }

    .vault-icon {
      width: 90px;
      height: 90px;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 2rem;
      color: #ffd700;
      border: 2px solid #ffd700;
      box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
      animation: float 3s infinite ease-in-out;
    }

    .btn-home {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #fff;
      padding: 1rem 2.5rem;
      border-radius: 14px;
      cursor: pointer;
      margin-top: 1.5rem;
      transition: all 0.3s;
      font-weight: 500;
    }

    .btn-home:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: #fff;
        transform: translateY(-2px);
    }

    .overlay-full {
      position: absolute;
      inset: 0;
      z-index: 10;
      background: radial-gradient(circle at center, #1a0a1e, #0a050a);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loader {
      border: 3px solid rgba(255, 255, 255, 0.05);
      border-left-color: #FF0055;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1.5rem;
      box-shadow: 0 0 15px rgba(255, 0, 85, 0.2);
    }

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes float { 
        0%, 100% { transform: translateY(0); } 
        50% { transform: translateY(-10px); } 
    }
    @keyframes bounce { 
        0%, 100% { transform: scale(1); } 
        50% { transform: scale(1.1); } 
    }
    @keyframes fadeIn { 
        from { opacity: 0; transform: translateY(20px); } 
        to { opacity: 1; transform: translateY(0); } 
    }

    .fade-in { animation: fadeIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); }
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
  isBrowser: boolean;
  @ViewChild(ThreeSceneComponent) threeScene!: ThreeSceneComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private treasureHuntService: TreasureHuntService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.loadHunt();
  }

  private loadHunt(): void {
    if (!this.isBrowser) {
      this.isLoading = false; // Prevent stuck loader on server
      return;
    }
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Invalid treasure hunt ID';
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.treasureHuntService.getHunt(id).subscribe({
      next: (hunt) => {
        this.hunt = hunt;
        this.isLoading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.updateThreeMarkers(), 0);
      },
      error: (err) => {
        this.error = 'Failed to load hunt. It may have expired.';
        this.isLoading = false;
        this.cdr.detectChanges();
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
      markers.push({
        id: `clue-${i}`,
        type: 'clue',
        position: new THREE.Vector3(p.x, p.y, p.z),
        number: i + 1
      });
    }

    // Show current target
    if (this.currentStep <= this.hunt.steps.length) {
      const p = this.hunt.steps[this.currentStep - 1].position;
      const currentMarkerPosition = new THREE.Vector3(p.x, p.y, p.z);
      markers.push({
        id: `current`,
        type: 'clue',
        position: currentMarkerPosition,
        number: this.currentStep
      });
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
