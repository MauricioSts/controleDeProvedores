import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const RegisterForm = () => {
  const { registerWithEmail, loading, setAuthMode } = useAuth();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Nome é obrigatório';
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = 'Nome deve ter pelo menos 2 caracteres';
    }

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

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
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
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nome */}
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">
            Nome Completo
          </label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl bg-gray-700/50 border text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
              errors.displayName 
                ? 'border-red-500 focus:ring-red-500/50' 
                : 'border-gray-600 focus:ring-cyan-500/50'
            }`}
            placeholder="Digite seu nome completo"
            disabled={loading}
          />
          {errors.displayName && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm mt-1"
            >
              {errors.displayName}
            </motion.p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl bg-gray-700/50 border text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
              errors.email 
                ? 'border-red-500 focus:ring-red-500/50' 
                : 'border-gray-600 focus:ring-cyan-500/50'
            }`}
            placeholder="exemplo@gmail.com"
            disabled={loading}
          />
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm mt-1"
            >
              {errors.email}
            </motion.p>
          )}
        </div>

        {/* Senha */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Senha
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl bg-gray-700/50 border text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
              errors.password 
                ? 'border-red-500 focus:ring-red-500/50' 
                : 'border-gray-600 focus:ring-cyan-500/50'
            }`}
            placeholder="Mínimo 6 caracteres"
            disabled={loading}
          />
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm mt-1"
            >
              {errors.password}
            </motion.p>
          )}
        </div>

        {/* Confirmar Senha */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
            Confirmar Senha
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl bg-gray-700/50 border text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
              errors.confirmPassword 
                ? 'border-red-500 focus:ring-red-500/50' 
                : 'border-gray-600 focus:ring-cyan-500/50'
            }`}
            placeholder="Digite a senha novamente"
            disabled={loading}
          />
          {errors.confirmPassword && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm mt-1"
            >
              {errors.confirmPassword}
            </motion.p>
          )}
        </div>

        {/* Botão de Cadastro */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              Criando Conta...
            </>
          ) : (
            'Criar Conta'
          )}
        </motion.button>

        {/* Link para Login */}
        <div className="text-center">
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
      </form>
    </motion.div>
  );
};

export default RegisterForm;
