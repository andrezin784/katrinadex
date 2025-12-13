#!/bin/bash
# Script de Deploy - KatrinaDEX

set -e

echo "🚀 Iniciando deploy do KatrinaDEX..."
echo ""

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo ""
    echo "Por favor, crie o arquivo .env com:"
    echo "PRIVATE_KEY=sua_chave_privada_sem_0x"
    echo ""
    echo "Você pode copiar o template:"
    echo "cp .env.example .env"
    echo "E depois editar com sua chave privada"
    exit 1
fi

# Carregar variáveis do .env
source .env

if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ PRIVATE_KEY não encontrada no arquivo .env"
    exit 1
fi

echo "✅ Configuração encontrada"
echo ""

# Perguntar qual rede
echo "Qual rede você quer fazer deploy?"
echo "1) Base Sepolia (84532)"
echo "2) Arc Testnet (5042002)"
echo "3) Ambas"
read -p "Escolha (1-3): " choice

case $choice in
    1)
        echo ""
        echo "📡 Fazendo deploy em Base Sepolia..."
        forge script script/DeployKatrinaDEX.s.sol:DeployKatrinaDEX \
            --rpc-url https://sepolia.base.org \
            --broadcast \
            -vvv
        ;;
    2)
        echo ""
        echo "📡 Fazendo deploy em Arc Testnet..."
        forge script script/DeployKatrinaDEX.s.sol:DeployKatrinaDEX \
            --rpc-url https://rpc.ankr.com/arc_testnet \
            --broadcast \
            -vvv
        ;;
    3)
        echo ""
        echo "📡 Fazendo deploy em Base Sepolia..."
        forge script script/DeployKatrinaDEX.s.sol:DeployKatrinaDEX \
            --rpc-url https://sepolia.base.org \
            --broadcast \
            -vvv
        
        echo ""
        echo "📡 Fazendo deploy em Arc Testnet..."
        forge script script/DeployKatrinaDEX.s.sol:DeployKatrinaDEX \
            --rpc-url https://rpc.ankr.com/arc_testnet \
            --broadcast \
            -vvv
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo ""
echo "✅ Deploy concluído!"
echo "📝 Não esqueça de atualizar app/src/lib/contracts.ts com os novos endereços"

