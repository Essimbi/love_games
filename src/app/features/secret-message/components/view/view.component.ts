import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef, signal, NgZone, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { SecretMessageService } from '../../services/secret-message.service';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-secret-message-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class SecretMessageViewComponent implements OnInit {
  messageId: string | null = null;
  encryptionKey: string | null = null;

  // State as signals for robust UI updates
  message = signal<string | null>(null);
  currentViews = signal(0);
  maxViews = signal(0);
  loading = signal(true);
  error = signal<string | null>(null);
  revealed = signal(false);
  backgroundImage = signal<string | null>(null);

  private sanitizer = inject(DomSanitizer);

  sanitizedMessage = computed(() => {
    const raw = this.message();
    return raw ? this.sanitizer.bypassSecurityTrustHtml(raw) : null;
  });

  private toastService = inject(ToastService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private secretMessageService: SecretMessageService,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit(): void {
    console.log('🚀 SecretMessageViewComponent.ngOnInit');
    this.messageId = this.route.snapshot.paramMap.get('id');
    console.log('📍 Message ID:', this.messageId);

    if (isPlatformBrowser(this.platformId)) {
      console.log('💻 Browser environment detected');
      this.encryptionKey = this.secretMessageService.extractKeyFromUrl();
      console.log('🔑 Key extracted:', !!this.encryptionKey);

      if (!this.messageId || !this.encryptionKey) {
        console.warn('⚠️ Missing ID or Key');
        this.error.set('URL invalide. La clé de déchiffrement est manquante.');
        this.loading.set(false);
        return;
      }

      this.loadMessage();
    } else {
      console.log('🌐 Server environment detected');
      // Keep loading=true on server for hydration consistency if desired,
      // or set to false if we want an empty page until client boots.
      // Let's keep it true to show something (the loader) immediately.
    }
  }

  /**
   * Load and decrypt the message
   */
  private async loadMessage(): Promise<void> {
    console.log('🔄 loadMessage() started');
    try {
      if (!this.messageId || !this.encryptionKey) {
        console.error('❌ Missing messageId or encryptionKey', { id: this.messageId, key: !!this.encryptionKey });
        throw new Error('Message ID or encryption key is missing');
      }

      console.log('📡 Calling secretMessageService.getMessage...');
      const result = await this.secretMessageService.getMessage(
        this.messageId,
        this.encryptionKey
      );
      console.log('✅ getMessage successful');

      // Use NgZone.run to ensure signal updates trigger change detection
      this.ngZone.run(() => {
        this.message.set(result.message);
        this.currentViews.set(result.currentViews);
        this.maxViews.set(result.maxViews);
        this.backgroundImage.set(result.backgroundImage);
        console.log('📊 Signal values updated');
      });

      console.log('📊 Tracking analytics...');
      this.analyticsService.trackGameViewed('secret-message', this.messageId);
    } catch (err: any) {
      console.error('❌ loadMessage failed:', err);
      this.error.set('Impossible de déchiffrer le message. La clé est peut-être invalide ou le message a expiré.');
    } finally {
      this.ngZone.run(() => {
        console.log('🏁 loadMessage finished, setting loading = false');
        this.loading.set(false);
        this.cdr.detectChanges(); // Double insurance
      });
    }
  }

  /**
   * Reveal the message with animation
   */
  revealMessage(): void {
    this.revealed.set(true);

    // Trigger floating hearts animation
    this.createFloatingHearts();
  }

  /**
   * Create floating hearts animation
   */
  private createFloatingHearts(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const container = document.querySelector('.message-container');
    if (!container) return;

    for (let i = 0; i < 30; i++) {
      const heart = document.createElement('div');
      heart.className = 'floating-heart';
      heart.textContent = ['❤️', '💖', '💘', '✨', '🌸'][Math.floor(Math.random() * 5)];
      heart.style.left = Math.random() * 100 + 'vw';
      heart.style.bottom = '-5vh';
      heart.style.fontSize = (Math.random() * 2 + 1) + 'rem';
      heart.style.animationDelay = Math.random() * 2 + 's';
      heart.style.animationDuration = (Math.random() * 3 + 2) + 's';
      heart.style.opacity = '0';
      document.body.appendChild(heart);

      // Remove after animation
      setTimeout(() => heart.remove(), 5000);
    }
  }

  /**
   * Copy message to clipboard
   */
  copyToClipboard(): void {
    const msg = this.message();
    if (isPlatformBrowser(this.platformId) && msg) {
      navigator.clipboard.writeText(msg).then(() => {
        this.toastService.success('Message copié dans le presse-papiers ! 📋');
      });
    }
  }

  /**
   * Go back to home
   */
  goHome(): void {
    this.router.navigate(['/']);
  }
}
