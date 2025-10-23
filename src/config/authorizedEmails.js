// Lista de emails autorizados para acessar o sistema
export const AUTHORIZED_EMAILS = [
  'mauriciogear4@gmail.com',
  'contato.yanphelipe@gmail.com',
  'contatomauriciosts@gmail.com'
];

// Função para verificar se um email está autorizado
export const isEmailAuthorized = (email) => {
  if (!email) return false;
  return AUTHORIZED_EMAILS.includes(email.toLowerCase().trim());
};

// Função para obter a lista de emails autorizados (para exibição)
export const getAuthorizedEmails = () => {
  return AUTHORIZED_EMAILS;
};
