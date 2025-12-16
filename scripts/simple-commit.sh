#!/bin/bash

# Script para fazer commits mais simples e naturais
# Uso: ./scripts/simple-commit.sh "mensagem simples"

set -e

if [ -z "$1" ]; then
    echo "Uso: ./scripts/simple-commit.sh 'mensagem do commit'"
    echo ""
    echo "Exemplos:"
    echo "  ./scripts/simple-commit.sh 'fix: bug no withdraw'"
    echo "  ./scripts/simple-commit.sh 'feat: adiciona gasless'"
    echo "  ./scripts/simple-commit.sh 'docs: atualiza README'"
    exit 1
fi

MESSAGE="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# Verificar se há mudanças
if [ -z "$(git status --porcelain)" ]; then
    echo "❌ Nenhuma mudança para commitar"
    exit 1
fi

# Adicionar todas as mudanças
git add -A

# Fazer commit com mensagem simples
git commit -m "$MESSAGE"

echo "✅ Commit criado: $MESSAGE"
echo ""
echo "💡 Para fazer push: git push origin main"

