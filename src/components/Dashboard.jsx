import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { isAdminEmail } from '../config/adminEmails';

const Dashboard = ({ provedores = [], onNavigate }) => {
    const { user, userEmail } = useAuth();
    const isAdmin = isAdminEmail(userEmail);
    const firstName = user?.displayName?.split(' ')[0] || 'Usuário';

    // Stats
    const totalProvedores = provedores.length;
    const ativos = provedores.filter(p => {
        const s = p.statusEmpresa?.toLowerCase();
        return s === 'ativa' || s === 'ativo';
    }).length;
    const inativos = provedores.filter(p => {
        const s = p.statusEmpresa?.toLowerCase();
        return s === 'inativa' || s === 'inativo';
    }).length;
    const comEmailAtivo = provedores.filter(p => p.enviarEmailAutomatico === true).length;
    const comIrregularidade = provedores.filter(p => {
        const campos = ['cnpjAnatel', 'situacaoAnatel', 'fust', 'coletaDeDadosM', 'coletaDeDadosEconomicos', 'dadosInfra', 'registroEstacoes'];
        return campos.some(c => {
            const v = p[c]?.toLowerCase();
            return v === 'irregular' || v === 'inativa' || v === 'inativo';
        });
    }).length;

    // Últimos provedores cadastrados (3 mais recentes)
    const recentes = [...provedores].slice(0, 3);

    return (
        <div className="min-h-[70vh] p-2 sm:p-6">
            {/* Saudação */}
            <div className="mb-8">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
                    Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{firstName}</span> 👋
                </h2>
                <p className="text-gray-400 text-lg">
                    Aqui está o resumo do seu painel de gestão de provedores.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div
                    className="bg-gray-800/80 border border-gray-700/50 rounded-2xl p-5 hover:border-cyan-500/40 transition-colors cursor-pointer"
                    onClick={() => onNavigate('lista')}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-xl">🏢</span>
                        </div>
                        <span className="text-gray-400 text-sm font-medium">Total</span>
                    </div>
                    <p className="text-3xl font-extrabold text-white">{totalProvedores}</p>
                    <p className="text-gray-500 text-xs mt-1">provedores cadastrados</p>
                </div>

                <div className="bg-gray-800/80 border border-gray-700/50 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-xl">✅</span>
                        </div>
                        <span className="text-gray-400 text-sm font-medium">Ativos</span>
                    </div>
                    <p className="text-3xl font-extrabold text-green-400">{ativos}</p>
                    <p className="text-gray-500 text-xs mt-1">em operação regular</p>
                </div>

                <div className="bg-gray-800/80 border border-gray-700/50 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-xl">⚠️</span>
                        </div>
                        <span className="text-gray-400 text-sm font-medium">Inativos</span>
                    </div>
                    <p className="text-3xl font-extrabold text-red-400">{inativos}</p>
                    <p className="text-gray-500 text-xs mt-1">situação irregular</p>
                </div>

                <div className="bg-gray-800/80 border border-gray-700/50 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-xl">📧</span>
                        </div>
                        <span className="text-gray-400 text-sm font-medium">Email ativo</span>
                    </div>
                    <p className="text-3xl font-extrabold text-blue-400">{comEmailAtivo}</p>
                    <p className="text-gray-500 text-xs mt-1">com envio automático</p>
                </div>
            </div>

            {/* Alerta de irregularidades */}
            {comIrregularidade > 0 && (
                <div
                    className="mb-8 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:bg-yellow-500/15 transition-colors"
                    onClick={() => onNavigate('lista')}
                >
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">🔔</span>
                    </div>
                    <div>
                        <h3 className="text-yellow-400 font-semibold text-base">Atenção</h3>
                        <p className="text-yellow-300/80 text-sm">
                            Você possui <strong>{comIrregularidade}</strong> provedor{comIrregularidade > 1 ? 'es' : ''} com pendências regulatórias. Clique para verificar.
                        </p>
                    </div>
                    <span className="text-yellow-400 ml-auto text-lg">→</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ações rápidas */}
                <div className="lg:col-span-1">
                    <h3 className="text-lg font-bold text-white mb-4">Ações rápidas</h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => onNavigate('add')}
                            className="w-full flex items-center gap-4 bg-gray-800/80 border border-gray-700/50 rounded-xl p-4 hover:border-cyan-500/40 hover:bg-gray-800 transition-all text-left group"
                        >
                            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                                <span className="text-lg">➕</span>
                            </div>
                            <div>
                                <p className="text-white font-semibold text-sm">Adicionar Provedor</p>
                                <p className="text-gray-500 text-xs">Cadastrar novo provedor</p>
                            </div>
                        </button>

                        <button
                            onClick={() => onNavigate('lista')}
                            className="w-full flex items-center gap-4 bg-gray-800/80 border border-gray-700/50 rounded-xl p-4 hover:border-cyan-500/40 hover:bg-gray-800 transition-all text-left group"
                        >
                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                                <span className="text-lg">📋</span>
                            </div>
                            <div>
                                <p className="text-white font-semibold text-sm">Ver Provedores</p>
                                <p className="text-gray-500 text-xs">Acessar lista completa</p>
                            </div>
                        </button>

                        {isAdmin && (
                            <button
                                onClick={() => onNavigate('admin')}
                                className="w-full flex items-center gap-4 bg-gray-800/80 border border-gray-700/50 rounded-xl p-4 hover:border-purple-500/40 hover:bg-gray-800 transition-all text-left group"
                            >
                                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                                    <span className="text-lg">👑</span>
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-sm">Painel Admin</p>
                                    <p className="text-gray-500 text-xs">Gerenciar usuários</p>
                                </div>
                            </button>
                        )}
                    </div>
                </div>

                {/* Provedores recentes */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">Últimos cadastrados</h3>
                        {totalProvedores > 3 && (
                            <button
                                onClick={() => onNavigate('lista')}
                                className="text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors"
                            >
                                Ver todos →
                            </button>
                        )}
                    </div>

                    {recentes.length > 0 ? (
                        <div className="space-y-3">
                            {recentes.map((p) => {
                                const isAtivo = p.statusEmpresa?.toLowerCase() === 'ativa' || p.statusEmpresa?.toLowerCase() === 'ativo';
                                return (
                                    <div
                                        key={p.id}
                                        className="flex items-center gap-4 bg-gray-800/80 border border-gray-700/50 rounded-xl p-4 hover:border-cyan-500/30 transition-colors"
                                    >
                                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isAtivo ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-semibold text-sm truncate">{p.razaoSocial || 'Sem nome'}</p>
                                            <p className="text-gray-500 text-xs">{p.cnpj || 'CNPJ não informado'}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${isAtivo
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {p.statusEmpresa || 'N/A'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-gray-800/80 border border-gray-700/50 rounded-xl p-8 text-center">
                            <div className="text-4xl mb-3">📭</div>
                            <p className="text-gray-400 font-medium mb-1">Nenhum provedor cadastrado</p>
                            <p className="text-gray-600 text-sm mb-4">Comece adicionando seu primeiro provedor.</p>
                            <button
                                onClick={() => onNavigate('add')}
                                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg"
                            >
                                ➕ Adicionar Provedor
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer info */}
            <div className="mt-10 pt-6 border-t border-gray-800 text-center">
                <p className="text-gray-600 text-xs">
                    BridgeAndBits · Gerenciador de Provedores · v1.0
                </p>
            </div>
        </div>
    );
};

export default Dashboard;
