import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAay0c6ZGY7-98gjF6o6aFgr04gmRbkrMM",
  authDomain: "perfil-sensorial-8b539.firebaseapp.com",
  projectId: "perfil-sensorial-8b539",
  storageBucket: "perfil-sensorial-8b539.firebasestorage.app",
  messagingSenderId: "43551431037",
  appId: "1:43551431037:web:ddf779a3dd82c3e91c9414",
};

// Evita inicializar múltiplas vezes em hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Auth com persistência: AsyncStorage no mobile, localStorage na web
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    auth = getAuth(app);
  }
}

export { auth };
export const db = getFirestore(app);
