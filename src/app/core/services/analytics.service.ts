import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from './api.service';

interface AnalyticsEvent {
  eventType: string;
  gameId?: string;
  gameType?: string;
  metadata?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private platformId = inject(PLATFORM_ID);

  constructor(private api: ApiService) { }

  /**
   * Track game creation event
   */
  trackGameCreated(gameType: string, gameId: string): void {
    this.track({
      eventType: 'game_created',
      gameType,
      gameId
    });
  }

  /**
   * Track game view event
   */
  trackGameViewed(gameType: string, gameId: string): void {
    this.track({
      eventType: 'game_viewed',
      gameType,
      gameId
    });
  }

  /**
   * Track game completion event
   */
  trackGameCompleted(gameType: string, gameId: string, metadata?: any): void {
    this.track({
      eventType: 'game_completed',
      gameType,
      gameId,
      metadata
    });
  }

  /**
   * Track share click event
   */
  trackShareClicked(gameType: string, gameId: string, platform: string): void {
    this.track({
      eventType: 'share_clicked',
      gameType,
      gameId,
      metadata: { platform }
    });
  }

  /**
   * Send event to backend
   */
  private track(event: AnalyticsEvent): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.api.post('/analytics/track', event).subscribe({
      next: () => {
        // Success - silently continue
      },
      error: (err) => {
        // Silently fail - analytics errors should not affect user experience
        if (err.name !== 'AbortError') {
          console.debug('Analytics tracking failed (non-critical):', err.message);
        }
      }
    });
  }
}
