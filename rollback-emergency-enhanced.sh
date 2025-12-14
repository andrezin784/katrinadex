#!/bin/bash

# ROLLBACK EMERGENCY ENHANCED - Sistema Ultra-Robusto
# ===================================================

set -e  # Exit on any error

echo "🚨 ROLLBACK EMERGENCY ENHANCED"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to log actions
log_action() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> rollback_log.txt
}

# Get latest backup tag
LATEST_BACKUP=$(git tag --sort=-creatordate | grep "^backup-" | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo -e "${RED}❌ ERRO: Nenhum backup encontrado!${NC}"
    echo "Execute primeiro: git tag backup-\$(date +%s)"
    exit 1
fi

echo -e "${YELLOW}🔍 Backup encontrado: $LATEST_BACKUP${NC}"
echo ""

# Confirm rollback
echo -e "${RED}⚠️  ATENÇÃO: Isso irá reverter TODAS as mudanças para o estado do backup!${NC}"
echo -e "${RED}   - Código será resetado${NC}"
echo -e "${RED}   - Commits serão perdidos${NC}"
echo -e "${RED}   - Deploy será revertido${NC}"
echo ""

read -p "Tem certeza que quer continuar? (digite 'SIM' para confirmar): " -r
if [[ ! $REPLY =~ ^[Ss][Ii][Mm]$ ]]; then
    echo "Rollback cancelado."
    exit 0
fi

echo ""
echo "🔄 Iniciando rollback..."

# Log the rollback
log_action "INICIANDO ROLLBACK PARA $LATEST_BACKUP"

# Stash any uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "💾 Salvando mudanças não commitadas..."
    git stash push -m "emergency-stash-$(date +%s)"
    log_action "STASH CRIADO PARA MUDANÇAS NÃO COMMITADAS"
fi

# Reset to backup
echo "🔄 Resetando para backup..."
git reset --hard "$LATEST_BACKUP"
log_action "RESET HARD PARA $LATEST_BACKUP"

# Force push to GitHub (if needed)
echo ""
echo -e "${YELLOW}🔨 Force push necessário para sincronizar com GitHub${NC}"
echo "Execute manualmente:"
echo "git push origin main --force"
echo ""

# Deploy revertido será automático via Vercel
echo -e "${GREEN}✅ Rollback concluído localmente!${NC}"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Execute: git push origin main --force"
echo "2. Vercel fará deploy automático da versão anterior"
echo "3. Aguarde 2-5 minutos para deploy completar"
echo "4. Teste em https://katrinadex.xyz"
echo ""
echo -e "${GREEN}✅ Sistema anterior deve estar funcionando novamente!${NC}"

log_action "ROLLBACK CONCLUÍDO"
