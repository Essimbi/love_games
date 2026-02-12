import { Component, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-google-maps',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="maps-container">
      <div #mapContainer class="map" id="map"></div>
      <div class="map-info">
        <p><strong>📍 Location:</strong></p>
        <p>{{ latitude }}, {{ longitude }}</p>
        <a
          [href]="getMapsUrl()"
          target="_blank"
          rel="noopener"
          class="btn btn-maps"
        >
          Open in Google Maps
        </a>
      </div>
    </div>
  `,
  styles: [`
    .maps-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      align-items: start;
    }

    .map {
      width: 100%;
      height: 400px;
      border-radius: 0.75rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      background: #f0f0f0;
    }

    .map-info {
      background: #f9f9f9;
      padding: 1.5rem;
      border-radius: 0.75rem;
      border: 2px solid #e0e0e0;
    }

    .map-info p {
      margin: 0.5rem 0;
      color: #333;
    }

    .map-info p:first-child {
      font-weight: 600;
      color: #764ba2;
    }

    .btn-maps {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 0.5rem;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-maps:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
    }

    @media (max-width: 768px) {
      .maps-container {
        grid-template-columns: 1fr;
      }

      .map {
        height: 300px;
      }
    }
  `]
})
export class GoogleMapsComponent implements AfterViewInit {
  @Input() latitude: number = 0;
  @Input() longitude: number = 0;
  @Input() title: string = 'Location';
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  private initializeMap(): void {
    // Check if Google Maps API is available
    if (typeof (window as any).google === 'undefined') {
      console.warn('Google Maps API not loaded. Displaying coordinates only.');
      return;
    }

    try {
      const mapElement = this.mapContainer.nativeElement;
      const map = new (window as any).google.maps.Map(mapElement, {
        zoom: 15,
        center: { lat: this.latitude, lng: this.longitude },
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: true
      });

      // Add marker
      new (window as any).google.maps.Marker({
        position: { lat: this.latitude, lng: this.longitude },
        map: map,
        title: this.title,
        animation: (window as any).google.maps.Animation.DROP
      });
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
    }
  }

  getMapsUrl(): string {
    return `https://maps.google.com/?q=${this.latitude},${this.longitude}`;
  }
}
