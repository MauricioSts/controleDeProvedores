import { useState, useEffect } from 'react';

const STORAGE_KEY = 'remembered_emails';

export const useRememberedEmails = () => {
  const [rememberedEmails, setRememberedEmails] = useState([]);

  // Carregar emails salvos do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const emails = JSON.parse(saved);
        setRememberedEmails(emails);
      }
    } catch (error) {
      console.error('Erro ao carregar emails salvos:', error);
    }
  }, []);

  // Salvar email
  const saveEmail = (email) => {
    if (!email || !email.trim()) return;
    
    const emailLower = email.toLowerCase().trim();
    const updatedEmails = [
      emailLower,
      ...rememberedEmails.filter(e => e !== emailLower)
    ].slice(0, 5); // Manter apenas os 5 mais recentes
    
    setRememberedEmails(updatedEmails);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEmails));
  };

  // Remover email
  const removeEmail = (email) => {
    const emailLower = email.toLowerCase().trim();
    const updatedEmails = rememberedEmails.filter(e => e !== emailLower);
    setRememberedEmails(updatedEmails);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEmails));
  };

  // Limpar todos os emails
  const clearAllEmails = () => {
    setRememberedEmails([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    rememberedEmails,
    saveEmail,
    removeEmail,
    clearAllEmails
  };
};

