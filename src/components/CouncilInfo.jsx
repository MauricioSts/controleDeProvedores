import React from 'react';
import { motion } from 'framer-motion';
import { useCouncil } from '../contexts/CouncilContext';

const CouncilInfo = () => {
  const { 
    councilInfo, 
    loading, 
    isEditing, 
    saveCouncilInfo, 
    updateCouncilInfo, 
    toggleEdit 
  } = useCouncil();

  const handleSave = async () => {
    const success = await saveCouncilInfo(councilInfo);
    if (success) {
      // Toast de sucesso pode ser adicionado aqui
    }
  };

  const handleCancel = () => {
    // Recarregar dados originais
    window.location.reload();
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="col-span-2 mb-6 p-6 bg-gray-700/50 rounded-xl border border-gray-600"
      >
        <div className="flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full mr-3"
          />
          <span className="text-gray-300">Carregando informações do conselho...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="col-span-2 mb-6 p-6 bg-gray-700/50 rounded-xl border border-gray-600"
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-cyan-400 border-b border-gray-600 pb-2">
          Conselho Federal
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleEdit}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            isEditing 
              ? 'bg-red-600 hover:bg-red-500 text-white' 
              : 'bg-cyan-600 hover:bg-cyan-500 text-white'
          }`}
        >
          {isEditing ? 'Cancelar' : 'Editar'}
        </motion.button>
      </div>

      {/* Campos do Conselho */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Registro no CFT */}
        <div>
          <label className="block font-semibold text-gray-300 mb-1 text-sm">
            Registro no CFT
          </label>
          <input
            type="text"
            value={councilInfo.registroCft}
            onChange={(e) => updateCouncilInfo('registroCft', e.target.value)}
            disabled={!isEditing}
            placeholder="Digite o registro no CFT"
            className={`w-full border rounded-lg px-3 py-2 text-sm transition ${
              isEditing 
                ? 'border-gray-600 bg-gray-900 text-gray-200 focus:ring-2 focus:ring-cyan-500' 
                : 'border-gray-700 bg-gray-800 text-gray-400 cursor-not-allowed'
            }`}
          />
        </div>

        {/* Processos CFT - Sempre editável */}
        <div>
          <label className="block font-semibold text-gray-300 mb-1 text-sm">
            Processos CFT
          </label>
          <input
            type="text"
            value={councilInfo.processosCft}
            onChange={(e) => updateCouncilInfo('processosCft', e.target.value)}
            placeholder="Digite os processos CFT"
            className="w-full border border-gray-600 bg-gray-900 text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 transition"
          />
        </div>
      </div>

      {/* Responsável Técnico - Editável apenas quando em modo de edição */}
      <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
        <h4 className="text-lg font-semibold text-gray-200 mb-2">Responsável Técnico</h4>
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-300 mb-1 text-sm">
                Nome
              </label>
              <input
                type="text"
                value={councilInfo.nome}
                onChange={(e) => updateCouncilInfo('nome', e.target.value)}
                placeholder="Digite o nome"
                className="w-full border border-gray-600 bg-gray-900 text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 transition"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-300 mb-1 text-sm">
                Sobrenome
              </label>
              <input
                type="text"
                value={councilInfo.sobrenome}
                onChange={(e) => updateCouncilInfo('sobrenome', e.target.value)}
                placeholder="Digite o sobrenome"
                className="w-full border border-gray-600 bg-gray-900 text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 transition"
              />
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-300">
            <p><span className="font-medium">Nome:</span> {councilInfo.nome} {councilInfo.sobrenome}</p>
          </div>
        )}
      </div>

      {/* Botões de Ação */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-600"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold transition"
          >
            Cancelar
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition"
          >
            Salvar
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CouncilInfo;
