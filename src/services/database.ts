import * as SQLite from 'expo-sqlite';
// Abre ou cria o arquivo de banco de dados físico no armazenamento local do dispositivo
let dbLocal = SQLite.openDatabaseSync('comprasApp.db');

export async function getDatabase() {
  return dbLocal;
}
export default dbLocal;
// Transformamos a função em assíncrona
export async function inicializarBancoLocal() {
  try {
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

      CREATE TABLE IF NOT EXISTS historico_compras (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        dataCompra TEXT NOT NULL,
        totalCompra REAL NOT NULL,
        quantidadeItens INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS historico_itens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        historicoId INTEGER NOT NULL,
        nome TEXT NOT NULL,
        precoUnitario REAL NOT NULL,
        quantidade INTEGER NOT NULL,
        totalItem REAL NOT NULL
      );
    `);

    console.log('SQLite inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar SQLite:', error);
  }
}

