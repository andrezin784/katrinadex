# 🚀 Guia Rápido: Teste no Vercel Preview

## ⚡ Passo a Passo (5 minutos)

### 1. Fazer Push da Branch

```bash
# Certifique-se de estar na branch feat/edge-trm-check
git push origin feat/edge-trm-check
```

**OU use o script automatizado:**

```bash
./scripts/deploy-vercel-preview.sh
```

### 2. Aguardar Preview Deployment

O Vercel **automaticamente** cria um Preview Deployment!

- Acesse: https://vercel.com/dashboard
- Selecione o projeto `katrinadex`
- Veja o deployment da branch `feat/edge-trm-check`

### 3. Configurar Variáveis de Ambiente

No Vercel Dashboard:

1. **Settings** → **Environment Variables**
2. Adicione:
   ```
   NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE=true
   ```
3. Selecione: ✅ **Preview** e ✅ **Production**
4. Clique em **Save**

### 4. Testar Edge Function

Substitua `YOUR_PREVIEW_URL` pela URL do Preview:

```bash
curl https://YOUR_PREVIEW_URL/api/trm-check \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"address":"0x1234567890123456789012345678901234567890"}'
```

**Resultado esperado:**
```json
{"allowed":true,"riskLevel":"low","cached":false}
```

### 5. Testar no Frontend

1. Acesse a URL do Preview Deployment
2. Vá para `/withdraw`
3. Faça um withdraw
4. Deve mostrar "Checking compliance..."
5. Abra o console (F12) para ver logs

## ✅ Se Tudo Funcionar

```bash
# Fazer merge para main
git checkout main
git merge feat/edge-trm-check
git push origin main
```

## 🐛 Problemas?

Veja: `docs/TESTE_VERCEL.md` para troubleshooting completo.

