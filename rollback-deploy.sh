#!/bin/bash

# Script de Rollback para KatrinaDEX
# Reverte todas as mudanças do deploy para o estado anterior

set -e

echo "🔄 ROLLBACK DO DEPLOY - KatrinaDEX"
echo "===================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ] && [ ! -d "app" ]; then
    echo -e "${RED}❌ Erro: Execute este script na raiz do projeto${NC}"
    exit 1
fi

# Encontrar o branch de backup mais recente
BACKUP_BRANCH=$(git branch | grep "backup-before-deploy" | sort -r | head -n 1 | sed 's/^[ *]*//')

if [ -z "$BACKUP_BRANCH" ]; then
    echo -e "${RED}❌ Erro: Nenhum branch de backup encontrado${NC}"
    echo "Branches disponíveis:"
    git branch | grep backup
    exit 1
fi

echo -e "${YELLOW}📋 Branch de backup encontrado: ${BACKUP_BRANCH}${NC}"
echo ""

# Confirmar rollback
read -p "⚠️  Tem certeza que deseja reverter para ${BACKUP_BRANCH}? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Rollback cancelado."
    exit 0
fi

# Salvar estado atual (caso precise recuperar depois)
CURRENT_BRANCH=$(git branch --show-current)
CURRENT_COMMIT=$(git rev-parse HEAD)
echo "📝 Estado atual salvo:"
echo "   Branch: ${CURRENT_BRANCH}"
echo "   Commit: ${CURRENT_COMMIT}"
echo ""

# Fazer checkout do branch de backup
echo -e "${YELLOW}🔄 Revertendo para ${BACKUP_BRANCH}...${NC}"
git checkout ${BACKUP_BRANCH}

# Se estiver no main, fazer hard reset
if [ "$CURRENT_BRANCH" == "main" ]; then
    echo -e "${YELLOW}🔄 Fazendo hard reset do main para ${BACKUP_BRANCH}...${NC}"
    git checkout main
    git reset --hard ${BACKUP_BRANCH}
    echo -e "${GREEN}✅ Main revertido para ${BACKUP_BRANCH}${NC}"
else
    echo -e "${YELLOW}⚠️  Você está no branch ${CURRENT_BRANCH}, não no main${NC}"
    echo "Para reverter o main, execute:"
    echo "  git checkout main"
    echo "  git reset --hard ${BACKUP_BRANCH}"
fi

echo ""
echo -e "${GREEN}✅ Rollback concluído!${NC}"
echo ""
echo "📋 Próximos passos:"
echo "1. Verifique se tudo está funcionando: git log --oneline -5"
echo "2. Faça push forçado (se necessário): git push origin main --force"
echo "3. O Vercel deve fazer redeploy automaticamente"
echo ""
echo "💾 Para recuperar o estado anterior (se necessário):"
echo "   git checkout ${CURRENT_COMMIT}"

