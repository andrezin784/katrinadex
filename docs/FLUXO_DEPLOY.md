# 🔄 Fluxo de Deploy - Vercel

## 📊 Como Funciona

```
┌─────────────────┐
│  Branch Feature │  (feat/edge-trm-check)
│                 │
│  git push       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Preview Deploy  │  ⚠️ AMBIENTE DE TESTE
│ (Vercel)        │
│                 │  URL: katrinadex-git-feat-xxx.vercel.app
│  ✅ Testar aqui │
└────────┬────────┘
         │
         │ Se tudo OK ✅
         ▼
┌─────────────────┐
│  Merge para     │
│  main           │
│                 │
│  git merge      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Production      │  🚀 PRODUÇÃO
│ Deploy          │
│                 │  URL: katrinadex.xyz (domínio oficial)
│  ✅ Live!       │
└─────────────────┘
```

## 🧪 Ambiente de Teste (Preview)

### O que é?

Quando você faz `git push` de uma branch (ex: `feat/edge-trm-check`), o Vercel **automaticamente** cria um Preview Deployment.

**Características:**
- ✅ URL única para cada branch
- ✅ Isolado da produção
- ✅ Pode testar sem afetar o site oficial
- ✅ Variáveis de ambiente separadas (Preview vs Production)

### Como Acessar?

1. **Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Selecione o projeto
   - Vá em **Deployments**
   - Veja o deployment da branch `feat/edge-trm-check`
   - Clique na URL do Preview

2. **URL do Preview:**
   ```
   https://katrinadex-git-feat-edge-trm-check-andrezin784.vercel.app
   ```

### O que Testar no Preview?

- ✅ Edge Function TRM (`/api/trm-check`)
- ✅ Frontend funcionando
- ✅ Withdraw com verificação TRM
- ✅ Console do navegador (logs)
- ✅ Performance (latência)

## 🚀 Ambiente de Produção (Main)

### Quando vai para Produção?

**SOMENTE** após:
1. ✅ Testar no Preview
2. ✅ Confirmar que tudo funciona
3. ✅ Fazer merge para `main`
4. ✅ Vercel faz deploy automático para produção

### URL de Produção:

```
https://katrinadex.xyz
```

## 📋 Checklist Antes de Merge

Antes de fazer merge para `main`, verifique:

- [ ] Preview Deployment criado e funcionando
- [ ] Edge Function responde corretamente
- [ ] Frontend funciona normalmente
- [ ] Verificação TRM aparece no withdraw
- [ ] Sem erros no console
- [ ] Latência aceitável (<300ms)
- [ ] Variáveis de ambiente configuradas

## 🔧 Variáveis de Ambiente

### Preview (Teste)

Configure no Vercel Dashboard:
- **Settings** → **Environment Variables**
- Selecione: ✅ **Preview**
- Adicione: `NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE=true`

### Production (Produção)

Configure no Vercel Dashboard:
- **Settings** → **Environment Variables**
- Selecione: ✅ **Production**
- Adicione: `NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE=true`

**Importante:** Configure em **ambos** (Preview e Production) para testar e depois usar em produção.

## 🎯 Fluxo Atual (feat/edge-trm-check)

### Status Atual:

1. ✅ Branch criada: `feat/edge-trm-check`
2. ✅ Push feito para GitHub
3. ⏳ **Aguardando:** Configurar Root Directory no Vercel Dashboard
4. ⏳ **Aguardando:** Preview Deployment ser criado
5. ⏳ **Aguardando:** Testar no Preview
6. ⏳ **Depois:** Merge para `main` (se tudo OK)

### Próximos Passos:

1. **Configure Root Directory no Vercel Dashboard:**
   - Settings → General → Root Directory: `app`

2. **Aguarde Preview Deployment:**
   - Vercel vai criar automaticamente após configurar Root Directory

3. **Teste no Preview:**
   - Acesse a URL do Preview
   - Teste a Edge Function
   - Teste o frontend

4. **Se tudo OK:**
   ```bash
   git checkout main
   git merge feat/edge-trm-check
   git push origin main
   ```

5. **Vercel faz deploy automático para produção**

## 🐛 Troubleshooting

### Preview não foi criado?

**Causa:** Root Directory não configurado ou erro no build.

**Solução:**
1. Configure Root Directory no Dashboard
2. Faça Redeploy manual
3. Verifique os logs do build

### Preview funciona, mas Production não?

**Causa:** Variáveis de ambiente não configuradas para Production.

**Solução:**
1. Configure variáveis de ambiente para **Production**
2. Faça Redeploy da branch `main`

## ✅ Resumo

- **Preview (Teste):** Criado automaticamente para cada branch
- **Production:** Criado automaticamente quando faz merge para `main`
- **Teste sempre no Preview antes de merge!**
- **Variáveis de ambiente:** Configure em Preview E Production

