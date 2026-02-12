import { Component, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-google-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container">
      <div #mapElement class="map" id="map"></div>
      <div class="map-info">
        <p><strong>Location:</strong> {{ latitude }}, {{ longitude }}</p>
        <a
          [href]="'https://maps.google.com/?q=' + latitude + ',' + longitude"
          target="_blank"
          class="btn btn-maps"
        >
          📍 Open in Google Maps
        </a>
      </div>
    </div>
  `,
  styles: [`
    .map-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .map {
      width: 100%;
      height: 400px;
      border-radius: 0.75rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .map-info {
      background: #f9f9f9;
      padding: 1rem;
      border-radius: 0.75rem;
      text-align: center;
    }

    .map-info p {
      margin: 0 0 1rem;
      color: #333;
      font-size: 0.95rem;
    }

    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-maps {
      background: #667eea;
      color: white;
    }

    .btn-maps:hover {
      background: #5568d3;
      transform: translateY(-2px);
    }

    @media (max-width: 600px) {
      .map {
        height: 300px;
      }
    }
  `]
})
export class GoogleMapComponent implements AfterViewInit {
  @Input() latitude = 0;
  @Input() longitude = 0;
  @Input() title = 'Location';
  @ViewChild('mapElement') mapElement!: ElementRef;

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  private initializeMap(): void {
    // Check if Google Maps API is available
    if (typeof (window as any).google === 'undefined') {
      console.warn('Google Maps API not loaded. Displaying fallback.');
      return;
    }

    const mapOptions = {
      zoom: 15,
      center: { lat: this.latitude, lng: this.longitude },
      mapTypeControl: true,
      fullscreenControl: true,
      streetViewControl: true
    };

    const map = new (window as any).google.maps.Map(
      this.mapElement.nativeElement,
      mapOptions
    );

    // Add marker
    new (window as any).google.maps.Marker({
      position: { lat: this.latitude, lng: this.longitude },
      map: map,
      title: this.title,
      animation: (window as any).google.maps.Animation.DROP
    });
  }
}
