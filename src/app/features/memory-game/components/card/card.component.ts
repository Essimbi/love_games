import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Card {
  id: number;
  imageIndex: number;
  image: string;
  flipped: boolean;
  matched: boolean;
}

@Component({
  selector: 'app-memory-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class MemoryCardComponent {
  @Input() card!: Card;
  @Output() cardFlipped = new EventEmitter<number>();
  
  /**
   * Handle card click
   */
  onClick(): void {
    if (!this.card.flipped && !this.card.matched) {
      this.cardFlipped.emit(this.card.id);
    }
  }
}
