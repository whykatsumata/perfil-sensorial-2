import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../data/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(undefined); // undefined = carregando
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u ?? null));
    return unsub;
  }, []);

  function clearError() { setError(''); }

  async function register(name, email, password) {
    setLoading(true); setError('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      setUser({ ...cred.user, displayName: name });
    } catch (e) {
      setError(friendlyError(e.code));
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    setLoading(true); setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setError(friendlyError(e.code));
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await signOut(auth);
  }

  async function resetPassword(email) {
    setLoading(true); setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (e) {
      setError(friendlyError(e.code));
      return false;
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, clearError, register, login, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

function friendlyError(code) {
  const map = {
    'auth/email-already-in-use':    'Este e-mail já está cadastrado.',
    'auth/invalid-email':           'E-mail inválido.',
    'auth/weak-password':           'A senha deve ter ao menos 6 caracteres.',
    'auth/user-not-found':          'E-mail não encontrado.',
    'auth/wrong-password':          'Senha incorreta.',
    'auth/invalid-credential':      'E-mail ou senha incorretos.',
    'auth/too-many-requests':       'Muitas tentativas. Tente novamente mais tarde.',
    'auth/network-request-failed':  'Sem conexão com a internet.',
  };
  return map[code] || 'Ocorreu um erro. Tente novamente.';
}
