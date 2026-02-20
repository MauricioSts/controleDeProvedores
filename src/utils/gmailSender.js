/**
 * Utilitário para envio de emails via Gmail API
 * Requer autenticação OAuth2 do Google
 */

import { GOOGLE_OAUTH_CONFIG } from '../config/googleOAuth';

/**
 * Carrega o script do Google Identity Services
 * @returns {Promise<void>}
 */
const loadGoogleAPI = () => {
  return new Promise((resolve, reject) => {
    // Se já está carregado, resolve imediatamente
    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
      resolve();
      return;
    }

    // Verifica se já existe um script carregando
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      // Espera o script carregar
      existingScript.onload = () => {
        if (window.google && window.google.accounts) {
          resolve();
        } else {
          reject(new Error('Google Identity Services não inicializado'));
        }
      };
      existingScript.onerror = () => reject(new Error('Erro ao carregar Google Identity Services'));
      return;
    }

    // Cria e adiciona o script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Aguarda um pouco para garantir que está inicializado
      setTimeout(() => {
        if (window.google && window.google.accounts && window.google.accounts.oauth2) {
          resolve();
        } else {
          reject(new Error('Google Identity Services não inicializado após carregamento'));
        }
      }, 100);
    };
    script.onerror = () => reject(new Error('Erro ao carregar Google Identity Services'));
    document.head.appendChild(script);
  });
};

/**
 * Inicializa o Google API Client
 * @returns {Promise<void>}
 */
export const initGmailAPI = async () => {
  await loadGoogleAPI();
};

/**
 * Cache do token OAuth em memória (válido por ~1h).
 * Reutilizado enquanto não expirar, eliminando logins repetidos na sessão.
 */
let _tokenCache = {
  accessToken: null,
  expiresAt: 0, // timestamp ms
};

/** Limpa o cache (usado em casos de erro 401) */
const clearTokenCache = () => {
  _tokenCache = { accessToken: null, expiresAt: 0 };
};

/** Retorna true se o token cacheado ainda é válido (com 2 min de margem) */
const isCachedTokenValid = () => {
  return _tokenCache.accessToken && Date.now() < _tokenCache.expiresAt - 2 * 60 * 1000;
};

/**
 * Autentica o usuário usando Google Identity Services
 * @returns {Promise<string>} Token de acesso
 */
export const authenticateGmail = async () => {
  // Reutiliza token válido — sem popup de login
  if (isCachedTokenValid()) {
    return _tokenCache.accessToken;
  }

  try {
    await initGmailAPI();

    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      throw new Error('Google Identity Services não está disponível');
    }

    return new Promise((resolve, reject) => {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_OAUTH_CONFIG.clientId,
          scope: GOOGLE_OAUTH_CONFIG.scopes.join(' '),
          callback: (response) => {
            if (response.error) {
              if (response.error === 'popup_closed_by_user') {
                reject(new Error('Autenticação cancelada pelo usuário'));
              } else {
                reject(new Error('Erro ao autenticar: ' + response.error));
              }
              return;
            }
            if (response.access_token) {
              // Salva no cache com tempo de expiração (padrão Google: 3600s)
              const expiresIn = (response.expires_in || 3600) * 1000;
              _tokenCache = {
                accessToken: response.access_token,
                expiresAt: Date.now() + expiresIn,
              };
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

        tokenClient.requestAccessToken();
      } catch (error) {
        console.error('Erro ao criar tokenClient:', error);
        reject(new Error('Erro ao inicializar autenticação: ' + error.message));
      }
    });
  } catch (error) {
    console.error('Erro ao autenticar:', error);
    throw error;
  }
};

/**
 * Codifica o assunto do email usando RFC 2047 para suportar caracteres UTF-8
 * @param {string} subject - Assunto do email
 * @returns {string} Assunto codificado
 */
export const encodeSubject = (subject) => {
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
 * Cria uma mensagem MIME para envio via Gmail API.
 * Suporta múltiplos anexos via array `attachments`.
 *
 * @param {string} to - Email do destinatário
 * @param {string} subject - Assunto do email
 * @param {string} body - Corpo do email (HTML ou texto)
 * @param {string|null} pdfBase64 - PDF principal em base64 (opcional, legado)
 * @param {string} pdfFileName - Nome do PDF principal
 * @param {Array<{base64: string, fileName: string}>} attachments - Anexos adicionais
 * @returns {string} Mensagem MIME codificada em base64url
 */
export const createEmailMessage = (
  to,
  subject,
  body,
  pdfBase64 = null,
  pdfFileName = 'relatorio.pdf',
  attachments = []
) => {
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

  // Helper para adicionar um anexo PDF
  const addPdfAttachment = (base64Data, fileName) => {
    const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
    rawMessage += delimiter;
    rawMessage += `Content-Type: application/pdf; name="${fileName}"\r\n`;
    rawMessage += `Content-Disposition: attachment; filename="${fileName}"\r\n`;
    rawMessage += `Content-Transfer-Encoding: base64\r\n\r\n`;
    rawMessage += cleanBase64;
  };

  // PDF principal (legado — relatório gerado automaticamente)
  if (pdfBase64) {
    addPdfAttachment(pdfBase64, pdfFileName);
  }

  // Anexos adicionais (PDFs do provedor)
  if (attachments && attachments.length > 0) {
    attachments.forEach(({ base64, fileName }) => {
      if (base64 && fileName) addPdfAttachment(base64, fileName);
    });
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
 * Envia email via Gmail API com suporte a múltiplos anexos.
 *
 * @param {string} to - Email do destinatário
 * @param {string} subject - Assunto do email
 * @param {string} body - Corpo do email
 * @param {string|null} pdfBase64 - PDF principal em base64 (relatório gerado)
 * @param {string} pdfFileName - Nome do PDF principal
 * @param {Array<{base64: string, fileName: string}>} attachments - Anexos adicionais
 * @returns {Promise<Object>} Resposta da API
 */
export const sendEmailWithPDF = async (
  to,
  subject,
  body,
  pdfBase64,
  pdfFileName = 'relatorio.pdf',
  attachments = []
) => {
  try {
    // Obtém token (do cache ou novo login)
    const accessToken = await authenticateGmail();

    const rawMessage = createEmailMessage(to, subject, body, pdfBase64, pdfFileName, attachments);

    const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw: rawMessage })
    });

    // Token expirado/inválido: limpa cache e tenta uma vez com novo login
    if (response.status === 401) {
      clearTokenCache();
      const freshToken = await authenticateGmail();
      const retry = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${freshToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: rawMessage })
      });
      if (!retry.ok) {
        const err = await retry.json();
        throw new Error(err.error?.message || 'Erro ao enviar email via Gmail API');
      }
      return await retry.json();
    }

    if (!response.ok) {
      const error = await response.json();
      console.error('Erro ao enviar email:', error);
      throw new Error(error.error?.message || 'Erro ao enviar email via Gmail API');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
};

