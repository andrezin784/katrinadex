# 📋 Plano de Deploy - KatrinaDEX

**Data:** $(date +%Y-%m-%d)  
**Branch de origem:** `develop`  
**Branch de destino:** `main`  
**Status:** ⏳ Aguardando aprovação

## 🔍 Mudanças que serão deployadas

### 1. Melhorias de Segurança (Commit: 08dc73b)
- ✅ CSP Headers (Content Security Policy) via `middleware.ts`
- ✅ Proteção XSS (`sanitizeInput`, `escapeHtml`)
- ✅ Componente `SecurityWarning` (aviso de phishing)
- ✅ Padrão CEI rigoroso no `Mixer.sol`

### 2. Segurança Aprimorada (Commit: 91d937e)
- ✅ CEI pattern no `Relayer.sol` (funções `claim*`)
- ✅ Suporte EURC aprimorado
- ✅ Eventos de segurança (`EarningsClaimed`)
- ✅ Verificações de saldo antes de transferências

### 3. KatrinaStaking Contract (Commit: a625051)
- ✅ Novo contrato de staking
- ✅ Testes completos (Foundry)
- ✅ Scripts de deploy

### 4. Reversões Recentes
- ✅ Endereços dos contratos revertidos para versão estável
- ✅ Logs de debug removidos
- ✅ Tratamento de erros simplificado

## 📦 Contratos que serão usados

### Base Sepolia
- **MIXER:** `0x46f123107B2E4f9042de8c6Fb8762f8824ef90f4` (versão estável)
- **RELAYER:** `0x86F4303D695fF43210049EDD49bCaeE99f45810e` (versão estável)
- **COMPLIANCE_ORACLE:** Não configurado (0x0000...)

### Arc Testnet
- **MIXER:** `0x3441cF331Cb75c6BBCa7a34718224C7983eF4636`
- **RELAYER:** `0xD29eA0dAcb69b3e7bd6F3774C1AE24f058ee7851`
- **COMPLIANCE_ORACLE:** `0x7C3A70235F1FC08b82c9e53078aAf0a99CDDf386`

## 🛡️ Sistema de Rollback

### Backup Automático
- ✅ Branch de backup criado: `backup-before-deploy-YYYYMMDD-HHMMSS`
- ✅ Script de rollback: `rollback-deploy.sh`

### Como Reverter (se necessário)

#### Opção 1: Script Automático
```bash
./rollback-deploy.sh
```

#### Opção 2: Manual
```bash
# Encontrar branch de backup
git branch | grep backup-before-deploy

# Reverter main
git checkout main
git reset --hard backup-before-deploy-YYYYMMDD-HHMMSS
git push origin main --force
```

## ✅ Checklist Pré-Deploy

- [x] Backup do estado atual criado
- [x] Script de rollback criado
- [x] Mudanças testadas no `develop`
- [ ] Testes locais passando
- [ ] Revisão de código concluída
- [ ] Documentação atualizada

## 🚀 Processo de Deploy

1. **Merge do develop para main**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

2. **Vercel fará deploy automático**
   - O Vercel detecta push no `main`
   - Faz build automático
   - Deploy para `katrinadex.xyz`

3. **Verificação pós-deploy**
   - [ ] Testar deposit no domínio oficial
   - [ ] Testar withdraw no domínio oficial
   - [ ] Verificar se SecurityWarning aparece
   - [ ] Verificar console do navegador (sem erros)

## 🔄 Rollback (se necessário)

Se encontrar bugs após o deploy:

1. **Executar rollback:**
   ```bash
   ./rollback-deploy.sh
   ```

2. **Ou manualmente:**
   ```bash
   git checkout main
   git reset --hard backup-before-deploy-YYYYMMDD-HHMMSS
   git push origin main --force
   ```

3. **Vercel fará redeploy automaticamente**

## 📝 Notas

- Os contratos **NÃO serão redeployados** (usando versão estável)
- Apenas o frontend será atualizado
- Todas as mudanças são compatíveis com os contratos existentes
- O rollback é **reversível** (pode voltar ao estado novo depois)

