import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const AdvancedRegisterForm = () => {
  const { registerWithEmail, loading, setAuthMode } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const controls = useAnimation();

  const steps = [
    { id: 1, title: 'Informações Pessoais', icon: '👤' },
    { id: 2, title: 'Credenciais', icon: '🔐' },
    { id: 3, title: 'Confirmação', icon: '✅' }
  ];

  useEffect(() => {
    controls.start({
      scale: [1, 1.05, 1],
      transition: { duration: 0.6, ease: "easeInOut" }
    });
  }, [currentStep, controls]);

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.displayName.trim()) {
        newErrors.displayName = 'Nome é obrigatório';
      } else if (formData.displayName.trim().length < 2) {
        newErrors.displayName = 'Nome deve ter pelo menos 2 caracteres';
      }
    }

    if (step === 2) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email é obrigatório';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email inválido';
      }

      if (!formData.password) {
        newErrors.password = 'Senha é obrigatória';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
      }
    }

    if (step === 3) {
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Senhas não coincidem';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) {
      return;
    }

    try {
      await registerWithEmail(formData.email, formData.password, formData.displayName);
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
      className="w-full max-w-2xl mx-auto"
    >
      {/* Progress Steps */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className="flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: currentStep >= step.id ? 1.1 : 1,
                transition: { delay: index * 0.1 }
              }}
            >
              <motion.div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-300 ${
                  currentStep >= step.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-400'
                }`}
                animate={{
                  scale: currentStep === step.id ? [1, 1.2, 1] : 1,
                  boxShadow: currentStep === step.id 
                    ? "0 0 20px rgba(6, 182, 212, 0.5)" 
                    : "0 0 0px rgba(6, 182, 212, 0)"
                }}
                transition={{ duration: 0.3 }}
              >
                {step.icon}
              </motion.div>
              <span className={`text-sm mt-2 font-medium ${
                currentStep >= step.id ? 'text-cyan-400' : 'text-gray-500'
              }`}>
                {step.title}
              </span>
            </motion.div>
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${(currentStep / 3) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

      {/* Form Container */}
      <motion.div
        animate={controls}
        className="bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-6"
                >
                  <h2 className="text-3xl font-bold text-white mb-2">Vamos começar! 👋</h2>
                  <p className="text-gray-300">Conte-nos um pouco sobre você</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Nome Completo
                  </label>
                  <motion.div
                    className="relative"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('displayName')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-4 rounded-xl bg-gray-700/50 border text-white placeholder-gray-400 focus:outline-none transition-all duration-300 ${
                        errors.displayName 
                          ? 'border-red-500 focus:ring-red-500/50' 
                          : focusedField === 'displayName'
                          ? 'border-cyan-500 focus:ring-cyan-500/50'
                          : 'border-gray-600 focus:ring-cyan-500/50'
                      }`}
                      placeholder="Digite seu nome completo"
                      disabled={loading}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-xl border-2 border-cyan-500/30 pointer-events-none"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ 
                        opacity: focusedField === 'displayName' ? 1 : 0,
                        scale: focusedField === 'displayName' ? 1 : 0.8
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.div>
                  <AnimatePresence>
                    {errors.displayName && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-red-400 text-sm mt-2"
                      >
                        {errors.displayName}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.button
                  type="button"
                  onClick={nextStep}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all"
                >
                  <span>Continuar</span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </motion.button>
              </motion.div>
            )}

            {/* Step 2: Credentials */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-6"
                >
                  <h2 className="text-3xl font-bold text-white mb-2">Crie suas credenciais 🔐</h2>
                  <p className="text-gray-300">Email e senha para acessar sua conta</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <div>
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
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
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
                    </motion.div>
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Senha
                    </label>
                    <motion.div
                      className="relative"
                      whileFocus={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full px-4 py-4 rounded-xl bg-gray-700/50 border text-white placeholder-gray-400 focus:outline-none transition-all duration-300 ${
                          errors.password 
                            ? 'border-red-500 focus:ring-red-500/50' 
                            : focusedField === 'password'
                            ? 'border-cyan-500 focus:ring-cyan-500/50'
                            : 'border-gray-600 focus:ring-cyan-500/50'
                        }`}
                        placeholder="Mínimo 6 caracteres"
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
                  </div>
                </motion.div>

                <div className="flex gap-4">
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-gray-700 text-gray-300 py-4 px-6 rounded-xl font-semibold hover:bg-gray-600 transition-all"
                  >
                    ← Voltar
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all"
                  >
                    <span>Continuar</span>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-6"
                >
                  <h2 className="text-3xl font-bold text-white mb-2">Quase lá! 🎉</h2>
                  <p className="text-gray-300">Confirme sua senha para finalizar</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Confirmar Senha
                  </label>
                  <motion.div
                    className="relative"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-4 rounded-xl bg-gray-700/50 border text-white placeholder-gray-400 focus:outline-none transition-all duration-300 ${
                        errors.confirmPassword 
                          ? 'border-red-500 focus:ring-red-500/50' 
                          : focusedField === 'confirmPassword'
                          ? 'border-cyan-500 focus:ring-cyan-500/50'
                          : 'border-gray-600 focus:ring-cyan-500/50'
                      }`}
                      placeholder="Digite a senha novamente"
                      disabled={loading}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-xl border-2 border-cyan-500/30 pointer-events-none"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ 
                        opacity: focusedField === 'confirmPassword' ? 1 : 0,
                        scale: focusedField === 'confirmPassword' ? 1 : 0.8
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.div>
                  <AnimatePresence>
                    {errors.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-red-400 text-sm mt-2"
                      >
                        {errors.confirmPassword}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <div className="flex gap-4">
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-gray-700 text-gray-300 py-4 px-6 rounded-xl font-semibold hover:bg-gray-600 transition-all"
                  >
                    ← Voltar
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Criando...
                      </>
                    ) : (
                      <>
                        <span>Criar Conta</span>
                        <motion.span
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity }}
                        >
                          ✨
                        </motion.span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>

      {/* Back to Login */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center mt-6"
      >
        <p className="text-gray-400 text-sm">
          Já tem uma conta?{' '}
          <motion.button
            type="button"
            onClick={() => setAuthMode('login')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            Fazer Login
          </motion.button>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default AdvancedRegisterForm;
