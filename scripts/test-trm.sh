#!/bin/bash

# Script de teste automatizado para Edge Function TRM
# Uso: ./scripts/test-trm.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_DIR="$PROJECT_ROOT/app"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🧪 Testando Edge Function TRM...${NC}"
echo ""

# Verificar se servidor está rodando
echo -e "${YELLOW}1. Verificando se servidor dev está rodando...${NC}"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Servidor dev está rodando${NC}"
else
    echo -e "${RED}❌ Servidor dev não está rodando${NC}"
    echo -e "${YELLOW}💡 Execute: cd app && npm run dev${NC}"
    exit 1
fi

# Teste 1: Feature flag desabilitado (padrão)
echo ""
echo -e "${YELLOW}2. Teste 1: Feature flag DESABILITADO (padrão)${NC}"
RESPONSE=$(curl -s http://localhost:3000/api/trm-check \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"address":"0x1234567890123456789012345678901234567890"}')

if echo "$RESPONSE" | grep -q '"allowed":true'; then
    echo -e "${GREEN}✅ Teste 1 passou${NC}"
    echo "   Resposta: $RESPONSE"
else
    echo -e "${RED}❌ Teste 1 falhou${NC}"
    echo "   Resposta: $RESPONSE"
fi

# Teste 2: Endereço inválido
echo ""
echo -e "${YELLOW}3. Teste 2: Endereço inválido${NC}"
RESPONSE=$(curl -s http://localhost:3000/api/trm-check \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"address":"invalid-address"}')

if echo "$RESPONSE" | grep -q '"allowed":false'; then
    echo -e "${GREEN}✅ Teste 2 passou${NC}"
    echo "   Resposta: $RESPONSE"
else
    echo -e "${RED}❌ Teste 2 falhou${NC}"
    echo "   Resposta: $RESPONSE"
fi

# Teste 3: Endereço bloqueado (endereço zero)
echo ""
echo -e "${YELLOW}4. Teste 3: Endereço bloqueado (mock)${NC}"
RESPONSE=$(curl -s http://localhost:3000/api/trm-check \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"address":"0x0000000000000000000000000000000000000000"}')

if echo "$RESPONSE" | grep -q '"allowed":false'; then
    echo -e "${GREEN}✅ Teste 3 passou${NC}"
    echo "   Resposta: $RESPONSE"
else
    echo -e "${RED}❌ Teste 3 falhou${NC}"
    echo "   Resposta: $RESPONSE"
fi

# Teste 4: Via GET
echo ""
echo -e "${YELLOW}5. Teste 4: Método GET${NC}"
RESPONSE=$(curl -s "http://localhost:3000/api/trm-check?address=0x1234567890123456789012345678901234567890")

if echo "$RESPONSE" | grep -q '"allowed"'; then
    echo -e "${GREEN}✅ Teste 4 passou${NC}"
    echo "   Resposta: $RESPONSE"
else
    echo -e "${RED}❌ Teste 4 falhou${NC}"
    echo "   Resposta: $RESPONSE"
fi

# Verificar feature flag
echo ""
echo -e "${YELLOW}6. Verificando configuração de feature flag...${NC}"
if [ -f "$APP_DIR/.env.local" ]; then
    if grep -q "NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE=true" "$APP_DIR/.env.local"; then
        echo -e "${GREEN}✅ Feature flag HABILITADO em .env.local${NC}"
        echo -e "${YELLOW}💡 Para desabilitar: remova a linha ou mude para false${NC}"
    else
        echo -e "${YELLOW}⚠️  Feature flag DESABILITADO (padrão)${NC}"
        echo -e "${YELLOW}💡 Para habilitar: echo 'NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE=true' > app/.env.local${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Arquivo .env.local não existe (feature flag DESABILITADO por padrão)${NC}"
    echo -e "${YELLOW}💡 Para habilitar: echo 'NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE=true' > app/.env.local${NC}"
fi

echo ""
echo -e "${GREEN}✅ Testes concluídos!${NC}"
echo ""
echo -e "${YELLOW}📋 Próximos passos:${NC}"
echo "   1. Teste no frontend: http://localhost:3000/withdraw"
echo "   2. Abra o console do navegador (F12) para ver logs"
echo "   3. Veja a documentação: docs/COMO_TESTAR_TRM.md"

