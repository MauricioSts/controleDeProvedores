import React, { useState } from 'react';
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

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-2xl">
              🔐
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta!</h2>
            <p className="text-gray-300">Entre com suas credenciais</p>
          </div>

          <div className="space-y-6">
            {/* Email Field */}
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
                  onFocus={() => {
                    setFocusedField('email');
                    handleEmailFocus();
                  }}
                  onBlur={() => {
                    setFocusedField(null);
                    setTimeout(() => setShowEmailSuggestions(false), 200);
                  }}
                  className={`w-full px-4 py-4 rounded-xl bg-gray-700/50 border text-white placeholder-gray-400 focus:outline-none transition-all duration-200 ${errors.email
                      ? 'border-red-500 ring-1 ring-red-500/50'
                      : focusedField === 'email'
                        ? 'border-cyan-500 ring-1 ring-cyan-500/50'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  placeholder="exemplo@gmail.com"
                  disabled={loading}
                />
                <span
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-opacity duration-200 ${focusedField === 'email' ? 'opacity-100' : 'opacity-50'
                    }`}
                >
                  📧
                </span>
              </div>

              {/* Email Suggestions */}
              <AnimatePresence>
                {showEmailSuggestions && rememberedEmails.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-xl shadow-xl overflow-hidden"
                  >
                    {rememberedEmails.map((email) => (
                      <button
                        key={email}
                        type="button"
                        onClick={() => handleEmailSelect(email)}
                        className="w-full px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-cyan-500/10 transition-colors flex items-center justify-between"
                      >
                        <span>{email}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeEmail(email);
                          }}
                          className="text-gray-500 hover:text-red-400 hover:scale-110 transition-all"
                        >
                          ✕
                        </button>
                      </button>
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
                    transition={{ duration: 0.15 }}
                    className="text-red-400 text-sm mt-2"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-4 pr-12 rounded-xl bg-gray-700/50 border text-white placeholder-gray-400 focus:outline-none transition-all duration-200 ${errors.password
                      ? 'border-red-500 ring-1 ring-red-500/50'
                      : focusedField === 'password'
                        ? 'border-cyan-500 ring-1 ring-cyan-500/50'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  placeholder="Digite sua senha"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white hover:scale-110 active:scale-90 transition-all"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
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

            {/* Remember Email Checkbox */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRememberEmail(!rememberEmail)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${rememberEmail
                    ? 'bg-cyan-500 border-cyan-500'
                    : 'border-gray-500 hover:border-cyan-400'
                  }`}
              >
                {rememberEmail && (
                  <span className="text-white text-xs">✓</span>
                )}
              </button>
              <label
                onClick={() => setRememberEmail(!rememberEmail)}
                className="text-gray-300 text-sm cursor-pointer select-none"
              >
                Lembrar meu email para login rápido
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Entrando...</span>
                </>
              ) : (
                <span>Entrar →</span>
              )}
            </button>
          </div>

          {/* Link para Cadastro */}
          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              Não tem uma conta?{' '}
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                Criar Conta
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvancedLoginForm;
