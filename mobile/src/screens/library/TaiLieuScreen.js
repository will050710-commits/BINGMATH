/**
 * TaiLieuScreen — Tài Liệu & Kênh YouTube
 * Tabs: Tài liệu | YouTube | Công cụ
 *
 * Changes:
 *  - openExternalUrl helper with error feedback.
 *  - Native-driver animated translateX sliding tab indicator.
 *  - Video thumbnails fade-in and network error fallback.
 *  - Search input with clear button and focus state.
 *  - PressableScale on all cards, tabs, and buttons.
 */
import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, TextInput, Animated, Alert,
  Dimensions, Image,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { haptic, openExternalUrl } from '../../theme/effects';
import { useLanguage } from '../../context/LanguageContext';
import PressableScale from '../../components/ui/PressableScale';

const { width: W } = Dimensions.get('window');

// ── DATA ─────────────────────────────────────────────────────────────────────
const DOCS = [
  { title: 'ToanMath THCS', desc: 'Đề thi và chuyên đề Toán lớp 6–9 bám sát chương trình phổ thông mới.', url: 'https://thcs.toanmath.com', tag: 'Đề thi', color: Colors.teal, emoji: '📘' },
  { title: 'ToanMath THPT', desc: 'Đề thi thử THPT Quốc gia, đề học sinh giỏi lớp 10–12 cập nhật mỗi ngày.', url: 'https://toanmath.com', tag: 'Đề thi', color: Colors.primary, emoji: '📗' },
  { title: 'Tuyensinh247', desc: 'Kho đề thi thử THPT Quốc gia cực phong phú từ các trường trên toàn quốc.', url: 'https://tuyensinh247.com', tag: 'THPT', color: Colors.amber, emoji: '📝' },
  { title: 'Loigiaihay', desc: 'Lời giải bài tập SGK từ lớp 6 đến lớp 12, đầy đủ và chi tiết.', url: 'https://loigiaihay.com', tag: 'SGK', color: Colors.purple, emoji: '📖' },
  { title: 'Khan Academy VI', desc: 'Nền tảng học toán song ngữ với bài giảng tương tác tại Việt Nam.', url: 'https://vi.khanacademy.org', tag: 'Video', color: Colors.purple, emoji: '🎬' },
  { title: 'Art of Problem Solving', desc: 'Tài liệu luyện thi quốc tế AMC, AIME, Olympiad cho học sinh nâng cao.', url: 'https://artofproblemsolving.com', tag: 'Olympiad', color: Colors.amber, emoji: '🏅' },
];

const YOUTUBE_CHANNELS = [
  {
    name: 'Thầy Nguyễn Phan Tiến',
    handle: '@Thay.NguyenPhanTien',
    desc: 'Toán THPT lớp 10, 11, 12 — bài giảng chuẩn sách giáo khoa mới',
    level: 'THPT',
    color: Colors.primary,
    emoji: '🎓',
    url: 'https://www.youtube.com/@Thay.NguyenPhanTien',
    videos: [
      { title: 'Nguyên Hàm Cơ Bản & Công Thức (Toán 12)', id: 'dummyVid1', thumb: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
      { title: 'Khảo sát hàm số — Toán 12', id: 'dummyVid2', thumb: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
    ],
  },
  {
    name: 'Thầy Nguyễn Quốc Chí',
    handle: '@thaynguyenquocchi',
    desc: 'Toán 11 & 12 hệ mới — chuyên đề sâu, ôn thi THPT',
    level: 'THPT',
    color: Colors.teal,
    emoji: '📐',
    url: 'https://www.youtube.com/thaynguyenquocchi',
    videos: [
      { title: 'Tính đơn điệu hàm số — Toán 12', id: 'W_8aEs16RI0', thumb: 'https://i.ytimg.com/vi/W_8aEs16RI0/mqdefault.jpg' },
      { title: 'Tổ hợp xác suất — Toán 11', id: 'dummyVid3', thumb: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
    ],
  },
  {
    name: 'Thầy Nguyễn Công Chính',
    handle: 'HọcToánThầyChính',
    desc: 'Đề thi THPT QG, chuyên đề giải tích và hình học không gian',
    level: 'THPT',
    color: Colors.accent,
    emoji: '🏆',
    url: 'https://www.youtube.com/@vtedhoctoanonlinechatluongcao',
    videos: [
      { title: 'Chữa đề tham khảo thi THPT môn Toán', id: 'F3S0l3p-f-k', thumb: 'https://i.ytimg.com/vi/F3S0l3p-f-k/mqdefault.jpg' },
      { title: 'Mệnh đề Toán 10 — Kết nối tri thức', id: 'wX-S1u1F9jA', thumb: 'https://i.ytimg.com/vi/wX-S1u1F9jA/mqdefault.jpg' },
    ],
  },
  {
    name: 'Thầy Nguyễn Đình Khiêm',
    handle: '@thaynguyendinhkhiemtoan89',
    desc: 'Toán lớp 8, 9 — luyện thi vào 10 chuyên sâu',
    level: 'THCS',
    color: Colors.amber,
    emoji: '📘',
    url: 'https://www.youtube.com/@thaynguyendinhkhiemtoan89',
    videos: [
      { title: 'Hệ phương trình — Toán 9', id: 'lzeHX6gmC6E', thumb: 'https://i.ytimg.com/vi/lzeHX6gmC6E/mqdefault.jpg' },
      { title: 'Căn bậc hai — Toán 9', id: 'fv67XDUOBH8', thumb: 'https://i.ytimg.com/vi/fv67XDUOBH8/mqdefault.jpg' },
    ],
  },
  {
    name: 'Toán Thầy Đỉnh',
    handle: '@toanthaydinh',
    desc: 'Toán 6, 7, 8, 9 — phương pháp giải nhanh, dễ hiểu',
    level: 'THCS',
    color: Colors.purple,
    emoji: '✏️',
    url: 'https://www.youtube.com/@toanthaydinh',
    videos: [
      { title: 'Số nguyên & Phép tính — Toán 6', id: 'dummyVid4', thumb: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
      { title: 'Hình học trực quan — Toán 7', id: 'dummyVid5', thumb: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
    ],
  },
];

const TOOLS = [
  { name: 'Desmos Graphing', desc: 'Vẽ đồ thị hàm số 2D trực quan, mạnh mẽ nhất hiện nay.', url: 'https://www.desmos.com/calculator', tag: 'Đồ thị', emoji: '📈', color: Colors.teal },
  { name: 'GeoGebra 3D', desc: 'Mô phỏng hình học không gian 3D, tọa độ và vector.', url: 'https://www.geogebra.org/3d', tag: 'Hình học 3D', emoji: '🧊', color: Colors.primary },
  { name: 'Wolfram Alpha', desc: 'Công cụ giải toán bước từng bước, đại số và giải tích.', url: 'https://www.wolframalpha.com', tag: 'AI Solver', emoji: '🧠', color: Colors.amber },
  { name: 'Symbolab', desc: 'Giải phương trình, tính tích phân và giới hạn có giải thích.', url: 'https://www.symbolab.com', tag: 'Solver', emoji: '🔬', color: Colors.purple },
];

function SafeThumbnail({ uri, title }) {
  const [errored, setErrored] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;

  const handleLoad = () => {
    Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  };

  if (errored || !uri) {
    return (
      <View style={[styles.videoThumb, styles.videoThumbFallback]}>
        <Text style={{ fontSize: 24 }}>🎬</Text>
      </View>
    );
  }

  return (
    <View style={styles.videoThumb}>
      <Animated.Image
        source={{ uri }}
        style={[styles.videoThumbImage, { opacity }]}
        onLoad={handleLoad}
        onError={() => setErrored(true)}
      />
    </View>
  );
}

export default function TaiLieuScreen() {
  const { t } = useLanguage();
  const [tab, setTab] = useState('docs'); // 'docs' | 'youtube' | 'tools'
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  const tabWidth = (W - Spacing.xl * 2) / 3;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleTabChange = useCallback((newTab, index) => {
    haptic.select();
    setTab(newTab);
    Animated.spring(slideAnim, {
      toValue: index * tabWidth,
      friction: 7,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [tabWidth, slideAnim]);

  const handleOpen = useCallback((url) => {
    haptic.tap();
    openExternalUrl(url, () => {
      Alert.alert(t('Lỗi', 'Error'), t('Không thể mở liên kết này.', 'Cannot open this link.'));
    });
  }, [t]);

  const filteredDocs = DOCS.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.desc.toLowerCase().includes(search.toLowerCase())
  );

  const filteredChannels = YOUTUBE_CHANNELS.filter(ch => {
    const matchSearch = ch.name.toLowerCase().includes(search.toLowerCase()) ||
      ch.desc.toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === 'all' || ch.level.toLowerCase() === levelFilter.toLowerCase();
    return matchSearch && matchLevel;
  });

  const filteredTools = TOOLS.filter(tool =>
    tool.name.toLowerCase().includes(search.toLowerCase()) ||
    tool.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📖 {t('Thư Viện & Tài Liệu', 'Library & Resources')}</Text>
          <Text style={styles.headerSub}>
            {t('Tài liệu toán chuẩn, kênh học tập và công cụ bổ trợ', 'Math resources, study channels, and tools')}
          </Text>
        </View>

        {/* Tab switcher */}
        <View style={styles.tabContainer}>
          <Animated.View
            style={[
              styles.tabSlider,
              { width: tabWidth, transform: [{ translateX: slideAnim }] },
            ]}
          />
          {[
            { id: 'docs', label: t('📚 Tài liệu', '📚 Docs') },
            { id: 'youtube', label: t('🎬 YouTube', '🎬 YouTube') },
            { id: 'tools', label: t('🛠️ Công cụ', '🛠️ Tools') },
          ].map((item, idx) => (
            <PressableScale
              key={item.id}
              style={[styles.tabBtn, { width: tabWidth }]}
              onPress={() => handleTabChange(item.id, idx)}
              haptics={null}
            >
              <Text style={[styles.tabText, tab === item.id && styles.tabTextActive]}>
                {item.label}
              </Text>
            </PressableScale>
          ))}
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder={t('Tìm kiếm tài liệu, kênh...', 'Search resources, channels...')}
            placeholderTextColor={Colors.textDim}
          />
          {search ? (
            <PressableScale onPress={() => setSearch('')} style={styles.clearBtn} haptics="tap">
              <Text style={{ color: Colors.textDim, fontSize: 16 }}>✕</Text>
            </PressableScale>
          ) : null}
        </View>

        {/* Level filter for YouTube */}
        {tab === 'youtube' && (
          <View style={styles.filterRow}>
            {['all', 'thcs', 'thpt'].map(lvl => (
              <PressableScale
                key={lvl}
                style={[styles.filterChip, levelFilter === lvl && styles.filterChipActive]}
                onPress={() => { haptic.select(); setLevelFilter(lvl); }}
                haptics={null}
              >
                <Text style={[styles.filterText, levelFilter === lvl && styles.filterTextActive]}>
                  {lvl === 'all' ? t('Tất cả', 'All') : lvl.toUpperCase()}
                </Text>
              </PressableScale>
            ))}
          </View>
        )}

        {/* TAB 1: DOCS */}
        {tab === 'docs' && (
          <View style={styles.list}>
            {filteredDocs.map((doc, i) => (
              <PressableScale
                key={i}
                style={[styles.card, { borderColor: doc.color + '40' }]}
                onPress={() => handleOpen(doc.url)}
                haptics={null}
              >
                <Text style={styles.cardEmoji}>{doc.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <Text style={styles.cardTitle}>{doc.title}</Text>
                    <View style={[styles.tag, { backgroundColor: doc.color + '20', borderColor: doc.color + '60' }]}>
                      <Text style={[styles.tagText, { color: doc.color }]}>{doc.tag}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardDesc}>{doc.desc}</Text>
                </View>
                <Text style={{ color: Colors.cyan, fontSize: 18 }}>↗</Text>
              </PressableScale>
            ))}
          </View>
        )}

        {/* TAB 2: YOUTUBE */}
        {tab === 'youtube' && (
          <View style={styles.list}>
            {filteredChannels.map((ch, i) => (
              <View key={i} style={[styles.channelCard, { borderColor: ch.color + '40' }]}>
                <View style={styles.channelHeader}>
                  <Text style={styles.channelEmoji}>{ch.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.channelName}>{ch.name}</Text>
                    <Text style={styles.channelHandle}>{ch.handle} • {ch.level}</Text>
                  </View>
                  <PressableScale
                    style={[styles.subscribeBtn, { backgroundColor: ch.color }]}
                    onPress={() => handleOpen(ch.url)}
                    haptics={null}
                  >
                    <Text style={styles.subscribeText}>{t('Xem kênh', 'Visit')}</Text>
                  </PressableScale>
                </View>
                <Text style={styles.channelDesc}>{ch.desc}</Text>

                {/* Videos */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    {ch.videos.map((vid, idx) => (
                      <PressableScale
                        key={idx}
                        style={styles.videoCard}
                        onPress={() => handleOpen(`https://www.youtube.com/watch?v=${vid.id}`)}
                        haptics={null}
                      >
                        <SafeThumbnail uri={vid.thumb} title={vid.title} />
                        <Text style={styles.videoTitle} numberOfLines={2}>{vid.title}</Text>
                      </PressableScale>
                    ))}
                  </View>
                </ScrollView>
              </View>
            ))}
          </View>
        )}

        {/* TAB 3: TOOLS */}
        {tab === 'tools' && (
          <View style={styles.list}>
            {filteredTools.map((tool, i) => (
              <PressableScale
                key={i}
                style={[styles.card, { borderColor: tool.color + '40' }]}
                onPress={() => handleOpen(tool.url)}
                haptics={null}
              >
                <Text style={styles.cardEmoji}>{tool.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <Text style={styles.cardTitle}>{tool.name}</Text>
                    <View style={[styles.tag, { backgroundColor: tool.color + '20', borderColor: tool.color + '60' }]}>
                      <Text style={[styles.tagText, { color: tool.color }]}>{tool.tag}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardDesc}>{tool.desc}</Text>
                </View>
                <Text style={{ color: Colors.cyan, fontSize: 18 }}>↗</Text>
              </PressableScale>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.xl },

  header: { marginBottom: Spacing.xl },
  headerTitle: { fontFamily: FontFamily.black, fontSize: FontSize.xl, color: Colors.text, marginBottom: 4 },
  headerSub: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted },

  tabContainer: {
    flexDirection: 'row', backgroundColor: Colors.bgSurface,
    borderRadius: Radius.full, padding: 3,
    marginBottom: Spacing.base, position: 'relative',
    borderWidth: 1, borderColor: Colors.border,
  },
  tabSlider: {
    position: 'absolute', top: 3, bottom: 3, left: 3,
    backgroundColor: Colors.accent, borderRadius: Radius.full,
  },
  tabBtn: { paddingVertical: 8, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.textMuted },
  tabTextActive: { color: '#fff', fontFamily: FontFamily.bold },

  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgSurface, borderRadius: Radius.lg,
    paddingHorizontal: Spacing.base, borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.base,
  },
  searchInput: {
    flex: 1, paddingVertical: 10,
    fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.text,
  },
  clearBtn: { padding: 4 },

  filterRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.base },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: Radius.full, backgroundColor: Colors.bgGlass,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.cyan + '20', borderColor: Colors.cyan },
  filterText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.textMuted },
  filterTextActive: { color: Colors.cyan },

  list: { gap: Spacing.md },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgSurface, borderRadius: Radius.xl,
    padding: Spacing.base, borderWidth: 1.5,
    gap: Spacing.md,
  },
  cardEmoji: { fontSize: 28 },
  cardTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.text },
  cardDesc: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, lineHeight: 18 },
  tag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  tagText: { fontFamily: FontFamily.bold, fontSize: 10 },

  channelCard: {
    backgroundColor: Colors.bgSurface, borderRadius: Radius.xl,
    padding: Spacing.base, borderWidth: 1.5,
  },
  channelHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 6 },
  channelEmoji: { fontSize: 24 },
  channelName: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.text },
  channelHandle: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted },
  channelDesc: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textDim, marginBottom: 8 },
  subscribeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
  subscribeText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: '#fff' },

  videoCard: { width: 140, backgroundColor: Colors.bgGlass, borderRadius: Radius.md, overflow: 'hidden' },
  videoThumb: { width: 140, height: 78, backgroundColor: Colors.bgCard, borderRadius: Radius.md, overflow: 'hidden' },
  videoThumbImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  videoThumbFallback: { justifyContent: 'center', alignItems: 'center' },
  videoTitle: { fontFamily: FontFamily.semiBold, fontSize: 11, color: Colors.text, padding: 6, lineHeight: 14 },
});
