import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { isAdminEmail, getAdminInfo, canRemoveAdmins, isPrimaryAdmin, canViewAllProviders } from '../config/adminEmails';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const { getAllUsers, getPendingUsers, getAuthorizedUsers, authorizeUser, getUserProviders, getAllProviders, deleteUser, userEmail } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [authorizedUsers, setAuthorizedUsers] = useState([]);
  const [allProviders, setAllProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedUsers, setExpandedUsers] = useState({});
  const [userProviders, setUserProviders] = useState({});
  const [loadingProviders, setLoadingProviders] = useState({});

  const isAdmin = isAdminEmail(userEmail);
  const canViewAll = canViewAllProviders(userEmail);
  const canRemove = canRemoveAdmins(userEmail);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      if (canViewAll) {
        // Admin primário: carrega todos os dados
        const [all, pending, authorized, providers] = await Promise.all([
          getAllUsers(),
          getPendingUsers(),
          getAuthorizedUsers(),
          getAllProviders()
        ]);
        setAllUsers(all);
        setPendingUsers(pending);
        setAuthorizedUsers(authorized);
        setAllProviders(providers);
      } else {
        // Admin secundário: carrega dados básicos e quantidade de provedores por usuário
        const [all, pending, authorized] = await Promise.all([
          getAllUsers(),
          getPendingUsers(),
          getAuthorizedUsers()
        ]);
        
        // Para cada usuário, buscar apenas a quantidade de provedores
        const usersWithProviderCount = await Promise.all(
          all.map(async (user) => {
            const userProviders = await getUserProviders(user.id);
            return {
              ...user,
              providerCount: userProviders.length
            };
          })
        );
        
        setAllUsers(usersWithProviderCount);
        setPendingUsers(pending);
        setAuthorizedUsers(authorized);
        setAllProviders([]); // Não carrega todos os provedores
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingUsers = async () => {
    try {
      const users = await getPendingUsers();
      setPendingUsers(users);
    } catch (error) {
      console.error('Erro ao carregar usuários pendentes:', error);
      toast.error('Erro ao carregar usuários pendentes');
    }
  };

  const handleAuthorize = async (userId, isAuthorized) => {
    try {
      setActionLoading(userId);
      const success = await authorizeUser(userId, isAuthorized);
      
      if (success) {
        // Recarregar todas as listas
        await loadUsers();
      }
    } catch (error) {
      console.error('Erro ao autorizar usuário:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    // Verificar se o usuário a ser deletado é um administrador
    if (isAdminEmail(userEmail)) {
      // Verificar se o usuário atual pode remover administradores
      if (!canRemove) {
        toast.error('Você não tem permissão para remover administradores');
        return;
      }
      
      // Verificar se está tentando remover o administrador primário
      if (isPrimaryAdmin(userEmail)) {
        toast.error('Este administrador não pode ser removido');
        return;
      }
      
      // Confirmar exclusão de administrador
      if (!window.confirm(`ATENÇÃO: Você está prestes a remover um administrador (${userEmail}). Esta ação não pode ser desfeita. Tem certeza?`)) {
        return;
      }
    } else {
      // Confirmação normal para usuários comuns
      if (!window.confirm(`Tem certeza que deseja excluir o usuário ${userEmail}? Esta ação não pode ser desfeita.`)) {
        return;
      }
    }

    try {
      setActionLoading(userId);
      const success = await deleteUser(userId, userEmail);
      
      if (success) {
        // Recarregar todas as listas
        await loadUsers();
        toast.success('Usuário removido com sucesso');
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Erro ao excluir usuário');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleUserExpansion = async (userId) => {
    const isExpanded = expandedUsers[userId];
    
    if (isExpanded) {
      // Fechar
      setExpandedUsers(prev => ({ ...prev, [userId]: false }));
    } else {
      // Abrir e carregar provedores
      setExpandedUsers(prev => ({ ...prev, [userId]: true }));
      
      if (!userProviders[userId]) {
        setLoadingProviders(prev => ({ ...prev, [userId]: true }));
        try {
          const providers = await getUserProviders(userId);
          
          if (canViewAll) {
            // Admin primário: mostra todos os detalhes
            setUserProviders(prev => ({ ...prev, [userId]: providers }));
          } else {
            // Admin secundário: mostra apenas informações básicas (sem dados sensíveis)
            const basicProviders = providers.map(provider => ({
              id: provider.id,
              razaoSocial: provider.razaoSocial,
              cnpj: provider.cnpj,
              regime: provider.regime,
              numeroFiscal: provider.numeroFiscal,
              statusEmpresa: provider.statusEmpresa,
              createdAt: provider.createdAt,
              // Não inclui dados do representante legal ou outras informações sensíveis
            }));
            setUserProviders(prev => ({ ...prev, [userId]: basicProviders }));
          }
        } catch (error) {
          console.error('Erro ao carregar provedores:', error);
          toast.error('Erro ao carregar provedores do usuário');
        } finally {
          setLoadingProviders(prev => ({ ...prev, [userId]: false }));
        }
      }
    }
  };

  // Carregar provedores de todos os usuários para mostrar contadores
  useEffect(() => {
    if (allUsers.length > 0) {
      const loadAllUserProviders = async () => {
        const providersPromises = allUsers.map(async (user) => {
          try {
            const providers = await getUserProviders(user.id);
            return { userId: user.id, providers };
          } catch (error) {
            console.error(`Erro ao carregar provedores do usuário ${user.id}:`, error);
            return { userId: user.id, providers: [] };
          }
        });

        const results = await Promise.all(providersPromises);
        const providersMap = {};
        results.forEach(({ userId, providers }) => {
          providersMap[userId] = providers;
        });
        setUserProviders(providersMap);
      };

      loadAllUserProviders();
    }
  }, [allUsers]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('pt-BR');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-lg w-full border border-gray-700/50 text-center"
        >
          <div className="text-red-400 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-white mb-4">Acesso Negado</h2>
          <p className="text-gray-300">
            Você não tem permissão para acessar esta área administrativa.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-white mb-2">Gerenciamento de Usuários</h1>
            <p className="text-gray-300">Autorize ou negue acesso aos usuários do sistema</p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-6 rounded-xl border border-blue-500/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <p className="text-blue-300 text-sm">Total Usuários</p>
                <p className="text-2xl font-bold text-white">{allUsers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-6 rounded-xl border border-yellow-500/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
              <div>
                <p className="text-yellow-300 text-sm">Aguardando</p>
                <p className="text-2xl font-bold text-white">{pendingUsers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-6 rounded-xl border border-green-500/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <p className="text-green-300 text-sm">Autorizados</p>
                <p className="text-2xl font-bold text-white">{authorizedUsers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 rounded-xl border border-purple-500/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏢</span>
              </div>
              <div>
                <p className="text-purple-300 text-sm">
                  Total Provedores
                </p>
                <p className="text-2xl font-bold text-white">
                  {canViewAll ? allProviders.length : allUsers.reduce((total, user) => total + (user.providerCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Users List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-700/50">
            <h2 className="text-2xl font-bold text-white">Todos os Usuários</h2>
            <p className="text-gray-300 mt-1">Gerencie todos os usuários do sistema</p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-gray-300">Carregando usuários...</p>
            </div>
          ) : allUsers.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum usuário encontrado</h3>
              <p className="text-gray-300">Não há usuários cadastrados no sistema.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700/50">
              <AnimatePresence>
                {allUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 hover:bg-gray-700/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {user.displayName || 'Usuário'}
                          </h3>
                          <p className="text-gray-300">{user.email}</p>
                          <p className="text-sm text-gray-400">
                            Criado em: {formatDate(user.createdAt)}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <span>🏢</span>
                              <span>Provedores: {userProviders[user.id]?.length || 0}</span>
                            </div>
                            {user.requestCount > 0 && (
                              <div className="flex items-center gap-1 text-xs text-yellow-400">
                                <span>📝</span>
                                <span>Solicitações: {user.requestCount}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Status Badge */}
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isAdminEmail(user.email)
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : user.isAuthorized 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : user.pendingAuthorization
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {isAdminEmail(user.email) 
                            ? '👑 Admin'
                            : user.isAuthorized 
                            ? 'Autorizado' 
                            : user.pendingAuthorization 
                            ? 'Pendente' 
                            : 'Não autorizado'
                          }
                        </div>

                        {/* Toggle Provedores Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleUserExpansion(user.id)}
                          className="px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30 transition-colors"
                        >
                          {expandedUsers[user.id] ? 'Ocultar Provedores' : 'Ver Provedores'}
                        </motion.button>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {!user.isAuthorized ? (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleAuthorize(user.id, true)}
                              disabled={actionLoading === user.id}
                              className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === user.id ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full"
                                />
                              ) : (
                                'Autorizar'
                              )}
                            </motion.button>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleAuthorize(user.id, false)}
                              disabled={actionLoading === user.id || isAdminEmail(user.email)}
                              className={`px-4 py-2 border rounded-lg transition-colors disabled:opacity-50 ${
                                isAdminEmail(user.email)
                                  ? 'bg-gray-500/20 text-gray-400 border-gray-500/30 cursor-not-allowed'
                                  : 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
                              }`}
                              title={isAdminEmail(user.email) ? 'Administradores não podem ser desautorizados' : ''}
                            >
                              {actionLoading === user.id ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full"
                                />
                              ) : (
                                'Desautorizar'
                              )}
                            </motion.button>
                          )}

                          {/* Botão de Excluir */}
                          {(!isAdminEmail(user.email) || (isAdminEmail(user.email) && canRemoveAdmins(userEmail) && !isPrimaryAdmin(user.email))) && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              disabled={actionLoading === user.id}
                              className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-colors disabled:opacity-50"
                              title="Excluir usuário permanentemente"
                            >
                              {actionLoading === user.id ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full"
                                />
                              ) : (
                                '🗑️'
                              )}
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Seção Expandível de Provedores */}
                    <AnimatePresence>
                      {expandedUsers[user.id] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-700/50 bg-gray-700/30"
                        >
                          <div className="p-6">
                            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                              <span>🏢</span>
                              {canViewAll ? 'Provedores do Usuário' : 'Informações Básicas dos Provedores'}
                              {!canViewAll && (
                                <span className="text-xs text-blue-400 ml-2">
                                  (Dados limitados)
                                </span>
                              )}
                            </h4>
                            
                            {loadingProviders[user.id] ? (
                              <div className="flex items-center justify-center py-8">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full mr-3"
                                />
                                <span className="text-gray-300">Carregando provedores...</span>
                              </div>
                            ) : userProviders[user.id] && userProviders[user.id].length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {userProviders[user.id].map((provider, index) => (
                                  <motion.div
                                    key={provider.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-gray-800/50 p-4 rounded-lg border border-gray-600/50 hover:border-cyan-500/30 transition-colors"
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <h5 className="font-semibold text-white text-sm truncate">
                                        {provider.razaoSocial || 'Nome não informado'}
                                      </h5>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        provider.statusEmpresa?.toLowerCase() === 'ativa' || provider.statusEmpresa?.toLowerCase() === 'ativo'
                                          ? 'bg-green-500/20 text-green-400'
                                          : provider.statusEmpresa?.toLowerCase() === 'inativa' || provider.statusEmpresa?.toLowerCase() === 'inativo'
                                          ? 'bg-red-500/20 text-red-400'
                                          : 'bg-gray-500/20 text-gray-400'
                                      }`}>
                                        {provider.statusEmpresa || 'N/A'}
                                      </span>
                                    </div>
                                    
                                    <div className="space-y-1 text-xs text-gray-300">
                                      <p><strong>CNPJ:</strong> {provider.cnpj || 'N/A'}</p>
                                      <p><strong>Regime:</strong> {provider.regime || 'N/A'}</p>
                                      <p><strong>Nº Fiscal:</strong> {provider.numeroFiscal || 'N/A'}</p>
                                      {provider.createdAt && (
                                        <p className="text-gray-400 text-xs">
                                          Criado: {formatDate(provider.createdAt)}
                                        </p>
                                      )}
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <div className="text-4xl mb-2">📭</div>
                                <p className="text-gray-400">Este usuário não possui provedores cadastrados</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Refresh Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadUsers}
            disabled={loading}
            className="px-6 py-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full"
              />
            ) : (
              'Atualizar Lista'
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default UserManagement;
