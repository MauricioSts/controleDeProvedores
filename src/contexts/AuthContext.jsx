import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/config';
import { ADMIN_EMAILS, isAdminEmail } from '../config/adminEmails';
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
  const [pendingAuthorization, setPendingAuthorization] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'google'

   // Verificar se email já existe com outro provider
   const checkEmailExists = async (email) => {
     try {
       const q = query(collection(db, 'users'), where('email', '==', email));
       const querySnapshot = await getDocs(q);
       return querySnapshot.docs.length > 0;
     } catch (error) {
       console.error('Erro ao verificar email existente:', error);
       return false;
     }
   };

   // Verificar autorização do usuário no Firestore
   const checkUserAuthorization = async (userId, email) => {
     try {
       const userDoc = await getDoc(doc(db, 'users', userId));
       const isAdmin = isAdminEmail(email);
       
       if (userDoc.exists()) {
         const userData = userDoc.data();
         
         // Se for admin e não estiver autorizado, autorizar automaticamente
         if (isAdmin && !userData.isAuthorized) {
           await updateDoc(doc(db, 'users', userId), {
             isAuthorized: true,
             pendingAuthorization: false,
             authorizedAt: serverTimestamp(),
             authorizedBy: 'system'
           });
           
           return {
             isAuthorized: true,
             profile: { ...userData, isAuthorized: true, pendingAuthorization: false },
             pendingAuthorization: false
           };
         }
         
         return {
           isAuthorized: userData.isAuthorized || false,
           profile: userData,
           pendingAuthorization: userData.pendingAuthorization || false
         };
       } else {
         // Verificar se email já existe com outro provider
         const emailExists = await checkEmailExists(email);
         if (emailExists) {
           throw new Error('Este email já está sendo usado com outro método de login. Use o método original ou entre em contato com o administrador.');
         }

         // Criar perfil do usuário se não existir
         const newUserProfile = {
           email: email,
           displayName: user?.displayName || '',
           photoURL: user?.photoURL || '',
           isAuthorized: isAdmin, // Administradores são automaticamente autorizados
           pendingAuthorization: !isAdmin, // Apenas não-admins ficam pendentes
           createdAt: serverTimestamp(),
           lastLogin: serverTimestamp(),
           ...(isAdmin && {
             authorizedAt: serverTimestamp(),
             authorizedBy: 'system'
           })
         };
         
         await setDoc(doc(db, 'users', userId), newUserProfile);
         
         return {
           isAuthorized: isAdmin,
           profile: newUserProfile,
           pendingAuthorization: !isAdmin
         };
       }
     } catch (error) {
       console.error('Erro ao verificar autorização:', error);
       return {
         isAuthorized: false,
         profile: null,
         pendingAuthorization: false
       };
     }
   };

  // Cadastro com email/senha
  const registerWithEmail = async (email, password, displayName) => {
    try {
      setLoading(true);
      
      if (!auth) {
        throw new Error('Firebase Auth não está configurado corretamente');
      }
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Atualizar perfil do usuário
      await updateProfile(result.user, {
        displayName: displayName
      });
      
      const userId = result.user.uid;
      
      // Verificar autorização no Firestore
      const authStatus = await checkUserAuthorization(userId, email);
      
      setUserEmail(email);
      setUserProfile(authStatus.profile);
      setPendingAuthorization(authStatus.pendingAuthorization);
      
      if (authStatus.isAuthorized) {
        setIsAuthorized(true);
        toast.success(`Bem-vindo, ${displayName}!`);
        return result.user;
      } else if (authStatus.pendingAuthorization) {
        setIsAuthorized(false);
        toast.info('Sua conta foi criada e está aguardando autorização do administrador.');
        return null;
      } else {
        setIsAuthorized(false);
        toast.info('Sua conta foi criada e está aguardando autorização do administrador.');
        return null;
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      
      // Tratamento específico de erros
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Este email já está sendo usado por outra conta.');
      } else if (error.code === 'auth/weak-password') {
        toast.error('A senha deve ter pelo menos 6 caracteres.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Email inválido.');
      } else {
        toast.error(`Erro ao criar conta: ${error.message}`);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login com email/senha
  const loginWithEmail = async (email, password) => {
    try {
      setLoading(true);
      
      if (!auth) {
        throw new Error('Firebase Auth não está configurado corretamente');
      }
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userId = result.user.uid;
      
      // Verificar autorização no Firestore
      const authStatus = await checkUserAuthorization(userId, email);
      
      setUserEmail(email);
      setUserProfile(authStatus.profile);
      setPendingAuthorization(authStatus.pendingAuthorization);
      
       if (authStatus.isAuthorized) {
         setIsAuthorized(true);
         toast.success(`Bem-vindo, ${result.user.displayName || email}!`);
         return result.user;
       } else if (authStatus.pendingAuthorization) {
         setIsAuthorized(false);
         toast.info('Sua conta está aguardando autorização do administrador.');
         return null;
       } else {
         setIsAuthorized(false);
         // Solicitar nova autorização em vez de negar acesso
         await requestNewAuthorization(userId, email);
         toast.info('📝 Nova solicitação de autorização enviada. Aguarde a aprovação do administrador.');
         return null;
       }
    } catch (error) {
      console.error('Erro no login:', error);
      
      // Tratamento específico de erros
      if (error.code === 'auth/user-not-found') {
        toast.error('❌ Email não encontrado. Verifique o email ou crie uma conta.');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('❌ Senha incorreta. Tente novamente.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('❌ Email inválido. Verifique o formato do email.');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('⚠️ Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');
      } else if (error.code === 'auth/invalid-credential') {
        toast.error('❌ Email ou senha incorretos. Verifique suas credenciais.');
      } else {
        toast.error(`❌ Erro ao fazer login: ${error.message}`);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

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
      
      const email = result.user.email;
      const userId = result.user.uid;
      
      // Verificar autorização no Firestore
      const authStatus = await checkUserAuthorization(userId, email);
      
      setUserEmail(email);
      setUserProfile(authStatus.profile);
      setPendingAuthorization(authStatus.pendingAuthorization);
      
       if (authStatus.isAuthorized) {
         setIsAuthorized(true);
         toast.success(`Bem-vindo, ${result.user.displayName}!`);
         return result.user;
       } else if (authStatus.pendingAuthorization) {
         setIsAuthorized(false);
         toast.info('Sua conta está aguardando autorização. Entre em contato com o administrador.');
         return null;
       } else {
         setIsAuthorized(false);
         // Solicitar nova autorização em vez de negar acesso
         await requestNewAuthorization(userId, email);
         toast.info('📝 Nova solicitação de autorização enviada. Aguarde a aprovação do administrador.');
         return null;
       }
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
      setPendingAuthorization(false);
      setUserProfile(null);
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao fazer logout.');
    }
  };

   // Função para autorizar usuário (apenas para administradores)
   const authorizeUser = async (userId, isAuthorized = true) => {
     try {
       // Buscar dados do usuário para verificar se é admin
       const userDoc = await getDoc(doc(db, 'users', userId));
       if (userDoc.exists()) {
         const userData = userDoc.data();
         
         // Verificar se é admin - não permitir desautorizar
         if (isAdminEmail(userData.email) && !isAuthorized) {
           toast.error('❌ Não é possível desautorizar um administrador!');
           return false;
         }
       }

       await updateDoc(doc(db, 'users', userId), {
         isAuthorized: isAuthorized,
         pendingAuthorization: false,
         authorizedAt: serverTimestamp(),
         authorizedBy: user?.uid
       });
       
       // Se for o próprio usuário sendo autorizado, atualizar estado local
       if (userId === user?.uid) {
         setIsAuthorized(isAuthorized);
         setPendingAuthorization(false);
       }
       
       toast.success(`Usuário ${isAuthorized ? 'autorizado' : 'desautorizado'} com sucesso!`);
       return true;
     } catch (error) {
       console.error('Erro ao autorizar usuário:', error);
       toast.error('Erro ao autorizar usuário.');
       return false;
     }
   };

  // Função para obter TODOS os usuários
  const getAllUsers = async () => {
    try {
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar todos os usuários:', error);
      return [];
    }
  };

  // Função para obter lista de usuários pendentes
  const getPendingUsers = async () => {
    try {
      const allUsers = await getAllUsers();
      return allUsers.filter(user => user.pendingAuthorization === true);
    } catch (error) {
      console.error('Erro ao buscar usuários pendentes:', error);
      return [];
    }
  };

  // Função para obter lista de usuários autorizados
  const getAuthorizedUsers = async () => {
    try {
      const allUsers = await getAllUsers();
      return allUsers.filter(user => user.isAuthorized === true);
    } catch (error) {
      console.error('Erro ao buscar usuários autorizados:', error);
      return [];
    }
  };

   // Função para obter provedores de um usuário específico
   const getUserProviders = async (userId) => {
     try {
       const q = query(
         collection(db, 'provedores'),
         where('userId', '==', userId)
       );
       const querySnapshot = await getDocs(q);
       return querySnapshot.docs.map(doc => ({
         id: doc.id,
         ...doc.data()
       }));
     } catch (error) {
       console.error('Erro ao buscar provedores do usuário:', error);
       return [];
     }
   };

   // Função para obter TODOS os provedores do sistema
   const getAllProviders = async () => {
     try {
       const q = query(collection(db, 'provedores'));
       const querySnapshot = await getDocs(q);
       return querySnapshot.docs.map(doc => ({
         id: doc.id,
         ...doc.data()
       }));
     } catch (error) {
       console.error('Erro ao buscar todos os provedores:', error);
       return [];
     }
   };

   // Função para solicitar nova autorização
   const requestNewAuthorization = async (userId, email) => {
     try {
       await updateDoc(doc(db, 'users', userId), {
         isAuthorized: false,
         pendingAuthorization: true,
         requestedAt: serverTimestamp(),
         requestCount: (userProfile?.requestCount || 0) + 1,
         lastRequestDate: serverTimestamp()
       });
       
       // Atualizar estado local
       setPendingAuthorization(true);
       setIsAuthorized(false);
       
       console.log(`Nova solicitação de autorização enviada para ${email}`);
     } catch (error) {
       console.error('Erro ao solicitar nova autorização:', error);
       throw error;
     }
   };

   // Função para excluir usuário (apenas para administradores)
   const deleteUser = async (userId, targetUserEmail) => {
     try {
       // Verificar se o usuário atual é admin
       if (!isAdminEmail(userEmail)) {
         throw new Error('Apenas administradores podem excluir usuários');
       }

       // Verificar se não está tentando excluir outro admin
       if (isAdminEmail(targetUserEmail)) {
         throw new Error('Não é possível excluir um administrador');
       }

       // Excluir usuário do Firestore
       await deleteDoc(doc(db, 'users', userId));
       
       toast.success('Usuário excluído com sucesso!');
       return true;
     } catch (error) {
       console.error('Erro ao excluir usuário:', error);
       toast.error(`Erro ao excluir usuário: ${error.message}`);
       return false;
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

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setUserId(user?.uid || null);
      
      if (user) {
        const email = user.email;
        setUserEmail(email);
        
        // Verificar autorização no Firestore
        const authStatus = await checkUserAuthorization(user.uid, email);
        setUserProfile(authStatus.profile);
        setPendingAuthorization(authStatus.pendingAuthorization);
        setIsAuthorized(authStatus.isAuthorized);
        
         if (!authStatus.isAuthorized && !authStatus.pendingAuthorization) {
           // Fazer logout se não autorizado e não pendente
           toast.error('❌ Acesso negado. Sua conta não foi autorizada para acessar este sistema.');
           signOut(auth);
         }
      } else {
        setIsAuthorized(false);
        setUserEmail(null);
        setPendingAuthorization(false);
        setUserProfile(null);
      }
      
      setLoading(false);
    }, (error) => {
      console.error('Erro no AuthStateChanged:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

   // Listener em tempo real para mudanças de autorização
   useEffect(() => {
     if (!userId) return;

     let isSubscribed = true;
     const userDocRef = doc(db, 'users', userId);
     
     const unsubscribe = onSnapshot(userDocRef, (doc) => {
       if (!isSubscribed) return;
       
       if (doc.exists()) {
         const userData = doc.data();
         const wasAuthorized = isAuthorized;
         const wasPending = pendingAuthorization;
         
         // Atualizar estados
         setPendingAuthorization(userData.pendingAuthorization || false);
         setIsAuthorized(userData.isAuthorized || false);
         setUserProfile(userData);
         
         // Notificar mudanças de status
         if (wasAuthorized && !userData.isAuthorized) {
           // Usuário foi desautorizado!
           toast.error('❌ Sua conta foi desautorizada. Entre em contato com o administrador.');
           // Fazer logout após um pequeno delay para mostrar a mensagem
           setTimeout(() => {
             signOut(auth);
           }, 2000);
         } else if (wasPending && userData.isAuthorized) {
           // Usuário foi autorizado!
           toast.success('🎉 Parabéns! Sua conta foi autorizada. Você agora tem acesso ao sistema!');
         } else if (wasPending && !userData.pendingAuthorization && !userData.isAuthorized) {
           // Usuário foi negado
           toast.error('❌ Sua solicitação de acesso foi negada. Entre em contato com o administrador.');
           // Fazer logout após um pequeno delay para mostrar a mensagem
           setTimeout(() => {
             signOut(auth);
           }, 2000);
         }
       }
     }, (error) => {
       if (isSubscribed) {
         console.error('Erro ao monitorar autorização:', error);
       }
     });

     return () => {
       isSubscribed = false;
       unsubscribe();
     };
   }, [userId, isAuthorized, pendingAuthorization]);

   const value = {
     user,
     userId,
     loading,
     isAuthorized,
     userEmail,
     pendingAuthorization,
     userProfile,
     authMode,
     setAuthMode,
     loginWithGoogle,
     loginWithEmail,
     registerWithEmail,
     logout,
     authorizeUser,
     getAllUsers,
     getPendingUsers,
     getAuthorizedUsers,
     getUserProviders,
     getAllProviders,
     requestNewAuthorization,
     deleteUser
   };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
