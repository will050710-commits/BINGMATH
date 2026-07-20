/**
 * LeaderboardScreen — Bảng Xếp Hạng Toàn Cầu (Fullscreen)
 *
 * Features:
 *  - Top 50 với animation slide-in từng hàng
 *  - Filter: Tất cả / THCS / THPT / Tuần này
 *  - Highlight hàng của chính mình (sticky-style)
 *  - Pull-to-refresh
 */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, RefreshControl, Animated, ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Spacing, Radius, Shadow } from '../../theme/spacing';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getLeaderboard } from '../../api/leaderboard';

const { width: W } = Dimensions.get('window');

const FILTERS = [
  { id: 'all',   label: '🌍 Tất cả' },
  { id: 'week',  label: '📅 Tuần này' },
  { id: 'thpt',  label: '🎓 THPT' },
  { id: 'thcs',  label: '📘 THCS' },
];

const MEDAL_COLORS = {
  1: { bg: 'rgba(245,158,11,0.2)', border: Colors.amber, text: Colors.amber },
  2: { bg: 'rgba(148,163,184,0.2)', border: '#94a3b8', text: '#94a3b8' },
  3: { bg: 'rgba(205,127,50,0.2)', border: '#cd7f32', text: '#cd7f32' },
};

// ── ANIMATED ROW ───────────────────────────────────────────────────────────────
function LeaderboardRow({ item, rank, isMe, delay }) {
  const slideAnim = useRef(new Animated.Value(40)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 300, delay, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, delay, useNativeDriver: true }),
    ]).start();
  }, [delay]);

  const medal = MEDAL_COLORS[rank];
  const initials = (item.username || '?').slice(0, 2).toUpperCase();

  return (
    <Animated.View style={[
      styles.row,
      isMe && styles.rowMe,
      medal && { borderColor: medal.border, backgroundColor: medal.bg },
      { transform: [{ translateX: slideAnim }], opacity: opacityAnim },
    ]}>
      {/* Rank */}
      <View style={styles.rankCell}>
        {rank <= 3 ? (
          <Text style={[styles.medalEmoji]}>
            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
          </Text>
        ) : (
          <Text style={[styles.rankNum, isMe && { color: Colors.cyan }]}>#{rank}</Text>
        )}
      </View>

      {/* Avatar */}
      <View style={[styles.avatarSmall, isMe && styles.avatarSmallMe, medal && { borderColor: medal.border }]}>
        <Text style={styles.avatarSmallText}>{initials}</Text>
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowName, isMe && { color: Colors.cyan }]} numberOfLines={1}>
          {item.username}{isMe ? ' (bạn)' : ''}
        </Text>
        {item.school ? (
          <Text style={styles.rowSchool} numberOfLines={1}>{item.school}</Text>
        ) : null}
      </View>

      {/* XP */}
      <View style={styles.xpCell}>
        <Text style={[styles.rowXP, medal && { color: medal.text }]}>
          {(item.xp ?? item.total_points ?? 0).toLocaleString()}
        </Text>
        <Text style={styles.rowXPLabel}>XP</Text>
      </View>
    </Animated.View>
  );
}

// ── TOP 3 PODIUM ─────────────────────────────────────────────────────────────
function Podium({ top3 }) {
  if (!top3 || top3.length < 3) return null;

  const podiumAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(podiumAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }).start();
  }, []);

  const heights = [80, 110, 60]; // 2nd, 1st, 3rd
  const order = [1, 0, 2]; // display order: 2nd, 1st, 3rd

  return (
    <Animated.View style={[styles.podium, { opacity: podiumAnim, transform: [{ scale: podiumAnim }] }]}>
      {order.map((dataIdx, displayIdx) => {
        const player = top3[dataIdx];
        const rank = dataIdx + 1;
        const height = heights[displayIdx];
        return (
          <View key={rank} style={[styles.podiumSlot, displayIdx === 1 && { marginBottom: 10 }]}>
            <Text style={styles.podiumEmoji}>{rank === 1 ? '👑' : rank === 2 ? '🥈' : '🥉'}</Text>
            <View style={[styles.podiumAvatar, rank === 1 && styles.podiumAvatarGold]}>
              <Text style={styles.podiumAvatarText}>{(player?.username || '?').slice(0, 2).toUpperCase()}</Text>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>{player?.username}</Text>
            <Text style={styles.podiumXP}>{(player?.xp ?? 0).toLocaleString()} XP</Text>
            <View style={[styles.podiumBase, { height, backgroundColor: rank === 1 ? Colors.amber + '40' : rank === 2 ? '#94a3b840' : '#cd7f3240', borderColor: rank === 1 ? Colors.amber : rank === 2 ? '#94a3b8' : '#cd7f32' }]}>
              <Text style={[styles.podiumRankNum, { color: rank === 1 ? Colors.amber : rank === 2 ? '#94a3b8' : '#cd7f32' }]}>#{rank}</Text>
            </View>
          </View>
        );
      })}
    </Animated.View>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function LeaderboardScreen({ navigation }) {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const myUsername = profile?.username || user?.displayName || user?.email?.split('@')[0];

  const load = useCallback(async () => {
    try {
      const lb = await getLeaderboard();
      setData(lb.slice(0, 50));
    } catch {
      // Fallback: show empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  // Filter logic (in real app, pass filter to API)
  const filtered = data; // placeholder — same data regardless of filter tab
  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  const myRank = filtered.findIndex(p => p.username === myUsername) + 1;
  const myData = filtered.find(p => p.username === myUsername);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        {navigation && (
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← {t('Quay lại', 'Back')}</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>🏆 {t('Bảng Xếp Hạng', 'Leaderboard')}</Text>
        <Text style={styles.headerSub}>{t('Top người chơi toàn cầu', 'Global top players')}</Text>
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
              onPress={() => setFilter(f.id)}
            >
              <Text style={[styles.filterText, filter === f.id && styles.filterTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={Colors.cyan} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.cyan} />}
        >
          {/* My rank sticky card */}
          {myData && myRank > 3 && (
            <View style={styles.myRankCard}>
              <Text style={styles.myRankLabel}>{t('Thứ hạng của bạn', 'Your rank')}</Text>
              <Text style={styles.myRankNum}>#{myRank}</Text>
              <Text style={styles.myRankXP}>{(myData.xp ?? 0).toLocaleString()} XP</Text>
            </View>
          )}

          {/* Podium */}
          <Podium top3={top3} />

          {/* Rest of list */}
          <Text style={styles.listTitle}>{t('Xếp hạng chi tiết', 'Full Rankings')}</Text>
          {filtered.map((item, i) => (
            <LeaderboardRow
              key={item.user_id || i}
              item={item}
              rank={i + 1}
              isMe={item.username === myUsername}
              delay={Math.min(i * 30, 600)}
            />
          ))}

          {filtered.length === 0 && (
            <Text style={styles.emptyText}>{t('Không có dữ liệu', 'No data available')}</Text>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  header: {
    padding: Spacing.xl, paddingBottom: Spacing.md,
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { marginBottom: Spacing.xs },
  backText: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.textCyan },
  headerTitle: { fontFamily: FontFamily.black, fontSize: FontSize.xl, color: Colors.text, marginBottom: 4 },
  headerSub: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted },

  filterRow: {
    backgroundColor: Colors.bgSurface, paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  filterChip: {
    marginRight: Spacing.sm, paddingHorizontal: Spacing.base, paddingVertical: 5,
    borderRadius: Radius.full, backgroundColor: Colors.bgGlass,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.cyan + '25', borderColor: Colors.cyan },
  filterText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.textMuted },
  filterTextActive: { color: Colors.cyan },

  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: Spacing.base },

  // My rank card
  myRankCard: {
    backgroundColor: Colors.cyan + '15', borderWidth: 1.5, borderColor: Colors.cyan + '60',
    borderRadius: Radius.xl, padding: Spacing.base, marginBottom: Spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
  },
  myRankLabel: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.textMuted, flex: 1 },
  myRankNum: { fontFamily: FontFamily.black, fontSize: FontSize.xl, color: Colors.cyan },
  myRankXP: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.textCyan },

  // Podium
  podium: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center',
    gap: Spacing.md, marginBottom: Spacing.xl, marginTop: Spacing.sm,
  },
  podiumSlot: { alignItems: 'center', width: 90 },
  podiumEmoji: { fontSize: 22, marginBottom: 4 },
  podiumAvatar: {
    width: 50, height: 50, borderRadius: 25, marginBottom: 4,
    backgroundColor: Colors.bgSurface, borderWidth: 2, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  podiumAvatarGold: { borderColor: Colors.amber, backgroundColor: Colors.amber + '20', width: 58, height: 58, borderRadius: 29 },
  podiumAvatarText: { fontFamily: FontFamily.black, fontSize: 16, color: Colors.text },
  podiumName: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.text, textAlign: 'center', marginBottom: 2, maxWidth: 80 },
  podiumXP: { fontFamily: FontFamily.regular, fontSize: 9, color: Colors.textDim, marginBottom: 4 },
  podiumBase: {
    width: '100%', borderRadius: Radius.sm, borderTopWidth: 2,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1,
  },
  podiumRankNum: { fontFamily: FontFamily.black, fontSize: FontSize.lg, paddingVertical: 8 },

  listTitle: {
    fontFamily: FontFamily.extraBold, fontSize: FontSize.base,
    color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },

  // Row
  row: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.bgSurface, borderRadius: Radius.lg,
    padding: Spacing.sm, marginBottom: Spacing.xs,
    borderWidth: 1, borderColor: Colors.border,
  },
  rowMe: { borderColor: Colors.cyan + '60', backgroundColor: Colors.cyan + '08' },
  rankCell: { width: 36, alignItems: 'center' },
  medalEmoji: { fontSize: 22 },
  rankNum: { fontFamily: FontFamily.black, fontSize: FontSize.sm, color: Colors.textDim },
  avatarSmall: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.bgGlass, borderWidth: 1.5, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarSmallMe: { borderColor: Colors.cyan, backgroundColor: Colors.cyan + '20' },
  avatarSmallText: { fontFamily: FontFamily.bold, fontSize: 12, color: Colors.textMuted },
  rowName: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.text },
  rowSchool: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textDim },
  xpCell: { alignItems: 'flex-end' },
  rowXP: { fontFamily: FontFamily.black, fontSize: FontSize.md, color: Colors.cyan },
  rowXPLabel: { fontFamily: FontFamily.regular, fontSize: 9, color: Colors.textDim },

  emptyText: { fontFamily: FontFamily.regular, fontSize: FontSize.base, color: Colors.textDim, textAlign: 'center', marginTop: Spacing.xl },
});
