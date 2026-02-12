import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { EncryptionService } from '../../../core/services/encryption.service';
import { Observable, firstValueFrom } from 'rxjs';

export interface CreateSecretMessageRequest {
  encryptedContent: string;
  maxViews: number;
  expiresAt?: string;
  backgroundImage?: string;
}

export interface SecretMessageResponse {
  id: string;
  maxViews: number;
  currentViews: number;
  expiresAt: string | null;
  backgroundImage: string | null;
  createdAt: string;
}

export interface SecretMessageContent {
  id: string;
  encryptedContent: string;
  currentViews: number;
  maxViews: number;
  backgroundImage: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class SecretMessageService {

  private platformId = inject(PLATFORM_ID);

  constructor(
    private api: ApiService,
    private encryption: EncryptionService
  ) { }

  /**
   * Create a new secret message with encryption
   */
  async createMessage(
    message: string,
    maxViews: number,
    expiresAt?: string,
    backgroundImage?: string
  ): Promise<{ id: string; key: string }> {
    // Generate encryption key
    const key = await this.encryption.generateKey();

    // Encrypt the message
    const encryptedContent = await this.encryption.encrypt(message, key);

    // Send to backend
    const request: CreateSecretMessageRequest = {
      encryptedContent,
      maxViews,
      expiresAt,
      backgroundImage
    };

    const response = await firstValueFrom(this.api.post<SecretMessageResponse>(
      '/secret-messages',
      request
    ));

    if (!response) {
      throw new Error('Failed to create secret message');
    }

    return {
      id: response.id,
      key
    };
  }

  /**
   * Retrieve and decrypt a secret message
   */
  async getMessage(id: string, key: string): Promise<{ message: string; currentViews: number; maxViews: number; backgroundImage: string | null }> {
    console.log(`📡 Fetching message ${id} from API...`);
    const response = await firstValueFrom(this.api.get<SecretMessageContent>(
      `/secret-messages/${id}`
    ));

    if (!response) {
      console.error('❌ API returned empty response');
      throw new Error('Failed to retrieve secret message');
    }

    console.log('✅ Message received, decrypting...');

    // Decrypt the message
    const decryptedMessage = await this.encryption.decrypt(response.encryptedContent, key);

    return {
      message: decryptedMessage,
      currentViews: response.currentViews,
      maxViews: response.maxViews,
      backgroundImage: response.backgroundImage
    };
  }

  /**
   * Delete a secret message
   */
  deleteMessage(id: string): Observable<void> {
    return this.api.delete<void>(`/secret-messages/${id}`);
  }

  /**
   * Generate share URL with key in fragment
   */
  generateShareUrl(id: string, key: string): string {
    if (isPlatformBrowser(this.platformId)) {
      const baseUrl = window.location.origin;
      return `${baseUrl}/secret-message/${id}#key=${key}`;
    }
    return `/secret-message/${id}#key=${key}`;
  }

  /**
   * Extract key from URL fragment
   */
  extractKeyFromUrl(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    // Get hash and remove '#'
    const hash = window.location.hash.substring(1);
    if (!hash) return null;

    // Use URLSearchParams but handle the '+' issue
    // URLSearchParams.get() decodes '+' as space, which breaks Base64
    const params = new URLSearchParams(hash);
    const key = params.get('key');

    if (key) {
      // Restore '+' characters that were converted to spaces
      return key.replace(/ /g, '+');
    }

    // Fallback: search for key= pattern manually if searchParams failed
    const match = hash.match(/key=([^&]+)/);
    return match ? decodeURIComponent(match[1]).replace(/ /g, '+') : null;
  }
}
