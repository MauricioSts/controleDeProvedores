import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AddProvedor from "./components/AddProvedor";
import ListaProvedores from "./Pages/ListaProvedores";
import DetalheProvedor from "./Pages/DetalheProvedor";
import Login from "./components/Login";
import Loading from "./components/Loading";
import UnauthorizedAccess from "./components/UnauthorizedAccess";
import UserManagement from "./components/UserManagement";
import AccessDeniedNotification from "./components/AccessDeniedNotification";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CouncilProvider } from "./contexts/CouncilContext";
import { isAdminEmail, getAdminInfo } from "./config/adminEmails";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase/config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Componente interno que usa o contexto de autenticação
function AppContent() {
  const [provedores, setProvedores] = useState([]);
  const [view, setView] = useState("add"); // "add", "lista" ou "admin"
  const { user, userId, loading, isAuthorized, userEmail, logout } = useAuth();
  const isAdmin = isAdminEmail(userEmail);

  // Verificar se usuário não-admin está tentando acessar admin
  useEffect(() => {
    if (view === "admin" && !isAdmin) {
      setView("lista");
    }
  }, [view, isAdmin]);
  const provedoresRef = collection(db, "provedores");

  useEffect(() => {
    if (user && userId) {
      let q;
      
      if (isAdmin) {
        // Admin vê TODOS os provedores
        q = query(provedoresRef);
      } else {
        // Usuário comum vê apenas seus provedores
        q = query(provedoresRef, where("userId", "==", userId));
      }
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // Ordenar localmente por data de criação (mais recente primeiro)
        lista.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return dateB - dateA;
        });
        
        setProvedores(lista);
      }, (error) => {
        console.error('Erro na consulta do Firestore:', error);
        toast.error('Erro ao carregar provedores');
      });
      return () => unsubscribe();
    } else {
      // Limpar lista se não houver usuário
      setProvedores([]);
    }
  }, [user, userId, isAdmin]);

  const handleAddProvedor = async (provedor) => {
    if (!userId) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      // Buscar informações do conselho do usuário
      const councilRef = doc(db, 'councilInfo', userId);
      const councilSnap = await getDoc(councilRef);
      const councilData = councilSnap.exists() ? councilSnap.data() : {};

      await addDoc(provedoresRef, {
        // Dados do provedor
        razaoSocial: provedor.razaoSocial,
        cnpj: provedor.cnpj,
        regime: provedor.regime,
        numeroFiscal: provedor.numeroFiscal,
        numeroScm: provedor.numeroScm,
        statusEmpresa: provedor.statusEmpresa,
        cnpjAnatel: provedor.cnpjAnatel,
        situacaoAnatel: provedor.situacaoAnatel,
        fust: provedor.fust,
        coletaDeDadosM: provedor.coletaDeDadosM,
        coletaDeDadosEconomicos: provedor.coletaDeDadosEconomicos,
        dadosInfra: provedor.dadosInfra,
        registroEstacoes: provedor.registroEstacoes,
        processoAnatel: provedor.processoAnatel,
        obs: provedor.obs,
        // Dados do Representante Legal
        representanteLegal: provedor.representanteLegal || {},
        // Metadados do usuário
        userId: userId,
        userEmail: user.email,
        userName: user.displayName,
        // Informações do conselho federal
        councilInfo: {
          nome: councilData.nome || '',
          sobrenome: councilData.sobrenome || '',
          registroCft: councilData.registroCft || '',
          processosCft: councilData.processosCft || ''
        },
        createdAt: serverTimestamp(),
      });
      toast.success("Provedor adicionado com sucesso!");
      setView("lista");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao adicionar provedor 😢");
    }
  };

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return <Loading message="Verificando sua sessão..." />;
  }

  // Mostrar tela de acesso não autorizado se o email não estiver na lista
  if (user && !isAuthorized) {
    return <UnauthorizedAccess userEmail={userEmail} />;
  }

  // Mostrar login se não estiver autenticado
  if (!user) {
    return <Login />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <motion.header 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 p-6 shadow-2xl flex justify-center items-center mb-8 rounded-2xl border border-gray-600/30"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div>
          
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10 blur-xl"></div>
          
          <div className="flex justify-between items-center w-full">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative z-10"
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex items-center gap-4"
              >
                <img 
                  src="/bbicon.png" 
                  alt="BridgeAndBits Icon" 
                  className="h-16 w-16"
                />
                <div className="flex flex-col">
                  <motion.h1 
                    className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400"
                    animate={{ 
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                      y: [0, -8, 0]
                    }}
                    transition={{
                      backgroundPosition: {
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      },
                      y: {
                        delay: 1.2,
                        duration: 0.6,
                        ease: "easeOut"
                      }
                    }}
                  >
                    {"BridgeAndBits".split("").map((letter, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0, 
                          scale: 1,
                          transition: {
                            delay: index * 0.1,
                            duration: 0.5,
                            ease: "easeOut"
                          }
                        }}
                        className="inline-block"
                      >
                        {letter === " " ? "\u00A0" : letter}
                      </motion.span>
                    ))}
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        delay: 1.5,
                        duration: 0.6
                      }
                    }}
                    className="text-lg text-gray-300 font-medium"
                  >
                    Gerenciador de Provedores
                  </motion.p>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative z-10 flex items-center gap-4"
            >
            {/* Informações do usuário */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center gap-3 text-sm"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {user?.displayName?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <p className="text-gray-300 font-medium">{user?.displayName}</p>
                  {isAdmin && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      👑 Admin
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-xs">{user?.email}</p>
              </div>
            </motion.div>

            {/* Botões de navegação */}
            <div className="flex gap-4">
              <motion.button
                whileHover={{ 
                  scale: 1.02,
                  y: -1,
                  boxShadow: "0 8px 32px rgba(6, 182, 212, 0.4)"
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView("add")}
                className={`relative px-8 py-4 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden ${
                  view === "add"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-xl shadow-cyan-500/30 border border-cyan-400/40"
                    : "bg-gray-700/60 text-gray-200 hover:bg-gray-600/80 border border-gray-600/40 hover:border-cyan-400/60 backdrop-blur-sm"
                }`}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 flex items-center gap-3">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-current"
                    animate={{ 
                      scale: view === "add" ? [1, 1.2, 1] : 1,
                      opacity: view === "add" ? [0.8, 1, 0.8] : 0.6
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: view === "add" ? Infinity : 0
                    }}
                  />
                  <span className="hidden sm:inline">Adicionar</span>
                </span>
              </motion.button>
              
              <motion.button
                whileHover={{ 
                  scale: 1.02,
                  y: -1,
                  boxShadow: "0 8px 32px rgba(6, 182, 212, 0.4)"
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView("lista")}
                className={`relative px-8 py-4 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden ${
                  view === "lista"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-xl shadow-cyan-500/30 border border-cyan-400/40"
                    : "bg-gray-700/60 text-gray-200 hover:bg-gray-600/80 border border-gray-600/40 hover:border-cyan-400/60 backdrop-blur-sm"
                }`}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 flex items-center gap-3">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-current"
                    animate={{ 
                      scale: view === "lista" ? [1, 1.2, 1] : 1,
                      opacity: view === "lista" ? [0.8, 1, 0.8] : 0.6
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: view === "lista" ? Infinity : 0
                    }}
                  />
                  <span className="hidden sm:inline">Lista</span>
                </span>
              </motion.button>

              {/* Botão de administração - apenas para admins */}
              {isAdmin && (
                <motion.button
                  whileHover={{ 
                    scale: 1.02,
                    y: -1,
                    boxShadow: "0 8px 32px rgba(168, 85, 247, 0.4)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setView("admin")}
                  className={`relative px-8 py-4 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden ${
                    view === "admin"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl shadow-purple-500/30 border border-purple-400/40"
                      : "bg-gray-700/60 text-gray-200 hover:bg-gray-600/80 border border-gray-600/40 hover:border-purple-400/60 backdrop-blur-sm"
                  }`}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative z-10 flex items-center gap-3">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-current"
                      animate={{ 
                        scale: view === "admin" ? [1, 1.2, 1] : 1,
                        opacity: view === "admin" ? [0.8, 1, 0.8] : 0.6
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: view === "admin" ? Infinity : 0
                      }}
                    />
                    <span className="hidden sm:inline">Admin</span>
                  </span>
                </motion.button>
              )}

              {/* Botão de logout */}
              <motion.button
                whileHover={{ 
                  scale: 1.02,
                  y: -1,
                  boxShadow: "0 8px 32px rgba(239, 68, 68, 0.4)"
                }}
                whileTap={{ scale: 0.98 }}
                onClick={logout}
                className="relative px-8 py-4 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden
                           bg-red-700/60 text-red-200 hover:bg-red-600/80 border border-red-600/40 
                           hover:border-red-400/60 backdrop-blur-sm"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-red-500/20"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 flex items-center gap-3">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-current"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity
                    }}
                  />
                  <span className="hidden sm:inline">Sair</span>
                </span>
              </motion.button>
            </div>
          </motion.div>
          </div>
        </motion.header>

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Routes>
            <Route
              path="/"
              element={
                <AnimatePresence mode="wait">
                  {view === "add" ? (
                    <motion.div
                      key="add"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AddProvedor handleAddProvedor={handleAddProvedor} />
                    </motion.div>
                  ) : view === "lista" ? (
                    <motion.div
                      key="lista"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ListaProvedores lista={provedores} />
                    </motion.div>
                  ) : view === "admin" && isAdmin ? (
                    <motion.div
                      key="admin"
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -50 }}
                      transition={{ duration: 0.3 }}
                    >
                      <UserManagement />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="lista-fallback"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ListaProvedores lista={provedores} />
                    </motion.div>
                  )}
                </AnimatePresence>
              }
            />
            <Route
              path="/provedor/:id"
              element={<DetalheProvedor provedores={provedores} />}
            />
          </Routes>
        </motion.main>

        <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
        <AccessDeniedNotification />
      </div>
    </Router>
  );
}

// Componente principal com AuthProvider e CouncilProvider
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CouncilProvider>
          <AppContent />
        </CouncilProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
