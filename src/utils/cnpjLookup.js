/**
 * Utilitário para busca de dados de CNPJ via API pública
 * Usa a BrasilAPI (https://brasilapi.com.br) - API gratuita com CORS habilitado
 */

/**
 * Remove formatação do CNPJ (pontos, barras e hífens)
 * @param {string} cnpj - CNPJ formatado ou não
 * @returns {string} CNPJ apenas com números
 */
export const cleanCNPJ = (cnpj) => {
  return cnpj.replace(/[^\d]/g, '');
};

/**
 * Valida se o CNPJ tem 14 dígitos
 * @param {string} cnpj - CNPJ para validar
 * @returns {boolean} True se válido
 */
export const isValidCNPJFormat = (cnpj) => {
  const cleaned = cleanCNPJ(cnpj);
  return cleaned.length === 14;
};

/**
 * Busca dados de uma empresa pelo CNPJ
 * @param {string} cnpj - CNPJ da empresa (com ou sem formatação)
 * @returns {Promise<Object>} Dados da empresa ou null se não encontrado
 */
export const fetchCNPJData = async (cnpj) => {
  try {
    const cleanedCNPJ = cleanCNPJ(cnpj);
    
    if (!isValidCNPJFormat(cleanedCNPJ)) {
      throw new Error('CNPJ deve ter 14 dígitos');
    }

    // Usa a BrasilAPI que tem CORS habilitado
    // https://brasilapi.com.br/docs#tag/CNPJ
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanedCNPJ}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('CNPJ não encontrado');
      }
      if (response.status === 429) {
        throw new Error('Muitas requisições. Aguarde um momento e tente novamente.');
      }
      throw new Error('Erro ao buscar dados do CNPJ');
    }

    const data = await response.json();

    // Verifica se a resposta indica erro
    if (data.error || !data.razao_social) {
      throw new Error(data.message || 'CNPJ não encontrado');
    }

    // Mapeia situação para status da empresa
    const statusMap = {
      'ATIVA': 'ativa',
      'SUSPENSA': 'suspensa',
      'INAPTA': 'inativa',
      'BAIXADA': 'inativa',
      'NULA': 'inativa'
    };

    // Retorna dados formatados
    return {
      razaoSocial: data.razao_social || '',
      cnpj: data.cnpj || cleanedCNPJ,
      // Situação no CNPJ
      statusEmpresa: statusMap[data.descricao_situacao_cadastral] || 'ativa',
      // Regime tributário - verifica se tem optante pelo simples
      regime: data.porte === 'DEMAIS' ? '' :
              data.opcao_pelo_simples === true ? 'Simples Nacional' :
              data.opcao_pelo_mei === true ? 'ME' :
              data.porte === 'MICRO EMPRESA' ? 'ME' : '',
      // Endereço
      endereco: data.logradouro || '',
      numero: data.numero || '',
      bairro: data.bairro || '',
      cidade: data.municipio || '',
      estado: data.uf || '',
      cep: data.cep ? data.cep.toString().replace(/(\d{5})(\d{3})/, '$1-$2') : '',
      telefone: data.telefone || '',
      email: data.email || '',
      // Data de abertura
      dataAbertura: data.data_inicio_atividade || '',
      // Capital social
      capitalSocial: data.capital_social || '',
    };
  } catch (error) {
    console.error('Erro ao buscar CNPJ:', error);
    throw error;
  }
};
