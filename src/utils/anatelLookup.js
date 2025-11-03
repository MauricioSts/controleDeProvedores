/**
 * Utilitário para busca de dados de provedores na Anatel
 * Busca N Fistel e N SCM através do site público da Anatel
 * 
 * Nota: A Anatel não possui API REST pública oficial.
 * Como solução temporária, tenta usar proxy CORS público.
 * Para produção completa, recomenda-se criar um backend que faça scraping.
 */

/**
 * Busca dados do provedor na Anatel pelo CNPJ
 * @param {string} cnpj - CNPJ do provedor (com ou sem formatação)
 * @returns {Promise<Object>} Dados da Anatel
 */
export const fetchAnatelData = async (cnpj) => {
  try {
    const cleanedCNPJ = cnpj.replace(/[^\d]/g, '');
    
    if (cleanedCNPJ.length !== 14) {
      return {
        numeroFistel: '',
        numeroScm: '',
        processoAnatel: '',
        situacaoAnatel: '',
      };
    }

    // Tenta buscar via diferentes métodos
    // Como a Anatel não tem API pública, precisamos fazer scraping ou usar proxy
    
    // Método 1: Tentar via API proxy CORS pública
    // Nota: A Anatel não tem API pública, então isso pode falhar
    // Isso é esperado e não deve bloquear o fluxo principal
    try {
      // URL do sistema de consulta da Anatel
      const anatelUrl = `https://sistemas.anatel.gov.br/eipp/Net/ResultadoBuscaOperadoras.aspx?Operadora=&CNPJ=${cleanedCNPJ}`;
      
      // Usa proxy CORS público (allorigins.win)
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(anatelUrl)}`;
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const htmlContent = data.contents || '';
        
        // Faz parsing básico do HTML retornado
        // Extrai informações se disponíveis no HTML
        const numeroFistel = extractValueFromHTML(htmlContent, /(?:fistel|FISTEL)[\s:]*(\d{6,12})/i);
        const numeroScm = extractValueFromHTML(htmlContent, /(?:scm|SCM|Serviço de Comunicação Multimídia)[\s:]*(\d{6,12})/i);
        
        // Procura por padrões de processo Anatel
        const processoAnatel = extractValueFromHTML(htmlContent, /(?:processo|PROCESSO)[\s:]*(\d{4,}[\/-]?\d{2,}[\/-]?\d{4,})/i);
        
        // Só retorna se encontrou algum dado
        if (numeroFistel || numeroScm || processoAnatel) {
          return {
            numeroFistel: numeroFistel || '',
            numeroScm: numeroScm || '',
            processoAnatel: processoAnatel || '',
            situacaoAnatel: '',
          };
        }
      } else {
        // Se retornar 400 ou outro erro, apenas ignora silenciosamente
        console.warn('Busca Anatel retornou status:', response.status);
      }
    } catch (error) {
      // Erro esperado - Anatel não tem API pública
      // Não precisa logar como erro crítico
      if (!error.message.includes('Failed to fetch')) {
        console.warn('Busca Anatel não disponível (normal):', error.message);
      }
    }

    // Método 2: Tentar buscar via outra estrutura da Anatel
    // Por enquanto retorna vazio, mas a estrutura está pronta
    
    // Retorna estrutura vazia (dados podem ser preenchidos manualmente)
    // Para uma solução completa seria necessário:
    // 1. Backend Node.js/Python que faça scraping adequado
    // 2. Usar biblioteca de scraping (Puppeteer, Cheerio, BeautifulSoup)
    // 3. Ou usar API paga de dados de telecomunicações
    
    return {
      numeroFistel: '',
      numeroScm: '',
      processoAnatel: '',
      situacaoAnatel: '',
    };
  } catch (error) {
    console.error('Erro ao buscar dados da Anatel:', error);
    // Retorna vazio em caso de erro para não bloquear o preenchimento dos outros campos
    return {
      numeroFistel: '',
      numeroScm: '',
      processoAnatel: '',
      situacaoAnatel: '',
    };
  }
};

/**
 * Extrai valor de um padrão regex do HTML
 */
const extractValueFromHTML = (html, pattern) => {
  if (!html) return '';
  const match = html.match(pattern);
  return match ? match[1] : '';
};
