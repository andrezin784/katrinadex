# ✅ Checklist de Deploy - Melhorias de Hoje

## 📋 O que foi implementado hoje:

### 1. Edge Function TRM ✅
- Verificação de compliance antes de withdraw
- Feature flag: `NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE`
- Documentação completa

### 2. Gasless Withdraw com Gelato Relay ✅
- Zero gas para usuário
- Fee de 0.4% deduzido do valor
- Feature flag: `NEXT_PUBLIC_ENABLE_GASLESS`
- Bug fixes críticos

### 3. Branding Updates ✅
- "Powered by Arc Testnet" → "building in arc"
- Link do X atualizado para: https://x.com/moon_fun1

---

## 🚀 Passos para Deploy

### 1. Push para GitHub ✅
```bash
git push origin main
```

### 2. Configurar Variáveis de Ambiente no Vercel

Acesse: https://vercel.com/dashboard → Seu Projeto → Settings → Environment Variables

**Adicione:**

```bash
# Edge Function TRM (opcional - desabilitado por padrão)
NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE=false

# Gasless Withdraw (opcional - desabilitado por padrão)
NEXT_PUBLIC_ENABLE_GASLESS=false

# Relayer Address (se necessário)
NEXT_PUBLIC_RELAYER_ADDRESS=0x... (se configurado)
```

**Selecione os ambientes:**
- ✅ Preview
- ✅ Production

### 3. Verificar Root Directory no Vercel

Settings → General → Root Directory: `app`

### 4. Aguardar Deploy Automático

O Vercel vai detectar o push e fazer deploy automaticamente.

### 5. Verificar Deploy

- Acesse o domínio oficial
- Verifique se as mudanças aparecem
- Teste as funcionalidades

---

## 🔍 Verificações Pós-Deploy

- [ ] Homepage mostra "building in arc"
- [ ] Link do X aponta para https://x.com/moon_fun1
- [ ] Página de Deposit mostra "building in arc"
- [ ] Edge Function TRM funciona (se habilitado)
- [ ] Gasless Withdraw funciona (se habilitado)
- [ ] Sem erros no console

---

## 🐛 Se Algo Der Errado

### Rollback Rápido:
```bash
# Desabilitar features via variáveis de ambiente no Vercel:
NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE=false
NEXT_PUBLIC_ENABLE_GASLESS=false
```

### Rollback Completo:
```bash
# Usar checkpoint:
./scripts/restore-checkpoint.sh backups/backup-pre-enh-20251215-214029.tar.gz
```

---

## 📊 Status

- ✅ Código commitado
- ⏳ Aguardando push para GitHub
- ⏳ Aguardando deploy no Vercel

