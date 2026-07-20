/**
 * RootNavigator — kiểm tra auth + onboarding trước khi điều hướng
 */
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';
import AppTabs from './AppTabs';
import AuthStack from './AuthStack';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();
  const [onboardingDone, setOnboardingDone] = useState(null); // null = checking

  useEffect(() => {
    if (!user) {
      setOnboardingDone(null);
      return;
    }
    AsyncStorage.getItem('onboarding_done').then(val => {
      setOnboardingDone(val === 'true');
    });
  }, [user]);

  // Show spinner while checking auth or onboarding status
  if (loading || (user && onboardingDone === null)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg }}>
        <ActivityIndicator size="large" color={Colors.cyan} />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: Colors.primary,
          background: Colors.bg,
          card: Colors.bgSurface,
          text: Colors.text,
          border: Colors.border,
          notification: Colors.accent,
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Not logged in → Auth screens
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : !onboardingDone ? (
          // Logged in but hasn't seen onboarding
          <Stack.Screen name="Onboarding">
            {() => <OnboardingScreen onDone={() => setOnboardingDone(true)} />}
          </Stack.Screen>
        ) : (
          // Fully onboarded → main app
          <Stack.Screen name="App" component={AppTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
