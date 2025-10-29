// Configuração do Google OAuth2 para Gmail API
// As credenciais devem estar definidas nas variáveis de ambiente (arquivo .env)
// VITE_ é necessário para expor variáveis ao frontend no Vite

// Pega das variáveis de ambiente (sem fallback hardcoded para segurança)
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || "";

// Debug: verifica se as variáveis estão sendo carregadas
if (typeof window !== 'undefined') {
  console.log('🔑 Client ID carregado:', clientId ? '✅ Sim' : '❌ Não');
  console.log('🔑 Client Secret carregado:', clientSecret ? '✅ Sim' : '❌ Não');
  if (!clientId || !clientSecret) {
    console.error('❌ ERRO: Variáveis de ambiente não configuradas!');
    console.error('📝 Certifique-se de ter um arquivo .env na raiz do projeto com:');
    console.error('   VITE_GOOGLE_CLIENT_ID=seu_client_id');
    console.error('   VITE_GOOGLE_CLIENT_SECRET=seu_client_secret');
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
