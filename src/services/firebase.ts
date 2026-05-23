import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyArlRW-ub8l0czfNtyTyEkF3lCEY0-2BPg",
  authDomain: "cadastro-7134.firebaseapp.com",
  projectId: "cadastro-7134",
  storageBucket: "cadastro-7134.appspot.com",
  messagingSenderId: "51320412410",
  appId: "1:51320412410:web:ecf309abadd02c2554cd43"
};

// Inicializa o app evitando duplicidade
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 1. SOLUÇÃO DO TIMEOUT: Inicializa o Firestore forçando Long Polling HTTP
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

// 2. CORREÇÃO DO AUTH: Inicializa com o pacote correto de autenticação móvel
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { app, db, auth };