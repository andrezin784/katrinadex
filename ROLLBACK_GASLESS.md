# 🚨 Rollback Rápido - Sistema Gasless Relayer

**Data do Deploy:** 2025-12-13  
**Commit Deployado:** `2fe4930`  
**Backup Criado:** `backup-before-gasless-deploy-20251213-142711`

## ⚡ Rollback Rápido (1 comando)

```bash
./rollback-emergency.sh
```

O script vai:
1. Listar backups disponíveis
2. Mostrar `backup-before-gasless-deploy-20251213-142711` como opção
3. Reverter para esse backup
4. Fazer push forçado (com confirmação)

## 🔄 Rollback Manual

Se o script não funcionar:

```bash
# 1. Reverter para o backup
git checkout main
git reset --hard backup-before-gasless-deploy-20251213-142711

# 2. Push forçado
git push origin main --force
```

## 📋 O que será revertido

- ❌ Sistema Gasless Relayer (contrato, frontend, API)
- ❌ Toggle gasless na página de withdraw
- ❌ Scripts de rollback de emergência
- ✅ Volta para: Security improvements + KatrinaStaking

## ✅ O que permanece

- ✅ Melhorias de segurança (CSP, XSS, phishing warnings)
- ✅ KatrinaStaking contract
- ✅ Endereços dos contratos estáveis
- ✅ Funcionalidades básicas de deposit/withdraw

## 🔍 Verificar Status

```bash
./check-deploy-status.sh
```

## 📞 Se precisar de ajuda

1. Verificar logs: `git log --oneline -5`
2. Ver backups: `git branch | grep backup`
3. Comparar versões: `git diff backup-before-gasless-deploy-20251213-142711..main --stat`

