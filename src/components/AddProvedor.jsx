import { useState } from "react";
import { motion } from "framer-motion";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import CouncilInfo from "./CouncilInfo";
import LoadingDots from "./LoadingDots";

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
  const [obs, setObs] = useState("");
  
  // Estados para validação visual
  const [errors, setErrors] = useState({});
  const [shakeFields, setShakeFields] = useState({});

  // Campos do Representante Legal
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [documentoIdentidade, setDocumentoIdentidade] = useState("");
  const [cpf, setCpf] = useState("");
  const [emailLogin, setEmailLogin] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [bairro, setBairro] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [cep, setCep] = useState("");

  // Função para validar campos obrigatórios
  const validateRequiredFields = () => {
    const requiredFields = {
      razaoSocial,
      cnpj,
      nomeCompleto,
      cpf
    };
    
    const newErrors = {};
    const newShakeFields = {};
    
    Object.keys(requiredFields).forEach(field => {
      if (!requiredFields[field]) {
        newErrors[field] = true;
        newShakeFields[field] = true;
      }
    });
    
    setErrors(newErrors);
    setShakeFields(newShakeFields);
    
    // Remove o tremor após 500ms
    setTimeout(() => {
      setShakeFields({});
    }, 500);
    
    return Object.keys(newErrors).length === 0;
  };
  const situacaoClass = (value) =>
    value
      ? value === "regular"
        ? "border-green-700 bg-green-900/40 text-green-300"
        : "border-red-700 bg-red-900/40 text-red-300"
      : "border-gray-600 bg-gray-700 text-gray-300"; // Default para estado vazio

  // Função específica para status da empresa
  const statusEmpresaClass = (value) => {
    if (!value) return "border-gray-600 bg-gray-700 text-gray-300";
    
    switch (value) {
      case "ativa":
        return "border-green-700 bg-green-900/40 text-green-300";
      case "inativa":
        return "border-red-700 bg-red-900/40 text-red-300";
      case "suspensa":
        return "border-yellow-700 bg-yellow-900/40 text-yellow-300";
      case "em-analise":
        return "border-blue-700 bg-blue-900/40 text-blue-300";
      default:
        return "border-gray-600 bg-gray-700 text-gray-300";
    }
  };

  async function handleSubmit() {
    if (!validateRequiredFields()) {
      return;
    }

    setLoading(true);

    try {
      // Usar a função handleAddProvedor do App.jsx para manter consistência
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
        obs,
        // Dados do Representante Legal
        representanteLegal: {
          nomeCompleto,
          dataNascimento,
          documentoIdentidade,
          cpf,
          emailLogin,
          telefone,
          endereco,
          bairro,
          estado,
          cidade,
          cep
        }
      });

      // Reset todos os campos
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
      setObs("");
      // Reset campos do representante legal
      setNomeCompleto("");
      setDataNascimento("");
      setDocumentoIdentidade("");
      setCpf("");
      setEmailLogin("");
      setTelefone("");
      setEndereco("");
      setBairro("");
      setEstado("");
      setCidade("");
      setCep("");
    } catch (error) {
      console.error("Erro ao adicionar provedor:", error);
      // Mantendo o alert() conforme a lógica original
      alert("Erro ao adicionar provedor. Verifique o console.");
    }

    setLoading(false);
  }

  return (
    // Fundo Escuro - seguindo o padrão do DetalheProvedor
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900 min-h-screen p-8 text-white"
    >
      {/* Container Principal */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-5xl mx-auto bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-700"
      >
        {/* Título com Gradient - seguindo o padrão do DetalheProvedor */}
        <motion.h2 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-4xl font-extrabold text-center mb-10 border-b-4 border-cyan-500 pb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"
        >
          Adicionar Provedor
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mapeamento dos campos básicos - seguindo o padrão do DetalheProvedor */}
          {[
            ["razaoSocial", "Razão Social", "text"],
            ["cnpj", "CNPJ", "text"],
            ["numeroFiscal", "Nº Fistel", "number"],
            ["numeroScm", "Nº SCM", "number"],
          ].map(([campo, label, type], index) => (
            <motion.div 
              key={campo}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              whileInView={{
                x: (campo === "razaoSocial" && shakeFields.razaoSocial) || (campo === "cnpj" && shakeFields.cnpj) 
                  ? [0, -10, 10, -10, 10, 0] 
                  : 0
              }}
              transition={{
                x: { duration: 0.5, ease: "easeInOut" }
              }}
            >
              <label className="block font-semibold text-gray-300 mb-1">
                {label}
              </label>
              <input
                type={type}
                value={campo === "razaoSocial" ? razaoSocial : 
                       campo === "cnpj" ? cnpj :
                       campo === "numeroFiscal" ? numeroFiscal :
                       campo === "numeroScm" ? numeroScm : ""}
                onChange={(e) => {
                  if (campo === "razaoSocial") {
                    setRazaoSocial(e.target.value);
                    if (errors.razaoSocial) {
                      setErrors(prev => ({ ...prev, razaoSocial: false }));
                    }
                  }
                  else if (campo === "cnpj") {
                    setCnpj(e.target.value);
                    if (errors.cnpj) {
                      setErrors(prev => ({ ...prev, cnpj: false }));
                    }
                  }
                  else if (campo === "numeroFiscal") setNumeroFiscal(e.target.value);
                  else if (campo === "numeroScm") setNumeroScm(e.target.value);
                }}
                placeholder={`Digite ${label.toLowerCase()}`}
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition ${
                  (campo === "razaoSocial" && errors.razaoSocial) || (campo === "cnpj" && errors.cnpj)
                    ? "border-red-500 bg-red-900/20 text-red-200"
                    : "border-gray-700 bg-gray-900 text-gray-200"
                } ${
                  (campo === "razaoSocial" && shakeFields.razaoSocial) || (campo === "cnpj" && shakeFields.cnpj)
                    ? "animate-pulse"
                    : ""
                }`}
              />
            </motion.div>
          ))}

          {/* Regime (Select) - seguindo o padrão do DetalheProvedor */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
          >
            <label className="block font-semibold text-gray-300 mb-1">
              Regime
            </label>
            <select
              value={regime}
              onChange={(e) => setRegime(e.target.value)}
              className="w-full border border-gray-700 bg-gray-900 text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            >
              <option value="" disabled>
                Selecione o regime
              </option>
              <option value="Simples Nacional">Simples Nacional</option>
              <option value="Lucro Presumido">Lucro Presumido</option>
              <option value="Lucro Real">Lucro Real</option>
              <option value="ME">ME</option>
              <option value="SE">SE</option>
            </select>
          </motion.div>

          {/* Status Empresa (Select) - seguindo o padrão do DetalheProvedor */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <label className="block font-semibold text-gray-300 mb-1">
              Status da Empresa
            </label>
            <select
              value={statusEmpresa}
              onChange={(e) => setStatusEmpresa(e.target.value)}
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${statusEmpresaClass(
                statusEmpresa
              )} bg-gray-900`}
            >
              <option value="" disabled>
                Selecione o status
              </option>
              <option value="ativa">Ativa</option>
              <option value="inativa">Inativa</option>
              <option value="suspensa">Suspensa</option>
              <option value="em-analise">Em Análise</option>
            </select>
          </motion.div>

          {/* Seção Representante Legal - MOVIDA PARA ACIMA DO CONSELHO FEDERAL */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="col-span-2 mb-6 p-6 bg-gray-700/50 rounded-xl border-l-4 border-purple-500"
          >
            <h3 className="text-2xl font-bold text-purple-400 mb-6 border-b border-gray-600 pb-2">
              Representante Legal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome Completo do Usuário */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                whileInView={{
                  x: shakeFields.nomeCompleto ? [0, -10, 10, -10, 10, 0] : 0
                }}
                transition={{
                  x: { duration: 0.5, ease: "easeInOut" }
                }}
              >
                <label className="block font-semibold text-gray-300 mb-1">
                  Nome Completo do Usuário
                </label>
                <input
                  type="text"
                  value={nomeCompleto}
                  onChange={(e) => {
                    setNomeCompleto(e.target.value);
                    if (errors.nomeCompleto) {
                      setErrors(prev => ({ ...prev, nomeCompleto: false }));
                    }
                  }}
                  placeholder="Digite o nome completo"
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                    errors.nomeCompleto
                      ? "border-red-500 bg-red-900/20 text-red-200"
                      : "border-gray-700 bg-gray-900 text-gray-200"
                  } ${
                    shakeFields.nomeCompleto ? "animate-pulse" : ""
                  }`}
                />
              </motion.div>

              {/* Data de Nascimento */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <label className="block font-semibold text-gray-300 mb-1">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="w-full border border-gray-700 bg-gray-900 text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </motion.div>

              {/* Documento de Identidade */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <label className="block font-semibold text-gray-300 mb-1">
                  Documento de Identidade
                </label>
                <input
                  type="text"
                  value={documentoIdentidade}
                  onChange={(e) => setDocumentoIdentidade(e.target.value)}
                  placeholder="Digite o número do documento"
                  className="w-full border border-gray-700 bg-gray-900 text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </motion.div>

              {/* CPF */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                whileInView={{
                  x: shakeFields.cpf ? [0, -10, 10, -10, 10, 0] : 0
                }}
                transition={{
                  x: { duration: 0.5, ease: "easeInOut" }
                }}
              >
                <label className="block font-semibold text-gray-300 mb-1">
                  CPF
                </label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => {
                    setCpf(e.target.value);
                    if (errors.cpf) {
                      setErrors(prev => ({ ...prev, cpf: false }));
                    }
                  }}
                  placeholder="000.000.000-00"
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                    errors.cpf
                      ? "border-red-500 bg-red-900/20 text-red-200"
                      : "border-gray-700 bg-gray-900 text-gray-200"
                  } ${
                    shakeFields.cpf ? "animate-pulse" : ""
                  }`}
                />
              </motion.div>

              {/* E-mail de Login no SEI */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <label className="block font-semibold text-gray-300 mb-1">
                  E-mail de Login no SEI
                </label>
                <input
                  type="email"
                  value={emailLogin}
                  onChange={(e) => setEmailLogin(e.target.value)}
                  placeholder="Digite o e-mail de login no SEI"
                  className="w-full border border-gray-700 bg-gray-900 text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </motion.div>

              {/* Telefone */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                <label className="block font-semibold text-gray-300 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full border border-gray-700 bg-gray-900 text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </motion.div>

              {/* Endereço */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.1 }}
              >
                <label className="block font-semibold text-gray-300 mb-1">
                  Endereço de Domicílio
                </label>
                <input
                  type="text"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Digite o endereço"
                  className="w-full border border-gray-700 bg-gray-900 text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </motion.div>

              {/* Bairro */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
              >
                <label className="block font-semibold text-gray-300 mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  placeholder="Digite o bairro"
                  className="w-full border border-gray-700 bg-gray-900 text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </motion.div>

              {/* Estado */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.3 }}
              >
                <label className="block font-semibold text-gray-300 mb-1">
                  Estado (UF)
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full border border-gray-700 bg-gray-900 text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                >
                  <option value="" disabled>Selecione o estado</option>
                  <option value="AC">AC - Acre</option>
                  <option value="AL">AL - Alagoas</option>
                  <option value="AP">AP - Amapá</option>
                  <option value="AM">AM - Amazonas</option>
                  <option value="BA">BA - Bahia</option>
                  <option value="CE">CE - Ceará</option>
                  <option value="DF">DF - Distrito Federal</option>
                  <option value="ES">ES - Espírito Santo</option>
                  <option value="GO">GO - Goiás</option>
                  <option value="MA">MA - Maranhão</option>
                  <option value="MT">MT - Mato Grosso</option>
                  <option value="MS">MS - Mato Grosso do Sul</option>
                  <option value="MG">MG - Minas Gerais</option>
                  <option value="PA">PA - Pará</option>
                  <option value="PB">PB - Paraíba</option>
                  <option value="PR">PR - Paraná</option>
                  <option value="PE">PE - Pernambuco</option>
                  <option value="PI">PI - Piauí</option>
                  <option value="RJ">RJ - Rio de Janeiro</option>
                  <option value="RN">RN - Rio Grande do Norte</option>
                  <option value="RS">RS - Rio Grande do Sul</option>
                  <option value="RO">RO - Rondônia</option>
                  <option value="RR">RR - Roraima</option>
                  <option value="SC">SC - Santa Catarina</option>
                  <option value="SP">SP - São Paulo</option>
                  <option value="SE">SE - Sergipe</option>
                  <option value="TO">TO - Tocantins</option>
                </select>
              </motion.div>

              {/* Cidade */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.4 }}
              >
                <label className="block font-semibold text-gray-300 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Digite a cidade"
                  className="w-full border border-gray-700 bg-gray-900 text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </motion.div>

              {/* CEP */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.5 }}
                className="col-span-2"
              >
                <label className="block font-semibold text-gray-300 mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="00000-000"
                  className="w-full border border-gray-700 bg-gray-900 text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Informações do Conselho Federal */}
          <CouncilInfo />

          {/* Campos Anatel - Agrupamento e Estilo - seguindo o padrão do DetalheProvedor */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            className="col-span-2 mt-6 p-4 bg-gray-700/50 rounded-xl"
          >
            <h3 className="text-2xl font-bold text-cyan-400 mb-4 border-b border-gray-600 pb-2">
              Anatel
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                ["cnpjAnatel", "Situação CNPJ Anatel"],
                ["situacaoAnatel", "Situação Anatel/Ancine"],
                ["fust", "FUST"],
                ["coletaDeDadosM", "Coleta de Dados Mensal"],
                ["coletaDeDadosEconomicos", "Coleta de Dados Econômicos"],
                ["dadosInfra", "Dados de Infraestrutura"],
                ["registroEstacoes", "Registro de Estações"],
              ].map(([campo, label], index) => (
                <motion.div 
                  key={campo}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 1.4 + index * 0.1 }}
                >
                  <label className="block font-semibold text-gray-300 mb-1 text-sm">
                    {label}
                  </label>
                  <select
                    value={campo === "cnpjAnatel" ? cnpjAnatel :
                           campo === "situacaoAnatel" ? situacaoAnatel :
                           campo === "fust" ? fust :
                           campo === "coletaDeDadosM" ? coletaDeDadosM :
                           campo === "coletaDeDadosEconomicos" ? coletaDeDadosEconomicos :
                           campo === "dadosInfra" ? dadosInfra :
                           campo === "registroEstacoes" ? registroEstacoes : ""}
                    onChange={(e) => {
                      if (campo === "cnpjAnatel") setCnpjAnatel(e.target.value);
                      else if (campo === "situacaoAnatel") setSituacaoAnatel(e.target.value);
                      else if (campo === "fust") setFust(e.target.value);
                      else if (campo === "coletaDeDadosM") setColetaDeDadosM(e.target.value);
                      else if (campo === "coletaDeDadosEconomicos") setColetaDeDadosEconomicos(e.target.value);
                      else if (campo === "dadosInfra") setDadosInfra(e.target.value);
                      else if (campo === "registroEstacoes") setRegistroEstacoes(e.target.value);
                    }}
                    // Aplica cores dinâmicas de acordo com 'regular' ou 'irregular
                    className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${situacaoClass(
                      campo === "cnpjAnatel" ? cnpjAnatel :
                      campo === "situacaoAnatel" ? situacaoAnatel :
                      campo === "fust" ? fust :
                      campo === "coletaDeDadosM" ? coletaDeDadosM :
                      campo === "coletaDeDadosEconomicos" ? coletaDeDadosEconomicos :
                      campo === "dadosInfra" ? dadosInfra :
                      campo === "registroEstacoes" ? registroEstacoes : ""
                    )} bg-gray-900`}
                  >
                    <option value="" disabled>
                      Selecione
                    </option>
                    <option value="regular">Regular</option>
                    <option value="irregular">Irregular</option>
                  </select>
                </motion.div>
              ))}
              
              {/* Campo de Processos Anatel */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 2.1 }}
                className="col-span-full"
              >
                <label className="block font-semibold text-gray-300 mb-1 text-sm">
                  Processos Anatel
                </label>
                <textarea
                  value={processoAnatel}
                  onChange={(e) => setProcessoAnatel(e.target.value)}
                  placeholder="Digite os números dos processos Anatel (separados por vírgula ou quebra de linha)"
                  rows="3"
                  className="w-full border border-gray-600 bg-gray-900 text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 transition"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Observações - seguindo o padrão do DetalheProvedor */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 2.0 }}
            className="col-span-2 mt-2"
          >
            <label className="block font-semibold text-gray-300 mb-1">
              Observações
            </label>
            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Digite observações adicionais"
              rows="3"
              className="w-full border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition bg-gray-900 text-gray-200"
            />
          </motion.div>
        </div>

        {/* Botões - seguindo o padrão do DetalheProvedor */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.8 }}
          className="flex justify-center gap-6 mt-12 pt-6 border-t border-gray-700"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={loading}
            className="bg-cyan-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-cyan-500 transition disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <LoadingDots />
                <span className="ml-2">Adicionando...</span>
              </div>
            ) : (
              "Adicionar Provedor"
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default AddProvedor;
