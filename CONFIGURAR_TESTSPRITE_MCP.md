# 🔧 Como Configurar TestSprite MCP no Cursor

## ⚠️ Problema Atual

A API key não está sendo reconhecida pelo MCP Server do Cursor. Isso acontece porque a API key precisa ser configurada **nas configurações do MCP Server**, não apenas como variável de ambiente.

---

## 📋 Passo a Passo

### 1. Abrir Configurações do Cursor

1. No Cursor, pressione `Cmd + ,` (Mac) ou `Ctrl + ,` (Windows/Linux)
2. Ou vá em **Cursor** → **Settings** (Mac) / **File** → **Preferences** → **Settings** (Windows/Linux)

### 2. Encontrar MCP Servers

1. Na barra de busca das configurações, digite: **"MCP"** ou **"Model Context Protocol"**
2. Procure por **"MCP Servers"** ou **"Model Context Protocol Servers"**

### 3. Configurar TestSprite

Você deve ver uma lista de servidores MCP. Procure por **"TestSprite"** ou adicione um novo:

```json
{
  "mcpServers": {
    "testsprite": {
      "command": "npx",
      "args": [
        "-y",
        "@testsprite/mcp-server"
      ],
      "env": {
        "TESTSPRITE_API_KEY": "sk-user-bh_R5sH-7-15GYw-Crwv3Pe3QNMFn4m3KnXPolq-SkjIfeZKdJ0CYRJkB7cW-iGngmrhPtAlrJVpkblt6trbVQhoBOsLqjRO9PboaaC8HqxCeD4SfmhDCRA6zOBTDinWmaQ"
      }
    }
  }
}
```

### 4. Alternativa: Arquivo de Configuração

Se não encontrar nas configurações, o arquivo de configuração do Cursor geralmente está em:

**Mac:**
```
~/Library/Application Support/Cursor/User/globalStorage/mcp.json
```

**Windows:**
```
%APPDATA%\Cursor\User\globalStorage\mcp.json
```

**Linux:**
```
~/.config/Cursor/User/globalStorage/mcp.json
```

Adicione a configuração acima neste arquivo.

### 5. Reiniciar Cursor

Após configurar, **reinicie completamente o Cursor** para que as mudanças tenham efeito.

---

## 🧪 Testar Após Configuração

Depois de reiniciar, peça ao assistente para testar novamente:

```
"pode testar se ta funcionando"
```

Ou tente gerar o PRD:

```
"gerar PRD padronizado do TestSprite"
```

---

## 🔍 Verificar se Está Funcionando

Se a configuração estiver correta, você deve conseguir:

1. ✅ Gerar PRD padronizado
2. ✅ Gerar plano de testes frontend
3. ✅ Executar testes automaticamente

---

## ❌ Se Ainda Não Funcionar

### Opção 1: Verificar API Key

1. Acesse: **https://www.testsprite.com/dashboard/settings/apikey**
2. Verifique se a API key está **ativa**
3. Gere uma **nova API key** se necessário
4. Copie a nova API key e atualize a configuração

### Opção 2: Usar TestSprite CLI

Se o MCP não funcionar, podemos instalar o TestSprite CLI:

```bash
npm install -g @testsprite/cli
testsprite config set api-key sua-api-key
testsprite test --project-path "/Users/andreribeirocaldeira/Desktop/dex katrina"
```

### Opção 3: Testes Manuais

Posso criar testes automatizados usando:
- **Playwright** para testes E2E
- **Vitest** para testes unitários
- **React Testing Library** para componentes

---

## 📝 Status Atual

- ✅ `code_summary.json` criado
- ✅ Estrutura preparada
- ⚠️ API key precisa ser configurada no MCP Server
- ⏳ Aguardando configuração

---

**Após configurar, me avise para testarmos novamente! 🚀**


