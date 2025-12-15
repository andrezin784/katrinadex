/**
 * Testes para cliente TRM Check
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkAddressTRM, checkAddressesTRM } from '../trmCheck';

// Mock fetch
global.fetch = vi.fn();

describe('TRM Check Client', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('should return allowed when feature flag is disabled', async () => {
    process.env.NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE = 'false';

    const result = await checkAddressTRM({
      address: '0x1234567890123456789012345678901234567890',
    });

    expect(result.allowed).toBe(true);
    expect(result.riskLevel).toBe('low');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should call API when feature flag is enabled', async () => {
    process.env.NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE = 'true';

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        allowed: true,
        riskLevel: 'low',
      }),
    });

    const result = await checkAddressTRM({
      address: '0x1234567890123456789012345678901234567890',
      chainId: 84532,
    });

    expect(fetch).toHaveBeenCalledWith(
      '/api/trm-check',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );

    expect(result.allowed).toBe(true);
  });

  it('should handle API errors gracefully', async () => {
    process.env.NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE = 'true';
    process.env.NEXT_PUBLIC_TRM_FAIL_CLOSED = 'false';

    (fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const result = await checkAddressTRM({
      address: '0x1234567890123456789012345678901234567890',
    });

    // Fail-open: permite em caso de erro
    expect(result.allowed).toBe(true);
    expect(result.reason).toContain('Network error');
  });

  it('should check multiple addresses in parallel', async () => {
    process.env.NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE = 'true';

    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        allowed: true,
        riskLevel: 'low',
      }),
    });

    const addresses = [
      '0x1111111111111111111111111111111111111111',
      '0x2222222222222222222222222222222222222222',
    ];

    const results = await checkAddressesTRM(addresses, 84532);

    expect(results).toHaveLength(2);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

