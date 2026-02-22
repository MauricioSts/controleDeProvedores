import React from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { toast } from "react-toastify";

function Provedores({ listaProvedores, onCardClick, searchTerm = '' }) {
  const statusClass = (status, returnColorBase = false) => {
    if (!status) {
      return returnColorBase ? "gray" : "text-gray-400";
    }

    const lowerStatus = status.toLowerCase();

    if (lowerStatus === "regular" || lowerStatus === "ativo") {
      return returnColorBase ? "cyan" : "text-cyan-400 font-semibold";
    }

    if (lowerStatus === "irregular" || lowerStatus === "inativo") {
      return returnColorBase ? "red" : "text-red-400 font-semibold";
    }

    return returnColorBase ? "gray" : "text-gray-400";
  };

  const hasIrregularInfo = (provedor) => {
    const irregularStatuses = ['irregular', 'inativa', 'inativo'];
    const camposParaVerificar = [
      'statusEmpresa',
      'cnpjAnatel',
      'situacaoAnatel',
      'fust',
      'coletaDeDadosM',
      'coletaDeDadosEconomicos',
      'dadosInfra',
      'registroEstacoes'
    ];

    return camposParaVerificar.some(campo => {
      const value = provedor[campo]?.toLowerCase();
      return value && irregularStatuses.includes(value);
    });
  };

  if (!listaProvedores || listaProvedores.length === 0) {
    return <p className="text-gray-400 italic">Nenhum provedor cadastrado.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {listaProvedores.map((p) => {
        const statusBaseColor = statusClass(p.statusEmpresa, true);
        const badgeBgClass =
          statusBaseColor === "red"
            ? "bg-red-900/50 text-red-300"
            : "bg-cyan-900/50 text-cyan-300";

        const temIrregularidade = hasIrregularInfo(p);

        return (
          <div
            key={p.id}
            onClick={() => onCardClick && onCardClick(p.id)}
            className="bg-gray-700/50 p-5 rounded-lg border-l-4 border-cyan-500 shadow-lg 
                       hover:shadow-xl hover:border-cyan-400 hover:-translate-y-1 
                       transition-all duration-200 cursor-pointer relative"
          >
            {/* Bolinha amarela para irregularidades */}
            {temIrregularidade && (
              <div
                className="absolute top-3 right-3 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center"
                title="Há informações irregulares"
              >
                <span className="text-xs text-gray-900 font-bold">!</span>
              </div>
            )}

            {/* Indicador de status */}
            <div
              className={`absolute ${temIrregularidade ? 'top-3 left-3' : 'top-3 right-3'} w-3 h-3 rounded-full ${p.statusEmpresa?.toLowerCase() === 'ativa' || p.statusEmpresa?.toLowerCase() === 'ativo'
                  ? 'bg-green-500'
                  : p.statusEmpresa?.toLowerCase() === 'inativa' || p.statusEmpresa?.toLowerCase() === 'inativo'
                    ? 'bg-red-500'
                    : 'bg-gray-500'
                }`}
              title={`Status: ${p.statusEmpresa || 'N/A'}`}
            ></div>
            {/* Título do Card */}
            <div className="h-16 mb-3 border-b border-gray-600 pb-2 overflow-hidden">
              <h3
                className="text-xl font-bold text-cyan-400 leading-tight"
                style={{
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
                title={p.razaoSocial}
              >
                {p.razaoSocial}
              </h3>
            </div>

            {/* Conteúdo do Card */}
            <div className="space-y-2">
              {/* Status Empresa com Badge */}
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-300">
                  Status Empresa:
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${badgeBgClass}`}
                >
                  {p.statusEmpresa || "N/A"}
                </span>
              </div>

              {/* CNPJ */}
              <p className="text-sm pt-1 border-t border-gray-600/30">
                <span className="font-medium text-gray-300">CNPJ:</span>{" "}
                <span className="text-gray-300">{p.cnpj || "N/A"}</span>
              </p>

              {/* Observações */}
              <div className="text-sm pt-1 border-t border-gray-600/30 min-h-[2.5rem]">
                {p.obs && (
                  <>
                    <span className="font-medium text-gray-300">Observações:</span>
                    <span className="text-gray-400 italic ml-1 text-xs block mt-1">
                      {p.obs}
                    </span>
                  </>
                )}
              </div>

              {/* Representante Legal */}
              <div className="mt-3 pt-3 border-t border-gray-600/50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-purple-400">👤</span>
                  <span className="font-semibold text-purple-400 text-sm">
                    Representante Legal
                  </span>
                </div>
                <p className="text-sm text-gray-300 ml-6">
                  <span className="font-medium text-gray-200">Nome:</span>{" "}
                  {p.representanteLegal?.nomeCompleto || "N/A"}
                </p>
              </div>

              {/* Responsável Técnico */}
              <div className="mt-2 pt-3 border-t border-gray-600/50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-cyan-400">🔧</span>
                  <span className="font-semibold text-cyan-400 text-sm">
                    Responsável Técnico
                  </span>
                </div>
                <p className="text-sm text-gray-300 ml-6">
                  <span className="font-medium text-gray-200">Nome:</span>{" "}
                  {p.councilInfo?.nome && p.councilInfo?.sobrenome
                    ? `${p.councilInfo.nome} ${p.councilInfo.sobrenome}`
                    : p.councilInfo?.nome || "N/A"}
                </p>
              </div>

              {/* Switch para envio automático de email */}
              <div
                className="mt-3 pt-3 border-t border-gray-600/50 flex items-center justify-between"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2">
                  <span className="text-green-400 text-lg">📧</span>
                  <span className="text-sm font-medium text-gray-300">
                    Envio automático
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={p.enviarEmailAutomatico === true}
                    onChange={async (e) => {
                      e.stopPropagation();
                      try {
                        const provedorRef = doc(db, 'provedores', p.id);
                        const novoEstado = e.target.checked;
                        await updateDoc(provedorRef, {
                          enviarEmailAutomatico: novoEstado
                        });
                        toast.success(
                          novoEstado
                            ? 'Email automático ativado ✅'
                            : 'Email automático desativado ❌'
                        );
                      } catch (error) {
                        console.error('Erro ao atualizar:', error);
                        toast.error('Erro ao atualizar configuração');
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className={`relative w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-400 rounded-full peer transition-colors duration-300 ${p.enviarEmailAutomatico === true ? 'bg-cyan-500 shadow-lg shadow-cyan-500/50' : 'bg-gray-600'
                    }`}>
                    <div className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-transform duration-300 shadow-md ${p.enviarEmailAutomatico === true ? 'translate-x-5' : 'translate-x-0'
                      }`}></div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Provedores;
