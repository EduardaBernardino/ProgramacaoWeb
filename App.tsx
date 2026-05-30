import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';
import { inicializarBancoLocal } from './src/services/database'; 
import Routes from './src/routes'; 

export default function App() {
  // Criamos um "sinal de trânsito" para o banco de dados
  const [bancoPronto, setBancoPronto] = useState(false);

  useEffect(() => {
    async function prepararBanco() {
      await inicializarBancoLocal(); // Espera a tabela ser criada
      setBancoPronto(true); // Fica verde! Pode mostrar o app.
    }
    prepararBanco();
  }, []);

  // Enquanto não estiver pronto, mostra uma bolinha carregando
  if (!bancoPronto) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  // Quando o banco estiver 100% pronto, libera as rotas
  return (
    <NavigationContainer>
      <Routes />
    </NavigationContainer>
  );
}