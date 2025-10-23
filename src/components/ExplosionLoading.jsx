import React from 'react';
import { motion } from 'framer-motion';

const ExplosionLoading = ({ isVisible, onComplete }) => {
  if (!isVisible) return null;

  // Configurações ultra-otimizadas para zero lag
  const particleLayers = [
    { count: 15, radius: 120, size: 6, color: 'bg-cyan-400', delay: 0 },
    { count: 20, radius: 180, size: 4, color: 'bg-blue-400', delay: 0.05 },
    { count: 25, radius: 240, size: 3, color: 'bg-purple-400', delay: 0.1 },
    { count: 30, radius: 300, size: 2, color: 'bg-pink-400', delay: 0.15 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div className="relative">
        {/* Círculo principal ultra-otimizado */}
        <motion.div
          initial={{ scale: 1, opacity: 1 }}
          animate={{ 
            scale: [1, 0.02, 0.02, 1.8, 1],
            opacity: [1, 0.1, 0.1, 1, 1],
            rotate: [0, 180, 360, 720, 1080]
          }}
          transition={{ 
            duration: 7,
            times: [0, 0.2, 0.4, 0.7, 1],
            ease: "easeOut"
          }}
          onAnimationComplete={onComplete}
          className="w-40 h-40 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 flex items-center justify-center"
          style={{
            boxShadow: '0 0 30px #06b6d4'
          }}
        >
          {/* Núcleo otimizado */}
          <motion.div
            initial={{ scale: 1 }}
            animate={{ 
              scale: [1, 0.3, 0.3, 2, 1],
              rotate: [0, -360, -720, -1080, -1440]
            }}
            transition={{ 
              duration: 7,
              times: [0, 0.2, 0.4, 0.7, 1],
              ease: "easeOut"
            }}
            className="w-24 h-24 rounded-full bg-white/30 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-3 border-white border-t-transparent rounded-full"
            />
          </motion.div>
        </motion.div>

        {/* Big Bang otimizado - menos partículas */}
        {particleLayers.map((layer, layerIndex) => (
          <div key={layerIndex}>
            {[...Array(layer.count)].map((_, i) => {
              const angle = (i * 360) / layer.count;
              const radians = (angle * Math.PI) / 180;
              
              return (
                <motion.div
                  key={`${layerIndex}-${i}`}
                  initial={{ 
                    scale: 0,
                    x: 0,
                    y: 0,
                    opacity: 0
                  }}
                  animate={{ 
                    scale: [0, 1.2, 0],
                    x: [0, Math.cos(radians) * layer.radius],
                    y: [0, Math.sin(radians) * layer.radius],
                    opacity: [0, 1, 0]
                  }}
                  transition={{ 
                    duration: 7,
                    times: [0, 0.6, 1],
                    delay: layer.delay + (i * 0.005),
                    ease: "easeOut"
                  }}
                  className={`absolute ${layer.color} rounded-full`}
                  style={{
                    width: `${layer.size * 3}px`,
                    height: `${layer.size * 3}px`,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              );
            })}
          </div>
        ))}

        {/* Ondas de choque reduzidas */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`shockwave-${i}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 2.5 + (i * 0.5), 3 + (i * 0.8)],
              opacity: [0, 0.8 - (i * 0.15), 0]
            }}
            transition={{ 
              duration: 7,
              times: [0, 0.5 + (i * 0.1), 1],
              ease: "easeOut",
              delay: i * 0.1
            }}
            className={`absolute inset-0 border-2 rounded-full ${
              i % 2 === 0 ? 'border-cyan-400' : 'border-blue-400'
            }`}
          />
        ))}

        {/* Faíscas reduzidas */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`spark-${i}`}
            initial={{ 
              scale: 0,
              x: 0,
              y: 0,
              opacity: 0
            }}
            animate={{ 
              scale: [0, 1, 0],
              x: [0, (Math.random() - 0.5) * 300],
              y: [0, (Math.random() - 0.5) * 300],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 7,
              times: [0, 0.5, 1],
              delay: Math.random() * 0.2,
              ease: "easeOut"
            }}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}

        {/* Texto otimizado */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-center"
        >
          <motion.h3
            animate={{ 
              opacity: [0.5, 1, 0.5],
              scale: [0.95, 1.05, 0.95]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
          >
            BIG BANG PDFs!
          </motion.h3>
          <motion.p
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-gray-300 text-sm"
          >
            Explosão de documentos em andamento...
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ExplosionLoading;
