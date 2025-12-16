# ⚙️ Configuração do Vercel - Root Directory

## 🔧 Configuração Necessária no Vercel Dashboard

O `vercel.json` não suporta `rootDirectory`, então você precisa configurar manualmente no Vercel Dashboard:

### Passo a Passo:

1. **Acesse o Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Selecione o projeto `katrinadex`

2. **Vá em Settings → General:**

3. **Configure:**
   - **Root Directory**: `app` ⚠️ **IMPORTANTE**
   - **Framework Preset**: Next.js
   - **Build Command**: (deixe vazio - usa padrão)
   - **Output Directory**: (deixe vazio - usa padrão)
   - **Install Command**: (deixe vazio - usa padrão)

4. **Salve as configurações**

5. **Faça um novo deploy:**
   - Vá em **Deployments**
   - Clique nos 3 pontos (...) no deployment que falhou
   - Selecione **Redeploy**

## ✅ Verificação

Após configurar, o próximo deploy deve:
- ✅ Encontrar o `package.json` em `app/package.json`
- ✅ Instalar dependências corretamente
- ✅ Fazer build do Next.js
- ✅ Deployar com sucesso

## 🐛 Se Ainda Der Erro

Se mesmo após configurar o Root Directory ainda der erro:

1. **Verifique se o Root Directory está correto:**
   - Deve ser exatamente: `app` (sem barra, sem ponto)

2. **Tente limpar o cache:**
   - No deployment, clique em **Redeploy**
   - Marque: **Use existing Build Cache** (desmarque)
   - Clique em **Redeploy**

3. **Verifique os logs:**
   - Veja se aparece: "Installing dependencies..."
   - Veja se encontra o `package.json`

