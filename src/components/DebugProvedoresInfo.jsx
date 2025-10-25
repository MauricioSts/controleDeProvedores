import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

const DebugProvedoresInfo = () => {
  const { user, userId } = useAuth();
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadDebugInfo = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const provedoresRef = collection(db, "provedores");
      const q = query(provedoresRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      const provedores = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setDebugInfo({
        userId,
        userEmail: user?.email,
        isAdmin: user?.email === 'mauriciogear4@gmail.com',
        totalProvedores: querySnapshot.docs.length,
        provedores: provedores,
        provedoresByUser: provedores.reduce((acc, p) => {
          const userKey = p.userEmail || p.userId || 'unknown';
          acc[userKey] = (acc[userKey] || 0) + 1;
          return acc;
        }, {})
      });
    } catch (error) {
      console.error('Erro ao carregar debug info:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDebugInfo();
  }, [userId]);

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 bg-gray-800/90 backdrop-blur-xl p-4 rounded-xl border border-gray-700/50 max-w-sm z-50"
    >
      <div className="text-xs text-gray-300 mb-2">Debug Info</div>
      
      {loading ? (
        <div className="text-cyan-400 text-sm">Carregando...</div>
      ) : debugInfo ? (
        <div className="space-y-1 text-xs">
          <div><strong>User ID:</strong> {debugInfo.userId}</div>
          <div><strong>Email:</strong> {debugInfo.userEmail}</div>
          <div><strong>Admin:</strong> {debugInfo.isAdmin ? '✅' : '❌'}</div>
          <div><strong>Total Provedores:</strong> {debugInfo.totalProvedores}</div>
          
          {Object.keys(debugInfo.provedoresByUser).length > 0 && (
            <div>
              <strong>Por Usuário:</strong>
              <ul className="ml-2 mt-1">
                {Object.entries(debugInfo.provedoresByUser).map(([user, count]) => (
                  <li key={user} className="text-gray-400">
                    {user}: {count} provedor(es)
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {debugInfo.provedores.length > 0 && (
            <div>
              <strong>Provedores:</strong>
              <ul className="ml-2 mt-1 max-h-32 overflow-y-auto">
                {debugInfo.provedores.slice(0, 5).map((p, i) => (
                  <li key={i} className="text-gray-400">
                    {p.razaoSocial || 'Sem nome'} 
                    {p.userEmail && <span className="text-gray-600"> ({p.userEmail})</span>}
                  </li>
                ))}
                {debugInfo.provedores.length > 5 && (
                  <li className="text-gray-500">... e mais {debugInfo.provedores.length - 5}</li>
                )}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="text-red-400 text-sm">Erro ao carregar</div>
      )}
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={loadDebugInfo}
        className="mt-2 px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded hover:bg-cyan-500/30 transition-colors"
      >
        Atualizar
      </motion.button>
    </motion.div>
  );
};

export default DebugProvedoresInfo;
