#!/bin/bash
# Script para testar KatrinaStaking localmente

set -e

echo "🚀 Iniciando teste local do KatrinaStaking"
echo ""

# Verificar se Anvil está rodando
if ! curl -s http://localhost:8545 > /dev/null 2>&1; then
    echo "📡 Iniciando Anvil (blockchain local)..."
    anvil --host 0.0.0.0 --port 8545 > /tmp/anvil.log 2>&1 &
    ANVIL_PID=$!
    sleep 3
    echo "✅ Anvil iniciado (PID: $ANVIL_PID)"
    echo "   Para parar: kill $ANVIL_PID"
    echo ""
else
    echo "✅ Anvil já está rodando"
    echo ""
fi

# Obter a primeira conta do Anvil (já tem fundos)
ACCOUNT=$(cast wallet address --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80)
echo "📋 Usando conta de teste: $ACCOUNT"
echo ""

# Fazer deploy
echo "📦 Fazendo deploy dos contratos..."
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
forge script script/DeployKatrinaStaking.s.sol:DeployKatrinaStaking \
    --rpc-url http://localhost:8545 \
    --broadcast \
    -vvv

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📝 Próximos passos:"
echo "   1. Use os comandos do output acima para interagir com o contrato"
echo "   2. Ou use o script interativo: ./interact-local.sh"
echo ""

