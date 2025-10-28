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
            initial={{ 
              opacity: 0, 
              y: 100, 
              scale: 0.8,
              rotateX: -15
            }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              rotateX: 0,
              transition: {
                duration: 0.6,
                delay: searchTerm ? index * 0.05 : index * 0.15,
                ease: [0.25, 0.46, 0.45, 0.94],
                type: "spring",
                stiffness: 120,
                damping: 20
              }
            }}
            layout
            transition={{
              layout: { duration: 0.4, ease: "easeInOut" }
            }}
            whileHover={{ 
              y: -12, 
              scale: 1.03,
              rotateY: 5,
              transition: { 
                duration: 0.3,
                ease: "easeOut"
              }
            }}
            whileTap={{ 
              scale: 0.95,
              rotateY: -2
            }}
            onClick={() => onCardClick && onCardClick(p.id)}
            className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-xl 
                       hover:shadow-cyan-500/30 hover:shadow-2xl transition-all duration-300 ease-in-out 
                       cursor-pointer relative"
          >
            {/* Bolinha amarela para irregularidades */}
            {temIrregularidade && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  delay: index * 0.15 + 0.3,
                  duration: 0.4,
                  type: "spring",
                  stiffness: 200
                }}
                className="absolute top-3 right-3 w-6 h-6 bg-yellow-500 rounded-full shadow-lg animate-pulse flex items-center justify-center"
                title="Há informações irregulares"
              >
                <span className="text-xs text-gray-900 font-bold">!</span>
              </motion.div>
            )}
            
            {/* Indicadores coloridos nos cantos superiores */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                delay: index * 0.15 + 0.5,
                duration: 0.4,
                type: "spring",
                stiffness: 200
              }}
              className={`absolute ${temIrregularidade ? 'top-3 left-3' : 'top-3 right-3'} w-4 h-4 rounded-full shadow-lg ${
                p.statusEmpresa?.toLowerCase() === 'ativa' || p.statusEmpresa?.toLowerCase() === 'ativo' 
                  ? 'bg-green-500' 
                  : p.statusEmpresa?.toLowerCase() === 'inativa' || p.statusEmpresa?.toLowerCase() === 'inativo'
                  ? 'bg-red-500'
                  : 'bg-gray-500'
              }`}
              title={`Status: ${p.statusEmpresa || 'N/A'}`}
            ></motion.div>
            {/* Título do Card em Light Blue (Cyan) */}
            <motion.h3 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: index * 0.15 + 0.3,
                duration: 0.5
              }}
              className="text-xl font-bold mb-3 text-cyan-400 border-b border-gray-700 pb-2 break-words hyphens-auto leading-tight"
              style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
            >
              {p.razaoSocial}
            </motion.h3>

            {/* Conteúdo do Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: index * 0.15 + 0.4,
                duration: 0.6
              }}
              className="space-y-2 text-sm text-gray-300"
            >
              {/* Status Empresa com Badge */}
              <p className="flex justify-between items-center text-base">
                <span className="font-medium text-gray-100">
                  Status Empresa:
                </span>{" "}
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-semibold uppercase ${badgeBgClass}`}
                >
                  {p.statusEmpresa || "N/A"}
                </span>
              </p>

              {/* Nº Fistel e Nº SCM */}
              <p className="pt-2 border-t border-gray-700/50">
                <span className="font-medium text-gray-200">Nº Fistel:</span>{" "}
                {p.numeroFiscal || "N/A"}
                <span className="mx-2 text-gray-500">|</span>
                <span className="font-medium text-gray-200">Nº SCM:</span>{" "}
                {p.numeroScm || "N/A"}
              </p>

              {/* Observações */}
              <p className="pt-2 border-t border-gray-700/50">
                <span className="font-medium text-gray-200">Observações:</span>
                <span className="text-gray-500 italic ml-1 text-xs">
                  {p.obs || "N/A"}
                </span>
              </p>

              {/* Representante Legal - apenas o nome */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.15 + 0.5,
                  duration: 0.4
                }}
                className="pt-3 border-t border-purple-500/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <motion.span
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-purple-400"
                  >
                    👤
                  </motion.span>
                  <span className="font-semibold text-purple-400 text-sm">
                    Representante Legal
                  </span>
                </div>
                <p className="text-xs text-gray-300 ml-4">
                  <span className="font-medium text-gray-200">Nome:</span>{" "}
                  {p.representanteLegal?.nomeCompleto || "N/A"}
                </p>
              </motion.div>

              {/* Responsável Técnico */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.15 + 0.6,
                  duration: 0.4
                }}
                className="pt-3 border-t border-blue-500/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <motion.span
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-blue-400"
                  >
                    🔧
                  </motion.span>
                  <span className="font-semibold text-blue-400 text-sm">
                    Responsável Técnico
                  </span>
                </div>
                <p className="text-xs text-gray-300 ml-4">
                  <span className="font-medium text-gray-200">Nome:</span>{" "}
                  {p.responsavelTecnico?.nomeCompleto || "N/A"}
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default Provedores;
