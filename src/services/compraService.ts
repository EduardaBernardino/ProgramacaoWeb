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

export interface HistoricoCompra {
  id?: number;
  userId: string;
  dataCompra: string;
  totalCompra: number;
  quantidadeItens: number;
}

export interface HistoricoItem {
  id?: number;
  historicoId: number;
  nome: string;
  precoUnitario: number;
  quantidade: number;
  totalItem: number;
}

export const compraService = {
<<<<<<< HEAD
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
=======

  // --- GERENCIAMENTO DO CARRINHO ATIVO (TABELA: compras) ---

  // Insere de forma síncrona um novo produto vinculado ao ID do usuário autenticado
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

  // Retorna em lote todos os itens do carrinho atual pertencentes estritamente ao usuário informado
  listarItensPorUsuario: (userId: string): ItemCompra[] => {
>>>>>>> 75b3296f34bbd9a594054ae73e85703037f8d8b9
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

<<<<<<< HEAD
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
=======
  // Remove um item específico da tabela compras usando sua chave primária (id)
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

  // Altera os valores de quantidade e recalcula o preço total do item no banco
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
  },

  // Limpa o carrinho ativo limpando todas as linhas que correspondam ao userId do usuário logado
  limparListaUsuario: (userId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        dbLocal.runSync(
          'DELETE FROM compras WHERE userId = ?;',
          [userId]
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  // --- GERENCIAMENTO DO HISTÓRICO (TABELAS: historico_compras e historico_itens) ---

  // Salva o cabeçalho mestre da compra concluída e retorna o ID autogerado (lastInsertRowId)
  salvarHistoricoCompra: (historico: HistoricoCompra): Promise<number> => {
    return new Promise((resolve, reject) => {
      try {
        const result = dbLocal.runSync(
          `
          INSERT INTO historico_compras (userId, dataCompra, totalCompra, quantidadeItens)
          VALUES (?, ?, ?, ?)
          `,
          [historico.userId, historico.dataCompra, historico.totalCompra, historico.quantidadeItens]
        );

        // Retorna o ID gerado para que ele possa ser usado como chave estrangeira em 'historico_itens'
        resolve(Number(result.lastInsertRowId));
      } catch (error) {
        reject(error);
      }
    });
  },

  // Retorna todos os registros masters do histórico ordenados pelas compras mais recentes
  listarHistorico: (userId: string): HistoricoCompra[] => {
    try {
      return dbLocal.getAllSync<HistoricoCompra>(
        `
        SELECT * FROM historico_compras
        WHERE userId = ?
        ORDER BY id DESC
        `,
        [userId]
      );
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  // Salva os itens individuais da compra utilizando o ID do histórico obtido previamente (Chave Estrangeira)
  salvarItemHistorico: (item: HistoricoItem): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        dbLocal.runSync(
          `
          INSERT INTO historico_itens (historicoId, nome, precoUnitario, quantidade, totalItem)
          VALUES (?, ?, ?, ?, ?)
          `,
          [item.historicoId, item.nome, item.precoUnitario, item.quantidade, item.totalItem]
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  // Retorna os itens específicos de uma compra realizada a partir do ID do histórico mestre
  listarItensHistorico: (historicoId: number): HistoricoItem[] => {
    try {
      return dbLocal.getAllSync<HistoricoItem>(
        `
        SELECT * FROM historico_itens
        WHERE historicoId = ?
        `,
        [historicoId]
      );
    } catch (error) {
      console.error(error);
      return [];
>>>>>>> 75b3296f34bbd9a594054ae73e85703037f8d8b9
    }
  }
};