/**
 * OnboardingScreen — Chào mừng sau lần đăng ký đầu tiên
 *
 * 3 slides:
 *  1. Chào mừng & giới thiệu DuoMath
 *  2. Chọn cấp học (THCS / THPT)
 *  3. Đặt mục tiêu hàng ngày
 *
 * Lưu vào AsyncStorage: 'onboarding_done' = 'true'
 */
import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions,
  Animated, ScrollView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';

const { width: W, height: H } = Dimensions.get('window');

// ── SLIDE DATA ────────────────────────────────────────────────────────────────
const SLIDES = [
  {
    key: 'welcome',
    emoji: '🎓',
    title: 'Chào mừng đến DuoMath!',
    titleEN: 'Welcome to DuoMath!',
    desc: 'Nền tảng học Toán song ngữ Việt – Anh đầu tiên với cơ chế gamification và đấu hạng theo thời gian thực.',
    descEN: 'The first bilingual math platform with gamification and real-time ranked battles.',
    color: Colors.primary,
    bg: 'rgba(14,165,233,0.08)',
    features: ['⚡ Đấu hạng thời gian thực', '🤖 AI trợ lý toán học', '📚 Kho bài học THCS & THPT'],
    featuresEN: ['⚡ Real-time ranked battle', '🤖 AI math assistant', '📚 THCS & THPT lesson library'],
  },
  {
    key: 'level',
    emoji: '📘',
    title: 'Bạn đang học lớp mấy?',
    titleEN: 'What grade are you in?',
    desc: 'Chúng tôi sẽ gợi ý nội dung phù hợp với trình độ của bạn.',
    descEN: "We'll recommend content tailored to your level.",
    color: Colors.teal,
    bg: 'rgba(20,184,166,0.08)',
    options: ['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12', 'Đã tốt nghiệp'],
  },
  {
    key: 'goal',
    emoji: '🎯',
    title: 'Đặt mục tiêu hàng ngày',
    titleEN: 'Set your daily goal',
    desc: 'Học đều đặn mỗi ngày sẽ giúp bạn tiến bộ nhanh hơn rất nhiều.',
    descEN: 'Consistent daily practice will help you improve much faster.',
    color: Colors.accent,
    bg: 'rgba(99,102,241,0.08)',
    goals: [
      { label: '⚡ Nhẹ nhàng', labelEN: '⚡ Casual', minutes: 5, desc: '5 phút / ngày' },
      { label: '📚 Bình thường', labelEN: '📚 Regular', minutes: 10, desc: '10 phút / ngày' },
      { label: '🔥 Nghiêm túc', labelEN: '🔥 Serious', minutes: 20, desc: '20 phút / ngày' },
      { label: '🏆 Cường độ cao', labelEN: '🏆 Intensive', minutes: 30, desc: '30 phút / ngày' },
    ],
  },
];

// ── DOT INDICATOR ─────────────────────────────────────────────────────────────
function Dots({ current, total, color }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i === current && [styles.dotActive, { backgroundColor: color, width: 20 }]]}
        />
      ))}
    </View>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function OnboardingScreen({ onDone }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(1);
  const [lang, setLang] = useState('vi');

  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const slide = SLIDES[slideIndex];

  const goNext = useCallback(async () => {
    if (slideIndex < SLIDES.length - 1) {
      // Animate out then in
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -W, duration: 250, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        setSlideIndex(i => i + 1);
        slideAnim.setValue(W);
        Animated.parallel([
          Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        ]).start();
      });
    } else {
      // Finish onboarding
      await AsyncStorage.setItem('onboarding_done', 'true');
      if (selectedGrade) await AsyncStorage.setItem('onboarding_grade', selectedGrade);
      await AsyncStorage.setItem('onboarding_goal_minutes', String(SLIDES[2].goals[selectedGoal].minutes));
      if (onDone) onDone();
    }
  }, [slideIndex, selectedGrade, selectedGoal]);

  const goBack = () => {
    if (slideIndex === 0) return;
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: W, duration: 250, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setSlideIndex(i => i - 1);
      slideAnim.setValue(-W);
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    });
  };

  const isLast = slideIndex === SLIDES.length - 1;
  const t = (vi, en) => lang === 'vi' ? vi : en;

  return (
    <View style={[styles.safe, { backgroundColor: Colors.bg }]}>
      {/* Lang toggle */}
      <TouchableOpacity style={styles.langToggle} onPress={() => setLang(l => l === 'vi' ? 'en' : 'vi')}>
        <Text style={styles.langToggleText}>{lang === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}</Text>
      </TouchableOpacity>

      <Animated.View style={[styles.content, { transform: [{ translateX: slideAnim }], opacity: opacityAnim }]}>
        {/* Background glow */}
        <View style={[styles.bgGlow, { backgroundColor: slide.bg }]} />

        {/* Emoji */}
        <View style={[styles.emojiWrapper, { borderColor: slide.color + '50', backgroundColor: slide.color + '15' }]}>
          <Text style={styles.emoji}>{slide.emoji}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{t(slide.title, slide.titleEN)}</Text>
        <Text style={styles.desc}>{t(slide.desc, slide.descEN)}</Text>

        {/* Slide 1: Features */}
        {slide.key === 'welcome' && (
          <View style={styles.featuresBox}>
            {(t(slide.features, slide.featuresEN)).map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Slide 2: Grade selector */}
        {slide.key === 'level' && (
          <View style={styles.gradeGrid}>
            {slide.options.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[styles.gradeChip, selectedGrade === opt && { borderColor: slide.color, backgroundColor: slide.color + '20' }]}
                onPress={() => setSelectedGrade(opt)}
              >
                <Text style={[styles.gradeChipText, selectedGrade === opt && { color: slide.color }]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Slide 3: Goal selector */}
        {slide.key === 'goal' && (
          <View style={styles.goalsBox}>
            {slide.goals.map((g, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.goalCard, selectedGoal === i && { borderColor: slide.color, backgroundColor: slide.color + '15' }]}
                onPress={() => setSelectedGoal(i)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.goalLabel, selectedGoal === i && { color: slide.color }]}>{t(g.label, g.labelEN)}</Text>
                  <Text style={styles.goalDesc}>{g.desc}</Text>
                </View>
                {selectedGoal === i && (
                  <View style={[styles.goalCheck, { backgroundColor: slide.color }]}>
                    <Text style={styles.goalCheckText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Animated.View>

      {/* Bottom navigation */}
      <View style={styles.bottomBar}>
        <Dots current={slideIndex} total={SLIDES.length} color={slide.color} />

        <View style={styles.btnRow}>
          {slideIndex > 0 ? (
            <TouchableOpacity style={styles.backBtn} onPress={goBack}>
              <Text style={styles.backBtnText}>← {t('Quay lại', 'Back')}</Text>
            </TouchableOpacity>
          ) : <View style={{ flex: 1 }} />}

          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: slide.color }]}
            onPress={goNext}
            activeOpacity={0.85}
          >
            <Text style={styles.nextBtnText}>
              {isLast ? `🚀 ${t('Bắt đầu!', "Let's go!")}` : `${t('Tiếp theo', 'Next')} →`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1 },

  langToggle: {
    position: 'absolute', top: Platform.OS === 'ios' ? 56 : 20, right: Spacing.xl, zIndex: 10,
    backgroundColor: Colors.bgGlass, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 5,
  },
  langToggleText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.text },

  content: {
    flex: 1, paddingHorizontal: Spacing.xl, paddingTop: Platform.OS === 'ios' ? 100 : 60,
    paddingBottom: 160, alignItems: 'center',
  },
  bgGlow: { ...StyleSheet.absoluteFillObject, borderRadius: 0 },

  emojiWrapper: {
    width: 96, height: 96, borderRadius: 48, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.xl,
  },
  emoji: { fontSize: 44 },

  title: {
    fontFamily: FontFamily.black, fontSize: FontSize['2xl'],
    color: Colors.text, textAlign: 'center', marginBottom: Spacing.sm,
    lineHeight: 34,
  },
  desc: {
    fontFamily: FontFamily.regular, fontSize: FontSize.base,
    color: Colors.textMuted, textAlign: 'center', lineHeight: 22,
    marginBottom: Spacing.xl, paddingHorizontal: Spacing.sm,
  },

  featuresBox: { gap: Spacing.sm, width: '100%' },
  featureRow: {
    backgroundColor: Colors.bgSurface, borderRadius: Radius.lg, padding: Spacing.base,
    borderWidth: 1, borderColor: Colors.border,
  },
  featureText: { fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: Colors.text },

  gradeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center' },
  gradeChip: {
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
    borderRadius: Radius.full, backgroundColor: Colors.bgGlass,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  gradeChipText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.textMuted },

  goalsBox: { gap: Spacing.sm, width: '100%' },
  goalCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgSurface, borderRadius: Radius.xl,
    padding: Spacing.base, borderWidth: 1.5, borderColor: Colors.border,
  },
  goalLabel: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.text, marginBottom: 2 },
  goalDesc: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted },
  goalCheck: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  goalCheckText: { fontFamily: FontFamily.black, fontSize: 13, color: '#fff' },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: Spacing.xl, paddingBottom: Platform.OS === 'ios' ? 36 : Spacing.xl,
    backgroundColor: Colors.bg,
    borderTopWidth: 1, borderTopColor: Colors.border,
    gap: Spacing.md,
  },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.bgGlass, borderWidth: 1, borderColor: Colors.border },
  dotActive: { height: 8, borderRadius: 4 },

  btnRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  backBtn: { flex: 1, padding: Spacing.sm },
  backBtnText: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.textMuted },
  nextBtn: {
    flex: 2, paddingVertical: Spacing.base, borderRadius: Radius.xl,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 14, elevation: 8,
  },
  nextBtnText: { fontFamily: FontFamily.black, fontSize: FontSize.base, color: '#fff' },
});
