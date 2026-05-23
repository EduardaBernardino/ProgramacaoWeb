import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged, User } from 'firebase/auth';

// Importação do seu serviço configurado
import { auth } from '../services/firebase';

// Telas apontando corretamente para dentro de components/screens
import LoginScreen from '../components/screens/LoginScreen';
import RegisterScreen from '../components/screens/RegisterScreen';
import ListScreen from '../components/screens/ListScreen';
import CameraScreen from '../components/screens/CameraScreen';

const Stack = createStackNavigator();

export default function Routes() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Monitora o estado de autenticação do Firebase
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe; // Limpa o listener ao desmontar
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // Rotas para usuários AUTENTICADOS
        <>
          <Stack.Screen name="List" component={ListScreen} options={{ title: 'Shopping List' }} />
  <Stack.Screen name="Camera" component={CameraScreen} options={{ title: 'Tirar Foto do Produto', headerTintColor: '#fff', headerStyle: { backgroundColor: '#000' } }} />

        </>
      ) : (
        // Rotas para usuários NÃO AUTENTICADOS
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}