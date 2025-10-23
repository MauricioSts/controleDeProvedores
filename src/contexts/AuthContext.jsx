import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { isEmailAuthorized } from '../config/authorizedEmails';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  // Login com Google
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      
      // Verificar se o auth está disponível
      if (!auth) {
        throw new Error('Firebase Auth não está configurado corretamente');
      }
      
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      // Verificar se o email está autorizado
      const email = result.user.email;
      if (!isEmailAuthorized(email)) {
        // Fazer logout imediatamente se não autorizado
        await signOut(auth);
        setUserEmail(email);
        setIsAuthorized(false);
        return null;
      }
      
      setIsAuthorized(true);
      setUserEmail(email);
      toast.success(`Bem-vindo, ${result.user.displayName}!`);
      return result.user;
    } catch (error) {
      console.error('Erro no login:', error);
      
      // Tratamento específico de erros
      if (error.code === 'auth/configuration-not-found') {
        toast.error('Firebase Authentication não está configurado. Verifique o Firebase Console.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast.info('Login cancelado pelo usuário');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Popup bloqueado pelo navegador. Permita popups para este site.');
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error('Domínio não autorizado. Verifique as configurações do Firebase.');
      } else {
        toast.error(`Erro ao fazer login: ${error.message}`);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setIsAuthorized(false);
      setUserEmail(null);
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao fazer logout.');
    }
  };

  // Observar mudanças no estado de autenticação
  useEffect(() => {
    // Verificar se o auth está configurado
    if (!auth) {
      console.error('Firebase Auth não está configurado');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setUserId(user?.uid || null);
      
      if (user) {
        // Verificar se o email está autorizado
        const email = user.email;
        const authorized = isEmailAuthorized(email);
        setIsAuthorized(authorized);
        setUserEmail(email);
        
        if (!authorized) {
          // Fazer logout se não autorizado
          signOut(auth);
        }
      } else {
        setIsAuthorized(false);
        setUserEmail(null);
      }
      
      setLoading(false);
    }, (error) => {
      console.error('Erro no AuthStateChanged:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userId,
    loading,
    isAuthorized,
    userEmail,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
