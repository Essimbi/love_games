import { describe, it, expect, beforeEach } from 'vitest';
import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeEach(() => {
    service = new EncryptionService();
  });

  describe('generateKey', () => {
    it('should generate a valid encryption key', async () => {
      const key = await service.generateKey();
      expect(key).toBeDefined();
      expect(key).toBeInstanceOf(CryptoKey);
    });

    it('should generate different keys on each call', async () => {
      const key1 = await service.generateKey();
      const key2 = await service.generateKey();
      expect(key1).not.toBe(key2);
    });
  });

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt text correctly', async () => {
      const key = await service.generateKey();
      const plaintext = 'Hello, World!';

      const encrypted = await service.encrypt(plaintext, key);
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(plaintext);

      const decrypted = await service.decrypt(encrypted, key);
      expect(decrypted).toBe(plaintext);
    });

    it('should handle empty strings', async () => {
      const key = await service.generateKey();
      const plaintext = '';

      const encrypted = await service.encrypt(plaintext, key);
      const decrypted = await service.decrypt(encrypted, key);
      expect(decrypted).toBe(plaintext);
    });

    it('should handle long text', async () => {
      const key = await service.generateKey();
      const plaintext = 'A'.repeat(10000);

      const encrypted = await service.encrypt(plaintext, key);
      const decrypted = await service.decrypt(encrypted, key);
      expect(decrypted).toBe(plaintext);
    });

    it('should handle special characters', async () => {
      const key = await service.generateKey();
      const plaintext = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';

      const encrypted = await service.encrypt(plaintext, key);
      const decrypted = await service.decrypt(encrypted, key);
      expect(decrypted).toBe(plaintext);
    });

    it('should handle unicode characters', async () => {
      const key = await service.generateKey();
      const plaintext = '你好世界 🌍 مرحبا بالعالم';

      const encrypted = await service.encrypt(plaintext, key);
      const decrypted = await service.decrypt(encrypted, key);
      expect(decrypted).toBe(plaintext);
    });
  });

  describe('key export and import', () => {
    it('should export and import keys correctly', async () => {
      const originalKey = await service.generateKey();
      const exported = await service.exportKey(originalKey);
      expect(exported).toBeDefined();

      const imported = await service.importKey(exported);
      expect(imported).toBeDefined();

      // Test that imported key works
      const plaintext = 'Test message';
      const encrypted = await service.encrypt(plaintext, imported);
      const decrypted = await service.decrypt(encrypted, imported);
      expect(decrypted).toBe(plaintext);
    });
  });

  describe('base64 conversion', () => {
    it('should convert to and from base64', () => {
      const text = 'Hello, World!';
      const base64 = service.toBase64(text);
      expect(base64).toBeDefined();
      expect(typeof base64).toBe('string');

      const decoded = service.fromBase64(base64);
      expect(decoded).toBe(text);
    });

    it('should handle special characters in base64', () => {
      const text = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      const base64 = service.toBase64(text);
      const decoded = service.fromBase64(base64);
      expect(decoded).toBe(text);
    });
  });
});
