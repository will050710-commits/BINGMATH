import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const OPACITY_PRESETS = [
  { labelVI: '25% Mờ', labelEN: '25% Subtle', value: 0.25 },
  { labelVI: '50% Vừa', labelEN: '50% Medium', value: 0.5 },
  { labelVI: '75% Chuẩn', labelEN: '75% Default', value: 0.75 },
  { labelVI: '100% Đậm', labelEN: '100% Bold', value: 1.0 },
];

/**
 * QuickSettingsModal — V1.0 Official 1-tap control hub
 * (Hermes bundle lines 260454–261482)
 */
export default function QuickSettingsModal() {
  const {
    themeMode,
    colors,
    liquidGlassOpacity,
    setTheme,
    setLiquidGlassOpacity,
    quickSettingsVisible,
    closeQuickSettings,
    openInterfaceGuide,
  } = useTheme();
  const { lang, setLang, t } = useLanguage();

  return (
    <Modal
      visible={quickSettingsVisible}
      transparent
      animationType="fade"
      onRequestClose={closeQuickSettings}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={closeQuickSettings}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.card,
            {
              backgroundColor: colors.bgElevated,
              borderColor: colors.borderAccent,
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              ⚙️ {t('Cài Đặt Nhanh', 'Quick Settings')}
            </Text>
            <TouchableOpacity onPress={closeQuickSettings}>
              <Text style={[styles.closeBtn, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            🌐 {t('Ngôn ngữ / Language', 'Language')}
          </Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.optionBtn,
                { borderColor: lang === 'vi' ? '#f43f5e' : colors.border },
              ]}
              onPress={() => setLang('vi')}
            >
              <Text style={{ color: colors.text, fontWeight: '700' }}>🇻🇳 Tiếng Việt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionBtn,
                { borderColor: lang === 'en' ? colors.primary : colors.border },
              ]}
              onPress={() => setLang('en')}
            >
              <Text style={{ color: colors.text, fontWeight: '700' }}>🇬🇧 English</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            🎨 {t('Giao diện / Theme', 'Theme Mode')}
          </Text>
          <View style={styles.row}>
            {[
              { mode: 'light', label: t('☀️ Sáng', '☀️ Light') },
              { mode: 'dark', label: t('🌙 Tối', '🌙 Dark') },
              { mode: 'liquidGlass', label: t('💧 Kính Lỏng', '💧 Liquid') },
            ].map((item) => (
              <TouchableOpacity
                key={item.mode}
                style={[
                  styles.optionBtn,
                  {
                    borderColor:
                      themeMode === item.mode ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setTheme(item.mode)}
              >
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 12 }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {themeMode === 'liquidGlass' && (
            <View style={styles.opacityBox}>
              <Text style={[styles.sectionLabel, { color: colors.primary }]}>
                💧 {t('Độ đậm Kính Lỏng', 'Liquid Glass Opacity')}:{' '}
                {Math.round(liquidGlassOpacity * 100)}%
              </Text>
              <View style={styles.row}>
                {OPACITY_PRESETS.map((p) => (
                  <TouchableOpacity
                    key={p.value}
                    style={[
                      styles.presetBtn,
                      {
                        borderColor:
                          Math.abs(liquidGlassOpacity - p.value) < 0.03
                            ? colors.primary
                            : colors.border,
                      },
                    ]}
                    onPress={() => setLiquidGlassOpacity(p.value)}
                  >
                    <Text style={{ color: colors.text, fontSize: 11, fontWeight: '700' }}>
                      {lang === 'vi' ? p.labelVI : p.labelEN}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.guideBtn, { borderColor: colors.accent }]}
            onPress={() => {
              closeQuickSettings();
              openInterfaceGuide();
            }}
          >
            <Text style={{ color: colors.text, fontWeight: '800', fontSize: 13 }}>
              ✨ {t('Xem Hướng Dẫn Giao Diện V1.0', 'View V1.0 Interface Tour')}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: { fontSize: 17, fontWeight: '800' },
  closeBtn: { fontSize: 18, fontWeight: '700', padding: 4 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', gap: 8 },
  optionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  opacityBox: { marginTop: 6 },
  presetBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  guideBtn: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(168,85,247,0.16)',
  },
});
