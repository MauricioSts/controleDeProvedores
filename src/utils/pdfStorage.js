/**
 * Gerenciamento de PDFs anexados a provedores via Firestore.
 * Os arquivos são convertidos para base64 e salvos como documentos
 * na subcoleção: provedores/{provedorId}/attachments
 *
 * Vantagem: sem Firebase Storage, sem CORS, funciona em localhost e produção.
 * Limitação: arquivos devem ter menos de ~700 KB (limite Firestore: 1 MB/doc).
 */

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * Retorna os últimos N meses em formato "YYYY-MM" (inclusive o mês atual).
 * Ex: getLast6MonthKeys(6) em fev/2026 → ["2025-09","2025-10",...,"2026-02"]
 */
export const getLastNMonthKeys = (n = 6) => {
    const now = new Date();
    const result = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        result.push(key);
    }
    return result;
};

/**
 * Remove documentos cujo campo `month` está fora dos últimos N meses.
 * Chamado automaticamente após cada upload.
 */
export const cleanupOldPdfs = async (provedorId, keepMonths = 6) => {
    try {
        const allowed = new Set(getLastNMonthKeys(keepMonths));
        const snapshot = await getDocs(
            collection(db, "provedores", provedorId, "attachments")
        );
        const deletions = snapshot.docs
            .filter((d) => {
                const m = d.data().month;
                // Remove se tiver mês definido e estiver fora da janela permitida
                return m && !allowed.has(m);
            })
            .map((d) => deleteDoc(doc(db, "provedores", provedorId, "attachments", d.id)));
        if (deletions.length > 0) {
            await Promise.all(deletions);
            console.info(`[pdfStorage] ${deletions.length} documento(s) antigo(s) removido(s).`);
        }
    } catch (err) {
        console.warn("[pdfStorage] Falha na limpeza automática:", err);
    }
};

const MAX_FILE_SIZE_BYTES = 700 * 1024; // 700 KB

/**
 * Converte um File para base64 (sem o prefixo data URI).
 */
const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

/**
 * Valida o arquivo antes do upload.
 */
const validateFile = (file) => {
    if (file.type !== "application/pdf") {
        throw new Error("Apenas arquivos PDF são aceitos.");
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(
            "O arquivo excede o limite de 700 KB. Use arquivos menores."
        );
    }
};

/**
 * Faz upload de um PDF para o Firestore (como base64).
 * @param {string} provedorId
 * @param {File} file
 * @param {function} onProgress - callback de progresso (0-100)
 * @returns {Promise<{id, originalName, data, size, uploadedAt}>}
 */
export const uploadPdf = async (provedorId, file, onProgress = null, month = null) => {
    validateFile(file);

    if (onProgress) onProgress(20);
    const base64 = await fileToBase64(file);
    if (onProgress) onProgress(70);

    const docRef = await addDoc(
        collection(db, "provedores", provedorId, "attachments"),
        {
            originalName: file.name,
            data: base64,
            size: file.size,
            uploadedAt: serverTimestamp(),
            month: month || null,
        }
    );

    if (onProgress) onProgress(100);

    // Limpeza automática em background (não bloqueia o upload)
    cleanupOldPdfs(provedorId, 6).catch(() => { });

    return {
        id: docRef.id,
        originalName: file.name,
        data: base64,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        month: month || null,
    };
};

/**
 * Lista todos os PDFs de um provedor.
 * @param {string} provedorId
 * @returns {Promise<Array<{id, originalName, data, size, uploadedAt}>>}
 */
export const listPdfs = async (provedorId, month = null) => {
    const snapshot = await getDocs(
        collection(db, "provedores", provedorId, "attachments")
    );

    return snapshot.docs
        .map((d) => ({
            id: d.id,
            ...d.data(),
            uploadedAt:
                d.data().uploadedAt?.toDate?.().toISOString() ||
                new Date().toISOString(),
        }))
        .filter((d) => {
            if (!month) return true; // sem filtro — retorna todos
            return d.month === month;
        })
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
};

/**
 * Remove um PDF do Firestore.
 * @param {string} provedorId
 * @param {string} docId - ID do documento Firestore
 */
export const deletePdf = async (provedorId, docId) => {
    await deleteDoc(doc(db, "provedores", provedorId, "attachments", docId));
};

/**
 * Gera um blob URL temporário a partir do base64 para download no browser.
 * @param {string} base64 - apenas os dados, sem prefixo data URI
 * @param {string} fileName
 */
export const downloadBase64Pdf = (base64, fileName) => {
    const byteChars = atob(base64);
    const byteArray = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
        byteArray[i] = byteChars.charCodeAt(i);
    }
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
};

/**
 * Formata o tamanho de arquivo em formato legível.
 */
export const formatFileSize = (bytes) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
