import React from "react";

function Provedores({ listaProvedores }) {
  if (!listaProvedores || listaProvedores.length === 0) {
    return <p className="text-gray-500">Nenhum provedor cadastrado.</p>;
  }

  const statusClass = (status) =>
    status === "regular"
      ? "text-green-600 font-semibold"
      : status === "irregular"
      ? "text-red-600 font-semibold"
      : "text-gray-800";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {listaProvedores.map((p) => (
        <div
          key={p.id}
          className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">{p.razaoSocial}</h3>
          <p>
            <span className="font-medium">Status Empresa:</span>{" "}
            {p.statusEmpresa}
          </p>
          <p>
            <span className="font-medium">Regime:</span> {p.regime}
          </p>
          <p>
            <span className="font-medium">CNPJ:</span> {p.cnpj}
          </p>
          <p>
            <span className="font-medium">Nº Fistel:</span> {p.numeroFiscal} |{" "}
            <span className="font-medium">Nº SCM:</span> {p.numeroScm}
          </p>
          <p>
            <span className="font-medium">CNPJ Anatel:</span>{" "}
            <span className={statusClass(p.cnpjAnatel)}>
              {p.cnpjAnatel || "N/A"}
            </span>
          </p>
          <p>
            <span className="font-medium">Situação Anatel/Ancine: </span>
            <span className={statusClass(p.situacaoAnatel)}>
              {p.situacaoAnatel || "N/A"}
            </span>
          </p>
          <p>
            <span className="font-medium">Processo Anatel:</span>{" "}
            {p.processoAnatel || "N/A"}
          </p>
          <p>
            <span className="font-medium">FUST:</span>{" "}
            <span className={statusClass(p.fust)}>{p.fust || "N/A"}</span>
          </p>
          <p>
            <span className="font-medium">Coleta de Dados Mensal:</span>{" "}
            <span className={statusClass(p.coletaDeDadosM)}>
              {p.coletaDeDadosM || "N/A"}
            </span>
          </p>
          <p>
            <span className="font-medium">Coleta de Dados Econômicos:</span>{" "}
            <span className={statusClass(p.coletaDeDadosEconomicos)}>
              {p.coletaDeDadosEconomicos || "N/A"}
            </span>
          </p>
          <p>
            <span className="font-medium">Dados de Infraestrutura:</span>{" "}
            <span className={statusClass(p.dadosInfra)}>
              {p.dadosInfra || "N/A"}
            </span>
          </p>
          <p>
            <span className="font-medium">Registro de Estações:</span>{" "}
            <span className={statusClass(p.registroEstacoes)}>
              {p.registroEstacoes || "N/A"}
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}

export default Provedores;
