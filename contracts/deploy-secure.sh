#!/bin/bash
# Script de Deploy Seguro - KatrinaDEX

set -e

echo "🚀 Deploy do KatrinaDEX - Melhorias de Segurança"
echo ""
echo "⚠️  IMPORTANTE: Sua chave privada será usada apenas para o deploy"
echo "   e não será salva em nenhum arquivo permanente."
echo ""

# Solicitar chave privada de forma segura (sem mostrar na tela)
read -sp "Digite sua PRIVATE_KEY (sem 0x): " PRIVATE_KEY
echo ""
echo ""

if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Chave privada não fornecida!"
    exit 1
fi

# Remover 0x se o usuário digitou
PRIVATE_KEY=${PRIVATE_KEY#0x}

# Validar formato básico (deve ter 64 caracteres hexadecimais)
if [[ ! "$PRIVATE_KEY" =~ ^[0-9a-fA-F]{64}$ ]]; then
    echo "❌ Formato inválido! A chave deve ter 64 caracteres hexadecimais."
    exit 1
fi

echo "✅ Chave privada recebida"
echo ""

# Perguntar qual rede
echo "Qual rede você quer fazer deploy?"
echo "1) Base Sepolia (84532)"
echo "2) Arc Testnet (5042002)"
echo "3) Ambas as redes"
read -p "Escolha (1-3): " choice
echo ""

case $choice in
    1)
        echo "📡 Fazendo deploy em Base Sepolia..."
        PRIVATE_KEY=$PRIVATE_KEY forge script script/DeployKatrinaDEX.s.sol:DeployKatrinaDEX \
            --rpc-url https://sepolia.base.org \
            --broadcast \
            -vvv
        ;;
    2)
        echo "📡 Fazendo deploy em Arc Testnet..."
        PRIVATE_KEY=$PRIVATE_KEY forge script script/DeployKatrinaDEX.s.sol:DeployKatrinaDEX \
            --rpc-url https://rpc.ankr.com/arc_testnet \
            --broadcast \
            -vvv
        ;;
    3)
        echo "📡 Fazendo deploy em Base Sepolia..."
        PRIVATE_KEY=$PRIVATE_KEY forge script script/DeployKatrinaDEX.s.sol:DeployKatrinaDEX \
            --rpc-url https://sepolia.base.org \
            --broadcast \
            -vvv
        
        echo ""
        echo "📡 Fazendo deploy em Arc Testnet..."
        PRIVATE_KEY=$PRIVATE_KEY forge script script/DeployKatrinaDEX.s.sol:DeployKatrinaDEX \
            --rpc-url https://rpc.ankr.com/arc_testnet \
            --broadcast \
            -vvv
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

# Limpar a variável da memória
unset PRIVATE_KEY

echo ""
echo "✅ Deploy concluído!"
echo "📝 Não esqueça de atualizar app/src/lib/contracts.ts com os novos endereços"

