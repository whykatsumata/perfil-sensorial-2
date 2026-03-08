import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login, register, resetPassword, loading, error, clearError } = useAuth();
  const [mode,     setMode]     = useState('login'); // 'login' | 'register' | 'reset'
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  function switchMode(m) { setMode(m); clearError(); setPassword(''); }

  async function handleSubmit() {
    if (!email.trim()) return;
    if (mode === 'login') {
      await login(email.trim(), password);
    } else if (mode === 'register') {
      if (!name.trim()) return;
      await register(name.trim(), email.trim(), password);
    } else {
      const ok = await resetPassword(email.trim());
      if (ok) Alert.alert('E-mail enviado', 'Verifique sua caixa de entrada para redefinir a senha.');
      switchMode('login');
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo / header */}
          <View style={s.logoWrap}>
            <View style={s.logoCircle}>
              <Text style={s.logoEmoji}>🧠</Text>
            </View>
            <Text style={s.logoTitle}>Perfil Sensorial 2</Text>
            <Text style={s.logoSub}>Winnie Dunn • Pearson Clinical</Text>
          </View>

          {/* Card */}
          <View style={s.card}>
            <Text style={s.cardTitle}>
              {mode === 'login'    ? 'Entrar na conta'      :
               mode === 'register' ? 'Criar conta'          :
                                     'Redefinir senha'}
            </Text>

            {error ? (
              <View style={s.errorBox}>
                <Text style={s.errorTxt}>⚠️  {error}</Text>
              </View>
            ) : null}

            {mode === 'register' && (
              <View style={s.field}>
                <Text style={s.label}>NOME COMPLETO</Text>
                <TextInput
                  style={s.input} placeholder="Seu nome" placeholderTextColor="#B0A090"
                  value={name} onChangeText={setName} autoCapitalize="words"
                />
              </View>
            )}

            <View style={s.field}>
              <Text style={s.label}>E-MAIL</Text>
              <TextInput
                style={s.input} placeholder="seu@email.com" placeholderTextColor="#B0A090"
                value={email} onChangeText={setEmail}
                keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
              />
            </View>

            {mode !== 'reset' && (
              <View style={s.field}>
                <Text style={s.label}>SENHA</Text>
                <View style={s.passWrap}>
                  <TextInput
                    style={[s.input, { flex: 1, borderWidth: 0, padding: 0 }]}
                    placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                    placeholderTextColor="#B0A090"
                    value={password} onChangeText={setPassword}
                    secureTextEntry={!showPass} autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowPass(v => !v)} style={s.eyeBtn}>
                    <Text style={s.eyeTxt}>{showPass ? '🙈' : '👁'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {mode === 'login' && (
              <TouchableOpacity onPress={() => switchMode('reset')} style={{ alignSelf: 'flex-end', marginBottom: 20 }}>
                <Text style={s.linkTxt}>Esqueci minha senha</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={s.btnPrimary} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
              {loading
                ? <ActivityIndicator color="white" />
                : <Text style={s.btnPrimaryTxt}>
                    {mode === 'login'    ? 'Entrar'          :
                     mode === 'register' ? 'Criar conta'     :
                                          'Enviar e-mail'}
                  </Text>}
            </TouchableOpacity>
          </View>

          {/* Alternar modo */}
          <View style={s.switchRow}>
            {mode === 'login' ? (
              <>
                <Text style={s.switchTxt}>Não tem conta? </Text>
                <TouchableOpacity onPress={() => switchMode('register')}>
                  <Text style={s.linkTxt}>Criar conta</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={s.switchTxt}>Já tem conta? </Text>
                <TouchableOpacity onPress={() => switchMode('login')}>
                  <Text style={s.linkTxt}>Entrar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#0F1923' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 40 },

  logoWrap:   { alignItems: 'center', marginBottom: 32 },
  logoCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(196,112,63,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoEmoji:  { fontSize: 36 },
  logoTitle:  { fontSize: 24, fontWeight: '800', color: 'white', marginBottom: 4 },
  logoSub:    { fontSize: 12, color: 'rgba(255,255,255,0.4)' },

  card:      { backgroundColor: 'white', borderRadius: 20, padding: 24, marginBottom: 20 },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#1A1714', marginBottom: 20 },

  errorBox: { backgroundColor: '#FFF0F0', borderRadius: 10, padding: 12, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: '#C0547A' },
  errorTxt: { fontSize: 13, color: '#C0547A', fontWeight: '500' },

  field: { marginBottom: 16 },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, color: '#8C7B6B', marginBottom: 8 },
  input: { backgroundColor: '#F5F3EF', borderWidth: 2, borderColor: '#E0D8CC', borderRadius: 10, padding: 12, fontSize: 15, color: '#1A1714' },

  passWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F3EF', borderWidth: 2, borderColor: '#E0D8CC', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12 },
  eyeBtn:   { paddingLeft: 8 },
  eyeTxt:   { fontSize: 16 },

  btnPrimary:    { backgroundColor: '#C4703F', borderRadius: 12, padding: 16, alignItems: 'center', elevation: 3, minHeight: 52, justifyContent: 'center' },
  btnPrimaryTxt: { color: 'white', fontSize: 16, fontWeight: '700' },

  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  switchTxt: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  linkTxt:   { color: '#C4703F', fontSize: 14, fontWeight: '700' },
});
