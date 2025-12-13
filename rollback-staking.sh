#!/bin/bash
# Script de Rollback - Reverte deploy do KatrinaStaking se der problema

echo "🔄 Iniciando rollback do KatrinaStaking..."

# Verificar branch atual
CURRENT_BRANCH=$(git branch --show-current)
echo "Branch atual: $CURRENT_BRANCH"
echo ""

echo "📋 Opções de rollback:"
echo "1. Voltar para branch de backup (backup-before-staking-deploy)"
echo "2. Reverter apenas o último commit"
echo "3. Remover referências do KatrinaStaking do frontend"
echo "4. Cancelar"
read -p "Escolha uma opção (1-4): " option

case $option in
    1)
        echo "🔄 Voltando para branch de backup..."
        git checkout backup-before-staking-deploy
        echo "✅ Rollback completo! Você está na branch de backup."
        echo "⚠️  Os contratos deployados ainda existem na blockchain."
        echo "   Você precisará atualizar o frontend para não usar o KatrinaStaking."
        ;;
    2)
        echo "🔄 Revertendo último commit..."
        git reset --hard HEAD~1
        echo "✅ Código revertido!"
        echo "⚠️  Os contratos deployados ainda existem na blockchain."
        ;;
    3)
        echo "🔄 Removendo referências do frontend..."
        # Aqui você precisaria remover manualmente as referências
        echo "⚠️  Você precisa atualizar manualmente app/src/lib/contracts.ts"
        echo "   Remova as referências ao KatrinaStaking se foram adicionadas."
        ;;
    4)
        echo "❌ Rollback cancelado"
        exit 0
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo ""
echo "✅ Rollback concluído!"

