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
  // Salva o item vinculando-o obrigatoriamente ao userId do usuário logado
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

  // Retorna APENAS os itens pertencentes ao usuário que está realizando a consulta
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
  }
};