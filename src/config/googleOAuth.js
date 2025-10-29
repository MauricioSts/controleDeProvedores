// Configuração do Google OAuth2 para Gmail API
// As credenciais devem estar definidas nas variáveis de ambiente (arquivo .env)
// VITE_ é necessário para expor variáveis ao frontend no Vite

// Valores de fallback caso .env não esteja carregado (apenas para desenvolvimento)
const FALLBACK_CLIENT_ID = "184171118487-0plj2f7odi8v40pvfmj0vi8vjlca9bhi.apps.googleusercontent.com";
const FALLBACK_CLIENT_SECRET = "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";

// Pega das variáveis de ambiente ou usa fallback
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || FALLBACK_CLIENT_ID;
const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || FALLBACK_CLIENT_SECRET;

// Debug: verifica se as variáveis estão sendo carregadas
if (typeof window !== 'undefined') {
  console.log('🔑 Client ID carregado:', clientId ? '✅ Sim' : '❌ Não');
  console.log('🔑 Client Secret carregado:', clientSecret ? '✅ Sim' : '❌ Não');
  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    console.warn('⚠️ Usando fallback hardcoded - configure o arquivo .env');
  }
}

export const GOOGLE_OAUTH_CONFIG = {
  clientId: clientId,
  clientSecret: clientSecret,
  redirectUri: typeof window !== 'undefined' 
    ? (window.location.origin === 'https://providersmanagement.vercel.app' 
        ? "https://providersmanagement.vercel.app"
        : window.location.origin)
    : "http://localhost:3000",
  scopes: [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.compose'
  ],
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest']
};
