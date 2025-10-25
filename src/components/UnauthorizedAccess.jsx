import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const UnauthorizedAccess = ({ userEmail }) => {
  const { pendingAuthorization, userProfile, logout, isAuthorized, requestNewAuthorization } = useAuth();
  const [waitingTime, setWaitingTime] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  // Timer para mostrar tempo de espera
  useEffect(() => {
    if (pendingAuthorization) {
      const interval = setInterval(() => {
        setWaitingTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [pendingAuthorization]);

  // Feedback visual quando autorizado
  useEffect(() => {
    if (isAuthorized) {
      setShowFeedback(true);
    }
  }, [isAuthorized]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRequestNewAuthorization = async () => {
    if (!userProfile?.id) return;
    
    setIsRequesting(true);
    try {
      await requestNewAuthorization(userProfile.id, userEmail);
      toast.success('📝 Nova solicitação de autorização enviada!');
    } catch (error) {
      toast.error('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-900 flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 max-w-lg w-full text-center"
      >
        {/* Ícone de Acesso Negado */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4, type: "spring", stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-6 bg-red-500 rounded-full flex items-center justify-center"
        >
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </motion.div>

        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-4xl font-bold mb-4"
        >
          {showFeedback ? (
            <span className="text-green-500">🎉 Autorizado!</span>
          ) : pendingAuthorization ? (
            <span className="text-yellow-500">⏳ Aguardando Autorização</span>
          ) : (
            <span className="text-red-500">🚫 Acesso Negado</span>
          )}
        </motion.h1>

        {/* Mensagem Principal */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-gray-300 mb-6 text-lg"
        >
          {showFeedback ? (
            <>
              🎉 Parabéns! Sua conta foi autorizada!
              <br />
              Você agora tem acesso completo ao sistema.
            </>
          ) : pendingAuthorization ? (
            <>
              Sua conta está aguardando autorização do administrador.
              <br />
              Você receberá uma notificação automática assim que for aprovada.
            </>
          ) : (
            'Seu email não está autorizado a acessar este sistema.'
          )}
        </motion.p>

        {/* Email do Usuário */}
        {userEmail && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="bg-gray-700 p-4 rounded-lg mb-6"
          >
            <p className="text-sm text-gray-400 mb-1">Email utilizado:</p>
            <p className="text-cyan-400 font-mono text-sm">{userEmail}</p>
          </motion.div>
        )}

        {/* Status de Espera */}
        {pendingAuthorization && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg mb-6"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full"
              />
              <span className="text-yellow-400 font-medium">Aguardando autorização...</span>
            </div>
            <p className="text-yellow-300 text-sm text-center">
              Tempo de espera: {formatTime(waitingTime)}
            </p>
            <p className="text-gray-400 text-xs text-center mt-2">
              Você será notificado automaticamente quando o administrador autorizar sua conta.
            </p>
          </motion.div>
        )}


        {/* Status de Autorização */}
        {pendingAuthorization && userProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg mb-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full"
              />
              <h3 className="text-yellow-400 font-semibold">Status da Solicitação</h3>
            </div>
            <p className="text-yellow-300 text-sm">
              Sua conta foi criada em: {userProfile.createdAt ? 
                new Date(userProfile.createdAt.toDate ? userProfile.createdAt.toDate() : userProfile.createdAt).toLocaleString('pt-BR') 
                : 'N/A'
              }
            </p>
          </motion.div>
        )}

        {/* Instruções */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="text-gray-400 text-sm mb-6"
        >
          <p>
            {pendingAuthorization 
              ? 'Aguarde a autorização do administrador ou entre em contato para acelerar o processo.'
              : 'Para obter acesso, entre em contato com o administrador do sistema.'
            }
          </p>
        </motion.div>

        {/* Botões de Ação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
          className="flex gap-4 justify-center"
        >
          {showFeedback ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-500 transition font-medium text-lg"
            >
              🎉 Acessar Sistema
            </motion.button>
          ) : pendingAuthorization ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-500 transition font-medium"
              >
                Tentar Novamente
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-500 transition font-medium"
              >
                Sair da Conta
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRequestNewAuthorization}
                disabled={isRequesting}
                className="px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-500 transition font-medium disabled:opacity-50"
              >
                {isRequesting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  '📝 Solicitar Nova Autorização'
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-500 transition font-medium"
              >
                Sair da Conta
              </motion.button>
            </>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default UnauthorizedAccess;
