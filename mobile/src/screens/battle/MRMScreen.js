/**
 * MRMScreen — Math Ranked Match (Native Lobby + WebView Hybrid)
 *
 * States:
 *  'lobby'   — chọn map, mode, quick match
 *  'waiting' — phòng chờ, countdown
 *  'ingame'  — WebView /mrm?room=xxx
 *
 * Upgrades:
 *  - FloatingParticles (cancels loop and pauses on blur/background).
 *  - WEB_BASE with Android emulator (10.0.2.2) and iOS (localhost) support.
 *  - Countdown urgency cue (pulsing amber on final 3 seconds).
 *  - GradientGlow CTA with gradientHero tokens.
 *  - PressableScale on all cards, chips, and buttons.
 *  - currentMap memoized.
 */
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  Animated, ScrollView, ActivityIndicator,
  BackHandler, Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { haptic, withAlpha } from '../../theme/effects';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import PressableScale from '../../components/ui/PressableScale';
import GradientGlow from '../../components/ui/GradientGlow';
import FloatingParticles from '../../components/ui/FloatingParticles';

import { WEB_BASE_URL as WEB_BASE } from '../../config/endpoints';

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

// ── MAP CARD ─────────────────────────────────────────────────────────────────
function MapCard({ map, selected, onPress }) {
  return (
    <PressableScale
      onPress={() => onPress(map.id)}
      haptics="select"
      scaleTo={0.97}
      style={[
        styles.mapCard,
        { borderColor: selected ? map.color : Colors.border },
        selected && { shadowColor: map.color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 14, elevation: 10 },
      ]}
    >
      {selected && <View style={[styles.mapCardGlow, { backgroundColor: map.glow }]} />}
      <Text style={styles.mapEmoji}>{map.emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.mapTitle, selected && { color: map.color }]}>{map.title}</Text>
        <Text style={styles.mapSubtitle}>{map.subtitle}</Text>
        <Text style={styles.mapDesc} numberOfLines={1}>{map.desc}</Text>
      </View>
      <View style={styles.diffBadge}>
        <Text style={[styles.diffText, { color: map.color }]}>{map.difficulty}</Text>
      </View>
    </PressableScale>
  );
}

// ── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function MRMScreen({ navigation }) {
  const { user, profile } = useAuth();
  const { t, lang } = useLanguage();

  const [gameState, setGameState] = useState('lobby'); // 'lobby' | 'waiting' | 'ingame'
  const [selectedMap, setSelectedMap] = useState('thpt');
  const [selectedMode, setSelectedMode] = useState('ranked'); // 'ranked' | 'casual'
  const [roomId, setRoomId] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [findingMatch, setFindingMatch] = useState(false);
  const [searchingDots, setSearchingDots] = useState('');

  const countdownAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const webRef = useRef(null);

  const currentMap = useMemo(() => MAPS.find(m => m.id === selectedMap) || MAPS[0], [selectedMap]);

  // Pulse animation for finding match
  useEffect(() => {
    if (!findingMatch) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [findingMatch]);

  // Animated dots for searching text
  useEffect(() => {
    if (!findingMatch) return;
    const interval = setInterval(() => {
      setSearchingDots(d => (d.length >= 3 ? '' : d + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, [findingMatch]);

  // Countdown timer in waiting room
  useEffect(() => {
    if (gameState !== 'waiting') return;
    setCountdown(5);

    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(interval);
          setGameState('ingame');
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Urgency pulse when countdown hits 3..2..1
  useEffect(() => {
    if (gameState !== 'waiting' || countdown > 3 || countdown === 0) return;
    haptic.tap();
    countdownAnim.setValue(1.4);
    Animated.spring(countdownAnim, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start();
  }, [countdown, gameState]);

  // Handle hardware back on Android
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (gameState === 'ingame') {
        Alert.alert(
          t('Rời trận đấu?', 'Leave Match?'),
          t('Bạn sẽ bị xử thua nếu rời trận giữa chừng.', 'You will forfeit the match if you leave.'),
          [
            { text: t('Ở lại', 'Stay'), style: 'cancel' },
            {
              text: t('Rời đi', 'Leave'),
              style: 'destructive',
              onPress: () => {
                haptic.warn();
                setGameState('lobby');
              },
            },
          ]
        );
        return true;
      }
      if (gameState === 'waiting') {
        setGameState('lobby');
        setFindingMatch(false);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [gameState]);

  const handleStartFind = useCallback(() => {
    haptic.tap();
    setFindingMatch(true);
    const mockRoom = `room_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setRoomId(mockRoom);

    // Simulate matchmaking search
    setTimeout(() => {
      setFindingMatch(false);
      haptic.success();
      setGameState('waiting');
    }, 1800);
  }, []);

  const handleCancelFind = () => {
    haptic.tap();
    setFindingMatch(false);
  };

  const username = profile?.username || user?.displayName || user?.email?.split('@')[0] || 'Player';
  const gameUrl = `${WEB_BASE}/mrm?room=${roomId || 'quick'}&map=${selectedMap}&mode=${selectedMode}&user=${encodeURIComponent(username)}&lang=${lang}`;

  // Injected JS for full-screen in-game experience
  const INJECTED_GAME_JS = `
    (function() {
      var style = document.createElement('style');
      style.innerHTML = \`
        header, nav, footer, .duo-mcb-sidebar, .global-sidebar { display: none !important; }
        body { padding: 0 !important; margin: 0 !important; overflow: hidden !important; }
        #root, #__next { width: 100vw !important; height: 100vh !important; }
      \`;
      document.head.appendChild(style);
    })();
    true;
  `;

  // ── INGAME VIEW ──
  if (gameState === 'ingame') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.inGameHeader}>
          <PressableScale
            style={styles.exitBtn}
            onPress={() => {
              Alert.alert(
                t('Rời trận đấu?', 'Leave Match?'),
                t('Bạn sẽ bị xử thua nếu rời trận.', 'You will forfeit if you leave.'),
                [
                  { text: t('Ở lại', 'Stay'), style: 'cancel' },
                  {
                    text: t('Rời đi', 'Leave'),
                    style: 'destructive',
                    onPress: () => {
                      haptic.warn();
                      setGameState('lobby');
                    },
                  },
                ]
              );
            }}
            haptics={null}
          >
            <Text style={styles.exitText}>✕ {t('Rời trận', 'Exit')}</Text>
          </PressableScale>
          <View style={[styles.mapBadge, { borderColor: currentMap.color }]}>
            <Text style={styles.mapBadgeText}>{currentMap.emoji} {currentMap.title}</Text>
          </View>
          <Text style={styles.modeBadgeText}>
            {selectedMode === 'ranked' ? '🏆 Ranked' : '🎮 Casual'}
          </Text>
        </View>

        <WebView
          ref={webRef}
          source={{ uri: gameUrl }}
          style={{ flex: 1, backgroundColor: Colors.bg }}
          injectedJavaScript={INJECTED_GAME_JS}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          renderLoading={() => (
            <View style={styles.webLoading}>
              <ActivityIndicator size="large" color={Colors.cyan} />
              <Text style={styles.webLoadingText}>{t('Đang tải phòng đấu...', 'Loading battle room...')}</Text>
            </View>
          )}
          startInLoadingState
        />
      </SafeAreaView>
    );
  }

  // ── WAITING ROOM VIEW ──
  if (gameState === 'waiting') {
    const isUrgent = countdown <= 3 && countdown > 0;
    return (
      <SafeAreaView style={[styles.safe, styles.waitingSafe]}>
        <FloatingParticles count={12} color={currentMap.color} />

        <View style={styles.waitingContent}>
          {/* Map info */}
          <View style={[styles.waitingMapCard, { borderColor: currentMap.color + '60' }]}>
            <Text style={{ fontSize: 44, marginBottom: 8 }}>{currentMap.emoji}</Text>
            <Text style={[styles.waitingMapTitle, { color: currentMap.color }]}>{currentMap.title}</Text>
            <Text style={styles.waitingMapSub}>{currentMap.subtitle}</Text>
            <View style={[styles.waitingModeBadge, { backgroundColor: selectedMode === 'ranked' ? Colors.accent + '30' : Colors.teal + '30' }]}>
              <Text style={[styles.waitingModeText, { color: selectedMode === 'ranked' ? Colors.purple : Colors.teal }]}>
                {selectedMode === 'ranked' ? '🏆 Đấu Hạng (Ranked)' : '🎮 Giao Hữu (Casual)'}
              </Text>
            </View>
          </View>

          {/* Versus */}
          <View style={styles.versusRow}>
            <View style={styles.playerBox}>
              <View style={[styles.playerAvatar, { borderColor: Colors.cyan }]}>
                <Text style={styles.playerInitial}>{(username || 'U')[0].toUpperCase()}</Text>
              </View>
              <Text style={styles.playerName} numberOfLines={1}>{username}</Text>
              <Text style={styles.playerSub}>{t('Bạn', 'You')}</Text>
            </View>

            <View style={styles.vsCircle}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            <View style={styles.playerBox}>
              <View style={[styles.playerAvatar, { borderColor: Colors.purple }]}>
                <Text style={styles.playerInitial}>🤖</Text>
              </View>
              <Text style={styles.playerName} numberOfLines={1}>{t('Đối thủ', 'Opponent')}</Text>
              <Text style={styles.playerSub}>{t('Đã tìm thấy', 'Matched')}</Text>
            </View>
          </View>

          {/* Countdown */}
          <View style={styles.countdownBox}>
            <Text style={styles.countdownLabel}>{t('Trận đấu bắt đầu sau', 'Match starts in')}</Text>
            <Animated.Text
              style={[
                styles.countdownNum,
                isUrgent && { color: Colors.amber },
                { transform: [{ scale: countdownAnim }] },
              ]}
            >
              {countdown}
            </Animated.Text>
          </View>

          {/* Cancel button */}
          <PressableScale style={styles.cancelWaitBtn} onPress={() => setGameState('lobby')} haptics="tap">
            <Text style={styles.cancelWaitText}>{t('Hủy', 'Cancel')}</Text>
          </PressableScale>
        </View>
      </SafeAreaView>
    );
  }

  // ── LOBBY VIEW ──
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.lobbyContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <FloatingParticles count={6} color={Colors.cyan} />
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>⚡ BINGMATH RANKED</Text>
          </View>
          <Text style={styles.headerTitle}>Math Ranked Match</Text>
          <Text style={styles.headerSub}>
            {t('Đấu trí thời gian thực — Nâng bậc xếp hạng', 'Real-time math battle — Climb the leaderboard')}
          </Text>
        </View>

        {/* Mode Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Chế độ chơi', 'Game Mode')}</Text>
          <View style={styles.modeRow}>
            {[
              { id: 'ranked', emoji: '🏆', title: 'Đấu Hạng', sub: 'Tính điểm Elo · Leo Rank', color: Colors.accent },
              { id: 'casual', emoji: '🎮', title: 'Giao Hữu', sub: 'Luyện tập · Không mất điểm', color: Colors.teal },
            ].map(m => (
              <PressableScale
                key={m.id}
                onPress={() => setSelectedMode(m.id)}
                haptics="select"
                scaleTo={0.97}
                style={[
                  styles.modeCard,
                  selectedMode === m.id && {
                    borderColor: m.color,
                    backgroundColor: m.color + '15',
                    shadowColor: m.color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 6,
                  },
                ]}
              >
                <Text style={{ fontSize: 28, marginBottom: 4 }}>{m.emoji}</Text>
                <Text style={[styles.modeTitle, selectedMode === m.id && { color: m.color }]}>{m.title}</Text>
                <Text style={styles.modeSub}>{m.sub}</Text>
              </PressableScale>
            ))}
          </View>
        </View>

        {/* Map Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Chọn bản đồ', 'Select Map')}</Text>
          <View style={styles.mapsList}>
            {MAPS.map(m => (
              <MapCard key={m.id} map={m} selected={selectedMap === m.id} onPress={setSelectedMap} />
            ))}
          </View>
        </View>

        {/* Quick Match CTA Button */}
        <View style={styles.ctaSection}>
          {findingMatch ? (
            <View style={styles.searchingBox}>
              <ActivityIndicator size="small" color={Colors.cyan} style={{ marginRight: 8 }} />
              <Text style={styles.searchingText}>
                {t('Đang tìm đối thủ', 'Finding opponent')}{searchingDots}
              </Text>
              <PressableScale style={styles.cancelFindBtn} onPress={handleCancelFind} haptics="tap">
                <Text style={styles.cancelFindText}>{t('Hủy', 'Cancel')}</Text>
              </PressableScale>
            </View>
          ) : (
            <PressableScale onPress={handleStartFind} scaleTo={0.97} haptics={null} style={{ width: '100%' }}>
              <GradientGlow
                colors={Colors.gradientHero}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.findBtn}
              >
                <Text style={styles.findBtnEmoji}>⚡</Text>
                <Text style={styles.findBtnText}>{t('Tìm Trận Nhanh', 'Quick Match')}</Text>
              </GradientGlow>
            </PressableScale>
          )}
        </View>

        {/* Tips / Rules Footer */}
        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>💡 {t('Luật thi đấu MRM', 'MRM Rules')}</Text>
          <Text style={styles.rulesItem}>• {t('Mỗi trận gồm 5–10 câu hỏi trắc nghiệm', 'Each match has 5–10 multiple choice questions')}</Text>
          <Text style={styles.rulesItem}>• {t('Trả lời đúng và nhanh hơn để nhận thêm điểm', 'Answer faster and correctly for bonus points')}</Text>
          <Text style={styles.rulesItem}>• {t('Hệ thống Elo tính điểm sau mỗi trận đấu', 'Elo rating is updated after each match')}</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  lobbyContent: { padding: Spacing.xl },

  // Header
  header: {
    alignItems: 'center', marginBottom: Spacing.xl,
    paddingVertical: Spacing.base, position: 'relative', overflow: 'hidden',
  },
  headerBadge: {
    backgroundColor: 'rgba(0,210,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(0,210,255,0.3)',
    borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 4,
    marginBottom: Spacing.sm,
  },
  headerBadgeText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.cyan, letterSpacing: 1 },
  headerTitle: { fontFamily: FontFamily.black, fontSize: FontSize['2xl'], color: Colors.text, textAlign: 'center', marginBottom: 4 },
  headerSub: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center' },

  // Section
  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontFamily: FontFamily.extraBold, fontSize: FontSize.md, color: Colors.text, marginBottom: Spacing.md },

  // Mode cards
  modeRow: { flexDirection: 'row', gap: Spacing.md },
  modeCard: {
    flex: 1, backgroundColor: Colors.bgSurface,
    borderRadius: Radius.xl, padding: Spacing.base,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center',
  },
  modeTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.text, marginBottom: 2 },
  modeSub: { fontFamily: FontFamily.regular, fontSize: 10, color: Colors.textMuted, textAlign: 'center' },

  // Maps
  mapsList: { gap: Spacing.md },
  mapCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgSurface, borderRadius: Radius.xl,
    padding: Spacing.base, borderWidth: 1.5,
    gap: Spacing.md, position: 'relative', overflow: 'hidden',
  },
  mapCardGlow: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0.15,
  },
  mapEmoji: { fontSize: 32 },
  mapTitle: { fontFamily: FontFamily.black, fontSize: FontSize.base, color: Colors.text, marginBottom: 2 },
  mapSubtitle: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.textCyan, marginBottom: 2 },
  mapDesc: { fontFamily: FontFamily.regular, fontSize: 11, color: Colors.textMuted },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full, backgroundColor: Colors.bgGlass },
  diffText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs },

  // CTA
  ctaSection: { marginBottom: Spacing.xl, alignItems: 'center' },
  findBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: Radius.xl,
    gap: Spacing.sm, width: '100%',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
  findBtnEmoji: { fontSize: 20 },
  findBtnText: { fontFamily: FontFamily.black, fontSize: FontSize.lg, color: '#fff' },

  searchingBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.bgSurface, borderWidth: 1.5, borderColor: Colors.cyan,
    borderRadius: Radius.xl, padding: Spacing.base, width: '100%',
    gap: Spacing.sm,
  },
  searchingText: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.text, flex: 1 },
  cancelFindBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.md, backgroundColor: Colors.bgGlass },
  cancelFindText: { fontFamily: FontFamily.semiBold, fontSize: FontSize.xs, color: Colors.error },

  // Rules card
  rulesCard: {
    backgroundColor: Colors.bgSurface, borderRadius: Radius.lg,
    padding: Spacing.base, borderWidth: 1, borderColor: Colors.border,
    gap: 4,
  },
  rulesTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.text, marginBottom: 4 },
  rulesItem: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, lineHeight: 18 },

  // In-Game
  inGameHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
    backgroundColor: Colors.bgSurface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  exitBtn: { padding: Spacing.xs },
  exitText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.error },
  mapBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1 },
  mapBadgeText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.text },
  modeBadgeText: { fontFamily: FontFamily.semiBold, fontSize: FontSize.xs, color: Colors.purple },
  webLoading: {
    position: 'absolute', inset: 0,
    justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg,
  },
  webLoadingText: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted, marginTop: Spacing.base },

  // Waiting Room
  waitingSafe: { justifyContent: 'center', alignItems: 'center' },
  waitingContent: { padding: Spacing.xl, alignItems: 'center', width: '100%' },
  waitingMapCard: {
    backgroundColor: Colors.bgSurface, borderRadius: Radius.xl,
    padding: Spacing.xl, alignItems: 'center', width: '100%',
    borderWidth: 1.5, marginBottom: Spacing.xl,
  },
  waitingMapTitle: { fontFamily: FontFamily.black, fontSize: FontSize.xl, marginBottom: 2 },
  waitingMapSub: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.md },
  waitingModeBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full },
  waitingModeText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs },

  versusRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    width: '100%', marginBottom: Spacing['2xl'],
  },
  playerBox: { alignItems: 'center', width: 90 },
  playerAvatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.bgSurface, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  playerInitial: { fontFamily: FontFamily.black, fontSize: 24, color: Colors.text },
  playerName: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.text, textAlign: 'center' },
  playerSub: { fontFamily: FontFamily.regular, fontSize: 10, color: Colors.textMuted },
  vsCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.accent + '30', borderWidth: 1, borderColor: Colors.accent,
    justifyContent: 'center', alignItems: 'center',
  },
  vsText: { fontFamily: FontFamily.black, fontSize: FontSize.sm, color: Colors.purple },

  countdownBox: { alignItems: 'center', marginBottom: Spacing.xl },
  countdownLabel: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: 4 },
  countdownNum: { fontFamily: FontFamily.black, fontSize: 52, color: Colors.cyan },

  cancelWaitBtn: { padding: Spacing.base },
  cancelWaitText: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.textDim },
});
