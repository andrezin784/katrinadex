#!/bin/bash

# Script de Deploy Seguro para KatrinaDEX
# Faz merge do develop para main com sistema de rollback

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 DEPLOY SEGURO - KatrinaDEX${NC}"
echo "===================================="
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ] && [ ! -d "app" ]; then
    echo -e "${RED}❌ Erro: Execute este script na raiz do projeto${NC}"
    exit 1
fi

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Há mudanças não commitadas. Deseja continuar? (yes/no):${NC}"
    read confirm
    if [ "$confirm" != "yes" ]; then
        echo "Deploy cancelado."
        exit 0
    fi
fi

# 1. Criar backup do main atual
echo -e "${YELLOW}📦 Criando backup do main atual...${NC}"
BACKUP_BRANCH="backup-before-deploy-$(date +%Y%m%d-%H%M%S)"
git checkout main
git branch ${BACKUP_BRANCH}
echo -e "${GREEN}✅ Backup criado: ${BACKUP_BRANCH}${NC}"
echo ""

# 2. Atualizar main com develop
echo -e "${YELLOW}🔄 Fazendo merge do develop para main...${NC}"
git merge develop --no-ff -m "🚀 Deploy: Merge develop to main - Security improvements and KatrinaStaking"
echo -e "${GREEN}✅ Merge concluído${NC}"
echo ""

# 3. Mostrar resumo das mudanças
echo -e "${BLUE}📋 Resumo das mudanças:${NC}"
git log main --oneline -5
echo ""

# 4. Confirmar push
echo -e "${YELLOW}⚠️  Deseja fazer push para origin/main? (yes/no):${NC}"
read confirm_push
if [ "$confirm_push" != "yes" ]; then
    echo -e "${YELLOW}⚠️  Push cancelado. Você pode fazer manualmente depois:${NC}"
    echo "   git push origin main"
    echo ""
    echo -e "${GREEN}✅ Para reverter, execute:${NC}"
    echo "   ./rollback-deploy.sh"
    exit 0
fi

# 5. Fazer push
echo -e "${YELLOW}📤 Fazendo push para origin/main...${NC}"
git push origin main
echo -e "${GREEN}✅ Push concluído!${NC}"
echo ""

# 6. Informações finais
echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo ""
echo -e "${BLUE}📋 Próximos passos:${NC}"
echo "1. O Vercel fará deploy automático para katrinadex.xyz"
echo "2. Aguarde alguns minutos para o deploy completar"
echo "3. Teste as funcionalidades no domínio oficial"
echo ""
echo -e "${YELLOW}🔄 Para reverter (se necessário):${NC}"
echo "   ./rollback-deploy.sh"
echo ""
echo -e "${BLUE}📝 Backup criado: ${BACKUP_BRANCH}${NC}"

