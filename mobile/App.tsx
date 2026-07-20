/**
 * DuoMath Mobile — App Entry Point
 * React Native 0.86 (Bare)
 */
import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import RootNavigator from './src/navigation/RootNavigator';
import { Colors } from './src/theme/colors';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bgSurface} />
        <LanguageProvider>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
