import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AddProvedor from "./components/AddProvedor";
import ListaProvedores from "./Pages/ListaProvedores";
import DetalheProvedor from "./Pages/DetalheProvedor"; // 🔹 novo import
import Login from "./components/Login";
import Loading from "./components/Loading";
import UnauthorizedAccess from "./components/UnauthorizedAccess";
import DebugAuth from "./components/DebugAuth";
import DebugProvedores from "./components/DebugProvedores";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CouncilProvider } from "./contexts/CouncilContext";
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
  const [view, setView] = useState("add"); // "add" ou "lista"
  const { user, userId, loading, isAuthorized, userEmail, logout } = useAuth();
  const provedoresRef = collection(db, "provedores");

  useEffect(() => {
    if (user && userId) {
      // Consulta temporária sem orderBy para evitar erro de índice
      // TODO: Criar índice composto no Firestore Console
      const q = query(
        provedoresRef, 
        where("userId", "==", userId)
      );
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
  }, [user, userId]);

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
      toast.success("✅ Provedor adicionado!");
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
          className="relative overflow-hidden bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 p-6 shadow-2xl flex justify-between items-center mb-8 rounded-2xl border border-gray-600/30"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div>
          
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10 blur-xl"></div>
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative z-10"
          >
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-2"
            >
              📡 Gerenciador de Provedores
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-gray-300 text-sm font-medium"
            >
              Controle e gestão de provedores de internet
            </motion.p>
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
                <p className="text-gray-300 font-medium">{user?.displayName}</p>
                <p className="text-gray-500 text-xs">{user?.email}</p>
              </div>
            </motion.div>

            {/* Botões de navegação */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  y: -2,
                  boxShadow: "0 10px 25px rgba(6, 182, 212, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView("add")}
                className={`px-4 py-2 rounded-lg font-bold text-xs transition-all duration-300 ${
                  view === "add"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/30"
                    : "bg-gray-600/50 text-gray-300 hover:bg-gray-600 border border-gray-500/30 hover:border-cyan-400/50"
                }`}
              >
                <span className="flex items-center gap-1">
                  <span className="text-sm">➕</span>
                  <span className="hidden sm:inline">Adicionar</span>
                </span>
              </motion.button>
              
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  y: -2,
                  boxShadow: "0 10px 25px rgba(6, 182, 212, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView("lista")}
                className={`px-4 py-2 rounded-lg font-bold text-xs transition-all duration-300 ${
                  view === "lista"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/30"
                    : "bg-gray-600/50 text-gray-300 hover:bg-gray-600 border border-gray-500/30 hover:border-cyan-400/50"
                }`}
              >
                <span className="flex items-center gap-1">
                  <span className="text-sm">📋</span>
                  <span className="hidden sm:inline">Lista</span>
                </span>
              </motion.button>

              {/* Botão de logout */}
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  y: -2,
                  boxShadow: "0 10px 25px rgba(239, 68, 68, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="px-4 py-2 rounded-lg font-bold text-xs transition-all duration-300 
                           bg-red-600/50 text-red-300 hover:bg-red-600 border border-red-500/30 
                           hover:border-red-400/50"
              >
                <span className="flex items-center gap-1">
                  <span className="text-sm">🚪</span>
                  <span className="hidden sm:inline">Sair</span>
                </span>
              </motion.button>
            </div>
          </motion.div>
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
                  ) : (
                    <motion.div
                      key="lista"
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
        <DebugAuth />
        <DebugProvedores />
      </div>
    </Router>
  );
}

// Componente principal com AuthProvider e CouncilProvider
function App() {
  return (
    <AuthProvider>
      <CouncilProvider>
        <AppContent />
      </CouncilProvider>
    </AuthProvider>
  );
}

export default App;
