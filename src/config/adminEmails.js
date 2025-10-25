// Sistema de níveis de administração
export const ADMIN_LEVELS = {
  PRIMARY: 1,    // mauriciogear4@gmail.com - Acesso total, pode remover outros admins
  SECONDARY: 2   // contato.yanphelipe@gmail.com - Acesso total, mas não pode remover o admin primário
};

// Configuração de administradores com níveis
export const ADMIN_CONFIG = {
  'mauriciogear4@gmail.com': {
    level: ADMIN_LEVELS.PRIMARY,
    name: 'Mauricio Santos',
    canRemoveAdmins: true
  },
  'contato.yanphelipe@gmail.com': {
    level: ADMIN_LEVELS.SECONDARY,
    name: 'Yan Phelipe',
    canRemoveAdmins: false
  }
};

// Lista de emails de administradores (para compatibilidade)
export const ADMIN_EMAILS = Object.keys(ADMIN_CONFIG);

// Função para verificar se um email é de administrador
export const isAdminEmail = (email) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
};

// Função para obter informações do administrador
export const getAdminInfo = (email) => {
  if (!email) return null;
  return ADMIN_CONFIG[email.toLowerCase().trim()] || null;
};

// Função para verificar se pode remover outros administradores
export const canRemoveAdmins = (email) => {
  const adminInfo = getAdminInfo(email);
  return adminInfo ? adminInfo.canRemoveAdmins : false;
};

// Função para verificar se é administrador primário
export const isPrimaryAdmin = (email) => {
  const adminInfo = getAdminInfo(email);
  return adminInfo ? adminInfo.level === ADMIN_LEVELS.PRIMARY : false;
};
