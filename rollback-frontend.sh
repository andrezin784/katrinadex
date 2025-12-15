#!/bin/bash

# =============================================================================
# KATRINADEX FRONTEND ROLLBACK SCRIPT
# =============================================================================
# Este script restaura o frontend para a versão estável anterior (antes do redesign Arc)
# Uso: ./rollback-frontend.sh
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           KATRINADEX FRONTEND ROLLBACK                       ║"
echo "║           Restaurar para versão estável                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if we're in the right directory
if [ ! -d "app" ]; then
    echo -e "${RED}❌ Erro: Execute este script no diretório raiz do projeto${NC}"
    exit 1
fi

# Show available backups
echo -e "${YELLOW}📦 Backups disponíveis:${NC}"
git tag -l "backup-frontend-*" | head -10

echo ""
echo -e "${YELLOW}⚠️  ATENÇÃO: Isso irá restaurar todo o frontend para a versão anterior!${NC}"
echo ""
read -p "Deseja continuar? (s/n): " confirm

if [[ $confirm != "s" && $confirm != "S" ]]; then
    echo -e "${RED}Operação cancelada.${NC}"
    exit 0
fi

# Get the backup tag
BACKUP_TAG="backup-frontend-v1-stable"

if ! git tag -l | grep -q "$BACKUP_TAG"; then
    echo -e "${RED}❌ Erro: Tag de backup '$BACKUP_TAG' não encontrada${NC}"
    echo ""
    echo "Tags disponíveis:"
    git tag -l "backup-*"
    exit 1
fi

echo ""
echo -e "${CYAN}🔄 Restaurando frontend do backup: ${BACKUP_TAG}${NC}"

# Create a rollback branch for safety
ROLLBACK_BRANCH="rollback-frontend-$(date +%Y%m%d-%H%M%S)"
git checkout -b "$ROLLBACK_BRANCH"

# Restore frontend files from the backup tag
echo -e "${YELLOW}📂 Restaurando arquivos do frontend...${NC}"
git checkout "$BACKUP_TAG" -- app/src/

echo -e "${GREEN}✅ Arquivos restaurados com sucesso!${NC}"

# Stage changes
git add app/src/

# Commit
git commit -m "🔄 Rollback: Restaurar frontend para versão estável (antes do redesign Arc)

- Restaurado de: ${BACKUP_TAG}
- Data do rollback: $(date)
- Branch de rollback: ${ROLLBACK_BRANCH}
"

echo ""
echo -e "${GREEN}✅ Rollback criado na branch: ${ROLLBACK_BRANCH}${NC}"
echo ""
echo -e "${YELLOW}📋 Próximos passos:${NC}"
echo "1. Teste localmente: cd app && npm run dev"
echo "2. Se tudo OK, faça merge na main:"
echo "   git checkout main"
echo "   git merge ${ROLLBACK_BRANCH}"
echo "   git push origin main"
echo ""
echo "3. Para cancelar o rollback:"
echo "   git checkout main"
echo "   git branch -D ${ROLLBACK_BRANCH}"
echo ""
echo -e "${CYAN}🔧 O Vercel irá fazer deploy automaticamente após o push.${NC}"



