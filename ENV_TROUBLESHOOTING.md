# 🔧 Troubleshooting do .env

## ⚠️ Problema Comum

Se o erro começou **depois de criar o .env**, pode ser que:

1. **As variáveis não estão sendo carregadas** pelo Vite
2. **O servidor precisa ser reiniciado** após criar/modificar o .env
3. **O arquivo .env está no formato errado**

## ✅ Verificar se o .env está Correto

Seu arquivo `.env` na **raiz do projeto** deve ter exatamente este formato:

```env
VITE_GOOGLE_CLIENT_ID=seu_client_id_aqui
VITE_GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
```

**Substitua pelos valores reais que você obteve no Google Cloud Console.**

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

3. **Se não funcionar:**
   - Verifique se o arquivo `.env` está na raiz do projeto
   - Confirme que as variáveis começam com `VITE_`
   - Reinicie o servidor após qualquer alteração no `.env`

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

### Opção 1: Verificar arquivo .env
- Abra o `.env` em um editor de texto simples
- Confirme que não há espaços extras
- Confirme que os valores estão corretos
- Salve novamente
- Reinicie o servidor

### Opção 2: Criar .env novamente
1. Delete o `.env` atual
2. Copie o conteúdo de `.env.example`
3. Cole em um novo arquivo `.env`
4. Preencha com suas credenciais reais do Google Cloud Console
5. Salve
6. Reinicie o servidor

### Opção 3: Verificar Google Cloud Console
- Confirme que as credenciais estão corretas no Google Cloud Console
- Se necessário, recrie as credenciais OAuth

## 📝 Nota Importante

No Vite, variáveis de ambiente só funcionam se:
- ✅ Começam com `VITE_`
- ✅ Estão no arquivo `.env` na raiz do projeto
- ✅ O servidor foi reiniciado após modificar o `.env`
- ✅ Não têm espaços ao redor do `=`
