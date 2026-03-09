import { Platform, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen         from './screens/LoginScreen';
import PatientsScreen      from './screens/PatientsScreen';
import PatientFormScreen   from './screens/PatientFormScreen';
import PatientDetailScreen from './screens/PatientDetailScreen';
import QuestionsScreen     from './screens/QuestionsScreen';
import ResultsScreen       from './screens/ResultsScreen';
import ReviewScreen        from './screens/ReviewScreen';

const Stack = createNativeStackNavigator();

// ── Estilos globais para web ─────────────────────────────────
if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; height: 100%; background: #1A2535; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

    /* Container centralizado estilo mobile */
    #root {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100vh;
      background: #1A2535;
    }

    /* Largura máxima de app mobile no centro */
    #root > div {
      width: 100%;
      max-width: 480px;
      min-height: 100vh;
      background: #0F1923;
      box-shadow: 0 0 60px rgba(0,0,0,0.5);
      position: relative;
    }

    /* Scrollbar elegante */
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #C4703F; border-radius: 3px; }

    /* Remove highlight de toque no mobile */
    * { -webkit-tap-highlight-color: transparent; }

    /* Evita zoom no input no iOS */
    input, textarea, select { font-size: 16px !important; }
  `;
  document.head.appendChild(style);

  // Meta tags PWA para iOS
  const metas = [
    ['apple-mobile-web-app-capable',           'yes'],
    ['apple-mobile-web-app-status-bar-style',   'black-translucent'],
    ['apple-mobile-web-app-title',              'PS2'],
    ['mobile-web-app-capable',                  'yes'],
    ['theme-color',                             '#0F1923'],
  ];
  metas.forEach(([name, content]) => {
    const m = document.createElement('meta');
    m.name    = name;
    m.content = content;
    document.head.appendChild(m);
  });

  // Apple touch icon
  const link = document.createElement('link');
  link.rel   = 'apple-touch-icon';
  link.href  = '/assets/apple-touch-icon.png';
  document.head.appendChild(link);

  // Título da página
  document.title = 'Perfil Sensorial 2';
}

function AppNavigator() {
  const { user } = useAuth();


  if (user === undefined) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F1923', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#C4703F" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#0F1923" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: Platform.OS === 'web' ? 'none' : 'slide_from_right',
          contentStyle: { backgroundColor: '#F5F3EF' },
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Patients"      component={PatientsScreen} />
            <Stack.Screen name="PatientForm"   component={PatientFormScreen} />
            <Stack.Screen name="PatientDetail" component={PatientDetailScreen} />
            <Stack.Screen name="Questions"     component={QuestionsScreen} />
            <Stack.Screen name="Results"       component={ResultsScreen} />
            <Stack.Screen name="Review"        component={ReviewScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
