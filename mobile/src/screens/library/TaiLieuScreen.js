/**
 * TaiLieuScreen — Tài Liệu & Kênh YouTube
 * Tabs: Tài liệu | YouTube | Công cụ
 */
import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Linking, TextInput, Animated, Image,
  Dimensions,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { useLanguage } from '../../context/LanguageContext';

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
      { title: 'Tính đơn điệu hàm số — Toán 12', id: 'W_8aEs16RI0', thumb: `https://i.ytimg.com/vi/W_8aEs16RI0/mqdefault.jpg` },
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
      { title: 'Chữa đề tham khảo thi THPT môn Toán', id: 'F3S0l3p-f-k', thumb: `https://i.ytimg.com/vi/F3S0l3p-f-k/mqdefault.jpg` },
      { title: 'Mệnh đề Toán 10 — Kết nối tri thức', id: 'wX-S1u1F9jA', thumb: `https://i.ytimg.com/vi/wX-S1u1F9jA/mqdefault.jpg` },
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
      { title: 'Hệ phương trình — Toán 9', id: 'lzeHX6gmC6E', thumb: `https://i.ytimg.com/vi/lzeHX6gmC6E/mqdefault.jpg` },
      { title: 'Căn bậc hai — Toán 9', id: 'fv67XDUOBH8', thumb: `https://i.ytimg.com/vi/fv67XDUOBH8/mqdefault.jpg` },
    ],
  },
  {
    name: 'Toán Thầy Đỉnh',
    handle: '@toanthayinh1592',
    desc: 'Bài giảng & đề kiểm tra THCS — dễ hiểu, bám sát chương trình',
    level: 'THCS',
    color: Colors.pink,
    emoji: '🌟',
    url: 'https://www.youtube.com/@toanthayinh1592',
    videos: [
      { title: 'Phân thức đại số — Toán 8', id: 'dummyVid4', thumb: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
    ],
  },
  {
    name: 'Thầy Nguyễn Tiến Đạt',
    handle: '@thaynguyentiendat',
    desc: 'Livestream ôn thi, mệnh đề Toán 10, luyện đề THPT QG',
    level: 'THPT',
    color: Colors.teal,
    emoji: '📡',
    url: 'https://www.youtube.com/thaynguyentiendat/streams',
    videos: [
      { title: 'Mệnh đề toán học — Toán 10 hệ mới', id: 'N4SeBnHNzlA', thumb: `https://i.ytimg.com/vi/N4SeBnHNzlA/mqdefault.jpg` },
    ],
  },
];

const TOOLS = [
  { title: 'Desmos Graphing', desc: 'Vẽ đồ thị tương tác miễn phí — hỗ trợ hàm số, phương trình, bất phương trình.', url: 'https://www.desmos.com/calculator', tag: 'Đồ thị', color: Colors.accent, emoji: '📈' },
  { title: 'Wolfram Alpha', desc: 'Tính toán, giải phương trình, vẽ đồ thị, xem bước giải chi tiết.', url: 'https://www.wolframalpha.com', tag: 'Tính toán', color: Colors.accent, emoji: '🔬' },
  { title: 'GeoGebra', desc: 'Phần mềm hình học động, vẽ hình, tính toán đại số, thống kê.', url: 'https://www.geogebra.org', tag: 'Hình học', color: Colors.teal, emoji: '📐' },
  { title: 'Mathway', desc: 'Giải toán bước-bước: đại số, giải tích, thống kê, hóa học.', url: 'https://www.mathway.com', tag: 'Giải toán', color: Colors.purple, emoji: '🧮' },
  { title: 'Khan Academy', desc: 'Hệ thống bài tập phân loại theo kỹ năng của Khan Academy quốc tế.', url: 'https://www.khanacademy.org/math', tag: 'Quốc tế', color: Colors.primary, emoji: '🌍' },
  { title: 'Math is Fun', desc: 'Trang học toán tiếng Anh trực quan sinh động dành cho học sinh THCS.', url: 'https://www.mathsisfun.com', tag: 'Trực quan', color: Colors.amber, emoji: '✨' },
];

const TABS = ['Tài liệu', 'YouTube', 'Công cụ'];

// ── RESOURCE CARD ─────────────────────────────────────────────────────────────
function ResourceCard({ item }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => Linking.openURL(item.url)}
      activeOpacity={0.85}
    >
      <View style={[styles.cardLeft, { backgroundColor: item.color + '20' }]}>
        <Text style={styles.cardEmoji}>{item.emoji}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <View style={[styles.tagChip, { borderColor: item.color + '60', backgroundColor: item.color + '18' }]}>
            <Text style={[styles.tagText, { color: item.color }]}>{item.tag}</Text>
          </View>
        </View>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.desc}</Text>
        <Text style={styles.cardUrl} numberOfLines={1}>{item.url.replace('https://', '')}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ── YOUTUBE CHANNEL CARD ──────────────────────────────────────────────────────
function ChannelCard({ channel }) {
  return (
    <View style={[styles.channelCard, { borderColor: channel.color + '40' }]}>
      {/* Channel header */}
      <View style={styles.channelHeader}>
        <View style={[styles.channelAvatar, { backgroundColor: channel.color + '25', borderColor: channel.color }]}>
          <Text style={styles.channelAvatarEmoji}>{channel.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.channelName}>{channel.name}</Text>
          <Text style={styles.channelHandle}>{channel.handle}</Text>
        </View>
        <View style={[styles.levelBadge, { backgroundColor: channel.color + '20', borderColor: channel.color + '50' }]}>
          <Text style={[styles.levelBadgeText, { color: channel.color }]}>{channel.level}</Text>
        </View>
      </View>

      <Text style={styles.channelDesc}>{channel.desc}</Text>

      {/* Video thumbnails — horizontal scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.videosScroll}>
        {channel.videos.map((v, i) => (
          <TouchableOpacity
            key={i}
            style={styles.videoCard}
            onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${v.id}`)}
            activeOpacity={0.85}
          >
            <View style={styles.thumbWrapper}>
              <Image
                source={{ uri: v.thumb }}
                style={styles.thumb}
                resizeMode="cover"
              />
              <View style={styles.playOverlay}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
            </View>
            <Text style={styles.videoTitle} numberOfLines={2}>{v.title}</Text>
          </TouchableOpacity>
        ))}
        {/* "View all" card */}
        <TouchableOpacity
          style={[styles.videoCard, styles.viewAllCard]}
          onPress={() => Linking.openURL(channel.url)}
          activeOpacity={0.85}
        >
          <Text style={[styles.viewAllEmoji]}>{channel.emoji}</Text>
          <Text style={[styles.viewAllText, { color: channel.color }]}>Xem kênh →</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function TaiLieuScreen() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const [query, setQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('Tất cả'); // for YouTube tab

  const tabAnim = useRef(new Animated.Value(0)).current;

  const handleTabChange = (i) => {
    setActiveTab(i);
    setQuery('');
    Animated.timing(tabAnim, { toValue: i, duration: 200, useNativeDriver: false }).start();
  };

  const tabIndicatorLeft = tabAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, W / 3, (W / 3) * 2],
  });

  // Filter data
  const docData = DOCS.filter(r =>
    r.title.toLowerCase().includes(query.toLowerCase()) ||
    r.desc.toLowerCase().includes(query.toLowerCase())
  );
  const ytData = YOUTUBE_CHANNELS.filter(c => {
    const matchQuery = c.name.toLowerCase().includes(query.toLowerCase()) || c.desc.toLowerCase().includes(query.toLowerCase());
    const matchLevel = levelFilter === 'Tất cả' || c.level === levelFilter;
    return matchQuery && matchLevel;
  });
  const toolData = TOOLS.filter(r =>
    r.title.toLowerCase().includes(query.toLowerCase()) ||
    r.desc.toLowerCase().includes(query.toLowerCase())
  );

  const currentData = [docData, ytData, toolData][activeTab];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📖 {t('Tài Liệu Học Tập', 'Learning Resources')}</Text>
        <Text style={styles.headerSub}>{t('Tổng hợp tài liệu & kênh học chất lượng cao', 'Curated resources & learning channels')}</Text>

        {/* Search */}
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder={t('Tìm kiếm...', 'Search...')}
          placeholderTextColor={Colors.textDim}
        />
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab}
            style={styles.tabItem}
            onPress={() => handleTabChange(i)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
        <Animated.View style={[styles.tabIndicator, { left: tabIndicatorLeft }]} />
      </View>

      {/* YouTube level filter */}
      {activeTab === 1 && (
        <View style={styles.levelFilterRow}>
          {['Tất cả', 'THCS', 'THPT'].map(lv => (
            <TouchableOpacity
              key={lv}
              style={[styles.levelChip, levelFilter === lv && styles.levelChipActive]}
              onPress={() => setLevelFilter(lv)}
            >
              <Text style={[styles.levelChipText, levelFilter === lv && styles.levelChipTextActive]}>{lv}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 1
          ? ytData.map((ch, i) => <ChannelCard key={i} channel={ch} />)
          : currentData.map((r, i) => <ResourceCard key={i} item={r} />)
        }
        {currentData.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>🔍 {t('Không tìm thấy kết quả', 'No results found')}</Text>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
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
  headerTitle: { fontFamily: FontFamily.black, fontSize: FontSize.xl, color: Colors.text, marginBottom: 4 },
  headerSub: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.md },
  searchInput: {
    backgroundColor: Colors.bgGlass, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: Radius.full, paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
    color: Colors.text, fontFamily: FontFamily.regular, fontSize: FontSize.sm,
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row', backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    position: 'relative',
  },
  tabItem: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center' },
  tabText: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.textMuted },
  tabTextActive: { color: Colors.cyan },
  tabIndicator: {
    position: 'absolute', bottom: 0, width: W / 3, height: 2,
    backgroundColor: Colors.cyan, borderRadius: 2,
  },

  // Level filter (YouTube tab)
  levelFilterRow: {
    flexDirection: 'row', gap: Spacing.sm,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm,
    backgroundColor: Colors.bgSurface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  levelChip: {
    paddingHorizontal: Spacing.base, paddingVertical: 4,
    borderRadius: Radius.full, backgroundColor: Colors.bgGlass,
    borderWidth: 1, borderColor: Colors.border,
  },
  levelChipActive: { backgroundColor: Colors.cyan + '25', borderColor: Colors.cyan },
  levelChipText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.textMuted },
  levelChipTextActive: { color: Colors.cyan },

  content: { padding: Spacing.xl, gap: Spacing.md },

  // Resource card
  card: {
    flexDirection: 'row', backgroundColor: Colors.bgSurface,
    borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardLeft: { width: 56, justifyContent: 'center', alignItems: 'center' },
  cardEmoji: { fontSize: 24 },
  cardBody: { flex: 1, padding: Spacing.base },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, gap: Spacing.sm },
  cardTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.text, flex: 1 },
  tagChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1 },
  tagText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs },
  cardDesc: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: 4, lineHeight: 18 },
  cardUrl: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textDim },

  // YouTube channel card
  channelCard: {
    backgroundColor: Colors.bgSurface, borderRadius: Radius.xl,
    borderWidth: 1, padding: Spacing.base, marginBottom: 4,
  },
  channelHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  channelAvatar: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  channelAvatarEmoji: { fontSize: 20 },
  channelName: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.text },
  channelHandle: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textDim },
  levelBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: Radius.full, borderWidth: 1,
  },
  levelBadgeText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs },
  channelDesc: {
    fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted,
    marginBottom: Spacing.md, lineHeight: 18,
  },
  videosScroll: { marginHorizontal: -Spacing.xs },
  videoCard: {
    width: 160, marginRight: Spacing.sm,
    backgroundColor: Colors.bgGlass, borderRadius: Radius.lg,
    overflow: 'hidden', borderWidth: 1, borderColor: Colors.border,
  },
  thumbWrapper: { width: '100%', height: 90, position: 'relative' },
  thumb: { width: '100%', height: '100%' },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center', alignItems: 'center',
  },
  playIcon: { color: '#fff', fontSize: 20 },
  videoTitle: {
    fontFamily: FontFamily.semiBold, fontSize: FontSize.xs,
    color: Colors.textMuted, padding: Spacing.xs, lineHeight: 15,
  },
  viewAllCard: {
    width: 100, justifyContent: 'center', alignItems: 'center', gap: 8, minHeight: 120,
  },
  viewAllEmoji: { fontSize: 28 },
  viewAllText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs },

  emptyBox: { flex: 1, alignItems: 'center', paddingTop: Spacing['2xl'] },
  emptyText: { fontFamily: FontFamily.regular, fontSize: FontSize.base, color: Colors.textDim },
});
