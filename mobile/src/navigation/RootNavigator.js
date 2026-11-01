/**
 * RootNavigator — V1.0 Official with Guest Mode, Theme integration & Global Overlays
 */
import React, { useEffect, useState } from 'react';
import { NavigationContainer, DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationLightTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AppTabs from './AppTabs';
import AuthStack from './AuthStack';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import BingSideBar from '../components/BingSideBar';
import QuickSettingsModal from '../components/QuickSettingsModal';
import InterfaceGuideModal from '../components/InterfaceGuideModal';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, isGuest, loading } = useAuth();
  const { colors, isDark } = useTheme();
  const [onboardingDone, setOnboardingDone] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('onboarding_done')
      .then((val) => setOnboardingDone(val === 'true'))
      .catch(() => setOnboardingDone(false));
  }, [user, isGuest]);

  if (loading || onboardingDone === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isAuthenticatedOrGuest = Boolean(user || isGuest);

  return (
    <NavigationContainer
      theme={{
        ...(isDark ? NavigationDarkTheme : NavigationLightTheme),
        dark: isDark,
        colors: {
          primary: colors.primary,
          background: colors.bg,
          card: colors.bgSurface,
          text: colors.text,
          border: colors.border,
          notification: colors.accent,
        },
      }}
    >
      <View style={{ flex: 1 }}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!onboardingDone ? (
            <Stack.Screen name="Onboarding">
              {() => <OnboardingScreen onDone={() => setOnboardingDone(true)} />}
            </Stack.Screen>
          ) : !isAuthenticatedOrGuest ? (
            <Stack.Screen name="Auth" component={AuthStack} />
          ) : (
            <Stack.Screen name="MainTabs" component={AppTabs} />
          )}
        </Stack.Navigator>

        {isAuthenticatedOrGuest && <BingSideBar />}
        <QuickSettingsModal />
        <InterfaceGuideModal />
      </View>
    </NavigationContainer>
  );
}
