import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const GUIDE_STEPS = [
  {
    badge: '🤖 TÍNH NĂNG MỚI: BINGMCB GIẤU VIỀN',
    icon: '🎓',
    title: 'Trợ Lý AI Tự Động Nép Sát Mép Màn Hình',
    subtitle: 'Không còn che khuất bài học — kéo thả tự do tới bất kỳ vị trí nào bạn muốn!',
    color: '#38bdf8',
    bullets: [
      'Khi chưa dùng, nút AI tự động thu gọn thành một thẻ nhỏ sát mép phải hoặc mép trái.',
      'Nhấn 1 lần để trượt nút ra ngoài, nhấn lần 2 để mở cửa sổ chat gia sư AI BingMCB.',
      'Giữ và kéo tới bất kỳ đâu — thả tay ra nút sẽ tự động hút về mép gần nhất!',
    ],
  },
  {
    badge: '💧 CÔNG NGHỆ MỚI: APPLE LIQUID GLASS',
    icon: '✨',
    title: 'Thanh Điều Hướng Kính Lỏng Đa Chiều',
    subtitle: 'Lấy cảm hứng từ Apple visionOS với hiệu ứng khúc xạ ánh sáng mượt mà.',
    color: '#c084fc',
    bullets: [
      'Thanh Tab Bar nổi lơ lửng với viền phản quang (Specular Rim) và nền kính trong suốt.',
      'Hỗ trợ vuốt ngang mượt mà qua lại giữa 5 chuyên mục.',
      'Tùy chỉnh độ trong suốt (Opacity 25% – 100%) ngay trong Cài đặt nhanh.',
    ],
  },
  {
    badge: '⚙️ TRUNG TÂM ĐIỀU KHIỂN: QUICK SETTINGS',
    icon: '🎛️',
    title: 'Đổi Giao Diện & Ngôn Ngữ Chỉ Với 1 Chạm',
    subtitle: 'Nút Cài Đặt Nhanh (⚙️) luôn sẵn sàng ở góc trên màn hình chính và trang Hồ sơ.',
    color: '#34d399',
    bullets: [
      'Chuyển đổi tức thì giữa Tiếng Việt (🇻🇳) và Tiếng Anh (🇬🇧).',
      '3 chế độ giao diện: Sáng (Light), Tối (Dark) và Kính Lỏng (Liquid Glass).',
      'Xem lại Hướng dẫn này bất cứ lúc nào từ Cài đặt nhanh!',
    ],
  },
];

/**
 * InterfaceGuideModal — V1.0 Official 3-step feature tour
 * (Hermes bundle lines 262123–263168)
 */
export default function InterfaceGuideModal() {
  const { interfaceGuideVisible, openInterfaceGuide, closeInterfaceGuide } = useTheme();
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('bingmath_trigger_v1_guide'),
      AsyncStorage.getItem('bingmath_v1_guide_seen'),
    ])
      .then(([trigger, seen]) => {
        if (trigger === 'true' && seen !== 'true') {
          openInterfaceGuide();
        }
      })
      .catch(() => {});
  }, [openInterfaceGuide]);

  const step = GUIDE_STEPS[stepIdx] || GUIDE_STEPS[0];
  const isLast = stepIdx === GUIDE_STEPS.length - 1;

  const handleFinish = () => {
    AsyncStorage.setItem('bingmath_v1_guide_seen', 'true').catch(() => {});
    AsyncStorage.removeItem('bingmath_trigger_v1_guide').catch(() => {});
    setStepIdx(0);
    closeInterfaceGuide();
  };

  return (
    <Modal
      visible={interfaceGuideVisible}
      transparent
      animationType="fade"
      onRequestClose={handleFinish}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { borderColor: step.color }]}>
          <View style={styles.topRow}>
            <Text style={[styles.badge, { color: step.color, borderColor: step.color }]}>
              {step.badge}
            </Text>
            <TouchableOpacity onPress={handleFinish}>
              <Text style={styles.skipText}>Bỏ qua ✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.icon}>{step.icon}</Text>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.subtitle}>{step.subtitle}</Text>

          <View style={styles.bulletBox}>
            {step.bullets.map((b, i) => (
              <Text key={i} style={styles.bulletText}>
                ✦ {b}
              </Text>
            ))}
          </View>

          <View style={styles.footer}>
            {stepIdx > 0 ? (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => setStepIdx((p) => p - 1)}
              >
                <Text style={styles.backBtnText}>← Trước</Text>
              </TouchableOpacity>
            ) : (
              <View />
            )}

            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: step.color }]}
              onPress={() => (isLast ? handleFinish() : setStepIdx((p) => p + 1))}
            >
              <Text style={styles.nextBtnText}>
                {isLast ? 'Bắt đầu ngay 🚀' : 'Tiếp theo →'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#071426',
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    fontSize: 10,
    fontWeight: '800',
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  skipText: { color: '#94a3b8', fontSize: 12, fontWeight: '700' },
  icon: { fontSize: 36, textAlign: 'center', marginBottom: 8 },
  title: { color: '#f8fafc', fontSize: 17, fontWeight: '800', textAlign: 'center' },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 12.5,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  bulletBox: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 12,
    gap: 8,
    marginBottom: 16,
  },
  bulletText: { color: '#e2e8f0', fontSize: 12.5, lineHeight: 18 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
  },
  backBtnText: { color: '#cbd5e1', fontWeight: '700', fontSize: 13 },
  nextBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12 },
  nextBtnText: { color: '#020c1b', fontWeight: '800', fontSize: 13 },
});
