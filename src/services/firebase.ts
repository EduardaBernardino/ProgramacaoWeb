import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyArlRW-ub8l0czfNtyTyEkF3lCEY0-2BPg",
  authDomain: "cadastro-7134.firebaseapp.com",
  projectId: "cadastro-7134",
  storageBucket: "cadastro-7134.appspot.com",
  messagingSenderId: "51320412410",
  appId: "1:51320412410:web:ecf309abadd02c2554cd43"
};

// Inicializa o app evitando duplicidade em hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firestore com Long Polling — resolve problemas de timeout no React Native
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

// Auth: no mobile usa AsyncStorage para persistir sessão entre aberturas do app.
// Na web usa o mecanismo padrão do Firebase (localStorage via SDK web).
let auth: ReturnType<typeof getAuth>;

if (Platform.OS === 'web') {
  // Na web o Firebase Auth já persiste via localStorage automaticamente
  auth = getAuth(app);
} else {
  // No mobile inicializa com persistência no AsyncStorage
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { app, db, auth };
