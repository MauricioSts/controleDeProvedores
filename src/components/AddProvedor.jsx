import { useState } from "react";

function AddProvedor({ handleAddProvedor }) {
  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [regime, setRegime] = useState("");
  const [numeroFiscal, setNumeroFiscal] = useState("");
  const [numeroScm, setNumeroScm] = useState("");
  const [statusEmpresa, setStatusEmpresa] = useState("");
  const [cnpjAnatel, setCnpjAnatel] = useState("");
  const [situacaoAnatel, setSituacaoAnatel] = useState("");
  const [fust, setFust] = useState("");
  const [coletaDeDadosM, setColetaDeDadosM] = useState("");
  const [coletaDeDadosEconomicos, setColetaDeDadosEconomicos] = useState("");
  const [dadosInfra, setDadosInfra] = useState("");
  const [registroEstacoes, setRegistroEstacoes] = useState("");
  const [processoAnatel, setProcessoAnatel] = useState("");
  const [loading, setLoading] = useState(false);

  const situacaoClass = (value) =>
    value
      ? value === "regular"
        ? "border-green-500 bg-green-100 text-green-800"
        : "border-red-500 bg-red-100 text-red-800"
      : "border-gray-300";

  async function handleSubmit() {
    if (
      !razaoSocial ||
      !cnpj ||
      !regime ||
      !numeroFiscal ||
      !numeroScm ||
      !statusEmpresa ||
      !cnpjAnatel ||
      !situacaoAnatel ||
      !fust ||
      !coletaDeDadosM ||
      !coletaDeDadosEconomicos ||
      !dadosInfra ||
      !registroEstacoes
    )
      return alert("Preencha todos os campos!");

    setLoading(true);
    await handleAddProvedor({
      razaoSocial,
      cnpj,
      regime,
      numeroFiscal,
      numeroScm,
      statusEmpresa,
      cnpjAnatel,
      situacaoAnatel,
      fust,
      coletaDeDadosM,
      coletaDeDadosEconomicos,
      dadosInfra,
      registroEstacoes,
      processoAnatel,
    });
    setLoading(false);

    // Reset campos
    setRazaoSocial("");
    setCnpj("");
    setRegime("");
    setNumeroFiscal("");
    setNumeroScm("");
    setStatusEmpresa("");
    setCnpjAnatel("");
    setSituacaoAnatel("");
    setFust("");
    setColetaDeDadosM("");
    setColetaDeDadosEconomicos("");
    setDadosInfra("");
    setRegistroEstacoes("");
    setProcessoAnatel("");
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow max-w-4xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Adicionar Provedor</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Razão Social"
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={razaoSocial}
          onChange={(e) => setRazaoSocial(e.target.value)}
        />
        <input
          type="number"
          placeholder="CNPJ"
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={cnpj}
          onChange={(e) => setCnpj(e.target.value)}
        />
        <select
          value={regime}
          onChange={(e) => setRegime(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tipo de Regime</option>
          <option value="Simples Nacional">Simples Nacional</option>
          <option value="Lucro Presumido">Lucro Presumido</option>
          <option value="Lucro Real">Lucro Real</option>
          <option value="ME">ME</option>
          <option value="SE">SE</option>
        </select>
        <input
          type="number"
          placeholder="Nº Fistel"
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={numeroFiscal}
          onChange={(e) => setNumeroFiscal(e.target.value)}
        />
        <input
          type="number"
          placeholder="Nº SCM"
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={numeroScm}
          onChange={(e) => setNumeroScm(e.target.value)}
        />
        <select
          value={statusEmpresa}
          onChange={(e) => setStatusEmpresa(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Status da Empresa</option>
          <option value="ativa">Ativa</option>
          <option value="inativa">Inativa</option>
          <option value="suspensa">Suspensa</option>
          <option value="em-analise">Em Análise</option>
        </select>
        <select
          value={cnpjAnatel}
          onChange={(e) => setCnpjAnatel(e.target.value)}
          className={`border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${situacaoClass(
            cnpjAnatel
          )}`}
        >
          <option value="">Situação CNPJ Anatel</option>
          <option value="regular">Regular</option>
          <option value="irregular">Irregular</option>
        </select>
        <select
          value={situacaoAnatel}
          onChange={(e) => setSituacaoAnatel(e.target.value)}
          className={`border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${situacaoClass(
            situacaoAnatel
          )}`}
        >
          <option value="">Situação Anatel/Ancine</option>
          <option value="regular">Regular</option>
          <option value="irregular">Irregular</option>
        </select>
        <input
          type="text"
          placeholder="Processo Anatel"
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={processoAnatel}
          onChange={(e) => setProcessoAnatel(e.target.value)}
        />
        <select
          value={fust}
          onChange={(e) => setFust(e.target.value)}
          className={`border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${situacaoClass(
            fust
          )}`}
        >
          <option value="">FUST</option>
          <option value="regular">Regular</option>
          <option value="irregular">Irregular</option>
        </select>
        <select
          value={coletaDeDadosM}
          onChange={(e) => setColetaDeDadosM(e.target.value)}
          className={`border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${situacaoClass(
            coletaDeDadosM
          )}`}
        >
          <option value="">Coleta de Dados Mensal</option>
          <option value="regular">Regular</option>
          <option value="irregular">Irregular</option>
        </select>
        <select
          value={coletaDeDadosEconomicos}
          onChange={(e) => setColetaDeDadosEconomicos(e.target.value)}
          className={`border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${situacaoClass(
            coletaDeDadosEconomicos
          )}`}
        >
          <option value="">Coleta de Dados Econômicos</option>
          <option value="regular">Regular</option>
          <option value="irregular">Irregular</option>
        </select>
        <select
          value={dadosInfra}
          onChange={(e) => setDadosInfra(e.target.value)}
          className={`border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${situacaoClass(
            dadosInfra
          )}`}
        >
          <option value="">Dados de Infraestrutura</option>
          <option value="regular">Regular</option>
          <option value="irregular">Irregular</option>
        </select>
        <select
          value={registroEstacoes}
          onChange={(e) => setRegistroEstacoes(e.target.value)}
          className={`border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${situacaoClass(
            registroEstacoes
          )}`}
        >
          <option value="">Registro de Estações</option>
          <option value="regular">Regular</option>
          <option value="irregular">Irregular</option>
        </select>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? "Adicionando..." : "Adicionar Provedor"}
      </button>
    </div>
  );
}

export default AddProvedor;
