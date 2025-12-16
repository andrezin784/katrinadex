import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock do fetch
global.fetch = vi.fn();

// Mock do process.env
const originalEnv = process.env;

describe('TRM Check', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Resetar env vars
    process.env = { ...originalEnv };
    // Habilitar TRM check para os testes
    process.env.NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE = 'true';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('deve fazer requisição para API de TRM check', async () => {
    const mockResponse = {
      allowed: true,
      riskLevel: 'low',
      reason: 'Address is safe',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    // Importar dinamicamente para usar o mock
    const { checkAddressTRM } = await import('@/lib/trmCheck');
    
    const result = await checkAddressTRM({
      address: '0x1234567890123456789012345678901234567890',
      chainId: 5042002,
    });
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/trm-check'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
    
    expect(result).toEqual(mockResponse);
  });

  it('deve tratar erro quando API falha', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const { checkAddressTRM } = await import('@/lib/trmCheck');
    
    // Com fail-closed desabilitado, deve retornar allowed: true
    const result = await checkAddressTRM({
      address: '0x1234567890123456789012345678901234567890',
      chainId: 5042002,
    });
    
    expect(result.allowed).toBe(true);
    expect(result.riskLevel).toBe('low');
  });

  it('deve retornar allowed: false para endereços bloqueados', async () => {
    const mockResponse = {
      allowed: false,
      riskLevel: 'blocked',
      reason: 'Address is on sanctions list',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { checkAddressTRM } = await import('@/lib/trmCheck');
    const result = await checkAddressTRM({
      address: '0x1234567890123456789012345678901234567890',
      chainId: 5042002,
    });
    
    expect(result.allowed).toBe(false);
    expect(result.riskLevel).toBe('blocked');
  });
});

