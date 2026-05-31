import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Importamos a tela de Login de volta
import LoginScreen from '../components/screens/LoginScreen';
import ListScreen from '../components/screens/ListScreen';
import CameraScreen from '../components/screens/CameraScreen';

const Stack = createStackNavigator();

export default function Routes() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* A primeira Screen instalada dentro do Navigator é a que abre primeiro */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="List" component={ListScreen} options={{ title: 'Shopping List' }} />
      <Stack.Screen name="Camera" component={CameraScreen} options={{ title: 'Tirar Foto do Produto' }} />
    </Stack.Navigator>
  );
}