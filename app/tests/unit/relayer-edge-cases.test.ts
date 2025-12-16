import { describe, it, expect } from 'vitest';
import { calculateNetAmount } from '@/lib/relayer';

describe('Relayer Edge Cases', () => {
  describe('calculateNetAmount - Edge Cases', () => {
    it('deve lidar com valores muito pequenos (1 wei)', () => {
      const amount = BigInt('1');
      const { netAmount, fee } = calculateNetAmount(amount);
      
      // Fee de 0.4% de 1 wei = 0 (arredondado para baixo)
      expect(fee).toBe(BigInt('0'));
      expect(netAmount).toBe(BigInt('1'));
    });

    it('deve lidar com valores muito grandes', () => {
      const amount = BigInt('1000000000000000000000000000'); // 1 bilhão de ETH
      const { netAmount, fee } = calculateNetAmount(amount);
      
      // Verificar que não há overflow
      expect(netAmount).toBeLessThan(amount);
      expect(fee).toBeGreaterThan(BigInt('0'));
      
      // Verificar que netAmount + fee = amount (aproximadamente, considerando arredondamento)
      const sum = netAmount + fee;
      const diff = amount > sum ? amount - sum : sum - amount;
      // Diferença deve ser pequena (devido a arredondamento)
      expect(Number(diff)).toBeLessThan(Number(amount) / 1000);
    });

    it('deve manter precisão para valores com muitos decimais', () => {
      const amount = BigInt('1234567890123456789'); // Valor arbitrário
      const { netAmount, fee } = calculateNetAmount(amount);
      
      // Verificar que fee é aproximadamente 0.4%
      const expectedFee = (amount * BigInt(4)) / BigInt(1000);
      expect(fee).toBe(expectedFee);
      
      // Verificar que netAmount é amount - fee
      expect(netAmount).toBe(amount - fee);
    });

    it('deve retornar valores consistentes em múltiplas chamadas', () => {
      const amount = BigInt('1000000000000000000');
      
      const result1 = calculateNetAmount(amount);
      const result2 = calculateNetAmount(amount);
      const result3 = calculateNetAmount(amount);
      
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });
  });
});

