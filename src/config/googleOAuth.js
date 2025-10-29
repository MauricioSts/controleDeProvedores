// Configuração do Google OAuth2 para Gmail API
export const GOOGLE_OAUTH_CONFIG = {
  clientId: "184171118487-0plj2f7odi8v40pvfmj0vi8vjlca9bhi.apps.googleusercontent.com",
  clientSecret: "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",
  redirectUri: window.location.origin === 'https://providersmanagement.vercel.app' 
    ? "https://providersmanagement.vercel.app/oauth2callback"
    : "http://localhost:3000/oauth2callback",
  scopes: [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.compose'
  ],
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest']
};

