import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useRememberedEmails } from '../hooks/useRememberedEmails';

const AdvancedLoginForm = () => {
  const { loginWithEmail, loading, setAuthMode } = useAuth();
  const { rememberedEmails, saveEmail, removeEmail } = useRememberedEmails();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await loginWithEmail(formData.email, formData.password);
      
      // Salvar email se o usuário marcou para lembrar
      if (rememberEmail) {
        saveEmail(formData.email);
      }
    } catch (error) {
      // Erro já tratado no contexto
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleEmailSelect = (email) => {
    setFormData(prev => ({
      ...prev,
      email: email
    }));
    setShowEmailSuggestions(false);
  };

  const handleEmailFocus = () => {
    if (rememberedEmails.length > 0) {
      setShowEmailSuggestions(true);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md mx-auto"
    >
      <motion.div
        variants={itemVariants}
        className="bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="p-8">
          <motion.div
            variants={itemVariants}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                delay: 0.3,
                type: "spring",
                stiffness: 200,
                damping: 15
              }}
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-2xl"
            >
              🔐
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta!</h2>
            <p className="text-gray-300">Entre com suas credenciais</p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Email
              </label>
              <motion.div
                className="relative"
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => {
                    setFocusedField('email');
                    handleEmailFocus();
                  }}
                  onBlur={() => {
                    setFocusedField(null);
                    setTimeout(() => setShowEmailSuggestions(false), 200);
                  }}
                  className={`w-full px-4 py-4 rounded-xl bg-gray-700/50 border text-white placeholder-gray-400 focus:outline-none transition-all duration-300 ${
                    errors.email 
                      ? 'border-red-500 focus:ring-red-500/50' 
                      : focusedField === 'email'
                      ? 'border-cyan-500 focus:ring-cyan-500/50'
                      : 'border-gray-600 focus:ring-cyan-500/50'
                  }`}
                  placeholder="exemplo@gmail.com"
                  disabled={loading}
                />
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-cyan-500/30 pointer-events-none"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: focusedField === 'email' ? 1 : 0,
                    scale: focusedField === 'email' ? 1 : 0.8
                  }}
                  transition={{ duration: 0.2 }}
                />
                <motion.div
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  animate={{ 
                    scale: focusedField === 'email' ? 1.2 : 1,
                    opacity: focusedField === 'email' ? 1 : 0.5
                  }}
                  transition={{ duration: 0.2 }}
                >
                  📧
                </motion.div>
              </motion.div>

              {/* Email Suggestions */}
              <AnimatePresence>
                {showEmailSuggestions && rememberedEmails.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-xl shadow-xl overflow-hidden"
                  >
                    {rememberedEmails.map((email, index) => (
                      <motion.button
                        key={email}
                        type="button"
                        onClick={() => handleEmailSelect(email)}
                        whileHover={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}
                        className="w-full px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-cyan-500/10 transition-colors flex items-center justify-between"
                      >
                        <span>{email}</span>
                        <motion.button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeEmail(email);
                          }}
                          whileHover={{ scale: 1.1 }}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          ✕
                        </motion.button>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-400 text-sm mt-2"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Senha
              </label>
              <motion.div
                className="relative"
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-4 pr-12 rounded-xl bg-gray-700/50 border text-white placeholder-gray-400 focus:outline-none transition-all duration-300 ${
                    errors.password 
                      ? 'border-red-500 focus:ring-red-500/50' 
                      : focusedField === 'password'
                      ? 'border-cyan-500 focus:ring-cyan-500/50'
                      : 'border-gray-600 focus:ring-cyan-500/50'
                  }`}
                  placeholder="Digite sua senha"
                  disabled={loading}
                />
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-cyan-500/30 pointer-events-none"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: focusedField === 'password' ? 1 : 0,
                    scale: focusedField === 'password' ? 1 : 0.8
                  }}
                  transition={{ duration: 0.2 }}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? '🙈' : '👁️'}
                </motion.button>
              </motion.div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-400 text-sm mt-2"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Remember Email Checkbox */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-3"
            >
              <motion.button
                type="button"
                onClick={() => setRememberEmail(!rememberEmail)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  rememberEmail 
                    ? 'bg-cyan-500 border-cyan-500' 
                    : 'border-gray-500 hover:border-cyan-400'
                }`}
              >
                {rememberEmail && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-white text-xs"
                  >
                    ✓
                  </motion.span>
                )}
              </motion.button>
              <label 
                onClick={() => setRememberEmail(!rememberEmail)}
                className="text-gray-300 text-sm cursor-pointer select-none"
              >
                Lembrar meu email para login rápido
              </label>
            </motion.div>

            {/* Login Button */}
            <motion.button
              type="submit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ 
                scale: 1.05, 
                y: -2,
                boxShadow: "0 10px 25px rgba(6, 182, 212, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            >
              {/* Shimmer Effect */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%", skewX: "-20deg" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
              
              {/* Pulse Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-xl"
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

              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <span>Entrar</span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Link para Cadastro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-6"
          >
            <p className="text-gray-400 text-sm">
              Não tem uma conta?{' '}
              <motion.button
                type="button"
                onClick={() => setAuthMode('register')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                Criar Conta
              </motion.button>
            </p>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AdvancedLoginForm;
