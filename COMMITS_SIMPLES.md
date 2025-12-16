# 📝 Guia: Commits Simples e Naturais

## 🎯 Objetivo

Fazer commits que pareçam mais "humanos" e menos gerados por IA.

---

## ✅ Como Usar

### Opção 1: Script Automático (Recomendado)

```bash
# Adicionar mudanças e commitar de uma vez
./scripts/simple-commit.sh "fix: bug no withdraw"
./scripts/simple-commit.sh "feat: adiciona gasless"
./scripts/simple-commit.sh "docs: atualiza README"
```

### Opção 2: Manual

```bash
git add .
git commit -m "fix: bug no withdraw"
```

---

## 📋 Exemplos de Mensagens Simples

### ❌ Evitar (muito detalhado):
```
feat: Implement Edge Function TRM check with feature flag
- Add Edge Function /api/trm-check for address screening
- Add TypeScript client lib/trmCheck.ts
- Add comprehensive error handling
- Add rate limiting
- Add feature flag NEXT_PUBLIC_ENABLE_EDGE_COMPLIANCE
```

### ✅ Usar (simples):
```
feat: adiciona verificação TRM
```

ou

```
feat: TRM check
```

---

## 🎨 Padrões Simples

### Tipos de Commit:
- `fix:` - Correção de bug
- `feat:` - Nova funcionalidade
- `docs:` - Documentação
- `refactor:` - Refatoração
- `style:` - Formatação
- `test:` - Testes
- `chore:` - Manutenção

### Exemplos:
```bash
fix: bug no withdraw
feat: gasless withdraw
docs: atualiza README
refactor: simplifica código
test: adiciona testes
chore: atualiza dependências
```

---

## 💡 Dicas

1. **Seja breve:** 1 linha é suficiente
2. **Seja claro:** Descreva o que mudou, não como
3. **Use português:** Se preferir (ou inglês simples)
4. **Evite detalhes:** Não liste todas as mudanças
5. **Commits frequentes:** Vários commits pequenos > 1 commit grande

---

## 🔧 Configuração Automática

O template de commit já está configurado. Quando você fizer:

```bash
git commit
```

O editor vai abrir com o template `.gitmessage` para ajudar.

---

## 📊 Comparação

### Antes (muito detalhado):
```
feat: Implement comprehensive Gasless Withdraw system with Gelato Relay SDK integration
- Add Gelato Relay SDK dependency
- Implement submitGaslessWithdraw function
- Add Edge Function /api/relayer/withdraw
- Add error handling and validation
- Add feature flag NEXT_PUBLIC_ENABLE_GASLESS
- Add comprehensive logging
- Add task status polling
```

### Depois (simples):
```
feat: gasless withdraw
```

ou

```
feat: adiciona gasless withdraw
```

---

**Lembre-se:** Commits simples são mais naturais e menos "suspeitos"! 🎯



