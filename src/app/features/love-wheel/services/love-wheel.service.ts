import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Observable } from 'rxjs';

export interface WheelSection {
  sectionNumber: number;
  text: string;
  description?: string;
  color: string;
  icon?: string;
  probabilityWeight: number;
}

export interface CreateLoveWheelRequest {
  maxSpinsPerDay: number;
  sections: WheelSection[];
}

export interface LoveWheelResponse {
  id: string;
  maxSpinsPerDay: number;
  sections: WheelSection[];
  createdAt: string;
}

export interface SpinResult {
  sectionNumber: number;
  text: string;
  description?: string;
  color: string;
  icon?: string;
  spunAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoveWheelService {
  
  constructor(private api: ApiService) {}
  
  /**
   * Create a new love wheel
   */
  createWheel(request: CreateLoveWheelRequest): Observable<{ id: string; maxSpinsPerDay: number; createdAt: string }> {
    return this.api.post('/love-wheels', request);
  }
  
  /**
   * Get a love wheel
   */
  getWheel(id: string): Observable<LoveWheelResponse> {
    return this.api.get(`/love-wheels/${id}`);
  }
  
  /**
   * Spin the wheel
   */
  spinWheel(id: string, sessionId?: string): Observable<SpinResult> {
    return this.api.post(`/love-wheels/${id}/spin`, { sessionId });
  }
  
  /**
   * Get spin history
   */
  getHistory(id: string): Observable<{ spins: SpinResult[] }> {
    return this.api.get(`/love-wheels/${id}/history`);
  }
  
  /**
   * Calculate rotation angle for a section
   */
  calculateRotationAngle(sectionNumber: number, totalSections: number): number {
    const anglePerSection = 360 / totalSections;
    return sectionNumber * anglePerSection;
  }
}
