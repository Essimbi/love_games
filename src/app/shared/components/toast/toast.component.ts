import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="visible"
      class="toast"
      [class]="'toast-' + type"
      [@slideIn]
    >
      <div class="toast-content">
        <span class="toast-icon">{{ icon }}</span>
        <span class="toast-message">{{ message }}</span>
      </div>
      <button
        type="button"
        class="toast-close"
        (click)="close()"
      >
        ✕
      </button>
    </div>
  `,
  styleUrls: ['./toast.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(400px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(400px)', opacity: 0 }))
      ])
    ])
  ]
})
export class ToastComponent implements OnInit {
  @Input() message = '';
  @Input() type: ToastType = 'info';
  @Input() duration = 3000;
  @Output() closed = new EventEmitter<void>();

  visible = true;
  private timeout: any;
  icon = 'ℹ';

  ngOnInit(): void {
    this.icon = this.getIcon();
    if (this.duration > 0) {
      this.timeout = setTimeout(() => this.close(), this.duration);
    }
  }

  close(): void {
    this.visible = false;
    clearTimeout(this.timeout);
    setTimeout(() => this.closed.emit(), 300);
  }

  private getIcon(): string {
    switch (this.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  }
}
