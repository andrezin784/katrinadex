#!/bin/bash

# Script para fazer push e triggerar Preview Deployment no Vercel
# Uso: ./scripts/deploy-vercel-preview.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Deploy Preview no Vercel${NC}"
echo ""

# Verificar se está em uma branch de feature
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" = "main" ]; then
    echo -e "${RED}❌ Você está na branch main!${NC}"
    echo -e "${YELLOW}💡 Crie uma branch de feature primeiro:${NC}"
    echo "   git checkout -b feat/sua-feature"
    exit 1
fi

echo -e "${GREEN}📦 Branch atual: ${CURRENT_BRANCH}${NC}"

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Há mudanças não commitadas${NC}"
    read -p "Deseja fazer commit antes de push? (s/N): " COMMIT
    
    if [ "$COMMIT" = "s" ] || [ "$COMMIT" = "S" ]; then
        git add -A
        git commit -m "chore: Update for Vercel preview deployment"
    else
        echo -e "${YELLOW}⚠️  Fazendo push sem commit (mudanças locais não serão enviadas)${NC}"
    fi
fi

# Verificar se a branch existe no remote
if git ls-remote --heads origin "$CURRENT_BRANCH" | grep -q "$CURRENT_BRANCH"; then
    echo -e "${GREEN}✅ Branch já existe no remote${NC}"
    echo -e "${YELLOW}📤 Fazendo push...${NC}"
    git push origin "$CURRENT_BRANCH"
else
    echo -e "${YELLOW}📤 Criando branch no remote e fazendo push...${NC}"
    git push -u origin "$CURRENT_BRANCH"
fi

echo ""
echo -e "${GREEN}✅ Push concluído!${NC}"
echo ""
echo -e "${BLUE}📋 Próximos passos:${NC}"
echo "   1. Acesse: https://vercel.com/dashboard"
echo "   2. Selecione o projeto katrinadex"
echo "   3. Aguarde o Preview Deployment ser criado automaticamente"
echo "   4. Teste a Edge Function:"
echo "      curl https://YOUR_PREVIEW_URL/api/trm-check -X POST -H 'Content-Type: application/json' -d '{\"address\":\"0x123...\"}'"
echo ""
echo -e "${YELLOW}💡 URL do Preview será algo como:${NC}"
echo "   https://katrinadex-git-${CURRENT_BRANCH}-andrezin784.vercel.app"

