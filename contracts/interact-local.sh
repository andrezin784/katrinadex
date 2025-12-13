#!/bin/bash
# Script interativo para testar KatrinaStaking localmente

set -e

# Configurações
RPC_URL="http://localhost:8545"
PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
ACCOUNT=$(cast wallet address --private-key $PRIVATE_KEY)

echo "🎮 Teste Interativo - KatrinaStaking"
echo "===================================="
echo "Conta: $ACCOUNT"
echo "RPC: $RPC_URL"
echo ""

# Solicitar endereços dos contratos
read -p "Digite o endereço do Token: " TOKEN_ADDRESS
read -p "Digite o endereço do Staking: " STAKING_ADDRESS

echo ""
echo "✅ Contratos configurados!"
echo ""

while true; do
    echo ""
    echo "Escolha uma ação:"
    echo "1) Adicionar Pool (rate: 1000000000000000)"
    echo "2) Aprovar Tokens (1000 tokens)"
    echo "3) Fazer Stake (pool 0, 1000 tokens)"
    echo "4) Verificar Recompensa Pendente"
    echo "5) Reclamar Recompensas"
    echo "6) Fazer Unstake"
    echo "7) Ver Saldo de Tokens"
    echo "8) Ver Informações do Pool"
    echo "9) Sair"
    echo ""
    read -p "Opção: " option
    
    case $option in
        1)
            echo "📝 Adicionando pool..."
            cast send $STAKING_ADDRESS "addPool(uint256)" 1000000000000000 \
                --rpc-url $RPC_URL --private-key $PRIVATE_KEY
            echo "✅ Pool adicionado!"
            ;;
        2)
            echo "📝 Aprovando tokens..."
            cast send $TOKEN_ADDRESS "approve(address,uint256)" $STAKING_ADDRESS 1000000000000000000000 \
                --rpc-url $RPC_URL --private-key $PRIVATE_KEY
            echo "✅ Tokens aprovados!"
            ;;
        3)
            read -p "Pool ID (geralmente 0): " POOL_ID
            read -p "Quantidade (em wei, ex: 1000000000000000000000 para 1000 tokens): " AMOUNT
            echo "📝 Fazendo stake..."
            cast send $STAKING_ADDRESS "stake(uint256,uint256)" $POOL_ID $AMOUNT \
                --rpc-url $RPC_URL --private-key $PRIVATE_KEY
            echo "✅ Stake realizado!"
            ;;
        4)
            read -p "Stake ID (geralmente 0): " STAKE_ID
            echo "📊 Calculando recompensa..."
            REWARD=$(cast call $STAKING_ADDRESS "calculateReward(address,uint256)" $ACCOUNT $STAKE_ID --rpc-url $RPC_URL)
            echo "💰 Recompensa pendente: $REWARD wei"
            ;;
        5)
            read -p "Stake ID (geralmente 0): " STAKE_ID
            echo "📝 Reclamando recompensas..."
            cast send $STAKING_ADDRESS "claim(uint256)" $STAKE_ID \
                --rpc-url $RPC_URL --private-key $PRIVATE_KEY
            echo "✅ Recompensas reclamadas!"
            ;;
        6)
            read -p "Stake ID (geralmente 0): " STAKE_ID
            echo "📝 Fazendo unstake..."
            cast send $STAKING_ADDRESS "unstake(uint256)" $STAKE_ID \
                --rpc-url $RPC_URL --private-key $PRIVATE_KEY
            echo "✅ Unstake realizado!"
            ;;
        7)
            BALANCE=$(cast call $TOKEN_ADDRESS "balanceOf(address)" $ACCOUNT --rpc-url $RPC_URL)
            echo "💰 Saldo: $BALANCE wei"
            ;;
        8)
            read -p "Pool ID (geralmente 0): " POOL_ID
            echo "📊 Informações do Pool $POOL_ID:"
            cast call $STAKING_ADDRESS "getPool(uint256)" $POOL_ID --rpc-url $RPC_URL
            ;;
        9)
            echo "👋 Até logo!"
            exit 0
            ;;
        *)
            echo "❌ Opção inválida"
            ;;
    esac
done

