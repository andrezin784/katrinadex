# 🚀 Deploy Manual no Vercel - Passo a Passo

## ⚠️ Limitação da CLI

A Vercel CLI requer permissões específicas que não podem ser configuradas automaticamente. 

**Solução:** Fazer deploy via Dashboard do Vercel (mais confiável).

---

## 📋 Passo a Passo (5 minutos)

### 1. Acessar Vercel Dashboard

1. Acesse: **https://vercel.com/dashboard**
2. Faça login se necessário
3. Selecione o projeto que está linkado ao domínio `katrinadex.xyz`

### 2. Verificar Configurações

**Settings → General:**
- **Root Directory:** `app` ✅
- **Framework Preset:** Next.js ✅
- **Build Command:** (deixe vazio - usa padrão) ✅
- **Output Directory:** (deixe vazio - usa padrão) ✅

**Settings → Git:**
- **Repository:** `andrezin784/katrinadex` ✅
- **Production Branch:** `main` ✅
- **Auto-deploy:** Habilitado ✅

### 3. Fazer Redeploy

1. Vá em **Deployments**
2. Clique nos **3 pontos (...)** no último deployment
3. Selecione **Redeploy**
4. **IMPORTANTE:** Desmarque "Use existing Build Cache"
5. Clique em **Redeploy**
6. Aguarde 2-5 minutos

### 4. Verificar Deploy

1. Aguarde até aparecer **"Ready"** no deployment
2. Clique no deployment para ver os detalhes
3. Veja a URL do deploy (deve ser algo como `katrinadex-xxx.vercel.app`)

### 5. Verificar Domínio

1. **Settings** → **Domains**
2. Verifique se `katrinadex.xyz` está listado
3. Verifique se está apontando para o projeto correto

### 6. Testar no Domínio

1. Acesse: **https://katrinadex.xyz**
2. Limpe o cache do navegador (`Cmd + Shift + Delete`)
3. Verifique:
   - ✅ Badge mostra "building in arc"
   - ✅ Link do X aponta para https://x.com/moon_fun1
   - ✅ Página de Deposit mostra "building in arc"

---

## 🔧 Se o Deploy Falhar

### Verificar Build Logs

1. **Deployments** → Clique no deployment que falhou
2. Veja **Build Logs**
3. Procure por erros

**Erro comum:** "No Next.js version detected"
- **Solução:** Configurar Root Directory como `app`

**Erro comum:** "Build failed"
- **Solução:** Verificar logs para ver o erro específico

### Verificar Variáveis de Ambiente

1. **Settings** → **Environment Variables**
2. Verifique se não há variáveis quebradas
3. Se necessário, adicione:
   ```
   NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE=false
   NEXT_PUBLIC_ENABLE_GASLESS=false
   ```

---

## ✅ Checklist Final

Após o deploy:

- [ ] Deploy concluído com status "Ready"
- [ ] Root Directory configurado como `app`
- [ ] Projeto conectado ao GitHub (`andrezin784/katrinadex`)
- [ ] Domínio `katrinadex.xyz` associado ao projeto
- [ ] Site mostra "building in arc"
- [ ] Link do X funciona
- [ ] Sem erros no console

---

## 🎯 Solução Mais Rápida

**Se você tem acesso ao Vercel Dashboard:**

1. **Deployments** → **Redeploy** → Desmarcar cache → **Redeploy**
2. Aguardar 2-5 minutos
3. Limpar cache do navegador
4. Acessar https://katrinadex.xyz

**Isso deve resolver em 90% dos casos!**

---

## 📞 Se Ainda Não Funcionar

Me envie:
1. Screenshot do Vercel Dashboard (Deployments)
2. Screenshot dos Build Logs
3. Qual projeto está associado ao domínio `katrinadex.xyz`

---

**O deploy via Dashboard é mais confiável que via CLI! 🚀**

