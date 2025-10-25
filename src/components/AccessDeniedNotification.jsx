import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const AccessDeniedNotification = () => {
  const { isAuthorized, pendingAuthorization, userEmail, userProfile, requestNewAuthorization } = useAuth();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Mostrar notificação se usuário não estiver autorizado e não estiver pendente
    if (userEmail && !isAuthorized && !pendingAuthorization) {
      setNotificationType('denied');
      setShowNotification(true);
      
      // Auto-hide após 5 segundos
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    } else if (userEmail && !isAuthorized && pendingAuthorization) {
      setNotificationType('pending');
      setShowNotification(true);
    } else {
      setShowNotification(false);
    }
  }, [isAuthorized, pendingAuthorization, userEmail]);

  const handleRequestNewAuthorization = async () => {
    if (!userProfile?.id) return;
    
    setIsRequesting(true);
    try {
      await requestNewAuthorization(userProfile.id, userEmail);
      toast.success('📝 Nova solicitação de autorização enviada!');
      setShowNotification(false);
    } catch (error) {
      toast.error('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setIsRequesting(false);
    }
  };

  if (!showNotification) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -100, scale: 0.8 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4"
      >
        <div className={`p-6 rounded-2xl shadow-2xl border-2 ${
          notificationType === 'denied' 
            ? 'bg-red-900/90 border-red-500 text-red-100' 
            : 'bg-yellow-900/90 border-yellow-500 text-yellow-100'
        }`}>
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: notificationType === 'denied' ? [0, 10, -10, 0] : [0, 0, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-4xl"
            >
              {notificationType === 'denied' ? '🚫' : '⏳'}
            </motion.div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">
                {notificationType === 'denied' ? 'Acesso Negado' : 'Aguardando Autorização'}
              </h3>
              <p className="text-sm">
                {notificationType === 'denied' 
                  ? 'Sua conta não foi autorizada para acessar este sistema. Entre em contato com o administrador.'
                  : 'Sua conta está aguardando autorização do administrador. Você será notificado quando for aprovada.'
                }
              </p>
              {userEmail && (
                <p className="text-xs mt-2 opacity-75">
                  Email: {userEmail}
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              {notificationType === 'denied' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRequestNewAuthorization}
                  disabled={isRequesting}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition font-medium text-sm disabled:opacity-50"
                >
                  {isRequesting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    '📝 Solicitar'
                  )}
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowNotification(false)}
                className="text-2xl hover:opacity-70 transition-opacity"
              >
                ✕
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AccessDeniedNotification;
