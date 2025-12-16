# 🚀 Teste no Vercel (Preview Deployment)

## 📋 Objetivo

Testar a Edge Function TRM no Vercel **antes** de fazer merge para `main`. Isso garante que tudo funciona em produção antes de integrar.

## 🔧 Passo 1: Push da Branch para GitHub

```bash
# Certifique-se de estar na branch feat/edge-trm-check
git branch --show-current  # Deve mostrar: feat/edge-trm-check

# Fazer push da branch
git push origin feat/edge-trm-check
```

## 🌐 Passo 2: Configurar Preview Deployment no Vercel

### Opção A: Automático (Recomendado)

Se o Vercel já está conectado ao GitHub, ele **automaticamente** cria um Preview Deployment para cada branch!

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto `katrinadex`
3. Vá em **Settings** → **Git**
4. Certifique-se que está configurado para:
   - **Production Branch**: `main`
   - **Preview Deployments**: Habilitado ✅

### Opção B: Manual (se necessário)

Se não criar automaticamente:

1. Acesse: https://vercel.com/dashboard
2. Clique em **Add New Project**
3. Conecte o repositório `andrezin784/katrinadex`
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `app`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `.next`

## ⚙️ Passo 3: Configurar Variáveis de Ambiente no Vercel

1. No Vercel Dashboard, vá em **Settings** → **Environment Variables**
2. Adicione as variáveis:

```bash
# Feature Flag - Habilite para testar
NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE=true

# Opcional: Comportamento em erro
NEXT_PUBLIC_TRM_FAIL_CLOSED=false
```

3. Selecione os ambientes:
   - ✅ **Preview** (para testar na branch)
   - ✅ **Production** (para quando fizer merge)

4. Clique em **Save**

## 🔄 Passo 4: Trigger Deploy

### Opção A: Automático

Após o push, o Vercel **automaticamente** cria um Preview Deployment!

Você verá:
- 🔄 "Building..." 
- ✅ "Ready" com URL: `https://katrinadex-xxx.vercel.app`

### Opção B: Manual

1. No Vercel Dashboard, vá em **Deployments**
2. Clique em **Redeploy** → **Use existing Build Cache**
3. Ou faça um novo commit (mesmo vazio):

```bash
git commit --allow-empty -m "trigger: Vercel preview deploy"
git push origin feat/edge-trm-check
```

## 🧪 Passo 5: Testar a Edge Function no Vercel

### Teste 1: Edge Function via curl

Substitua `YOUR_PREVIEW_URL` pela URL do Preview Deployment:

```bash
# Exemplo: https://katrinadex-git-feat-edge-trm-check-andrezin784.vercel.app
curl https://YOUR_PREVIEW_URL/api/trm-check \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"address":"0x1234567890123456789012345678901234567890"}'
```

**Resultado esperado:**
```json
{"allowed":true,"riskLevel":"low","cached":false}
```

### Teste 2: Frontend no Vercel

1. Acesse a URL do Preview Deployment
2. Vá para: `/withdraw`
3. Conecte sua wallet
4. Faça um withdraw
5. Deve mostrar "Checking compliance..." brevemente
6. Abra o console (F12) para ver logs TRM

### Teste 3: Verificar Logs no Vercel

1. No Vercel Dashboard, vá em **Deployments**
2. Clique no deployment da branch `feat/edge-trm-check`
3. Vá em **Functions** → `/api/trm-check`
4. Veja os logs em tempo real

## ✅ Checklist de Teste no Vercel

- [ ] Preview Deployment criado automaticamente
- [ ] Variáveis de ambiente configuradas
- [ ] Edge Function responde via curl
- [ ] Frontend funciona normalmente
- [ ] "Checking compliance..." aparece no withdraw
- [ ] Logs aparecem no Vercel Dashboard
- [ ] Latência < 300ms
- [ ] Sem erros no console do navegador

## 🎯 Passo 6: Se Tudo Estiver OK - Merge para Main

```bash
# Voltar para main
git checkout main

# Fazer merge da branch
git merge feat/edge-trm-check

# Push para main (vai triggerar deploy de produção)
git push origin main
```

## 🐛 Troubleshooting

### Preview Deployment não foi criado

**Solução:**
1. Verifique se o Vercel está conectado ao GitHub
2. Vá em **Settings** → **Git** → **Connect GitHub**
3. Faça um novo push: `git push origin feat/edge-trm-check`

### Edge Function retorna 404

**Causa:** O projeto está configurado com `output: 'export'` que gera build estático.

**Solução:**
- Edge Functions **NÃO funcionam** com `output: 'export'`
- Precisamos ajustar o `next.config.ts` para Vercel

**Fix:**
```typescript
// app/next.config.ts
const nextConfig: NextConfig = {
  // Remover ou comentar para Vercel:
  // output: 'export', // Só para IPFS
  
  // ... resto da config
};
```

### Variáveis de ambiente não funcionam

**Solução:**
1. Verifique se adicionou no ambiente **Preview**
2. Faça **Redeploy** após adicionar variáveis
3. Verifique se o nome está correto: `NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE`

## 📊 Comparação: Local vs Vercel

| Aspecto | Local (`npm run dev`) | Vercel Preview |
|---------|----------------------|----------------|
| Edge Functions | ✅ Funciona | ✅ Funciona |
| Build Estático | ❌ Não funciona | ✅ Funciona |
| Variáveis de Ambiente | `.env.local` | Vercel Dashboard |
| Latência | ~50ms | ~200ms (Edge) |
| Logs | Console local | Vercel Dashboard |

## 🚨 Importante

⚠️ **O projeto está configurado com `output: 'export'` para IPFS.**

Isso significa:
- ✅ Edge Functions funcionam no Vercel (mesmo com `output: 'export'`)
- ❌ Edge Functions **não funcionam** no build estático local
- ✅ Para produção no Vercel, podemos manter `output: 'export'` ou remover

**Recomendação:** Para testar Edge Functions no Vercel, está OK. Para produção, considere remover `output: 'export'` se não for usar IPFS.

