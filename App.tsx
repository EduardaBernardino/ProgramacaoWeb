import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { inicializarBancoLocal } from './src/services/database'; // Ajuste o caminho se suas pastas forem diferentes
import Routes from './src/routes'; // Seu arquivo central de rotas (onde estão as telas de Login, Cadastro, List, etc.)

export default function App() {

  // 1. Inicializa a tabela 'compras' no SQLite assim que o app abre
  useEffect(() => {
    inicializarBancoLocal();
  }, []);

  // 2. Garante que as rotas estão envelopadas pelo NavigationContainer obrigatório
  return (
    <NavigationContainer>
      <Routes />
    </NavigationContainer>
  );
}