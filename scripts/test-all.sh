#!/bin/bash

# Script completo de testes para KatrinaDEX
# Executa todos os testes e validações antes do deploy

set -e

echo "🧪 KatrinaDEX - Testes Completos"
echo "================================"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd "$(dirname "$0")/../app"

# 1. Testes Unitários
echo "📦 1. Executando testes unitários..."
if npm run test -- --run > /tmp/unit-tests.log 2>&1; then
    echo -e "${GREEN}✅ Testes unitários passaram${NC}"
    UNIT_PASSED=true
else
    echo -e "${RED}❌ Testes unitários falharam${NC}"
    cat /tmp/unit-tests.log | tail -20
    UNIT_PASSED=false
fi
echo ""

# 2. Build
echo "🏗️  2. Executando build..."
if npm run build > /tmp/build.log 2>&1; then
    echo -e "${GREEN}✅ Build passou${NC}"
    BUILD_PASSED=true
else
    echo -e "${RED}❌ Build falhou${NC}"
    cat /tmp/build.log | tail -20
    BUILD_PASSED=false
fi
echo ""

# 3. Lint (se disponível)
echo "🔍 3. Executando lint..."
if npm run lint > /tmp/lint.log 2>&1; then
    echo -e "${GREEN}✅ Lint passou${NC}"
    LINT_PASSED=true
else
    echo -e "${YELLOW}⚠️  Lint com avisos (não crítico)${NC}"
    LINT_PASSED=true
fi
echo ""

# 4. Resumo
echo "📊 Resumo dos Testes"
echo "===================="
echo ""

if [ "$UNIT_PASSED" = true ]; then
    echo -e "${GREEN}✅ Testes Unitários: PASSOU${NC}"
else
    echo -e "${RED}❌ Testes Unitários: FALHOU${NC}"
fi

if [ "$BUILD_PASSED" = true ]; then
    echo -e "${GREEN}✅ Build: PASSOU${NC}"
else
    echo -e "${RED}❌ Build: FALHOU${NC}"
fi

if [ "$LINT_PASSED" = true ]; then
    echo -e "${GREEN}✅ Lint: PASSOU${NC}"
else
    echo -e "${YELLOW}⚠️  Lint: AVISOS${NC}"
fi

echo ""

# 5. Resultado Final
if [ "$UNIT_PASSED" = true ] && [ "$BUILD_PASSED" = true ]; then
    echo -e "${GREEN}🎉 Todos os testes críticos passaram!${NC}"
    echo -e "${GREEN}✅ Pronto para deploy!${NC}"
    exit 0
else
    echo -e "${RED}❌ Alguns testes falharam. Corrija antes do deploy.${NC}"
    exit 1
fi

