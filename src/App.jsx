import { useEffect, useState } from "react";
import AddProvedor from "./components/AddProvedor";
import ListaProvedores from "./Pages/ListaProvedores";
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
    return () => unsubscribe();
  }, []);

  const handleAddProvedor = async (provedor) => {
    try {
      // Envia todos os campos para o Firestore
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
        createdAt: serverTimestamp(),
      });
      toast.success("✅ Provedor adicionado!");
      setView("lista"); // muda para lista após adicionar
    } catch (err) {
      console.error(err);
      toast.error("Erro ao adicionar provedor 😢");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📡 Gerenciador de Provedores</h1>
        <div>
          <button
            onClick={() => setView("add")}
            className={`mr-2 px-4 py-2 rounded ${
              view === "add" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Adicionar Provedor
          </button>
          <button
            onClick={() => setView("lista")}
            className={`px-4 py-2 rounded ${
              view === "lista" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Lista de Provedores
          </button>
        </div>
      </header>

      <main>
        {view === "add" && (
          <AddProvedor handleAddProvedor={handleAddProvedor} />
        )}
        {view === "lista" && <ListaProvedores lista={provedores} />}
      </main>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}

export default App;
