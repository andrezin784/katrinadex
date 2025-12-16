# 🚀 Teste Rápido - Edge Function TRM

## ⚡ Teste em 3 Passos (5 minutos)

### Passo 1: Iniciar o Servidor Dev

Abra um terminal e execute:

```bash
cd app
npm run dev
```

Aguarde até ver:
```
✓ Ready in X seconds
○ Local: http://localhost:3000
```

**⚠️ IMPORTANTE:** O servidor deve estar rodando para testar a Edge Function!

---

### Passo 2: Testar a Edge Function (via Terminal)

Abra um **NOVO terminal** (deixe o servidor rodando) e execute:

```bash
# Teste básico - deve retornar "allowed: true"
curl http://localhost:3000/api/trm-check \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"address":"0x1234567890123456789012345678901234567890"}'
```

**Resultado esperado:**
```json
{"allowed":true,"riskLevel":"low","reason":"TRM check disabled via feature flag"}
```

✅ Se você viu isso, a Edge Function está funcionando!

---

### Passo 3: Testar no Frontend

1. Abra o navegador: http://localhost:3000/withdraw
2. Conecte sua wallet
3. Cole uma note válida e clique em "Verify Note"
4. Digite um endereço de destino
5. Clique em "Withdraw"

**Resultado esperado:**
- ✅ Deve funcionar normalmente
- ✅ Não deve mostrar "Checking compliance..." (feature flag desabilitado por padrão)

---

## 🔧 Teste Avançado (com Feature Flag Habilitado)

### Habilitar Feature Flag

No terminal (onde está o servidor dev), pare o servidor (Ctrl+C) e execute:

```bash
cd app
echo "NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE=true" > .env.local
npm run dev
```

### Testar Novamente

1. **Via curl:**
```bash
curl http://localhost:3000/api/trm-check \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"address":"0x1234567890123456789012345678901234567890"}'
```

Agora deve retornar:
```json
{"allowed":true,"riskLevel":"low","cached":false}
```

2. **No frontend:**
- Acesse: http://localhost:3000/withdraw
- Faça um withdraw
- Deve mostrar "Checking compliance..." brevemente
- Abra o console (F12) para ver logs TRM

---

## 🧪 Script de Teste Automatizado

Execute o script de teste:

```bash
./scripts/test-trm.sh
```

Este script testa:
- ✅ Servidor está rodando
- ✅ Edge Function responde
- ✅ Endereço inválido é bloqueado
- ✅ Endereço bloqueado (mock) é bloqueado
- ✅ Método GET funciona
- ✅ Configuração de feature flag

---

## 🐛 Problemas Comuns

### "Cannot GET /api/trm-check"

**Solução:**
```bash
# Parar servidor (Ctrl+C)
cd app
rm -rf .next
npm run dev
```

### "Connection refused"

**Solução:** O servidor dev não está rodando. Execute:
```bash
cd app
npm run dev
```

### Feature flag não funciona

**Solução:**
```bash
# Verificar se .env.local existe:
cat app/.env.local

# Se não existir, criar:
echo "NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE=true" > app/.env.local

# Reiniciar servidor
```

---

## ✅ Checklist de Teste

- [ ] Servidor dev rodando (`npm run dev`)
- [ ] Edge Function responde via curl
- [ ] Frontend funciona normalmente
- [ ] Feature flag habilitado → mostra "Checking compliance..."
- [ ] Console do navegador mostra logs TRM

---

## 📚 Documentação Completa

Para mais detalhes, veja:
- `docs/COMO_TESTAR_TRM.md` - Guia completo
- `docs/EDGE_TRM_IMPLEMENTATION.md` - Documentação técnica
- `docs/EDGE_TRM_TESTING.md` - Testes de regressão

