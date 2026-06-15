
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

// --- Imports do Firebase Auth ---
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase';

// --- Imports das Telas ---
import LoginScreen from '../components/screens/LoginScreen';
import RegisterScreen from '../components/screens/RegisterScreen';
import ListScreen from '../components/screens/ListScreen';
import CameraScreen from '../components/screens/CameraScreen';
import HistoryScreen from '../components/screens/HistoryScreen';
import HistoryChartScreen from '../components/screens/HistoryChartScreen';
import { ItemCompra } from '../services/compraService';
import CheckoutScreen from "../components/screens/CheckoutScreen";
// Definição estrita das rotas para o TypeScript
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  List: undefined;
  Camera: undefined;
  History: undefined;
  HistoryChart: undefined;
  Checkout: { itens: ItemCompra[] };
};
// TIPADO: Passamos a lista de parâmetros para o criador do Stack
const Stack = createStackNavigator<RootStackParamList>();

export default function Routes() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // --- LÓGICA DE SESSÃO GLOBAL ---
  useEffect(() => {
    // Escuta em tempo real se o usuário entrou, saiu ou mudou de conta no Firebase.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Define o objeto do usuário logado ou null
      setLoading(false);    // Desativa a tela de carregamento assim que obtém a resposta do Firebase
    });

    // Garante que o listener seja cancelado quando o componente for desmontado
    return unsubscribe;
  }, []);

  // Bloqueia a renderização da árvore de navegação até que o Firebase confirme o estado do usuário
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* --- RENDERIZAÇÃO CONDICIONAL DE FLUXOS --- */}
      {user ? (
        // FLUXO AUTENTICADO (Telas protegidas)
        <>
          <Stack.Screen
            name="List"
            component={ListScreen}
            options={{ title: 'Shopping List' }}
          />

          <Stack.Screen
            name="Camera"
            component={CameraScreen}
            options={{
              title: 'Tirar Foto do Produto',
              headerShown: true,
              headerTintColor: '#fff',
              headerStyle: { backgroundColor: '#000' }
            }}
          />
          <Stack.Screen
              name="Checkout"
              component={CheckoutScreen}
          />
          <Stack.Screen
            name="History"
            component={HistoryScreen}
          />

          <Stack.Screen
            name="HistoryChart"
            component={HistoryChartScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        // FLUXO ANÔNIMO (Autenticação)
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}






























