# 📧 Configuração do Envio de Relatórios por Email

## Como Configurar o EmailJS

O sistema está pronto para enviar relatórios por email usando o EmailJS. Siga os passos abaixo para configurar:

### 1. Criar Conta no EmailJS

1. Acesse [https://www.emailjs.com/](https://www.emailjs.com/)
2. Crie uma conta gratuita (plano gratuito permite 200 emails/mês)
3. Faça login no dashboard

### 2. Criar um Serviço de Email

1. No dashboard, vá em **Email Services**
2. Clique em **Add New Service**
3. Escolha seu provedor de email (Gmail, Outlook, etc.)
4. Siga as instruções para conectar sua conta de email
5. Copie o **Service ID** gerado

### 3. Criar um Template de Email

1. Vá para **Email Templates**
2. Clique em **Create New Template**
3. Configure o template com os seguintes campos:
   - **To Email**: `{{to_email}}`
   - **Subject**: `{{subject}}`
   - **Body**: Use os campos disponíveis:
     - `{{company_name}}` - Nome da empresa
     - `{{report_month}}` - Mês do relatório
     - `{{report_year}}` - Ano do relatório

**Exemplo de Template:**
```
Assunto: {{subject}}

Olá,

Segue em anexo o relatório mensal de {{report_month}}/{{report_year}} referente à empresa {{company_name}}.

Atenciosamente,
Sistema de Controle de Provedores
```

4. Salve o template e copie o **Template ID**

### 4. Obter Public Key

1. Vá para **Account** > **General**
2. Copie sua **Public Key**

### 5. Configurar no Projeto

1. Abra o arquivo `src/config/emailjs.js`
2. Substitua os valores:

```javascript
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'seu_service_id_aqui',
  TEMPLATE_ID: 'seu_template_id_aqui',
  PUBLIC_KEY: 'sua_public_key_aqui',
};
```

### 6. Testar

1. Abra um provedor que tenha email de contato cadastrado
2. Clique no botão **"📧 Enviar Relatório"**
3. Verifique se o email foi enviado

## Observações Importantes

- O EmailJS gratuito tem limite de 200 emails/mês
- Para anexos PDF, você pode precisar usar o plano pago ou implementar uma solução alternativa
- O PDF é enviado como base64 no campo `pdf_base64` do template
- Para anexos reais, considere usar Firebase Storage + Cloud Functions

