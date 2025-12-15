/**
 * Cliente para verificação TRM (Transaction Risk Management)
 * 
 * Integração com Edge Function para pré-check de endereços
 * antes de processar transações.
 * 
 * @module lib/trmCheck
 */

export interface TRMCheckResult {
  allowed: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'blocked';
  reason?: string;
  cached?: boolean;
}

export interface TRMCheckOptions {
  address: string;
  chainId?: number;
  amount?: string;
}

/**
 * Verifica um endereço contra listas de sanções TRM
 * 
 * @param options - Opções de verificação
 * @returns Resultado da verificação TRM
 */
export async function checkAddressTRM(options: TRMCheckOptions): Promise<TRMCheckResult> {
  const { address, chainId, amount } = options;

  // Verificar feature flag
  const enabled = process.env.NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE === 'true';
  
  if (!enabled) {
    // Se desabilitado, retorna permitido
    return {
      allowed: true,
      riskLevel: 'low',
      reason: 'TRM check disabled',
    };
  }

  try {
    const response = await fetch('/api/trm-check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        chainId,
        amount,
      }),
    });

    if (!response.ok) {
      // Se erro, assumir bloqueado por segurança (fail-closed)
      return {
        allowed: false,
        riskLevel: 'blocked',
        reason: `TRM check failed: ${response.statusText}`,
      };
    }

    const result: TRMCheckResult = await response.json();
    return result;
  } catch (error) {
    console.error('[TRM Check Error]', error);
    
    // Em caso de erro de rede, permitir por padrão (fail-open)
    // Pode ser configurado para fail-closed via env var
    const failClosed = process.env.NEXT_PUBLIC_TRM_FAIL_CLOSED === 'true';
    
    return {
      allowed: !failClosed,
      riskLevel: failClosed ? 'blocked' : 'low',
      reason: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Verifica múltiplos endereços em paralelo
 * 
 * @param addresses - Array de endereços para verificar
 * @param chainId - ID da chain (opcional)
 * @returns Array de resultados
 */
export async function checkAddressesTRM(
  addresses: string[],
  chainId?: number
): Promise<TRMCheckResult[]> {
  const checks = addresses.map(address => 
    checkAddressTRM({ address, chainId })
  );
  
  return Promise.all(checks);
}

