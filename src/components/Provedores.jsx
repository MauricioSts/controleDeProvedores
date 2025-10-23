import React from "react";
import { motion } from "framer-motion";

function Provedores({ listaProvedores, onCardClick }) {
  // FUNÇÃO DE STATUS MELHORADA: Retorna a classe de texto e a cor base.
  const statusClass = (status, returnColorBase = false) => {
    if (!status) {
      return returnColorBase ? "gray" : "text-gray-400"; // 'N/A' ou vazio
    }

    const lowerStatus = status.toLowerCase();

    if (lowerStatus === "regular" || lowerStatus === "ativo") {
      // 🔵 ATIVA / REGULAR: Azul/Cyan
      return returnColorBase ? "cyan" : "text-cyan-400 font-semibold";
    }

    if (lowerStatus === "irregular" || lowerStatus === "inativo") {
      // 🔴 INATIVA / IRREGULAR: Vermelho
      return returnColorBase ? "red" : "text-red-400 font-semibold";
    }

    return returnColorBase ? "gray" : "text-gray-400"; // Outros status
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
              rotateX: 0
            }}
            transition={{ 
              duration: 0.8, 
              delay: index * 0.15,
              ease: [0.25, 0.46, 0.45, 0.94],
              type: "spring",
              stiffness: 100,
              damping: 15
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
            onClick={() => onCardClick && onCardClick(p.id)} // 🔹 clique no card
            className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-xl 
                       hover:shadow-cyan-500/30 hover:shadow-2xl transition-all duration-300 ease-in-out 
                       cursor-pointer relative"
          >
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
              className={`absolute top-3 right-3 w-4 h-4 rounded-full shadow-lg ${
                p.statusEmpresa?.toLowerCase() === 'ativa' || p.statusEmpresa?.toLowerCase() === 'ativo' 
                  ? 'bg-green-500' 
                  : p.statusEmpresa?.toLowerCase() === 'inativa' || p.statusEmpresa?.toLowerCase() === 'inativo'
                  ? 'bg-red-500'
                  : 'bg-gray-500'
              }`}
              title={`Status: ${p.statusEmpresa || 'N/A'}`}
            ></motion.div>
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                delay: index * 0.15 + 0.6,
                duration: 0.4,
                type: "spring",
                stiffness: 200
              }}
              className={`absolute top-3 left-3 w-3 h-3 rounded-full ${
                p.statusEmpresa?.toLowerCase() === 'ativa' || p.statusEmpresa?.toLowerCase() === 'ativo' 
                  ? 'bg-green-400' 
                  : p.statusEmpresa?.toLowerCase() === 'inativa' || p.statusEmpresa?.toLowerCase() === 'inativo'
                  ? 'bg-red-400'
                  : 'bg-gray-400'
              }`}
            ></motion.div>
            {/* Título do Card em Light Blue (Cyan) */}
            <motion.h3 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: index * 0.15 + 0.3,
                duration: 0.5
              }}
              className="text-xl font-bold mb-3 text-cyan-400 border-b border-gray-700 pb-2"
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
              {/* CORREÇÃO APLICADA AQUI: Status Empresa com Badge */}
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

              <p>
                <span className="font-medium text-gray-200">Regime:</span>{" "}
                {p.regime}
              </p>
              <p>
                <span className="font-medium text-gray-200">CNPJ:</span>{" "}
                {p.cnpj}
              </p>

              {/* Informações regulatórias */}
              <p className="pt-2 border-t border-gray-700/50">
                <span className="font-medium text-gray-200">Nº Fistel:</span>{" "}
                {p.numeroFiscal}
                <span className="mx-2 text-gray-500">|</span>
                <span className="font-medium text-gray-200">Nº SCM:</span>{" "}
                {p.numeroScm}
              </p>

              {/* Status Condicionais com Cores de Destaque (Outros status) */}
              <p>
                <span className="font-medium text-gray-200">CNPJ Anatel:</span>{" "}
                <span className={statusClass(p.cnpjAnatel)}>
                  {p.cnpjAnatel || "N/A"}
                </span>
              </p>
              <p>
                <span className="font-medium text-gray-200">
                  Situação Anatel/Ancine:{" "}
                </span>
                <span className={statusClass(p.situacaoAnatel)}>
                  {p.situacaoAnatel || "N/A"}
                </span>
              </p>
              <p>
                <span className="font-medium text-gray-200">
                  Processo Anatel:
                </span>{" "}
                <span className="text-gray-400">
                  {p.processoAnatel || "N/A"}
                </span>
              </p>
              <p>
                <span className="font-medium text-gray-200">FUST:</span>{" "}
                <span className={statusClass(p.fust)}>{p.fust || "N/A"}</span>
              </p>
              <p>
                <span className="font-medium text-gray-200">
                  Coleta de Dados Mensal:
                </span>{" "}
                <span className={statusClass(p.coletaDeDadosM)}>
                  {p.coletaDeDadosM || "N/A"}
                </span>
              </p>
              <p>
                <span className="font-medium text-gray-200">
                  Coleta de Dados Econômicos:
                </span>{" "}
                <span className={statusClass(p.coletaDeDadosEconomicos)}>
                  {p.coletaDeDadosEconomicos || "N/A"}
                </span>
              </p>
              <p>
                <span className="font-medium text-gray-200">
                  Dados de Infraestrutura:
                </span>{" "}
                <span className={statusClass(p.dadosInfra)}>
                  {p.dadosInfra || "N/A"}
                </span>
              </p>
              <p>
                <span className="font-medium text-gray-200">
                  Registro de Estações:
                </span>{" "}
                <span className={statusClass(p.registroEstacoes)}>
                  {p.registroEstacoes || "N/A"}
                </span>
              </p>

              {/* Observações - destaque sutil */}
              <p className="pt-2 border-t border-gray-700/50">
                <span className="font-medium text-gray-200">Observações:</span>
                <span className="text-gray-500 italic ml-1 text-xs">
                  {p.obs || "N/A"}
                </span>
              </p>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default Provedores;
