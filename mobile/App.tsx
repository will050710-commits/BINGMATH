/**
 * DuoMath Mobile — App Entry Point (V1.0 Official — BingSTEAM © 2026)
 * React Native 0.86 (Bare)
 */
import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { ThemeProvider } from './src/context/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';
import { Colors } from './src/theme/colors';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bgSurface} />
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <RootNavigator />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
