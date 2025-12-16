import { describe, it, expect } from 'vitest';
import {
  calculateGaslessFee,
  calculateFinalAmount,
  getGaslessRelayerDomain,
  createWithdrawGaslessTypedData,
} from '@/lib/eip712';

describe('EIP-712 Utils', () => {
  describe('calculateGaslessFee', () => {
    it('deve calcular fee de 0.4% corretamente', () => {
      const amount = BigInt('1000000000000000000'); // 1 ETH
      const fee = calculateGaslessFee(amount);
      
      // 0.4% = 40/10000 = 0.004
      // 1 ETH * 0.004 = 0.004 ETH = 4000000000000000 wei
      expect(fee).toBe(BigInt('4000000000000000'));
    });

    it('deve calcular corretamente para valores pequenos', () => {
      const amount = BigInt('1000000');
      const fee = calculateGaslessFee(amount);
      expect(fee).toBe(BigInt('4000')); // 0.4% de 1000000
    });

    it('deve retornar 0 para valor zero', () => {
      expect(calculateGaslessFee(BigInt('0'))).toBe(BigInt('0'));
    });
  });

  describe('calculateFinalAmount', () => {
    it('deve calcular fees totais corretamente', () => {
      const poolAmount = BigInt('1000000000000000000'); // 1 ETH
      const result = calculateFinalAmount(poolAmount);
      
      // Mixer fee: 0.3% = 3000000000000000 wei
      expect(result.mixerFee).toBe(BigInt('3000000000000000'));
      
      // Gasless fee: 0.4% = 4000000000000000 wei
      expect(result.gaslessFee).toBe(BigInt('4000000000000000'));
      
      // Final: 1 ETH - 0.003 ETH - 0.004 ETH = 0.993 ETH
      expect(result.finalAmount).toBe(BigInt('993000000000000000'));
    });

    it('deve calcular corretamente para valores grandes', () => {
      const poolAmount = BigInt('1000000000000000000000'); // 1000 ETH
      const result = calculateFinalAmount(poolAmount);
      
      // Mixer fee: 3 ETH
      expect(result.mixerFee).toBe(BigInt('3000000000000000000'));
      
      // Gasless fee: 4 ETH
      expect(result.gaslessFee).toBe(BigInt('4000000000000000000'));
      
      // Final: 993 ETH
      expect(result.finalAmount).toBe(BigInt('993000000000000000000'));
    });

    it('deve retornar valores zero para amount zero', () => {
      const result = calculateFinalAmount(BigInt('0'));
      expect(result.mixerFee).toBe(BigInt('0'));
      expect(result.gaslessFee).toBe(BigInt('0'));
      expect(result.finalAmount).toBe(BigInt('0'));
    });
  });

  describe('getGaslessRelayerDomain', () => {
    it('deve criar domain EIP-712 correto', () => {
      const domain = getGaslessRelayerDomain(5042002, '0x1234567890123456789012345678901234567890');
      
      expect(domain.name).toBe('KatrinaDEXGaslessRelayer');
      expect(domain.version).toBe('1');
      expect(domain.chainId).toBe(5042002);
      expect(domain.verifyingContract).toBe('0x1234567890123456789012345678901234567890');
    });
  });

  describe('createWithdrawGaslessTypedData', () => {
    it('deve criar typed data correto', () => {
      const message = {
        to: '0x1234567890123456789012345678901234567890',
        poolAmount: BigInt('1000000000000000000'),
        poolIndex: BigInt('0'),
        token: '0x0000000000000000000000000000000000000000',
        nonce: BigInt('1'),
        deadline: BigInt('1735689600'),
      };

      const typedData = createWithdrawGaslessTypedData(
        5042002,
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        message
      );

      expect(typedData.domain.name).toBe('KatrinaDEXGaslessRelayer');
      expect(typedData.primaryType).toBe('WithdrawGasless');
      expect(typedData.message.to).toBe(message.to);
      expect(typedData.message.poolAmount).toBe(message.poolAmount);
      expect(typedData.message.poolIndex).toBe(message.poolIndex);
      expect(typedData.message.token).toBe(message.token);
      expect(typedData.message.nonce).toBe(message.nonce);
      expect(typedData.message.deadline).toBe(message.deadline);
    });
  });
});

