#!/bin/bash
# Script de Rollback - Reverte para os contratos anteriores se der problema

echo "🔄 Iniciando rollback..."

# Verificar se estamos na branch develop
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "develop" ]; then
    echo "⚠️  Você não está na branch develop. Deseja continuar? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        echo "❌ Rollback cancelado"
        exit 1
    fi
fi

echo "📋 Opções de rollback:"
echo "1. Voltar para a branch de backup (backup-before-security-update)"
echo "2. Reverter apenas o arquivo contracts.ts com endereços antigos"
echo "3. Cancelar"
read -p "Escolha uma opção (1-3): " option

case $option in
    1)
        echo "🔄 Voltando para branch de backup..."
        git checkout backup-before-security-update
        echo "✅ Rollback completo! Você está na branch de backup."
        ;;
    2)
        echo "🔄 Restaurando apenas contracts.ts..."
        # Aqui você precisaria ter os endereços antigos salvos
        echo "⚠️  Você precisa atualizar manualmente app/src/lib/contracts.ts com os endereços antigos"
        echo "📝 Veja o arquivo BACKUP_CONTRACTS.md para os endereços"
        ;;
    3)
        echo "❌ Rollback cancelado"
        exit 0
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo "✅ Rollback concluído!"

