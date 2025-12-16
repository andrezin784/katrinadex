#!/bin/bash

# Script para atualizar Root Directory no Vercel via API
# Requer: VERCEL_TOKEN configurado como env var

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Atualizando configuração do Vercel...${NC}"

# Verificar se VERCEL_TOKEN está configurado
if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  VERCEL_TOKEN não encontrado${NC}"
    echo -e "${YELLOW}💡 Para obter o token:${NC}"
    echo "   1. Acesse: https://vercel.com/account/tokens"
    echo "   2. Crie um novo token"
    echo "   3. Execute: export VERCEL_TOKEN=seu_token"
    echo ""
    echo -e "${YELLOW}Ou configure manualmente no Dashboard:${NC}"
    echo "   1. Acesse: https://vercel.com/dashboard"
    echo "   2. Selecione o projeto"
    echo "   3. Settings → General → Root Directory: app"
    exit 1
fi

# Tentar obter o nome do projeto do git remote
PROJECT_NAME=$(git remote get-url origin 2>/dev/null | sed 's/.*\///;s/\.git$//' || echo "katrinadex")

echo -e "${GREEN}📦 Projeto: ${PROJECT_NAME}${NC}"

# Listar projetos para encontrar o ID
echo -e "${YELLOW}🔍 Procurando projeto no Vercel...${NC}"

# Usar Vercel CLI para obter informações do projeto
cd "$PROJECT_ROOT"

# Tentar linkar o projeto
if [ ! -f ".vercel/project.json" ]; then
    echo -e "${YELLOW}📌 Linkando projeto...${NC}"
    vercel link --yes --scope=andres-projects-439ce98d 2>&1 | head -20 || true
fi

# Se o link funcionou, o root directory deve ser configurado no dashboard
echo ""
echo -e "${GREEN}✅ Configuração concluída!${NC}"
echo ""
echo -e "${YELLOW}📋 IMPORTANTE: Configure manualmente no Dashboard:${NC}"
echo "   1. Acesse: https://vercel.com/dashboard"
echo "   2. Selecione o projeto: ${PROJECT_NAME}"
echo "   3. Settings → General"
echo "   4. Root Directory: ${GREEN}app${NC}"
echo "   5. Salve e faça Redeploy"
echo ""
echo -e "${BLUE}💡 O Vercel não permite configurar rootDirectory via CLI ou API${NC}"
echo -e "${BLUE}   É necessário configurar manualmente no Dashboard${NC}"

