# 🧪 Guia de Teste Local - KatrinaStaking

## Pré-requisitos

1. **Foundry instalado** (Anvil incluído)
   ```bash
   foundryup
   ```

## Passo a Passo

### 1. Iniciar Anvil (Blockchain Local)

Abra um terminal e execute:
```bash
anvil
```

Isso vai iniciar uma blockchain local em `http://localhost:8545` com 10 contas pré-fundeadas.

### 2. Fazer Deploy dos Contratos

Em outro terminal, execute:
```bash
cd contracts
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
forge script script/DeployKatrinaStaking.s.sol:DeployKatrinaStaking \
    --rpc-url http://localhost:8545 \
    --broadcast \
    -vv
```

**Copie os endereços dos contratos** que aparecerem no output!

### 3. Testar Interativamente

Execute o script interativo:
```bash
./interact-local.sh
```

Você precisará informar:
- Endereço do Token (do output do deploy)
- Endereço do Staking (do output do deploy)

### 4. Ou Testar Manualmente com Cast

#### Adicionar Pool:
```bash
cast send <STAKING_ADDRESS> "addPool(uint256)" 1000000000000000 \
    --rpc-url http://localhost:8545 \
    --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

#### Aprovar Tokens:
```bash
cast send <TOKEN_ADDRESS> "approve(address,uint256)" <STAKING_ADDRESS> 1000000000000000000000 \
    --rpc-url http://localhost:8545 \
    --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

#### Fazer Stake:
```bash
cast send <STAKING_ADDRESS> "stake(uint256,uint256)" 0 1000000000000000000000 \
    --rpc-url http://localhost:8545 \
    --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

#### Verificar Recompensa:
```bash
cast call <STAKING_ADDRESS> "calculateReward(address,uint256)" <ACCOUNT> 0 \
    --rpc-url http://localhost:8545
```

#### Reclamar Recompensas:
```bash
# Aguarde alguns segundos (ou avance o tempo no Anvil)
cast send <STAKING_ADDRESS> "claim(uint256)" 0 \
    --rpc-url http://localhost:8545 \
    --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### 5. Avançar Tempo no Anvil

Para simular passagem de tempo e gerar recompensas:
```bash
cast rpc evm_increaseTime 86400 --rpc-url http://localhost:8545  # Avança 1 dia
cast rpc evm_mine --rpc-url http://localhost:8545  # Mina um bloco
```

## Conta de Teste Padrão

- **Private Key:** `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- **Address:** `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- **Balance:** 10,000 ETH (no Anvil)

## Verificações Importantes

✅ **Padrão CEI**: Estado atualizado antes de transferências
✅ **Reentrancy Protection**: `nonReentrant` funcionando
✅ **Eventos**: Todos os eventos sendo emitidos
✅ **Validações**: Todas as verificações funcionando

## Troubleshooting

- **Anvil não inicia**: Verifique se a porta 8545 está livre
- **Deploy falha**: Certifique-se que o Anvil está rodando
- **Sem recompensas**: Avance o tempo com `evm_increaseTime`

