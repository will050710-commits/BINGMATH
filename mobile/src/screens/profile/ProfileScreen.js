import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, RefreshControl, Alert,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Spacing, Radius, Shadow } from '../../theme/spacing';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { signOut } from '../../api/auth';
import apiClient from '../../api/client';

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
  const initials = (name || 'U').slice(0, 2).toUpperCase();
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials}</Text>
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
            try { await signOut(); } catch {}
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
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
          {(school || grade) && (
            <View style={styles.infoRow}>
              {school ? <Text style={styles.infoChip}>🏫 {school}</Text> : null}
              {grade ? <Text style={styles.infoChip}>📚 {grade}</Text> : null}
            </View>
          )}
        </View>

        {/* Stats Grid */}
        {stats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('Thống Kê', 'Statistics')}</Text>
            <View style={styles.statsGrid}>
              <StatCard emoji="⚡" value={stats.xp} label="XP" color={Colors.cyan} />
              <StatCard emoji="🔥" value={stats.current_streak} label={t('Streak', 'Streak')} color={Colors.amber} />
              <StatCard emoji="🏆" value={stats.longest_streak} label={t('Kỷ lục', 'Best Streak')} color={Colors.purple} />
              <StatCard emoji="🌍" value={stats.global_rank ? `#${stats.global_rank}` : '--'} label={t('Xếp hạng', 'Global Rank')} color={Colors.teal} />
            </View>
          </View>
        )}

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Cài Đặt', 'Settings')}</Text>

          {/* Language toggle */}
          <TouchableOpacity style={styles.settingRow} onPress={toggleLang} activeOpacity={0.8}>
            <Text style={styles.settingEmoji}>🌐</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>{t('Ngôn ngữ', 'Language')}</Text>
              <Text style={styles.settingValue}>{lang === 'vi' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          {/* Edit profile */}
          <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('Settings')} activeOpacity={0.8}>
            <Text style={styles.settingEmoji}>✏️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>{t('Chỉnh sửa hồ sơ', 'Edit Profile')}</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity style={[styles.settingRow, styles.settingRowDanger]} onPress={handleLogout} activeOpacity={0.8}>
            <Text style={styles.settingEmoji}>🚪</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: Colors.error }]}>{t('Đăng xuất', 'Sign Out')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App info */}
        <Text style={styles.appVersion}>DuoMath Mobile v1.0.0</Text>
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
    backgroundColor: Colors.accent,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.base,
    ...Shadow.glowPurple,
  },
  avatarText: { fontFamily: FontFamily.black, fontSize: 28, color: '#fff' },
  profileName: { fontFamily: FontFamily.black, fontSize: FontSize.xl, color: Colors.text, marginBottom: 4 },
  profileEmail: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.sm },
  infoRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap', justifyContent: 'center' },
  infoChip: {
    fontFamily: FontFamily.semiBold, fontSize: FontSize.xs, color: Colors.textMuted,
    backgroundColor: Colors.bgGlass, borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: Colors.border,
  },

  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontFamily: FontFamily.extraBold, fontSize: FontSize.lg, color: Colors.text, marginBottom: Spacing.md },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statCard: {
    flex: 1, minWidth: '45%',
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.xl, borderWidth: 1,
    padding: Spacing.base, alignItems: 'center',
    ...Shadow.card,
  },
  statValue: { fontFamily: FontFamily.black, fontSize: FontSize.xl },
  statLabel: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },

  settingRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.bgSurface, borderRadius: Radius.lg,
    padding: Spacing.base, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  settingRowDanger: { borderColor: Colors.error + '30' },
  settingEmoji: { fontSize: 22, width: 30, textAlign: 'center' },
  settingLabel: { fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: Colors.text },
  settingValue: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted },
  settingArrow: { fontFamily: FontFamily.bold, fontSize: 20, color: Colors.textDim },

  appVersion: {
    fontFamily: FontFamily.regular, fontSize: FontSize.xs,
    color: Colors.textDim, textAlign: 'center', marginTop: Spacing.base,
  },
});
