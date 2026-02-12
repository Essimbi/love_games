import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SecretMessageService } from '../../services/secret-message.service';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ShareModalComponent } from '../../../../shared/components/share-modal/share-modal.component';

@Component({
  selector: 'app-secret-message-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ShareModalComponent],
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class SecretMessageCreateComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  error: string | null = null;
  shareUrl: string | null = null;
  showShareModal = false;

  expirationOptions = [
    { value: null, label: 'Pas d\'expiration' },
    { value: '24h', label: '24 heures' },
    { value: '48h', label: '48 heures' },
    { value: '7d', label: '7 jours' }
  ];

  private toastService = inject(ToastService);

  constructor(
    private fb: FormBuilder,
    private secretMessageService: SecretMessageService,
    private analyticsService: AnalyticsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(5000)]],
      maxViews: [2, [Validators.required, Validators.min(1), Validators.max(5)]],
      expiration: [null],
      backgroundImage: ['']
    });
  }

  /**
   * Calculate expiration date based on selected option
   */
  private calculateExpirationDate(option: string | null): string | undefined {
    if (!option) return undefined;

    const now = new Date();
    let expirationDate: Date;

    switch (option) {
      case '24h':
        expirationDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case '48h':
        expirationDate = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        break;
      case '7d':
        expirationDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        return undefined;
    }

    return expirationDate.toISOString();
  }

  /**
   * Submit the form and create the secret message
   */
  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.error = 'Veuillez remplir tous les champs correctement';
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      const { message, maxViews, expiration, backgroundImage } = this.form.value;
      const expiresAt = this.calculateExpirationDate(expiration);

      const { id, key } = await this.secretMessageService.createMessage(
        message,
        maxViews,
        expiresAt,
        backgroundImage || undefined
      );

      // Generate share URL
      this.shareUrl = this.secretMessageService.generateShareUrl(id, key);
      this.showShareModal = true;

      // Track analytics
      this.analyticsService.trackGameCreated('secret-message', id);

      this.toastService.success('Votre message secret a été créé avec succès ! ❤️');
    } catch (err) {
      this.error = 'Erreur lors de la création du message. Veuillez réessayer.';
      console.error('Error creating secret message:', err);
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
    this.shareUrl = null;
  }

  /**
   * Get form control for template
   */
  get message() {
    return this.form.get('message');
  }

  get maxViews() {
    return this.form.get('maxViews');
  }

  get expiration() {
    return this.form.get('expiration');
  }
}
