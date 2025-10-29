# 📧 Configuração do Envio de Relatórios por Email via Gmail API

## ✅ Implementado

O sistema agora está configurado para enviar relatórios em PDF por email usando a **Gmail API do Google**.

## 🔧 Como Funciona

### 1. Autenticação OAuth2
- Quando o usuário clica em "📧 Enviar Relatório", o sistema solicita autenticação com Google
- O usuário autoriza o acesso à conta Gmail para envio de emails
- O token de acesso é usado para enviar o email via Gmail API

### 2. Geração do PDF
- O sistema gera o PDF do relatório automaticamente
- O PDF é convertido para base64 para envio como anexo

### 3. Envio do Email
- O email é enviado para o endereço cadastrado no campo `emailContato` do provedor
- O PDF é anexado ao email
- O assunto inclui o mês e ano do relatório

## 📋 Requisitos

### 1. Credenciais OAuth2 do Google
As credenciais já estão configuradas no arquivo `src/config/googleOAuth.js`:
- **Client ID**: Configurado
- **Client Secret**: Configurado (para uso em servidor, se necessário)
- **Redirect URI**: Configurado para produção e desenvolvimento

### 2. Configuração no Google Cloud Console
Verifique se as seguintes configurações estão corretas:

1. **APIs Habilitadas**:
   - Gmail API (deve estar habilitada no projeto)

2. **OAuth Consent Screen**:
   - Configure a tela de consentimento OAuth
   - Adicione os escopos necessários:
     - `https://www.googleapis.com/auth/gmail.send`
     - `https://www.googleapis.com/auth/gmail.compose`

3. **JavaScript Origins e Redirect URIs**:
   - Adicione as **origens** (sem barra no final):
     - `https://providersmanagement.vercel.app` (produção)
     - `http://localhost:3000` (desenvolvimento)
   - **IMPORTANTE:** O Google Identity Services usa a origem como redirect URI, não um caminho específico

## 🚀 Como Usar

1. **Cadastre o Email do Provedor**:
   - No cadastro ou edição do provedor, preencha o campo "Email de Contato"

2. **Envie o Relatório**:
   - Acesse os detalhes do provedor
   - Clique no botão **"📧 Enviar Relatório"**
   - Na primeira vez, você será solicitado a autorizar o acesso à sua conta Gmail
   - Após autorizar, o email será enviado automaticamente

## ⚙️ Arquivos Criados

1. **`src/config/googleOAuth.js`**
   - Configuração das credenciais OAuth2
   - Escopos e URLs de redirecionamento

2. **`src/utils/gmailSender.js`**
   - Funções para autenticação OAuth2
   - Função para envio de emails com anexos PDF
   - Gerenciamento de tokens de acesso

3. **`src/Pages/DetalheProvedor.jsx`** (atualizado)
   - Função `sendReportByEmail` implementada
   - Geração de PDF e envio automático

## 🔒 Segurança

### Importante sobre o Client Secret
- O `client_secret` não deve ser exposto no frontend em produção
- A implementação atual funciona, mas para maior segurança, considere:
  - Usar Vercel Functions ou outro backend para manter o secret seguro
  - Ou usar apenas Client ID (sem secret) para aplicações web frontend

### Tokens de Acesso
- Os tokens são armazenados na sessão do navegador
- Não são persistidos permanentemente sem autorização do usuário

## 🐛 Troubleshooting

### Erro: "Erro ao autenticar com Google"
- Verifique se a Gmail API está habilitada no Google Cloud Console
- Verifique se os redirect URIs estão configurados corretamente (use apenas a origem, sem caminho)
- Verifique se o OAuth Consent Screen está configurado

### Erro: "redirect_uri_mismatch"
- **Solução:** Veja o arquivo `GOOGLE_OAUTH_FIX.md` para instruções detalhadas
- Adicione no Google Cloud Console:
  - JavaScript Origins: `https://providersmanagement.vercel.app` e `http://localhost:3000`
  - Redirect URIs: `https://providersmanagement.vercel.app` e `http://localhost:3000`
- **IMPORTANTE:** Use apenas a origem, sem `/oauth2callback` ou outros caminhos

### Erro: "Popup foi bloqueado"
- Permita popups para o site no navegador
- Tente novamente após permitir popups

### Email não chega
- Verifique se o email do destinatário está correto
- Verifique a pasta de spam
- Verifique os logs do console para erros específicos

### Primeira autorização não funciona
- Limpe o cache do navegador
- Revogue o acesso nas configurações da conta Google e tente novamente

## 📝 Próximos Passos (Opcional)

1. **Página de Callback OAuth2**:
   - Criar uma página dedicada para o callback (`/oauth2callback`)
   - Melhorar o tratamento de erros e sucesso

2. **Backend Seguro**:
   - Mover a autenticação para Vercel Functions
   - Manter o client_secret seguro no servidor

3. **Gestão de Tokens**:
   - Implementar refresh de tokens
   - Armazenar tokens com segurança

4. **Histórico de Envios**:
   - Registrar quando e para quem os relatórios foram enviados

