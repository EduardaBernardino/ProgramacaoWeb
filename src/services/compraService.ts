import { getDatabase } from './database';

export interface ItemCompra {
  id?: number;
  userId: string;
  nome: string;
  fotoUrl: string;
  precoUnitario: number;
  quantidade: number;
  totalItem: number;
}

export const compraService = {
  // 1. Salva o item
  salvarItemLocal: async (item: ItemCompra): Promise<boolean> => {
    try {
      const db = await getDatabase();
      await db.runAsync(
        'INSERT INTO compras (userId, nome, fotoUrl, precoUnitario, quantidade, totalItem) VALUES (?, ?, ?, ?, ?, ?)',
        [item.userId, item.nome, item.fotoUrl, item.precoUnitario, item.quantidade, item.totalItem]
      );
      return true;
    } catch (error) {
      console.error('Erro ao salvar no SQLite:', error);
      return false;
    }
  },

  // 2. Retorna APENAS os itens do usuário logado
  listarItensPorUsuario: async (userId: string): Promise<ItemCompra[]> => {
    try {
      const db = await getDatabase();
      const resultados = await db.getAllAsync<ItemCompra>(
        'SELECT * FROM compras WHERE userId = ? ORDER BY id DESC',
        [userId]
      );
      return resultados;
    } catch (error) {
      console.error('Erro ao buscar itens no SQLite:', error);
      return [];
    }
  },

  // 3. Remove o item do banco local
  excluirItemLocal: async (id: number): Promise<boolean> => {
    try {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM compras WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Erro ao excluir no SQLite:', error);
      return false;
    }
  },

  // 4. Altera a quantidade e recalcula o total
  atualizarQuantidadeLocal: async (id: number, novaQtd: number, precoUnitario: number): Promise<boolean> => {
    try {
      const novoTotalItem = novaQtd * precoUnitario;
      const db = await getDatabase();
      await db.runAsync(
        'UPDATE compras SET quantidade = ?, totalItem = ? WHERE id = ?',
        [novaQtd, novoTotalItem, id]
      );
      return true;
    } catch (error) {
      console.error('Erro ao atualizar no SQLite:', error);
      return false;
    }
  }
};