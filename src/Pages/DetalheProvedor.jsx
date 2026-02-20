import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import emailjs from "@emailjs/browser";
import { EMAILJS_CONFIG, isEmailJSConfigured } from "../config/emailjs";
import { sendEmailWithPDF } from "../utils/gmailSender";
import { listPdfs, getLastNMonthKeys } from "../utils/pdfStorage";
import PdfAttachments from "../components/PdfAttachments";

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

/** Retorna "YYYY-MM" para um dado índice de mês e ano. */
const toMonthKey = (year, monthIndex) =>
  `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

// Componente simples para substituir window.confirm
const ConfirmationModal = ({ message, onConfirm, onCancel }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800 p-6 rounded-xl shadow-2xl max-w-sm w-full border border-gray-700"
    >
      <h3 className="text-xl font-bold text-red-400 mb-4">Confirmação</h3>
      <p className="text-gray-300 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCancel}
          className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
        >
          Cancelar
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Confirmar Exclusão
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
);

/** Modal de seleção de mês para envio do relatório */
const SendMonthModal = ({ selectedMonth, onMonthChange, onConfirm, onCancel }) => {
  const now = new Date();
  const year = now.getFullYear();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-800 p-6 rounded-xl shadow-2xl max-w-sm w-full border border-gray-700"
      >
        <h3 className="text-xl font-bold text-blue-400 mb-2">📧 Enviar Relatório</h3>
        <p className="text-gray-400 text-sm mb-4">Selecione o mês de referência do relatório e os documentos que serão anexados.</p>

        <label className="block text-sm font-semibold text-gray-300 mb-2">Mês de referência</label>
        <div className="grid grid-cols-3 gap-2 mb-6">
          {getLastNMonthKeys(6).map((key) => {
            const [yr, mn] = key.split('-').map(Number);
            const label = MONTH_NAMES[mn - 1];
            const isActive = selectedMonth === key;
            return (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onMonthChange(key)}
                className={`px-2 py-2 rounded-lg text-xs font-semibold transition-all duration-150 flex flex-col items-center leading-tight
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-200 border border-gray-600'
                  }`}
              >
                <span>{label.slice(0, 3)}</span>
                <span className="opacity-60 text-[9px]">{yr}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="flex justify-end gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
          >
            Cancelar
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition font-semibold"
          >
            📧 Enviar
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

function DetalheProvedor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuth();

  const [provedor, setProvedor] = useState(null);
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  // Mês de referência para o relatório (padrão: mês anterior)
  const _now = new Date();
  const _prevMonthIndex = _now.getMonth() === 0 ? 11 : _now.getMonth() - 1;
  const _prevYear = _now.getMonth() === 0 ? _now.getFullYear() - 1 : _now.getFullYear();
  const [sendMonth, setSendMonth] = useState(
    toMonthKey(_prevYear, _prevMonthIndex)
  );

  // Helper para definir cores por status
  // Normaliza texto para comparações estáveis (minúsculas, sem acentos, hifens)
  const normalize = (text) => {
    if (!text) return '';
    return String(text)
      .toLowerCase()
      .normalize('NFD').replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  // Retorna cores de foreground/background sutis
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
    if (v === 'nao-informado' || v === 'nao' || v === 'nao-informado') return subtle.yellow;
    return subtle.yellow;
  };

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

  // Função para gerar PDF do provedor
  const generatePDF = async (provedor) => {
    try {

      // Criar um novo documento PDF
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Configurar fonte
      pdf.setFont('helvetica');

      // Cabeçalho com gradiente simulado
      pdf.setFillColor(6, 182, 212); // Cyan
      pdf.rect(0, 0, 210, 30, 'F');

      // Título principal com cor branca e mês (mês anterior)
      const now = new Date();
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      // Calcular mês anterior
      const previousMonthIndex = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const previousMonth = monthNames[previousMonthIndex];
      const reportYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255);
      pdf.text(`RELATORIO MENSAL - ${previousMonth} ${reportYear}`, 105, 20, { align: 'center' });

      // Linha separadora
      pdf.setDrawColor(255, 255, 255);
      pdf.line(20, 35, 190, 35);

      let yPosition = 45;

      // 1. PRIMEIRO: Informações da Empresa (Provedor)
      pdf.setFillColor(6, 182, 212);
      pdf.roundedRect(20, yPosition - 5, 170, 15, 3, 3, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INFORMACOES DO PROVEDOR', 25, yPosition + 5);
      yPosition += 20;

      // Dados básicos em formato de tabela
      const basicInfo = [
        { label: 'Razao Social', value: provedor.razaoSocial || 'N/A' },
        { label: 'CNPJ', value: provedor.cnpj || 'N/A' },
        { label: 'Regime', value: provedor.regime || 'N/A' },
        { label: 'N Fistel', value: provedor.numeroFiscal || 'N/A' },
        { label: 'N SCM', value: provedor.numeroScm || 'N/A' },
        { label: 'Status da Empresa', value: provedor.statusEmpresa || 'N/A' }
      ];

      basicInfo.forEach((info, index) => {
        // Alternar cores das linhas
        if (index % 2 === 0) {
          pdf.setFillColor(248, 250, 252); // Gray-50
          pdf.rect(20, yPosition - 3, 170, 8, 'F');
        }

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${info.label}:`, 25, yPosition + 3);

        // Valor com badge de status quando aplicável
        pdf.setFont('helvetica', 'normal');
        if (info.label === 'Status da Empresa') {
          const colors = getStatusColors(info.value);
          drawStatusChip(pdf, 78, yPosition + 1, info.value, colors);
        } else {
          pdf.text(info.value, 80, yPosition + 3);
        }

        yPosition += 8;
      });

      yPosition += 10;

      // Verificar se precisa de nova página
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }

      // 2. SEGUNDO: Informações do Conselho Federal
      pdf.setFillColor(31, 41, 55); // Gray-800
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

      // Verificar se precisa de nova página
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }

      // 3. TERCEIRO: Informações Regulatórias Anatel
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
        // Alternar cores das linhas
        if (index % 2 === 0) {
          pdf.setFillColor(248, 250, 252); // Gray-50
          pdf.rect(20, yPosition - 3, 170, 8, 'F');
        }

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${info.label}:`, 25, yPosition + 3);

        // Badge de status para campos regulatórios
        pdf.setFont('helvetica', 'normal');
        const colors = getStatusColors(info.value);
        drawStatusChip(pdf, 78, yPosition + 1, info.value, colors);

        yPosition += 8;
      });

      yPosition += 10;

      // Verificar se precisa de nova página
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }

      // Observações com design melhorado - SEMPRE MOSTRAR
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
      yPosition += 25;


      // Rodapé melhorado
      const pageHeight = pdf.internal.pageSize.height;
      pdf.setFillColor(31, 41, 55);
      pdf.rect(0, pageHeight - 20, 210, 20, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, pageHeight - 10);
      pdf.text('Sistema de Controle de Provedores', 105, pageHeight - 10, { align: 'center' });
      pdf.text('contato@sistema.com', 190, pageHeight - 10, { align: 'right' });

      // Salvar o PDF
      pdf.save(`relatorio_${provedor.razaoSocial?.replace(/\s+/g, '_') || 'provedor'}.pdf`);

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF. Tente novamente.');
    }
  };

  // Função para gerar PDF em base64 (para envio por email)
  const generatePDFBase64 = async (provedor, monthLabel = null, yearLabel = null) => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.setFont('helvetica');

      // Cabeçalho com gradiente simulado
      pdf.setFillColor(6, 182, 212);
      pdf.rect(0, 0, 210, 30, 'F');

      // Título principal — usa monthLabel/yearLabel se fornecidos, senão mês anterior
      const now = new Date();
      const _monthNames = [
        'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      const previousMonthIndex = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const previousMonth = monthLabel || _monthNames[previousMonthIndex];
      const reportYear = yearLabel || (now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear());

      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255);
      pdf.text(`RELATORIO MENSAL - ${previousMonth} ${reportYear}`, 105, 20, { align: 'center' });

      pdf.setDrawColor(255, 255, 255);
      pdf.line(20, 35, 190, 35);

      let yPosition = 45;

      // 1. PRIMEIRO: Informações da Empresa (Provedor)
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
        // Chip sutil para Status da Empresa
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

      // 2. SEGUNDO: Informações do Conselho Federal
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

      // 3. TERCEIRO: Informações Regulatórias Anatel
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

      // Converter PDF para base64
      const pdfBlob = pdf.output('blob');
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64data = reader.result;
          resolve(base64data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw error;
    }
  };

  // Função para enviar relatório por email via Gmail API
  const sendReportByEmail = async () => {
    // Delega a abertura do modal para o botão.
    // A função real é sendReportByEmailWithMonth, chamada depois da seleção.
    setShowSendModal(true);
  };

  const sendReportByEmailWithMonth = async (monthKey) => {
    setShowSendModal(false);
    if (!provedor.emailContato) {
      toast.error('Email de contato não cadastrado');
      return;
    }

    try {
      toast.info('Gerando PDF e preparando envio...', { autoClose: 2000 });

      // Resolve mês e ano a partir do monthKey ("YYYY-MM")
      const [reportYear, monthNum] = monthKey.split('-').map(Number);
      const previousMonth = MONTH_NAMES[monthNum - 1];

      // Gera o PDF do relatório em base64 com o mês correto
      const pdfBase64 = await generatePDFBase64(provedor, previousMonth, reportYear);

      // Nome do arquivo PDF principal
      const pdfFileName = `relatorio_${provedor.razaoSocial?.replace(/\s+/g, '_') || 'provedor'}.pdf`;

      // Busca PDFs do mês selecionado no Firestore (base64 já incluso)
      let attachments = [];
      try {
        const storedPdfs = await listPdfs(id, monthKey);
        if (storedPdfs.length > 0) {
          toast.info(`Anexando ${storedPdfs.length} documento(s) de ${previousMonth}...`, { autoClose: 2000 });
          // base64 já vem direto do Firestore — sem fetch extra
          attachments = storedPdfs
            .filter((pdf) => pdf.data)
            .map((pdf) => ({ base64: pdf.data, fileName: pdf.originalName }));
        }
      } catch (attachmentErr) {
        console.warn('Aviso: não foi possível anexar alguns documentos:', attachmentErr);
        toast.warn('Relatório será enviado sem os documentos extras.');
      }

      // Corpo do email em HTML
      const attachmentNote = attachments.length > 0
        ? `<p>Este email contém <strong>${attachments.length + 1} arquivo(s) em anexo</strong>: o relatório mensal e ${attachments.length} documento(s) adicional(is) do provedor.</p>`
        : '';

      const emailBody = `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #06b6d4;">Relatório Mensal</h2>
            <p>Olá,</p>
            <p>Segue em anexo o relatório mensal de <strong>${previousMonth} ${reportYear}</strong> referente à empresa <strong>${provedor.razaoSocial || 'Provedor'}</strong>.</p>
            <p>O relatório contém todas as informações regulatórias e atualizações necessárias.</p>
            ${attachmentNote}
            <br>
          </body>
        </html>
      `;

      // Assunto do email
      const subject = `Relatório Mensal - ${previousMonth} ${reportYear} - ${provedor.razaoSocial || 'Provedor'}`;

      toast.info('Autenticando com Google e enviando email...', { autoClose: 3000 });

      // Envia o email com o relatório + documentos anexos
      await sendEmailWithPDF(
        provedor.emailContato,
        subject,
        emailBody,
        pdfBase64,
        pdfFileName,
        attachments
      );

      const totalAnexos = 1 + attachments.length;
      toast.success(`Relatório enviado com ${totalAnexos} anexo(s) para ${provedor.emailContato}! 📧`);
    } catch (error) {
      console.error('Erro ao enviar relatório:', error);
      toast.error(error.message || 'Erro ao enviar relatório por email. Tente novamente.');
    }
  };

  useEffect(() => {
    const fetchProvedor = async () => {
      if (!userId) return;

      setInitialLoading(true);
      try {
        const docRef = doc(db, "provedores", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          // Verificar se o provedor pertence ao usuário logado
          if (data.userId !== userId) {
            setUnauthorized(true);
            toast.error("Você não tem permissão para acessar este provedor");
            return;
          }

          setProvedor({ id: docSnap.id, ...data });
        } else {
          toast.error("Provedor não encontrado 😢");
          navigate("/");
        }
      } catch (error) {
        console.error("Erro ao buscar provedor:", error);
        toast.error("Erro ao buscar provedor");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProvedor();
  }, [id, navigate, userId]);

  // Função de classe atualizada para o tema escuro
  const situacaoClass = (value) => {
    if (!value) return "border-gray-700 bg-gray-700 text-gray-400";

    const lowerValue = value.toLowerCase();

    if (lowerValue === "regular" || lowerValue === "ativa") {
      // Ativo/Regular: Cyan (Azul claro)
      return "border-cyan-500 bg-cyan-900/40 text-cyan-400 focus:ring-cyan-500";
    }

    if (lowerValue === "irregular" || lowerValue === "inativa") {
      // Inativo/Irregular: Vermelho
      return "border-red-500 bg-red-900/40 text-red-400 focus:ring-red-500";
    }

    if (lowerValue === "nao-informado" || lowerValue === "nao informado") {
      // Não informado: Amarelo
      return "border-yellow-500 bg-yellow-900/40 text-yellow-400 focus:ring-yellow-500";
    }

    // Default para outros (suspensa, em-analise)
    return "border-yellow-500 bg-yellow-900/40 text-yellow-400 focus:ring-yellow-500";
  };

  const handleSalvar = async () => {
    if (!userId || provedor.userId !== userId) {
      toast.error("Você não tem permissão para editar este provedor");
      return;
    }

    setLoading(true);
    try {
      const docRef = doc(db, "provedores", id);
      await updateDoc(docRef, provedor);
      toast.success("Alterações salvas com sucesso!");
      setEditando(false);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar alterações");
    }
    setLoading(false);
  };

  const handleExcluir = async () => {
    setShowConfirmModal(true);
  };

  const confirmExclusao = async () => {
    if (!userId || provedor.userId !== userId) {
      toast.error("Você não tem permissão para excluir este provedor");
      setShowConfirmModal(false);
      return;
    }

    setShowConfirmModal(false);
    try {
      await deleteDoc(doc(db, "provedores", id));
      toast.success("Provedor excluído com sucesso!");
      navigate("/");
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast.error("Erro ao excluir provedor");
    }
  };

  if (initialLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-900 flex items-center justify-center p-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 max-w-md"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
            Carregando...
          </h2>
          <p className="text-gray-400">
            Buscando informações do provedor
          </p>
        </motion.div>
      </motion.div>
    );
  }

  if (unauthorized) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-900 flex items-center justify-center p-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 max-w-md"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-400 mb-4">Acesso Negado</h2>
          <p className="text-gray-300 mb-6">
            Você não tem permissão para acessar este provedor. Este provedor pertence a outro usuário.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-500 transition font-medium"
          >
            Voltar para a Lista
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  if (!provedor)
    return <p className="text-center mt-10 text-gray-300">Carregando...</p>;

  return (
    // Fundo Escuro
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900 min-h-screen p-8 text-white"
    >
      <AnimatePresence>
        {showConfirmModal && (
          <ConfirmationModal
            message={`Você realmente deseja excluir o provedor ${provedor.razaoSocial}? Esta ação é irreversível.`}
            onConfirm={confirmExclusao}
            onCancel={() => setShowConfirmModal(false)}
          />
        )}
        {showSendModal && (
          <SendMonthModal
            selectedMonth={sendMonth}
            onMonthChange={setSendMonth}
            onConfirm={() => sendReportByEmailWithMonth(sendMonth)}
            onCancel={() => setShowSendModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Container Principal */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-5xl mx-auto bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-700"
      >
        {/* Botão Voltar */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="mb-8 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition"
        >
          ← Voltar
        </motion.button>

        {/* Título com Gradient */}
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-4xl font-extrabold text-center mb-10 border-b-4 border-cyan-500 pb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 break-words hyphens-auto leading-tight"
          style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
        >
          {provedor.razaoSocial || "Detalhes do Provedor"}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Seção CFT - Informações do Conselho Federal */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="col-span-2 mb-6 p-4 bg-gray-700/50 rounded-xl border-l-4 border-cyan-500"
          >
            <h3 className="text-2xl font-bold text-cyan-400 mb-4 border-b border-gray-600 pb-2">
              Conselho Federal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-gray-300 mb-1 text-sm">
                  Registro no CFT
                </label>
                {editando ? (
                  <input
                    type="text"
                    value={provedor.councilInfo?.registroCft || ""}
                    onChange={(e) =>
                      setProvedor({
                        ...provedor,
                        councilInfo: {
                          ...provedor.councilInfo,
                          registroCft: e.target.value
                        }
                      })
                    }
                    placeholder="Digite o registro no CFT"
                    className="w-full border border-gray-700 bg-gray-900 text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition text-sm"
                  />
                ) : (
                  <p className="text-gray-200 text-sm">{provedor.councilInfo?.registroCft || "N/A"}</p>
                )}
              </div>
              <div>
                <label className="block font-semibold text-gray-300 mb-1 text-sm">
                  Responsável Técnico
                </label>
                <p className="text-gray-200 text-sm">{provedor.councilInfo?.nome} {provedor.councilInfo?.sobrenome}</p>
              </div>
              <div>
                <label className="block font-semibold text-gray-300 mb-1 text-sm">
                  Processos CFT
                </label>
                {editando ? (
                  <input
                    type="text"
                    value={provedor.councilInfo?.processosCft || ""}
                    onChange={(e) =>
                      setProvedor({
                        ...provedor,
                        councilInfo: {
                          ...provedor.councilInfo,
                          processosCft: e.target.value
                        }
                      })
                    }
                    placeholder="Digite os processos CFT"
                    className="w-full border border-gray-700 bg-gray-900 text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition text-sm"
                  />
                ) : (
                  <p className="text-gray-200 text-sm">{provedor.councilInfo?.processosCft || "N/A"}</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Mapeamento dos campos e aplicação do Dark Theme nos inputs */}
          {[
            ["razaoSocial", "Razão Social", "text"],
            ["cnpj", "CNPJ", "text"],
            ["numeroFiscal", "Nº Fistel", "number"],
            ["numeroScm", "Nº SCM", "number"],
            ["emailContato", "Email de Contato", "email"],
          ].map(([campo, label, type], index) => (
            <motion.div
              key={campo}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
            >
              <label className="block font-semibold text-gray-300 mb-1">
                {label}
              </label>
              <input
                type={type}
                value={provedor[campo] || ""}
                disabled={!editando}
                onChange={(e) =>
                  setProvedor({ ...provedor, [campo]: e.target.value })
                }
                placeholder={`Digite ${label.toLowerCase()}`}
                className={`w-full border border-gray-700 bg-gray-700 text-gray-200 rounded-lg px-4 py-2 
                           focus:outline-none focus:ring-2 focus:ring-cyan-500 transition 
                           break-words
                           ${!editando
                    ? "bg-gray-700 cursor-not-allowed text-gray-400"
                    : "bg-gray-900"
                  }`}
                style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
              />
            </motion.div>
          ))}

          {/* Regime (Select) */}
          <div>
            <label className="block font-semibold text-gray-300 mb-1">
              Regime
            </label>
            <select
              value={provedor.regime || ""}
              disabled={!editando}
              onChange={(e) =>
                setProvedor({ ...provedor, regime: e.target.value })
              }
              className={`w-full border border-gray-700 bg-gray-700 text-gray-200 rounded-lg px-4 py-2 
                         focus:outline-none focus:ring-2 focus:ring-cyan-500 transition 
                         ${!editando
                  ? "bg-gray-700 cursor-not-allowed text-gray-400"
                  : "bg-gray-900"
                }`}
            >
              <option value="" disabled>
                Selecione o regime
              </option>
              <option value="Simples Nacional">Simples Nacional</option>
              <option value="Lucro Presumido">Lucro Presumido</option>
              <option value="Lucro Real">Lucro Real</option>
              <option value="ME">ME</option>
              <option value="SE">SE</option>
            </select>
          </div>

          {/* Status Empresa (Select) */}
          <div>
            <label className="block font-semibold text-gray-300 mb-1">
              Status da Empresa
            </label>
            <select
              value={provedor.statusEmpresa || ""}
              disabled={!editando}
              onChange={(e) =>
                setProvedor({ ...provedor, statusEmpresa: e.target.value })
              }
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${situacaoClass(
                provedor.statusEmpresa
              )} ${!editando
                ? "bg-gray-700 cursor-not-allowed text-gray-400"
                : "bg-gray-900"
                }`}
            >
              <option value="" disabled>
                Selecione o status
              </option>
              <option value="ativa">Ativa</option>
              <option value="inativa">Inativa</option>
              <option value="suspensa">Suspensa</option>
              <option value="em-analise">Em Análise</option>
            </select>
          </div>

          {/* Seção Representante Legal - ACIMA DA ANATEL */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="col-span-2 mb-6 p-4 bg-gray-700/50 rounded-xl border-l-4 border-purple-500"
          >
            <h3 className="text-2xl font-bold text-purple-400 mb-4 border-b border-gray-600 pb-2">
              Representante Legal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-300 mb-1 text-sm">
                  Nome Completo do Usuário
                </label>
                <p className="text-gray-200 bg-gray-800 p-3 rounded-lg">
                  {provedor.representanteLegal?.nomeCompleto || "N/A"}
                </p>
              </div>
              <div>
                <label className="block font-semibold text-gray-300 mb-1 text-sm">
                  Data de Nascimento
                </label>
                <p className="text-gray-200 bg-gray-800 p-3 rounded-lg">
                  {provedor.representanteLegal?.dataNascimento || "N/A"}
                </p>
              </div>
              <div>
                <label className="block font-semibold text-gray-300 mb-1 text-sm">
                  Documento de Identidade
                </label>
                <p className="text-gray-200 bg-gray-800 p-3 rounded-lg">
                  {provedor.representanteLegal?.documentoIdentidade || "N/A"}
                </p>
              </div>
              <div>
                <label className="block font-semibold text-gray-300 mb-1 text-sm">
                  CPF
                </label>
                <p className="text-gray-200 bg-gray-800 p-3 rounded-lg">
                  {provedor.representanteLegal?.cpf || "N/A"}
                </p>
              </div>
              <div>
                <label className="block font-semibold text-gray-300 mb-1 text-sm">
                  E-mail de Login no SEI
                </label>
                <p className="text-gray-200 bg-gray-800 p-3 rounded-lg">
                  {provedor.representanteLegal?.emailLogin || "N/A"}
                </p>
              </div>
              <div>
                <label className="block font-semibold text-gray-300 mb-1 text-sm">
                  Telefone
                </label>
                <p className="text-gray-200 bg-gray-800 p-3 rounded-lg">
                  {provedor.representanteLegal?.telefone || "N/A"}
                </p>
              </div>
              <div>
                <label className="block font-semibold text-gray-300 mb-1 text-sm">
                  Endereço de Domicílio
                </label>
                <p className="text-gray-200 bg-gray-800 p-3 rounded-lg">
                  {provedor.representanteLegal?.endereco || "N/A"}
                </p>
              </div>
              <div>
                <label className="block font-semibold text-gray-300 mb-1 text-sm">
                  Bairro
                </label>
                <p className="text-gray-200 bg-gray-800 p-3 rounded-lg">
                  {provedor.representanteLegal?.bairro || "N/A"}
                </p>
              </div>
              <div>
                <label className="block font-semibold text-gray-300 mb-1 text-sm">
                  Estado (UF)
                </label>
                <p className="text-gray-200 bg-gray-800 p-3 rounded-lg">
                  {provedor.representanteLegal?.estado || "N/A"}
                </p>
              </div>
              <div>
                <label className="block font-semibold text-gray-300 mb-1 text-sm">
                  Cidade
                </label>
                <p className="text-gray-200 bg-gray-800 p-3 rounded-lg">
                  {provedor.representanteLegal?.cidade || "N/A"}
                </p>
              </div>
              <div className="col-span-2">
                <label className="block font-semibold text-gray-300 mb-1 text-sm">
                  CEP
                </label>
                <p className="text-gray-200 bg-gray-800 p-3 rounded-lg">
                  {provedor.representanteLegal?.cep || "N/A"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Campos Anatel - Agrupamento e Estilo */}
          <div className="col-span-2 mt-6 p-4 bg-gray-700/50 rounded-xl">
            <h3 className="text-2xl font-bold text-cyan-400 mb-4 border-b border-gray-600 pb-2">
              Anatel
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                ["cnpjAnatel", "Situação CNPJ Anatel"],
                ["situacaoAnatel", "Situação Anatel/Ancine"],
                ["fust", "FUST"],
                ["coletaDeDadosM", "Coleta de Dados Mensal"],
                ["coletaDeDadosEconomicos", "Coleta de Dados Econômicos"],
                ["dadosInfra", "Dados de Infraestrutura"],
                ["registroEstacoes", "Registro de Estações"],
              ].map(([campo, label]) => (
                <div key={campo}>
                  <label className="block font-semibold text-gray-300 mb-1 text-sm">
                    {label}
                  </label>
                  <select
                    value={provedor[campo] || ""}
                    disabled={!editando}
                    onChange={(e) =>
                      setProvedor({ ...provedor, [campo]: e.target.value })
                    }
                    // Aplica cores dinâmicas de acordo com 'regular' ou 'irregular'
                    className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${situacaoClass(
                      provedor[campo]
                    )} ${!editando
                      ? "bg-gray-700 cursor-not-allowed text-gray-400"
                      : "bg-gray-900"
                      }`}
                  >
                    <option value="" disabled>
                      Selecione
                    </option>
                    <option value="regular">Regular</option>
                    <option value="irregular">Irregular</option>
                    <option value="nao-informado">Não informado</option>
                  </select>
                </div>
              ))}
            </div>

            {/* Campo de Processos Anatel */}
            <div className="mt-4">
              <label className="block font-semibold text-gray-300 mb-1 text-sm">
                Processos Anatel
              </label>
              <textarea
                value={provedor.processoAnatel || ""}
                disabled={!editando}
                onChange={(e) =>
                  setProvedor({ ...provedor, processoAnatel: e.target.value })
                }
                placeholder="Digite os números dos processos Anatel (separados por vírgula ou quebra de linha)"
                rows="3"
                className={`w-full border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 transition ${!editando
                  ? "bg-gray-700 cursor-not-allowed text-gray-400"
                  : "bg-gray-900 text-gray-200"
                  }`}
              />
            </div>
          </div>

          {/* Observações */}
          <div className="col-span-2 mt-2">
            <label className="block font-semibold text-gray-300 mb-1">
              Observações
            </label>
            <textarea
              value={provedor.obs || ""}
              disabled={!editando}
              onChange={(e) =>
                setProvedor({ ...provedor, obs: e.target.value })
              }
              placeholder="Digite observações adicionais"
              rows="3"
              className={`w-full border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition 
                         ${!editando
                  ? "bg-gray-700 cursor-not-allowed text-gray-400"
                  : "bg-gray-900 text-gray-200"
                }`}
            />
          </div>
        </div>

        {/* Seção de Documentos Anexos */}
        <PdfAttachments provedorId={id} />

        {/* Botões - Cores e estilos atualizados */}
        <div className="flex justify-center gap-6 mt-12 pt-6 border-t border-gray-700">
          {editando ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSalvar}
              disabled={loading}
              className="bg-cyan-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-cyan-500 transition disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading ? "Salvando..." : "Salvar Alterações"}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEditando(true)}
              className="bg-cyan-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-cyan-600 transition transform hover:scale-105"
            >
              ✏️ Editar Provedor
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => generatePDF(provedor)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:from-green-500 hover:to-emerald-500 transition transform hover:scale-105"
          >
            📄 Gerar PDF
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSendModal(true)}
            disabled={!provedor.emailContato}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:from-blue-500 hover:to-indigo-500 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            title={!provedor.emailContato ? 'Email de contato não cadastrado' : 'Enviar relatório por email'}
          >
            📧 Enviar Relatório
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExcluir}
            className="bg-red-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-red-600 transition transform hover:scale-105"
          >
            🗑️ Excluir
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default DetalheProvedor;
