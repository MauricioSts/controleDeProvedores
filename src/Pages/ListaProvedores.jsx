import React from "react";
import { motion } from "framer-motion";
import Provedores from "../components/Provedores";
import { useNavigate } from "react-router-dom";

function ListaProvedores({ lista }) {
  const navigate = useNavigate();

  const handleCardClick = (id) => {
    navigate(`/provedor/${id}`);
  };

  return (
    // 🎨 Aplica o tema escuro ao container principal (mantido)
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-900 text-white p-6 sm:p-10"
    >
      {/* 🚀 REMOVIDO: max-w-4xl. O container agora usa a largura total (full-width) da tela. */}
      {/* O padding horizontal (px-0 sm:px-4) é ajustado para manter um pequeno respiro nas laterais */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mx-auto bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8"
      >
        {/* Título Moderno (mantido) */}
        <motion.h2 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-3xl sm:text-4xl font-extrabold mb-8 border-b-4 border-cyan-500 pb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"
        >
          📋 Lista de Provedores
        </motion.h2>

        {lista && lista.length > 0 ? (
          <>
            {/* 🔹 passa callback (mantido) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Provedores listaProvedores={lista} onCardClick={handleCardClick} />
            </motion.div>
          </>
        ) : (
          // Mensagem para quando não há provedores (mantido)
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center py-12"
          >
            <motion.svg
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
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
            </motion.svg>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="text-xl text-gray-400 font-medium"
            >
              Nenhum provedor cadastrado no momento.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="text-sm text-gray-600 mt-2"
            >
              Adicione um novo provedor para começar.
            </motion.p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default ListaProvedores;
