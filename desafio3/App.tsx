import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { ToastProvider } from './src/context/ToastContext';
import Navegacion from './src/navigation/Navegacion';

const tema = {
  ...MD3LightTheme,
  colors: { ...MD3LightTheme.colors, primary: '#1565c0', secondary: '#00897b' },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={tema}>
        <ToastProvider>
          <AuthProvider>
            <FavoritesProvider>
              <Navegacion />
              <StatusBar style="auto" />
            </FavoritesProvider>
          </AuthProvider>
        </ToastProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
