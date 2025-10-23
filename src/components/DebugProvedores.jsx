import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

const DebugProvedores = () => {
  const { userId, userEmail } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});
  const [provedoresCount, setProvedoresCount] = useState(0);

  useEffect(() => {
    const checkProvedores = async () => {
      if (!userId) return;

      try {
        // Consulta sem filtro para ver todos os provedores
        const allProvedoresRef = collection(db, "provedores");
        const allSnapshot = await getDocs(allProvedoresRef);
        const allProvedores = allSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Consulta com filtro de usuário
        const userProvedoresRef = collection(db, "provedores");
        const userQuery = query(userProvedoresRef, where("userId", "==", userId));
        const userSnapshot = await getDocs(userQuery);
        const userProvedores = userSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setDebugInfo({
          userId,
          userEmail,
          totalProvedores: allProvedores.length,
          userProvedores: userProvedores.length,
          allProvedores: allProvedores.map(p => ({
            id: p.id,
            razaoSocial: p.razaoSocial,
            userId: p.userId,
            createdAt: p.createdAt
          })),
          userProvedoresList: userProvedores.map(p => ({
            id: p.id,
            razaoSocial: p.razaoSocial,
            userId: p.userId,
            createdAt: p.createdAt
          }))
        });

        setProvedoresCount(userProvedores.length);
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
  if (process.env.NODE_ENV !== 'development' || userEmail !== 'mauriciogear4@gmail.com') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-800 p-4 rounded-lg border border-gray-600 text-xs max-w-md max-h-96 overflow-y-auto">
      <h3 className="text-cyan-400 font-bold mb-2">🔧 Debug Provedores</h3>
      
      <div className="space-y-2 text-gray-300">
        <div>User ID: {debugInfo.userId || 'N/A'}</div>
        <div>Email: {debugInfo.userEmail || 'N/A'}</div>
        <div>Total Provedores: {debugInfo.totalProvedores || 0}</div>
        <div>Seus Provedores: {debugInfo.userProvedores || 0}</div>
        
        {debugInfo.error && (
          <div className="text-red-400">Erro: {debugInfo.error}</div>
        )}
        
        {debugInfo.allProvedores && debugInfo.allProvedores.length > 0 && (
          <div>
            <div className="text-yellow-400 font-semibold mt-2">Todos os Provedores:</div>
            {debugInfo.allProvedores.map((p, index) => (
              <div key={p.id} className="ml-2 text-xs">
                {index + 1}. {p.razaoSocial} (User: {p.userId?.substring(0, 8)}...)
              </div>
            ))}
          </div>
        )}
        
        {debugInfo.userProvedoresList && debugInfo.userProvedoresList.length > 0 && (
          <div>
            <div className="text-green-400 font-semibold mt-2">Seus Provedores:</div>
            {debugInfo.userProvedoresList.map((p, index) => (
              <div key={p.id} className="ml-2 text-xs">
                {index + 1}. {p.razaoSocial}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugProvedores;
