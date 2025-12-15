#!/bin/bash

# Script de restauração de checkpoint
# Restaura o estado do projeto a partir de um backup

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

if [ -z "$1" ]; then
    echo -e "${RED}❌ Uso: $0 <backup-file.tar.gz>${NC}"
    echo -e "${YELLOW}💡 Exemplo: $0 backups/backup-pre-enh-20241215-143022.tar.gz${NC}"
    exit 1
fi

BACKUP_FILE="$1"

# Resolver caminho absoluto se for relativo
if [[ ! "$BACKUP_FILE" = /* ]]; then
    BACKUP_FILE="$PROJECT_ROOT/$BACKUP_FILE"
fi

# Verificar se o arquivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Arquivo de backup não encontrado: $BACKUP_FILE${NC}"
    exit 1
fi

# Verificar hash do backup
echo -e "${GREEN}🔍 Verificando integridade do backup...${NC}"
BACKUP_HASH=$(shasum -a 256 "$BACKUP_FILE" | cut -d' ' -f1)
echo -e "   Hash SHA256: ${YELLOW}$BACKUP_HASH${NC}"

# Confirmar restauração
echo -e "${YELLOW}⚠️  ATENÇÃO: Esta operação irá:${NC}"
echo -e "   1. Fazer backup do estado atual"
echo -e "   2. Restaurar arquivos de: ${GREEN}$BACKUP_FILE${NC}"
echo -e "   3. ${RED}SOBRESCREVER${NC} os diretórios: app/, contracts/, circuits/"
echo ""
read -p "Deseja continuar? (digite 'RESTORE' para confirmar): " CONFIRM

if [ "$CONFIRM" != "RESTORE" ]; then
    echo -e "${YELLOW}❌ Restauração cancelada${NC}"
    exit 0
fi

cd "$PROJECT_ROOT"

# Criar backup do estado atual antes de restaurar
CURRENT_BACKUP="$PROJECT_ROOT/backups/backup-before-restore-$(date +%Y%m%d-%H%M%S).tar.gz"
echo -e "${GREEN}📦 Criando backup do estado atual...${NC}"

mkdir -p "$PROJECT_ROOT/backups"
tar -czf "$CURRENT_BACKUP" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='out' \
    --exclude='contracts/cache' \
    --exclude='contracts/out' \
    --exclude='contracts/broadcast' \
    --exclude='circuits/build' \
    --exclude='circuits/node_modules' \
    --exclude='.git' \
    --exclude='backups' \
    app/ \
    contracts/ \
    circuits/ \
    2>/dev/null || true

echo -e "${GREEN}✅ Backup do estado atual salvo em: $CURRENT_BACKUP${NC}"

# Extrair backup
echo -e "${GREEN}📦 Extraindo backup...${NC}"

# Criar diretório temporário para extração
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

cd "$TEMP_DIR"
tar -xzf "$BACKUP_FILE"

# Restaurar arquivos
echo -e "${GREEN}🔄 Restaurando arquivos...${NC}"

# Remover diretórios que serão restaurados (exceto node_modules)
cd "$PROJECT_ROOT"
[ -d "app" ] && rm -rf app
[ -d "contracts" ] && rm -rf contracts
[ -d "circuits" ] && rm -rf circuits

# Copiar arquivos restaurados
cp -r "$TEMP_DIR/app" "$PROJECT_ROOT/" 2>/dev/null || true
cp -r "$TEMP_DIR/contracts" "$PROJECT_ROOT/" 2>/dev/null || true
cp -r "$TEMP_DIR/circuits" "$PROJECT_ROOT/" 2>/dev/null || true

# Restaurar arquivos raiz se existirem
[ -f "$TEMP_DIR/package.json" ] && cp "$TEMP_DIR/package.json" "$PROJECT_ROOT/" 2>/dev/null || true
[ -f "$TEMP_DIR/package-lock.json" ] && cp "$TEMP_DIR/package-lock.json" "$PROJECT_ROOT/" 2>/dev/null || true
[ -f "$TEMP_DIR/README.md" ] && cp "$TEMP_DIR/README.md" "$PROJECT_ROOT/" 2>/dev/null || true
[ -f "$TEMP_DIR/.gitignore" ] && cp "$TEMP_DIR/.gitignore" "$PROJECT_ROOT/" 2>/dev/null || true
[ -f "$TEMP_DIR/vercel.json" ] && cp "$TEMP_DIR/vercel.json" "$PROJECT_ROOT/" 2>/dev/null || true

echo -e "${GREEN}✅ Restauração concluída!${NC}"
echo ""
echo -e "${YELLOW}📋 Próximos passos:${NC}"
echo -e "   1. Reinstalar dependências: ${GREEN}cd app && npm install${NC}"
echo -e "   2. Reinstalar dependências dos contratos: ${GREEN}cd contracts && forge install${NC}"
echo -e "   3. Reinstalar dependências dos circuitos: ${GREEN}cd circuits && npm install${NC}"
echo -e "   4. Testar: ${GREEN}cd app && npm run dev${NC}"

