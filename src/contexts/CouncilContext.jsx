import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

const CouncilContext = createContext();

export const useCouncil = () => {
  const context = useContext(CouncilContext);
  if (!context) {
    throw new Error('useCouncil deve ser usado dentro de um CouncilProvider');
  }
  return context;
};

export const CouncilProvider = ({ children }) => {
  const { userId, user } = useAuth();
  const [councilInfo, setCouncilInfo] = useState({
    nome: '',
    sobrenome: '',
    registroCft: '',
    processosCft: 'N/A'
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Carregar informações do conselho
  useEffect(() => {
    const loadCouncilInfo = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const councilRef = doc(db, 'councilInfo', userId);
        const councilSnap = await getDoc(councilRef);

        if (councilSnap.exists()) {
          const data = councilSnap.data();
          setCouncilInfo(data);
        } else {
          // Se não existe, criar com dados básicos do usuário
          const defaultInfo = {
            nome: user?.displayName?.split(' ')[0] || '',
            sobrenome: user?.displayName?.split(' ').slice(1).join(' ') || '',
            registroCft: '',
            processosCft: 'N/A'
          };
          setCouncilInfo(defaultInfo);
        }
      } catch (error) {
        console.error('Erro ao carregar informações do conselho:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCouncilInfo();
  }, [userId, user]);

  // Salvar informações do conselho
  const saveCouncilInfo = async (newInfo) => {
    if (!userId) return;

    try {
      const councilRef = doc(db, 'councilInfo', userId);
      await setDoc(councilRef, newInfo, { merge: true });
      setCouncilInfo(newInfo);
      setIsEditing(false);
      return true;
    } catch (error) {
      console.error('Erro ao salvar informações do conselho:', error);
      return false;
    }
  };

  // Atualizar informações do conselho
  const updateCouncilInfo = (field, value) => {
    setCouncilInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Alternar modo de edição
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const value = {
    councilInfo,
    loading,
    isEditing,
    saveCouncilInfo,
    updateCouncilInfo,
    toggleEdit
  };

  return (
    <CouncilContext.Provider value={value}>
      {children}
    </CouncilContext.Provider>
  );
};
