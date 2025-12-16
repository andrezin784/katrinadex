# ⚠️ Configuração Necessária no Vercel Dashboard

## 🎯 Problema

O Vercel não consegue encontrar o `package.json` porque ele está em `app/`, não na raiz.

## ✅ Solução (Manual - Obrigatória)

O Vercel **não permite** configurar `rootDirectory` via CLI ou `vercel.json`. 
**É necessário configurar manualmente no Dashboard.**

### Passo a Passo:

1. **Acesse:** https://vercel.com/dashboard
2. **Selecione o projeto** (provavelmente "app" ou "katrinadex")
3. **Vá em:** Settings → General
4. **Configure:**
   - **Root Directory**: `app` ⚠️ **CRÍTICO**
   - **Framework Preset**: Next.js
   - **Build Command**: (deixe vazio)
   - **Output Directory**: (deixe vazio)
   - **Install Command**: (deixe vazio)
5. **Clique em:** Save
6. **Faça Redeploy:**
   - Vá em Deployments
   - Clique nos 3 pontos (...) no último deployment
   - Selecione **Redeploy**
   - **Desmarque** "Use existing Build Cache"
   - Clique em **Redeploy**

## 🔍 Como Encontrar o Projeto Correto

Se não souber qual projeto usar:

1. No Vercel Dashboard, veja a lista de projetos
2. Procure por:
   - "app"
   - "katrinadex"
   - Ou o nome do repositório GitHub: "andrezin784/katrinadex"

## ✅ Verificação

Após configurar, o próximo deploy deve:
- ✅ Encontrar `app/package.json`
- ✅ Instalar dependências
- ✅ Fazer build do Next.js
- ✅ Deployar com sucesso

## 🐛 Se Ainda Der Erro

1. Verifique se o Root Directory está exatamente: `app` (sem barra, sem ponto)
2. Limpe o cache: Redeploy sem "Use existing Build Cache"
3. Verifique os logs do build no Vercel Dashboard

---

**Nota:** Infelizmente, não é possível automatizar isso via CLI ou código. 
O Vercel requer configuração manual no Dashboard por questões de segurança.



