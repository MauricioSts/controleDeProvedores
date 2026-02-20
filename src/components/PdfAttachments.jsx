import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
    uploadPdf,
    listPdfs,
    deletePdf,
    downloadBase64Pdf,
    formatFileSize,
    getLastNMonthKeys,
} from "../utils/pdfStorage";

const MONTH_NAMES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/** Converte "YYYY-MM" para rótulo legível, ex: "Fev 2026" */
const monthKeyToLabel = (key, short = false) => {
    const [year, month] = key.split("-").map(Number);
    const name = MONTH_NAMES[month - 1];
    return short ? `${name.slice(0, 3)}` : `${name} ${year}`;
};

/**
 * Componente de gerenciamento de PDFs para um provedor.
 * Os arquivos são salvos no Firestore (sem Firebase Storage, sem CORS).
 * Suporta abas de mês para organizar documentos por período.
 * @param {string} provedorId - ID do provedor no Firestore
 */
function PdfAttachments({ provedorId }) {
    // Janela dos últimos 6 meses (mais recente = último da lista)
    const last6 = getLastNMonthKeys(6);
    const currentMonthKey = last6[last6.length - 1]; // mês atual

    const [activeMonth, setActiveMonth] = useState(currentMonthKey);
    const [pdfs, setPdfs] = useState([]);
    const [allCounts, setAllCounts] = useState({}); // { "YYYY-MM": count }
    const [loadingList, setLoadingList] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [deletingId, setDeletingId] = useState(null);
    const fileInputRef = useRef(null);

    // Carrega contagem de todos os meses e lista do mês ativo
    useEffect(() => {
        if (!provedorId) return;
        loadAllCounts();
    }, [provedorId]);

    useEffect(() => {
        if (!provedorId) return;
        loadPdfs();
    }, [provedorId, activeMonth]);

    const loadAllCounts = async () => {
        try {
            // Busca todos os documentos (sem filtro) para montar contagens por mês
            const all = await listPdfs(provedorId, null);
            const counts = {};
            all.forEach((pdf) => {
                if (pdf.month) {
                    counts[pdf.month] = (counts[pdf.month] || 0) + 1;
                }
            });
            setAllCounts(counts);
        } catch {
            // silencioso — contagens são opcionais
        }
    };

    const loadPdfs = async () => {
        setLoadingList(true);
        try {
            const list = await listPdfs(provedorId, activeMonth);
            setPdfs(list);
        } catch {
            toast.error("Erro ao carregar documentos.");
        } finally {
            setLoadingList(false);
        }
    };

    const handleFileSelected = async (file) => {
        if (!file) return;
        setUploading(true);
        setUploadProgress(0);

        try {
            const result = await uploadPdf(provedorId, file, (progress) => {
                setUploadProgress(progress);
            }, activeMonth);

            setPdfs((prev) => [result, ...prev]);
            setAllCounts((prev) => ({
                ...prev,
                [activeMonth]: (prev[activeMonth] || 0) + 1,
            }));
            toast.success(`"${file.name}" salvo em ${activeMonthLabel()}! 📎`);
        } catch (err) {
            toast.error(err.message || "Erro ao salvar o arquivo.");
        } finally {
            setUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleInputChange = (e) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelected(file);
    };

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFileSelected(file);
        },
        [provedorId, activeMonth]
    );

    const handleDelete = async (pdf) => {
        setDeletingId(pdf.id);
        try {
            await deletePdf(provedorId, pdf.id);
            setPdfs((prev) => prev.filter((p) => p.id !== pdf.id));
            setAllCounts((prev) => ({
                ...prev,
                [activeMonth]: Math.max(0, (prev[activeMonth] || 1) - 1),
            }));
            toast.success(`"${pdf.originalName}" removido.`);
        } catch {
            toast.error("Erro ao remover o arquivo.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleDownload = (pdf) => {
        try {
            downloadBase64Pdf(pdf.data, pdf.originalName);
        } catch {
            toast.error("Erro ao baixar o arquivo.");
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return "—";
        try {
            return new Date(isoString).toLocaleString("pt-BR");
        } catch {
            return "—";
        }
    };

    /** Rótulo legível do mês ativo, ex: "Fevereiro 2026" */
    const activeMonthLabel = () => {
        const [year, month] = activeMonth.split("-").map(Number);
        return `${MONTH_NAMES[month - 1]} ${year}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="col-span-2 mt-6 p-6 bg-gray-700/50 rounded-xl border-l-4 border-orange-500"
        >
            {/* Cabeçalho */}
            <div className="flex items-center justify-between mb-4 border-b border-gray-600 pb-3">
                <h3 className="text-2xl font-bold text-orange-400 flex items-center gap-2">
                    📎 Documentos Anexos
                </h3>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">
                        {pdfs.length} {pdfs.length === 1 ? "documento" : "documentos"} em {activeMonthLabel()}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
                        máx. 700 KB/arquivo
                    </span>
                </div>
            </div>

            {/* ── Abas dos Últimos 6 Meses ── */}
            <div className="mb-5 overflow-x-auto">
                <div className="flex gap-1.5 min-w-max pb-1">
                    {last6.map((key) => {
                        const isActive = activeMonth === key;
                        const count = allCounts[key] || 0;
                        const [year, month] = key.split("-").map(Number);
                        return (
                            <motion.button
                                key={key}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveMonth(key)}
                                className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap
                                    ${isActive
                                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                                        : "bg-gray-800/70 text-gray-400 hover:bg-gray-700 hover:text-gray-200 border border-gray-700"
                                    }`}
                            >
                                {monthKeyToLabel(key, true)}
                                <span className="ml-1 text-[10px] opacity-60">{year}</span>
                                {count > 0 && (
                                    <span
                                        className={`ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold
                                            ${isActive ? "bg-white/30 text-white" : "bg-orange-500/80 text-white"}`}
                                    >
                                        {count}
                                    </span>
                                )}
                            </motion.button>
                        );
                    })}
                    <span className="self-center ml-2 text-xs text-gray-600 italic">(últimos 6 meses)</span>
                </div>
            </div>

            {/* Área de Upload (Drag & Drop) */}
            <motion.div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
                whileHover={!uploading ? { scale: 1.01 } : {}}
                className={`relative border-2 border-dashed rounded-xl p-8 mb-6 text-center transition-all duration-300 cursor-pointer select-none
          ${isDragging
                        ? "border-orange-400 bg-orange-500/10 scale-[1.01]"
                        : uploading
                            ? "border-gray-600 bg-gray-800/50 cursor-not-allowed"
                            : "border-gray-600 bg-gray-800/30 hover:border-orange-400/60 hover:bg-orange-500/5"
                    }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={handleInputChange}
                    disabled={uploading}
                />

                <AnimatePresence mode="wait">
                    {uploading ? (
                        <motion.div
                            key="progress"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <div className="text-3xl">⏳</div>
                            <p className="text-gray-300 font-medium">Salvando arquivo em {activeMonthLabel()}...</p>
                            <div className="w-full max-w-xs bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${uploadProgress}%` }}
                                    transition={{ ease: "easeOut", duration: 0.3 }}
                                />
                            </div>
                            <p className="text-orange-400 font-bold text-sm">
                                {uploadProgress}%
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-3"
                        >
                            <motion.div
                                animate={
                                    isDragging
                                        ? { scale: 1.2, rotate: 5 }
                                        : { scale: 1, rotate: 0 }
                                }
                                transition={{ type: "spring", stiffness: 300 }}
                                className="text-4xl"
                            >
                                {isDragging ? "📂" : "📄"}
                            </motion.div>
                            <p className="text-gray-300 font-medium">
                                {isDragging
                                    ? "Solte o arquivo aqui!"
                                    : `Arraste um PDF ou clique para adicionar em ${activeMonthLabel()}`}
                            </p>
                            <p className="text-gray-500 text-sm">
                                Apenas arquivos .PDF • Máximo 700 KB
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Lista de PDFs */}
            <div>
                {loadingList ? (
                    <div className="flex items-center justify-center py-8 gap-3">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full"
                        />
                        <span className="text-gray-400 text-sm">
                            Carregando documentos de {activeMonthLabel()}...
                        </span>
                    </div>
                ) : pdfs.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-8"
                    >
                        <div className="text-4xl mb-2">📭</div>
                        <p className="text-gray-400 text-sm">
                            Nenhum documento em <span className="text-orange-400 font-semibold">{activeMonthLabel()}</span>.
                        </p>
                        <p className="text-gray-600 text-xs mt-1">
                            Arraste um PDF ou clique na área acima para adicionar.
                        </p>
                    </motion.div>
                ) : (
                    <AnimatePresence>
                        <div className="flex flex-col gap-3">
                            {pdfs.map((pdf, index) => (
                                <motion.div
                                    key={pdf.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center gap-4 bg-gray-800/60 border border-gray-700/60 rounded-xl px-4 py-3
                             hover:border-orange-500/30 hover:bg-gray-800 transition-all duration-200"
                                >
                                    {/* Ícone */}
                                    <div className="w-10 h-10 flex-shrink-0 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                        <span className="text-xl">📄</span>
                                    </div>

                                    {/* Informações */}
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className="text-gray-200 font-medium text-sm truncate"
                                            title={pdf.originalName}
                                        >
                                            {pdf.originalName}
                                        </p>
                                        <p className="text-gray-500 text-xs mt-0.5">
                                            {formatFileSize(pdf.size)} • {formatDate(pdf.uploadedAt)}
                                        </p>
                                    </div>

                                    {/* Ações */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {/* Download */}
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleDownload(pdf)}
                                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400
                                 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors"
                                            title="Baixar arquivo"
                                        >
                                            ⬇️
                                        </motion.button>

                                        {/* Remover */}
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleDelete(pdf)}
                                            disabled={deletingId === pdf.id}
                                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-500/20 text-red-400
                                 border border-red-500/30 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                            title="Remover arquivo"
                                        >
                                            {deletingId === pdf.id ? (
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{
                                                        duration: 0.8,
                                                        repeat: Infinity,
                                                        ease: "linear",
                                                    }}
                                                    className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full"
                                                />
                                            ) : (
                                                "🗑️"
                                            )}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                )}
            </div>
        </motion.div>
    );
}

export default PdfAttachments;
