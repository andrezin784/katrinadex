#!/bin/bash

# Script de Deploy do GaslessRelayer
# Suporta Base Sepolia e Arc Testnet

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Deploy do GaslessRelayer - KatrinaDEX${NC}"
echo "=========================================="
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "script/DeployGaslessRelayer.s.sol" ]; then
    echo -e "${RED}❌ Erro: Execute este script na pasta contracts/${NC}"
    exit 1
fi

# Verificar se .env existe
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado${NC}"
    echo "Criando .env a partir do .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Arquivo .env criado. Por favor, edite com suas configurações.${NC}"
    else
        echo -e "${RED}❌ .env.example não encontrado${NC}"
        exit 1
    fi
fi

# Carregar variáveis do .env
source .env

# Verificar PRIVATE_KEY
if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${YELLOW}⚠️  PRIVATE_KEY não encontrada no .env${NC}"
    echo -e "${YELLOW}Digite sua private key (ou pressione Enter para usar a do .env):${NC}"
    read -s PRIVATE_KEY_INPUT
    if [ -n "$PRIVATE_KEY_INPUT" ]; then
        export PRIVATE_KEY="$PRIVATE_KEY_INPUT"
    else
        echo -e "${RED}❌ PRIVATE_KEY é obrigatória${NC}"
        exit 1
    fi
fi

# Verificar RPC URLs
if [ -z "$BASE_SEPOLIA_RPC" ]; then
    echo -e "${YELLOW}⚠️  BASE_SEPOLIA_RPC não encontrada${NC}"
    echo -e "${YELLOW}Digite a RPC URL para Base Sepolia:${NC}"
    read BASE_SEPOLIA_RPC_INPUT
    if [ -n "$BASE_SEPOLIA_RPC_INPUT" ]; then
        export BASE_SEPOLIA_RPC="$BASE_SEPOLIA_RPC_INPUT"
    else
        BASE_SEPOLIA_RPC="https://sepolia.base.org"
        echo -e "${YELLOW}Usando RPC padrão: $BASE_SEPOLIA_RPC${NC}"
    fi
fi

if [ -z "$ARC_TESTNET_RPC" ]; then
    echo -e "${YELLOW}⚠️  ARC_TESTNET_RPC não encontrada${NC}"
    echo -e "${YELLOW}Digite a RPC URL para Arc Testnet:${NC}"
    read ARC_TESTNET_RPC_INPUT
    if [ -n "$ARC_TESTNET_RPC_INPUT" ]; then
        export ARC_TESTNET_RPC="$ARC_TESTNET_RPC_INPUT"
    else
        ARC_TESTNET_RPC="https://rpc.arc-testnet.com"
        echo -e "${YELLOW}Usando RPC padrão: $ARC_TESTNET_RPC${NC}"
    fi
fi

# Treasury address (padrão: protocol owner)
TREASURY="${TREASURY:-0x4d149a54658d310c9487671d868a4ce0b6fded96}"

echo ""
echo -e "${BLUE}📋 Configuração:${NC}"
echo "   Treasury: $TREASURY"
echo "   Base Sepolia RPC: $BASE_SEPOLIA_RPC"
echo "   Arc Testnet RPC: $ARC_TESTNET_RPC"
echo ""

# Escolher rede
echo -e "${YELLOW}Escolha a rede para deploy:${NC}"
echo "   1. Base Sepolia (84532)"
echo "   2. Arc Testnet (5042002)"
echo "   3. Ambas"
echo ""
read -p "Opção (1/2/3): " network_choice

case $network_choice in
    1)
        NETWORKS=("84532")
        RPC_URLS=("$BASE_SEPOLIA_RPC")
        ;;
    2)
        NETWORKS=("5042002")
        RPC_URLS=("$ARC_TESTNET_RPC")
        ;;
    3)
        NETWORKS=("84532" "5042002")
        RPC_URLS=("$BASE_SEPOLIA_RPC" "$ARC_TESTNET_RPC")
        ;;
    *)
        echo -e "${RED}❌ Opção inválida${NC}"
        exit 1
        ;;
esac

# Deploy para cada rede
for i in "${!NETWORKS[@]}"; do
    CHAIN_ID="${NETWORKS[$i]}"
    RPC_URL="${RPC_URLS[$i]}"
    
    if [ "$CHAIN_ID" == "84532" ]; then
        CHAIN_NAME="Base Sepolia"
    else
        CHAIN_NAME="Arc Testnet"
    fi
    
    echo ""
    echo -e "${BLUE}🚀 Deployando para $CHAIN_NAME (Chain ID: $CHAIN_ID)...${NC}"
    echo "=========================================="
    
    # Exportar variáveis para o script Foundry
    export PRIVATE_KEY
    export TREASURY
    
    # Fazer deploy
    forge script script/DeployGaslessRelayer.s.sol \
        --rpc-url "$RPC_URL" \
        --broadcast \
        --verify \
        -vvv || {
        echo -e "${RED}❌ Deploy falhou para $CHAIN_NAME${NC}"
        continue
    }
    
    # Extrair endereço do contrato do output
    # O script Foundry imprime o endereço no console.log
    echo ""
    echo -e "${GREEN}✅ Deploy concluído para $CHAIN_NAME${NC}"
    echo ""
    echo -e "${YELLOW}📝 Próximos passos:${NC}"
    echo "   1. Copie o endereço do contrato do output acima"
    echo "   2. Atualize app/src/lib/contracts.ts com o endereço"
    echo "   3. Faça commit e push"
done

echo ""
echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "   - Atualize os endereços em app/src/lib/contracts.ts"
echo "   - Configure variáveis de ambiente no Vercel"
echo "   - Fundir relayer wallet com ETH"

