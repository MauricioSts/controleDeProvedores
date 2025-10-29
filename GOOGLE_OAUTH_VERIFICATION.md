# ✅ Como Verificar seu App no Google Cloud Console

## 🎯 Objetivo

Remover a tela de aviso "App não verificado" que aparece durante a autenticação OAuth.

## 📋 Passo a Passo para Verificação

### 1. Acessar OAuth Consent Screen

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione o projeto **"provedores-112c7"** (ou seu projeto)
3. Navegue até: **APIs & Services** > **OAuth consent screen**

### 2. Configurar User Type

**Escolha:**
- ✅ **Internal** (se estiver usando Google Workspace - recomendado para uso interno)
- ✅ **External** (para uso público - requer mais verificações)

### 3. Preencher Informações Obrigatórias

#### **App Information:**
- **App name**: `Sistema de Controle de Provedores` (ou outro nome)
- **User support email**: Seu email (ex: `mauriciogear4@gmail.com`)
- **App logo** (opcional): Upload de uma imagem 120x120px
- **Application home page**: `https://providersmanagement.vercel.app`
- **Application privacy policy link**: (obrigatório para External)
- **Application terms of service link**: (opcional, mas recomendado)

#### **Authorized domains:**
- Adicione: `providersmanagement.vercel.app`

#### **Developer contact information:**
- **Email**: Seu email para contato

### 4. Configurar Scopes

Adicione os escopos que você está usando:
- `https://www.googleapis.com/auth/gmail.send`
- `https://www.googleapis.com/auth/gmail.compose`

### 5. Test Users (APENAS para External - Testing)

Se escolheu **External** e o app está em modo "Testing":
- Adicione emails de teste em **Test users**
- Esses usuários poderão usar o app sem verificação completa

### 6. Publicar o App

#### **Opção A: Modo Internal (Google Workspace)**
- Não requer verificação do Google
- Disponível apenas para usuários do seu domínio Google Workspace
- Aprovação automática

#### **Opção B: Modo External - Testing**
1. Clique em **Save and Continue**
2. Na tela de resumo, clique em **Back to Dashboard**
3. O app ficará no modo "Testing"
4. Apenas usuários em "Test users" poderão usar
5. Máximo de 100 usuários de teste

#### **Opção C: Modo External - Publicação**
Para disponibilizar para qualquer usuário:

1. **Complete todas as seções:**
   - App Information
   - Scopes
   - Test users (opcional)

2. **Submeta para Verificação do Google:**
   - Clique em **Publish App** ou **Submit for Verification**
   - O Google revisará seu app (pode levar alguns dias)
   - Você precisará fornecer:
     - Privacy Policy URL
     - Terms of Service URL (recomendado)
     - Vídeo demonstrando o uso do app
     - Descrição detalhada de como os dados são usados

## 🔧 Solução Rápida: Modo Testing

**Para uso imediato sem esperar verificação:**

### 1. Configuração Inicial
- User Type: **External**
- Complete App Information (mínimo necessário)
- Scopes: Adicione os escopos do Gmail

### 2. Adicionar Test Users
1. Vá em **Test users**
2. Clique em **+ ADD USERS**
3. Adicione os emails que usarão o sistema:
   - `mauriciogear4@gmail.com`
   - Outros emails que precisam acessar
4. Clique em **Save**

### 3. Status "Testing"
- O app ficará no modo "Testing"
- Apenas os "Test users" poderão usar sem avisos
- Máximo de 100 usuários

## 📝 Checklist de Configuração

- [ ] OAuth consent screen configurado
- [ ] App name preenchido
- [ ] Email de suporte configurado
- [ ] Scopes adicionados (gmail.send, gmail.compose)
- [ ] Se External: Test users adicionados
- [ ] Se External: Privacy Policy URL configurada
- [ ] App salvo e publicado (Testing ou Production)

## ⚠️ Importante

### Para Apps em Modo Testing:
- ✅ Funciona imediatamente
- ✅ Apenas usuários na lista "Test users" podem usar
- ⚠️ Máximo de 100 usuários
- ⚠️ Ainda mostra aviso "Unverified app" mas permite uso

### Para Apps Públicos:
- ✅ Sem limite de usuários
- ✅ Não mostra avisos para usuários
- ⏳ Requer verificação do Google (processo demorado)
- ⏳ Requer Privacy Policy e documentos

## 🚀 Recomendação

Para começar rapidamente:
1. Use **External** + **Testing mode**
2. Adicione os emails necessários em "Test users"
3. Use o app normalmente
4. Depois, se necessário, submeta para verificação completa

## 🔗 Links Úteis

- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent)
- [Documentação do Google sobre Verificação](https://support.google.com/cloud/answer/9110914)

