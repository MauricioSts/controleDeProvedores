// Configuração do EmailJS para envio de relatórios
// Para configurar:
// 1. Acesse https://www.emailjs.com/ e crie uma conta
// 2. Crie um serviço de email (Gmail, Outlook, etc.)
// 3. Crie um template de email
// 4. Substitua os valores abaixo com suas credenciais

export const EMAILJS_CONFIG = {
  SERVICE_ID: 'YOUR_SERVICE_ID', // Substitua com seu Service ID
  TEMPLATE_ID: 'YOUR_TEMPLATE_ID', // Substitua com seu Template ID
  PUBLIC_KEY: 'YOUR_PUBLIC_KEY', // Substitua com sua Public Key
};

// Verificar se o EmailJS está configurado
export const isEmailJSConfigured = () => {
  return (
    EMAILJS_CONFIG.SERVICE_ID !== 'YOUR_SERVICE_ID' &&
    EMAILJS_CONFIG.TEMPLATE_ID !== 'YOUR_TEMPLATE_ID' &&
    EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_PUBLIC_KEY'
  );
};

