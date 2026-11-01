import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Image,
  SafeAreaView, RefreshControl, Alert, Animated,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Spacing, Radius, Shadow } from '../../theme/spacing';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { signOut } from '../../api/auth';
import apiClient from '../../api/client';
import PressableScale from '../../components/ui/PressableScale';

function StatCard({ value, label, color = Colors.cyan, emoji }) {
  return (
    <View style={[styles.statCard, { borderColor: color + '30' }]}>
      <Text style={{ fontSize: 24, marginBottom: 4 }}>{emoji}</Text>
      <Text style={[styles.statValue, { color }]}>{value ?? '--'}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function AvatarCircle({ name, avatarUrl }) {
  const [errored, setErrored] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const showImage = !!avatarUrl && !errored;

  const handleLoad = () => {
    Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  };

  return (
    <View style={styles.avatar}>
      {showImage ? (
        <Animated.Image
          source={{ uri: avatarUrl }}
          style={[styles.avatarImage, { opacity }]}
          onLoad={handleLoad}
          onError={() => setErrored(true)}
        />
      ) : (
        <Image
          source={require('../../assets/images/owl.png')}
          style={{ width: 56, height: 56, resizeMode: 'contain' }}
        />
      )}
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const { user, profile, refreshProfile } = useAuth();
  const { t, toggleLang, lang } = useLanguage();
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/competitive-stats');
      setStats(res.data);
      await refreshProfile();
    } catch {}
  }, [refreshProfile]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      t('Đăng xuất', 'Sign Out'),
      t('Bạn có chắc muốn đăng xuất?', 'Are you sure you want to sign out?'),
      [
        { text: t('Hủy', 'Cancel'), style: 'cancel' },
        {
          text: t('Đăng xuất', 'Sign Out'),
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch {
              Alert.alert(t('Lỗi', 'Error'), t('Không thể đăng xuất. Vui lòng thử lại.', 'Could not sign out. Please try again.'));
            }
          },
        },
      ]
    );
  };

  const displayName = profile?.username || user?.displayName || user?.email?.split('@')[0] || '---';
  const email = profile?.email || user?.email || '';
  const school = profile?.school || '';
  const grade = profile?.grade || '';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.cyan} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <AvatarCircle name={displayName} avatarUrl={profile?.avatar_url} />
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.email}>{email}</Text>

          {(school || grade) ? (
            <View style={styles.metaRow}>
              {school ? <Text style={styles.metaChip}>🏫 {school}</Text> : null}
              {grade ? <Text style={styles.metaChip}>🎓 {grade}</Text> : null}
            </View>
          ) : null}
        </View>

        {/* Stats Grid */}
        {stats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('Thống Kê Đấu Hạng', 'Competitive Stats')}</Text>
            <View style={styles.statsGrid}>
              <StatCard emoji="⭐" value={stats.xp} label={t('Tổng XP', 'Total XP')} color={Colors.cyan} />
              <StatCard emoji="🔥" value={stats.current_streak} label={t('Chuỗi ngày', 'Day Streak')} color={Colors.amber} />
              <StatCard emoji="🏆" value={stats.elo_rating ?? 1000} label="Elo Rating" color={Colors.accent} />
              <StatCard emoji="🌍" value={stats.global_rank ? `#${stats.global_rank}` : '--'} label={t('Xếp hạng', 'Global Rank')} color={Colors.teal} />
            </View>
          </View>
        )}

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Cài Đặt', 'Settings')}</Text>

          {/* Language toggle */}
          <PressableScale style={styles.settingRow} onPress={toggleLang} haptics="select">
            <Text style={styles.settingEmoji}>🌐</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>{t('Ngôn ngữ', 'Language')}</Text>
              <Text style={styles.settingValue}>{lang === 'vi' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </PressableScale>

          {/* Edit profile */}
          <PressableScale style={styles.settingRow} onPress={() => navigation.navigate('Settings')} haptics="tap">
            <Text style={styles.settingEmoji}>✏️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>{t('Chỉnh sửa hồ sơ', 'Edit Profile')}</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </PressableScale>

          {/* Logout */}
          <PressableScale style={[styles.settingRow, styles.settingRowDanger]} onPress={handleLogout} haptics="warn">
            <Text style={styles.settingEmoji}>🚪</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: Colors.error }]}>{t('Đăng xuất', 'Sign Out')}</Text>
            </View>
          </PressableScale>
        </View>

        {/* App info */}
        <Text style={styles.appVersion}>BingMath Mobile v1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.xl },

  profileHeader: {
    alignItems: 'center', marginBottom: Spacing['2xl'],
    paddingTop: Spacing.xl,
  },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: Colors.accent + '25',
    borderWidth: 2, borderColor: Colors.accent,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadow.glowPurple,
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 42 },
  displayName: { fontFamily: FontFamily.black, fontSize: FontSize.xl, color: Colors.text, marginBottom: 2 },
  email: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.sm },

  metaRow: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap', justifyContent: 'center' },
  metaChip: {
    backgroundColor: Colors.bgGlass, borderRadius: Radius.full,
    paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.border,
    fontFamily: FontFamily.semiBold, fontSize: FontSize.xs, color: Colors.textMuted,
  },

  section: { marginBottom: Spacing['2xl'] },
  sectionTitle: { fontFamily: FontFamily.extraBold, fontSize: FontSize.md, color: Colors.text, marginBottom: Spacing.md },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statCard: {
    width: '48%', backgroundColor: Colors.bgSurface,
    borderRadius: Radius.xl, padding: Spacing.base,
    borderWidth: 1, alignItems: 'center',
    ...Shadow.card,
  },
  statValue: { fontFamily: FontFamily.black, fontSize: FontSize.xl, marginBottom: 2 },
  statLabel: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted },

  settingRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.bgSurface, borderRadius: Radius.lg,
    padding: Spacing.base, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  settingRowDanger: { borderColor: Colors.error + '40', backgroundColor: Colors.error + '08' },
  settingEmoji: { fontSize: 20 },
  settingLabel: { fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: Colors.text },
  settingValue: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },
  settingArrow: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textDim },

  appVersion: {
    fontFamily: FontFamily.regular, fontSize: FontSize.xs,
    color: Colors.textDim, textAlign: 'center', marginTop: Spacing.sm,
  },
});
