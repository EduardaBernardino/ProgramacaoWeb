import AsyncStorage from '@react-native-async-storage/async-storage';
import { KEYS } from './database';

export interface ItemCompra {
  id?: number;
  userId: string;
  nome: string;
  fotoUrl: string;
  precoUnitario: number;
  quantidade: number;
  totalItem: number;
}

export interface HistoricoCompra {
  id?: number;
  userId: string;
  dataCompra: string;
  totalCompra: number;
  quantidadeItens: number;
  divergencia: number;
}

export interface HistoricoItem {
  id?: number;
  historicoId: number;
  nome: string;
  precoUnitario: number;
  quantidade: number;
  totalItem: number;
}

const gerarId = (): number => Date.now() + Math.floor(Math.random() * 1000);

export const compraService = {

  // --- CARRINHO ATIVO ---

  salvarItemLocal: async (item: ItemCompra): Promise<void> => {
    const key = KEYS.compras(item.userId);
    const raw = await AsyncStorage.getItem(key);
    const lista: ItemCompra[] = raw ? JSON.parse(raw) : [];
    lista.push({ ...item, id: gerarId() });
    await AsyncStorage.setItem(key, JSON.stringify(lista));
  },

  listarItensPorUsuario: async (userId: string): Promise<ItemCompra[]> => {
    try {
      const key = KEYS.compras(userId);
      const raw = await AsyncStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.error('Erro ao listar itens:', error);
      return [];
    }
  },

  // CORRIGIDO: recebe userId diretamente para buscar na chave certa
  excluirItemLocal: async (id: number, userId: string): Promise<void> => {
    const key = KEYS.compras(userId);
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return;
    const lista: ItemCompra[] = JSON.parse(raw);
    const nova = lista.filter(item => item.id !== id);
    await AsyncStorage.setItem(key, JSON.stringify(nova));
  },

  // CORRIGIDO: recebe userId diretamente
  atualizarQuantidadeLocal: async (
      id: number,
      novaQtd: number,
      precoUnitario: number,
      userId: string
  ): Promise<void> => {
    const key = KEYS.compras(userId);
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return;
    const lista: ItemCompra[] = JSON.parse(raw);
    const nova = lista.map(item =>
        item.id === id
            ? { ...item, quantidade: novaQtd, totalItem: novaQtd * precoUnitario }
            : item
    );
    await AsyncStorage.setItem(key, JSON.stringify(nova));
  },

  limparListaUsuario: async (userId: string): Promise<void> => {
    await AsyncStorage.removeItem(KEYS.compras(userId));
  },

  // --- HISTÓRICO ---

  salvarHistoricoCompra: async (historico: HistoricoCompra): Promise<number> => {
    const key = KEYS.historico(historico.userId);
    const raw = await AsyncStorage.getItem(key);
    const lista: HistoricoCompra[] = raw ? JSON.parse(raw) : [];
    const id = gerarId();
    lista.push({ ...historico, id });
    await AsyncStorage.setItem(key, JSON.stringify(lista));
    return id;
  },

  listarHistoricoAsync: async (userId: string): Promise<HistoricoCompra[]> => {
    try {
      const key = KEYS.historico(userId);
      const raw = await AsyncStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.error('Erro ao listar histórico:', error);
      return [];
    }
  },

  listarHistorico: (userId: string): HistoricoCompra[] => {
    console.warn('Use listarHistoricoAsync()');
    return [];
  },

  salvarItemHistorico: async (item: HistoricoItem): Promise<void> => {
    const key = KEYS.historicoItens(item.historicoId);
    const raw = await AsyncStorage.getItem(key);
    const lista: HistoricoItem[] = raw ? JSON.parse(raw) : [];
    lista.push({ ...item, id: gerarId() });
    await AsyncStorage.setItem(key, JSON.stringify(lista));
  },

  listarItensHistorico: async (historicoId: number): Promise<HistoricoItem[]> => {
    try {
      const key = KEYS.historicoItens(historicoId);
      const raw = await AsyncStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.error('Erro ao listar itens do histórico:', error);
      return [];
    }
  },
};
