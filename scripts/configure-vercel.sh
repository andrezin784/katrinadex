#!/bin/bash

# Script para configurar Vercel via CLI
# Uso: ./scripts/configure-vercel.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}⚙️  Configurando Vercel...${NC}"
echo ""

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI não está instalado${NC}"
    echo -e "${YELLOW}💡 Instale com: npm install -g vercel${NC}"
    exit 1
fi

cd "$PROJECT_ROOT"

# Verificar se está autenticado
echo -e "${YELLOW}1. Verificando autenticação...${NC}"
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Não está autenticado. Fazendo login...${NC}"
    vercel login
fi

# Linkar projeto (se não estiver linkado)
echo -e "${YELLOW}2. Linkando projeto...${NC}"
if [ ! -f ".vercel/project.json" ]; then
    echo -e "${YELLOW}💡 Siga as instruções para linkar o projeto:${NC}"
    vercel link
else
    echo -e "${GREEN}✅ Projeto já está linkado${NC}"
fi

# Configurar Root Directory via API do Vercel
echo -e "${YELLOW}3. Configurando Root Directory...${NC}"

# Ler configuração do projeto
PROJECT_ID=$(cat .vercel/project.json 2>/dev/null | grep -o '"projectId":"[^"]*' | cut -d'"' -f4 || echo "")
TEAM_ID=$(cat .vercel/project.json 2>/dev/null | grep -o '"orgId":"[^"]*' | cut -d'"' -f4 || echo "")

if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ Não foi possível encontrar o Project ID${NC}"
    echo -e "${YELLOW}💡 Configure manualmente no Vercel Dashboard:${NC}"
    echo "   1. Acesse: https://vercel.com/dashboard"
    echo "   2. Settings → General → Root Directory: app"
    exit 1
fi

echo -e "${GREEN}✅ Project ID: $PROJECT_ID${NC}"

# Atualizar configuração via Vercel CLI
echo -e "${YELLOW}4. Atualizando configurações do projeto...${NC}"

# Criar arquivo de configuração temporário
cat > .vercel-temp-config.json << EOF
{
  "buildCommand": "cd app && npm install && npm run build",
  "outputDirectory": "app/.next",
  "installCommand": "cd app && npm install",
  "framework": "nextjs"
}
EOF

# Nota: A Vercel CLI não tem comando direto para atualizar Root Directory
# Mas podemos usar a API do Vercel
echo -e "${YELLOW}⚠️  Root Directory precisa ser configurado manualmente no Dashboard${NC}"
echo -e "${YELLOW}💡 Ou via API do Vercel (requer token)${NC}"

echo ""
echo -e "${GREEN}✅ Configuração parcial concluída!${NC}"
echo ""
echo -e "${YELLOW}📋 Próximos passos MANUAIS:${NC}"
echo "   1. Acesse: https://vercel.com/dashboard"
echo "   2. Selecione o projeto: katrinadex"
echo "   3. Vá em: Settings → General"
echo "   4. Configure: Root Directory = app"
echo "   5. Salve"
echo "   6. Faça Redeploy"
echo ""
echo -e "${BLUE}💡 Ou use a API do Vercel com seu token:${NC}"
echo "   curl -X PATCH https://api.vercel.com/v9/projects/$PROJECT_ID \\"
echo "     -H 'Authorization: Bearer YOUR_VERCEL_TOKEN' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"rootDirectory\":\"app\"}'"

