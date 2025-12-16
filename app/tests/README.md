# 🧪 Testes do KatrinaDEX

Este diretório contém a suíte completa de testes automatizados para o KatrinaDEX.

## 📋 Estrutura

```
tests/
├── e2e/              # Testes end-to-end (Playwright)
│   ├── homepage.spec.ts
│   ├── deposit.spec.ts
│   └── withdraw.spec.ts
├── unit/             # Testes unitários (Vitest)
│   ├── relayer.test.ts
│   └── trmCheck.test.ts
└── setup.ts          # Configuração global dos testes
```

## 🚀 Como Executar

### Testes Unitários (Vitest)

```bash
# Executar todos os testes unitários
npm run test

# Executar com coverage
npm run test:coverage

# Executar em modo watch
npm run test -- --watch
```

### Testes E2E (Playwright)

```bash
# Executar todos os testes E2E
npm run test:e2e

# Executar com UI interativa
npm run test:e2e:ui

# Executar em modo debug
npx playwright test --debug
```

## 📝 Testes Implementados

### E2E Tests

1. **Homepage** (`e2e/homepage.spec.ts`)
   - ✅ Carregamento da página
   - ✅ Hero section
   - ✅ Pool cards
   - ✅ Botões de ação
   - ✅ Features section
   - ✅ Footer e links

2. **Deposit** (`e2e/deposit.spec.ts`)
   - ✅ Carregamento da página
   - ✅ Stepper de deposit
   - ✅ Seleção de token
   - ✅ Campo de valor
   - ✅ Botão de conectar wallet

3. **Withdraw** (`e2e/withdraw.spec.ts`)
   - ✅ Carregamento da página
   - ✅ Opções de withdraw (normal/gasless)
   - ✅ Campo de recipient
   - ✅ Campo de valor
   - ✅ Informações de fee

### Unit Tests

1. **Relayer** (`unit/relayer.test.ts`)
   - ✅ Cálculo de net amount (0.4% fee)
   - ✅ Valores pequenos e grandes
   - ✅ Casos extremos

2. **TRM Check** (`unit/trmCheck.test.ts`)
   - ✅ Requisição para API
   - ✅ Tratamento de erros
   - ✅ Endereços bloqueados

## 🔧 Configuração

### Variáveis de Ambiente

Para testes E2E, certifique-se de que o servidor de desenvolvimento está rodando:

```bash
npm run dev
```

### Mock de Wallet

Os testes E2E podem precisar de mock de wallet. Para isso, use:

```typescript
await page.addInitScript(() => {
  window.ethereum = {
    request: async ({ method, params }) => {
      // Mock responses
    },
  };
});
```

## 📊 Coverage

Para ver o coverage dos testes:

```bash
npm run test:coverage
```

O relatório será gerado em `coverage/`.

## 🐛 Debugging

### Playwright

```bash
# Executar com UI
npm run test:e2e:ui

# Executar um teste específico
npx playwright test homepage

# Executar com trace
npx playwright test --trace on
```

### Vitest

```bash
# Executar em modo watch
npm run test -- --watch

# Executar um arquivo específico
npm run test relayer
```

## 🎯 Próximos Testes

- [ ] Testes de integração com contratos
- [ ] Testes de geração de provas ZK
- [ ] Testes de fluxo completo de deposit/withdraw
- [ ] Testes de edge cases
- [ ] Testes de performance

## 📚 Documentação

- [Playwright Docs](https://playwright.dev)
- [Vitest Docs](https://vitest.dev)
- [Testing Library](https://testing-library.com)

