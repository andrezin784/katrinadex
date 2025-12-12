#!/bin/bash

# ===========================================
# KATRINADEX - DEPLOY NA TESTNET (BASE SEPOLIA)
# ===========================================
# 
# Este script faz o deploy dos contratos e configura
# sua carteira como owner para receber as taxas.
#
# ===========================================

set -e

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           KATRINADEX - DEPLOY NA BASE SEPOLIA                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Verificar se o Foundry está instalado
if ! command -v forge &> /dev/null; then
    echo "❌ Foundry não encontrado. Instale com: curl -L https://foundry.paradigm.xyz | bash"
    exit 1
fi

# Solicitar informações
echo "📋 Configuração do Deploy"
echo "========================="
echo ""

read -p "🔑 Cole sua PRIVATE KEY (sem 0x): " PRIVATE_KEY
echo ""

read -p "💰 Cole o endereço da sua carteira (que vai receber as taxas): " OWNER_ADDRESS
echo ""

# Validar inputs
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Private key não pode ser vazia"
    exit 1
fi

if [ -z "$OWNER_ADDRESS" ]; then
    echo "❌ Owner address não pode ser vazio"
    exit 1
fi

# Configurar RPC
RPC_URL="https://sepolia.base.org"

echo ""
echo "⚙️  Configuração:"
echo "   Network: Base Sepolia (Testnet)"
echo "   RPC: $RPC_URL"
echo "   Owner: $OWNER_ADDRESS"
echo ""

read -p "✅ Confirmar deploy? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "❌ Deploy cancelado"
    exit 0
fi

echo ""
echo "🚀 Iniciando deploy..."
echo ""

# Navegar para a pasta de contratos
cd "$(dirname "$0")/../contracts"

# Fazer o deploy
forge script script/DeployKatrinaDEX.s.sol:DeployKatrinaDEX \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast \
    -vvv

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    ✅ DEPLOY CONCLUÍDO!                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📝 Os endereços dos contratos foram exibidos acima."
echo "💰 Sua carteira ($OWNER_ADDRESS) agora recebe 0.3% de taxa em cada saque."
echo ""
echo "⚠️  IMPORTANTE: Guarde os endereços dos contratos!"
echo ""

