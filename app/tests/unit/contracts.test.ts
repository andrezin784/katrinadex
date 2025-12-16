import { describe, it, expect } from 'vitest';
import { getPoolSizes } from '@/lib/contracts';

describe('Contracts Utils', () => {
  describe('getPoolSizes', () => {
    it('deve retornar pool sizes do Arc Testnet para chainId 5042002', () => {
      const sizes = getPoolSizes(5042002);
      
      // Verificar se retorna objeto com pool sizes
      expect(sizes).toBeDefined();
      expect(typeof sizes).toBe('object');
      
      // Verificar se tem pools definidos
      expect(Object.keys(sizes).length).toBeGreaterThan(0);
    });

    it('deve retornar pool sizes padrão para outras chains', () => {
      const sizes = getPoolSizes(84532); // Base Sepolia
      
      expect(sizes).toBeDefined();
      expect(typeof sizes).toBe('object');
      expect(Object.keys(sizes).length).toBeGreaterThan(0);
    });

    it('deve retornar pool sizes para chainId desconhecido', () => {
      const sizes = getPoolSizes(999999);
      
      // Deve retornar pool sizes padrão
      expect(sizes).toBeDefined();
      expect(typeof sizes).toBe('object');
    });
  });
});

