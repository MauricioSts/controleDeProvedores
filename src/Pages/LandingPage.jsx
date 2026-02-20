import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import AdvancedLoginForm from '../components/AdvancedLoginForm';
import AdvancedRegisterForm from '../components/AdvancedRegisterForm';

/* ─── Features exibidas no painel esquerdo ─── */
const FEATURES = [
    {
        icon: '📋',
        title: 'Gestão Completa',
        desc: 'Cadastre, edite e acompanhe todos os seus provedores em um único lugar.',
    },
    {
        icon: '📄',
        title: 'Relatórios em PDF',
        desc: 'Gere relatórios mensais detalhados e envie por e-mail com um clique.',
    },
    {
        icon: '📎',
        title: 'Documentos por Mês',
        desc: 'Anexe PDFs organizados por mês. Limpeza automática de arquivos antigos.',
    },
    {
        icon: '📡',
        title: 'Dados Anatel',
        desc: 'Registre informações regulatórias e acompanhe a situação de cada provedor.',
    },
    {
        icon: '🔐',
        title: 'Acesso Controlado',
        desc: 'Sistema de permissões por usuário com painel administrativo dedicado.',
    },
    {
        icon: '📧',
        title: 'Envio Automático',
        desc: 'Configure envio automático de relatórios mensais via Gmail para cada provedor.',
    },
];

/* ─── Stat Pills ─── */
const STATS = [
    { label: 'Provedores', value: '∞' },
    { label: 'Relatórios', value: 'PDF' },
    { label: 'Plataforma', value: '100% Web' },
];

export default function LandingPage() {
    const {
        loginWithGoogle,
        loading,
        pendingAuthorization,
        userEmail,
        logout,
        authMode,
        setAuthMode,
    } = useAuth();

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
        } catch (_) { }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex overflow-hidden relative">
            {/* Ambient orbs — estáticos, sem loop de animação */}
            {[
                { top: '10%', left: '5%', color: 'bg-cyan-500/10', size: 'w-72 h-72' },
                { top: '60%', left: '30%', color: 'bg-blue-500/8', size: 'w-96 h-96' },
                { top: '20%', left: '55%', color: 'bg-purple-500/8', size: 'w-80 h-80' },
                { top: '70%', left: '70%', color: 'bg-cyan-400/6', size: 'w-64 h-64' },
            ].map((orb, i) => (
                <div
                    key={i}
                    className={`absolute ${orb.size} ${orb.color} rounded-full blur-3xl pointer-events-none`}
                    style={{ top: orb.top, left: orb.left }}
                />
            ))}

            {/* ══════════════════════════════════════
          PAINEL ESQUERDO — Hero + Features
      ══════════════════════════════════════ */}
            <div className="hidden lg:flex flex-col justify-center flex-1 px-12 xl:px-20 py-12 relative z-10">

                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex items-center gap-4 mb-12"
                >
                    <motion.img
                        src="/bbicon.png"
                        alt="BridgeAndBits"
                        className="h-14 w-14"
                        animate={{ rotate: [0, 4, -4, 0], scale: [1, 1.05, 1] }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <div>
                        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 leading-none">
                            BridgeAndBits
                        </h1>
                        <p className="text-gray-400 text-sm mt-0.5">Gerenciador de Provedores</p>
                    </div>
                </motion.div>

                {/* Headline */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.15 }}
                    className="mb-8"
                >
                    <h2 className="text-5xl xl:text-6xl font-extrabold text-white leading-tight mb-4">
                        Controle total dos seus{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                            provedores
                        </span>{' '}
                        de internet.
                    </h2>
                    <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
                        Plataforma completa para gerenciar provedores de internet — relatórios, documentos,
                        dados Anatel e envio automático de e-mails, tudo em um só sistema.
                    </p>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="flex gap-4 mb-10"
                >
                    {STATS.map((s, i) => (
                        <div
                            key={i}
                            className="flex-1 bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-3 backdrop-blur-sm text-center"
                        >
                            <p className="text-cyan-400 font-extrabold text-xl">{s.value}</p>
                            <p className="text-gray-400 text-xs mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Feature Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {FEATURES.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 + i * 0.07 }}
                            whileHover={{ y: -3, scale: 1.02 }}
                            className="flex items-start gap-3 bg-gray-800/50 border border-gray-700/40 rounded-xl p-4 backdrop-blur-sm"
                        >
                            <span className="text-2xl mt-0.5 flex-shrink-0">{f.icon}</span>
                            <div>
                                <h3 className="text-white font-semibold text-sm mb-0.5">{f.title}</h3>
                                <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom tag */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="text-gray-600 text-xs mt-8"
                >
                    © 2026 BridgeAndBits · Conectando eficiência e resultados
                </motion.p>
            </div>

            {/* ══════════════════════════════════════
          PAINEL DIREITO — Login Card
      ══════════════════════════════════════ */}
            <div className="flex-1 lg:max-w-md xl:max-w-lg flex items-center justify-center p-6 relative z-10 lg:border-l lg:border-gray-800/60">

                <motion.div
                    initial={{ opacity: 0, x: 40, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="w-full max-w-sm"
                >
                    {/* Mobile: logo compacta */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex lg:hidden items-center justify-center gap-3 mb-8"
                    >
                        <img src="/bbicon.png" alt="BridgeAndBits" className="h-10 w-10" />
                        <div>
                            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                                BridgeAndBits
                            </h1>
                            <p className="text-gray-400 text-xs">Gerenciador de Provedores</p>
                        </div>
                    </motion.div>

                    <div className="bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 p-8">

                        {/* Título do card */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mb-6 text-center"
                        >
                            <h2 className="text-2xl font-bold text-white">Acesse sua conta</h2>
                            <p className="text-gray-400 text-sm mt-1">
                                Entre para gerenciar seus provedores
                            </p>
                        </motion.div>

                        {/* Aguardando autorização */}
                        {pendingAuthorization && userEmail && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                        className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full"
                                    />
                                    <h3 className="text-yellow-400 font-semibold text-sm">Aguardando Autorização</h3>
                                </div>
                                <p className="text-yellow-300 text-xs">
                                    Sua conta <strong>{userEmail}</strong> está aguardando aprovação do administrador.
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={logout}
                                    className="mt-3 px-3 py-1.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg text-xs"
                                >
                                    Sair da Conta
                                </motion.button>
                            </motion.div>
                        )}

                        {/* Tabs */}
                        {!pendingAuthorization && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex bg-gray-700/40 rounded-xl p-1 mb-6"
                            >
                                {[
                                    { key: 'login', label: 'Login' },
                                    { key: 'register', label: 'Cadastro' },
                                    { key: 'google', label: 'Google' },
                                ].map((tab) => (
                                    <motion.button
                                        key={tab.key}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setAuthMode(tab.key)}
                                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${authMode === tab.key
                                            ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                                            : 'text-gray-300 hover:text-white'
                                            }`}
                                    >
                                        {tab.label}
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}

                        {/* Formulários */}
                        <AnimatePresence mode="wait">
                            {authMode === 'login' && (
                                <motion.div
                                    key="login"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <AdvancedLoginForm />
                                </motion.div>
                            )}

                            {authMode === 'register' && (
                                <motion.div
                                    key="register"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <AdvancedRegisterForm />
                                </motion.div>
                            )}

                            {authMode === 'google' && (
                                <motion.div
                                    key="google"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <motion.button
                                        whileHover={{
                                            scale: 1.02,
                                            boxShadow: '0 8px 28px rgba(6,182,212,0.25)',
                                        }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={handleGoogleLogin}
                                        disabled={loading}
                                        className="w-full bg-white text-gray-900 py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg relative overflow-hidden group border border-gray-200/30"
                                    >
                                        {/* Shimmer */}
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                            initial={{ x: '-100%' }}
                                            whileHover={{ x: '100%' }}
                                            transition={{ duration: 0.7 }}
                                        />
                                        {/* Google Icon */}
                                        <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        <span className="relative z-10">
                                            {loading ? 'Entrando...' : 'Entrar com Google'}
                                        </span>
                                    </motion.button>

                                    <p className="text-center text-gray-500 text-xs mt-4">
                                        Acesso restrito a usuários autorizados.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Rodapé do card */}
                    <p className="text-center text-gray-600 text-xs mt-4">
                        Plataforma segura · Dados protegidos pelo Firebase
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
