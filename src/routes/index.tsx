import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Mantemos apenas as telas principais que não dependem de login
import ListScreen from '../components/screens/ListScreen';
import CameraScreen from '../components/screens/CameraScreen';

const Stack = createStackNavigator();

export default function Routes() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Como o app agora é local, vamos direto para as telas de uso */}
      <Stack.Screen name="List" component={ListScreen} options={{ title: 'Shopping List' }} />
      <Stack.Screen name="Camera" component={CameraScreen} options={{ title: 'Tirar Foto do Produto' }} />
    </Stack.Navigator>
  );
}