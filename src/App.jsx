import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AddProvedor from "./components/AddProvedor";
import ListaProvedores from "./Pages/ListaProvedores";
import DetalheProvedor from "./Pages/DetalheProvedor"; // 🔹 novo import
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase/config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [provedores, setProvedores] = useState([]);
  const [view, setView] = useState("add"); // "add" ou "lista"
  const provedoresRef = collection(db, "provedores");

  useEffect(() => {
    const q = query(provedoresRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProvedores(lista);
    });
    // Lembrete: Se este código for executado em um ambiente de arquivo único,
    // a importação do CSS (react-toastify/dist/ReactToastify.css) pode causar erros.
    // Você pode precisar carregar o CSS via CDN no seu HTML principal.
    return () => unsubscribe();
  }, []);

  const handleAddProvedor = async (provedor) => {
    try {
      await addDoc(provedoresRef, {
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
        createdAt: serverTimestamp(),
      });
      toast.success("✅ Provedor adicionado!");
      setView("lista");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao adicionar provedor 😢");
    }
  };

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
            className="relative z-10 flex gap-3"
          >
            <motion.button
              whileHover={{ 
                scale: 1.05,
                y: -2,
                boxShadow: "0 10px 25px rgba(6, 182, 212, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setView("add")}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                view === "add"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/30"
                  : "bg-gray-600/50 text-gray-300 hover:bg-gray-600 border border-gray-500/30 hover:border-cyan-400/50"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">➕</span>
                Adicionar Provedor
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
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                view === "lista"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/30"
                  : "bg-gray-600/50 text-gray-300 hover:bg-gray-600 border border-gray-500/30 hover:border-cyan-400/50"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">📋</span>
                Lista de Provedores
              </span>
            </motion.button>
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
      </div>
    </Router>
  );
}

export default App;
