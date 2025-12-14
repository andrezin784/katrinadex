#!/bin/bash

# ===========================================
# KATRINADEX - DEPLOY SIMPLES
# ===========================================

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           KATRINADEX - DEPLOY NA BASE SEPOLIA                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

read -sp "🔑 Cole sua PRIVATE KEY (sem 0x): " PRIVATE_KEY
echo ""
echo ""

if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Private key não pode ser vazia"
    exit 1
fi

RPC_URL="https://sepolia.base.org"

echo "🚀 Iniciando deploy na Base Sepolia..."
echo ""

cd "/Users/andreribeirocaldeira/Desktop/dex katrina/contracts"

PRIVATE_KEY=$PRIVATE_KEY forge script script/DeployKatrinaDEX.s.sol:DeployKatrinaDEX \
    --rpc-url $RPC_URL \
    --broadcast \
    -vvv

echo ""
echo "✅ Deploy finalizado!"








