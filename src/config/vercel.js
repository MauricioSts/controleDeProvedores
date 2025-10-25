// Configuração específica para Vercel
export const VERCEL_CONFIG = {
  // Configurações de build para Vercel
  build: {
    // Comando de build
    command: 'npm run build',
    
    // Diretório de saída
    outputDirectory: 'dist',
    
    // Framework
    framework: 'vite',
    
    // Comando de instalação
    installCommand: 'npm install --production=false',
    
    // Comando de desenvolvimento
    devCommand: 'npm run dev',
    
    // Variáveis de ambiente
    env: {
      NODE_ENV: 'production'
    }
  },
  
  // Configurações de headers de segurança
  headers: [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://firebase.googleapis.com https://firestore.googleapis.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests"
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains; preload'
        }
      ]
    }
  ],
  
  // Redirecionamentos
  redirects: [
    {
      source: '/admin',
      destination: '/admin/',
      permanent: true
    }
  ],
  
  // Rewrites para SPA
  rewrites: [
    {
      source: '/(.*)',
      destination: '/index.html'
    }
  ]
};

// Função para obter configuração do Vercel
export const getVercelConfig = () => {
  return VERCEL_CONFIG;
};

// Função para verificar se está rodando no Vercel
export const isVercel = () => {
  return process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;
};

// Função para obter ambiente do Vercel
export const getVercelEnv = () => {
  return process.env.VERCEL_ENV || 'development';
};