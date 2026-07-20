/**
 * MRMScreen — Math Ranked Match (Native Lobby + WebView Hybrid)
 *
 * States:
 *  'lobby'   — chọn map, mode, quick match
 *  'waiting' — phòng chờ, countdown
 *  'ingame'  — WebView /mrm?room=xxx
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  Animated, Dimensions, ScrollView, ActivityIndicator,
  BackHandler, Alert, Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Spacing, Radius, Shadow } from '../../theme/spacing';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import apiClient from '../../api/client';

const { width: W, height: H } = Dimensions.get('window');
const WEB_BASE = __DEV__ ? 'http://10.0.2.2:3000' : 'https://your-production-domain.com';

// ── MAP DATA ────────────────────────────────────────────────────────────────
const MAPS = [
  {
    id: 'thpt',
    emoji: '🎓',
    title: 'THPT',
    subtitle: 'Lớp 10 – 12',
    desc: 'Đại số, Giải tích, Hình học không gian',
    difficulty: '★★★★',
    color: Colors.primary,
    glow: 'rgba(14,165,233,0.35)',
  },
  {
    id: 'thcs',
    emoji: '📘',
    title: 'THCS',
    subtitle: 'Lớp 6 – 9',
    desc: 'Số học, Đại số, Hình học phẳng',
    difficulty: '★★★',
    color: Colors.teal,
    glow: 'rgba(20,184,166,0.35)',
  },
  {
    id: 'mix',
    emoji: '🔀',
    title: 'Random Mix',
    subtitle: 'Tổng hợp',
    desc: 'Câu hỏi ngẫu nhiên mọi cấp độ',
    difficulty: '★★★★★',
    color: Colors.amber,
    glow: 'rgba(245,158,11,0.35)',
  },
];

// ── FLOATING TRIANGLE ────────────────────────────────────────────────────────
function FloatTriangle({ index }) {
  const y = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const size = 10 + (index % 4) * 8;
  const left = (index * 137.5) % 100;
  const duration = 4000 + (index * 700) % 3000;
  const startY = H * 0.7 + (index % 3) * 60;

  useEffect(() => {
    const anim = () => {
      y.setValue(0);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(y, { toValue: -H * 0.8, duration, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.5, duration: 400, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: duration - 400, useNativeDriver: true }),
        ]),
      ]).start(() => anim());
    };
    const timeout = setTimeout(anim, index * 300);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View
      style={[styles.triangle, {
        left: `${left}%`,
        top: startY,
        transform: [{ translateY: y }, { rotate: '45deg' }],
        opacity,
        width: size,
        height: size,
        borderColor: Colors.primary + '80',
      }]}
      pointerEvents="none"
    />
  );
}

// ── MAP CARD ─────────────────────────────────────────────────────────────────
function MapCard({ map, selected, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    onPress(map.id);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
      <Animated.View style={[
        styles.mapCard,
        { borderColor: selected ? map.color : Colors.border, transform: [{ scale }] },
        selected && { shadowColor: map.color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 14, elevation: 10 },
      ]}>
        {selected && <View style={[styles.mapCardGlow, { backgroundColor: map.glow }]} />}
        <Text style={styles.mapEmoji}>{map.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.mapTitle, selected && { color: map.color }]}>{map.title}</Text>
          <Text style={styles.mapSub}>{map.subtitle}</Text>
          <Text style={styles.mapDesc} numberOfLines={1}>{map.desc}</Text>
        </View>
        <View style={styles.mapDiff}>
          <Text style={[styles.mapDiffText, { color: map.color }]}>{map.difficulty}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── PLAYER AVATAR ─────────────────────────────────────────────────────────────
function PlayerAvatar({ player, index, isMe }) {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -4, duration: 800 + index * 200, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 800 + index * 200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const initials = (player?.username || '?').slice(0, 2).toUpperCase();

  return (
    <Animated.View style={[styles.playerSlot, { transform: [{ translateY: bounceAnim }] }]}>
      <View style={[styles.playerAvatar, isMe && styles.playerAvatarMe]}>
        <Text style={styles.playerInitials}>{initials}</Text>
      </View>
      <Text style={[styles.playerName, isMe && { color: Colors.cyan }]} numberOfLines={1}>
        {player?.username || '---'}{isMe ? ' (bạn)' : ''}
      </Text>
      <View style={[styles.readyDot, player?.ready && styles.readyDotOn]} />
    </Animated.View>
  );
}

// ── MAIN SCREEN ───────────────────────────────────────────────────────────────
export default function MRMScreen() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();

  const [phase, setPhase] = useState('lobby'); // 'lobby' | 'waiting' | 'ingame'
  const [selectedMap, setSelectedMap] = useState('thpt');
  const [mode, setMode] = useState('quick'); // 'quick' | 'custom'
  const [matchmaking, setMatchmaking] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [webLoading, setWebLoading] = useState(true);

  // Animated pulse for the "Find Match" button
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (matchmaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [matchmaking]);

  // Countdown ticker
  useEffect(() => {
    if (phase !== 'waiting' || countdown === null) return;
    if (countdown <= 0) {
      setPhase('ingame');
      return;
    }
    const id = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, countdown]);

  // Android back
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (phase === 'ingame') { handleLeaveGame(); return true; }
      if (phase === 'waiting') { handleLeaveWaiting(); return true; }
      return false;
    });
    return () => sub.remove();
  }, [phase]);

  const handleFindMatch = useCallback(async () => {
    setMatchmaking(true);
    try {
      // Simulate matchmaking — replace with real API call
      await new Promise(r => setTimeout(r, 2000));
      const fakeRoomId = `room_${Date.now()}`;
      setRoomId(fakeRoomId);
      setPlayers([
        { username: profile?.username || user?.email?.split('@')[0] || 'Bạn', ready: true },
        { username: 'Đối_thủ', ready: false },
      ]);
      setCountdown(5);
      setPhase('waiting');
    } catch {
      Alert.alert('Lỗi', 'Không tìm được trận đấu. Vui lòng thử lại.');
    } finally {
      setMatchmaking(false);
    }
  }, [profile, user]);

  const handleLeaveWaiting = () => {
    setPhase('lobby');
    setCountdown(null);
    setPlayers([]);
    setRoomId(null);
  };

  const handleLeaveGame = () => {
    Alert.alert(
      t('Thoát trận', 'Leave Match'),
      t('Bạn có chắc muốn rời trận? Bạn sẽ bị thua trận này.', 'Sure? You will forfeit this match.'),
      [
        { text: t('Ở lại', 'Stay'), style: 'cancel' },
        { text: t('Rời trận', 'Leave'), style: 'destructive', onPress: () => setPhase('lobby') },
      ]
    );
  };

  // ── RENDER: IN-GAME WebView ──────────────────────────────────────────────
  if (phase === 'ingame') {
    const gameUrl = `${WEB_BASE}/mrm${roomId ? `?room=${roomId}&map=${selectedMap}` : ''}`;
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.gameHeader}>
          <TouchableOpacity style={styles.leaveBtn} onPress={handleLeaveGame}>
            <Text style={styles.leaveBtnText}>✕ {t('Rời trận', 'Leave')}</Text>
          </TouchableOpacity>
          <Text style={styles.gameTitle}>⚔️ {t('Đang thi đấu', 'In Match')}</Text>
          <View style={styles.mapBadge}>
            <Text style={styles.mapBadgeText}>{MAPS.find(m => m.id === selectedMap)?.title}</Text>
          </View>
        </View>
        {webLoading && (
          <View style={styles.webLoadingBox}>
            <ActivityIndicator size="large" color={Colors.cyan} />
            <Text style={styles.webLoadingText}>{t('Đang vào trận...', 'Entering match...')}</Text>
          </View>
        )}
        <WebView
          source={{ uri: gameUrl }}
          style={[styles.webview, webLoading && { opacity: 0 }]}
          onLoadEnd={() => setWebLoading(false)}
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          injectedJavaScript={`
            (function(){
              var s=document.createElement('style');
              s.innerHTML='body{padding-top:0!important}.duo-mcb-fab,.GlobalSidebar,[class*="DuoMCBSidebar"]{display:none!important}';
              document.head.appendChild(s);
            })();
          `}
        />
      </SafeAreaView>
    );
  }

  // ── RENDER: WAITING ROOM ─────────────────────────────────────────────────
  if (phase === 'waiting') {
    return (
      <SafeAreaView style={styles.safe}>
        {/* Floating triangles */}
        {Array.from({ length: 8 }).map((_, i) => <FloatTriangle key={i} index={i} />)}

        <View style={styles.waitingContainer}>
          <Text style={styles.waitingTitle}>🎮 {t('Phòng Chờ', 'Waiting Room')}</Text>
          <Text style={styles.waitingSub}>{t('Trận đấu sẽ bắt đầu sau', 'Match starts in')}</Text>

          {/* Countdown */}
          <View style={styles.countdownBox}>
            <Text style={styles.countdownNum}>{countdown ?? '...'}</Text>
          </View>

          {/* Players */}
          <View style={styles.playersRow}>
            {players.map((p, i) => (
              <PlayerAvatar key={i} player={p} index={i} isMe={i === 0} />
            ))}
          </View>

          <Text style={styles.vsText}>VS</Text>

          <Text style={styles.mapInfo}>
            🗺️ {MAPS.find(m => m.id === selectedMap)?.title} — {MAPS.find(m => m.id === selectedMap)?.subtitle}
          </Text>

          <TouchableOpacity style={styles.cancelBtn} onPress={handleLeaveWaiting}>
            <Text style={styles.cancelBtnText}>{t('Hủy tìm trận', 'Cancel')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── RENDER: LOBBY ────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      {/* Floating triangles bg */}
      {Array.from({ length: 10 }).map((_, i) => <FloatTriangle key={i} index={i} />)}

      <ScrollView
        contentContainerStyle={styles.lobbyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.lobbyHeader}>
          <Text style={styles.lobbyTitle}>⚔️ {t('Đấu Hạng', 'Ranked Battle')}</Text>
          <Text style={styles.lobbySub}>{t('Thi đấu toán học theo thời gian thực', 'Real-time math battle')}</Text>
        </View>

        {/* Mode selector */}
        <View style={styles.modeRow}>
          {[
            { id: 'quick', label: '⚡ Quick Match', labelVI: '⚡ Tìm Nhanh' },
            { id: 'custom', label: '🏠 Custom', labelVI: '🏠 Tạo Phòng' },
          ].map(m => (
            <TouchableOpacity
              key={m.id}
              style={[styles.modeChip, mode === m.id && styles.modeChipActive]}
              onPress={() => setMode(m.id)}
            >
              <Text style={[styles.modeChipText, mode === m.id && styles.modeChipTextActive]}>
                {t(m.labelVI, m.label)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Map selection */}
        <Text style={styles.sectionLabel}>{t('Chọn Chủ Đề', 'Select Topic')}</Text>
        <View style={styles.mapsContainer}>
          {MAPS.map(map => (
            <MapCard
              key={map.id}
              map={map}
              selected={selectedMap === map.id}
              onPress={setSelectedMap}
            />
          ))}
        </View>

        {/* Rules */}
        <View style={styles.rulesBox}>
          <Text style={styles.rulesTitle}>📋 {t('Luật Chơi', 'Rules')}</Text>
          <Text style={styles.rulesText}>• {t('10 câu hỏi — 30 giây/câu', '10 questions — 30s each')}</Text>
          <Text style={styles.rulesText}>• {t('Trả lời đúng nhanh hơn → thắng', 'Faster correct answer wins')}</Text>
          <Text style={styles.rulesText}>• {t('Thắng: +25 XP | Thua: -10 XP', 'Win: +25 XP | Lose: -10 XP')}</Text>
        </View>

        {/* Find Match Button */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[styles.findBtn, matchmaking && styles.findBtnLoading]}
            onPress={handleFindMatch}
            disabled={matchmaking}
            activeOpacity={0.85}
          >
            {matchmaking ? (
              <View style={styles.findBtnInner}>
                <ActivityIndicator color="#fff" size="small" style={{ marginRight: 10 }} />
                <Text style={styles.findBtnText}>{t('Đang tìm đối thủ...', 'Finding opponent...')}</Text>
              </View>
            ) : (
              <Text style={styles.findBtnText}>
                {mode === 'quick' ? `⚡ ${t('Tìm Trận Nhanh', 'Quick Match')}` : `🏠 ${t('Tạo Phòng', 'Create Room')}`}
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: Spacing['2xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  // Floating triangles
  triangle: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },

  // Game header (in-game)
  gameHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.bgSurface,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.border, height: 50,
  },
  leaveBtn: {
    backgroundColor: 'rgba(248,113,113,0.15)', borderWidth: 1, borderColor: Colors.error + '40',
    borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4,
  },
  leaveBtnText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.error },
  gameTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.text },
  mapBadge: {
    backgroundColor: Colors.primary + '20', borderWidth: 1, borderColor: Colors.primary + '50',
    borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4,
  },
  mapBadgeText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.primary },
  webview: { flex: 1, backgroundColor: Colors.bg },
  webLoadingBox: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg, zIndex: 10 },
  webLoadingText: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 12 },

  // Waiting room
  waitingContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl,
  },
  waitingTitle: { fontFamily: FontFamily.black, fontSize: FontSize['2xl'], color: Colors.text, marginBottom: 4 },
  waitingSub: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.xl },
  countdownBox: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.bgSurface,
    borderWidth: 3, borderColor: Colors.cyan,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.xl,
    shadowColor: Colors.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 20, elevation: 10,
  },
  countdownNum: { fontFamily: FontFamily.black, fontSize: 44, color: Colors.cyan },
  playersRow: { flexDirection: 'row', gap: Spacing.xl, marginBottom: Spacing.md },
  playerSlot: { alignItems: 'center', width: 70 },
  playerAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.accent + '40', borderWidth: 2, borderColor: Colors.accent,
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  playerAvatarMe: { borderColor: Colors.cyan, backgroundColor: Colors.cyan + '30' },
  playerInitials: { fontFamily: FontFamily.black, fontSize: 18, color: Colors.text },
  playerName: { fontFamily: FontFamily.semiBold, fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
  readyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border, marginTop: 4 },
  readyDotOn: { backgroundColor: Colors.success },
  vsText: { fontFamily: FontFamily.black, fontSize: 28, color: Colors.textDim, marginVertical: Spacing.sm },
  mapInfo: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.xl },
  cancelBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.full, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm,
  },
  cancelBtnText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.textMuted },

  // Lobby
  lobbyContent: { padding: Spacing.xl },
  lobbyHeader: { marginBottom: Spacing.xl },
  lobbyTitle: { fontFamily: FontFamily.black, fontSize: FontSize['2xl'], color: Colors.text, marginBottom: 4 },
  lobbySub: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted },

  modeRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  modeChip: {
    flex: 1, paddingVertical: Spacing.sm, borderRadius: Radius.full,
    backgroundColor: Colors.bgGlass, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center',
  },
  modeChipActive: { backgroundColor: Colors.accent + '25', borderColor: Colors.accent },
  modeChipText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.textMuted },
  modeChipTextActive: { color: Colors.accent },

  sectionLabel: {
    fontFamily: FontFamily.extraBold, fontSize: FontSize.md, color: Colors.text,
    marginBottom: Spacing.md,
  },
  mapsContainer: { gap: Spacing.sm, marginBottom: Spacing.xl },

  // Map card
  mapCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.xl, borderWidth: 1.5,
    padding: Spacing.base, overflow: 'hidden',
  },
  mapCardGlow: {
    ...StyleSheet.absoluteFillObject, opacity: 0.12,
  },
  mapEmoji: { fontSize: 28 },
  mapTitle: { fontFamily: FontFamily.extraBold, fontSize: FontSize.md, color: Colors.text },
  mapSub: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted },
  mapDesc: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textDim, marginTop: 2 },
  mapDiff: { marginLeft: 'auto' },
  mapDiffText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm },

  // Rules
  rulesBox: {
    backgroundColor: Colors.bgSurface, borderRadius: Radius.xl,
    padding: Spacing.base, borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.xl, gap: 4,
  },
  rulesTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.text, marginBottom: Spacing.xs },
  rulesText: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted },

  // Find match button
  findBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.xl,
    paddingVertical: Spacing.base + 4, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 16, elevation: 10,
  },
  findBtnLoading: { backgroundColor: Colors.accent },
  findBtnInner: { flexDirection: 'row', alignItems: 'center' },
  findBtnText: { fontFamily: FontFamily.black, fontSize: FontSize.md, color: '#fff', letterSpacing: 0.5 },
});
