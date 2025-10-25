// Configuração do TailwindCSS para diferentes ambientes
export const TAILWIND_CONFIG = {
  // Configurações de desenvolvimento
  development: {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#f0f9ff',
            500: '#06b6d4',
            600: '#0891b2',
            700: '#0e7490',
            900: '#164e63'
          }
        }
      },
    },
    plugins: [],
  },
  
  // Configurações de produção
  production: {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#f0f9ff',
            500: '#06b6d4',
            600: '#0891b2',
            700: '#0e7490',
            900: '#164e63'
          }
        }
      },
    },
    plugins: [],
    // Configurações de otimização para produção
    corePlugins: {
      preflight: true,
    },
  }
};

// Função para obter configuração do TailwindCSS
export const getTailwindConfig = (mode = 'development') => {
  return TAILWIND_CONFIG[mode] || TAILWIND_CONFIG.development;
};