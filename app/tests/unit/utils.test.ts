import { describe, it, expect } from 'vitest';
import {
  isValidAddress,
  sanitizeAddress,
  sanitizeInput,
  escapeHtml,
} from '@/lib/utils';

describe('Utils', () => {
  describe('isValidAddress', () => {
    it('deve validar endereços Ethereum válidos', () => {
      expect(isValidAddress('0x1234567890123456789012345678901234567890')).toBe(true);
      expect(isValidAddress('0x0000000000000000000000000000000000000000')).toBe(true);
      expect(isValidAddress('0xABCDEFabcdef1234567890123456789012345678')).toBe(true);
    });

    it('deve rejeitar endereços inválidos', () => {
      expect(isValidAddress('0x123')).toBe(false);
      expect(isValidAddress('1234567890123456789012345678901234567890')).toBe(false);
      expect(isValidAddress('0x123456789012345678901234567890123456789')).toBe(false);
      expect(isValidAddress('')).toBe(false);
      expect(isValidAddress('0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG')).toBe(false);
    });
  });

  describe('sanitizeAddress', () => {
    it('deve sanitizar e validar endereços válidos', () => {
      const valid = '0x1234567890123456789012345678901234567890';
      expect(sanitizeAddress(valid)).toBe(valid);
      expect(sanitizeAddress(`  ${valid}  `)).toBe(valid);
    });

    it('deve retornar null para endereços inválidos', () => {
      expect(sanitizeAddress('0x123')).toBeNull();
      expect(sanitizeAddress('invalid')).toBeNull();
      expect(sanitizeAddress('')).toBeNull();
    });

    it('deve remover tags HTML de endereços e validar', () => {
      const address = '0x1234567890123456789012345678901234567890';
      // A função remove tags HTML primeiro, então o endereço fica válido
      expect(sanitizeAddress(`<script>${address}</script>`)).toBe(address);
    });
  });

  describe('sanitizeInput', () => {
    it('deve remover tags HTML', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('alert("xss")');
      expect(sanitizeInput('<div>test</div>')).toBe('test');
      // A função remove a tag completa, incluindo atributos, então fica vazio
      expect(sanitizeInput('<img src="x" onerror="alert(1)">')).toBe('');
    });

    it('deve remover javascript: protocolos', () => {
      expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
      expect(sanitizeInput('JAVASCRIPT:alert(1)')).toBe('alert(1)');
    });

    it('deve remover event handlers', () => {
      expect(sanitizeInput('onclick=alert(1)')).toBe('alert(1)');
      expect(sanitizeInput('onerror=alert(1)')).toBe('alert(1)');
    });

    it('deve limitar tamanho a 1000 caracteres', () => {
      const long = 'a'.repeat(2000);
      expect(sanitizeInput(long).length).toBe(1000);
    });

    it('deve retornar string vazia para input vazio', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput(null as any)).toBe('');
      expect(sanitizeInput(undefined as any)).toBe('');
    });
  });

  describe('escapeHtml', () => {
    it('deve escapar caracteres HTML perigosos', () => {
      expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
      expect(escapeHtml('"quotes"')).toBe('&quot;quotes&quot;');
      expect(escapeHtml("'apostrophe'")).toBe('&#039;apostrophe&#039;');
      expect(escapeHtml('&ampersand')).toBe('&amp;ampersand');
    });

    it('deve manter texto seguro inalterado', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
      expect(escapeHtml('123456')).toBe('123456');
    });
  });
});

