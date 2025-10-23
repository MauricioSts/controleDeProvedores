# 🔥 Configuração do Firebase Authentication

## Passos para configurar o login com Google

### 1. Configurar Authentication no Firebase Console

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto: `provedores-112c7`
3. No menu lateral, clique em **Authentication**
4. Clique na aba **Sign-in method**
5. Clique em **Google** na lista de provedores
6. Ative o toggle **Enable**
7. Configure o **Project support email** (seu email)
8. Clique em **Save**

### 2. Configurar domínios autorizados

1. Na aba **Settings** do Authentication
2. Adicione os domínios autorizados:
   - `localhost` (para desenvolvimento)
   - Seu domínio de produção (quando fizer deploy)

### 3. Configurar OAuth consent screen (se necessário)

1. No [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione seu projeto
3. Vá para **APIs & Services** > **OAuth consent screen**
4. Configure as informações básicas do app
5. Adicione seu email como usuário de teste

### 4. Verificar configuração

O arquivo `src/firebase/config.js` já está configurado com:
- ✅ Firebase App inicializado
- ✅ Authentication configurado
- ✅ Google Provider configurado
- ✅ Firestore configurado

### 5. Testar o login

1. Acesse `http://localhost:5177`
2. Você verá a tela de login
3. Clique em "Entrar com Google"
4. Autorize o acesso
5. Você será redirecionado para o dashboard

## 🔒 Segurança

- O login é obrigatório para acessar qualquer funcionalidade
- Os dados são protegidos por autenticação
- Cada usuário só vê seus próprios dados (se implementado)

## 🚀 Funcionalidades implementadas

- ✅ Login com Google
- ✅ Logout
- ✅ Proteção de rotas
- ✅ Estado de loading
- ✅ Interface responsiva
- ✅ Animações suaves
- ✅ Toast notifications

## 📱 Responsividade

- Funciona em desktop, tablet e mobile
- Interface adaptativa
- Botões otimizados para touch
