import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Chaves do AsyncStorage organizadas por entidade e userId
export const KEYS = {
  compras: (userId: string) => `compras_${userId}`,
  historico: (userId: string) => `historico_${userId}`,
  historicoItens: (historicoId: number) => `historico_itens_${historicoId}`,
};

// Mantida para compatibilidade — não faz nada com AsyncStorage,
// mas evita erro em quem ainda chama inicializarBancoLocal() no App.tsx
export async function inicializarBancoLocal() {
  console.log('AsyncStorage pronto — sem necessidade de inicialização.');
}

export default KEYS;
