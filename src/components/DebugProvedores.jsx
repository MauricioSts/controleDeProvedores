import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { getAuthorizedEmails } from '../config/authorizedEmails';

const DebugProvedores = () => {
  const { userId, userEmail } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});
  const [userStats, setUserStats] = useState([]);

  useEffect(() => {
    const checkProvedores = async () => {
      if (!userId) return;

      try {
        // Obter todos os provedores
        const allProvedoresRef = collection(db, "provedores");
        const allSnapshot = await getDocs(allProvedoresRef);
        const allProvedores = allSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Obter lista de emails autorizados
        const authorizedEmails = getAuthorizedEmails();
        
        // Contar provedores por usuário
        const userCounts = {};
        allProvedores.forEach(provedor => {
          const email = provedor.userEmail;
          if (email) {
            userCounts[email] = (userCounts[email] || 0) + 1;
          }
        });

        // Criar estatísticas para cada email autorizado
        const stats = authorizedEmails.map(email => ({
          email,
          count: userCounts[email] || 0,
          hasProvedores: (userCounts[email] || 0) > 0
        }));

        setUserStats(stats);

        setDebugInfo({
          userId,
          userEmail,
          totalProvedores: allProvedores.length,
          userProvedores: userCounts[userEmail] || 0,
          allProvedores: allProvedores.map(p => ({
            id: p.id,
            razaoSocial: p.razaoSocial,
            userEmail: p.userEmail,
            userId: p.userId,
            createdAt: p.createdAt
          }))
        });

      } catch (error) {
        console.error('Erro ao verificar provedores:', error);
        setDebugInfo({
          error: error.message,
          userId,
          userEmail
        });
      }
    };

    checkProvedores();
  }, [userId, userEmail]);

  // Só mostrar debug para mauriciogear4@gmail.com
  if (userEmail !== 'mauriciogear4@gmail.com') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-800 p-4 rounded-lg border border-gray-600 text-xs max-w-sm">
      <h3 className="text-cyan-400 font-bold mb-3">Provider Control</h3>
      
      <div className="space-y-2 text-gray-300">
        {/* Total de provedores no topo */}
        <div className="text-center mb-3 p-2 bg-cyan-900/30 rounded border border-cyan-500/30">
          <div className="text-cyan-400 font-bold text-sm">Total: {debugInfo.totalProvedores || 0} provedores</div>
        </div>
        
        {debugInfo.error && (
          <div className="text-red-400 text-center">Erro: {debugInfo.error}</div>
        )}
        
        {/* Lista simplificada de usuários */}
        <div className="space-y-1">
          {userStats.map((user, index) => (
            <div 
              key={user.email} 
              className={`p-2 rounded text-center ${
                user.hasProvedores 
                  ? 'bg-green-900/20 border border-green-500/30' 
                  : 'bg-gray-700/20 border border-gray-500/30'
              }`}
            >
              <div className="text-xs font-medium text-gray-300 mb-1">{user.email}</div>
              <div className={`text-sm font-bold ${
                user.hasProvedores ? 'text-green-400' : 'text-gray-400'
              }`}>
                {user.count} provedor{user.count !== 1 ? 'es' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DebugProvedores;
