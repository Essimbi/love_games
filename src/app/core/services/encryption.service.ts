import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private platformId = inject(PLATFORM_ID);

  /**
   * Check if the environment is browser and crypto is available
   */
  private isCryptoAvailable(): boolean {
    return isPlatformBrowser(this.platformId) && !!crypto?.subtle;
  }

  /**
   * Generate a new AES-256 encryption key
   */
  async generateKey(): Promise<string> {
    if (!this.isCryptoAvailable()) {
      throw new Error('Web Crypto API is only available in the browser securely.');
    }

    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    const exported = await crypto.subtle.exportKey('raw', key);
    return this.arrayBufferToBase64(exported);
  }

  /**
   * Encrypt text using AES-256-GCM
   */
  async encrypt(text: string, keyString: string): Promise<string> {
    if (!this.isCryptoAvailable()) {
      throw new Error('Web Crypto API is only available in the browser securely.');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    const keyData = this.base64ToArrayBuffer(keyString);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    // Generate random IV (Initialization Vector)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the data
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    // Combine IV + encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return this.arrayBufferToBase64(combined.buffer);
  }

  /**
   * Decrypt text using AES-256-GCM
   */
  async decrypt(encryptedText: string, keyString: string): Promise<string> {
    if (!this.isCryptoAvailable()) {
      throw new Error('Web Crypto API is only available in the browser securely.');
    }

    const combined = this.base64ToArrayBuffer(encryptedText);

    // Extract IV (first 12 bytes)
    const iv = combined.slice(0, 12);

    // Extract encrypted data (remaining bytes)
    const data = combined.slice(12);

    const keyData = this.base64ToArrayBuffer(keyString);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    // Decrypt the data
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  /**
   * Convert ArrayBuffer to Base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert Base64 string to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    // Ensure we don't have spaces (common URL decoding issue)
    const sanitized = base64.replace(/ /g, '+');
    try {
      const binary = atob(sanitized);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes.buffer;
    } catch (e) {
      console.error('❌ Base64 Decoding failed for string:', sanitized.substring(0, 10) + '...');
      throw e;
    }
  }
}
