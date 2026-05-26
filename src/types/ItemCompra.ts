// src/types/ItemCompra.ts
export interface ItemCompra {
  id?: number;          // ID gerado pelo SQLite
  userId: string;       // ID do usuário vindo do Firebase Auth (Garante a Rotina 3)
  nome: string;         // Nome do produto
  imagem: string;       // Caminho local da foto salva (Garante a Rotina 2)
  quantidade: number;   // Quantidade
  valorUnitario: number;// Valor da prateleira
  valorTotal: number;   // Calculado automaticamente (Quantidade x Valor Unitário)
}