import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SanitizerService {
  constructor(private domSanitizer: DomSanitizer) {}

  /**
   * Sanitize HTML content
   */
  sanitizeHtml(html: string): SafeHtml {
    return this.domSanitizer.sanitize(1, html) || '';
  }

  /**
   * Sanitize URL
   */
  sanitizeUrl(url: string): SafeUrl {
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  /**
   * Sanitize user input - remove dangerous characters
   */
  sanitizeInput(input: string): string {
    if (!input) return '';

    // Remove script tags and event handlers
    let sanitized = input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/on\w+\s*=\s*[^\s>]*/gi, '');

    // Remove dangerous HTML tags
    const dangerousTags = ['iframe', 'object', 'embed', 'link', 'style', 'meta'];
    dangerousTags.forEach(tag => {
      const regex = new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });

    return sanitized;
  }

  /**
   * Escape HTML special characters
   */
  escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
  }

  /**
   * Validate email
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL
   */
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Remove XSS vulnerabilities from JSON
   */
  sanitizeJson(json: any): any {
    if (typeof json === 'string') {
      return this.sanitizeInput(json);
    }

    if (Array.isArray(json)) {
      return json.map(item => this.sanitizeJson(item));
    }

    if (typeof json === 'object' && json !== null) {
      const sanitized: any = {};
      for (const key in json) {
        if (json.hasOwnProperty(key)) {
          sanitized[key] = this.sanitizeJson(json[key]);
        }
      }
      return sanitized;
    }

    return json;
  }

  /**
   * Validate and sanitize file name
   */
  sanitizeFileName(fileName: string): string {
    // Remove path traversal attempts
    let sanitized = fileName.replace(/\.\.\//g, '').replace(/\.\.\\/g, '');

    // Remove special characters except dots and hyphens
    sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Limit length
    if (sanitized.length > 255) {
      sanitized = sanitized.substring(0, 255);
    }

    return sanitized;
  }

  /**
   * Validate input length
   */
  isValidLength(input: string, minLength: number, maxLength: number): boolean {
    const length = input.trim().length;
    return length >= minLength && length <= maxLength;
  }

  /**
   * Remove whitespace and normalize
   */
  normalizeInput(input: string): string {
    return input.trim().replace(/\s+/g, ' ');
  }
}
