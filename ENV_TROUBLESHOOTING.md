# 🔧 Troubleshooting do .env

## ⚠️ Problema Comum

Se o erro começou **depois de criar o .env**, pode ser que:

1. **As variáveis não estão sendo carregadas** pelo Vite
2. **O servidor precisa ser reiniciado** após criar/modificar o .env
3. **O arquivo .env está no formato errado**

## ✅ Verificar se o .env está Correto

Seu arquivo `.env` na **raiz do projeto** deve ter exatamente este formato:

```env
VITE_GOOGLE_CLIENT_ID=184171118487-0plj2f7odi8v40pvfmj0vi8vjlca9bhi.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=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
```

### ❌ Erros Comuns:

1. **Espaços ao redor do =**
   ```env
   ❌ VITE_GOOGLE_CLIENT_ID = valor
   ✅ VITE_GOOGLE_CLIENT_ID=valor
   ```

2. **Aspas desnecessárias**
   ```env
   ❌ VITE_GOOGLE_CLIENT_ID="valor"
   ✅ VITE_GOOGLE_CLIENT_ID=valor
   ```

3. **Espaços no início da linha**
   ```env
   ❌  VITE_GOOGLE_CLIENT_ID=valor
   ✅ VITE_GOOGLE_CLIENT_ID=valor
   ```

4. **Linhas vazias ou comentários mal formatados**
   ```env
   ❌ # Comentário
   VITE_GOOGLE_CLIENT_ID=valor
   ✅ VITE_GOOGLE_CLIENT_ID=valor # Comentário inline não funciona
   ```

## 🔄 Solução Rápida

1. **Reinicie o servidor de desenvolvimento:**
   ```bash
   # Pare o servidor (Ctrl+C)
   npm run dev
   ```

2. **Verifique no console do navegador:**
   - Abra o console (F12)
   - Você deve ver: `🔑 Client ID carregado: ✅ Sim`
   - Se aparecer `❌ Não`, as variáveis não estão sendo carregadas

3. **Se não funcionar, use o fallback:**
   - O código agora tem valores de fallback hardcoded
   - Mesmo sem .env, deve funcionar
   - Você verá um aviso: `⚠️ Usando fallback hardcoded`

## 🎯 Verificar se Está Funcionando

1. Abra o console do navegador (F12)
2. Recarregue a página
3. Procure por:
   ```
   🔑 Client ID carregado: ✅ Sim
   🔑 Client Secret carregado: ✅ Sim
   ```

Se aparecer `✅ Sim`, está correto!

## 🚨 Se Ainda Não Funcionar

### Opção 1: Remover o .env temporariamente
- Delete ou renomeie o arquivo `.env`
- O código usará os valores de fallback
- Reinicie o servidor

### Opção 2: Verificar arquivo .env
- Abra o `.env` em um editor de texto simples
- Confirme que não há espaços extras
- Salve novamente
- Reinicie o servidor

### Opção 3: Criar .env novamente
1. Delete o `.env` atual
2. Copie o conteúdo de `.env.example`
3. Cole em um novo arquivo `.env`
4. Salve
5. Reinicie o servidor

## 📝 Nota Importante

No Vite, variáveis de ambiente só funcionam se:
- ✅ Começam com `VITE_`
- ✅ Estão no arquivo `.env` na raiz do projeto
- ✅ O servidor foi reiniciado após modificar o `.env`
- ✅ Não têm espaços ao redor do `=`

