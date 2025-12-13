#!/bin/bash

# Script para verificar status do deploy e comparar versões

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📊 STATUS DO DEPLOY - KatrinaDEX${NC}"
echo "===================================="
echo ""

# Verificar branch atual
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}Branch atual: ${CURRENT_BRANCH}${NC}"

# Último commit
echo ""
echo -e "${BLUE}📝 Último commit no ${CURRENT_BRANCH}:${NC}"
git log -1 --oneline --decorate

# Verificar se há diferenças com origin
echo ""
echo -e "${BLUE}🔍 Status do repositório:${NC}"
git status -sb

# Listar backups
echo ""
echo -e "${BLUE}💾 Backups disponíveis:${NC}"
BACKUPS=$(git branch | grep "backup-before-deploy" | sed 's/^[ *]*//' | sort -r)
if [ -n "$BACKUPS" ]; then
    echo "$BACKUPS" | nl -w2 -s'. '
    LATEST_BACKUP=$(echo "$BACKUPS" | head -n 1)
    echo ""
    echo -e "${GREEN}✅ Backup mais recente: ${LATEST_BACKUP}${NC}"
    
    # Mostrar diferenças
    echo ""
    echo -e "${YELLOW}📊 Diferenças entre ${CURRENT_BRANCH} e ${LATEST_BACKUP}:${NC}"
    git diff ${LATEST_BACKUP}..HEAD --stat | head -10
else
    echo -e "${RED}❌ Nenhum backup encontrado${NC}"
fi

# Verificar tags de emergência
echo ""
echo -e "${BLUE}🏷️  Tags de emergência:${NC}"
EMERGENCY_TAGS=$(git tag | grep "emergency-backup" | sort -r)
if [ -n "$EMERGENCY_TAGS" ]; then
    echo "$EMERGENCY_TAGS" | head -5
else
    echo "Nenhuma tag de emergência encontrada"
fi

# Verificar arquivos modificados
echo ""
echo -e "${BLUE}📁 Arquivos modificados (não commitados):${NC}"
MODIFIED=$(git status --porcelain)
if [ -n "$MODIFIED" ]; then
    echo "$MODIFIED"
else
    echo -e "${GREEN}✅ Nenhum arquivo modificado${NC}"
fi

echo ""
echo -e "${BLUE}🌐 Links úteis:${NC}"
echo "   Domínio: https://katrinadex.xyz"
echo "   Vercel: https://vercel.com/dashboard"
echo "   GitHub: $(git remote get-url origin)"

