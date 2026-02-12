import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoveWheelService } from '../../services/love-wheel.service';
import { LoveWheelCanvasComponent } from '../canvas/canvas.component';
import { ShareModalComponent } from '../../../../shared/components/share-modal/share-modal.component';

const COLORS = [
  '#FF0055', // Neon Pink
  '#00D2FF', // Cyan
  '#FFEE00', // Gold
  '#BD00FF', // Purple
  '#00FF85', // Mint
  '#FF8A00', // Orange
  '#FF00BD', // Magenta
  '#00E0FF', // Sky
  '#7000FF', // Indigo
  '#00FFD1'  // Teal
];

const ICONS = ['❤️', '✨', '🎁', '🌹', '🥂', '💍', '🧸', '💌', '🔥', '👑', '🌙', '🦋'];

@Component({
  selector: 'app-love-wheel-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoveWheelCanvasComponent, ShareModalComponent],
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class LoveWheelCreateComponent implements OnInit {
  form!: FormGroup;
  isLoading = false;
  error = '';
  ICONS = ICONS;

  // Share Modal State
  shareUrl = '';
  isShareModalOpen = false;

  constructor(
    private fb: FormBuilder,
    private loveWheelService: LoveWheelService,
    private router: Router
  ) { }

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
        this.isLoading = false;
        // Generate share URL
        const msgUrl = window.location.origin + '/love-wheel/' + response.id;
        this.shareUrl = msgUrl;
        this.isShareModalOpen = true;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create love wheel';
        this.isLoading = false;
      }
    });
  }

  closeShareModal(): void {
    this.isShareModalOpen = false;
    this.router.navigate(['/love-wheel/create']);
  }
}
