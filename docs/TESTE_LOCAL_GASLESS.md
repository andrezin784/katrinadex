# 🧪 Como Testar Gasless Withdraw Localmente

## 📋 Pré-requisitos

1. ✅ Node.js instalado
2. ✅ Wallet conectada (MetaMask, etc.)
3. ✅ Note válida para withdraw
4. ✅ Fundos na wallet (para testar, mas não será usado no gasless)

## 🚀 Passo a Passo (5 minutos)

### 1. Habilitar Feature Flag

```bash
cd app
echo "NEXT_PUBLIC_ENABLE_GASLESS=true" > .env.local
```

**Verificar se foi criado:**
```bash
cat .env.local
```

**Deve mostrar:**
```
NEXT_PUBLIC_ENABLE_GASLESS=true
```

### 2. Instalar Dependências (se necessário)

```bash
cd app
npm install
```

**Verificar se Gelato SDK está instalado:**
```bash
npm list @gelatonetwork/relay-sdk
```

### 3. Iniciar Servidor Dev

```bash
cd app
npm run dev
```

**Aguardar até ver:**
```
✓ Ready in X seconds
○ Local: http://localhost:3000
```

### 4. Acessar Página de Withdraw

1. Abra o navegador: **http://localhost:3000/withdraw**
2. Conecte sua wallet
3. Certifique-se de estar na rede correta:
   - **Base Sepolia** (chainId: 84532)
   - **Arc Testnet** (chainId: 5042002)

### 5. Preparar Note para Withdraw

1. Cole uma **note válida** no formato:
   ```
   katrina-eth-AMOUNT-SECRET-NULLIFIER
   ```
   Exemplo:
   ```
   katrina-eth-100000000000000000-123456789-987654321
   ```

2. Clique em **"Verify Note"**
3. Aguarde confirmação: ✅ "Note Verified Successfully"

### 6. Configurar Withdraw

1. Digite um **endereço de destino** (fresh address recomendado)
2. **IMPORTANTE:** Ative o toggle **"Gasless Withdraw"**
3. Veja o cálculo de fee:
   - **You receive:** Valor líquido (amount - 0.4%)
   - **Gasless fee (0.4%):** Taxa deduzida

### 7. Executar Gasless Withdraw

1. Clique em **"Withdraw"**
2. **OBSERVE:** Não deve aparecer popup de confirmação de gas!
3. Deve aparecer toast: "Gasless withdrawal submitted (Task ID: ...)"
4. Aguarde polling automático (até 5 minutos)

### 8. Verificar Resultado

**No console do navegador (F12):**
```javascript
// Procure por logs:
{
  type: 'gasless-attempt',
  taskId: '0x...',
  status: 'pending',
  netAmount: '...',
  fee: '...'
}

// Depois:
{
  type: 'gasless-success',
  taskId: '0x...',
  status: 'success',
  txHash: '0x...'
}
```

**No frontend:**
- ✅ Toast de sucesso: "Gasless Withdrawal Successful!"
- ✅ Transaction hash exibido
- ✅ Status: "Success"

## 🔍 Verificações Durante o Teste

### ✅ Checklist de Sucesso

- [ ] Feature flag habilitado (`NEXT_PUBLIC_ENABLE_GASLESS=true`)
- [ ] Servidor dev rodando (`npm run dev`)
- [ ] Wallet conectada
- [ ] Toggle "Gasless Withdraw" ativado
- [ ] **NÃO aparece popup de gas** (diferencial!)
- [ ] Task ID do Gelato aparece no toast
- [ ] Logs estruturados no console
- [ ] Polling funciona (verifica status a cada 5s)
- [ ] Transação executada sem gas do usuário
- [ ] Valor recebido = `amount * 0.996` (0.4% fee)

### ❌ Problemas Comuns

#### 1. "Gasless withdraw is disabled"

**Causa:** Feature flag não habilitado.

**Solução:**
```bash
# Verificar
cat app/.env.local

# Criar/atualizar
echo "NEXT_PUBLIC_ENABLE_GASLESS=true" > app/.env.local

# Reiniciar servidor
# Parar (Ctrl+C) e rodar novamente:
npm run dev
```

#### 2. "Relayer not configured"

**Causa:** `RELAYER` address não configurado para a chain atual.

**Solução:**
1. Verificar `app/src/lib/contracts.ts`
2. Garantir que `RELAYER` está configurado:
   ```typescript
   84532: { // Base Sepolia
     RELAYER: '0x...', // Deve ter endereço válido
   }
   ```

#### 3. Popup de gas ainda aparece

**Causa:** Feature flag não está sendo lido ou código antigo em cache.

**Solução:**
```bash
# Limpar cache do Next.js
cd app
rm -rf .next
npm run dev

# Limpar cache do navegador
# Chrome: Cmd+Shift+Delete (Mac) ou Ctrl+Shift+Delete (Windows)
# Ou abra em aba anônima
```

#### 4. Task fica em "pending" por muito tempo

**Causa:** Gelato pode estar com delay ou transação inválida.

**Solução:**
1. Verificar Task ID no Gelato Dashboard:
   - https://relay.gelato.digital/
   - Cole o Task ID e veja status

2. Verificar se a transação seria válida:
   - Commitment existe no contrato?
   - Prova ZK é válida?
   - Endereço de destino é válido?

3. Verificar logs do console para erros

#### 5. "EURC not supported"

**Causa:** `Relayer.sol` só suporta ETH e USDC.

**Solução:**
- Use withdraw normal para EURC
- Ou teste com ETH/USDC

## 📊 Exemplo de Teste Completo

### Setup:
```bash
# Terminal 1: Servidor
cd app
echo "NEXT_PUBLIC_ENABLE_GASLESS=true" > .env.local
npm run dev
```

### No Navegador:

1. **Acesse:** http://localhost:3000/withdraw
2. **Conecte wallet** (Base Sepolia ou Arc Testnet)
3. **Cole note:** `katrina-eth-100000000000000000-123-456`
4. **Verify Note** → ✅ Success
5. **Digite recipient:** `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`
6. **Ative toggle:** "Gasless Withdraw" ✅
7. **Veja cálculo:**
   - You receive: 0.0996 ETH
   - Gasless fee: 0.0004 ETH
8. **Clique:** "Withdraw"
9. **Resultado esperado:**
   - ✅ Toast: "Gasless withdrawal submitted (Task ID: 0x...)"
   - ✅ **SEM popup de gas!**
   - ✅ Console mostra logs estruturados
   - ✅ Polling automático
   - ✅ Após alguns segundos: "Gasless Withdrawal Successful!"

## 🔍 Debug Avançado

### Ver Logs Estruturados

No console do navegador (F12 → Console):

```javascript
// Filtrar logs do gasless
// Procure por:
{
  type: 'gasless-attempt',
  taskId: '...',
  status: 'pending'
}

// Ou:
{
  type: 'gasless-success',
  taskId: '...',
  txHash: '...'
}

// Ou erros:
{
  type: 'gasless-error',
  error: '...',
  status: 'failed'
}
```

### Verificar Task no Gelato

1. Copie o Task ID do toast ou console
2. Acesse: https://relay.gelato.digital/
3. Cole o Task ID
4. Veja status detalhado

### Verificar Transação no Explorer

Após sucesso, copie o `txHash` e verifique no:
- **Base Sepolia:** https://sepolia.basescan.org/tx/0x...
- **Arc Testnet:** Verificar explorer da Arc

## ✅ Validação Final

Após o teste, verifique:

1. **Transação executada:**
   - ✅ Hash de transação válido
   - ✅ Status: success no explorer
   - ✅ Gas pago por Gelato (não pelo usuário)

2. **Valor recebido:**
   - ✅ Verificar saldo do endereço de destino
   - ✅ Valor = `amount * 0.996` (0.4% fee deduzido)

3. **Logs:**
   - ✅ Logs estruturados no console
   - ✅ Sem erros

4. **UX:**
   - ✅ Sem popup de gas
   - ✅ Feedback claro (toasts)
   - ✅ Polling funciona

## 🎯 Próximo Passo

Se tudo funcionar localmente:

1. **Fazer commit:**
   ```bash
   git add -A
   git commit -m "test: Local testing successful"
   ```

2. **Testar no Preview (Vercel):**
   - Push da branch
   - Aguardar Preview Deployment
   - Testar no ambiente de produção

3. **Se tudo OK:**
   - Merge para `main`
   - Deploy em produção

---

**Dúvidas?** Veja `docs/gasless-withdraw.md` para documentação completa.

