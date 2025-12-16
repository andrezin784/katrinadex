# 🧪 TestSprite Setup - KatrinaDEX

## ⚠️ Requisito: API Key

O TestSprite requer uma API key para funcionar. Siga os passos abaixo:

---

## 📋 Passo a Passo

### 1. Criar API Key

1. Acesse: **https://www.testsprite.com/dashboard/settings/apikey**
2. Faça login (ou crie uma conta se necessário)
3. Crie uma nova API Key
4. Copie a API Key gerada

### 2. Configurar API Key

Depois de obter a API Key, você pode:

**Opção A: Variável de Ambiente**
```bash
export TESTSPRITE_API_KEY="sua-api-key-aqui"
```

**Opção B: Arquivo de Configuração**
Crie um arquivo `.env.local` na raiz do projeto:
```bash
TESTSPRITE_API_KEY=sua-api-key-aqui
```

### 3. Reiniciar o Servidor

Se o servidor estiver rodando, reinicie:
```bash
cd app
npm run dev
```

### 4. Executar TestSprite

Depois de configurar a API key, execute novamente:
```bash
# O TestSprite vai:
# 1. Gerar PRD padronizado
# 2. Gerar plano de testes
# 3. Executar testes automaticamente
```

---

## ✅ Status Atual

- ✅ **code_summary.json** criado em `testsprite_tests/tmp/code_summary.json`
- ✅ **Estrutura de diretórios** criada
- ⏳ **Aguardando API Key** para continuar

---

## 📊 O que foi preparado

### Tech Stack Identificado:
- TypeScript
- Next.js 16
- React 19
- Tailwind CSS
- Wagmi/Viem (Web3)
- Circom/SnarkJS (ZK Proofs)
- Gelato Relay SDK
- Framer Motion

### Features Identificadas:
1. **Homepage** - Landing page com pools
2. **Deposit** - Depositar tokens com ZK proofs
3. **Withdraw** - Sacar tokens (normal e gasless)
4. **TRM Check API** - Verificação de compliance
5. **Gasless Withdraw API** - Withdraw sem gas
6. **Wallet Connection** - Conexão de carteira Web3
7. **ZK Proof Generation** - Geração de provas ZK

---

## 🎯 Próximos Passos

1. **Obter API Key** do TestSprite
2. **Configurar** a API key
3. **Executar** o TestSprite novamente
4. **Revisar** os testes gerados
5. **Executar** os testes automaticamente

---

## 📝 Notas

- O servidor Next.js está rodando na porta **3000**
- O projeto é um **frontend** (Next.js/React)
- Requer **login** (conexão de carteira) para testar funcionalidades principais
- O TestSprite vai gerar testes automatizados para todas as features

---

**Após configurar a API key, me avise e continuo com a configuração do TestSprite! 🚀**



