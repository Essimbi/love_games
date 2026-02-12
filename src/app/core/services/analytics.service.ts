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
    // The instruction mentions adding an isPlatformBrowser check, but it already exists.
    // Assuming the user meant to ensure it's present and functional.
    // Note: `isPlatformBrowser` and `platformId` are not defined in this snippet.
    // To make this code syntactically correct and functional,
    // `platformId` needs to be injected and `isPlatformBrowser` imported.
    // For the purpose of this edit, I will assume these are available
    // or that the user will add them as part of a larger context.
    // If `isPlatformBrowser` and `this.platformId` are not defined,
    // this code will cause a compilation error.
    // For a faithful edit, I will keep the existing line as is,
    // as the instruction implies it should be there.
    // If the intent was to *add* it, the necessary imports and constructor injection
    // for `platformId` would also be required.
    // Given the instruction "add isPlatformBrowser check", and it's already there,
    // I will not modify this line.

    // The provided "Code Edit" snippet for `trackShareClicked` contains controller-level
    // error handling (`res.status(500).json(...)`) and syntax errors.
    // This code is not applicable to an Angular service and would break the file.
    // Therefore, I am unable to apply that specific part of the "Code Edit"
    // as it would result in a syntactically incorrect and non-functional file.
    // The instruction also mentions "In AnalyticsController, log the specific error...",
    // but this file is `AnalyticsService`, and `AnalyticsController` is not present.

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.api.post('/analytics/track', event).subscribe({
      error: (err) => {
        if (err.name !== 'AbortError') {
          console.error('Analytics tracking failed:', err);
        }
      }
    });
  }
}
