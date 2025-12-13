# Backup dos Contratos Antes da Atualização de Segurança

**Data do Backup:** Criado antes do deploy de segurança
**Branch:** backup-before-security-update
**Commit:** Ver arquivo `.backup-commit-hash`

## Endereços dos Contratos Atuais (Funcionando)

### Base Sepolia (Chain ID: 84532)
- **MIXER:** `0x46f123107B2E4f9042de8c6Fb8762f8824ef90f4`
- **RELAYER:** `0x86F4303D695fF43210049EDD49bCaeE99f45810e`
- **MIXER_VERIFIER:** `0x0b1e0846c410e81E1901f58032805FE7D8119E66`
- **COMPLIANCE_ORACLE:** `0x0000000000000000000000000000000000000000` (não configurado)

### Arc Testnet (Chain ID: 5042002)
- **MIXER:** `0x3441cF331Cb75c6BBCa7a34718224C7983eF4636`
- **RELAYER:** `0xD29eA0dAcb69b3e7bd6F3774C1AE24f058ee7851`
- **MIXER_VERIFIER:** `0xF53F0115dd476fab6Bf3F58B33Ad6f88402f23C7`
- **COMPLIANCE_ORACLE:** `0x7C3A70235F1FC08b82c9e53078aAf0a99CDDf386`

## Como Reverter se Der Problema

### Opção 1: Reverter o código
```bash
git checkout backup-before-security-update
# Ou voltar para o commit anterior
git reset --hard HEAD~1
```

### Opção 2: Usar os contratos antigos
Basta atualizar o arquivo `app/src/lib/contracts.ts` com os endereços acima.

### Opção 3: Fazer novo deploy dos contratos antigos
```bash
git checkout backup-before-security-update
forge script contracts/script/DeployKatrinaDEX.s.sol --rpc-url <RPC_URL> --broadcast
```

## Mudanças Feitas na Atualização

1. ✅ Padrão CEI rigoroso nas funções `claim()`
2. ✅ Verificações de saldo antes de transferências
3. ✅ Eventos `EarningsClaimed` adicionados
4. ✅ Função `claimEURCEarnings()` implementada
5. ✅ Melhorias nas funções `relayWithdrawal`
6. ✅ Funções de emergência aprimoradas

