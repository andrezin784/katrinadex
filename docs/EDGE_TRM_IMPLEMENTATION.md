# Edge Function TRM - Implementação

## 📋 Resumo

Implementação de Edge Function Vercel para pré-check TRM (Transaction Risk Management) antes de processar transações no relayer. Esta feature adiciona verificação de compliance sem impacto significativo na latência (<200ms).

## 🎯 Objetivos

- ✅ Verificação de endereços contra listas de sanções antes do withdraw
- ✅ Feature flag para habilitar/desabilitar sem deploy
- ✅ Baixa latência (<200ms) via Edge Functions
- ✅ Fail-open por padrão (configurável para fail-closed)
- ✅ Cache de resultados (5 minutos)

## 📁 Arquivos Implementados

### 1. Edge Function
- **`app/src/app/api/trm-check/route.ts`**
  - Runtime: Edge (Vercel Edge Functions)
  - Métodos: POST e GET
  - Cache: 5 minutos
  - Rate limiting: Básico via IP

### 2. Cliente TypeScript
- **`app/src/lib/trmCheck.ts`**
  - Função `checkAddressTRM()`: Verifica um endereço
  - Função `checkAddressesTRM()`: Verifica múltiplos endereços em paralelo
  - Tratamento de erros com fail-open/fail-closed

### 3. Integração no Frontend
- **`app/src/app/withdraw/page.tsx`**
  - Verificação TRM antes de `handleWithdraw()` (normal)
  - Verificação TRM antes de `handleGaslessWithdraw()` (gasless)
  - Mensagens de erro amigáveis

### 4. Testes
- **`app/src/app/api/trm-check/__tests__/route.test.ts`**
- **`app/src/lib/__tests__/trmCheck.test.ts`**

## 🔧 Configuração

### Variáveis de Ambiente

Adicione ao `.env.local` (ou configure no Vercel):

```bash
# Feature Flag - Habilita/desabilita verificação TRM
NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE=false

# TRM API Configuration (opcional - mock por padrão)
# Para usar API real do TRM Labs:
# TRM_API_KEY=your_trm_api_key_here
# TRM_API_URL=https://api.trmlabs.com/v1

# Comportamento em caso de erro
# true = bloqueia transações em caso de erro (fail-closed)
# false = permite transações em caso de erro (fail-open)
NEXT_PUBLIC_TRM_FAIL_CLOSED=false
```

### Feature Flag

Por padrão, a verificação TRM está **desabilitada** (`NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE=false`).

Para habilitar:
1. Configure `NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE=true` no Vercel
2. Faça redeploy (ou reinicie `npm run dev` localmente)

## 🧪 Testes

### Teste Manual

```bash
# Teste local (com feature flag desabilitado)
curl http://localhost:3000/api/trm-check \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"address":"0x1234567890123456789012345678901234567890"}'

# Resposta esperada (com flag desabilitado):
# {"allowed":true,"riskLevel":"low","reason":"TRM check disabled via feature flag"}
```

### Teste Automatizado

```bash
# Instalar dependências de teste (se necessário)
cd app
npm install -D vitest @vitest/ui

# Executar testes
npm test
```

## 📊 Fluxo de Verificação

```
User clicks "Withdraw"
    ↓
checkAddressTRM() called
    ↓
Feature flag check
    ↓ (if enabled)
POST /api/trm-check
    ↓
Edge Function:
  - Valida endereço
  - Verifica cache (5min TTL)
  - Chama TRM API (mock por padrão)
  - Retorna resultado
    ↓
Frontend:
  - Se blocked → mostra erro
  - Se allowed → continua com withdraw
```

## 🔒 Segurança

### Fail-Open vs Fail-Closed

- **Fail-Open (padrão)**: Em caso de erro na API TRM, permite a transação
  - Útil para evitar bloqueios por problemas de infraestrutura
  - Configurar via `NEXT_PUBLIC_TRM_FAIL_CLOSED=false`

- **Fail-Closed**: Em caso de erro, bloqueia a transação
  - Mais seguro, mas pode bloquear transações legítimas
  - Configurar via `NEXT_PUBLIC_TRM_FAIL_CLOSED=true`

### Rate Limiting

A Edge Function implementa rate limiting básico por IP (10 requisições/minuto). Para produção, considere usar:
- Vercel Edge Config
- Upstash Redis
- Cloudflare Rate Limiting

## 🚀 Deploy

### Vercel

1. A Edge Function será automaticamente deployada com o projeto
2. Configure as variáveis de ambiente no Vercel Dashboard
3. A função roda em Edge Runtime (baixa latência global)

### Limitações

⚠️ **Importante**: O projeto está configurado com `output: 'export'` para IPFS. Isso significa:
- Edge Functions **não funcionam** no build estático local
- Edge Functions **funcionam apenas** quando deployado no Vercel
- Para testar localmente, use `npm run dev` (não `npm run build`)

## 📈 Métricas Esperadas

- **Latência**: <200ms (Edge Function)
- **Cache Hit Rate**: ~60-80% (endereços repetidos)
- **False Positives**: <0.1% (com API real do TRM)
- **Impacto no UX**: Mínimo (verificação assíncrona)

## 🔄 Próximos Passos

1. **Integração com API Real do TRM Labs**
   - Substituir mock em `checkAddressWithTRM()`
   - Adicionar autenticação via `TRM_API_KEY`

2. **Melhorias de Cache**
   - Usar Vercel Edge Config ou Upstash Redis
   - Cache distribuído globalmente

3. **Monitoramento**
   - Logs estruturados (Vercel Logs ou Datadog)
   - Alertas para alta taxa de bloqueios

4. **Testes de Regressão**
   - Verificar que tempo de prova ZK não aumentou
   - Verificar que gas costs não aumentaram

## 🐛 Troubleshooting

### "TRM check disabled"
- Verifique `NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE=true` no `.env.local` ou Vercel

### "Network error" em produção
- Verifique se a Edge Function está deployada no Vercel
- Verifique logs do Vercel para erros

### Cache não funcionando
- Edge Functions são stateless, cache é em memória
- Para cache persistente, use Vercel Edge Config ou Redis

## ✅ Checklist de Verificação

- [x] Edge Function implementada
- [x] Cliente TypeScript criado
- [x] Integração no fluxo de withdraw
- [x] Feature flag configurado
- [x] Testes básicos adicionados
- [x] Documentação completa
- [ ] Integração com API real do TRM (opcional)
- [ ] Monitoramento e alertas (opcional)

## 📝 Notas de Implementação

- A implementação atual usa **mock** da API TRM
- Para produção, substituir `checkAddressWithTRM()` por chamada real
- Cache em memória é efêmero (Edge Functions são stateless)
- Considerar usar Vercel Edge Config para cache persistente

