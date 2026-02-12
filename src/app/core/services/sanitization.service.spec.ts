import { describe, it, expect, beforeEach } from 'vitest';
import { SanitizationService } from './sanitization.service';
import { DomSanitizer } from '@angular/platform-browser';

describe('SanitizationService', () => {
  let service: SanitizationService;
  let domSanitizer: DomSanitizer;

  beforeEach(() => {
    // Mock DomSanitizer
    domSanitizer = {
      sanitize: (ctx: any, value: any) => value,
      bypassSecurityTrustUrl: (url: string) => url
    } as any;
    
    service = new SanitizationService(domSanitizer);
  });

  describe('stripHtmlTags', () => {
    it('should remove HTML tags', () => {
      const html = '<p>Hello <strong>World</strong></p>';
      const result = service.stripHtmlTags(html);
      expect(result).toBe('Hello World');
    });

    it('should handle nested tags', () => {
      const html = '<div><p><span>Nested</span></p></div>';
      const result = service.stripHtmlTags(html);
      expect(result).toBe('Nested');
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      const input = '<script>alert("XSS")</script>';
      const result = service.escapeHtml(input);
      expect(result).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    });

    it('should escape all dangerous characters', () => {
      const input = '&<>"\'';
      const result = service.escapeHtml(input);
      expect(result).toBe('&amp;&lt;&gt;&quot;&#039;');
    });
  });

  describe('sanitizeUserInput', () => {
    it('should trim whitespace', () => {
      const input = '  Hello World  ';
      const result = service.sanitizeUserInput(input);
      expect(result).toBe('Hello World');
    });

    it('should limit length', () => {
      const input = 'A'.repeat(1000);
      const result = service.sanitizeUserInput(input, 100);
      expect(result.length).toBe(100);
    });

    it('should remove dangerous characters', () => {
      const input = 'Hello<script>alert("XSS")</script>World';
      const result = service.sanitizeUserInput(input);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should remove multiple spaces', () => {
      const input = 'Hello    World';
      const result = service.sanitizeUserInput(input);
      expect(result).toBe('Hello World');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(service.isValidEmail('test@example.com')).toBe(true);
      expect(service.isValidEmail('user.name@example.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(service.isValidEmail('invalid')).toBe(false);
      expect(service.isValidEmail('invalid@')).toBe(false);
      expect(service.isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(service.isValidUrl('https://example.com')).toBe(true);
      expect(service.isValidUrl('http://example.com/path')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(service.isValidUrl('not a url')).toBe(false);
      expect(service.isValidUrl('htp://invalid')).toBe(false);
    });
  });

  describe('isValidPhoneNumber', () => {
    it('should validate correct phone numbers', () => {
      expect(service.isValidPhoneNumber('1234567890')).toBe(true);
      expect(service.isValidPhoneNumber('+1 (123) 456-7890')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(service.isValidPhoneNumber('123')).toBe(false);
      expect(service.isValidPhoneNumber('abc')).toBe(false);
    });
  });

  describe('sanitizeFilename', () => {
    it('should remove path separators', () => {
      const input = '../../../etc/passwd';
      const result = service.sanitizeFilename(input);
      expect(result).not.toContain('/');
      expect(result).not.toContain('\\');
    });

    it('should remove special characters', () => {
      const input = 'file<name>.txt';
      const result = service.sanitizeFilename(input);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should replace spaces with underscores', () => {
      const input = 'my file name.txt';
      const result = service.sanitizeFilename(input);
      expect(result).toContain('_');
    });
  });

  describe('isValidJson', () => {
    it('should validate correct JSON', () => {
      expect(service.isValidJson('{"key": "value"}')).toBe(true);
      expect(service.isValidJson('[]')).toBe(true);
      expect(service.isValidJson('null')).toBe(true);
    });

    it('should reject invalid JSON', () => {
      expect(service.isValidJson('{invalid}')).toBe(false);
      expect(service.isValidJson("{'key': 'value'}")).toBe(false);
    });
  });

  describe('sanitizeJsonObject', () => {
    it('should remove dangerous keys', () => {
      const obj = {
        safe: 'value',
        __proto__: { dangerous: true },
        constructor: { dangerous: true }
      };
      const result = service.sanitizeJsonObject(obj);
      expect(result.__proto__).toBeUndefined();
      expect(result.constructor).toBeUndefined();
      expect(result.safe).toBe('value');
    });

    it('should handle nested objects', () => {
      const obj = {
        nested: {
          __proto__: { dangerous: true },
          safe: 'value'
        }
      };
      const result = service.sanitizeJsonObject(obj);
      expect(result.nested.__proto__).toBeUndefined();
      expect(result.nested.safe).toBe('value');
    });

    it('should handle arrays', () => {
      const obj = [
        { __proto__: { dangerous: true }, safe: 'value' },
        { safe: 'value2' }
      ];
      const result = service.sanitizeJsonObject(obj);
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].__proto__).toBeUndefined();
    });
  });

  describe('isValidGpsCoordinates', () => {
    it('should validate correct GPS coordinates', () => {
      expect(service.isValidGpsCoordinates(0, 0)).toBe(true);
      expect(service.isValidGpsCoordinates(48.8566, 2.3522)).toBe(true);
      expect(service.isValidGpsCoordinates(-90, 180)).toBe(true);
    });

    it('should reject invalid GPS coordinates', () => {
      expect(service.isValidGpsCoordinates(91, 0)).toBe(false);
      expect(service.isValidGpsCoordinates(0, 181)).toBe(false);
      expect(service.isValidGpsCoordinates('48' as any, 2)).toBe(false);
    });
  });

  describe('removeXssVectors', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("XSS")</script>';
      const result = service.removeXssVectors(input);
      expect(result).not.toContain('<script');
    });

    it('should remove event handlers', () => {
      const input = '<img src="x" onerror="alert(\'XSS\')">';
      const result = service.removeXssVectors(input);
      expect(result).not.toContain('onerror');
    });

    it('should remove javascript protocol', () => {
      const input = '<a href="javascript:alert(\'XSS\')">Click</a>';
      const result = service.removeXssVectors(input);
      expect(result).not.toContain('javascript:');
    });
  });

  describe('isValidCreditCard', () => {
    it('should validate correct credit card numbers', () => {
      // Valid test credit card number
      expect(service.isValidCreditCard('4532015112830366')).toBe(true);
    });

    it('should reject invalid credit card numbers', () => {
      expect(service.isValidCreditCard('1234567890123456')).toBe(false);
      expect(service.isValidCreditCard('123')).toBe(false);
    });
  });
});
