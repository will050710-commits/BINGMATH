import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { isAdminAccount } from '../utils/admin';
import { createSession, sendMessage, resetSession } from '../api/chat';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

/**
 * BingSideBar — V1.0 Official Edge-Tucking Draggable AI Tutor
 * (Hermes bundle lines 282784–286240)
 */
export default function BingSideBar() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const isAdmin = isAdminAccount(profile, user);

  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('hint');
  const [isTucked, setIsTucked] = useState(true);
  const [edgeSide, setEdgeSide] = useState('right');

  const initX = SCREEN_W - 44;
  const initY = Math.max(120, Math.round(SCREEN_H * 0.38));
  const pan = useRef(new Animated.ValueXY({ x: initX, y: initY })).current;
  const posRef = useRef({ x: initX, y: initY });
  const scrollRef = useRef(null);

  useEffect(() => {
    createSession()
      .then((sid) => setSessionId(sid || `offline-${Date.now()}`))
      .catch(() => setSessionId(`offline-${Date.now()}`));
  }, []);

  const handleFabPress = () => {
    if (!isTucked) {
      setIsOpen(true);
      return;
    }
    setIsTucked(false);
    const targetX = edgeSide === 'right' ? SCREEN_W - 146 : 8;
    const targetY = posRef.current.y;
    Animated.spring(pan, {
      toValue: { x: targetX, y: targetY },
      useNativeDriver: false,
      friction: 7,
      tension: 40,
    }).start();
    posRef.current = { x: targetX, y: targetY };
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.hypot(g.dx, g.dy) > 4,
      onPanResponderGrant: () => {
        pan.setOffset({ x: posRef.current.x, y: posRef.current.y });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, g) => {
        pan.flattenOffset();
        if (Math.hypot(g.dx, g.dy) < 6) {
          handleFabPress();
          return;
        }
        const rawX = posRef.current.x + g.dx;
        const clampedY = Math.min(Math.max(60, posRef.current.y + g.dy), SCREEN_H - 130);
        const side = rawX < SCREEN_W / 2 ? 'left' : 'right';
        const targetX = side === 'right' ? SCREEN_W - 44 : 0;
        setIsTucked(true);
        setEdgeSide(side);
        Animated.spring(pan, {
          toValue: { x: targetX, y: clampedY },
          useNativeDriver: false,
          friction: 7,
          tension: 40,
        }).start();
        posRef.current = { x: targetX, y: clampedY };
      },
    }),
  ).current;

  const onSend = async (overrideText) => {
    const text = (overrideText ?? inputText).trim();
    if (!text || isLoading) return;
    if (!overrideText) setInputText('');

    setMessages((prev) => [...prev, { id: String(Date.now()), role: 'user', content: text }]);
    setIsLoading(true);
    try {
      const sid = sessionId || `offline-${Date.now()}`;
      const res = await sendMessage(sid, text, mode);
      const reply =
        res?.reply ||
        res?.content ||
        t('Xin chào! BingMCB đã nhận câu hỏi của bạn.', 'Hello! BingMCB received your question.');
      setMessages((prev) => [...prev, { id: String(Date.now() + 1), role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          content:
            '⚠️ ' +
            t(
              'Không thể kết nối máy chủ BingMCB lúc này. Vui lòng thử lại sau giây lát!',
              'Could not connect to BingMCB AI server. Please try again shortly!',
            ),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.fab,
          {
            transform: pan.getTranslateTransform(),
            width: isTucked ? 44 : 138,
            borderColor: colors.borderAccent,
          },
        ]}
      >
        <TouchableOpacity onPress={handleFabPress} activeOpacity={0.85} style={styles.fabInner}>
          <Text style={styles.fabText}>
            {isTucked
              ? edgeSide === 'right'
                ? `❮ ${isAdmin ? '👑' : '🎓'}`
                : `${isAdmin ? '👑' : '🎓'} ❯`
              : `${isAdmin ? '👑' : '🎓'} BingMCB`}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <Modal visible={isOpen} transparent animationType="slide" onRequestClose={() => setIsOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.sheet, { backgroundColor: colors.bgElevated }]}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>🎓 BingMCB AI Tutor</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => {
                    if (sessionId) resetSession(sessionId).catch(() => {});
                    setMessages([]);
                  }}
                >
                  <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>🔄</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsOpen(false)}>
                  <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[styles.modeBtn, mode === 'hint' && { borderColor: colors.primary }]}
                onPress={() => setMode('hint')}
              >
                <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>
                  💡 {t('Chế độ Gợi ý (Hint)', 'Hint Mode')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeBtn, mode === 'solution' && { borderColor: colors.accent }]}
                onPress={() => setMode('solution')}
              >
                <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>
                  📝 {t('Lời giải chi tiết', 'Full Solution')}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView ref={scrollRef} style={styles.chatArea}>
              {messages.map((m) => (
                <View
                  key={m.id}
                  style={[
                    styles.bubble,
                    m.role === 'user' ? styles.userBubble : styles.botBubble,
                  ]}
                >
                  <Text style={{ color: '#f8fafc', fontSize: 13.5 }}>{m.content}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                placeholder={t('Nhập bài toán...', 'Ask a math question...')}
                placeholderTextColor={colors.textMuted}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={() => onSend()}
              />
              <TouchableOpacity style={[styles.sendBtn, { backgroundColor: colors.primary }]} onPress={() => onSend()}>
                <Text style={{ color: '#020c1b', fontWeight: '800' }}>➤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    backgroundColor: 'rgba(8, 145, 178, 0.92)',
    zIndex: 9995,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabInner: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  fabText: { color: '#ffffff', fontWeight: '800', fontSize: 13 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: { fontSize: 16, fontWeight: '800' },
  modeRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
  },
  chatArea: { flex: 1, marginBottom: 10 },
  bubble: { padding: 10, borderRadius: 14, marginBottom: 8, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#0284c7' },
  botBubble: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.08)' },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sendBtn: {
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
