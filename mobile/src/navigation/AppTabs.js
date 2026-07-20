import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, View, Text } from 'react-native';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Spacing } from '../theme/spacing';

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

// Tab icon component
function TabIcon({ emoji, label, focused, color }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 4 }}>
      <Text style={{ fontSize: 20, marginBottom: 2 }}>{emoji}</Text>
      <Text style={{
        fontFamily: focused ? FontFamily.bold : FontFamily.regular,
        fontSize: 10,
        color,
      }}>{label}</Text>
    </View>
  );
}

const TABS = [
  { name: 'Home',    component: HomeNavigator,   emoji: '🏠', label: 'Trang chủ' },
  { name: 'Learn',   component: LearnNavigator,  emoji: '📚', label: 'Học tập'  },
  { name: 'Battle',  component: MRMScreen,       emoji: '⚔️', label: 'Đấu hạng' },
  { name: 'Library', component: TaiLieuScreen,   emoji: '📖', label: 'Tài liệu' },
  { name: 'Profile', component: ProfileNavigator, emoji: '👤', label: 'Hồ sơ'   },
];

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: Colors.bgSurface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: Colors.cyan,
        tabBarInactiveTintColor: Colors.textDim,
      })}
    >
      {TABS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TabIcon
                emoji={tab.emoji}
                label={tab.label}
                focused={focused}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
