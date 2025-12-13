# 🚀 Deploy Agora - Instruções

## Execute este comando no seu terminal:

```bash
cd contracts
./deploy-secure.sh
```

O script vai:
1. ✅ Pedir sua PRIVATE_KEY (sem mostrar na tela)
2. ✅ Validar o formato
3. ✅ Perguntar qual rede fazer deploy
4. ✅ Executar o deploy
5. ✅ Limpar a chave da memória após o uso

## Ou execute diretamente:

### Base Sepolia:
```bash
cd contracts
read -sp "Digite sua PRIVATE_KEY (sem 0x): " PRIVATE_KEY && echo ""
PRIVATE_KEY=$PRIVATE_KEY forge script script/DeployKatrinaDEX.s.sol:DeployKatrinaDEX --rpc-url https://sepolia.base.org --broadcast -vvv
```

### Arc Testnet:
```bash
cd contracts
read -sp "Digite sua PRIVATE_KEY (sem 0x): " PRIVATE_KEY && echo ""
PRIVATE_KEY=$PRIVATE_KEY forge script script/DeployKatrinaDEX.s.sol:DeployKatrinaDEX --rpc-url https://rpc.ankr.com/arc_testnet --broadcast -vvv
```

### Ambas as redes:
```bash
cd contracts
read -sp "Digite sua PRIVATE_KEY (sem 0x): " PRIVATE_KEY && echo ""

# Base Sepolia
PRIVATE_KEY=$PRIVATE_KEY forge script script/DeployKatrinaDEX.s.sol:DeployKatrinaDEX --rpc-url https://sepolia.base.org --broadcast -vvv

# Arc Testnet  
PRIVATE_KEY=$PRIVATE_KEY forge script script/DeployKatrinaDEX.s.sol:DeployKatrinaDEX --rpc-url https://rpc.ankr.com/arc_testnet --broadcast -vvv
```

## ⚠️ Segurança

- A chave não será salva em nenhum arquivo
- A chave será limpa da memória após o deploy
- Use apenas em ambiente seguro

