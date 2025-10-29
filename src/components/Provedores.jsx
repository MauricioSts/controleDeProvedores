import React from "react";
import { motion } from "framer-motion";

function Provedores({ listaProvedores, onCardClick, searchTerm = '' }) {
  const statusClass = (status, returnColorBase = false) => {
    if (!status) {
      return returnColorBase ? "gray" : "text-gray-400"; // 'N/A' ou vazio
    }

    const lowerStatus = status.toLowerCase();

    if (lowerStatus === "regular" || lowerStatus === "ativo") {
      // ATIVA / REGULAR: Azul/Cyan
      return returnColorBase ? "cyan" : "text-cyan-400 font-semibold";
    }

    if (lowerStatus === "irregular" || lowerStatus === "inativo") {
      // INATIVA / IRREGULAR: Vermelho
      return returnColorBase ? "red" : "text-red-400 font-semibold";
    }

    return returnColorBase ? "gray" : "text-gray-400"; // Outros status
  };

  // Função para verificar se há informações irregulares
  const hasIrregularInfo = (provedor) => {
    const irregularStatuses = ['irregular', 'inativa', 'inativo'];
    const camposParaVerificar = [
      'statusEmpresa',
      'cnpjAnatel',
      'situacaoAnatel',
      'fust',
      'coletaDeDadosM',
      'coletaDeDadosEconomicos',
      'dadosInfra',
      'registroEstacoes'
    ];

    return camposParaVerificar.some(campo => {
      const value = provedor[campo]?.toLowerCase();
      return value && irregularStatuses.includes(value);
    });
  };

  if (!listaProvedores || listaProvedores.length === 0) {
    return <p className="text-gray-400 italic">Nenhum provedor cadastrado.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {listaProvedores.map((p, index) => {
        // Obter a cor base (cyan ou red) para o BADGE
        const statusBaseColor = statusClass(p.statusEmpresa, true);
        const badgeBgClass =
          statusBaseColor === "red"
            ? "bg-red-900/50 text-red-300"
            : "bg-cyan-900/50 text-cyan-300";

        const temIrregularidade = hasIrregularInfo(p);
        
        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            onClick={() => onCardClick && onCardClick(p.id)}
            className="bg-gray-700/50 p-5 rounded-lg border-l-4 border-cyan-500 shadow-lg 
                       hover:shadow-xl hover:border-cyan-400 transition-all duration-200 
                       cursor-pointer relative"
          >
            {/* Bolinha amarela para irregularidades */}
            {temIrregularidade && (
              <div
                className="absolute top-3 right-3 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center"
                title="Há informações irregulares"
              >
                <span className="text-xs text-gray-900 font-bold">!</span>
              </div>
            )}
            
            {/* Indicador de status */}
            <div 
              className={`absolute ${temIrregularidade ? 'top-3 left-3' : 'top-3 right-3'} w-3 h-3 rounded-full ${
                p.statusEmpresa?.toLowerCase() === 'ativa' || p.statusEmpresa?.toLowerCase() === 'ativo' 
                  ? 'bg-green-500' 
                  : p.statusEmpresa?.toLowerCase() === 'inativa' || p.statusEmpresa?.toLowerCase() === 'inativo'
                  ? 'bg-red-500'
                  : 'bg-gray-500'
              }`}
              title={`Status: ${p.statusEmpresa || 'N/A'}`}
            ></div>
            {/* Título do Card - Altura fixa para alinhamento */}
            <div className="h-16 mb-3 border-b border-gray-600 pb-2 overflow-hidden">
              <h3 
                className="text-xl font-bold text-cyan-400 leading-tight"
                style={{ 
                  wordBreak: 'break-word', 
                  overflowWrap: 'break-word',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
                title={p.razaoSocial}
              >
                {p.razaoSocial}
              </h3>
            </div>

            {/* Conteúdo do Card */}
            <div className="space-y-2">
              {/* Status Empresa com Badge */}
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-300">
                  Status Empresa:
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${badgeBgClass}`}
                >
                  {p.statusEmpresa || "N/A"}
                </span>
              </div>

              {/* CNPJ */}
              <p className="text-sm pt-1 border-t border-gray-600/30">
                <span className="font-medium text-gray-300">CNPJ:</span>{" "}
                <span className="text-gray-300">{p.cnpj || "N/A"}</span>
              </p>

              {/* Observações - sempre ocupa espaço para manter alinhamento */}
              <div className="text-sm pt-1 border-t border-gray-600/30 min-h-[2.5rem]">
                {p.obs && (
                  <>
                    <span className="font-medium text-gray-300">Observações:</span>
                    <span className="text-gray-400 italic ml-1 text-xs block mt-1">
                      {p.obs}
                    </span>
                  </>
                )}
              </div>

              {/* Representante Legal - apenas o nome */}
              <div className="mt-3 pt-3 border-t border-gray-600/50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-purple-400">👤</span>
                  <span className="font-semibold text-purple-400 text-sm">
                    Representante Legal
                  </span>
                </div>
                <p className="text-sm text-gray-300 ml-6">
                  <span className="font-medium text-gray-200">Nome:</span>{" "}
                  {p.representanteLegal?.nomeCompleto || "N/A"}
                </p>
              </div>

              {/* Responsável Técnico */}
              <div className="mt-2 pt-3 border-t border-gray-600/50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-cyan-400">🔧</span>
                  <span className="font-semibold text-cyan-400 text-sm">
                    Responsável Técnico
                  </span>
                </div>
                <p className="text-sm text-gray-300 ml-6">
                  <span className="font-medium text-gray-200">Nome:</span>{" "}
                  {p.councilInfo?.nome && p.councilInfo?.sobrenome 
                    ? `${p.councilInfo.nome} ${p.councilInfo.sobrenome}`
                    : p.councilInfo?.nome || "N/A"}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default Provedores;
