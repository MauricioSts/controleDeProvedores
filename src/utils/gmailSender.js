/**
 * Utilitário para envio de emails via Gmail API
 * Requer autenticação OAuth2 do Google
 */

import { GOOGLE_OAUTH_CONFIG } from '../config/googleOAuth';

/**
 * Carrega o script do Google API Client
 * @returns {Promise<void>}
 */
const loadGoogleAPI = () => {
  return new Promise((resolve, reject) => {
    if (window.gapi && window.gapi.load) {
      resolve();
      return;
    }
    
    // Verifica se já existe um script carregando
    const existingScript = document.querySelector('script[src="https://apis.google.com/js/api.js"]');
    if (existingScript) {
      existingScript.onload = () => resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Erro ao carregar Google API'));
    document.head.appendChild(script);
  });
};

/**
 * Carrega o script do Google Auth2
 * @returns {Promise<void>}
 */
const loadGoogleAuth2 = () => {
  return new Promise((resolve, reject) => {
    if (window.gapi && window.gapi.auth2) {
      resolve();
      return;
    }
    
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      if (window.google && window.google.accounts) {
        resolve();
        return;
      }
      existingScript.onload = () => resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && window.google.accounts) {
        resolve();
      } else {
        reject(new Error('Google Auth2 não inicializado'));
      }
    };
    script.onerror = () => reject(new Error('Erro ao carregar Google Auth2'));
    document.head.appendChild(script);
  });
};

/**
 * Inicializa o Google API Client usando a nova API
 * @returns {Promise<void>}
 */
export const initGmailAPI = async () => {
  await loadGoogleAPI();
  await loadGoogleAuth2();
};

/**
 * Autentica o usuário usando a nova Google Identity Services
 * @returns {Promise<string>} Token de acesso
 */
export const authenticateGmail = async () => {
  try {
    await initGmailAPI();
    
    // Obtém a origem atual para usar como redirect URI
    const currentOrigin = window.location.origin;
    
    // Debug: mostra qual origem está sendo usada
    console.log('🔍 Origem atual:', currentOrigin);
    console.log('🔍 URL completa:', window.location.href);
    
    // Para Google Identity Services com popup, pode não precisar de redirect_uri explícito
    // Vamos tentar sem primeiro, e usar postMessage
    return new Promise((resolve, reject) => {
      // Usa a nova API do Google Identity Services
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_OAUTH_CONFIG.clientId,
        scope: GOOGLE_OAUTH_CONFIG.scopes.join(' '),
        // Não especificar redirect_uri - Google Identity Services usa postMessage por padrão
        // Isso resolve o problema de redirect_uri_mismatch
        callback: (response) => {
          console.log('📧 Resposta do OAuth:', response);
          
          if (response.error) {
            console.error('❌ Erro no OAuth:', response.error);
            if (response.error === 'popup_closed_by_user') {
              reject(new Error('Autenticação cancelada pelo usuário'));
            } else if (response.error.includes('redirect_uri_mismatch')) {
              reject(new Error(
                `❌ Erro de configuração no Google Cloud Console!\n\n` +
                `A origem atual é: ${currentOrigin}\n\n` +
                `Configure no Google Cloud Console:\n` +
                `1. Vá em: APIs & Services > Credentials\n` +
                `2. Clique no seu OAuth 2.0 Client ID\n` +
                `3. Em "Authorized JavaScript origins", adicione: ${currentOrigin}\n` +
                `4. Em "Authorized redirect URIs", adicione: ${currentOrigin}\n` +
                `5. Clique em "Save"\n\n` +
                `⚠️ Use APENAS a origem (sem caminhos como /callback)`
              ));
            } else {
              reject(new Error('Erro ao autenticar: ' + response.error));
            }
            return;
          }
          if (response.access_token) {
            console.log('✅ Token obtido com sucesso!');
            resolve(response.access_token);
          } else {
            reject(new Error('Token de acesso não obtido'));
          }
        },
        error_callback: (error) => {
          console.error('Erro no callback OAuth:', error);
          reject(new Error('Erro ao autenticar: ' + (error.message || 'Erro desconhecido')));
        }
      });
      
      // Solicita o token de acesso imediatamente, garantindo gesto do usuário
      tokenClient.requestAccessToken({ prompt: '' });
    });
  } catch (error) {
    console.error('Erro ao autenticar:', error);
    if (error.message?.includes('popup') || error.message?.includes('cancelado')) {
      throw new Error('Autenticação cancelada pelo usuário');
    }
    throw error;
  }
};

/**
 * Codifica o assunto do email usando RFC 2047 para suportar caracteres UTF-8
 * @param {string} subject - Assunto do email
 * @returns {string} Assunto codificado
 */
const encodeSubject = (subject) => {
  // Verifica se há caracteres não-ASCII
  if (/[\x80-\xFF]/.test(subject)) {
    // Codifica em Base64 para UTF-8
    const encoded = btoa(unescape(encodeURIComponent(subject)));
    // Divide em linhas de 76 caracteres (padrão RFC 2047)
    const chunks = [];
    for (let i = 0; i < encoded.length; i += 76) {
      chunks.push(encoded.substring(i, i + 76));
    }
    return `=?UTF-8?B?${chunks.join('?=\r\n =?UTF-8?B?')}?=`;
  }
  return subject;
};

/**
 * Cria uma mensagem MIME para envio via Gmail API
 * @param {string} to - Email do destinatário
 * @param {string} subject - Assunto do email
 * @param {string} body - Corpo do email (HTML ou texto)
 * @param {string} pdfBase64 - PDF em base64 (opcional)
 * @param {string} pdfFileName - Nome do arquivo PDF
 * @returns {string} Mensagem MIME codificada
 */
const createEmailMessage = (to, subject, body, pdfBase64 = null, pdfFileName = 'relatorio.pdf') => {
  const boundary = '----=_Part_' + Math.random().toString(36).substr(2, 9);
  const delimiter = `\r\n--${boundary}\r\n`;
  
  let rawMessage = '';
  
  // Headers principais
  rawMessage += `To: ${to}\r\n`;
  rawMessage += `Subject: ${encodeSubject(subject)}\r\n`;
  rawMessage += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;
  
  // Corpo do email
  rawMessage += delimiter;
  rawMessage += `Content-Type: text/html; charset=UTF-8\r\n`;
  rawMessage += `Content-Transfer-Encoding: 7bit\r\n\r\n`;
  rawMessage += body;
  
  // Anexo PDF (se fornecido)
  if (pdfBase64) {
    // Remove o prefixo data:application/pdf;base64, se existir
    const base64Data = pdfBase64.includes(',') 
      ? pdfBase64.split(',')[1] 
      : pdfBase64;
    
    rawMessage += delimiter;
    rawMessage += `Content-Type: application/pdf; name="${pdfFileName}"\r\n`;
    rawMessage += `Content-Disposition: attachment; filename="${pdfFileName}"\r\n`;
    rawMessage += `Content-Transfer-Encoding: base64\r\n\r\n`;
    rawMessage += base64Data;
  }
  
  rawMessage += `\r\n--${boundary}--\r\n`;
  
  // Codifica em base64url (RFC 4648)
  const encoded = btoa(unescape(encodeURIComponent(rawMessage)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  return encoded;
};

/**
 * Envia email via Gmail API
 * @param {string} to - Email do destinatário
 * @param {string} subject - Assunto do email
 * @param {string} body - Corpo do email
 * @param {string} pdfBase64 - PDF em base64
 * @param {string} pdfFileName - Nome do arquivo PDF
 * @returns {Promise<Object>} Resposta da API
 */
export const sendEmailWithPDF = async (to, subject, body, pdfBase64, pdfFileName = 'relatorio.pdf') => {
  try {
    // Autentica e obtém o token
    const accessToken = await authenticateGmail();
    
    // Cria a mensagem MIME
    const rawMessage = createEmailMessage(to, subject, body, pdfBase64, pdfFileName);
    
    // Envia via Gmail API usando fetch
    const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: rawMessage
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Erro ao enviar email:', error);
      throw new Error(error.error?.message || 'Erro ao enviar email via Gmail API');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
};

