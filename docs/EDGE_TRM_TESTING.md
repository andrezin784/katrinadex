# Testes e Verificação de Regressão - Edge Function TRM

## 🧪 Testes Unitários

### Executar Testes

```bash
cd app
npm test
```

### Cobertura Esperada

- ✅ Feature flag desabilitado → permite todas as transações
- ✅ Feature flag habilitado → verifica endereços
- ✅ Endereço inválido → bloqueia
- ✅ Endereço bloqueado → retorna erro
- ✅ Erro de rede → fail-open (ou fail-closed se configurado)

## 📊 Verificação de Regressão

### 1. Tempo de Prova ZK

**Antes da implementação:**
- Tempo médio de geração de prova: ~2-3s

**Após implementação:**
- Tempo médio de geração de prova: ~2-3s (sem mudança)
- Verificação TRM: <200ms (assíncrona, não bloqueia)

**Como verificar:**
```bash
# No console do navegador, durante um withdraw:
console.time('zk-proof');
// ... geração de prova ...
console.timeEnd('zk-proof');

# Deve ser < 5s (requisito original)
```

### 2. Gas Costs

**Antes da implementação:**
- Gas médio de withdraw: ~XXX gas (verificar no contrato)

**Após implementação:**
- Gas médio de withdraw: ~XXX gas (sem mudança)
- Verificação TRM: 0 gas (off-chain)

**Como verificar:**
```bash
# No console do navegador, após transação:
console.log('Gas used:', receipt.gasUsed);

# Deve ser < 100k gas (requisito original)
```

### 3. Latência do Frontend

**Antes da implementação:**
- Tempo até mostrar "Preparing withdrawal...": <100ms

**Após implementação:**
- Tempo até mostrar "Checking compliance...": <100ms
- Tempo de verificação TRM: <200ms
- Tempo total até "Preparing withdrawal...": <300ms

**Como verificar:**
```bash
# No console do navegador:
console.time('withdraw-start');
// ... clicar em withdraw ...
console.timeEnd('withdraw-start');

# Deve ser < 500ms (aceitável)
```

### 4. Teste de Integração Completo

```bash
# 1. Desabilitar feature flag
NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE=false

# 2. Fazer withdraw normal
# - Deve funcionar normalmente
# - Sem delay adicional

# 3. Habilitar feature flag
NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE=true

# 4. Fazer withdraw com endereço válido
# - Deve mostrar "Checking compliance..." brevemente
# - Deve continuar normalmente

# 5. Fazer withdraw com endereço bloqueado (mock)
# - Deve mostrar erro: "Address blocked"
# - Não deve processar transação
```

## 🔍 Checklist de Verificação

Antes de considerar a implementação completa:

- [ ] Testes unitários passando
- [ ] Tempo de prova ZK < 5s
- [ ] Gas costs < 100k
- [ ] Latência total < 500ms
- [ ] Feature flag funciona (on/off)
- [ ] Erros são tratados corretamente
- [ ] Cache funciona (5min TTL)
- [ ] Rate limiting funciona

## 🐛 Problemas Conhecidos

### Edge Functions não funcionam localmente

**Problema:** Com `output: 'export'`, Edge Functions só funcionam no Vercel.

**Solução:** 
- Testar localmente com `npm run dev` (não `npm run build`)
- Ou testar diretamente no Vercel após deploy

### Cache não persiste

**Problema:** Edge Functions são stateless, cache é em memória.

**Solução:**
- Aceitar cache efêmero (5min TTL)
- Ou migrar para Vercel Edge Config/Redis (futuro)

## 📈 Métricas de Sucesso

- ✅ Zero regressão em tempo de prova ZK
- ✅ Zero regressão em gas costs
- ✅ Latência adicional < 300ms
- ✅ Taxa de erro < 0.1%
- ✅ Cache hit rate > 60%

