import * as SQLite from 'expo-sqlite';

let dbLocal: SQLite.SQLiteDatabase | null = null;

// Substituímos o openDatabaseSync pelo openDatabaseAsync
export async function getDatabase() {
  if (!dbLocal) {
    dbLocal = await SQLite.openDatabaseAsync('comprasApp.db');
  }
  return dbLocal;
}

// Transformamos a função em assíncrona
export async function inicializarBancoLocal() {
  try {
    const db = await getDatabase();
    // Substituímos execSync por execAsync
    await db.execAsync(`
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
    console.log("Tabela 'compras' validada/criada com sucesso no SQLite.");
  } catch (error) {
    console.error("Erro crítico ao criar tabela SQLite:", error);
  }
}