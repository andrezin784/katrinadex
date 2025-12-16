import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateNetAmount } from '@/lib/relayer';

describe('Relayer Utils', () => {
  describe('calculateNetAmount', () => {
    it('deve calcular o valor líquido com fee de 0.4%', () => {
      const amount = BigInt('1000000000000000000'); // 1 ETH (18 decimals)
      const { netAmount, fee } = calculateNetAmount(amount);
      
      // 1 ETH - (1 ETH * 0.004) = 0.996 ETH
      const expectedNet = BigInt('996000000000000000');
      const expectedFee = BigInt('4000000000000000'); // 0.004 ETH
      expect(netAmount).toBe(expectedNet);
      expect(fee).toBe(expectedFee);
    });

    it('deve calcular corretamente para valores pequenos', () => {
      const amount = BigInt('1000000'); // 0.000001 ETH
      const { netAmount, fee } = calculateNetAmount(amount);
      
      // 1000000 - (1000000 * 0.004) = 996000
      const expectedNet = BigInt('996000');
      const expectedFee = BigInt('4000');
      expect(netAmount).toBe(expectedNet);
      expect(fee).toBe(expectedFee);
    });

    it('deve calcular corretamente para valores grandes', () => {
      const amount = BigInt('1000000000000000000000'); // 1000 ETH
      const { netAmount, fee } = calculateNetAmount(amount);
      
      // 1000 ETH - (1000 ETH * 0.004) = 996 ETH
      const expectedNet = BigInt('996000000000000000000');
      const expectedFee = BigInt('4000000000000000000'); // 4 ETH
      expect(netAmount).toBe(expectedNet);
      expect(fee).toBe(expectedFee);
    });

    it('deve retornar 0 para valor zero', () => {
      const amount = BigInt('0');
      const { netAmount, fee } = calculateNetAmount(amount);
      expect(netAmount).toBe(BigInt('0'));
      expect(fee).toBe(BigInt('0'));
    });
  });
});

