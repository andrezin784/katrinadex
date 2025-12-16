# 🧪 Como Testar a Edge Function TRM

## 📋 Pré-requisitos

1. Node.js instalado
2. Dependências instaladas: `cd app && npm install`
3. Servidor dev rodando: `npm run dev`

## 🚀 Teste Rápido (5 minutos)

### 1. Verificar se o servidor está rodando

```bash
cd app
npm run dev
```

Acesse: http://localhost:3000

### 2. Testar Edge Function diretamente (via curl)

Abra um **novo terminal** e execute:

```bash
# Teste 1: Feature flag DESABILITADO (padrão)
curl http://localhost:3000/api/trm-check \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"address":"0x1234567890123456789012345678901234567890"}'

# Resposta esperada:
# {"allowed":true,"riskLevel":"low","reason":"TRM check disabled via feature flag"}
```

```bash
# Teste 2: Via GET (query params)
curl "http://localhost:3000/api/trm-check?address=0x1234567890123456789012345678901234567890"

# Resposta esperada:
# {"allowed":true,"riskLevel":"low","reason":"TRM check disabled via feature flag"}
```

### 3. Testar no Frontend (com feature flag desabilitado)

1. Acesse: http://localhost:3000/withdraw
2. Conecte sua wallet
3. Cole uma note válida
4. Clique em "Verify Note"
5. Digite um endereço de destino
6. Clique em "Withdraw"

**Resultado esperado:**
- ✅ Deve funcionar normalmente
- ✅ Não deve mostrar "Checking compliance..." (feature flag desabilitado)
- ✅ Withdraw deve processar normalmente

### 4. Habilitar Feature Flag e Testar Novamente

**Passo 1:** Criar arquivo `.env.local` na pasta `app/`:

```bash
cd app
echo "NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE=true" > .env.local
```

**Passo 2:** Reiniciar o servidor dev:

```bash
# Parar o servidor (Ctrl+C)
# Reiniciar:
npm run dev
```

**Passo 3:** Testar Edge Function novamente:

```bash
curl http://localhost:3000/api/trm-check \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"address":"0x1234567890123456789012345678901234567890"}'

# Resposta esperada (com feature flag habilitado):
# {"allowed":true,"riskLevel":"low","cached":false}
```

**Passo 4:** Testar no Frontend:

1. Acesse: http://localhost:3000/withdraw
2. Conecte sua wallet
3. Cole uma note válida
4. Clique em "Verify Note"
5. Digite um endereço de destino
6. Clique em "Withdraw"

**Resultado esperado:**
- ✅ Deve mostrar "Checking compliance..." brevemente
- ✅ Deve continuar com o withdraw normalmente
- ✅ No console do navegador (F12), deve aparecer log de verificação TRM

### 5. Testar Endereço Bloqueado (Mock)

A Edge Function tem um mock que bloqueia o endereço zero. Teste:

```bash
curl http://localhost:3000/api/trm-check \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"address":"0x0000000000000000000000000000000000000000"}'

# Resposta esperada:
# {"allowed":false,"riskLevel":"blocked","reason":"Address found in sanctions list"}
```

No frontend, se você tentar fazer withdraw para `0x0000000000000000000000000000000000000000`:
- ❌ Deve mostrar erro: "Address blocked: Address found in sanctions list"

## 🔍 Verificações no Console do Navegador

1. Abra o DevTools (F12)
2. Vá para a aba "Console"
3. Faça um withdraw
4. Procure por logs:

```
🔍 Gasless Relayer Debug: {...}
[TRM Check] {...}
```

## 📊 Teste de Performance

### Verificar Latência

No console do navegador, durante um withdraw:

```javascript
// O código já tem logs, mas você pode adicionar:
console.time('trm-check');
// ... fazer withdraw ...
console.timeEnd('trm-check');

// Deve ser < 300ms
```

### Verificar Cache

1. Faça um withdraw para um endereço
2. Faça outro withdraw para o mesmo endereço
3. No segundo, deve aparecer `"cached": true` na resposta

## 🐛 Troubleshooting

### Erro: "Cannot GET /api/trm-check"

**Causa:** Servidor dev não está rodando ou Next.js não reconheceu a rota.

**Solução:**
```bash
# Parar servidor (Ctrl+C)
cd app
rm -rf .next
npm run dev
```

### Erro: "TRM check disabled"

**Causa:** Feature flag não está habilitado.

**Solução:**
```bash
# Verificar se .env.local existe:
cat app/.env.local

# Deve conter:
# NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE=true

# Se não existir, criar:
echo "NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE=true" > app/.env.local

# Reiniciar servidor
```

### Edge Function não funciona no build estático

**Causa:** O projeto está configurado com `output: 'export'` para IPFS.

**Solução:** 
- Edge Functions **só funcionam** com `npm run dev` (não com `npm run build`)
- Para produção, deploy no Vercel (Edge Functions funcionam lá)

## ✅ Checklist de Testes

- [ ] Servidor dev rodando (`npm run dev`)
- [ ] Edge Function responde via curl (GET e POST)
- [ ] Feature flag desabilitado → withdraw funciona normalmente
- [ ] Feature flag habilitado → mostra "Checking compliance..."
- [ ] Endereço bloqueado → mostra erro
- [ ] Console do navegador mostra logs TRM
- [ ] Latência < 300ms
- [ ] Cache funciona (segunda requisição mostra `cached: true`)

## 🎯 Próximo Passo

Após confirmar que tudo funciona localmente:

1. Fazer merge da branch `feat/edge-trm-check` para `main`
2. Deploy no Vercel
3. Configurar variáveis de ambiente no Vercel Dashboard
4. Testar em produção

