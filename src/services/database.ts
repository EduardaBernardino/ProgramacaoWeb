import { Platform } from 'react-native';
// Importação do AsyncStorage, usado para persistência de dados local (chave-valor) no dispositivo
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Centralização das Chaves do AsyncStorage.
 * Organiza e isola os dados criando chaves dinâmicas baseadas no ID do usuário (userId).
 * Isso garante que múltiplos usuários possam usar o mesmo aparelho sem misturar seus carrinhos e históricos.
 */
export const KEYS = {
  // Gera uma chave única para a lista de compras atual do usuário (Ex: "compras_abc123")
  compras: (userId: string) => `compras_${userId}`,

  // Gera uma chave única para o histórico de compras fechadas do usuário (Ex: "historico_abc123")
  historico: (userId: string) => `historico_${userId}`,

  // Gera uma chave única para listar os itens específicos pertencentes a uma compra passada pelo ID do histórico
  historicoItens: (historicoId: number) => `historico_itens_${historicoId}`,
};

/**
 * Função de Compatibilidade.
 * Mantida para evitar quebras de código (breaking changes) caso alguma outra parte do aplicativo
 * (como o App.tsx) ainda tente executar a inicialização que era necessária em versões antigas ou outros bancos de dados.
 */
export async function inicializarBancoLocal() {
  console.log('AsyncStorage pronto — sem necessidade de inicialização.');
}

// Exportação padrão do objeto de chaves para facilitar a importação limpa em outros arquivos
export default KEYS;