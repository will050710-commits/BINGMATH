import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { updateProfile } from '../../api/auth';

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
    setLoading(true);
    try {
      await updateProfile(form);
      await refreshProfile();
      Alert.alert(t('Thành công', 'Success'), t('Hồ sơ đã được cập nhật!', 'Profile updated!'));
      navigation.goBack();
    } catch {
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
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← {t('Quay lại', 'Back')}</Text>
          </TouchableOpacity>

          <Text style={styles.pageTitle}>✏️ {t('Chỉnh sửa hồ sơ', 'Edit Profile')}</Text>

          <View style={styles.card}>
            <Text style={styles.label}>{t('Tên hiển thị', 'Display Name')}</Text>
            <TextInput style={styles.input} value={form.username} onChangeText={set('username')}
              placeholder={t('Họ tên của bạn', 'Your full name')} placeholderTextColor={Colors.textDim} />

            <Text style={styles.label}>{t('Trường học', 'School')}</Text>
            <TextInput style={styles.input} value={form.school} onChangeText={set('school')}
              placeholder={t('Tên trường', 'School name')} placeholderTextColor={Colors.textDim} />

            <Text style={styles.label}>{t('Lớp', 'Grade')}</Text>
            <TextInput style={styles.input} value={form.grade} onChangeText={set('grade')}
              placeholder="Grade 10" placeholderTextColor={Colors.textDim} />

            <Text style={styles.label}>{t('Số điện thoại', 'Phone')}</Text>
            <TextInput style={styles.input} value={form.phone} onChangeText={set('phone')}
              placeholder="+84 ..." placeholderTextColor={Colors.textDim} keyboardType="phone-pad" />

            <TouchableOpacity
              style={[styles.saveBtn, loading && { opacity: 0.6 }]}
              onPress={handleSave} disabled={loading} activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.saveBtnText}>{t('Lưu thay đổi', 'Save Changes')}</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.xl },
  backBtn: { marginBottom: Spacing.base },
  backText: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.textCyan },
  pageTitle: { fontFamily: FontFamily.black, fontSize: FontSize.xl, color: Colors.text, marginBottom: Spacing.xl },
  card: { backgroundColor: Colors.bgSurface, borderRadius: Radius.xl, padding: Spacing.xl, borderWidth: 1, borderColor: Colors.border },
  label: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.xs },
  input: {
    backgroundColor: Colors.bgGlass, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: Radius.md, paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    color: Colors.text, fontFamily: FontFamily.regular, fontSize: FontSize.base, marginBottom: Spacing.md,
  },
  saveBtn: {
    backgroundColor: Colors.accent, borderRadius: Radius.md, paddingVertical: Spacing.base,
    alignItems: 'center', marginTop: Spacing.sm,
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 6,
  },
  saveBtnText: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: '#fff' },
});
