#!/bin/bash

# Script de checkpoint antes de implementações
# Gera backup reversível do estado atual do projeto

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup-pre-enh-$TIMESTAMP.tar.gz"
CHECKPOINT_LOG="$PROJECT_ROOT/.checkpoint-log"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔒 Gerando checkpoint do projeto KatrinaDEX...${NC}"

# Criar diretório de backups se não existir
mkdir -p "$BACKUP_DIR"

# Verificar se estamos no diretório correto
if [ ! -f "$PROJECT_ROOT/package.json" ] || [ ! -d "$PROJECT_ROOT/contracts" ]; then
    echo -e "${RED}❌ Erro: Execute este script a partir da raiz do projeto KatrinaDEX${NC}"
    exit 1
fi

# Obter hash do estado atual via git
cd "$PROJECT_ROOT"

# Verificar se é um repositório git
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Não é um repositório git. Usando hash alternativo...${NC}"
    STATE_HASH=$(find app contracts circuits -type f 2>/dev/null | xargs shasum -a 256 2>/dev/null | shasum -a 256 | cut -d' ' -f1)
else
    # Obter hash do tree atual
    STATE_HASH=$(git rev-parse HEAD 2>/dev/null || echo "no-git-$(date +%s)")
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
fi

echo -e "${GREEN}📦 Estado atual:${NC}"
echo -e "   Hash: ${YELLOW}$STATE_HASH${NC}"
if [ -d ".git" ]; then
    echo -e "   Branch: ${YELLOW}$CURRENT_BRANCH${NC}"
    echo -e "   Commit: ${YELLOW}$(git log -1 --oneline 2>/dev/null || echo 'N/A')${NC}"
fi

# Criar backup compactado
echo -e "${GREEN}📦 Criando backup compactado...${NC}"

tar -czf "$BACKUP_FILE" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='out' \
    --exclude='contracts/cache' \
    --exclude='contracts/out' \
    --exclude='contracts/broadcast' \
    --exclude='circuits/build' \
    --exclude='circuits/node_modules' \
    --exclude='*.ptau' \
    --exclude='*.zkey' \
    --exclude='*.wtns' \
    --exclude='.git' \
    --exclude='backups' \
    --exclude='.vercel' \
    app/ \
    contracts/ \
    circuits/ \
    package.json \
    package-lock.json \
    README.md \
    .gitignore \
    vercel.json \
    2>/dev/null || {
    echo -e "${RED}❌ Erro ao criar backup${NC}"
    exit 1
}

# Calcular hash SHA256 do backup
BACKUP_HASH=$(shasum -a 256 "$BACKUP_FILE" | cut -d' ' -f1)
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo -e "${GREEN}✅ Backup criado:${NC}"
echo -e "   Arquivo: ${YELLOW}$BACKUP_FILE${NC}"
echo -e "   Tamanho: ${YELLOW}$BACKUP_SIZE${NC}"
echo -e "   Hash SHA256: ${YELLOW}$BACKUP_HASH${NC}"

# Registrar no log de checkpoints
DESCRIPTION="${1:-Checkpoint antes de implementação}"
LOG_ENTRY="$TIMESTAMP|$BACKUP_FILE|$BACKUP_HASH|$STATE_HASH|$DESCRIPTION"

echo "$LOG_ENTRY" >> "$CHECKPOINT_LOG"

echo -e "${GREEN}📝 Registrado em: ${YELLOW}$CHECKPOINT_LOG${NC}"
echo -e "${GREEN}✅ Checkpoint concluído com sucesso!${NC}"
echo ""
echo -e "${YELLOW}💡 Para restaurar este checkpoint:${NC}"
echo -e "   ${GREEN}./scripts/restore-checkpoint.sh $BACKUP_FILE${NC}"

