// Lista centralizada de emails de administradores
export const ADMIN_EMAILS = [
  'mauriciogear4@gmail.com'
];

// Função para verificar se um email é de administrador
export const isAdminEmail = (email) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
};
