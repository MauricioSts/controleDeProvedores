/**
 * Vercel Serverless Function
 * Envia relatórios mensais automaticamente no dia 3 de cada mês
 * 
 * Cron: 0 0 3 * * (todo dia 3 às 00:00 UTC)
 */

// Vercel Functions precisam usar CommonJS ou verificar suporte a ESM
// Tente usar require se import não funcionar
let initializeApp, cert, getFirestore, jsPDF;

try {
  const firebaseAdmin = require('firebase-admin');
  const { initializeApp: initApp, cert: certFn } = firebaseAdmin.apps.length === 0 
    ? require('firebase-admin/app') 
    : { initializeApp: () => {}, cert: () => {} };
  const { getFirestore: getFirestoreFn } = require('firebase-admin/firestore');
  const jsPDFModule = require('jspdf');
  
  initializeApp = initApp;
  cert = certFn;
  getFirestore = getFirestoreFn;
  jsPDF = jsPDFModule.default || jsPDFModule;
} catch (e) {
  // Fallback para ES modules se necessário
  console.warn('Tentando ES modules:', e.message);
  const admin = await import('firebase-admin/app');
  const firestore = await import('firebase-admin/firestore');
  const jspdfModule = await import('jspdf');
  initializeApp = admin.initializeApp;
  cert = admin.cert;
  getFirestore = firestore.getFirestore;
  jsPDF = jspdfModule.default;
}

// Inicializa Firebase Admin (requer service account)
let db;
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
  
  if (serviceAccount.projectId) {
    initializeApp({
      credential: cert(serviceAccount)
    });
    db = getFirestore();
  }
} catch (error) {
  console.error('Erro ao inicializar Firebase Admin:', error);
}

/**
 * Gera PDF em base64 para um provedor
 */
function generatePDFBase64(provedor) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  pdf.setFont('helvetica');
  
  // Cabeçalho
  pdf.setFillColor(6, 182, 212);
  pdf.rect(0, 0, 210, 30, 'F');
  
  // Mês anterior
  const now = new Date();
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const previousMonthIndex = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  const previousMonth = monthNames[previousMonthIndex];
  const reportYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  
  pdf.setFontSize(24);
  pdf.setTextColor(255, 255, 255);
  pdf.text(`RELATORIO MENSAL - ${previousMonth} ${reportYear}`, 105, 20, { align: 'center' });
  
  pdf.setDrawColor(255, 255, 255);
  pdf.line(20, 35, 190, 35);
  
  let yPosition = 45;
  
  // Helper para normalizar texto
  const normalize = (text) => {
    if (!text) return '';
    return String(text).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, '-').trim();
  };
  
  // Helper para cores de status
  const getStatusColors = (value) => {
    const subtle = {
      green: { fg: { r: 16, g: 128, b: 67 }, bg: { r: 224, g: 247, b: 235 } },
      red: { fg: { r: 185, g: 28, b: 28 }, bg: { r: 254, g: 226, b: 226 } },
      yellow: { fg: { r: 161, g: 98, b: 7 }, bg: { r: 254, g: 243, b: 199 } },
      gray: { fg: { r: 100, g: 116, b: 139 }, bg: { r: 241, g: 245, b: 249 } }
    };
    if (!value) return subtle.gray;
    const v = normalize(value);
    if (v === 'regular') return subtle.green;
    if (v === 'irregular' || v === 'inativa' || v === 'suspensa') return subtle.red;
    if (v === 'nao-informado' || v === 'nao') return subtle.yellow;
    return subtle.yellow;
  };
  
  // Helper para desenhar chip de status
  const drawStatusChip = (pdf, x, y, text, colors) => {
    const display = String(text || 'N/A');
    const textWidth = pdf.getTextWidth(display) + 4;
    const badgeWidth = Math.max(22, Math.min(60, textWidth));
    pdf.setFillColor(colors.bg.r, colors.bg.g, colors.bg.b);
    pdf.roundedRect(x, y - 5, badgeWidth, 8, 2, 2, 'F');
    pdf.setTextColor(colors.fg.r, colors.fg.g, colors.fg.b);
    pdf.setFont('helvetica', 'bold');
    pdf.text(display, x + 2, y + 2);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
  };
  
  // 1. Informações do Provedor
  pdf.setFillColor(6, 182, 212);
  pdf.roundedRect(20, yPosition - 5, 170, 15, 3, 3, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INFORMACOES DO PROVEDOR', 25, yPosition + 5);
  yPosition += 20;
  
  const basicInfo = [
    { label: 'Razao Social', value: provedor.razaoSocial || 'N/A' },
    { label: 'CNPJ', value: provedor.cnpj || 'N/A' },
    { label: 'Regime', value: provedor.regime || 'N/A' },
    { label: 'N Fistel', value: provedor.numeroFiscal || 'N/A' },
    { label: 'N SCM', value: provedor.numeroScm || 'N/A' },
    { label: 'Status da Empresa', value: provedor.statusEmpresa || 'N/A' }
  ];
  
  basicInfo.forEach((info, index) => {
    if (index % 2 === 0) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(20, yPosition - 3, 170, 8, 'F');
    }
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${info.label}:`, 25, yPosition + 3);
    if (info.label === 'Status da Empresa') {
      const colors = getStatusColors(info.value);
      drawStatusChip(pdf, 78, yPosition + 1, info.value, colors);
    } else {
      pdf.setFont('helvetica', 'normal');
      pdf.text(info.value, 80, yPosition + 3);
    }
    yPosition += 8;
  });
  
  yPosition += 10;
  if (yPosition > 250) {
    pdf.addPage();
    yPosition = 20;
  }
  
  // 2. Conselho Federal
  pdf.setFillColor(31, 41, 55);
  pdf.roundedRect(20, yPosition, 170, 35, 5, 5, 'F');
  pdf.setTextColor(6, 182, 212);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CONSELHO FEDERAL', 25, yPosition + 10);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Registro no CFT: Regular com Responsável Técnico', 25, yPosition + 18);
  pdf.text(`Responsável Técnico: ${provedor.councilInfo?.nome || ''} ${provedor.councilInfo?.sobrenome || ''}`, 25, yPosition + 25);
  pdf.text(`Processos CFT: ${provedor.councilInfo?.processosCft || 'N/A'}`, 25, yPosition + 32);
  yPosition += 45;
  
  if (yPosition > 250) {
    pdf.addPage();
    yPosition = 20;
  }
  
  // 3. Anatel
  pdf.setFillColor(6, 182, 212);
  pdf.roundedRect(20, yPosition - 5, 170, 15, 3, 3, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INFORMACOES REGULATORIAS ANATEL', 25, yPosition + 5);
  yPosition += 20;
  
  const regulatoryInfo = [
    { label: 'Processo Anatel', value: provedor.processoAnatel || 'N/A' },
    { label: 'Situacao CNPJ Anatel', value: provedor.cnpjAnatel || 'N/A' },
    { label: 'Situacao Anatel/Ancine', value: provedor.situacaoAnatel || 'N/A' },
    { label: 'FUST', value: provedor.fust || 'N/A' },
    { label: 'Coleta de Dados Mensal', value: provedor.coletaDeDadosM || 'N/A' },
    { label: 'Coleta de Dados Economicos', value: provedor.coletaDeDadosEconomicos || 'N/A' },
    { label: 'Dados de Infraestrutura', value: provedor.dadosInfra || 'N/A' },
    { label: 'Registro de Estacoes', value: provedor.registroEstacoes || 'N/A' }
  ];
  
  regulatoryInfo.forEach((info, index) => {
    if (index % 2 === 0) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(20, yPosition - 3, 170, 8, 'F');
    }
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${info.label}:`, 25, yPosition + 3);
    const colors = getStatusColors(info.value);
    drawStatusChip(pdf, 78, yPosition + 1, info.value, colors);
    yPosition += 8;
  });
  
  yPosition += 10;
  if (yPosition > 250) {
    pdf.addPage();
    yPosition = 20;
  }
  
  // Observações
  pdf.setFillColor(6, 182, 212);
  pdf.roundedRect(20, yPosition - 5, 170, 15, 3, 3, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('OBSERVACOES', 25, yPosition + 5);
  yPosition += 20;
  
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(20, yPosition - 3, 170, 20, 3, 3, 'F');
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const obsText = provedor.obs || 'Nenhuma observação registrada';
  const splitObs = pdf.splitTextToSize(obsText, 160);
  pdf.text(splitObs, 25, yPosition + 3);
  
  // Rodapé
  const pageHeight = pdf.internal.pageSize.height;
  pdf.setFillColor(31, 41, 55);
  pdf.rect(0, pageHeight - 20, 210, 20, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, pageHeight - 10);
  pdf.text('Sistema de Controle de Provedores', 105, pageHeight - 10, { align: 'center' });
  pdf.text('contato@sistema.com', 190, pageHeight - 10, { align: 'right' });
  
  // Converte para base64
  const base64 = pdf.output('datauristring');
  return base64.split(',')[1]; // Remove o prefixo data:application/pdf;base64,
}

/**
 * Envia email via Gmail API usando refresh token
 */
async function sendEmailWithPDF(to, subject, body, pdfBase64, pdfFileName) {
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.VITE_GOOGLE_CLIENT_SECRET;
  
  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error('Credenciais Gmail não configuradas');
  }
  
  // Obtém novo access token usando refresh token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });
  
  if (!tokenResponse.ok) {
    throw new Error('Erro ao obter access token');
  }
  
  const { access_token } = await tokenResponse.json();
  
  // Cria mensagem MIME
  const boundary = '----=_Part_0_' + Date.now();
  const rawMessage = [
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    '',
    body,
    `--${boundary}`,
    `Content-Type: application/pdf; name="${pdfFileName}"`,
    'Content-Disposition: attachment; filename="' + pdfFileName + '"',
    'Content-Transfer-Encoding: base64',
    '',
    pdfBase64,
    `--${boundary}--`
  ].join('\r\n');
  
  const encoded = Buffer.from(rawMessage).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  // Envia via Gmail API
  const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: encoded })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Erro ao enviar email');
  }
  
  return await response.json();
}

/**
 * Handler principal da função
 */
export default async function handler(req, res) {
  // Verifica se é chamada do cron ou manual
  const cronSecret = req.headers['x-vercel-cron'] || req.query.secret;
  const expectedSecret = process.env.CRON_SECRET || 'sua-chave-secreta';
  
  if (cronSecret !== expectedSecret && req.method !== 'GET') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    if (!db) {
      return res.status(500).json({ error: 'Firebase não configurado' });
    }
    
    // Busca todos os provedores com email cadastrado E envio automático ativado
    const provedoresRef = db.collection('provedores');
    const snapshot = await provedoresRef.get();
    
    const provedores = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Verifica se tem email E se o envio automático está explicitamente ativado
      if (data.emailContato && data.emailContato.trim() && data.enviarEmailAutomatico === true) {
        provedores.push({
          id: doc.id,
          ...data
        });
      }
    });
    
    console.log(`Encontrados ${provedores.length} provedores com email`);
    
    const results = [];
    const now = new Date();
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const previousMonthIndex = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const previousMonth = monthNames[previousMonthIndex];
    const reportYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    
    // Processa cada provedor
    for (const provedor of provedores) {
      try {
        // Gera PDF
        const pdfBase64 = generatePDFBase64(provedor);
        const pdfFileName = `relatorio_${provedor.razaoSocial?.replace(/\s+/g, '_') || 'provedor'}.pdf`;
        
        // Corpo do email
        const emailBody = `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h2 style="color: #06b6d4;">Relatório Mensal de Provedor</h2>
              <p>Olá,</p>
              <p>Segue em anexo o relatório mensal de <strong>${previousMonth} ${reportYear}</strong> referente à empresa <strong>${provedor.razaoSocial || 'Provedor'}</strong>.</p>
              <p>O relatório contém todas as informações regulatórias e atualizações necessárias.</p>
              <br>
              <p>Atenciosamente,<br>
              Sistema de Controle de Provedores</p>
            </body>
          </html>
        `;
        
        const subject = `Relatório Mensal - ${previousMonth} ${reportYear} - ${provedor.razaoSocial || 'Provedor'}`;
        
        // Envia email
        await sendEmailWithPDF(
          provedor.emailContato,
          subject,
          emailBody,
          pdfBase64,
          pdfFileName
        );
        
        results.push({
          provedorId: provedor.id,
          email: provedor.emailContato,
          status: 'success'
        });
        
        console.log(`Email enviado para ${provedor.emailContato}`);
        
        // Aguarda um pouco para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Erro ao processar provedor ${provedor.id}:`, error);
        results.push({
          provedorId: provedor.id,
          email: provedor.emailContato,
          status: 'error',
          error: error.message
        });
      }
    }
    
    return res.status(200).json({
      message: 'Processamento concluído',
      total: provedores.length,
      results
    });
    
  } catch (error) {
    console.error('Erro geral:', error);
    return res.status(500).json({ error: error.message });
  }
}

