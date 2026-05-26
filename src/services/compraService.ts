import { dbLocal } from './database';

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
  // 1. Salva o item vinculando-o obrigatoriamente ao userId do usuário logado
  salvarItemLocal: (item: ItemCompra): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        dbLocal.runSync(
          `INSERT INTO compras (userId, nome, fotoUrl, precoUnitario, quantidade, totalItem)
           VALUES (?, ?, ?, ?, ?, ?);`,
          [item.userId, item.nome, item.fotoUrl, item.precoUnitario, item.quantidade, item.totalItem]
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  // 2. Retorna APENAS os itens pertencentes ao usuário que está realizando a consulta
  listarItensPorUsuario: (userId: string): ItemCompra[] => {
    try {
      const resultados = dbLocal.getAllSync<ItemCompra>(
        'SELECT * FROM compras WHERE userId = ? ORDER BY id DESC;',
        [userId]
      );
      return resultados;
    } catch (error) {
      console.error("Erro ao buscar itens no SQLite:", error);
      return [];
    }
  },

  // 3. Remove o item do banco local usando o ID gerado (Rotina 4)
  excluirItemLocal: (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        dbLocal.runSync('DELETE FROM compras WHERE id = ?;', [id]);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  // 4. Altera a quantidade e recalcula o totalItem baseado no novo valor (Rotina 4)
  atualizarQuantidadeLocal: (id: number, novaQtd: number, precoUnitario: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const novoTotalItem = novaQtd * precoUnitario;
        dbLocal.runSync(
          'UPDATE compras SET quantidade = ?, totalItem = ? WHERE id = ?;',
          [novaQtd, novoTotalItem, id]
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
};