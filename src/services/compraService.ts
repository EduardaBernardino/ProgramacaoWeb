import AsyncStorage from '@react-native-async-storage/async-storage';
import { KEYS } from './database';

// Definição do modelo de dados para produtos inseridos no carrinho ativo
export interface ItemCompra {
  id?: number;
  userId: string;
  nome: string;
  fotoUrl: string;
  precoUnitario: number;
  quantidade: number;
  totalItem: number;
}

// Definição do modelo para o cabeçalho/resumo de uma compra fechada no histórico
export interface HistoricoCompra {
  id?: number;
  userId: string;
  dataCompra: string;
  totalCompra: number;
  quantidadeItens: number;
  divergencia: number;
}

// Definição do modelo para os produtos vinculados a uma compra do histórico
export interface HistoricoItem {
  id?: number;
  historicoId: number;
  nome: string;
  precoUnitario: number;
  quantidade: number;
  totalItem: number;
}

/**
 * Função utilitária interna para geração de chaves primárias numéricas (IDs).
 * Combina o timestamp atual em milissegundos com um sufixo aleatório para mitigar o risco
 * de colisões de IDs em operações executadas em lote ou sequências muito rápidas.
 */
const gerarId = (): number => Date.now() + Math.floor(Math.random() * 1000);

export const compraService = {

  // ==========================================
  // --- MÉTODOS DO CARRINHO ATIVO (MÓDULO) ---
  // ==========================================

  /**
   * Adiciona um novo item ao carrinho ativo do usuário.
   * Recupera o array existente, faz o parse do JSON, injeta o novo item com ID único e salva de volta.
   */
  salvarItemLocal: async (item: ItemCompra): Promise<void> => {
    const key = KEYS.compras(item.userId);
    const raw = await AsyncStorage.getItem(key);
    const lista: ItemCompra[] = raw ? JSON.parse(raw) : []; // Fallback para array vazio se for o primeiro item
    lista.push({ ...item, id: gerarId() });
    await AsyncStorage.setItem(key, JSON.stringify(lista)); // Serializa o array atualizado para string
  },

  /**
   * Retorna todos os itens do carrinho ativo associados ao userId fornecido.
   */
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

  /**
   * Remove um item específico do carrinho usando seu ID e filtrando dentro da chave isolada do usuário.
   */
  excluirItemLocal: async (id: number, userId: string): Promise<void> => {
    const key = KEYS.compras(userId);
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return;
    const lista: ItemCompra[] = JSON.parse(raw);
    // Filtra removendo da lista o item correspondente ao ID informado
    const nova = lista.filter(item => item.id !== id);
    await AsyncStorage.setItem(key, JSON.stringify(nova));
  },

  /**
   * Modifica a quantidade comprada de um item e recalcula o subtotal acumulado (totalItem)
   * com base no preço unitário da gôndola.
   */
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
    // Mapeia o array local alterando as propriedades de contagem apenas do ID correspondente
    const nova = lista.map(item =>
        item.id === id
            ? { ...item, quantidade: novaQtd, totalItem: novaQtd * precoUnitario }
            : item
    );
    await AsyncStorage.setItem(key, JSON.stringify(nova));
  },

  /**
   * Remove por completo do AsyncStorage a chave correspondente ao carrinho ativo do usuário.
   */
  limparListaUsuario: async (userId: string): Promise<void> => {
    await AsyncStorage.removeItem(KEYS.compras(userId));
  },

  // ==========================================
  // --- MÉTODOS DE HISTÓRICO DE COMPRAS ------
  // ==========================================

  /**
   * Persiste o cabeçalho de uma nova compra no histórico geral do usuário.
   * Retorna o ID gerado para que os itens individuais possam ser devidamente vinculados.
   */
  salvarHistoricoCompra: async (historico: HistoricoCompra): Promise<number> => {
    const key = KEYS.historico(historico.userId);
    const raw = await AsyncStorage.getItem(key);
    const lista: HistoricoCompra[] = raw ? JSON.parse(raw) : [];
    const id = gerarId();
    lista.push({ ...historico, id });
    await AsyncStorage.setItem(key, JSON.stringify(lista));
    return id; // Retorna a chave primária para controle de relacionamentos relacionais
  },

  /**
   * Método assíncrono padrão para listar todos os cabeçalhos de compras salvas do usuário.
   */
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

  /**
   * Método Síncrono Legado/Depreciado.
   * Mantido para evitar quebras de compilação, disparando um aviso de desenvolvimento no console.
   */
  listarHistorico: (userId: string): HistoricoCompra[] => {
    console.warn('Use listarHistoricoAsync()');
    return [];
  },

  /**
   * Salva em uma chave isolada a lista de produtos pertencente a um ID de histórico de compra específico.
   */
  salvarItemHistorico: async (item: HistoricoItem): Promise<void> => {
    const key = KEYS.historicoItens(item.historicoId);
    const raw = await AsyncStorage.getItem(key);
    const lista: HistoricoItem[] = raw ? JSON.parse(raw) : [];
    lista.push({ ...item, id: gerarId() });
    await AsyncStorage.setItem(key, JSON.stringify(lista));
  },

  /**
   * Recupera todos os produtos pertencentes e vinculados a um determinado registro de compra do histórico.
   */
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