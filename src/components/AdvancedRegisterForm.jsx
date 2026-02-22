import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const steps = [
    { id: 1, title: 'Informações Pessoais', icon: '👤' },
    { id: 2, title: 'Credenciais', icon: '🔐' },
    { id: 3, title: 'Confirmação', icon: '✅' }
  ];

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

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className="flex flex-col items-center"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-300 ${currentStep >= step.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-400'
                  } ${currentStep === step.id ? 'scale-110 shadow-[0_0_20px_rgba(6,182,212,0.5)]' : ''}`}
              >
                {step.icon}
              </div>
              <span className={`text-sm mt-2 font-medium ${currentStep >= step.id ? 'text-cyan-400' : 'text-gray-500'
                }`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-white mb-2">Vamos começar! 👋</h2>
                  <p className="text-gray-300">Conte-nos um pouco sobre você</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('displayName')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-4 rounded-xl bg-gray-700/50 border text-white placeholder-gray-400 focus:outline-none transition-all duration-200 ${errors.displayName
                          ? 'border-red-500 ring-1 ring-red-500/50'
                          : focusedField === 'displayName'
                            ? 'border-cyan-500 ring-1 ring-cyan-500/50'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      placeholder="Digite seu nome completo"
                      disabled={loading}
                    />
                  </div>
                  <AnimatePresence>
                    {errors.displayName && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="text-red-400 text-sm mt-2"
                      >
                        {errors.displayName}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200"
                >
                  <span>Continuar →</span>
                </button>
              </motion.div>
            )}

            {/* Step 2: Credentials */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-white mb-2">Crie suas credenciais 🔐</h2>
                  <p className="text-gray-300">Email e senha para acessar sua conta</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full px-4 py-4 rounded-xl bg-gray-700/50 border text-white placeholder-gray-400 focus:outline-none transition-all duration-200 ${errors.email
                            ? 'border-red-500 ring-1 ring-red-500/50'
                            : focusedField === 'email'
                              ? 'border-cyan-500 ring-1 ring-cyan-500/50'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        placeholder="exemplo@gmail.com"
                        disabled={loading}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
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
                    <div className="relative">
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full px-4 py-4 rounded-xl bg-gray-700/50 border text-white placeholder-gray-400 focus:outline-none transition-all duration-200 ${errors.password
                            ? 'border-red-500 ring-1 ring-red-500/50'
                            : focusedField === 'password'
                              ? 'border-cyan-500 ring-1 ring-cyan-500/50'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        placeholder="Mínimo 6 caracteres"
                        disabled={loading}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="text-red-400 text-sm mt-2"
                        >
                          {errors.password}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 bg-gray-700 text-gray-300 py-4 px-6 rounded-xl font-semibold hover:bg-gray-600 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
                  >
                    ← Voltar
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200"
                  >
                    <span>Continuar →</span>
                  </button>
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
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-white mb-2">Quase lá! 🎉</h2>
                  <p className="text-gray-300">Confirme sua senha para finalizar</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-4 rounded-xl bg-gray-700/50 border text-white placeholder-gray-400 focus:outline-none transition-all duration-200 ${errors.confirmPassword
                          ? 'border-red-500 ring-1 ring-red-500/50'
                          : focusedField === 'confirmPassword'
                            ? 'border-cyan-500 ring-1 ring-cyan-500/50'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      placeholder="Digite a senha novamente"
                      disabled={loading}
                    />
                  </div>
                  <AnimatePresence>
                    {errors.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="text-red-400 text-sm mt-2"
                      >
                        {errors.confirmPassword}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 bg-gray-700 text-gray-300 py-4 px-6 rounded-xl font-semibold hover:bg-gray-600 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
                  >
                    ← Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <span>Criar Conta ✨</span>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      {/* Back to Login */}
      <div className="text-center mt-6">
        <p className="text-gray-400 text-sm">
          Já tem uma conta?{' '}
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            Fazer Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default AdvancedRegisterForm;
