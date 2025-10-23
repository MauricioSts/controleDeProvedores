import React from 'react';
import { motion } from 'framer-motion';

const UnauthorizedAccess = ({ userEmail }) => {

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-900 flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 max-w-lg w-full text-center"
      >
        {/* Ícone de Acesso Negado */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4, type: "spring", stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-6 bg-red-500 rounded-full flex items-center justify-center"
        >
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </motion.div>

        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-4xl font-bold text-red-500 mb-4"
        >
          🚫 Acesso Negado
        </motion.h1>

        {/* Mensagem Principal */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-gray-300 mb-6 text-lg"
        >
          Seu email não está autorizado a acessar este sistema.
        </motion.p>

        {/* Email do Usuário */}
        {userEmail && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="bg-gray-700 p-4 rounded-lg mb-6"
          >
            <p className="text-sm text-gray-400 mb-1">Email utilizado:</p>
            <p className="text-cyan-400 font-mono text-sm">{userEmail}</p>
          </motion.div>
        )}


        {/* Instruções */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="text-gray-400 text-sm mb-6"
        >
          <p>Para obter acesso, entre em contato com o administrador do sistema.</p>
        </motion.div>

        {/* Botão de Logout */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-500 transition font-medium"
        >
          Tentar Novamente
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default UnauthorizedAccess;
