#!/bin/bash

# Script para fazer deploy direto no Vercel via CLI
# Uso: ./scripts/deploy-vercel-now.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_DIR="$PROJECT_ROOT/app"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Deploy no Vercel (Produção)${NC}"
echo ""

cd "$APP_DIR"

# Verificar se está linkado
if [ ! -f ".vercel/project.json" ]; then
    echo -e "${YELLOW}⚠️  Projeto não está linkado${NC}"
    echo -e "${YELLOW}Linkando projeto...${NC}"
    vercel link --yes
fi

# Verificar Root Directory no .vercel/project.json
echo -e "${GREEN}📦 Fazendo deploy...${NC}"

# Tentar deploy
if vercel --prod --yes; then
    echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
    echo ""
    echo -e "${YELLOW}💡 Aguarde 1-2 minutos para o deploy propagar${NC}"
    echo -e "${YELLOW}💡 Acesse: https://katrinadex.xyz${NC}"
else
    echo -e "${RED}❌ Deploy falhou${NC}"
    echo ""
    echo -e "${YELLOW}💡 Solução alternativa:${NC}"
    echo "   1. Acesse: https://vercel.com/dashboard"
    echo "   2. Selecione o projeto"
    echo "   3. Deployments → Redeploy"
    echo "   4. Desmarque 'Use existing Build Cache'"
    echo "   5. Redeploy"
    exit 1
fi

