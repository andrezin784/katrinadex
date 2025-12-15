/**
 * Testes básicos para Edge Function TRM Check
 * 
 * Execute com: npm test (após configurar Jest/Vitest)
 * Ou teste manualmente via curl/Postman
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST, GET } from '../route';
import { NextRequest } from 'next/server';

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  vi.resetModules();
  process.env = { ...originalEnv };
});

describe('TRM Check Edge Function', () => {
  it('should allow address when feature flag is disabled', async () => {
    process.env.NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE = 'false';

    const req = new NextRequest('http://localhost/api/trm-check', {
      method: 'POST',
      body: JSON.stringify({ address: '0x1234567890123456789012345678901234567890' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.allowed).toBe(true);
    expect(data.riskLevel).toBe('low');
  });

  it('should block invalid address format', async () => {
    process.env.NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE = 'true';

    const req = new NextRequest('http://localhost/api/trm-check', {
      method: 'POST',
      body: JSON.stringify({ address: 'invalid-address' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.allowed).toBe(false);
    expect(data.riskLevel).toBe('blocked');
  });

  it('should require address parameter', async () => {
    const req = new NextRequest('http://localhost/api/trm-check', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Address is required');
  });

  it('should support GET method with query params', async () => {
    process.env.NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE = 'false';

    const req = new NextRequest('http://localhost/api/trm-check?address=0x1234567890123456789012345678901234567890');

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.allowed).toBe(true);
  });
});

