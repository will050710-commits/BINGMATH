import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, RefreshControl, Animated, Dimensions, Image,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Spacing, Radius, Shadow } from '../../theme/spacing';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getLeaderboard } from '../../api/leaderboard';
import apiClient from '../../api/client';

const { width: SCREEN_W } = Dimensions.get('window');

const MATH_SYMBOLS = ['π', 'Σ', 'θ', '∞', '∫', 'Δ', '√', 'f(x)', 'dy/dx', 'log'];

const QUICK_ACTIONS = [
  { emoji: '📚', labelVI: 'Học ngay', labelEN: 'Study Now', route: 'Learn', color: Colors.primary },
  { emoji: '🏆', labelVI: 'Đấu hạng', labelEN: 'Battle', route: 'Battle', color: Colors.accent },
  { emoji: '📖', labelVI: 'Tài liệu', labelEN: 'Library', route: 'Library', color: Colors.teal },
  { emoji: '👤', labelVI: 'Hồ sơ', labelEN: 'Profile', route: 'Profile', color: Colors.purple },
];

function FloatingSymbol({ symbol, index }) {
  const anim = React.useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: -16, duration: 2000 + index * 400, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 2000 + index * 400, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.Text style={[styles.floatSymbol, {
      left: `${8 + (index * 18) % 80}%`,
      top: `${10 + (index * 17) % 60}%`,
      transform: [{ translateY: anim }],
      opacity: 0.15 + (index % 3) * 0.07,
    }]}>
      {symbol}
    </Animated.Text>
  );
}

function XPBar({ xp = 0, maxXP = 1000 }) {
  const pct = Math.min(xp / maxXP, 1);
  const level = Math.floor(xp / maxXP) + 1;
  return (
    <View style={styles.xpContainer}>
      <View style={styles.xpHeader}>
        <Text style={styles.xpLabel}>Level {level}</Text>
        <Text style={styles.xpText}>{xp} / {maxXP} XP</Text>
      </View>
      <View style={styles.xpTrack}>
        <View style={[styles.xpFill, { width: `${pct * 100}%` }]} />
      </View>
    </View>
  );
}

function LeaderboardRow({ rank, username, xp, school, index }) {
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
  return (
    <View style={[styles.lbRow, index === 0 && styles.lbRowFirst]}>
      <Text style={styles.lbMedal}>{medal}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.lbName} numberOfLines={1}>{username}</Text>
        {school ? <Text style={styles.lbSchool} numberOfLines={1}>{school}</Text> : null}
      </View>
      <Text style={styles.lbXP}>{xp} XP</Text>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { user, profile } = useAuth();
  const { t, toggleLang, lang } = useLanguage();
  const [leaderboard, setLeaderboard] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);

  const load = useCallback(async () => {
    try {
      const [lb, compStats] = await Promise.all([
        getLeaderboard(),
        apiClient.get('/api/competitive-stats').then(r => r.data).catch(() => null),
      ]);
      setLeaderboard(lb.slice(0, 5));
      if (compStats) setStats(compStats);
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const displayName = profile?.username || user?.displayName || user?.email?.split('@')[0] || 'Bạn';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.cyan} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Section ── */}
        <View style={styles.hero}>
          {/* Floating math symbols */}
          {MATH_SYMBOLS.slice(0, 6).map((s, i) => <FloatingSymbol key={i} symbol={s} index={i} />)}

          {/* Greeting + Lang toggle */}
          <View style={styles.heroTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.badge}>🎓 {t('Nền tảng Toán Song Ngữ', 'Bilingual Math Platform')}</Text>
              <Text style={styles.greeting}>{t(`Chào, ${displayName}! 👋`, `Hi, ${displayName}! 👋`)}</Text>
              <Text style={styles.heroSub}>{t('Tiếp tục hành trình toán học của bạn', 'Continue your math journey')}</Text>
            </View>
            <TouchableOpacity style={styles.langBtn} onPress={toggleLang}>
              <Text style={styles.langBtnText}>{lang === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}</Text>
            </TouchableOpacity>
          </View>

          {/* XP Bar */}
          <XPBar xp={stats?.xp ?? 0} />

          {/* Streak */}
          {stats && (
            <View style={styles.streakRow}>
              <View style={styles.streakChip}>
                <Text style={styles.streakText}>🔥 {stats.current_streak} {t('ngày liên tiếp', 'day streak')}</Text>
              </View>
              <View style={styles.streakChip}>
                <Text style={styles.streakText}>🌍 #{stats.global_rank ?? '--'} {t('xếp hạng', 'rank')}</Text>
              </View>
            </View>
          )}
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Bắt đầu nhanh', 'Quick Start')}</Text>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.route}
                style={[styles.actionCard, { borderColor: action.color + '40' }]}
                onPress={() => navigation.navigate(action.route)}
                activeOpacity={0.8}
              >
                <Text style={styles.actionEmoji}>{action.emoji}</Text>
                <Text style={styles.actionLabel}>{lang === 'vi' ? action.labelVI : action.labelEN}</Text>
                <View style={[styles.actionDot, { backgroundColor: action.color }]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Leaderboard Preview ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏆 {t('Bảng Xếp Hạng', 'Leaderboard')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Leaderboard')}>
              <Text style={styles.seeAll}>{t('Xem tất cả', 'See all')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.lbCard}>
            {leaderboard.length === 0 ? (
              <Text style={styles.emptyText}>{t('Đang tải...', 'Loading...')}</Text>
            ) : (
              leaderboard.map((item, i) => (
                <LeaderboardRow
                  key={item.user_id || i}
                  rank={i + 1}
                  username={item.username}
                  xp={item.xp ?? item.total_points ?? 0}
                  school={item.school}
                  index={i}
                />
              ))
            )}
          </View>
        </View>

        {/* ── DuoMCB AI Hint ── */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.aiCard}
            onPress={() => navigation.navigate('Learn')}
            activeOpacity={0.88}
          >
            <Text style={styles.aiEmoji}>🤖</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiTitle}>DuoMCB AI</Text>
              <Text style={styles.aiSub}>{t('Hỏi AI bất kỳ bài toán nào', 'Ask AI any math problem')}</Text>
            </View>
            <Text style={{ color: Colors.cyan, fontSize: 18 }}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { paddingBottom: Spacing.xl },

  // Hero
  hero: {
    backgroundColor: Colors.bgSurface,
    padding: Spacing.xl,
    paddingTop: Spacing['2xl'],
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    position: 'relative',
    minHeight: 220,
  },
  floatSymbol: {
    position: 'absolute',
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: Colors.cyan,
    pointerEvents: 'none',
  },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.base },
  badge: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.textCyan, letterSpacing: 0.8, marginBottom: 6 },
  greeting: { fontFamily: FontFamily.black, fontSize: FontSize.xl, color: Colors.text, marginBottom: 4 },
  heroSub: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted },
  langBtn: {
    backgroundColor: 'rgba(20,184,166,0.15)',
    borderWidth: 1, borderColor: 'rgba(20,184,166,0.4)',
    borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 6,
  },
  langBtnText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.text },

  // XP
  xpContainer: { marginBottom: Spacing.md },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  xpLabel: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.textCyan },
  xpText: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted },
  xpTrack: { height: 6, backgroundColor: Colors.bgGlass, borderRadius: Radius.full, overflow: 'hidden' },
  xpFill: { height: '100%', backgroundColor: Colors.cyan, borderRadius: Radius.full },

  // Streak
  streakRow: { flexDirection: 'row', gap: Spacing.sm },
  streakChip: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: Colors.border },
  streakText: { fontFamily: FontFamily.semiBold, fontSize: FontSize.xs, color: Colors.textMuted },

  // Sections
  section: { paddingHorizontal: Spacing.xl, marginTop: Spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontFamily: FontFamily.extraBold, fontSize: FontSize.lg, color: Colors.text },
  seeAll: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.primary },

  // Quick actions
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  actionCard: {
    width: (SCREEN_W - Spacing.xl * 2 - Spacing.sm) / 2,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.xs,
    ...Shadow.card,
  },
  actionEmoji: { fontSize: 28 },
  actionLabel: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.text },
  actionDot: { width: 6, height: 6, borderRadius: 3 },

  // Leaderboard
  lbCard: { backgroundColor: Colors.bgSurface, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  lbRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.border },
  lbRowFirst: { backgroundColor: 'rgba(0,210,255,0.04)' },
  lbMedal: { fontSize: 20, width: 32, textAlign: 'center' },
  lbName: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.text },
  lbSchool: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted },
  lbXP: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.cyan },
  emptyText: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', padding: Spacing.xl },

  // AI Card
  aiCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
    ...Shadow.glowPurple,
  },
  aiEmoji: { fontSize: 32 },
  aiTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.text },
  aiSub: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted },
});
