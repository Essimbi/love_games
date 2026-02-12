import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import QRCode from 'qrcode';

@Component({
  selector: 'app-share-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './share-modal.component.html',
  styleUrls: ['./share-modal.component.scss']
})
export class ShareModalComponent implements OnChanges {
  @Input() shareUrl: string = '';
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @ViewChild('qrCanvas') qrCanvas!: ElementRef<HTMLCanvasElement>;
  
  copySuccess = false;
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen && this.shareUrl) {
      setTimeout(() => this.generateQRCode(), 100);
    }
  }
  
  /**
   * Generate QR code
   */
  private async generateQRCode(): Promise<void> {
    if (!this.qrCanvas) return;
    
    try {
      await QRCode.toCanvas(this.qrCanvas.nativeElement, this.shareUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#C9184A',
          light: '#FFF0F3'
        }
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }
  
  /**
   * Copy link to clipboard
   */
  copyLink(): void {
    navigator.clipboard.writeText(this.shareUrl).then(() => {
      this.copySuccess = true;
      setTimeout(() => {
        this.copySuccess = false;
      }, 2000);
    });
  }
  
  /**
   * Share via WhatsApp
   */
  shareViaWhatsApp(): void {
    const text = encodeURIComponent('Découvre ma surprise Saint-Valentin ! ❤️');
    const url = encodeURIComponent(this.shareUrl);
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
  }
  
  /**
   * Share via Messenger
   */
  shareViaMessenger(): void {
    const url = encodeURIComponent(this.shareUrl);
    window.open(`fb-messenger://share?link=${url}`, '_blank');
  }
  
  /**
   * Share via Email
   */
  shareViaEmail(): void {
    const subject = encodeURIComponent('Surprise Saint-Valentin');
    const body = encodeURIComponent(`Découvre ma surprise Saint-Valentin ! ❤️\n\n${this.shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  }
  
  /**
   * Close modal
   */
  closeModal(): void {
    this.close.emit();
  }
  
  /**
   * Close on backdrop click
   */
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}
