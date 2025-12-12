# 🌊 KatrinaDEX - Mixer de Privacidade ZK

[![KatrinaDEX](https://img.shields.io/badge/KatrinaDEX-Privacy%20Mixer-5B0BFF?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMjAwIDYwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxkZWZzPgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJsb2dvR3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNUIwQkZGO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMEQxRkY7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPGZpbHRlciBpZD0iZ2xvdyI+CiAgICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjMiIHJlc3VsdD0iY29sb3JlZEJsdXIiLz4KICAgICAgPGZlTWVyZ2U+CiAgICAgICAgPGZlTWVyZ2VOb2RlIGluPSJjb2xvcmVkQmx1ciIvPgogICAgICAgIDxmZU1lcmdlTm9kZSBpbj0iU291cmNlR3JhcGhpYyIvPgogICAgICA8L2ZlTWVyZ2U+CiAgICA8L2ZpbHRlcj4KICA8L2RlZnM+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTAsIDE1KSI+CiAgICA8cmVjdCB4PSIyIiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTIiIHJ4PSIyIiByeT0iMiIgZmlsbD0idXJsKCNsb2dvR3JhZGllbnQpIiBmaWx0ZXI9InVybCgjZ2xvdykiLz4KICAgIDxyZWN0IHg9IjYiIHk9IjQiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIHJ4PSI0IiByeT0iNCIgZmlsbD0idXJsKCNsb2dvR3JhZGllbnQpIiBmaWx0ZXI9InVybCgjZ2xvdykiLz4KICAgIDxjaXJjbGUgY3g9IjEwIiBjeT0iMTYiIHI9IjIiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPgogICAgPHJlY3QgeD0iOCIgeT0iMTgiIHdpZHRoPSI0IiBoZWlnaHQ9IjYiIHJ4PSIxIiByeT0iMSIgZmlsbD0id2hpdGUiLz4KICA8L2c+CiAgPHRleHQgeD0iMzUiIHk9IjI1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ1cmwoI2xvZ29HcmFkaWVudCkiPkthdHJpbmFERVg8L3RleHQ+CiAgPHRleHQgeD0iMzUiIHk9IjQyIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiMwMEQxRkYiPlBSSVZBQ1kgTUlYRVKgPC90ZXh0Pgo8L3N2Zz4K)](https://katrinadex.com)

> O mixer de privacidade ZK mais bonito e compliant do mercado brasileiro e global. Combina tecnologia de ponta com total conformidade regulatória.

## ✨ Características Principais

- 🔐 **ZK-Proof de Origem Lícita**: Provas ZK que verificam a licitude dos fundos antes do depósito
- 🌀 **Pools Fixos**: Valores pré-definidos (0.1, 0.5, 1, 5, 10 ETH + USDC) para melhor privacidade
- ⚡ **Velocidade Relâmpago**: Provas ZK geradas em menos de 4 segundos no browser
- 🛡️ **100% Compliant**: Integração com FATF, BACEN, OFAC e TRM Labs
- 🌐 **Multi-Chain**: Suporte nativo à Base com integração 1inch + LI.FI + Odos
- 🎨 **Design Cyberpunk**: Interface futurista com gradientes roxo-azul e glassmorphism
- 📱 **Mobile-First**: Totalmente responsivo e otimizado para dispositivos móveis

## 🚀 Começando

### Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18.0.0
- [Foundry](https://getfoundry.sh/) >= 0.2.0
- [Circom](https://docs.circom.io/) >= 2.1.0 (opcional, para desenvolvimento ZK)
- Wallet compatível (MetaMask, Coinbase Wallet, Phantom, etc.)

### Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/katrinadex/katrina-dex.git
   cd katrina-dex
   ```

2. **Instale as dependências do frontend:**
   ```bash
   cd app
   npm install
   ```

3. **Instale as dependências dos contratos:**
   ```bash
   cd ../contracts
   forge install
   ```

4. **Configure as variáveis de ambiente:**
   ```bash
   # Frontend (.env.local)
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   NEXT_PUBLIC_TRM_API_KEY=your_trm_api_key

   # Contracts (.env)
   PRIVATE_KEY=your_private_key
   BASE_RPC_URL=https://mainnet.base.org
   ```

## 🏗️ Arquitetura do Projeto

```
katrina-dex/
├── contracts/           # Smart contracts Foundry
│   ├── src/
│   │   ├── Mixer.sol           # Contrato principal do mixer
│   │   ├── MixerVerifier.sol   # Verificador ZK do mixer
│   │   ├── LicitProofVerifier.sol # Verificador de origem lícita
│   │   └── Relayer.sol         # Relayer para saques anônimos
│   └── script/
│       └── DeployKatrinaDEX.s.sol
├── circuits/            # Circuitos ZK em Circom
│   ├── circuits/
│   │   ├── licitOriginProof.circom
│   │   └── mixer.circom
│   └── build/           # Artefatos compilados
├── app/                 # Frontend Next.js
│   ├── src/app/
│   │   ├── page.tsx            # Homepage
│   │   ├── deposit/            # Página de depósito
│   │   ├── withdraw/           # Página de saque
│   │   ├── dashboard/          # Dashboard pessoal
│   │   └── compliance/         # Página de compliance
│   ├── components/
│   │   ├── ui/                 # Componentes shadcn/ui
│   │   └── providers.tsx       # Providers Web3
│   └── lib/
│       ├── wagmi.ts            # Configuração Web3
│       └── utils.ts            # Utilitários
└── scripts/             # Scripts de deploy e setup
```

## 🔧 Desenvolvimento Local

### 1. Executar os contratos localmente

```bash
cd contracts
# Executar testes
forge test

# Deploy local (Anvil)
anvil
# Em outro terminal:
forge script script/DeployKatrinaDEX.s.sol --rpc-url http://localhost:8545 --private-key $PRIVATE_KEY --broadcast
```

### 2. Executar o frontend

```bash
cd app
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

### 3. Compilar circuitos ZK (opcional)

```bash
cd circuits
npm install
circom circuits/licitOriginProof.circom --r1cs --wasm --sym
circom circuits/mixer.circom --r1cs --wasm --sym
```

## 🚢 Deploy

### Deploy na Base (Mainnet)

```bash
# Configurar variáveis de ambiente
export PRIVATE_KEY=your_private_key
export BASE_RPC_URL=https://mainnet.base.org

# Deploy dos contratos
cd contracts
forge script script/DeployKatrinaDEX.s.sol --rpc-url $BASE_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify

# Build do frontend
cd ../app
npm run build

# Deploy no IPFS + ENS
npm run deploy:ipfs
```

### Deploy Automático com Scripts

```bash
# Executar deploy completo
./scripts/deploy-full.sh
```

## 🔒 Funcionalidades de Segurança

### ZK-Proof de Origem Lícita
- ✅ Verificação de fonte dos fundos via prova ZK
- ✅ Integração com TRM Labs para screening
- ✅ Chainlink oracles para dados externos
- ✅ Merkle proofs para eficiência

### Sistema de Pools Fixos
- ✅ Valores pré-definidos: 0.1, 0.5, 1, 5, 10 ETH
- ✅ Suporte USDC com pools equivalentes
- ✅ Melhor privacidade através de anonimato
- ✅ Redução de ataques de análise de transações

### Compliance Total
- ✅ FATF Guidelines compliance
- ✅ BACEN regulamentação brasileira
- ✅ OFAC sanctions screening
- ✅ Relatórios KYC/AML automáticos

## 🎨 Design System

### Paleta de Cores
```css
--katrina-purple: #5B0BFF
--katrina-blue: #00D1FF
--katrina-dark: #0A0A0A
--katrina-gray: #1A1A1A
```

### Tipografia
- **Sans-serif**: Satoshi Variable + Inter
- **Monospace**: JetBrains Mono

### Componentes
- shadcn/ui + Radix UI primitives
- Framer Motion para animações
- Tailwind CSS para styling
- Glassmorphism effects

## 📊 Roadmap

### Fase 1 (Atual) ✅
- [x] Contratos inteligentes na Base
- [x] Frontend com design cyberpunk
- [x] Integração wallets múltiplas
- [x] ZK-circuits básicos

### Fase 2 (Próxima) 🚧
- [ ] Integração completa 1inch/LI.FI/Odos
- [ ] Relayer network decentralizado
- [ ] Telegram Mini App
- [ ] Referral system

### Fase 3 (Futuro) 📅
- [ ] Cross-chain expansion
- [ ] Governance token
- [ ] Advanced compliance features
- [ ] Mobile app nativa

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia nosso [guia de contribuição](CONTRIBUTING.md) antes de começar.

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📜 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## ⚠️ Disclaimer

**IMPORTANTE**: Este software é fornecido "como está", sem garantias. O uso de mixers de privacidade pode estar sujeito a regulamentações locais. Sempre verifique a conformidade legal antes de usar qualquer serviço de privacidade blockchain.

## 📞 Suporte

- 📧 Email: support@katrinadex.com
- 🐛 Issues: [GitHub Issues](https://github.com/katrinadex/katrina-dex/issues)
- 💬 Discord: [KatrinaDEX Community](https://discord.gg/katrinadex)
- 📱 Telegram: [@katrinadex](https://t.me/katrinadex)

## 🙏 Agradecimentos

- [Tornado Cash](https://tornado.cash/) - Inspiração arquitetural
- [Semaphore](https://semaphore.appliedzkp.org/) - Protocolo ZK
- [Base](https://base.org/) - Chain principal
- [OpenZeppelin](https://openzeppelin.com/) - Contratos seguros

---

<p align="center">
  <strong>Feito com ❤️ pela comunidade crypto brasileira</strong><br>
  <em>Privacidade + Compliance = Futuro da Web3</em>
</p>
