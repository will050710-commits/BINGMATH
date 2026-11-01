/**
 * SettingsScreen — Chỉnh sửa hồ sơ
 *
 * Upgrades:
 *  - Username validation guard before updateProfile call.
 *  - Tactile PressableScale on back button and save button.
 *  - Haptic feedback on validation errors and successful update.
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput,
  StyleSheet, SafeAreaView, ScrollView,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { haptic } from '../../theme/effects';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { updateProfile } from '../../api/auth';
import PressableScale from '../../components/ui/PressableScale';

export default function SettingsScreen({ navigation }) {
  const { profile, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    username: profile?.username || '',
    phone: profile?.phone || '',
    school: profile?.school || '',
    grade: profile?.grade || '',
  });
  const [loading, setLoading] = useState(false);

  const set = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));

  async function handleSave() {
    if (!form.username.trim()) {
      haptic.warn();
      Alert.alert(t('Lỗi', 'Error'), t('Tên hiển thị không được để trống.', 'Display name is required.'));
      return;
    }
    setLoading(true);
    try {
      await updateProfile(form);
      await refreshProfile();
      haptic.success();
      Alert.alert(t('Thành công', 'Success'), t('Hồ sơ đã được cập nhật!', 'Profile updated!'));
      navigation.goBack();
    } catch {
      haptic.warn();
      Alert.alert(t('Lỗi', 'Error'), t('Không thể cập nhật hồ sơ.', 'Could not update profile.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Back */}
          <PressableScale style={styles.backBtn} onPress={() => navigation.goBack()} haptics={null}>
            <Text style={styles.backText}>← {t('Quay lại', 'Back')}</Text>
          </PressableScale>

          <Text style={styles.pageTitle}>✏️ {t('Chỉnh sửa hồ sơ', 'Edit Profile')}</Text>

          <View style={styles.card}>
            <Text style={styles.label}>{t('Tên hiển thị', 'Display Name')}</Text>
            <TextInput
              style={styles.input}
              value={form.username}
              onChangeText={set('username')}
              placeholder={t('Họ tên của bạn', 'Your full name')}
              placeholderTextColor={Colors.textDim}
            />

            <Text style={styles.label}>{t('Trường học', 'School')}</Text>
            <TextInput
              style={styles.input}
              value={form.school}
              onChangeText={set('school')}
              placeholder={t('Tên trường', 'School name')}
              placeholderTextColor={Colors.textDim}
            />

            <Text style={styles.label}>{t('Lớp', 'Grade')}</Text>
            <TextInput
              style={styles.input}
              value={form.grade}
              onChangeText={set('grade')}
              placeholder="Grade 10"
              placeholderTextColor={Colors.textDim}
            />

            <Text style={styles.label}>{t('Số điện thoại', 'Phone')}</Text>
            <TextInput
              style={styles.input}
              value={form.phone}
              onChangeText={set('phone')}
              placeholder="+84 ..."
              placeholderTextColor={Colors.textDim}
              keyboardType="phone-pad"
            />

            <PressableScale
              style={[styles.saveBtn, loading && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={loading}
              haptics={null}
              scaleTo={0.97}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>{t('Lưu thay đổi', 'Save Changes')}</Text>
              )}
            </PressableScale>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.xl },
  backBtn: { marginBottom: Spacing.md, alignSelf: 'flex-start' },
  backText: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.textCyan },
  pageTitle: { fontFamily: FontFamily.black, fontSize: FontSize.xl, color: Colors.text, marginBottom: Spacing.xl },
  card: { backgroundColor: Colors.bgSurface, borderRadius: Radius.xl, padding: Spacing.xl, borderWidth: 1, borderColor: Colors.border },
  label: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.xs },
  input: {
    backgroundColor: Colors.bgGlass, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.base, paddingVertical: 12, fontFamily: FontFamily.regular, fontSize: FontSize.base,
    color: Colors.text, marginBottom: Spacing.md,
  },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 14,
    alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm,
  },
  saveBtnText: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: '#fff' },
});
