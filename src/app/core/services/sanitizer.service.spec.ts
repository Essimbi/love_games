import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { SanitizerService } from './sanitizer.service';

describe('SanitizerService', () => {
  let service: SanitizerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SanitizerService, DomSanitizer]
    });
    service = TestBed.inject(SanitizerService);
  });

  describe('sanitizeInput', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("XSS")</script>Hello';
      const result = service.sanitizeInput(input);
      expect(result).not.toContain('<script>');
      expect(result).toContain('Hello');
    });

    it('should remove event handlers', () => {
      const input = '<img src="x" onerror="alert(\'XSS\')">';
      const result = service.sanitizeInput(input);
      expect(result).not.toContain('onerror');
    });

    it('should remove iframe tags', () => {
      const input = '<iframe src="malicious.com"></iframe>';
      const result = service.sanitizeInput(input);
      expect(result).not.toContain('<iframe');
    });

    it('should preserve safe content', () => {
      const input = '<p>Hello <b>World</b></p>';
      const result = service.sanitizeInput(input);
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      const input = '<script>alert("XSS")</script>';
      const result = service.escapeHtml(input);
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).toContain('&quot;');
    });

    it('should escape ampersands', () => {
      const input = 'A & B';
      const result = service.escapeHtml(input);
      expect(result).toBe('A &amp; B');
    });
  });

  describe('email validation', () => {
    it('should validate correct emails', () => {
      expect(service.isValidEmail('test@example.com')).toBe(true);
      expect(service.isValidEmail('user.name@example.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(service.isValidEmail('invalid')).toBe(false);
      expect(service.isValidEmail('invalid@')).toBe(false);
      expect(service.isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('URL validation', () => {
    it('should validate correct URLs', () => {
      expect(service.isValidUrl('https://example.com')).toBe(true);
      expect(service.isValidUrl('http://localhost:3000')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(service.isValidUrl('not a url')).toBe(false);
      expect(service.isValidUrl('ht!tp://invalid')).toBe(false);
    });
  });

  describe('sanitizeJson', () => {
    it('should sanitize JSON objects', () => {
      const input = {
        name: '<script>alert("XSS")</script>',
        safe: 'Hello'
      };
      const result = service.sanitizeJson(input);
      expect(result.name).not.toContain('<script>');
      expect(result.safe).toBe('Hello');
    });

    it('should sanitize JSON arrays', () => {
      const input = ['<script>alert("XSS")</script>', 'safe'];
      const result = service.sanitizeJson(input);
      expect(result[0]).not.toContain('<script>');
      expect(result[1]).toBe('safe');
    });

    it('should handle nested objects', () => {
      const input = {
        user: {
          name: '<img src="x" onerror="alert(\'XSS\')">'
        }
      };
      const result = service.sanitizeJson(input);
      expect(result.user.name).not.toContain('onerror');
    });
  });

  describe('sanitizeFileName', () => {
    it('should remove path traversal attempts', () => {
      const input = '../../etc/passwd';
      const result = service.sanitizeFileName(input);
      expect(result).not.toContain('..');
    });

    it('should remove special characters', () => {
      const input = 'file<>name|.txt';
      const result = service.sanitizeFileName(input);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      expect(result).not.toContain('|');
    });

    it('should preserve safe characters', () => {
      const input = 'my-file_name.txt';
      const result = service.sanitizeFileName(input);
      expect(result).toBe('my-file_name.txt');
    });

    it('should limit filename length', () => {
      const input = 'a'.repeat(300);
      const result = service.sanitizeFileName(input);
      expect(result.length).toBeLessThanOrEqual(255);
    });
  });

  describe('isValidLength', () => {
    it('should validate string length', () => {
      expect(service.isValidLength('hello', 1, 10)).toBe(true);
      expect(service.isValidLength('hello', 5, 10)).toBe(true);
      expect(service.isValidLength('hello', 6, 10)).toBe(false);
      expect(service.isValidLength('hello', 1, 4)).toBe(false);
    });

    it('should trim whitespace before checking', () => {
      expect(service.isValidLength('  hello  ', 5, 10)).toBe(true);
    });
  });

  describe('normalizeInput', () => {
    it('should trim whitespace', () => {
      const input = '  hello  ';
      const result = service.normalizeInput(input);
      expect(result).toBe('hello');
    });

    it('should normalize multiple spaces', () => {
      const input = 'hello    world';
      const result = service.normalizeInput(input);
      expect(result).toBe('hello world');
    });
  });
});
