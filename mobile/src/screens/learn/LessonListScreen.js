import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { useLanguage } from '../../context/LanguageContext';

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
          { title: 'Chương 2: Lũy thừa - Logarithm', lessons: ['L12-C2-L1', 'L12-C2-L2'] },
          { title: 'Chương 3: Nguyên hàm - Tích phân', lessons: ['L12-C3-L1', 'L12-C3-L2'] },
        ],
      },
    ],
  },
];

function ChapterAccordion({ chapter, onSelectLesson }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.chapterBox}>
      <TouchableOpacity style={styles.chapterHeader} onPress={() => setOpen(v => !v)} activeOpacity={0.8}>
        <Text style={styles.chapterTitle}>{chapter.title}</Text>
        <Text style={{ color: Colors.textMuted, fontSize: 14 }}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.lessonList}>
          {chapter.lessons.map((slug, i) => (
            <TouchableOpacity key={slug} style={styles.lessonRow} onPress={() => onSelectLesson(slug)} activeOpacity={0.8}>
              <View style={styles.lessonDot} />
              <Text style={styles.lessonTitle}>{`Bài ${i + 1}`}</Text>
              <Text style={styles.lessonSlug}>{slug}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function LessonListScreen({ navigation }) {
  const { t } = useLanguage();
  const [selectedGroup, setSelectedGroup] = useState('THPT');
  const [selectedGrade, setSelectedGrade] = useState(null);

  const groups = CURRICULUM;
  const currentGroup = groups.find(g => g.group === selectedGroup);

  const handleSelectLesson = (slug) => {
    navigation.navigate('LessonWebView', { slug });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📚 {t('Chọn Bài Học', 'Select Lesson')}</Text>
        {/* Group toggle */}
        <View style={styles.groupRow}>
          {['THCS', 'THPT'].map(g => (
            <TouchableOpacity
              key={g}
              style={[styles.groupChip, selectedGroup === g && styles.groupChipActive]}
              onPress={() => { setSelectedGroup(g); setSelectedGrade(null); }}
            >
              <Text style={[styles.groupText, selectedGroup === g && styles.groupTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {currentGroup?.grades.map((gradeData) => (
          <View key={gradeData.grade} style={styles.gradeSection}>
            {/* Grade header */}
            <TouchableOpacity
              style={styles.gradeHeader}
              onPress={() => setSelectedGrade(s => s === gradeData.grade ? null : gradeData.grade)}
              activeOpacity={0.85}
            >
              <Text style={styles.gradeTitle}>{gradeData.grade}</Text>
              <Text style={styles.gradeCount}>{gradeData.chapters.length} {t('chương', 'chapters')}</Text>
              <Text style={{ color: Colors.cyan, fontSize: 16 }}>
                {selectedGrade === gradeData.grade ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

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
  header: { padding: Spacing.xl, paddingBottom: Spacing.md, backgroundColor: Colors.bgSurface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontFamily: FontFamily.black, fontSize: FontSize.xl, color: Colors.text, marginBottom: Spacing.md },
  groupRow: { flexDirection: 'row', gap: Spacing.sm },
  groupChip: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.xs, borderRadius: Radius.full, backgroundColor: Colors.bgGlass, borderWidth: 1, borderColor: Colors.border },
  groupChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  groupText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.textMuted },
  groupTextActive: { color: '#fff' },
  content: { padding: Spacing.xl },
  gradeSection: { marginBottom: Spacing.md },
  gradeHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgSurface, borderRadius: Radius.lg, padding: Spacing.base, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  gradeTitle: { fontFamily: FontFamily.extraBold, fontSize: FontSize.md, color: Colors.text, flex: 1 },
  gradeCount: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted },
  chaptersBox: { marginTop: Spacing.xs, paddingLeft: Spacing.base },
  chapterBox: { marginBottom: Spacing.xs, backgroundColor: Colors.bgGlass, borderRadius: Radius.md, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  chapterHeader: { flexDirection: 'row', alignItems: 'center', padding: Spacing.base, gap: Spacing.sm },
  chapterTitle: { flex: 1, fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.textBlue },
  lessonList: { paddingBottom: Spacing.sm },
  lessonRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, paddingHorizontal: Spacing.base, gap: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  lessonDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.cyan },
  lessonTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.text, width: 50 },
  lessonSlug: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, flex: 1 },
});
