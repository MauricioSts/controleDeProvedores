import React, { useState } from "react";
import Provedores from "../components/Provedores";
import ExplosionLoading from "../components/ExplosionLoading";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import { testEnvioAutomatico } from "../utils/testEmailAutomatico";

function ListaProvedores({ lista }) {
  const navigate = useNavigate();
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showExplosionLoading, setShowExplosionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTestingEmails, setIsTestingEmails] = useState(false);

  const handleCardClick = (id) => {
    navigate(`/provedor/${id}`);
  };

  // Filtrar provedores baseado na busca
  const filteredProvedores = lista?.filter(provedor => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      provedor.razaoSocial?.toLowerCase().includes(searchLower) ||
      provedor.cnpj?.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Função para confirmar geração de todos os PDFs
  const confirmGenerateAllPDFs = async () => {
    setShowConfirmModal(false);
    setShowExplosionLoading(true);

    // Aguardar 7 segundos para o Big Bang
    await new Promise(resolve => setTimeout(resolve, 7000));

    setShowExplosionLoading(false);
    await generateAllPDFs();
  };

  // Função para gerar PDF de um provedor individual
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

        pdf.setFont('helvetica', 'normal');
        pdf.text(info.value, 80, yPosition + 3);

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

        pdf.setFont('helvetica', 'normal');
        pdf.text(info.value, 80, yPosition + 3);

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
      throw error;
    }
  };

  // Função para gerar PDFs de todos os provedores
  const generateAllPDFs = async () => {
    if (!lista || lista.length === 0) {
      toast.warning("Nenhum provedor encontrado para gerar PDFs");
      return;
    }

    setIsGeneratingAll(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (let i = 0; i < lista.length; i++) {
        const provedor = lista[i];
        try {
          await generatePDF(provedor);
          successCount++;
          toast.success(`PDF gerado: ${provedor.razaoSocial || 'Provedor sem nome'}`);

          // Pequena pausa entre gerações para não sobrecarregar o navegador
          if (i < lista.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.error(`Erro ao gerar PDF para ${provedor.razaoSocial}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} PDF(s) gerado(s) com sucesso!`);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} PDF(s) falharam na geração`);
      }
    } catch (error) {
      console.error('Erro geral na geração de PDFs:', error);
      toast.error('Erro ao gerar PDFs. Tente novamente.');
    } finally {
      setIsGeneratingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 sm:p-10">
      <div className="mx-auto bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8">
        {/* Título com contador */}
        <div className="mb-8 border-b-4 border-cyan-500 pb-2">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Lista de Provedores
            </h2>

            {/* Contador de Provedores */}
            {lista && lista.length > 0 && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 px-4 py-2 rounded-xl border border-cyan-400/30 shadow-lg backdrop-blur-sm hover:scale-105 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(6,182,212,0.3)] transition-all duration-200">
                <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                <span className="font-bold text-base">{lista.length}</span>
                <span className="text-sm font-medium text-cyan-200">
                  {lista.length === 1 ? 'provedor' : 'provedores'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Input de Busca */}
        {lista && lista.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="Buscar por razão social ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-gray-700 border border-gray-600 rounded-xl 
                           text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                           focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Botão Enviar Todos os Emails */}
        {lista && lista.length > 0 && (
          <div className="flex justify-center mb-4">
            <button
              onClick={async () => {
                setIsTestingEmails(true);
                try {
                  toast.info('Você precisará fazer login no Google para autorizar o envio de emails.', {
                    autoClose: 4000
                  });

                  const result = await testEnvioAutomatico();

                  if (result.total === 0) {
                    toast.warning('Nenhum provedor com envio ativado (switch ligado) e email cadastrado encontrado.');
                  } else {
                    const successCount = result.results.filter(r => r.status === 'success').length;
                    const errorCount = result.results.filter(r => r.status === 'error').length;

                    if (successCount > 0) {
                      toast.success(`✅ ${successCount} email(s) enviado(s) com sucesso!`);
                    }
                    if (errorCount > 0) {
                      toast.error(`❌ ${errorCount} email(s) falharam. Verifique o console.`);
                    }
                  }
                } catch (error) {
                  console.error('Erro ao enviar emails:', error);
                  toast.error(error.message || 'Erro ao enviar emails. Verifique o console.');
                } finally {
                  setIsTestingEmails(false);
                }
              }}
              disabled={isTestingEmails}
              className="relative px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 
                         bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-xl shadow-green-500/30 
                         border border-green-400/40 disabled:opacity-50 disabled:cursor-not-allowed
                         hover:from-green-400 hover:to-emerald-400 hover:scale-105 hover:-translate-y-0.5 hover:shadow-[0_15px_35px_rgba(34,197,94,0.4)] active:scale-95"
            >
              <span className="flex items-center gap-2">
                {isTestingEmails ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando emails...
                  </>
                ) : (
                  <>
                    <span className="text-xl">📧</span>
                    Enviar Todos os Emails
                  </>
                )}
              </span>
            </button>
          </div>
        )}

        {/* Botão Baixar Todos PDFs */}
        {lista && lista.length > 0 && (
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={isGeneratingAll}
              className="relative px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-200
                         text-white shadow-2xl shadow-cyan-500/25 border border-cyan-400/30
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                         overflow-hidden group hover:scale-105 hover:-translate-y-0.5 hover:shadow-[0_15px_35px_rgba(6,182,212,0.4)] active:scale-95"
              style={{
                background: 'linear-gradient(-45deg, #06b6d4, #3b82f6, #8b5cf6)',
              }}
            >
              {/* Efeito de brilho animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                             -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              {/* Conteúdo do botão */}
              <span className="relative z-10 flex items-center gap-3">
                {isGeneratingAll ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Gerando PDFs...
                  </>
                ) : (
                  '⬇️ Baixar Todos os PDFs'
                )}
              </span>
            </button>
          </div>
        )}

        {/* Modal de Confirmação */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Confirmar Download</h3>
                <p className="text-gray-300 mb-6">
                  Você está prestes a baixar <strong className="text-cyan-400">{lista.length}</strong> PDF(s) de uma só vez.
                  Esta ação pode demorar alguns minutos. Deseja continuar?
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="px-6 py-3 text-gray-300 bg-gray-700 rounded-xl hover:bg-gray-600 hover:scale-105 active:scale-95 transition-all font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmGenerateAllPDFs}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-400 hover:to-blue-400 hover:scale-105 active:scale-95 transition-all font-medium"
                  >
                    Confirmar Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {lista && lista.length > 0 ? (
          <>
            {filteredProvedores.length > 0 ? (
              <Provedores
                listaProvedores={filteredProvedores}
                onCardClick={handleCardClick}
                searchTerm={searchTerm}
              />
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-xl text-gray-400 font-medium mb-2">Nenhum provedor encontrado</p>
                <p className="text-sm text-gray-600">
                  Tente buscar por outro termo ou limpe o filtro
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto mb-4 text-cyan-500 opacity-75"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-xl text-gray-400 font-medium">
              Nenhum provedor cadastrado no momento.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Adicione um novo provedor para começar.
            </p>
          </div>
        )}
      </div>

      {/* Loading de Explosão */}
      <ExplosionLoading
        isVisible={showExplosionLoading}
        onComplete={() => {
          // Callback quando a animação terminar
        }}
      />
    </div>
  );
}

export default ListaProvedores;
