/**
 * Edge Function para pré-check TRM (Transaction Risk Management)
 * 
 * Esta função verifica endereços contra listas de sanções e riscos
 * antes de processar transações no relayer.
 * 
 * Feature Flag: NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE
 * 
 * @module api/trm-check
 */

import { NextRequest, NextResponse } from 'next/server';

// Runtime Edge para baixa latência
export const runtime = 'edge';
export const maxDuration = 10; // 10 segundos máximo

// Feature flag check
const ENABLE_TRM_CHECK = process.env.NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE === 'true';

// TRM API configuration (mock para desenvolvimento, substituir por API real)
const TRM_API_KEY = process.env.TRM_API_KEY || '';
const TRM_API_URL = process.env.TRM_API_URL || 'https://api.trmlabs.com/v1';

// Cache simples em memória (Edge Functions são stateless, mas útil para rate limiting)
const cache = new Map<string, { result: boolean; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

interface TRMCheckRequest {
  address: string;
  chainId?: number;
  amount?: string;
}

interface TRMCheckResponse {
  allowed: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'blocked';
  reason?: string;
  cached?: boolean;
}

/**
 * Verifica endereço contra TRM Labs API
 * Em produção, substituir por chamada real à API TRM
 */
async function checkAddressWithTRM(address: string, chainId?: number): Promise<TRMCheckResponse> {
  // Se feature flag desabilitado, retorna permitido
  if (!ENABLE_TRM_CHECK) {
    return {
      allowed: true,
      riskLevel: 'low',
      reason: 'TRM check disabled via feature flag',
    };
  }

  // Validação básica de endereço
  if (!address || !address.startsWith('0x') || address.length !== 42) {
    return {
      allowed: false,
      riskLevel: 'blocked',
      reason: 'Invalid address format',
    };
  }

  // Verificar cache
  const cacheKey = `${address}:${chainId || 'default'}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return {
      allowed: cached.result,
      riskLevel: cached.result ? 'low' : 'blocked',
      cached: true,
    };
  }

  // Mock TRM check (substituir por chamada real)
  // Em produção, usar: fetch(`${TRM_API_URL}/addresses/${address}`, { headers: { 'X-API-KEY': TRM_API_KEY } })
  try {
    // Simulação de verificação TRM
    // Lista de endereços conhecidos como bloqueados (mock)
    const blockedAddresses = [
      '0x0000000000000000000000000000000000000000', // Endereço zero
      // Adicionar mais endereços bloqueados conforme necessário
    ];

    const isBlocked = blockedAddresses.includes(address.toLowerCase());

    // Simular delay de API (50-200ms)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 150 + 50));

    const result: TRMCheckResponse = {
      allowed: !isBlocked,
      riskLevel: isBlocked ? 'blocked' : 'low',
      reason: isBlocked ? 'Address found in sanctions list' : undefined,
    };

    // Atualizar cache
    cache.set(cacheKey, {
      result: result.allowed,
      timestamp: Date.now(),
    });

    return result;
  } catch (error) {
    // Em caso de erro na API, permitir por padrão (fail-open)
    // Em produção, pode-se configurar fail-closed via env var
    const failClosed = process.env.TRM_FAIL_CLOSED === 'true';
    
    return {
      allowed: !failClosed,
      riskLevel: failClosed ? 'blocked' : 'low',
      reason: `TRM API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * POST /api/trm-check
 * 
 * Verifica um endereço contra listas de sanções TRM
 * 
 * Body: { address: string, chainId?: number, amount?: string }
 * Response: { allowed: boolean, riskLevel: string, reason?: string }
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limiting básico (Edge Functions são stateless, mas útil)
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    // Parse request body
    const body: TRMCheckRequest = await req.json();
    const { address, chainId, amount } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    // Verificar endereço
    const checkResult = await checkAddressWithTRM(address, chainId);

    // Log para monitoramento (em produção, usar serviço de logging)
    console.log('[TRM Check]', {
      address,
      chainId,
      allowed: checkResult.allowed,
      riskLevel: checkResult.riskLevel,
      cached: checkResult.cached,
      ip,
    });

    return NextResponse.json(checkResult, {
      status: checkResult.allowed ? 200 : 403,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('[TRM Check Error]', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        allowed: false,
        riskLevel: 'blocked',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/trm-check?address=0x...
 * 
 * Versão GET para verificação simples (sem body)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    const chainId = searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : undefined;

    if (!address) {
      return NextResponse.json(
        { error: 'Address query parameter is required' },
        { status: 400 }
      );
    }

    const checkResult = await checkAddressWithTRM(address, chainId);

    return NextResponse.json(checkResult, {
      status: checkResult.allowed ? 200 : 403,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('[TRM Check Error]', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        allowed: false,
        riskLevel: 'blocked',
      },
      { status: 500 }
    );
  }
}

