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

      {/* Raios Coloridos - Passam ao fundo a cada 5 segundos */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Raio Cyan */}
        <motion.div
          className="absolute w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
          style={{
            top: '20%',
            left: '-100%',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)'
          }}
          animate={{
            x: ['-100%', '100%'],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeInOut"
          }}
        />
        
        {/* Raio Blue */}
        <motion.div
          className="absolute w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
          style={{
            top: '40%',
            left: '-100%',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
          }}
          animate={{
            x: ['-100%', '100%'],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            delay: 1,
            ease: "easeInOut"
          }}
        />
        
        {/* Raio Purple */}
        <motion.div
          className="absolute w-full h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent"
          style={{
            top: '60%',
            left: '-100%',
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)'
          }}
          animate={{
            x: ['-100%', '100%'],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            delay: 2,
            ease: "easeInOut"
          }}
        />

        {/* Raios Diagonais */}
        <motion.div
          className="absolute w-1 h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent"
          style={{
            top: '-100%',
            left: '30%',
            transform: 'rotate(15deg)',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)'
          }}
          animate={{
            y: ['-100%', '100%'],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatDelay: 2.5,
            delay: 0.5,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute w-1 h-full bg-gradient-to-b from-transparent via-purple-400 to-transparent"
          style={{
            top: '-100%',
            left: '70%',
            transform: 'rotate(-15deg)',
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)'
          }}
          animate={{
            y: ['-100%', '100%'],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatDelay: 2.5,
            delay: 1.5,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-md w-full border border-gray-700/50 relative z-10"
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
                className="text-2xl font-bold text-white mb-2"
              >
                Gerenciador de Provedores
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

        {/* Login Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 10px 25px rgba(6, 182, 212, 0.3)"
          }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white text-gray-900 py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden group"
        >
          {/* Shimmer effect */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.6 }}
          />
          
          <motion.svg 
            className="w-6 h-6 relative z-10"
            viewBox="0 0 24 24"
            animate={{ rotate: loading ? 360 : 0 }}
            transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
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
          <motion.span className="relative z-10">
            {loading ? "Entrando..." : "Entrar com Google"}
          </motion.span>
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

      {/* Floating Particles - MUITO MAIS! */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${
            i % 4 === 0 ? 'w-2 h-2 bg-cyan-400/30' :
            i % 4 === 1 ? 'w-1.5 h-1.5 bg-blue-400/40' :
            i % 4 === 2 ? 'w-3 h-3 bg-purple-400/20' :
            'w-1 h-1 bg-cyan-300/50'
          }`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            y: [-30, 30, -30],
            x: [-20, 20, -20],
            opacity: [0.2, 0.8, 0.2],
            scale: [0.5, 1.5, 0.5],
            rotate: [0, 360, 0]
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2
          }}
        />
      ))}

      {/* Additional Background Particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`bg-${i}`}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            y: [-50, 50, -50],
            x: [-30, 30, -30],
            opacity: [0.1, 0.6, 0.1],
            scale: [0.3, 1.2, 0.3]
          }}
          transition={{
            duration: 6 + Math.random() * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 3
          }}
        />
      ))}

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