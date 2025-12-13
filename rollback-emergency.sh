#!/bin/bash

# Script de Rollback de Emergência - KatrinaDEX
# Reverte TUDO para o estado anterior do deploy
# Use este script se o DApp estiver com bugs críticos

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${RED}🚨 ROLLBACK DE EMERGÊNCIA - KatrinaDEX${NC}"
echo "=========================================="
echo ""
echo -e "${YELLOW}⚠️  ATENÇÃO: Este script vai reverter TODAS as mudanças!${NC}"
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ] && [ ! -d "app" ]; then
    echo -e "${RED}❌ Erro: Execute este script na raiz do projeto${NC}"
    exit 1
fi

# Verificar se estamos no branch main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  Você está no branch ${CURRENT_BRANCH}, não no main${NC}"
    echo "Deseja continuar mesmo assim? (yes/no): "
    read confirm
    if [ "$confirm" != "yes" ]; then
        echo "Rollback cancelado."
        exit 0
    fi
fi

# Listar todos os backups disponíveis
echo -e "${BLUE}📋 Backups disponíveis:${NC}"
BACKUPS=$(git branch | grep "backup-before-deploy" | sed 's/^[ *]*//' | sort -r)
if [ -z "$BACKUPS" ]; then
    echo -e "${RED}❌ Nenhum backup encontrado!${NC}"
    exit 1
fi

echo "$BACKUPS" | nl -w2 -s'. '
echo ""

# Selecionar backup
echo -e "${YELLOW}Qual backup deseja restaurar? (número ou 'latest' para o mais recente):${NC}"
read backup_choice

if [ "$backup_choice" == "latest" ] || [ -z "$backup_choice" ]; then
    BACKUP_BRANCH=$(echo "$BACKUPS" | head -n 1)
else
    BACKUP_BRANCH=$(echo "$BACKUPS" | sed -n "${backup_choice}p")
    if [ -z "$BACKUP_BRANCH" ]; then
        echo -e "${RED}❌ Backup inválido!${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}📋 Backup selecionado: ${BACKUP_BRANCH}${NC}"

# Mostrar diferenças
echo ""
echo -e "${YELLOW}📊 Diferenças que serão revertidas:${NC}"
git diff ${BACKUP_BRANCH}..HEAD --stat | head -20
echo ""

# Confirmar rollback
echo -e "${RED}⚠️  CONFIRMAÇÃO FINAL${NC}"
echo "Isso vai:"
echo "  1. Reverter o código para ${BACKUP_BRANCH}"
echo "  2. Fazer push forçado para origin/main"
echo "  3. O Vercel fará redeploy automático"
echo ""
echo -e "${RED}Digite 'REVERT' para confirmar:${NC}"
read final_confirm

if [ "$final_confirm" != "REVERT" ]; then
    echo "Rollback cancelado."
    exit 0
fi

# Salvar estado atual (caso precise recuperar depois)
CURRENT_COMMIT=$(git rev-parse HEAD)
CURRENT_DATE=$(date +%Y%m%d-%H%M%S)
echo "📝 Estado atual salvo:"
echo "   Commit: ${CURRENT_COMMIT}"
echo "   Tag criada: emergency-backup-${CURRENT_DATE}"
git tag "emergency-backup-${CURRENT_DATE}" ${CURRENT_COMMIT}
echo ""

# Fazer checkout do backup
echo -e "${YELLOW}🔄 Revertendo código...${NC}"
git reset --hard ${BACKUP_BRANCH}
echo -e "${GREEN}✅ Código revertido${NC}"
echo ""

# Mostrar status
echo -e "${BLUE}📋 Status atual:${NC}"
git log --oneline -5
echo ""

# Confirmar push forçado
echo -e "${YELLOW}⚠️  Deseja fazer push forçado para origin/main? (yes/no):${NC}"
read confirm_push

if [ "$confirm_push" != "yes" ]; then
    echo -e "${YELLOW}⚠️  Push cancelado. Para fazer manualmente:${NC}"
    echo "   git push origin main --force"
    echo ""
    echo -e "${GREEN}✅ Código revertido localmente${NC}"
    echo "Para recuperar o estado anterior:"
    echo "   git checkout emergency-backup-${CURRENT_DATE}"
    exit 0
fi

# Fazer push forçado
echo -e "${YELLOW}📤 Fazendo push forçado...${NC}"
git push origin main --force
echo -e "${GREEN}✅ Push concluído!${NC}"
echo ""

# Informações finais
echo -e "${GREEN}✅ ROLLBACK DE EMERGÊNCIA CONCLUÍDO!${NC}"
echo ""
echo -e "${BLUE}📋 Próximos passos:${NC}"
echo "1. O Vercel detectou o push e fará redeploy automático"
echo "2. Aguarde 2-5 minutos para o redeploy completar"
echo "3. Verifique https://katrinadex.xyz"
echo ""
echo -e "${YELLOW}💾 Para recuperar o estado anterior (se necessário):${NC}"
echo "   git checkout emergency-backup-${CURRENT_DATE}"
echo ""
echo -e "${BLUE}📝 Backup restaurado: ${BACKUP_BRANCH}${NC}"

