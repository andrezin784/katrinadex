# 🧪 Deploy de Staging - KatrinaDEX

Este guia te ajuda a fazer deploy de teste no Vercel antes de ir para produção.

---

## 📋 Passo a Passo

### 1. Criar Branch de Staging

```bash
# Criar e mudar para branch staging
git checkout -b staging

# Adicionar todas as melhorias de testes
git add app/tests/ app/vitest.config.ts app/playwright.config.ts
git add scripts/test-all.sh
git add *.md

# Commit
git commit -m "feat: adicionar testes automatizados e melhorias"

# Push para GitHub
git push origin staging
```

### 2. Configurar Vercel para Staging

#### Opção A: Usar Preview Deployments (Recomendado)

1. **No Vercel Dashboard:**
   - Vá em **Settings → Git**
   - Certifique-se que **Preview Deployments** está habilitado
   - Qualquer push para `staging` criará um preview automaticamente

2. **Root Directory:**
   - Vá em **Settings → General**
   - **Root Directory:** `app`
   - Salve

#### Opção B: Criar Projeto Separado de Staging

1. **Criar novo projeto:**
   - No Vercel Dashboard, clique em **Add New Project**
   - Conecte ao mesmo repositório: `andrezin784/katrinadex`
   - Nome: `katrinadex-staging`

2. **Configurar:**
   - **Root Directory:** `app`
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

3. **Branch:**
   - **Production Branch:** `staging` (ou deixe `main` e use previews)

---

### 3. Variáveis de Ambiente

No Vercel, vá em **Settings → Environment Variables** e adicione:

#### Para Preview/Staging:

```bash
# Feature Flags
NEXT_PUBLIC_ENABLE_GASLESS=true
NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE=true
NEXT_PUBLIC_TRM_FAIL_CLOSED=false

# Relayer
NEXT_PUBLIC_RELAYER_ADDRESS=0xb578040B8CF5d16ef2c44AA3eE5E536C91e0391f

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=04309ed1007e77d1f119b85205bb779d

# Chain
NEXT_PUBLIC_CHAIN_ID=5042002
```

**Importante:** Selecione **Preview** e **Development** para essas variáveis.

---

### 4. Fazer Deploy

#### Via Git Push (Automático):

```bash
# Já fizemos push do branch staging
# O Vercel vai criar preview automaticamente
```

#### Via Vercel CLI (Manual):

```bash
cd app
npx vercel --prod
```

---

### 5. Testar no Preview

Após o deploy, você receberá uma URL como:
- `https://katrinadex-staging-xxxxx.vercel.app`

**Teste:**
- [ ] Homepage carrega
- [ ] `/deposit` funciona
- [ ] `/withdraw` funciona
- [ ] Gasless withdraw funciona
- [ ] TRM check funciona
- [ ] Wallet connection funciona

---

### 6. Se Tudo Estiver OK: Deploy em Produção

```bash
# Fazer merge de staging para main
git checkout main
git merge staging
git push origin main

# O Vercel vai fazer deploy automático em produção
```

---

## 🔧 Troubleshooting

### Build Falha

1. Verificar **Root Directory** está como `app`
2. Verificar variáveis de ambiente
3. Ver logs no Vercel Dashboard

### Preview Não Cria

1. Verificar se **Preview Deployments** está habilitado
2. Verificar se o branch `staging` existe no GitHub
3. Verificar permissões do repositório no Vercel

### Variáveis de Ambiente Não Funcionam

1. Verificar se estão marcadas para **Preview**
2. Fazer redeploy após adicionar variáveis
3. Verificar se nomes estão corretos (case-sensitive)

---

## ✅ Checklist Final

- [ ] Branch `staging` criado e com código
- [ ] Push para GitHub feito
- [ ] Vercel configurado (Root Directory = `app`)
- [ ] Variáveis de ambiente configuradas
- [ ] Preview deployment criado
- [ ] Testes manuais passaram
- [ ] Pronto para merge em `main`

---

**Pronto! Agora é só seguir os passos acima! 🚀**

