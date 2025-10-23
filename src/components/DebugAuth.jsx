import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

const DebugAuth = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const { userEmail } = useAuth();

  useEffect(() => {
    const checkConfig = () => {
      const info = {
        authExists: !!auth,
        googleProviderExists: !!googleProvider,
        authApp: auth?.app?.name || 'N/A',
        authConfig: auth?.config || 'N/A',
        timestamp: new Date().toLocaleString()
      };
      
      setDebugInfo(info);
    };

    checkConfig();
  }, []);

  // Só mostrar debug para mauriciogear4@gmail.com
  if (process.env.NODE_ENV !== 'development' || userEmail !== 'mauriciogear4@gmail.com') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 p-4 rounded-lg border border-gray-600 text-xs max-w-sm">
      <h3 className="text-cyan-400 font-bold mb-2">🔧 Debug Auth</h3>
      <div className="space-y-1 text-gray-300">
        <div>Auth: {debugInfo.authExists ? '✅' : '❌'}</div>
        <div>Google Provider: {debugInfo.googleProviderExists ? '✅' : '❌'}</div>
        <div>App: {debugInfo.authApp}</div>
        <div>Time: {debugInfo.timestamp}</div>
      </div>
    </div>
  );
};

export default DebugAuth;
