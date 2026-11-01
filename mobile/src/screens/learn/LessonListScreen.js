/**
 * LessonListScreen — Chọn Bài Học theo chương trình THCS/THPT
 *
 * Changes:
 *  - LayoutAnimation.configureNext for smooth accordion expand/collapse.
 *  - Chevron rotation component.
 *  - PressableScale on group chips, grade headers, and lesson rows.
 *  - Light haptic feedback on navigation.
 */
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { haptic } from '../../theme/effects';
import { useLanguage } from '../../context/LanguageContext';
import PressableScale from '../../components/ui/PressableScale';
import Chevron from '../../components/ui/Chevron';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const animateNext = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

const CURRICULUM = [
  {
    group: 'THCS',
    grades: [
      {
        grade: 'Lớp 6',
        chapters: [
          { title: 'Chương 1: Số tự nhiên', lessons: ['L6-C1-L1', 'L6-C1-L2', 'L6-C1-L3'] },
          { title: 'Chương 2: Số nguyên', lessons: ['L6-C2-L1', 'L6-C2-L2', 'L6-C2-L3'] },
          { title: 'Chương 3: Phân số', lessons: ['L6-C3-L1', 'L6-C3-L2'] },
          { title: 'Chương 4: Hình học', lessons: ['L6-C4-L1', 'L6-C4-L2'] },
        ],
      },
      {
        grade: 'Lớp 7',
        chapters: [
          { title: 'Chương 1: Số hữu tỉ', lessons: ['L7-C1-L1', 'L7-C1-L2', 'L7-C1-L3'] },
          { title: 'Chương 2: Thống kê', lessons: ['L7-C2-L1', 'L7-C2-L2'] },
          { title: 'Chương 3: Biểu thức đại số', lessons: ['L7-C3-L1', 'L7-C3-L2'] },
          { title: 'Chương 4: Hình học phẳng', lessons: ['L7-C4-L1', 'L7-C4-L2', 'L7-C4-L3'] },
        ],
      },
      {
        grade: 'Lớp 8',
        chapters: [
          { title: 'Chương 1: Đa thức', lessons: ['L8-C1-L1', 'L8-C1-L2', 'L8-C1-L3'] },
          { title: 'Chương 2: Phân thức', lessons: ['L8-C2-L1', 'L8-C2-L2', 'L8-C2-L3'] },
          { title: 'Chương 3: Hình học', lessons: ['L8-C3-L1', 'L8-C3-L2'] },
          { title: 'Chương 4: Phương trình', lessons: ['L8-C4-L1', 'L8-C4-L2'] },
        ],
      },
      {
        grade: 'Lớp 9',
        chapters: [
          { title: 'Chương 1: Căn thức', lessons: ['L9-C1-L1', 'L9-C1-L2', 'L9-C1-L3'] },
          { title: 'Chương 2: Hàm số', lessons: ['L9-C2-L1', 'L9-C2-L2', 'L9-C2-L3'] },
          { title: 'Chương 3: Hệ phương trình', lessons: ['L9-C3-L1', 'L9-C3-L2'] },
          { title: 'Chương 4: Hình học', lessons: ['L9-C4-L1', 'L9-C4-L2'] },
        ],
      },
    ],
  },
  {
    group: 'THPT',
    grades: [
      {
        grade: 'Lớp 10',
        chapters: [
          { title: 'Chương 1: Mệnh đề - Tập hợp', lessons: ['L10-test1-section1', 'L10-test1-section2', 'L10-test1-section3'] },
          { title: 'Chương 2: Bất phương trình', lessons: ['L10-test2-section1', 'L10-test2-section2'] },
          { title: 'Chương 3: Hàm số', lessons: ['L10-test3-section1'] },
        ],
      },
      {
        grade: 'Lớp 11',
        chapters: [
          { title: 'Chương 1: Hàm lượng giác', lessons: ['L11-C1-L1', 'L11-C1-L2', 'L11-C1-L3'] },
          { title: 'Chương 2: Tổ hợp - Xác suất', lessons: ['L11-C2-L1', 'L11-C2-L2'] },
          { title: 'Chương 3: Dãy số', lessons: ['L11-C3-L1', 'L11-C3-L2'] },
        ],
      },
      {
        grade: 'Lớp 12',
        chapters: [
          { title: 'Chương 1: Hàm số', lessons: ['L12-C1-L1', 'L12-C1-L2', 'L12-C1-L3'] },
          { title: 'Chương 2: Mũ - Logarit', lessons: ['L12-C2-L1', 'L12-C2-L2'] },
          { title: 'Chương 3: Tích phân', lessons: ['L12-C3-L1', 'L12-C3-L2', 'L12-C3-L3'] },
          { title: 'Chương 4: Số phức', lessons: ['L12-C4-L1', 'L12-C4-L2'] },
        ],
      },
    ],
  },
];

function ChapterAccordion({ chapter, onSelectLesson }) {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    animateNext();
    setOpen(v => !v);
  };

  return (
    <View style={styles.chapterBox}>
      <PressableScale style={styles.chapterHeader} onPress={toggle} haptics="tap">
        <Text style={styles.chapterTitle}>{chapter.title}</Text>
        <Chevron open={open} color={Colors.textCyan} />
      </PressableScale>

      {open && (
        <View style={styles.lessonList}>
          {chapter.lessons.map((slug, i) => (
            <PressableScale
              key={slug}
              style={styles.lessonRow}
              onPress={() => onSelectLesson(slug)}
              haptics="select"
            >
              <View style={styles.lessonDot} />
              <Text style={styles.lessonTitle}>Bài {i + 1}</Text>
              <Text style={styles.lessonSlug} numberOfLines={1}>{slug}</Text>
              <Text style={{ color: Colors.cyan, fontSize: 16 }}>→</Text>
            </PressableScale>
          ))}
        </View>
      )}
    </View>
  );
}

export default function LessonListScreen({ navigation }) {
  const { t } = useLanguage();
  const [selectedGroup, setSelectedGroup] = useState('THPT');
  const [selectedGrade, setSelectedGrade] = useState('Lớp 10');

  const currentGroup = CURRICULUM.find(c => c.group === selectedGroup);

  const handleSelectLesson = (slug) => {
    haptic.tap();
    navigation.navigate('LessonWebView', { slug });
  };

  const handleToggleGrade = (grade) => {
    animateNext();
    setSelectedGrade(s => (s === grade ? null : grade));
  };

  const handleToggleGroup = (g) => {
    animateNext();
    setSelectedGroup(g);
    setSelectedGrade(null);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📚 {t('Chọn Bài Học', 'Select Lesson')}</Text>
        {/* Group toggle */}
        <View style={styles.groupRow}>
          {['THCS', 'THPT'].map(g => (
            <PressableScale
              key={g}
              style={[styles.groupChip, selectedGroup === g && styles.groupChipActive]}
              onPress={() => handleToggleGroup(g)}
              haptics="select"
              scaleTo={0.95}
            >
              <Text style={[styles.groupText, selectedGroup === g && styles.groupTextActive]}>{g}</Text>
            </PressableScale>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {currentGroup?.grades.map((gradeData) => (
          <View key={gradeData.grade} style={styles.gradeSection}>
            {/* Grade header */}
            <PressableScale
              style={styles.gradeHeader}
              onPress={() => handleToggleGrade(gradeData.grade)}
              haptics="tap"
              scaleTo={0.98}
            >
              <Text style={styles.gradeTitle}>{gradeData.grade}</Text>
              <Text style={styles.gradeCount}>{gradeData.chapters.length} {t('chương', 'chapters')}</Text>
              <Chevron open={selectedGrade === gradeData.grade} color={Colors.cyan} />
            </PressableScale>

            {selectedGrade === gradeData.grade && (
              <View style={styles.chaptersBox}>
                {gradeData.chapters.map((ch) => (
                  <ChapterAccordion key={ch.title} chapter={ch} onSelectLesson={handleSelectLesson} />
                ))}
              </View>
            )}
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    padding: Spacing.xl, paddingBottom: Spacing.md,
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontFamily: FontFamily.black, fontSize: FontSize.xl, color: Colors.text, marginBottom: Spacing.md },
  groupRow: { flexDirection: 'row', gap: Spacing.sm },
  groupChip: {
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.xs,
    borderRadius: Radius.full, backgroundColor: Colors.bgGlass,
    borderWidth: 1, borderColor: Colors.border,
  },
  groupChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  groupText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.textMuted },
  groupTextActive: { color: '#fff' },
  content: { padding: Spacing.xl },
  gradeSection: { marginBottom: Spacing.md },
  gradeHeader: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgSurface, borderRadius: Radius.lg,
    padding: Spacing.base, borderWidth: 1, borderColor: Colors.border,
    gap: Spacing.sm,
  },
  gradeTitle: { fontFamily: FontFamily.extraBold, fontSize: FontSize.md, color: Colors.text, flex: 1 },
  gradeCount: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted },
  chaptersBox: { marginTop: Spacing.xs, paddingLeft: Spacing.base },
  chapterBox: {
    marginBottom: Spacing.xs, backgroundColor: Colors.bgGlass,
    borderRadius: Radius.md, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border,
  },
  chapterHeader: { flexDirection: 'row', alignItems: 'center', padding: Spacing.base, gap: Spacing.sm },
  chapterTitle: { flex: 1, fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.textBlue },
  lessonList: { paddingBottom: Spacing.sm },
  lessonRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.base,
    gap: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  lessonDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.cyan },
  lessonTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.text, width: 50 },
  lessonSlug: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, flex: 1 },
});
