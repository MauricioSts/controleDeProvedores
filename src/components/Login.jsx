import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { loginWithGoogle, loading } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      // Erro já tratado no contexto
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-20 left-20 w-32 h-32 bg-cyan-500/10 rounded-full blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, 50, 0],
          y: [0, -30, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.7, 0.4],
          x: [0, -40, 0],
          y: [0, 40, 0]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-60 h-60 bg-purple-500/5 rounded-full blur-2xl"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.4, 0.2],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
      />


      {/* Main Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-lg w-full border border-gray-700/50 relative z-10 mx-auto"
        >
        {/* Logo and Brand Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.div
            className="flex flex-col items-center justify-center gap-4 mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center"
            >
              <motion.div className="flex items-center justify-center gap-4 mb-2">
                <motion.img 
                  src="/bbicon.png" 
                  alt="BridgeAndBits Icon" 
                  className="h-12 w-12"
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.h1 
                  className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  BridgeAndBits
                </motion.h1>
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-lg font-medium text-gray-300 mb-2"
              >
                Conectando eficiência e resultados
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="text-gray-400 text-lg"
              >
                Controle e gestão de provedores de internet
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Login Button - Super Motion */}
        <motion.button
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.8, 
            delay: 1.2,
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
          whileHover={{ 
            scale: 1.02,
            y: -1,
            boxShadow: "0 10px 25px rgba(6, 182, 212, 0.3), 0 0 0 1px rgba(6, 182, 212, 0.1)",
            transition: { duration: 0.3, ease: "easeOut" }
          }}
          whileTap={{ 
            scale: 0.95,
            y: 0,
            transition: { duration: 0.1 }
          }}
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white text-gray-900 py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl relative overflow-hidden group border border-gray-200/30"
        >
          {/* Background Gradient Animation */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Shimmer Effect */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: "-100%", skewX: "-20deg" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
          
          {/* Pulse Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-2xl"
            animate={{
              scale: [1, 1.02, 1],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Google Icon with Advanced Animation */}
          <motion.div
            className="relative z-10"
            animate={{ 
              rotate: loading ? 360 : 0,
              scale: loading ? [1, 1.1, 1] : 1
            }}
            transition={{ 
              rotate: { duration: 1, repeat: loading ? Infinity : 0, ease: "linear" },
              scale: { duration: 0.5, repeat: loading ? Infinity : 0 }
            }}
          >
            <motion.svg 
              className="w-5 h-5"
              viewBox="0 0 24 24"
              whileHover={{ 
                scale: 1.1,
                rotate: [0, -5, 5, 0],
                transition: { duration: 0.3 }
              }}
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </motion.svg>
          </motion.div>
          
          {/* Text with Typewriter Effect */}
          <motion.span 
            className="relative z-10 text-base font-medium"
            animate={{
              backgroundPosition: loading ? ["0% 50%", "100% 50%", "0% 50%"] : "0% 50%"
            }}
            transition={{
              backgroundPosition: {
                duration: 1.5,
                repeat: loading ? Infinity : 0,
                ease: "easeInOut"
              }
            }}
          >
            {loading ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  Entrando
                </motion.span>
                <motion.div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 h-1 bg-current rounded-full"
                      animate={{
                        scale: [0.5, 1, 0.5],
                        opacity: [0.3, 1, 0.3]
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </motion.div>
              </motion.span>
            ) : (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
              >
                Entrar com Google
              </motion.span>
            )}
          </motion.span>
          
          {/* Loading Spinner */}
          {loading && (
            <motion.div
              className="absolute right-3 w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          )}
        </motion.button>

        {/* Decorative Elements */}
        <motion.div
          className="absolute -top-4 -right-4 w-8 h-8 bg-cyan-500/20 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-500/20 rounded-full"
          animate={{
            scale: [1.5, 1, 1.5],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 -right-2 w-4 h-4 bg-purple-500/20 rounded-full"
          animate={{
            y: [-10, 10, -10],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Partículas Coloridas Explodindo */}
      {[...Array(25)].map((_, i) => {
        const centerX = 50; // Centro da tela
        const centerY = 50;
        const angle = (i / 25) * 360; // Distribui as partículas em círculo
        const distance = 20 + Math.random() * 30; // Distância variável do centro
        
        return (
          <motion.div
            key={i}
            className={`absolute rounded-full ${
              i % 5 === 0 ? 'w-2 h-2 bg-cyan-400/60' :
              i % 5 === 1 ? 'w-1.5 h-1.5 bg-blue-400/70' :
              i % 5 === 2 ? 'w-3 h-3 bg-purple-400/50' :
              i % 5 === 3 ? 'w-1 h-1 bg-pink-400/80' :
              'w-2.5 h-2.5 bg-cyan-300/60'
            }`}
            style={{
              left: `${centerX}%`,
              top: `${centerY}%`,
              transformOrigin: 'center'
            }}
            initial={{
              x: 0,
              y: 0,
              scale: 0,
              opacity: 0
            }}
            animate={{
              x: [0, Math.cos(angle * Math.PI / 180) * distance, Math.cos(angle * Math.PI / 180) * (distance + 20)],
              y: [0, Math.sin(angle * Math.PI / 180) * distance, Math.sin(angle * Math.PI / 180) * (distance + 20)],
              scale: [0, 1, 0.3],
              opacity: [0, 1, 0],
              rotate: [0, 360, 720]
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeOut",
              delay: Math.random() * 3
            }}
          />
        );
      })}

      {/* Partículas Suaves Flutuantes */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`float-${i}`}
          className={`absolute rounded-full ${
            i % 4 === 0 ? 'w-1 h-1 bg-cyan-300/30' :
            i % 4 === 1 ? 'w-1.5 h-1.5 bg-blue-300/40' :
            i % 4 === 2 ? 'w-2 h-2 bg-purple-300/25' :
            'w-0.5 h-0.5 bg-pink-300/50'
          }`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            y: [-30, 30, -30],
            x: [-20, 20, -20],
            opacity: [0.2, 0.8, 0.2],
            scale: [0.5, 1.2, 0.5]
          }}
          transition={{
            duration: 5 + Math.random() * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 4
          }}
        />
      ))}

      {/* Explosões Suaves */}
      {[...Array(8)].map((_, i) => {
        const explosionCenterX = 20 + Math.random() * 60;
        const explosionCenterY = 20 + Math.random() * 60;
        
        return (
          <motion.div
            key={`explosion-${i}`}
            className="absolute"
            style={{
              left: `${explosionCenterX}%`,
              top: `${explosionCenterY}%`
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeOut"
            }}
          >
            {[...Array(6)].map((_, j) => {
              const angle = (j / 6) * 360;
              const distance = 15 + Math.random() * 10;
              
              return (
                <motion.div
                  key={j}
                  className="absolute w-1 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"
                  style={{
                    transformOrigin: 'center'
                  }}
                  animate={{
                    x: [0, Math.cos(angle * Math.PI / 180) * distance, Math.cos(angle * Math.PI / 180) * (distance + 15)],
                    y: [0, Math.sin(angle * Math.PI / 180) * distance, Math.sin(angle * Math.PI / 180) * (distance + 15)],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 0.1 * j,
                    ease: "easeOut"
                  }}
                />
              );
            })}
          </motion.div>
        );
      })}

      {/* Large Floating Orbs */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className={`absolute rounded-full blur-sm ${
            i % 3 === 0 ? 'w-16 h-16 bg-cyan-500/10' :
            i % 3 === 1 ? 'w-20 h-20 bg-blue-500/8' :
            'w-12 h-12 bg-purple-500/12'
          }`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            y: [-40, 40, -40],
            x: [-25, 25, -25],
            opacity: [0.1, 0.4, 0.1],
            scale: [0.8, 1.3, 0.8]
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 4
          }}
        />
      ))}
    </div>
  );
};

export default Login;