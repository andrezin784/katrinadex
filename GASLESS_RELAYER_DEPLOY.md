# 🚀 Gasless Relayer - Guia de Deploy e Configuração

Sistema completo de withdrawals gasless para KatrinaDEX usando EIP-712 meta-transactions.

## 📋 Resumo

O sistema permite que usuários façam withdrawals **sem pagar gas**, pagando apenas uma fee de **0.4%** deduzida do valor retirado. O relayer paga o gas e recebe a fee como compensação.

## 🏗️ Arquitetura

1. **Contrato GaslessRelayer** (`contracts/src/GaslessRelayer.sol`)
   - Verifica assinaturas EIP-712
   - Executa withdraw no Mixer
   - Deduz fee de 0.4% e envia para treasury
   - Replay protection com nonces

2. **Frontend** (`app/src/app/withdraw/page.tsx`)
   - Toggle "Gasless Withdraw"
   - Assina mensagem EIP-712
   - Envia para API `/api/relay`

3. **API Route** (`app/src/app/api/relay/route.ts`)
   - Valida requisição
   - Rate limiting
   - Submete transação pagando gas

## 🔧 Deploy do Contrato

### 1. Preparar Ambiente

```bash
cd contracts
cp .env.example .env
# Editar .env com PRIVATE_KEY
```

### 2. Deploy GaslessRelayer

```bash
# Base Sepolia
forge script script/DeployGaslessRelayer.s.sol \
  --rpc-url $BASE_SEPOLIA_RPC \
  --broadcast \
  --verify

# Arc Testnet
forge script script/DeployGaslessRelayer.s.sol \
  --rpc-url $ARC_TESTNET_RPC \
  --broadcast \
  --verify
```

### 3. Configurar Whitelist de Pool Amounts

O script de deploy já faz isso automaticamente, mas você pode atualizar manualmente:

```solidity
// Exemplo via cast
cast send $GASLESS_RELAYER_ADDRESS \
  "batchWhitelistPoolAmounts(uint256[],bool)" \
  "[10000000000000000,100000000000000000,500000000000000000,1000000000000000000,5000000000000000000]" \
  true \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY
```

### 4. Atualizar Frontend

Atualizar `app/src/lib/contracts.ts` com o endereço deployado:

```typescript
GASLESS_RELAYER: '0x...', // Endereço deployado
```

## ⚙️ Configuração do Backend

### 1. Variáveis de Ambiente

Criar `.env.local` na raiz do projeto `app/`:

```env
# RPC URLs
RPC_URL_84532=https://sepolia.base.org  # Base Sepolia
RPC_URL_5042002=https://rpc.arc-testnet.com  # Arc Testnet
RPC_URL=https://sepolia.base.org  # Default

# Relayer Wallet (deve ter ETH para pagar gas)
RELAYER_PRIVATE_KEY=0x...

# Gasless Relayer Addresses
GASLESS_RELAYER_84532=0x...  # Base Sepolia
GASLESS_RELAYER_5042002=0x...  # Arc Testnet
GASLESS_RELAYER_ADDRESS=0x...  # Default
```

### 2. Fundir Relayer Wallet

O relayer precisa de ETH para pagar gas. Fundir com ETH suficiente:

```bash
# Verificar saldo
cast balance $RELAYER_ADDRESS --rpc-url $RPC_URL

# Recomendado: manter pelo menos 0.1 ETH por rede
```

### 3. Configurar Treasury

O treasury recebe as fees de 0.4%. Configurar no contrato:

```solidity
cast send $GASLESS_RELAYER_ADDRESS \
  "setTreasury(address)" \
  $TREASURY_ADDRESS \
  --rpc-url $RPC_URL \
  --private-key $OWNER_PRIVATE_KEY
```

## 🧪 Testes

### 1. Testar Localmente

```bash
# Iniciar servidor de desenvolvimento
cd app
npm run dev

# Testar endpoint
curl -X POST http://localhost:3000/api/relay \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0x...",
    "poolAmount": "100000000000000000",
    "poolIndex": 1,
    "token": "0x0000000000000000000000000000000000000000",
    "proofA": ["...", "..."],
    "proofB": [["...", "..."], ["...", "..."]],
    "proofC": ["...", "..."],
    "proofInput": ["...", "...", "..."],
    "signature": "0x...",
    "deadline": "1234567890",
    "chainId": 84532
  }'
```

### 2. Testar no Frontend

1. Fazer um deposit normal
2. Ir para página de withdraw
3. Colar a private note
4. Ativar toggle "Gasless Withdraw"
5. Verificar cálculo de fees
6. Preencher recipient address
7. Clicar em "Withdraw Funds"
8. Assinar mensagem EIP-712
9. Aguardar confirmação

## 🔒 Segurança

### Rate Limiting
- 10 requisições por minuto por IP
- Implementado na API route
- Em produção, usar Redis

### Validações
- ✅ Assinatura EIP-712 verificada on-chain
- ✅ Deadline verificado
- ✅ Nonce para replay protection
- ✅ Whitelist de pool amounts
- ✅ Gas estimation antes de enviar

### Recomendações
- Monitorar saldo do relayer
- Alertas quando saldo < 0.05 ETH
- Logs de todas as transações
- Monitorar rate limits

## 📊 Monitoramento

### Métricas Importantes
- Taxa de sucesso de transações
- Gas usado por transação
- Saldo do relayer
- Número de requisições por hora
- Fees coletadas

### Logs
A API route já inclui logs básicos. Em produção, adicionar:
- Structured logging (JSON)
- Error tracking (Sentry)
- Analytics (PostHog/Mixpanel)

## 🐛 Troubleshooting

### "Relayer out of funds"
- Fundir relayer wallet com mais ETH

### "Rate limit exceeded"
- Aguardar 1 minuto ou usar IP diferente

### "Signature expired"
- Gerar nova assinatura (deadline de 1 hora)

### "Transaction would fail"
- Verificar se commitment existe
- Verificar se nullifier já foi usado
- Verificar se pool amount está whitelisted

## 📝 Checklist de Deploy

- [ ] Contrato GaslessRelayer deployado
- [ ] Contrato verificado no explorer
- [ ] Pool amounts whitelisted
- [ ] Treasury configurado
- [ ] Frontend atualizado com endereço
- [ ] Variáveis de ambiente configuradas
- [ ] Relayer wallet fundido com ETH
- [ ] Testes locais passando
- [ ] Testes em testnet passando
- [ ] Monitoramento configurado

## 🔄 Atualizações Futuras

- [ ] Suporte a múltiplos relayers (load balancing)
- [ ] Gas price optimization
- [ ] Retry logic para transações falhadas
- [ ] Dashboard de monitoramento
- [ ] Auto-refill do relayer wallet

