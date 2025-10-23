# 🔥 Configuração do Firebase Authentication - GUIA COMPLETO

## ❌ Erro Atual
```
Firebase: Error (auth/configuration-not-found)
```

## ✅ Solução Passo a Passo

### 1. Acesse o Firebase Console
1. Vá para [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Faça login com sua conta Google
3. Selecione o projeto: **provedores-112c7**

### 2. Habilitar Authentication
1. No menu lateral esquerdo, clique em **"Authentication"**
2. Se for a primeira vez, clique em **"Get started"**
3. Vá para a aba **"Sign-in method"**
4. Clique em **"Google"** na lista de provedores
5. **ATIVAR** o toggle **"Enable"**
6. Configure o **"Project support email"** (seu email)
7. Clique em **"Save"**

### 3. Configurar Domínios Autorizados
1. Ainda na aba **"Sign-in method"**
2. Role para baixo até **"Authorized domains"**
3. Adicione os seguintes domínios:
   - `localhost` (já deve estar)
   - `127.0.0.1` (se necessário)
   - Seu domínio de produção (quando fizer deploy)

### 4. Verificar Configuração do Projeto
1. Vá para **"Project settings"** (ícone de engrenagem)
2. Na aba **"General"**, verifique se:
   - **Project ID**: `provedores-112c7`
   - **Web API Key**: `AIzaSyAxzOeyQrTTt4f13fpvLRvN8-eBvC4HhJs`
   - **Auth domain**: `provedores-112c7.firebaseapp.com`

### 5. Configurar OAuth Consent Screen (Google Cloud)
1. Vá para [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione o projeto **provedores-112c7**
3. Vá para **"APIs & Services"** > **"OAuth consent screen"**
4. Se não estiver configurado:
   - Escolha **"External"** e clique **"Create"**
   - Preencha as informações obrigatórias:
     - **App name**: Controle de Provedores
     - **User support email**: seu email
     - **Developer contact information**: seu email
   - Clique **"Save and Continue"**
   - Adicione seu email como **"Test user"**
   - Clique **"Save and Continue"**

### 6. Verificar APIs Habilitadas
1. No Google Cloud Console, vá para **"APIs & Services"** > **"Library"**
2. Procure e certifique-se de que estas APIs estão habilitadas:
   - **Identity and Access Management (IAM) API**
   - **Google+ API** (se disponível)
   - **People API**

### 7. Testar a Configuração
1. Volte para sua aplicação: `http://localhost:5177`
2. Tente fazer login novamente
3. Se ainda der erro, verifique o console do navegador

## 🔧 Verificações Adicionais

### Verificar se o Authentication está ativo:
```bash
# No Firebase Console, Authentication deve mostrar:
Status: ✅ Enabled
Sign-in providers: Google ✅
```

### Verificar configuração no código:
O arquivo `src/firebase/config.js` deve estar assim:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAxzOeyQrTTt4f13fpvLRvN8-eBvC4HhJs",
  authDomain: "provedores-112c7.firebaseapp.com",
  projectId: "provedores-112c7",
  // ... outras configurações
};
```

## 🚨 Problemas Comuns

### 1. "Configuration not found"
- **Causa**: Authentication não foi habilitado
- **Solução**: Siga o passo 2 acima

### 2. "Unauthorized domain"
- **Causa**: Domínio não está na lista de autorizados
- **Solução**: Adicione `localhost` na lista de domínios autorizados

### 3. "Popup blocked"
- **Causa**: Navegador bloqueou o popup
- **Solução**: Permita popups para localhost

### 4. "OAuth consent screen not configured"
- **Causa**: Tela de consentimento não configurada
- **Solução**: Siga o passo 5 acima

## ✅ Teste Final

Após seguir todos os passos:
1. Limpe o cache do navegador (Ctrl+Shift+R)
2. Acesse `http://localhost:5177`
3. Clique em "Entrar com Google"
4. Autorize o acesso
5. Você deve ser redirecionado para o dashboard

## 📞 Se ainda não funcionar

1. Verifique o console do navegador para erros específicos
2. Confirme que todas as configurações estão corretas
3. Teste em uma aba anônima do navegador
4. Verifique se não há bloqueadores de popup ativos
