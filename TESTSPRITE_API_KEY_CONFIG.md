# 🔑 Configuração da API Key do TestSprite

## ⚠️ Problema

A API key fornecida não está sendo aceita pelo TestSprite MCP. Isso pode acontecer por alguns motivos:

1. **API key inválida ou expirada**
2. **API key precisa ser configurada no MCP Server**
3. **Formato incorreto da API key**

---

## 🔧 Soluções

### Opção 1: Verificar API Key

1. Acesse: **https://www.testsprite.com/dashboard/settings/apikey**
2. Verifique se a API key está ativa
3. Gere uma nova API key se necessário
4. Copie a API key completa

### Opção 2: Configurar no MCP Server

A API key pode precisar ser configurada no servidor MCP do Cursor, não apenas como variável de ambiente.

**No Cursor:**
1. Vá em **Settings** → **MCP Servers**
2. Encontre o servidor **TestSprite**
3. Adicione a API key nas configurações:
   ```json
   {
     "apiKey": "sua-api-key-aqui"
   }
   ```

### Opção 3: Usar TestSprite CLI Diretamente

Se o MCP não funcionar, você pode usar o TestSprite CLI diretamente:

```bash
# Instalar TestSprite CLI (se necessário)
npm install -g @testsprite/cli

# Configurar API key
testsprite config set api-key sua-api-key-aqui

# Executar testes
testsprite test --project-path "/Users/andreribeirocaldeira/Desktop/dex katrina"
```

---

## 📋 Status Atual

- ✅ `code_summary.json` criado
- ✅ Estrutura preparada
- ⚠️ API key não aceita pelo MCP
- ⏳ Aguardando configuração correta

---

## 🎯 Próximos Passos

1. **Verificar** se a API key está correta e ativa
2. **Configurar** a API key no MCP Server do Cursor
3. **Ou usar** o TestSprite CLI diretamente
4. **Continuar** com a geração de testes

---

## 💡 Alternativa: Testes Manuais

Se o TestSprite não funcionar, posso ajudar a criar testes manuais usando:
- **Playwright** ou **Cypress** para testes E2E
- **Vitest** ou **Jest** para testes unitários
- **React Testing Library** para testes de componentes

---

**Me avise qual opção você prefere seguir! 🚀**



