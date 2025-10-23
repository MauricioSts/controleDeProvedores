import React from 'react';
import { motion } from 'framer-motion';

const CardLoading = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-40"
    >
      <div className="relative">
        {/* Círculo principal com efeito de pulsação */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: 360
          }}
          transition={{ 
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 3, repeat: Infinity, ease: "linear" }
          }}
          className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-2xl"
          style={{
            boxShadow: '0 0 30px #06b6d4, 0 0 60px #3b82f6'
          }}
        >
          {/* Círculo interno com rotação contrária */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-3 border-white border-t-transparent rounded-full"
            />
          </motion.div>
        </motion.div>

        {/* Partículas orbitais */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              rotate: 360,
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{ 
              rotate: { duration: 4, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute w-3 h-3 bg-cyan-400 rounded-full"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              transformOrigin: `0 0`,
              marginLeft: '60px',
              marginTop: '-1.5px'
            }}
          />
        ))}

        {/* Ondas concêntricas */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`wave-${i}`}
            animate={{ 
              scale: [1, 2, 1],
              opacity: [0.8, 0, 0.8]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
              delay: i * 0.3
            }}
            className="absolute inset-0 border-2 border-cyan-400 rounded-full"
          />
        ))}

        {/* Texto de loading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center"
        >
          <motion.h3
            animate={{ 
              opacity: [0.5, 1, 0.5],
              scale: [0.95, 1.05, 0.95]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
          >
            Carregando...
          </motion.h3>
          <motion.p
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-gray-300 text-sm"
          >
            Preparando detalhes do provedor
          </motion.p>
        </motion.div>

        {/* Efeito de brilho de fundo */}
        <motion.div
          animate={{ 
            opacity: [0.2, 0.4, 0.2],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%)'
          }}
        />
      </div>
    </motion.div>
  );
};

export default CardLoading;
