# Instruções de Deploy

## Pré-requisitos

1. **Arquivo `.env` na pasta `contracts/`** com:
```bash
PRIVATE_KEY=sua_chave_privada_aqui
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
ARC_TESTNET_RPC_URL=https://rpc.ankr.com/arc_testnet
```

## Comandos de Deploy

### Base Sepolia
```bash
cd contracts
forge script script/DeployKatrinaDEX.s.sol:DeployKatrinaDEX \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

### Arc Testnet
```bash
cd contracts
forge script script/DeployKatrinaDEX.s.sol:DeployKatrinaDEX \
  --rpc-url $ARC_TESTNET_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

## Após o Deploy

1. Copie os endereços dos contratos deployados
2. Atualize `app/src/lib/contracts.ts` com os novos endereços
3. Teste as funcionalidades

## Rollback

Se der problema, use:
```bash
./rollback.sh
```

