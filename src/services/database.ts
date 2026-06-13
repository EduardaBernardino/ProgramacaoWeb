import * as SQLite from 'expo-sqlite';

<<<<<<< HEAD
let dbLocal: SQLite.SQLiteDatabase | null = null;
=======
// Abre ou cria o arquivo de banco de dados físico no armazenamento local do dispositivo
const dbLocal = SQLite.openDatabaseSync('comprasApp.db');
>>>>>>> 75b3296f34bbd9a594054ae73e85703037f8d8b9

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
<<<<<<< HEAD
    const db = await getDatabase();
    // Substituímos execSync por execAsync
    await db.execAsync(`
=======
    // Executa em lote (batch) a configuração e criação das tabelas essenciais
    dbLocal.execSync(`
      -- Ativa o modo Write-Ahead Logging (WAL) para otimizar a concorrência e velocidade de escrita/leitura
>>>>>>> 75b3296f34bbd9a594054ae73e85703037f8d8b9
      PRAGMA journal_mode = WAL;

      -- TABELA: compras (Armazena o carrinho ativo atual de cada usuário)
      CREATE TABLE IF NOT EXISTS compras (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        nome TEXT NOT NULL,
        fotoUrl TEXT,
        precoUnitario REAL NOT NULL,
        quantidade INTEGER NOT NULL,
        totalItem REAL NOT NULL
      );

      -- TABELA: historico_compras (Registro mestre/cabeçalho de fechamento da compra)
      CREATE TABLE IF NOT EXISTS historico_compras (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        dataCompra TEXT NOT NULL,
        totalCompra REAL NOT NULL,
        quantidadeItens INTEGER NOT NULL
      );

      -- TABELA: historico_itens (Itens vinculados a uma compra fechada - Relacionamento 1:N)
      CREATE TABLE IF NOT EXISTS historico_itens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        historicoId INTEGER NOT NULL, -- Atua como a chave estrangeira vinculada a historico_compras(id)
        nome TEXT NOT NULL,
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