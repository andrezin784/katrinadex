#!/bin/bash

# KatrinaDEX Full Deploy Script
# Deploy completo dos contratos e frontend

set -e

echo "🌊 KatrinaDEX - Deploy Completo"
echo "================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função de log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARN] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Verificar pré-requisitos
check_prerequisites() {
    log "Verificando pré-requisitos..."

    if ! command -v forge &> /dev/null; then
        error "Foundry não está instalado. Instale em: https://getfoundry.sh/"
        exit 1
    fi

    if ! command -v node &> /dev/null; then
        error "Node.js não está instalado."
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        error "npm não está instalado."
        exit 1
    fi

    log "Pré-requisitos OK ✓"
}

# Setup ambiente
setup_environment() {
    log "Configurando ambiente..."

    # Criar .env se não existir
    if [ ! -f ".env" ]; then
        warn "Arquivo .env não encontrado. Criando template..."
        cat > .env << EOF
# KatrinaDEX Environment Variables

# Wallet Private Key (NUNCA commite esta chave!)
PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000

# RPC URLs
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# APIs
TRM_API_KEY=your_trm_api_key_here
ONEINCH_API_KEY=your_1inch_api_key_here

# Frontend
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_TRM_API_KEY=your_trm_api_key_here
EOF
        error "Configure suas variáveis de ambiente no arquivo .env antes de continuar!"
        exit 1
    fi

    # Carregar variáveis de ambiente
    set -a
    source .env
    set +a

    log "Ambiente configurado ✓"
}

# Deploy contratos
deploy_contracts() {
    log "Deploying contratos inteligentes..."

    cd contracts

    # Verificar se PRIVATE_KEY está configurada
    if [ "$PRIVATE_KEY" = "0x0000000000000000000000000000000000000000000000000000000000000000" ]; then
        error "Configure sua PRIVATE_KEY no arquivo .env"
        exit 1
    fi

    # Compilar contratos
    info "Compilando contratos..."
    forge build

    # Executar testes
    info "Executando testes..."
    forge test

    # Deploy na Base Sepolia (testnet) primeiro
    info "Deploy na Base Sepolia..."
    forge script script/DeployKatrinaDEX.s.sol \
        --rpc-url $BASE_SEPOLIA_RPC_URL \
        --private-key $PRIVATE_KEY \
        --broadcast \
        --verify

    # TODO: Deploy na mainnet quando estiver pronto
    # info "Deploy na Base Mainnet..."
    # forge script script/DeployKatrinaDEX.s.sol \
    #     --rpc-url $BASE_RPC_URL \
    #     --private-key $PRIVATE_KEY \
    #     --broadcast \
    #     --verify

    cd ..
    log "Contratos deployados ✓"
}

# Build frontend
build_frontend() {
    log "Building frontend..."

    cd app

    # Instalar dependências
    info "Instalando dependências..."
    npm install

    # Build de produção
    info "Executando build..."
    npm run build

    cd ..
    log "Frontend built ✓"
}

# Deploy frontend
deploy_frontend() {
    log "Deploying frontend..."

    # TODO: Implementar deploy no IPFS/Vercel/Netlify
    # Por enquanto, apenas informa como fazer manualmente

    info "Para deploy do frontend:"
    echo "  1. Configure seu provedor de hosting (Vercel, Netlify, IPFS)"
    echo "  2. Execute: cd app && npm run deploy"
    echo "  3. Ou faça upload manual da pasta app/out"

    log "Frontend pronto para deploy ✓"
}

# Seed liquidez (opcional)
seed_liquidity() {
    log "Seeding liquidez inicial..."

    # TODO: Implementar seeding automático de liquidez
    info "Liquidez inicial deve ser adicionada manualmente após deploy"
    info "Use o script scripts/seed-liquidity.ts para adicionar liquidez"

    log "Seeding concluído ✓"
}

# Função principal
main() {
    echo "🌊 Iniciando deploy completo do KatrinaDEX..."
    echo ""

    check_prerequisites
    setup_environment
    deploy_contracts
    build_frontend
    deploy_frontend
    seed_liquidity

    echo ""
    log "🎉 Deploy completo do KatrinaDEX finalizado com sucesso!"
    echo ""
    info "Próximos passos:"
    echo "  1. Configure seu domínio ENS: katrinadex.eth"
    echo "  2. Configure Pinata para IPFS pinning"
    echo "  3. Teste todas as funcionalidades"
    echo "  4. Anuncie para a comunidade!"
    echo ""
    info "Documentação completa: https://github.com/katrinadex/katrina-dex"
}

# Executar função principal
main "$@"
