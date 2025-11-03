/**
 * Utilitário para enviar emails via Gmail API usando Refresh Token
 * Não requer autenticação interativa - usa refresh token armazenado
 */

import { GOOGLE_OAUTH_CONFIG } from '../config/googleOAuth';

/**
 * Obtém access token usando refresh token
 * @returns {Promise<string>} Access token
 */
async function getAccessTokenFromRefreshToken() {
  const refreshToken = import.meta.env.VITE_GMAIL_REFRESH_TOKEN;
  const clientId = GOOGLE_OAUTH_CONFIG.clientId;
  const clientSecret = GOOGLE_OAUTH_CONFIG.clientSecret;

  if (!refreshToken) {
    const errorMsg = `❌ Refresh token não configurado!\n\n` +
      `Para usar o envio automático sem login, você precisa:\n` +
      `1. Obter um refresh token do Google (veja REFRESH_TOKEN_SETUP.md)\n` +
      `2. Adicionar ao arquivo .env:\n` +
      `   VITE_GMAIL_REFRESH_TOKEN=seu_refresh_token_aqui\n` +
      `3. Reiniciar o servidor (npm run dev)`;
    
    console.error(errorMsg);
    throw new Error('Refresh token não configurado. Veja o console para instruções.');
  }

  if (!clientId || !clientSecret) {
    throw new Error('Credenciais Google OAuth não configuradas. Verifique VITE_GOOGLE_CLIENT_ID e VITE_GOOGLE_CLIENT_SECRET no .env');
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Erro ao obter access token');
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Erro ao obter access token:', error);
    throw error;
  }
}

/**
 * Codifica o assunto do email para UTF-8 (RFC 2047)
 */
function encodeSubject(subject) {
  return `=?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
}

/**
 * Cria mensagem MIME para email com anexo PDF
 */
function createEmailMessage(to, subject, body, pdfBase64, pdfFileName = 'relatorio.pdf') {
  const boundary = '----=_Part_0_' + Date.now();
  
  const rawMessage = [
    `To: ${to}`,
    `Subject: ${encodeSubject(subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    body,
    `--${boundary}`,
    `Content-Type: application/pdf; name="${pdfFileName}"`,
    `Content-Disposition: attachment; filename="${pdfFileName}"`,
    'Content-Transfer-Encoding: base64',
    '',
    pdfBase64,
    `--${boundary}--`
  ].join('\r\n');
  
  // Codifica em base64 URL-safe
  const encoded = btoa(unescape(encodeURIComponent(rawMessage)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  return encoded;
}

/**
 * Envia email via Gmail API usando refresh token (sem necessidade de login)
 * @param {string} to - Email do destinatário
 * @param {string} subject - Assunto do email
 * @param {string} body - Corpo do email
 * @param {string} pdfBase64 - PDF em base64
 * @param {string} pdfFileName - Nome do arquivo PDF
 * @returns {Promise<Object>} Resposta da API
 */
export async function sendEmailWithPDFUsingRefreshToken(to, subject, body, pdfBase64, pdfFileName = 'relatorio.pdf') {
  try {
    // Obtém access token usando refresh token (sem interação do usuário)
    const accessToken = await getAccessTokenFromRefreshToken();
    
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
}

