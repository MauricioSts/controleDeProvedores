# 🔐 Configuração de Variáveis de Ambiente

## ⚠️ IMPORTANTE - Segurança

As credenciais do Google OAuth foram movidas para variáveis de ambiente para evitar exposição no repositório Git.

## 📋 Como Configurar

### 1. Criar arquivo .env

Na raiz do projeto, crie um arquivo `.env` com o seguinte conteúdo:

```env
VITE_GOOGLE_CLIENT_ID=seu_client_id_aqui
VITE_GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
```

### 2. Preencher as Credenciais

Substitua `seu_client_id_aqui` e `seu_client_secret_aqui` pelas suas credenciais reais do Google Cloud Console.

**Credenciais atuais:**
- Client ID: `184171118487-0plj2f7odi8v40pvfmj0vi8vjlca9bhi.apps.googleusercontent.com`
- Client Secret: `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`

### 3. Verificar .gitignore

O arquivo `.env` já está configurado no `.gitignore` e **NÃO será commitado**.

## 🚀 Deploy (Vercel)

### Configurar Variáveis de Ambiente na Vercel

1. Acesse o [Dashboard da Vercel](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** > **Environment Variables**
4. Adicione as seguintes variáveis:

```
VITE_GOOGLE_CLIENT_ID=184171118487-0plj2f7odi8v40pvfmj0vi8vjlca9bhi.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=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
```

5. Clique em **Save**
6. Faça um novo deploy

## ✅ Verificação

Após configurar:
1. Reinicie o servidor de desenvolvimento (`npm run dev`)
2. O sistema deve funcionar normalmente com as credenciais do .env
3. O arquivo `.env` não aparecerá no Git

## 🔒 Segurança Adicional

Para maior segurança em produção:
1. Considere usar **Vercel Secrets** ou outro serviço de gerenciamento de secrets
2. Para o Client Secret, considere usar um backend (Vercel Functions) para não expor no frontend
3. Use diferentes credenciais para desenvolvimento e produção

## 📝 Nota sobre Client Secret

O Client Secret no frontend é **menos seguro** porque é acessível no código JavaScript. Para maior segurança:
- Use apenas o Client ID no frontend
- Ou use Vercel Functions/backend para gerenciar o secret de forma segura

