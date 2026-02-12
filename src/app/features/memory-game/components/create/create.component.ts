import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MemoryGameService } from '../../services/memory-game.service';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { ShareModalComponent } from '../../../../shared/components/share-modal/share-modal.component';

@Component({
  selector: 'app-memory-game-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ShareModalComponent],
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class MemoryGameCreateComponent implements OnInit {
  @ViewChild('imagesPreview') imagesPreview!: ElementRef;
  
  form!: FormGroup;
  loading = false;
  error: string | null = null;
  shareUrl: string | null = null;
  showShareModal = false;
  
  selectedImages: { file: File; preview: string }[] = [];
  loadingProgress = 0;
  isLoadingImages = false;
  
  difficultyOptions = [
    { value: 'easy', label: 'Facile (4 paires)' },
    { value: 'medium', label: 'Moyen (6 paires)' },
    { value: 'hard', label: 'Difficile (8 paires)' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private memoryGameService: MemoryGameService,
    private analyticsService: AnalyticsService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}
  
  ngOnInit(): void {
    this.initializeForm();
  }
  
  private initializeForm(): void {
    this.form = this.fb.group({
      finalMessage: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(5000)]],
      difficultyLevel: ['medium', Validators.required]
    });
  }
  
  /**
   * Handle file selection
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    
    const files = Array.from(input.files);
    const maxImages = this.form.get('difficultyLevel')?.value === 'easy' ? 4 : 
                      this.form.get('difficultyLevel')?.value === 'medium' ? 6 : 8;
    
    if (this.selectedImages.length + files.length > maxImages) {
      this.error = `Vous pouvez sélectionner au maximum ${maxImages} images`;
      return;
    }
    
    this.isLoadingImages = true;
    this.loadingProgress = 0;
    this.error = null;
    
    let loadedCount = 0;
    const totalFiles = files.length;
    const newImages: { file: File; preview: string }[] = [];
    
    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        this.error = 'Seules les images sont acceptées';
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'La taille maximale par image est 5MB';
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        newImages.push({
          file,
          preview: e.target?.result as string
        });
        
        loadedCount++;
        this.loadingProgress = Math.round((loadedCount / totalFiles) * 100);
        
        if (loadedCount === totalFiles) {
          // Add all images at once
          this.ngZone.run(() => {
            this.selectedImages.push(...newImages);
            this.isLoadingImages = false;
            this.loadingProgress = 0;
            console.log('Affichage');
            
            // Force a reflow and wait for next tick
            setTimeout(() => {
              // Force reflow by reading offsetHeight
              if (this.imagesPreview) {
                const height = this.imagesPreview.nativeElement.offsetHeight;
                console.log('Preview height:', height);
              }
              this.scrollToPreview();
            }, 150);
          });
        }
      };
      reader.readAsDataURL(file);
    });
  }
  
  /**
   * Remove selected image
   */
  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
  }
  
  /**
   * Scroll to images preview
   */
  private scrollToPreview(): void {
    if (this.imagesPreview) {
      this.imagesPreview.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  
  /**
   * Submit the form and create the memory game
   */
  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.error = 'Veuillez remplir tous les champs correctement';
      return;
    }
    
    const maxImages = this.form.get('difficultyLevel')?.value === 'easy' ? 4 : 
                      this.form.get('difficultyLevel')?.value === 'medium' ? 6 : 8;
    
    if (this.selectedImages.length !== maxImages) {
      this.error = `Vous devez sélectionner exactement ${maxImages} images`;
      return;
    }
    
    this.loading = true;
    this.error = null;
    
    try {
      const { finalMessage, difficultyLevel } = this.form.value;
      
      const response = await this.memoryGameService.createGame(
        finalMessage,
        difficultyLevel,
        this.selectedImages.map(img => img.preview)
      ).toPromise();
      
      if (!response) {
        throw new Error('Failed to create memory game');
      }
      
      // Generate share URL
      this.shareUrl = `${window.location.origin}/memory/${response.id}`;
      this.showShareModal = true;
      
      // Track analytics
      this.analyticsService.trackGameCreated('memory_game', response.id);
    } catch (err) {
      this.error = 'Erreur lors de la création du jeu. Veuillez réessayer.';
      console.error('Error creating memory game:', err);
    } finally {
      this.loading = false;
    }
  }
  
  /**
   * Close the share modal
   */
  closeShareModal(): void {
    this.showShareModal = false;
    this.form.reset();
    this.selectedImages = [];
    this.shareUrl = null;
  }
  
  /**
   * Get form control for template
   */
  get finalMessage() {
    return this.form.get('finalMessage');
  }
  
  get difficultyLevel() {
    return this.form.get('difficultyLevel');
  }
}
