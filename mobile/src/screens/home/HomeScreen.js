/**
 * HomeScreen
 *
 * Changes vs. the previous version:
 *  - The floating math symbols in the hero now use <FloatingMathBg>, which
 *    pauses itself when this screen loses focus or the app backgrounds —
 *    the old version animated in an infinite loop forever, even off-screen.
 *  - XP bar bug fix: it used to render `min(xp / maxXP, 1)` for the fill
 *    and always label it "xp / maxXP", so anyone past Level 1 saw an
 *    always-full bar and a numerator bigger than its denominator (e.g.
 *    "1500 / 1000 XP"). It now shows progress *within the current level*
 *    and animates the fill in smoothly instead of snapping.
 *  - Leaderboard preview shows shape-matched skeleton rows on first load
 *    instead of a plain "Đang tải..." string.
 *  - Quick-action cards, the AI card, and "Xem tất cả" use PressableScale
 *    for a real tactile press + light haptic instead of a flat opacity fade.
 *  - LeaderboardRow is memoized since it's rendered in a list.
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, RefreshControl, Animated, Dimensions, Image,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Spacing, Radius, Shadow } from '../../theme/spacing';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getLeaderboard } from '../../api/leaderboard';
import apiClient from '../../api/client';
import FloatingMathBg from '../../components/ui/FloatingMathBg';
import PressableScale from '../../components/ui/PressableScale';
import GradientGlow from '../../components/ui/GradientGlow';
import { LeaderboardRowSkeleton } from '../../components/ui/Skeleton';

const { width: SCREEN_W } = Dimensions.get('window');

const MATH_SYMBOLS = ['π', 'Σ', 'θ', '∞', '∫', 'Δ', '√', 'f(x)', 'dy/dx', 'log'];

const QUICK_ACTIONS = [
  { emoji: '📚', labelVI: 'Học ngay',  labelEN: 'Study Now', route: 'Learn',       color: Colors.primary },
  { emoji: '🏆', labelVI: 'Đấu hạng', labelEN: 'Battle',    route: 'Battle',      color: Colors.accent  },
  { emoji: '📖', labelVI: 'Tài liệu', labelEN: 'Library',   route: 'Library',     color: Colors.teal    },
  { emoji: '👤', labelVI: 'Hồ sơ',    labelEN: 'Profile',   route: 'Profile',     color: Colors.purple  },
];

// ── XP Bar ──────────────────────────────────────────────────────────────────
function XPBar({ xp = 0, maxXP = 1000 }) {
  const level       = Math.floor(xp / maxXP) + 1;
  const xpIntoLevel = xp % maxXP;
  const pct         = maxXP > 0 ? xpIntoLevel / maxXP : 0;

  // Animate the fill smoothly whenever xp changes, instead of snapping.
  const widthAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: pct,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [pct]); // eslint-disable-line react-hooks/exhaustive-deps
  const width = widthAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.xpContainer}>
      <View style={styles.xpHeader}>
        <Text style={styles.xpLabel}>Level {level}</Text>
        <Text style={styles.xpText}>{xpIntoLevel} / {maxXP} XP</Text>
      </View>
      <View style={styles.xpTrack}>
        <Animated.View style={[styles.xpFill, { width }]} />
      </View>
    </View>
  );
}

// ── Leaderboard Row (memoized — lives inside a list) ─────────────────────────
const LeaderboardRow = React.memo(function LeaderboardRow({ rank, username, xp, school, index }) {
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
});

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const { user, profile }       = useAuth();
  const { t, toggleLang, lang } = useLanguage();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [stats, setStats]             = useState(null);

  const heroFade  = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(12)).current;

  const load = useCallback(async () => {
    try {
      const [lb, compStats] = await Promise.all([
        getLeaderboard(),
        apiClient.get('/api/competitive-stats').then(r => r.data).catch(() => null),
      ]);
      setLeaderboard(lb.slice(0, 5));
      if (compStats) setStats(compStats);
    } catch (_) {}
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  // One-shot entrance for the hero on mount — cheap (not a loop), adds polish.
  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroFade,  { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(heroSlide, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const displayName =
    profile?.username || user?.displayName || user?.email?.split('@')[0] || 'Bạn';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.cyan} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Section ── */}
        <Animated.View
          style={[
            styles.hero,
            { opacity: heroFade, transform: [{ translateY: heroSlide }] },
          ]}
        >
          {/* Soft glow behind the content */}
          <GradientGlow colors={Colors.gradientGlow} style={styles.heroGlow} />

          {/* Floating math symbols — pauses itself off-screen / backgrounded */}
          <FloatingMathBg symbols={MATH_SYMBOLS} color={Colors.cyan} count={6} />

          {/* Greeting + Mascot + Lang toggle */}
          <View style={styles.heroTop}>
            <Image
              source={require('../../assets/images/owl.png')}
              style={styles.heroMascot}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.badge}>
                ⚡ {t('BingMath Song Ngữ', 'BingMath Bilingual')}
              </Text>
              <Text style={styles.greeting}>
                {t(`Chào, ${displayName}! 👋`, `Hi, ${displayName}! 👋`)}
              </Text>
              <Text style={styles.heroSub}>
                {t('Tiếp tục hành trình toán học của bạn', 'Continue your math journey')}
              </Text>
            </View>
            <PressableScale style={styles.langBtn} onPress={toggleLang} haptics="select">
              <Text style={styles.langBtnText}>{lang === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}</Text>
            </PressableScale>
          </View>

          {/* XP Bar */}
          <XPBar xp={stats?.xp ?? 0} />

          {/* Streak chips */}
          {stats && (
            <View style={styles.streakRow}>
              <View style={styles.streakChip}>
                <Text style={styles.streakText}>
                  🔥 {stats.current_streak} {t('ngày liên tiếp', 'day streak')}
                </Text>
              </View>
              <View style={styles.streakChip}>
                <Text style={styles.streakText}>
                  🌍 #{stats.global_rank ?? '--'} {t('xếp hạng', 'rank')}
                </Text>
              </View>
            </View>
          )}
        </Animated.View>

        {/* ── Quick Actions ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Bắt đầu nhanh', 'Quick Start')}</Text>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <PressableScale
                key={action.route}
                style={[styles.actionCard, { borderColor: action.color + '40' }]}
                onPress={() => navigation.navigate(action.route)}
                haptics="tap"
              >
                <Text style={styles.actionEmoji}>{action.emoji}</Text>
                <Text style={styles.actionLabel}>
                  {lang === 'vi' ? action.labelVI : action.labelEN}
                </Text>
                <View style={[styles.actionDot, { backgroundColor: action.color }]} />
              </PressableScale>
            ))}
          </View>
        </View>

        {/* ── Leaderboard Preview ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏆 {t('Bảng Xếp Hạng', 'Leaderboard')}</Text>
            <PressableScale onPress={() => navigation.navigate('Leaderboard')} haptics="tap">
              <Text style={styles.seeAll}>{t('Xem tất cả', 'See all')}</Text>
            </PressableScale>
          </View>
          <View style={styles.lbCard}>
            {loading ? (
              <>
                <LeaderboardRowSkeleton />
                <LeaderboardRowSkeleton />
                <LeaderboardRowSkeleton />
              </>
            ) : leaderboard.length === 0 ? (
              <Text style={styles.emptyText}>{t('Chưa có dữ liệu', 'No data yet')}</Text>
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

        {/* ── BingMCB AI Hint ── */}
        <View style={styles.section}>
          <PressableScale
            style={styles.aiCard}
            onPress={() => navigation.navigate('Learn')}
            haptics="tap"
          >
            <Text style={styles.aiEmoji}>🤖</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiTitle}>BingMCB AI</Text>
              <Text style={styles.aiSub}>
                {t('Hỏi AI bất kỳ bài toán nào', 'Ask AI any math problem')}
              </Text>
            </View>
            <Text style={{ color: Colors.cyan, fontSize: 18 }}>→</Text>
          </PressableScale>
        </View>

        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.bg },
  scroll:  { flex: 1 },
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
  heroGlow: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 160,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.base },
  heroMascot: { width: 48, height: 48, resizeMode: 'contain', marginRight: 12 },
  badge: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.textCyan,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  greeting: {
    fontFamily: FontFamily.black,
    fontSize: FontSize.xl,
    color: Colors.text,
    marginBottom: 4,
  },
  heroSub: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted },
  langBtn: {
    backgroundColor: 'rgba(20,184,166,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(20,184,166,0.4)',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  langBtnText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.text },

  // XP
  xpContainer: { marginBottom: Spacing.md },
  xpHeader:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  xpLabel:     { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.textCyan },
  xpText:      { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted },
  xpTrack: {
    height: 6,
    backgroundColor: Colors.bgGlass,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  xpFill: { height: '100%', backgroundColor: Colors.cyan, borderRadius: Radius.full },

  // Streak
  streakRow: { flexDirection: 'row', gap: Spacing.sm },
  streakChip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  streakText: { fontFamily: FontFamily.semiBold, fontSize: FontSize.xs, color: Colors.textMuted },

  // Sections
  section: { paddingHorizontal: Spacing.xl, marginTop: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: { fontFamily: FontFamily.extraBold, fontSize: FontSize.lg, color: Colors.text },
  seeAll:       { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.primary },

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
  actionDot:   { width: 6, height: 6, borderRadius: 3 },

  // Leaderboard
  lbCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lbRowFirst: { backgroundColor: 'rgba(0,210,255,0.04)' },
  lbMedal:    { fontSize: 20, width: 32, textAlign: 'center' },
  lbName:     { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.text },
  lbSchool:   { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted },
  lbXP:       { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.cyan },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    padding: Spacing.xl,
  },

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
  aiSub:   { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted },
});
