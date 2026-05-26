import * as SQLite from 'expo-sqlite';

// Abre ou cria o arquivo de banco de dados local
const dbLocal = SQLite.openDatabaseSync('comprasApp.db');

export const inicializarBancoLocal = () => {
  try {
    // Força a criação da tabela usando a sintaxe estável e explícita do SQLite
    dbLocal.execSync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS compras (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        nome TEXT NOT NULL,
        fotoUrl TEXT,
        precoUnitario REAL NOT NULL,
        quantidade INTEGER NOT NULL,
        totalItem REAL NOT NULL
      );
    `);
    console.log(" Tabela 'compras' validada/criada com sucesso no SQLite.");
  } catch (error) {
    console.error("❌ Erro crítico ao criar tabela SQLite:", error);
  }
};

export { dbLocal };