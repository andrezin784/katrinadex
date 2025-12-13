# 🚨 Guia de Rollback de Emergência - KatrinaDEX

Este guia explica como reverter o deploy em caso de bugs críticos no DApp.

## ⚡ Rollback Rápido (Recomendado)

### Opção 1: Script Automático
```bash
./rollback-emergency.sh
```

O script vai:
1. Listar todos os backups disponíveis
2. Permitir escolher qual backup restaurar
3. Reverter o código
4. Fazer push forçado (com confirmação)
5. O Vercel fará redeploy automático

### Opção 2: Manual (Se o script não funcionar)

```bash
# 1. Ver backups disponíveis
git branch | grep backup-before-deploy

# 2. Reverter para o backup mais recente
git checkout main
git reset --hard backup-before-deploy-YYYYMMDD-HHMMSS

# 3. Fazer push forçado
git push origin main --force
```

## 📋 Verificar Status Atual

```bash
./check-deploy-status.sh
```

Isso mostra:
- Branch atual e último commit
- Backups disponíveis
- Diferenças entre versões
- Arquivos modificados

## 🔍 Encontrar o Backup Correto

### Listar todos os backups:
```bash
git branch | grep backup
```

### Ver detalhes de um backup:
```bash
git log backup-before-deploy-YYYYMMDD-HHMMSS --oneline -5
```

### Comparar versões:
```bash
git diff backup-before-deploy-YYYYMMDD-HHMMSS..main --stat
```

## 🏷️ Tags de Emergência

Antes de fazer rollback, o script cria uma tag de emergência:
```bash
git tag emergency-backup-YYYYMMDD-HHMMSS
```

Para recuperar o estado anterior (se necessário):
```bash
git checkout emergency-backup-YYYYMMDD-HHMMSS
```

## ⚠️ Importante

1. **Backup Automático**: Antes de cada deploy, um backup é criado automaticamente
2. **Push Forçado**: O rollback requer push forçado, que sobrescreve o histórico
3. **Vercel**: O Vercel detecta o push e faz redeploy automático em 2-5 minutos
4. **Reversível**: Você pode voltar ao estado novo depois usando a tag de emergência

## 🔄 Processo Completo

1. **Identificar o problema**
   - Verificar logs do Vercel
   - Testar no domínio oficial
   - Verificar console do navegador

2. **Decidir se precisa rollback**
   - Bugs críticos que quebram funcionalidades principais
   - Problemas de segurança
   - Erros que afetam muitos usuários

3. **Executar rollback**
   ```bash
   ./rollback-emergency.sh
   ```

4. **Verificar após rollback**
   - Aguardar 2-5 minutos
   - Testar no domínio oficial
   - Verificar se tudo voltou a funcionar

5. **Corrigir bugs (se necessário)**
   - Trabalhar no branch `develop`
   - Testar localmente
   - Fazer novo deploy quando pronto

## 📞 Contatos

Se precisar de ajuda:
- Verificar logs: `./check-deploy-status.sh`
- Ver histórico: `git log --oneline --all --graph`
- Verificar Vercel: https://vercel.com/dashboard

## ✅ Checklist Pós-Rollback

- [ ] Código revertido com sucesso
- [ ] Push feito para origin/main
- [ ] Vercel detectou o push
- [ ] Redeploy completado (2-5 minutos)
- [ ] DApp funcionando no domínio oficial
- [ ] Funcionalidades principais testadas
- [ ] Tag de emergência criada (para recuperar depois)

