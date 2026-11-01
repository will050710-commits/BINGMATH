import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import LessonListScreen from '../screens/learn/LessonListScreen';
import LessonWebViewScreen from '../screens/learn/LessonWebViewScreen';
import MRMScreen from '../screens/battle/MRMScreen';
import TaiLieuScreen from '../screens/library/TaiLieuScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import LeaderboardScreen from '../screens/leaderboard/LeaderboardScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const LearnStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="Leaderboard" component={LeaderboardScreen} />
    </HomeStack.Navigator>
  );
}

function LearnNavigator() {
  return (
    <LearnStack.Navigator screenOptions={{ headerShown: false }}>
      <LearnStack.Screen name="LessonList" component={LessonListScreen} />
      <LearnStack.Screen name="LessonWebView" component={LessonWebViewScreen} />
    </LearnStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
}

const TABS = [
  { name: 'Home', component: HomeNavigator, emoji: '🏠', labelVI: 'Trang chủ', labelEN: 'Home' },
  { name: 'Learn', component: LearnNavigator, emoji: '📚', labelVI: 'Học tập', labelEN: 'Learn' },
  { name: 'Battle', component: MRMScreen, emoji: '⚔️', labelVI: 'Đấu hạng', labelEN: 'Battle' },
  { name: 'Library', component: TaiLieuScreen, emoji: '📖', labelVI: 'Tài liệu', labelEN: 'Library' },
  { name: 'Profile', component: ProfileNavigator, emoji: '👤', labelVI: 'Hồ sơ', labelEN: 'Profile' },
];

/**
 * LiquidGlassTabBar — V1.0 Official visionOS floating tab bar
 * (Hermes bundle lines 213939–214450)
 */
export function LiquidGlassTabBar({ state, navigation }) {
  const { colors, isDark } = useTheme();
  const { lang } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.outerWrap,
        { bottom: Math.max(8, insets.bottom - 4) },
      ]}
    >
      <View
        style={[
          styles.pillContainer,
          {
            backgroundColor: colors.tabBar,
            borderColor: colors.tabBarBorder,
          },
        ]}
      >
        <View
          style={[
            styles.specularRim,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.55)'
                : 'rgba(255,255,255,0.9)',
            },
          ]}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollRow}
        >
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const tabMeta = TABS.find((t) => t.name === route.name) || TABS[0];
            const label = lang === 'vi' ? tabMeta.labelVI : tabMeta.labelEN;

            return (
              <TouchableOpacity
                key={route.key}
                activeOpacity={0.85}
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                }}
                style={[
                  styles.tabButton,
                  isFocused && {
                    backgroundColor: colors.primaryGlow,
                    borderColor: colors.borderAccent,
                  },
                ]}
              >
                <Text style={styles.tabEmoji}>{tabMeta.emoji}</Text>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.tabLabel,
                    {
                      color: isFocused ? colors.primary : colors.textSecondary,
                      fontWeight: isFocused ? '800' : '600',
                    },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

export default function AppTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <LiquidGlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {TABS.map((tab) => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  outerWrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 9990,
    alignItems: 'center',
  },
  pillContainer: {
    width: '100%',
    maxWidth: 580,
    borderRadius: 30,
    borderWidth: 1.2,
    paddingVertical: 5,
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  specularRim: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1.5,
    borderRadius: 2,
  },
  scrollRow: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabButton: {
    minWidth: 68,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabEmoji: { fontSize: 18, marginBottom: 2 },
  tabLabel: { fontSize: 10.5 },
});
